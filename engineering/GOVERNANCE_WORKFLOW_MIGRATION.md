# Governance Workflow Fitness & Retirement — Sprint #44

Authority: [Sprint #44](https://github.com/retailpulses/.github/issues/44) (fitness/implementation) · [#11](https://github.com/retailpulses/.github/issues/11) (kit retirement)
Assessment date: 2026-10-27 JST
Status: **Initial repository/runtime evidence review; decisions provisional unless supported by concrete call path and acceptance.**
Goal: `rp-governance-kit` becomes archive-ready with **fewer, more useful** checks—not a wholesale one-for-one migration.

## Sponsor decision & change gate

- **Audit first, selectively keep/simplify/retire.** Existence of an installed wrapper is not evidence that it is necessary or effective.
- Before retaining a check, identify a concrete failure mode prevented, actual coverage of current source paths, nonduplicative signal, expected trigger/cost, owner, and required-check status. If no case, propose retirement.
- Before removing a real required protection, verify equivalent alternative and explicitly change GitHub ruleset/branch requirement. No silent loss of protection.
- A zero-run `workflow_call` wrapper may simply have no callers; inventory both direct and nested invocations before deleting.
- Archive readiness is about **zero unhandled executable dependencies**, not rewriting historical documentation references.
- `CatalogSync#270` bulk migration draft was **closed unmerged** after this rule changed. Per-repo fitness decisions must precede replacement PRs.

## Preliminary fitness matrix — default branch as of 2026-10-27

GitHub Actions counts are **only from latest up to 100 available workflow runs per repository** (not a normalized 30-day period). Counts are diagnostic evidence, not an activity rate; details and run logs must be consulted. A suggested decision is **not** authorization to remove required checks.

| Consumer | Evidence: actual runs / source paths | Governance issue/architecture check | DB governance check | Post-deploy or deployment | Action / owner |
|---|---|---|---|---|---|
| **CatalogSync** | Latest 100: Governance 49 (21 failures), DB 1; PR Check 37; VPS deploy 10. Actual migrations: `scripts/gigab2b/migrations/`, excluded from installed DB wrapper's `supabase/**`, `db/**`, `database/**`, `migrations/**` filters. | **SIMPLIFY/KEEP protection:** org + repo ruleset requires `governance / Governance Checks`; `pr-check.yml` already covers architecture/code tests. Determine whether Issue Link Check merits a separate workflow; maintain the exact required context or update ruleset deliberately. | **REDESIGN, not blind migrate:** existing filter misses actual migration path; establish owner-specific migration/DB safety checks, reusing scripts only where relevant. | **KEEP** production `deploy-vps.yml` and its environment/SSH/rollback. Wrapper `post-deploy-governance.yml` has no direct caller found in source search; candidate RETIRE after call audit. | Product owner; PR #270 superseded; preserve working deploy contract |
| **RPagentOS** | Latest 100: Governance 34 (22 failures), DB 30 (18 failures); `supabase/migrations/` has material active schema content. Log example 2026-10-12 shows DB check correctly rejected missing migration docs, headers and owner mismatch. | **REVIEW/SIMPLIFY** PR Issue Link check depending on actual false positives and required status. | **KEEP meaningful migration protection**, assess false positives and historical ref behavior; migrate only if validated. | Post-deploy wrapper no direct repo caller found; candidate RETIRE. Separate `supabase-migrations.yml` is a production/DB write pathway and **out of scope for blind removal**. | Domain owner review |
| **boutique-listing** | Latest 100: Governance 14 (7 failures), DB 10 (8 failures); repository has `migrations/*.sql` and own `pr-check.yml`. 2026-10-06 DB failures show `upload-pack: not our ref` in kit checkout, not a meaningful DB policy signal. | **SIMPLIFY** against existing PR tests; check actual owner/required check. | **REPLACE/FIX** unreliable workflow rather than carry over failing historical ref; if active migrations need checks, scope them to actual root `migrations/`. | Wrapper candidate RETIRE unless an active caller is demonstrated. | Product owner review |
| **retailpulses-tool-services** | Latest 100 (all 25 recorded): Governance 14 (9 failures), DB 10 (6 failures), last 2026-09-15. Tree contains no migrations/DB directories. | **REVIEW for RETIRE**, check repo's ongoing production consumers and whether Issue Link Check adds value. | **Candidate RETIRE**—no tracked DB migrations to govern; confirm any runtime DB writes first. | Wrapper candidate RETIRE pending caller scan. | Owner / active-runtime check |
| **homebliss-vpn** | Default branch `feat/initial-implementation`; 0 recorded Actions runs; installed PR workflows target `main`; no tracked DB migrations/DB dirs. | **Candidate RETIRE** templated workflow, unless repo is reactivated with a main PR process. | **Candidate RETIRE**. | Wrapper candidate RETIRE. | Owner / required-status check |
| **inbox** | Last 100 runs focus on project progression POCs; wrapper `post-deploy-governance.yml` uses old kit `@main`; no direct wrapper caller found in org code search. | No installed old-kit governance wrapper found. | No installed old-kit DB wrapper found; backoffice has domain migration ownership requiring separate consideration. | **Candidate RETIRE** unused post-deploy wrapper; no claim of caller absence until full audit. | inbox owner |
| **commerce-ops** | No direct kit reusable Workflow in observed main root; has local `phase0a-governance.yml` and app-level historical policy/tool pointers. | **DO NOT INSTALL another universal gate**: compare with existing local, app-scoped checks. | Domain app ownership/correct migration gates remain in product repo, not inferred from old kit link. | Production release gates preserved; reconcile app-level pointers separately from Actions. | Product owner + #11 |

## Findings that materially affect retirement

1. **Coverage mismatch**: CatalogSync's DB workflow has a root-only `migrations/**` filter, but current migration DDL is under `scripts/gigab2b/migrations/`. A one-to-one move would preserve a misleadingly green/absent check.
2. **False failures**: boutique-listing DB failure [run 37475735348](https://github.com/retailpulses/boutique-listing/actions/runs/37475735348) failed to checkout the old kit due to `not our ref`. Moving without fixing version/checkout changes what is tested, not merely its location.
3. **Real policy signal**: RPagentOS DB failure [run 38254920015](https://github.com/retailpulses/RPagentOS/actions/runs/38254920015) identified missing migration docs, headers and a cross-domain owner mismatch. Retiring this protection without an equivalent is unsafe.
4. **Required check discovered**: CatalogSync active ruleset `CatalogSync required checks` (id `23862538`) requires **`governance / Governance Checks`**. Deleting or renaming the job without changing the ruleset blocks merges (or loses protection if deliberately bypassed). GitHub branch protection API returned 403 via current connector, so other required-check constraints remain unknown.
5. **Cost and signal**: Many Governance failures are `Issue Link Check`; decide whether that is desirable product governance or noisy friction. Count blocked actionable defects vs false positives, not only failures.
6. **No observed use is not proof of no use**: Generic post-deploy wrappers expose `workflow_call` and don't run on push/PR independently. No direct downstream callers found by current org code search; must also check dynamic refs/external consumers and run/required-context settings.

## Targeted implementation policy

- **Retain & migrate:** only checks protecting an identified still-relevant risk; preserve event paths, names/contexts, permissions, runner, inputs/secrets, external environment gates, fail/pass fixtures, and rollback.
- **Simplify/native:** use existing repo PR/CI tests and a small local validator where easier than a general central toolkit. Never add a new gateway/platform for this task.
- **Retire:** remove unused/ineffective wrapper or obsolete template references in a reviewed PR; confirm no live caller and no required-status dependency before merge.
- **Unknown:** preserve current behavior until owner verifies the dependency. Unknown never implies Keep Forever.
- The central reusable workflow import is [PR #45](https://github.com/retailpulses/.github/pull/45) merged as `a2c7908d20097f334602b5aefa86c2c73daa14a7`; nested VPS pin is [PR #46](https://github.com/retailpulses/.github/pull/46), merged as `b4ae662c5264cd9b13b5e397c1f133884bc37561`. **These files are available, not automatically mandatory.** Historical source ref to target ref mapping and regression evidence still need per-consumer acceptance.
- Old kit README carries FREEZE notice. Old repository is **not** archive-ready.

## Next verification actions / DoD

1. Complete full consuming-repo census (including external, nested and installer/local agent usage), actual workflow calls, required statuses and last effective run by service. Confirm if new repo itself needs every imported workflow.
2. For each workflow capture Retain/Simplify/Retire/Unknown decision, owner, business risk, evidence, required check, cost/friction and reversible implementation PR.
3. Execute selective PRs; test should-pass and should-fail fixture, real Actions trigger, path filtering, status contexts and production safety (no deployment for migration testing).
4. Validate zero **unhandled active** kit references; update canonical `.github` documentation and policy pointers after authority cutover, not as unverified mass substitution.
5. Then and only then approve requested `freeze-rp-governance-kit` rename/archive with readback and rollback plan.

Old source workflows that supplied central files:
- `governance-checks.yml` kit `f2696cf447ee52903938e580d299e4073093586c` (macOS, used by CatalogSync)
- `database-governance-checks.yml` kit `6be2977b370975c117cce9ed1d1fb437518072d2` (CatalogSync)
- `post-deploy-governance-legacy.yml` kit `12056e83066536fff6804209f049f6de4b107081` (historical Ubuntu runner semantics)
- `post-deploy-governance.yml`, `vps-immutable-release.yml` kit main; central VPS nested closeout pinned to an immutable central SHA in #46

Full history and Sprint scope: #44.
