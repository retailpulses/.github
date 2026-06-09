# Adoption Guide

How Retailpulses repos inherit and override shared governance from `retailpulses/.github`.

---

## 1. What Happens Automatically

When `retailpulses/.github` exists and contains these files, every repo in the org **automatically** inherits them as defaults:

| Central file | Effect on downstream repos |
|-------------|---------------------------|
| `ISSUE_TEMPLATE/*.yml` | Appears in the issue chooser when creating a new issue, unless the repo has its own templates |
| `PULL_REQUEST_TEMPLATE.md` | Pre-fills the PR description box, unless the repo has its own template |
| `SECURITY.md` | Shows in the Security tab, unless the repo has its own |
| `AGENTS.md` | Used by AI agents as default behavior guidance, unless the repo has its own |

Reusable workflows (`workflows/`) do NOT apply automatically. Repos must explicitly call them.

---

## 2. How to Override a Shared Default

If a repo needs its own version of a shared file, create the equivalent file in the repo:

```bash
# Override the shared PR template
touch PULL_REQUEST_TEMPLATE.md

# Override shared issue templates
mkdir -p .github/ISSUE_TEMPLATE
# Copy only the templates you want, or create custom ones

# Override agent guidance
touch AGENTS.md
```

The repo-specific file takes precedence. The central file is ignored for that repo.

---

## 3. How to Extend Central Agent Guidance

Create a repo `AGENTS.md` that references the central one:

```markdown
# Repo-Level AGENTS.md

## Extends
[retailpulses/.github AGENTS.md](https://github.com/retailpulses/.github/blob/main/AGENTS.md)

## Repo-Specific Context
- This repo manages Mercari Shop API interactions.
- All production mutations require `--dry-run` first.
- Customer messages must never be sent without human review.

## Repo-Specific Rules
- Do not modify Baserow table 886994 (Products) without approval.
- Mercari API rate limit is 5000 req/hr — batch accordingly.
```

---

## 4. How to Call a Reusable Workflow (Future)

Once workflows graduate from Draft to Stable:

```yaml
# .github/workflows/pr-check.yml in your repo
name: PR Check

on:
  pull_request:
    branches: [main]

jobs:
  validate:
    uses: retailpulses/.github/.github/workflows/reusable-pr-check-python.yml@v1.0.0
    with:
      python_version: "3.12"
      working_directory: "."
```

Do NOT call `@main` — always pin to a version tag or commit SHA.

---

## 5. Onboarding Checklist for New Repos

When creating a new Retailpulses repo, run through this checklist:

### Phase 1: Setup (before first commit)
- [ ] Add `.gitignore` (cover `.env`, `node_modules/`, `__pycache__/`, `.DS_Store`)
- [ ] Add `.env.example` with placeholder values (no real secrets)
- [ ] Decide: inherit central `PULL_REQUEST_TEMPLATE.md` or override?
- [ ] Decide: inherit central `ISSUE_TEMPLATE/` or override?
- [ ] Decide: create repo `AGENTS.md` or rely on central default?

### Phase 2: CI/CD
- [ ] Add `.github/workflows/pr-check.yml` (validate only, no deploy)
- [ ] Add `.github/workflows/deploy.yml` if this repo deploys (gate → deploy → smoke → summary)
- [ ] Configure repo secrets in Settings → Secrets and variables → Actions
- [ ] Test `workflow_dispatch` with a dev deploy

### Phase 3: Documentation
- [ ] Add `README.md` (purpose, setup, commands, environment vars, safety notes)
- [ ] If Cloudflare-dependent: add Cloudflare Dependency Justification section
- [ ] If deploys: add `docs/deployment.md` (environments, secrets, deploy commands, rollback)
- [ ] Link back to central docs where relevant

### Phase 4: Agent Readiness
- [ ] Verify `AGENTS.md` or central default covers repo-specific risks
- [ ] List forbidden changes (e.g., "do not modify production Baserow schema")
- [ ] List validation commands agents should run
- [ ] Document credential policy for this repo

### Phase 5: Go Live
- [ ] Run `pr-check.yml` — confirm it passes
- [ ] Run deploy to dev — confirm smoke test passes
- [ ] Verify issue templates render correctly in GitHub UI
- [ ] Verify PR template pre-fills correctly

---

## 6. FAQ

### Q: My repo already has `ISSUE_TEMPLATE/`. Will the central templates replace it?

No. If a repo has its own templates, the central ones are ignored for that repo. You can mix: if your repo has 2 templates and the central has 7, only your 2 will appear. Copy the central ones you want to keep.

### Q: How do I test a reusable workflow before calling it?

Copy the workflow YAML into your repo's `.github/workflows/` and test it as a local workflow first. Once it works, switch to calling the central version (pinned to a tag).

### Q: Can I call a central reusable workflow from a private repo?

Yes. Public `.github` repos are accessible to all repos in the org, private or public.

### Q: What if the central AGENTS.md conflicts with our repo's needs?

Create a repo `AGENTS.md` that extends the central one. Repo-specific files always take precedence. See Section 3 above.

---

*Update this guide as the org's governance patterns evolve.*
