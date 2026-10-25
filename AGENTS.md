# AGENTS.md — Retailpulses Central Agent Guidance

**Purpose:** Organization-level Agent guidance source for Retailpulses repositories.
**Loading:** GitHub does not automatically copy or inject this file into every repository or Agent. It applies when an Agent runtime or workspace explicitly loads this file; the runtime's supported instruction mechanism determines how repository-local `AGENTS.md` / `CLAUDE.md` files interact with it.
**Scope:** Use as the shared baseline when loaded and when the target repo has no more specific applicable guidance. A product repository may add context and stricter rules.
**Override:** Repos may add stricter rules in their own AGENTS.md. They should not loosen these.

## Organization Context

- **GitHub Org:** retailpulses
- **Owner:** Jim Yang
- **Business entity:** Retailpulses GK, Japan
- **Core business:** Cross-platform e-commerce operations (Mercari Shops, Rakuten Ichiba, Amazon Japan), e-commerce consulting, and internal software development for operational automation.
- **Runtime direction:** Runtime ownership and deployment state are recorded in `infrastructure/`; do not infer a platform from historical plans.

---

## 1. Read Local Guidance First

Before starting any task, check for and read:
1. Repo-level `AGENTS.md` or `CLAUDE.md`
2. Repo-level `README.md`
3. Repo-level `.github/` directory
4. Repo-level `docs/` directory

If the repo has its own agent guidance, follow it. These central rules fill gaps.

---

## 2. Runtime Inventory and Target Selection

The central inventory currently marks the VPS and Cloudflare runtime inventories as pending read-only verification. Historical provider names, IP addresses, specifications, or planned targets are not proof that an account, host, or service is active. Check the owning platform and its current inventory before selecting a deployment target. Keep Japan-IP-sensitive workloads on a verified Japan egress path; do not infer one from a provider or region name.

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

### 5.1 Credential Lookup, Creation, and Rotation

- Agents must not create real credentials, API keys, or tokens unless the accepted task calls for it.
- Agents must not rotate credentials unless the accepted task explicitly calls for it.
- Agents may:
  - Add placeholder names to `.env.example`
  - Document required secret names in PR descriptions or deployment docs
  - Add GitHub Actions secret references to existing or expected secrets
- For credential lookup, first use the existing Credential Registry and its documented access path. Access reasonably required to implement or verify the accepted task is authorized even when the design does not name the credential; do not ask again for that access.
- Pause only if the credential is absent, materially different targets/environments are possible, access would expand account/customer/action scope, or the required access path is unavailable or needs an unplanned security change. If the task calls for creating or rotating a credential, follow that scope without asking again; report missing inputs or material ambiguity:
  - Credential name
  - Purpose
  - Expected storage location
  - Whether user action is needed

### 5.2 Do Not Commit .env or Credentials

- Never commit `.env`, `.env.local`, `*.env`, or any file containing secrets.
- Check `.gitignore` includes these patterns.
- If `.env.example` is missing, suggest creating it (with placeholder values only).

### 5.3 Historical `master_credentials.md` Compatibility Index

- `master_credentials.md` is a historical local compatibility index, not the canonical registry or a secret store.
- The canonical documented lookup path is [Credential Access Guide](infrastructure/credentials/ACCESS_GUIDE.md), backed by the Mac mini's local PostgreSQL credential registry.
- Existing product workflows may still reference the file. Do not delete or migrate it until each consumer and replacement has been verified.
- If an authorized local copy is available, use it only as a compatibility pointer; never commit it or put full values in it.

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

## 7A. Development Agent Execution Environment

**Policy: Environment-aware execution (2026-10-25).** Codex Cloud is not the default or mandatory development environment; neither is local Codex CLI. Choose the environment that minimizes end-to-end time to a verified outcome, considering source checkout isolation, dependency/cache availability, data and runtime access, feedback-loop latency, and integration/production verification.

- Prefer **Codex Cloud** for self-contained implementation, refactoring, documentation, UI/API changes, and tests that can be reliably verified in an isolated cloud checkout.
- Prefer **local Codex CLI** on an authorized host for tasks requiring local SQLite/Supabase, Mac mini services, authenticated runtime/browser profiles, actual-data replay, or immediate deployment and smoke-test feedback.
- Cloud work may hand off runtime verification to an authorized local agent, but record the handoff explicitly. Do not call a task complete merely because a cloud PR passes CI.
- Local work should use an isolated task branch/worktree when practical; avoid shared dirty workspaces. Cloud isolation does not excuse unmanaged branches or duplicate canonical checkouts.
- Use the same GitHub Issue/PR, design, and acceptance criteria regardless of execution environment. Do not create separate cloud/local governance or schedulers.
- Treat remote connectivity and credentials as **verified capabilities**, not assumptions; never create tunnels, copy secrets, or expand production access merely to satisfy an environment preference.
- For repeated task types, compare end-to-end delivery and verified outcomes before changing the preferred environment. Do not assert an unmeasured model-speed advantage.

This policy concerns **development agent execution**, not the hosting location of production services. See [Worktree Development Flow](docs/worktree-development-flow.md).

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
  - Historical master_credentials.md checked: Yes/No (only if an authorized copy is available)
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
