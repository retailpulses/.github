# AGENTS.md — Retailpulses Central Agent Guidance

**Purpose:** Default agent behavior rules for all Retailpulses repositories.
**Scope:** Applies when a repo does NOT have its own AGENTS.md or CLAUDE.md.
**Override:** Repos may add stricter rules in their own AGENTS.md. They should not loosen these.

## Organization Context

- **GitHub Org:** retailpulses
- **Owner:** Jim Yang
- **Business entity:** Retailpulses GK, Japan
- **Core business:** Cross-platform e-commerce operations (Mercari Shops, Rakuten Ichiba, Amazon Japan), e-commerce consulting, and internal software development for operational automation.
- **Tech stack direction:** Cloudflare Workers (current) → VPS (future target). See Section 2 for VPS inventory.

---

## 1. Read Local Guidance First

Before starting any task, check for and read:
1. Repo-level `AGENTS.md` or `CLAUDE.md`
2. Repo-level `README.md`
3. Repo-level `.github/` directory
4. Repo-level `docs/` directory

If the repo has its own agent guidance, follow it. These central rules fill gaps.

---

## 2. VPS Inventory and Runtime Target

We already have VPS infrastructure and it should be treated as the future portability target, not the local MacBook.

Available VPS options:

1. **ConoHa VPS Japan**
   - Use when Japan fixed IP / domestic egress IP is required.
   - Suitable for marketplace relay services and APIs that restrict access by Japanese IP.

2. **Tencent Cloud VPS Singapore**
   - IPv4: 43.163.84.239
   - Specs: 2 vCPU, 4GB RAM, 60GB SSD, 1536GB/month traffic, 30Mbps peak bandwidth
   - Use for workloads that do not require Japanese fixed IP:
     - background jobs
     - internal admin services
     - staging apps
     - agent runners
     - batch processing
     - non-marketplace API workers
     - monitoring / lightweight dashboards

Important:
- Local MacBook is only for development and testing.
- Production or scheduled workloads should run on VPS, not on the MacBook.
- Do not put Japan-IP-sensitive relay workloads on Tencent Singapore VPS.

---

## 3. Production Safety

The following are production-sensitive operations and must not be executed without explicit user confirmation:

- Marketplace API mutations
- Inventory updates
- Price updates
- Order, shipment, cancellation, or customer-message changes
- GitHub Actions deployments
- Cloudflare Worker deployments
- VPS service changes
- Database schema or bulk data updates
- Credential creation or rotation

Before any production mutation, report:
1. Target system
2. Exact action
3. Expected effect
4. Risk level
5. Rollback or recovery path

---

## 4. Deployment Safety

### 4.1 Do Not Deploy from PR

- PR workflows must only validate (lint, test, type check, compile check).
- Never add a deploy job to a `pull_request`-triggered workflow.
- A green PR check means "code is ready to merge," not "code is deployed."

### 4.2 Production Deploy Requires Smoke Test

- Every deploy workflow must include an automated smoke test after deploy.
- Smoke test must retry (services need warm-up time).
- A deploy without a smoke test is incomplete.

### 4.3 Concurrency

- Every deploy workflow must have `concurrency` configured.
- `cancel-in-progress: false` — never cancel a deploy mid-flight.

---

## 5. Credential Safety

### 5.1 Credential Creation

- Agents must not create real credentials, API keys, or tokens.
- Agents must not rotate credentials without explicit user request.
- Agents may:
  - Add placeholder names to `.env.example`
  - Document required secret names in PR descriptions or deployment docs
  - Add GitHub Actions secret references to existing or expected secrets
- If a task requires actual credential creation, rotation, or secret value access,
  report it as a blocker with:
  - Credential name
  - Purpose
  - Expected storage location
  - Whether user action is needed

### 5.2 Do Not Commit .env or Credentials

- Never commit `.env`, `.env.local`, `*.env`, or any file containing secrets.
- Check `.gitignore` includes these patterns.
- If `.env.example` is missing, suggest creating it (with placeholder values only).

