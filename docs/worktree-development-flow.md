# Worktree Development Flow

**Status:** Policy
**Version:** 1.0.0
**Last updated:** 2026-06-14

---

## 1. Target Development Model

```
Issue / scoped task
    →
One branch + one worktree + one primary agent
    →
Local validation
    →
Pull request
    →
PR-level CI validation
    →
Cross-PR dependency and integration-risk review
    →
Optional integration branch/worktree for related or high-risk PRs
    →
Sequential integration validation
    →
Merge to main
    →
Staging validation
    →
Manual production deployment
    →
Production smoke test
    →
Release closeout
```

---

## 2. Core Rules

### 2.1 One Issue, One Branch, One Worktree

Each scoped issue or task maps to exactly one branch and one worktree. Do not mix unrelated changes in one branch. Do not stack features in a single worktree.

### 2.2 Feature Worktrees Do Not Deploy

Feature (`feature/*`) and fix (`fix/*`) branches must never deploy to production. PR workflows validate changes but do not deploy anything. Merging to main is the only path to production.

### 2.3 Related PRs Declare Dependencies

When PRs affect shared APIs, schemas, shared files, or the same business workflow, they must declare in the PR description:
- Release batch
- Dependent issues or PRs
- Required merge order
- Shared files or contracts affected
- Integration risk level
- Whether integration validation is required

### 2.4 Integration Validation When Needed

Integration testing is required when PRs affect:
- Shared API contracts
- Database schemas
- Shared configuration files or libraries
- One business workflow across multiple services

An integration branch (`integration/*`) is required only when there is meaningful cross-PR risk. Do not create an integration branch for every PR.

### 2.5 main Is the Only Production Source

`main` is the only valid branch for production deployment. All production deployments must originate from `main`.

### 2.6 Production Is Manual

Production deployment should use `workflow_dispatch` (manual trigger) unless a repository has a documented and justified exception.

**Automatic push-to-main deploy is acceptable for:**
- Internal tools and dashboards with no customer impact
- Static frontends with no API dependency changes
- Dev/staging environments only

**Automatic push-to-main deploy is NOT acceptable for:**
- Customer-facing services
- Order management systems
- Ticket/messaging systems
- Any system where failure directly affects customers

### 2.7 No Mid-Deploy Cancellation

Production deployment workflows must use `cancel-in-progress: false`. A newer workflow run must never cancel an active production deployment.

### 2.8 Every Deploy Includes a Smoke Test

Every deployment must perform at least one meaningful post-deployment verification. Smoke tests must:
- Retry for a short bounded period (typically 5 retries with backoff)
- Fail clearly (exit non-zero)
- Print the tested URL
- Avoid destructive operations
- Use the repository's real endpoint

---

## 3. Branch Deployment Policy

| Branch Pattern | Deployment Allowed |
|---------------|-------------------|
| `feature/*`   | No deployment |
| `fix/*`       | No deployment |
| `integration/*`, `release/*` | Staging only |
| `main`        | Staging and production |
| Production     | Manual `workflow_dispatch` with approval |

---

## 4. PR Lifecycle

```
Developer opens PR
    →
PR CI validates (typecheck, test, build, dry-run)
    →
If cross-PR risk: integration validation
    →
PR review and approval
    →
Merge to main
    →
Staging validation (auto where safe, manual where needed)
    →
Manual production deployment
    →
Post-deploy smoke test
    →
Release closeout
```

---

## 5. Worktree Lifecycle

```
git worktree add ../worktree-feature+issue-N ../main
    →
Agent works in isolated worktree
    →
git add, commit, push
    →
Create PR from feature branch
    →
After PR merge:
    git worktree remove ../worktree-feature+issue-N
    git branch -d feature/issue-N
```

---

## 6. Integration Model per Repository

### Low-risk repositories
PR validation → sequential merge to main → validate main after each merge.

### Shared-domain or high-risk repositories
PR validation → integration branch → full integrated validation → staging → main → production.

The integration model for each repository is documented in [repository-workflow-matrix.md](repository-workflow-matrix.md).

---

*Update this document when the development model evolves or new repository categories are added.*
