# Agent Workflow Policy

**Status:** Reference
**Version:** 1.0.0
**Last updated:** 2026-06-09

---

## 1. Purpose

This document defines how AI agents should interact with Retailpulses repositories, workflows, and infrastructure. It extends the central [AGENTS.md](../AGENTS.md) with operational detail.

---

## 2. Agent Authority Levels

| Level | Scope | Approval Required |
|-------|-------|-------------------|
| **Read** | Read files, search code, inspect config, query read-only APIs | None |
| **Plan** | Create plans, designs, documents, drafts | None |
| **Write (safe)** | Edit code, create files, run validation | Implicit (within task scope) |
| **Write (risky)** | Modify deployment config, change CI/CD, alter schema | Explicit user confirmation |
| **Execute (safe)** | Run tests, lint, type check, dry-run | Implicit |
| **Execute (risky)** | Deploy, publish, send, delete, mutate production | Explicit user confirmation |

---

## 3. Per-Repo Agent Override

Each repo may have its own `AGENTS.md` that extends or tightens these rules.

Central `AGENTS.md` → Repo `AGENTS.md` → Task-specific instructions

More specific rules override more general ones.

---

## 4. Workflow Interaction Rules

### 4.1 PR Workflows

- Agents may create or modify PR check workflows (`.github/workflows/pr-check.yml`).
- PR workflows must NOT contain deploy jobs.
- PR workflows should be fast (<5 min) and safe (no secrets beyond `GITHUB_TOKEN`).

### 4.2 Deploy Workflows

- Agents may propose deploy workflow changes.
- Deploy workflow changes require explicit user approval before merge.
- Agents must not trigger production deploys.
- Agents may trigger dev deploys if explicitly authorized in the task.

### 4.3 Reusable Workflows

- Agents should prefer calling central reusable workflows over copying.
- If a central workflow doesn't fit, propose extending it rather than forking.
- Repo-specific values must be passed as inputs, never hardcoded.

---

## 5. Cloudflare Interaction Rules

### 5.1 Safe Operations

Agents may:
- Read `wrangler.toml` for configuration understanding
- Propose code changes that run on Workers
- Run `wrangler deploy --dry-run` if available
- Document Worker configuration and dependencies

### 5.2 Risky Operations

Agents must NOT without explicit approval:
- Run `wrangler deploy` to any environment
- Modify `wrangler.toml` bindings (KV, D1, R2, queues, services)
- Create or delete Worker Cron triggers
- Modify Cloudflare routes or custom domains
- Create or rotate Cloudflare API tokens
- Run `wrangler secret put` or `wrangler secret delete`

---

## 6. Credential Interaction Rules

Agents must:
- Check `master_credentials.md` for credential lookup (if available locally)
- Report missing credentials with full context (name, purpose, expected location)
- Never commit `.env` or credential files
- Never expose secret values in logs, summaries, or chat

Agents must NOT:
- Create new API tokens or credentials
- Rotate credentials without explicit user request
- Move credentials between storage locations
- Share credentials across repos without user approval

---

## 7. External Agent CLI Rules

When a task requires calling another AI agent:

1. The user must explicitly name which CLI to use (Claude Code, OpenCode, or Codex).
2. The calling agent must summarize the delegated task and expected output first.
3. Use only the approved wrapper scripts: `./agents/run-claude-code.sh`, `./agents/run-opencode.sh`, `./agents/run-codex.sh`.
4. If the wrapper is missing, stop and report the blocker.
5. Never substitute one CLI for another.
6. No external agent CLI is the default.

---

## 8. Task Closeout Requirements

Every agent task must produce a closeout summary:

```markdown
## Task Closeout

### Objective
[Original goal]

### Files Changed
[List with paths]

### Validation Run
[What was tested, commands run, results]

### Deployment Impact
[Does this change deployment? New secrets? New env vars?]

### Cloudflare Dependency Impact
[Does this add/change/remove CF dependency? Is it isolated?]

### Remaining Risks
[Known issues, untested paths, assumptions]

### Credential Check
- Required: [list]
- Found via: [shell env / .env / master_credentials.md]
- Missing: [list]
- Secrets exposed in output: No
```

---

## 9. Incident Response

If an agent causes or discovers a production issue:

1. **Stop** — do not continue making changes.
2. **Report** — describe what happened, what was touched, and the observed effect.
3. **Recommend** — propose immediate mitigation.
4. **Wait** — do not attempt fix without user approval.

---

*This policy applies to all AI agents interacting with Retailpulses repos. Update as agent capabilities and org practices evolve.*
