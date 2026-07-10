# retailpulses/.github

This repository provides default GitHub community files and fallback templates for Retailpulses repositories.

The source of truth for Retailpulses engineering governance, reusable workflows, agent commands, rollout scripts, and governance standards is:

https://github.com/retailpulses/rp-governance-kit

## What This Repo Is For

| Path | Purpose |
|------|---------|
| `.github/ISSUE_TEMPLATE/` | Default GitHub Issue templates for repos that do not define their own |
| `PULL_REQUEST_TEMPLATE.md` | Default PR template fallback |
| `AGENTS.md` | Lightweight organization-level default agent guidance |
| `SECURITY.md` | Security policy and vulnerability reporting |
| `profile/README.md` | Organization profile page |
| `docs/` | Lightweight public/internal guidance and shared references |

## Boundary With rp-governance-kit

This repository is the organization-level GitHub default community/template repo. GitHub uses it as a fallback when a repository does not provide local templates or community health files.

It is not the source of truth for active governance logic.

Use `retailpulses/rp-governance-kit` for:

- reusable GitHub Actions
- governance installer and rollout scripts
- `rp-issue-create`
- `rp-issue-audit`
- `rp-issue-work`
- `rp-issue-closeout`
- engineering standards templates
- documentation governance templates

If repo-local governance files, this `.github` repo, and `rp-governance-kit` conflict, agents should stop and report the conflict instead of guessing.

## Repo Owners

To override a default, create the equivalent file in your repo:

- Your own `.github/ISSUE_TEMPLATE/` replaces the shared Issue templates.
- Your own `.github/pull_request_template.md` or `PULL_REQUEST_TEMPLATE.md` replaces the shared PR template.
- Your own `AGENTS.md` extends or replaces the central agent guidance.

Keep repo-local governance lightweight. Put reusable governance logic and agent commands in `rp-governance-kit`.
