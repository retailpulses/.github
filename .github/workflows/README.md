# Reusable Workflows

**Status: Draft — do not call from production repos yet.**

These workflows are placeholders extracted from the org's deployment patterns. They have not been validated against production repos and may contain bugs or missing features.

## Allowed Use

- Testing in a sandbox/test repo
- Copy as reference for repo-specific workflows
- Review and feedback

## Not Allowed

- Production deploy usage
- Required branch protection checks
- Calling from `@main` in production repos

## Versioning Strategy (future)

Once stabilized, workflows will be called with version tags:

```yaml
# Good — pinned to a version tag
uses: retailpulses/.github/.github/workflows/reusable-pr-check-python.yml@v0.1.0

# Good — pinned to a commit SHA (most secure)
uses: retailpulses/.github/.github/workflows/reusable-pr-check-python.yml@abc1234

# Bad — floating reference, can break without warning
uses: retailpulses/.github/.github/workflows/reusable-pr-check-python.yml@main
```

Version tags follow semver:
- `v0.1.0` — initial draft, may change
- `v0.2.0` — tested in one sandbox repo
- `v1.0.0` — production-validated in 2+ repos

## Workflow Inventory

| Workflow | Status | Validated? | Target |
|----------|--------|------------|--------|
| `reusable-pr-check-node.yml` | Draft | No | Node.js PR validation |
| `reusable-pr-check-python.yml` | Draft | No | Python PR validation |
| `reusable-deploy-cloudflare-worker.yml` | Draft | No | CF Worker deploy |
| `reusable-deploy-vps-service.yml` | Draft | No | VPS service deploy |
| `reusable-cloudflare-dependency-review.yml` | Draft | No | CF dependency review |

## Promotion Criteria

A workflow graduates from Draft → Stable when:
- [ ] Tested in a sandbox repo with passing runs
- [ ] Reviewed by a human operator
- [ ] Used successfully in at least one production repo (non-blocking path)
- [ ] Tagged with a version (e.g., `@v1.0.0`)

## Repo Owners

Do not call these workflows from production repos until they are tagged `@v1.0.0` or higher. Use them as reference templates and copy the parts you need into your own `.github/workflows/`.
