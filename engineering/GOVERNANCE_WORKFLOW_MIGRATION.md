# Governance workflow migration — Sprint #44

Tracking: https://github.com/retailpulses/.github/issues/44 · Parent retirement https://github.com/retailpulses/.github/issues/11

This directory will host reusable workflows migrated from `rp-governance-kit`. All files are **staged on a review branch**; central authority is **not** cut over until consumer PRs merge and pass checks.

| New workflow | Old implementation | Compatibility rule |
|---|---|---|
| `governance-checks.yml` | kit `f2696cf447ee52903938e580d299e4073093586c` | Same job name and macOS runner |
| `database-governance-checks.yml` | kit current main (historical caller `6be2977b370975c117cce9ed1d1fb437518072d2`) | Keep BLOCKING/PRODUCTION_GATE/ADVISORY names; explicitly pin `governance_ref` to new script source SHA. Old historical nested checkout bug is corrected rather than preserved |
| `post-deploy-governance-legacy.yml` | kit `12056e83066536fff6804209f049f6de4b107081` | Retains `ubuntu-latest` for old CatalogSync wrapper |
| `post-deploy-governance.yml` | kit current main | Retains self-hosted macOS/ARM64/`mac-local-poc` for VPS closeout |
| `vps-immutable-release.yml` | kit current main | No production release action changed; nested closeout temporarily points to `.github@main` **until a reviewed central immutable SHA is published**. Do not switch live deployment before replacing this with a pinned, tested version |

Migration and archive gates:
1. Verify retained inputs, secrets, job names, and runner labels against caller baseline.
2. Run `bash scripts/tests/test-database-governance-checks.sh` and check valid/invalid fixtures (requires Git and Bash).
3. Publish merged central SHA; **replace any `.github@main` nested release reference with immutable commit SHA** in a follow-up release before activating CatalogSync production deployment.
4. Migrate consumers via PR. Capture GitHub Actions pass + intentionally failing evidence. Run no production deployment during this migration.
5. Audit all original `uses:`, `checkout repository:`, installer and agent references. Rename/archive old kit **only** after all active consumers are handled.

The supplied `governance_ref` in database workflow must be the central implementation ref; it is not inferred from `github.workflow_sha` (caller SHA). Local checkouts retain caller repo at working directory root. Historical documentation links can remain references to preserved source history.