### 5.3 master_credentials.md Usage

- `master_credentials.md` is a local credential lookup index, not a secret store.
- It records credential names, purposes, storage locations, and retrieval methods.
- It must never contain full secret values.
- It must never be committed to git.
- Use it only if explicitly available in the repo or local environment.

### 5.4 Never Expose Secrets in Output

- Mask secrets in logs and summaries (e.g., `sk-****abcd`).
- Never print full API keys, tokens, or passwords.
- Redact secrets from terminal output, chat messages, and final summaries.

---

## 6. External Agent CLI Policy

### 6.1 No Inference

Agents must not choose an external agent CLI by guessing. The CLI must be explicitly requested.

### 6.2 Approved Wrappers

When calling external agents, use only the approved wrapper scripts:

| Agent | Command |
|-------|---------|
| Claude Code | `./agents/run-claude-code.sh "<task>"` |
| OpenCode | `./agents/run-opencode.sh "<task>"` |
| Codex | `./agents/run-codex.sh "<task>"` |

### 6.3 Rules

1. Do not substitute one agent CLI for another.
2. If the requested wrapper is missing, stop and report the exact blocker.
3. Do not fall back to another CLI.
4. No external agent CLI is the default.
5. The calling agent must summarize the delegated task and expected output before invoking.

---

## 7. Cloudflare Dependency Awareness

### 7.1 Cloudflare Is Not the Default

- Cloudflare is an implementation option, not the product architecture.
- New services should consider portable alternatives before choosing Cloudflare-specific runtimes.

### 7.2 When Using Cloudflare

- Isolate Cloudflare-specific code behind adapters where practical.
- Document the dependency in the PR description.
- Note the migration path if Cloudflare becomes unavailable.

### 7.3 Review Before Adding

Before adding a new Cloudflare dependency (KV, D1, R2, Worker Cron, Pages, Tunnel):
1. Is there a portable alternative?
2. Can it be isolated behind an adapter?
3. What is the migration cost?
4. Is the value worth the coupling?

---

## 8. Repository Discipline

Before making changes, always identify the working context:
- Current repository
- Current branch
- Current worktree path
- Git status
- Whether the task is investigation, planning, implementation, or deployment

Rules:
1. Do not modify files before checking git status.
2. Do not mix unrelated tasks in one branch.
3. Do not commit without a clear summary of changed files and purpose.
4. Do not delete worktrees unless the PR is created, pushed, or the user explicitly approves cleanup.
5. If work is blocked, leave a clear closeout note with current state, files changed, tests run, remaining blockers, and recommended next action.

---

## 9. Final Summary Requirements

Every agent task must produce a final summary including:

```markdown
## Task Summary
- **Files changed:**
- **Validation run:**
- **Deployment impact:**
- **VPS dependency impact:**
- **Cloudflare dependency impact:**
- **Remaining risks:**
- **Credential check:**
  - Required credentials:
  - Found via:
  - Missing credentials:
  - master_credentials.md checked: Yes/No
  - Secrets exposed in output: No
```

---

## 10. Repo-Specific Override

Individual repos may add to these rules in their own `AGENTS.md`:

```markdown
# Repo-Level AGENTS.md

## Extends
retailpulses/.github AGENTS.md

## Repo-Specific Rules
- [additional rule 1]
- [additional rule 2]

## Repo-Specific Context
- [what agents need to know about this repo specifically]
```

Repos should not loosen the central rules. If a rule doesn't apply, document why.

---

## 11. Related Documents

- [Cloudflare Dependency Policy](docs/cloudflare-dependency-policy.md)
- [Runtime Strategy](docs/runtime-strategy.md)
- [Deployment Patterns](docs/deployment-patterns.md)
- [Pull Request Template](PULL_REQUEST_TEMPLATE.md)

---

*Central guidance last updated: 2026-06-09 (sections 2–3, 8 added). Repos should review against their local AGENTS.md regularly.*
