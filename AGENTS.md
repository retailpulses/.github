# AGENTS.md — Retailpulses Central Agent Guidance

**Purpose:** Default agent behavior rules for all Retailpulses repositories.
**Scope:** Applies when a repo does NOT have its own AGENTS.md or CLAUDE.md.
**Override:** Repos may add stricter rules in their own AGENTS.md. They should not loosen these.

---

## 1. Read Local Guidance First

Before starting any task, check for and read:
1. Repo-level `AGENTS.md` or `CLAUDE.md`
2. Repo-level `README.md`
3. Repo-level `.github/` directory
4. Repo-level `docs/` directory

If the repo has its own agent guidance, follow it. These central rules fill gaps.

---

## 2. Deployment Safety

### 2.1 Do Not Deploy from PR

- PR workflows must only validate (lint, test, type check, compile check).
- Never add a deploy job to a `pull_request`-triggered workflow.
- A green PR check means "code is ready to merge," not "code is deployed."

### 2.2 Production Deploy Requires Smoke Test

- Every deploy workflow must include an automated smoke test after deploy.
- Smoke test must retry (services need warm-up time).
- A deploy without a smoke test is incomplete.

### 2.3 Concurrency

- Every deploy workflow must have `concurrency` configured.
- `cancel-in-progress: false` — never cancel a deploy mid-flight.

---

## 3. Credential Safety

### 3.1 Do Not Introduce New Secrets

- Agents must not create new secrets, API keys, or tokens.
- If a task requires a new credential, report it as a blocker with:
  - Credential name
  - Purpose
  - Expected storage location
  - Whether user action is needed

### 3.2 Do Not Commit .env or Credentials

- Never commit `.env`, `.env.local`, `*.env`, or any file containing secrets.
- Check `.gitignore` includes these patterns.
- If `.env.example` is missing, suggest creating it (with placeholder values only).

### 3.3 master_credentials.md Usage

- `master_credentials.md` is a local credential lookup index, not a secret store.
- It records credential names, purposes, storage locations, and retrieval methods.
- It must never contain full secret values.
- It must never be committed to git.
- Use it only if explicitly available in the repo or local environment.

### 3.4 Never Expose Secrets in Output

- Mask secrets in logs and summaries (e.g., `sk-****abcd`).
- Never print full API keys, tokens, or passwords.
- Redact secrets from terminal output, chat messages, and final summaries.

---

## 4. External Agent CLI Policy

### 4.1 No Inference

Agents must not choose an external agent CLI by guessing. The CLI must be explicitly requested.

### 4.2 Approved Wrappers

When calling external agents, use only the approved wrapper scripts:

| Agent | Command |
|-------|---------|
| Claude Code | `./agents/run-claude-code.sh "<task>"` |
| OpenCode | `./agents/run-opencode.sh "<task>"` |
| Codex | `./agents/run-codex.sh "<task>"` |

### 4.3 Rules

1. Do not substitute one agent CLI for another.
2. If the requested wrapper is missing, stop and report the exact blocker.
3. Do not fall back to another CLI.
4. No external agent CLI is the default.
5. The calling agent must summarize the delegated task and expected output before invoking.

---

## 5. Cloudflare Dependency Awareness

### 5.1 Cloudflare Is Not the Default

- Cloudflare is an implementation option, not the product architecture.
- New services should consider portable alternatives before choosing Cloudflare-specific runtimes.

### 5.2 When Using Cloudflare

- Isolate Cloudflare-specific code behind adapters where practical.
- Document the dependency in the PR description.
- Note the migration path if Cloudflare becomes unavailable.

### 5.3 Review Before Adding

Before adding a new Cloudflare dependency (KV, D1, R2, Worker Cron, Pages, Tunnel):
1. Is there a portable alternative?
2. Can it be isolated behind an adapter?
3. What is the migration cost?
4. Is the value worth the coupling?

---

## 6. Final Summary Requirements

Every agent task must produce a final summary including:

```markdown
## Task Summary
- **Files changed:**
- **Validation run:**
- **Deployment impact:**
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

## 7. Repo-Specific Override

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

## 8. Related Documents

- [Cloudflare Dependency Policy](docs/cloudflare-dependency-policy.md)
- [Runtime Strategy](docs/runtime-strategy.md)
- [Deployment Patterns](docs/deployment-patterns.md)
- [Pull Request Template](.github/pull_request_template.md)

---

*Central guidance last updated: 2026-06-09. Repos should review against their local AGENTS.md regularly.*
