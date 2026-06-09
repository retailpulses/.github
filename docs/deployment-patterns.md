# Deployment Patterns

**Status:** Reference
**Version:** 1.0.0
**Last updated:** 2026-06-09

---

## 1. Core Rules

### 1.1 PR Must Not Deploy

Pull request workflows (`pull_request` trigger) must only validate. They must not deploy, publish, or mutate external state.

```
PR opened → lint → test → type check → DONE
                                  NOT → deploy
```

### 1.2 Deploy Happens on Push to Main or workflow_dispatch

```
workflow_dispatch → validate → deploy → smoke test → DONE
Push to main     → validate → deploy → smoke test → DONE (auto-deploy repos only)
```

**Recommended default per service type:**

| Service Type | Trigger | Rationale |
|-------------|---------|-----------|
| **Customer-facing / order / ticket systems** | `workflow_dispatch` (manual) | Production risk is high. Human in the loop. |
| **Internal tools, dashboards** | Push to `main` (auto) | Acceptable blast radius for auto-deploy. |
| **Scheduled / cron jobs** | Push to `main` or manual | Depends on sensitivity. |
| **Static frontends** | Push to `main` (auto) | Low risk, easy rollback. |

For production-sensitive services, prefer manual `workflow_dispatch` with environment selector. For small internal tools with low blast radius, push-to-main auto-deploy is acceptable.

### 1.3 Production Deploy Requires Smoke Test

Every production deploy must include an automated smoke test that verifies the service is alive and responding. Smoke tests should:

- Run after deploy, not before
- Retry with backoff (services may need warm-up)
- Have a generous timeout
- Fail loudly (red X on the workflow run)
- Accept HTTP 2xx as success, 401/403 as "alive behind auth gate"

### 1.4 Concurrency Prevents Overlapping Deploys

Every deploy workflow must have concurrency configured:

```yaml
concurrency:
  group: deploy-<service>-${{ inputs.environment }}
  cancel-in-progress: false  # Never cancel — leaves state unknown
```

### 1.5 Repo-Specific Values Passed as Inputs

Reusable workflows receive repo-specific configuration as inputs, never hardcoded:

```yaml
# Good — inputs
workflow_call:
  inputs:
    service_name:
      required: true
      type: string
    health_url:
      required: true
      type: string

# Bad — hardcoded in reusable workflow
health_url: "https://hardcoded-service.workers.dev/health"
```

---

## 2. Workflow Families

### 2.1 PR Check (Python)

**File:** `reusable-pr-check-python.yml` (future)

```yaml
# Triggers on: pull_request to main
# What it does:
#   1. Checkout
#   2. Set up Python
#   3. Install dependencies
#   4. Compile check (python -m compileall .)
#   5. Lint (ruff check)
#   6. Run tests (pytest)
# What it does NOT do:
#   - Deploy
#   - Access secrets
#   - Mutate anything
```

### 2.2 PR Check (Node)

**File:** `reusable-pr-check-node.yml` (future)

```yaml
# Triggers on: pull_request to main
# What it does:
#   1. Checkout
#   2. Set up Node
#   3. npm ci
#   4. Type check (tsc --noEmit)
#   5. Lint (eslint)
#   6. Run tests (npm test)
# What it does NOT do:
#   - Deploy
#   - Access secrets
#   - Mutate anything
```

### 2.3 Deploy Cloudflare Worker

**File:** `reusable-deploy-cloudflare-worker.yml` (future)

```yaml
# Triggers on: workflow_dispatch (push to main for dev auto-deploy optional)
# Inputs:
#   - environment (dev | production)
#   - working_directory (path to worker package)
#   - health_url (for smoke test)
#   - health_endpoint (/health or /)
#   - node_version (default: 20)
# Expected secrets (repo-level):
#   - CLOUDFLARE_API_TOKEN
# What it does:
#   1. Gate: validate inputs, production branch-guard
#   2. Deploy: npm ci → wrangler deploy --env $environment
#   3. Smoke: curl health_url, retry 5x
#   4. Summary
```

### 2.4 Deploy VPS Service

**File:** `reusable-deploy-vps-service.yml` (future)

```yaml
# Triggers on: workflow_dispatch
# Inputs:
#   - environment (dev | production)
#   - repo_path (absolute path on VPS)
#   - deploy_subpath (relative path within repo)
#   - systemd_unit
#   - health_port
#   - health_path
#   - node_version (default: 22)
#   - ref (git ref to deploy)
# Expected secrets (repo-level):
#   - VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT
# What it does:
#   1. Gate: validate inputs, production branch-guard
#   2. Preflight: SSH → confirm repo exists, clean tree
#   3. Deploy: SSH → git checkout → npm ci → systemctl restart
#   4. Smoke: SSH → curl localhost health check
#   5. Summary
```

