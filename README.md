# retailpulses/.github

**Central engineering governance for the Retailpulses organization.**

This is a [special GitHub repository](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file) that provides default community health files and reusable workflows for all repos in the org.

## What's Here

| Path | Purpose |
|------|---------|
| `ISSUE_TEMPLATE/` | Shared issue templates (bug, feature, agent task, refactor, deploy, architecture) |
| `PULL_REQUEST_TEMPLATE.md` | Default PR template with Cloudflare dependency review |
| `workflows/` | Reusable GitHub Actions workflows (draft) |
| `docs/` | Engineering standards (runtime strategy, deployment patterns, Cloudflare policy) |
| `AGENTS.md` | Default agent behavior rules for all repos |
| `SECURITY.md` | Security policy and vulnerability reporting |
| `profile/README.md` | Organization profile page |

## How It Works

- **Templates** — repos without their own issue/PR templates inherit these automatically.
- **AGENTS.md** — repos without their own agent guidance fall back to this default.
- **Workflows** — repos can call reusable workflows defined here (future).
- **Docs** — engineering standards are referenced by all repos.

## Repo Owners

To override a default, create the equivalent file in your repo:
- Your own `ISSUE_TEMPLATE/` → replaces the shared templates
- Your own `PULL_REQUEST_TEMPLATE.md` → replaces the shared PR template
- Your own `AGENTS.md` → extends or replaces the central agent guidance