### 2.5 Cloudflare Dependency Review

**File:** `reusable-cloudflare-dependency-review.yml` (future)

```yaml
# Triggers on: pull_request to main, paths matching CF-related files
# What it does:
#   1. Detect new Cloudflare dependencies (wrangler.toml changes,
#      new KV/D1/R2 bindings, new Worker Cron config)
#   2. Check PR description for Cloudflare Dependency Impact section
#   3. Post advisory comment (not blocking)
#   4. Fails only if CF dependency added with NO justification
```

---

## 3. Workflow Template — PR Check (No Deploy)

This is the pattern every repo should use for PR validation:

```yaml
name: PR Check

on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... language-specific setup, lint, test, type check ...
      # DO NOT add deploy steps here
      # DO NOT add secret-using steps here (unless read-only and safe)
```

## 4. Workflow Template — Deploy

This is the pattern for deployment, separate from PR checks:

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Target environment"
        required: true
        type: choice
        options: [dev, production]

concurrency:
  group: deploy-${{ inputs.environment }}
  cancel-in-progress: false

jobs:
  gate:
    runs-on: ubuntu-latest
    outputs:
      proceed: ${{ steps.check.outputs.proceed }}
    steps:
      - name: Production branch guard
        if: inputs.environment == 'production'
        run: |
          if [ "$GITHUB_REF" != "refs/heads/main" ]; then
            echo "Production deploy only from main"
            exit 1
          fi

  deploy:
    needs: gate
    runs-on: ubuntu-latest
    steps:
      # ... language-specific deploy steps ...

  smoke:
    needs: deploy
    runs-on: ubuntu-latest
    if: always() && needs.deploy.result != 'skipped'
    steps:
      - name: Health check
        run: |
          for i in 1 2 3 4 5; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
            if [ "$STATUS" = "200" ]; then
              echo "✅ Healthy"
              exit 0
            fi
            sleep 5
          done
          echo "❌ Smoke test failed"
          exit 1

  summary:
    needs: [gate, deploy, smoke]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Report
        run: |
          echo "Environment: ${{ inputs.environment }}"
          echo "Deploy: ${{ needs.deploy.result }}"
          echo "Smoke: ${{ needs.smoke.result }}"
```

---

## 4. Current State Reference

### 4.1 workers repo — `deploy-workers.yml`

**Assessment:** ✅ Gold standard for Cloudflare Worker deploys.

- Trigger: `workflow_dispatch` only ✅
- Concurrency: `deploy-workers-${{ inputs.environment }}`, `cancel-in-progress: false` ✅
- Gate: production branch-guard, package list resolver ✅
- Deploy: serial per worker, `wrangler deploy` ✅
- Smoke: parallel health checks, retry 5x with backoff, access-gate aware ✅
- Summary: always runs, reports all results ✅

### 4.2 workers repo — `deploy-relay.yml`

**Assessment:** ⚠️ Deprecated. Empty relay list. Retained for rollback reference.

### 4.3 mercariops repo — `rakuten-main-image-gen.yml`

**Assessment:** ✅ Clean PR check. No deploy.

- Trigger: `push` + `pull_request` ✅
- Jobs: test, lint, compile-check only ✅
- No deploy job ✅
- Coverage upload on push only ✅

---

## 5. What Goes Where

| File | Central (.github) | Repo-Specific |
|------|-------------------|---------------|
| PR check workflow | Template/strategy doc | Actual `.yml` with repo-specific paths |
| Deploy workflow | Template/strategy doc | Actual `.yml` with repo-specific targets |
| wrangler.toml | Strategy doc only | Actual config per worker |
| Health check URLs | Strategy doc only | Actual URLs per service |
| Systemd unit names | Strategy doc only | Actual units per VPS service |
| Secrets | Never | GitHub Actions Secrets per repo |
| Environment vars | `.env.example` template | Actual env vars per repo |

---

## 6. Future Reusable Workflows

Do not create these prematurely. Wait until 2+ repos need the same pattern.

### Candidates (in priority order):

1. **`reusable-pr-check-python.yml`** — mercariops, rakutenops, amazonops, inquiry-automation all have Python
2. **`reusable-deploy-cloudflare-worker.yml`** — workers, CatalogSync, boutique-listing
3. **`reusable-pr-check-node.yml`** — workers, CatalogSync (if they add tests)
4. **`reusable-deploy-vps-service.yml`** — OrderMgmt, CatalogSync relay
5. **`reusable-cloudflare-dependency-review.yml`** — all repos with CF deps

### Trigger for extraction:

> "I'm about to copy-paste a workflow for the third time."

---

*Update this document when deployment patterns evolve or new workflow families are added.*
