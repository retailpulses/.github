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

## Issue #11 execution baseline — 2026-11-11 JST

**Authority:** Sponsor-approved 2026-11-11 direction in [#11](https://github.com/retailpulses/.github/issues/11): `.github` is the sole active governance authority; `rp-governance-kit` remains frozen pending retirement. This section records live reads for the first implementation PR and supersedes the 2026-10-27 assessment date above. It does not claim consumer cutover or archive readiness.

### Exact repository and PR baseline

| Repository | Visibility / state | Default branch HEAD (read 2026-11-11 JST) | Open PRs |
|---|---|---|---|
| `retailpulses/.github` | public, active, default `main` | `d6384e1c0d5cc0e2b973d4869aab328b5752bb07` | #84, #83, #80, #69, #67, #65, #55, #50 |
| `retailpulses/rp-governance-kit` | public, active, default `main`, freeze notice present | `3bdf3a5f37bc6308806793713320b4e9cbbf0bf1` | #35, #31, #19 |

Open PR head SHAs and URLs were read from GitHub CLI on this date. Neither repository is archived. The old repository PRs remain open; this PR does not modify them. Open PR head SHAs read: `.github` #84 `c635364dbd123efc2b718de960d015b331fd5ee5`, #83 `e42ccc965452d92440036882e179847cb68b1b68`, #80 `c3ae6a0d7f192d9be8f33c2ab1b250e0da1c83b3`, #69 `640c96e0e9d7dc1c2f665d7ef0a87014af9af582`, #67 `2ec47e764edea1e8b9c01b51ffd88ce58b7355ae`, #65 `0317bd28718af5fef1d74c243fb023ed6a6f5716`, #55 `fa07832cd02c6b302d1fd25f7be0eb5e86fddf40`, #50 `86a45500a3ad5291cbead68c5984442dda2b6d06`; old kit #35 `cd4c00cbb8b7a1ba0baa9666237b5d93d6fc5e64`, #31 `ce4ef4f331d719cbecadc925ae6dcacaa7c14043`, #19 `ae5b7bad731d6dfcf18efcbdaaa193aff6766ecc`. Full active-consumer PR-head and external/dynamic caller scan remains **UNKNOWN_BLOCKED**.

### Current executable evidence and protection readback

- Organization code search for `rp-governance-kit` returned default-branch hits in `.github`, RPagentOS, commerce-ops, CatalogSync, inbox, boutique-listing, retailpulses-tool-services, and OrderMgmt. It also returns historical policy/docs and local installed tool copies; search results alone are not a complete executable census.
- Current CatalogSync ruleset `23862538` (`CatalogSync required checks`) is active on `refs/heads/main` and requires exact context `governance / Governance Checks`. Preserve this name and blocking behavior until an authorized/evidenced equivalent is live.
- Latest available CatalogSync Actions run readback returned run `41277913965`, PR event, completed/success, head `df28c77114fee4bff6b44a1526d5733a9187a0cb`, created 2026-11-01. This is one latest-run sample, not a normalized history or evidence of current runner/required-check health.
- Repository visibility and default branch were verified for `.github` and the old kit. Required checks, rulesets, environments, runner availability, and recent run behavior for every other consumer have not been read back; retain `UNKNOWN_BLOCKED` until verified.
- Current kit main still has 3 open PRs listed above. No kit rename/archive was attempted.

### Imported source manifest and change boundary

The frozen kit source was read at exact commit `3bdf3a5f37bc6308806793713320b4e9cbbf0bf1`. Its source-to-target SHA-256 and path mapping is recorded in [`GOVERNANCE_KIT_IMPORT_MANIFEST.tsv`](GOVERNANCE_KIT_IMPORT_MANIFEST.tsv). The manifest covers `bin/`, policy and registry documents (target `docs/governance/`), `scripts/`, `templates/`, and `tests/`. Existing central `.github/workflows/` were already staged by merged #45/#46 and were not bulk-overwritten in this import.

- Central workflow implementation files already present in `.github` remain the active reusable workflow entrypoints. The database script required by that workflow is now included at `scripts/database-governance-checks.sh`.
- The installer now targets `retailpulses/.github`, and requires an explicit full commit SHA with `--ref`; it does not install consumers or switch any existing workflow. Installed wrapper templates target the central reusable workflow.
- Imported policy content was copied with source/target hashes. Historical Issue/PR citations remain evidence and were not rewritten as though their issue numbers belonged to `.github`.
- This PR does not change consumer repositories, required-check rulesets, credentials, environments, production runners, or deploy workflows. It does not establish an immutable post-merge release SHA. Create and verify that mapping only after merge, before any consumer is switched.

### S0 disposition and remaining gates

S0 is **PARTIAL**, not complete: repository heads, open PRs, selected code-search results, a current CatalogSync ruleset, and one recent-run sample are recorded. A complete live consumer/branch census, open-PR head scan, nested and dynamic `uses:`/checkout/installer/local-agent search, required contexts and environment settings, all consumer owners, runner/local-agent installation readback, and per-consumer rollback evidence remain outstanding. Do not use this partial inventory as proof of zero dependencies or archive readiness. No consumer migration is authorized by this central import.

### S2 pilot candidate screen — live readback 2026-11-11 JST

The candidate set was rechecked after opening PR A. **No currently evidenced qualifying active, non-production old-kit consumer was selected**, so PR B is not opened. The table records the reason and is not an authorization to change production consumers.

| Candidate | Current default-branch evidence | Risk / pilot disposition |
|---|---|---|
| `retailpulses-tool-services` | HEAD `e09c357a9f61aad6a5181760120a7439909b6c1f` dated 2026-09-15; latest Actions sample is Governance Checks run `34949070046` on 2026-09-15; only open PR #7 is a POC last updated 2026-09-05. | Utility-only profile appears lower risk, but recent activity is not evidenced; **not eligible as an active pilot**. Recheck if work resumes. |
| `homebliss-vpn` | HEAD `d1f1c49f1b0103229a6b8e7aa0ff6e0f89413963` on branch `feat/initial-implementation`; no Actions runs returned. | **Not active / UNKNOWN_BLOCKED**; no real run for pilot evidence. |
| `boutique-listing` | HEAD `2424b7e0b38cc84e0a404bba555ce6847ec31237`; latest runs include successful Deploy runs `37620351582` and `37620323744` on 2026-10-07. | Has a production publishing/release path and historical broken kit checkout; **not a low-risk non-production pilot**. Preserve until its own fitness/required-context review. |
| `RPagentOS` | HEAD `010e50038b681298e8655db2d9d509b2f21a53a7`; DB governance run `38254920015` is meaningful failure evidence; production recovery workflows ran on 2026-10-11. | Real DB MUST protection and production recovery path; **not a low-risk pilot**. |
| `OrderMgmt` | HEAD `7eef5ed7dfa00ba22a6cc31e1430058838445f6c` dated 2026-11-11; active deploy API/relay/worker workflows; PR/database/governance runs on the same date. | Active, but order-management deployment and schema paths make this **production-sensitive**, not a low-risk pilot. |
| `CatalogSync` | HEAD `4b118f453118a4ee862eaf836deed314b379b5c9`; required ruleset `23862538` requires `governance / Governance Checks`; deploy workflow and production VPS chain are present. | **Excluded** from pilot; preserve exact required context and production release contract. |
| `inbox` | HEAD `af4658803e776e5805b60a254f2def43e8c6f658` dated 2026-11-10; latest Actions samples are Project 3 Event Intake canaries on 2026-10-20; old-kit post-deploy wrapper is `workflow_call`. | Active repository, but no actual wrapper caller was demonstrated; **not an evidenced active old-kit workflow consumer**. |
| `commerce-ops` | HEAD advanced 2026-11-11 with open PRs; local governance is app-specific and no direct kit reusable workflow call is present in the workflow census. | Active, but adding a central required gate would violate its existing local safety boundary; **not eligible for a blanket pilot**. |

PR A must be reviewed and merged before any pilot can pin its published merge SHA. B remains pending a future S0 refresh that identifies an active non-production consumer with an actual old-kit call, no production side effect, and a validated owner/required-context/revert path. Do not substitute a stale repo or create a new caller just to produce a green run.

### Post-merge execution readback — 2026-11-11 JST

PR [#92](https://github.com/retailpulses/.github/pull/92) is merged. GitHub resolves immutable central ref `16ddc55f89261ff00081cfd9940037bd517e1e1a`; `main` has advanced to `cbe24169b9e5d79a140cf343916229d96c08cdf6` since that merge. The focused installer hardening and comment cleanup are proposed in a follow-up PR (link added after creation); no consumer repository is changed.

#### Installer hardening evidence

- `bin/rp-governance-install` compares each target against generated content and refuses to replace changed existing files unless `--force` is supplied. `governance/local.yaml` and `docs/01_ARCHITECTURE.md` remain preserved. Planned changes are printed as a Git diff before any push/PR.
- `.github/governance-managed.sha256` records hashes for central-managed installed entrypoints. Repeat runs validate the manifest, so post-install content drift invalidates the up-to-date result. Existing installs without this manifest are treated as needing review/upgrade; differing targets require explicit overwrite opt-in.
- The local safety regression exercises fresh install, repeat/idempotence, customized-file collision, explicit upgrade, and checksum drift. Duplicate explanatory comments were removed from the central DB workflow.
- Local results: installer shell syntax **PASS**; installer safety regression **PASS**; database governance fixture suite **5/5 PASS**; `git diff --check` **PASS**. No consumer install was run.

#### Isolated S2 compatibility harness

An ephemeral private repository `retailpulses/governance-compat-harness-20261111` was created solely for this test and will be deleted after run readback. Actions used default read-only token permissions; the harness contains no secrets, environments, deploy jobs, or write scopes. Its caller pinned the reusable workflow and `governance_ref` to `16ddc55f89261ff00081cfd9940037bd517e1e1a`.

| Fixture | Run | Result | Evidence |
|---|---:|---|---|
| Docs-only positive PR #1 | `42953518883` | **PASS** — BLOCKING, PRODUCTION_GATE, ADVISORY jobs all passed | [Actions run](https://github.com/retailpulses/governance-compat-harness-20261111/actions/runs/42953518883) |
| Deliberately malformed migration PR #2 | `42953578004` | **EXPECTED FAIL** — BLOCKING rejected the migration filename and missing governance docs; the other jobs completed successfully | [Actions run](https://github.com/retailpulses/governance-compat-harness-20261111/actions/runs/42953578004) |

This proves an isolated reusable-workflow caller and expected blocking semantics for the pinned database workflow. It does not establish any consumer's branch rules, deployment contract, or migration-path coverage. The temporary harness PRs are not to be merged.

#### S0 refresh and remaining classification

The refreshed organization code search for `rp-governance-kit` (2026-11-11) still shows default-branch references across `.github`, RPagentOS, commerce-ops, CatalogSync, inbox, boutique-listing, retailpulses-tool-services, OrderMgmt, and homebliss-vpn. Results include executable files, local tool copies, and historical documentation; GitHub code search is bounded and does not resolve dynamic/external callers or all open-PR heads. Therefore S0 remains **PARTIAL**.

| Surface | Current disposition | Evidence / limit |
|---|---|---|
| CatalogSync governance | **KEEP_AND_MIGRATE / protection-sensitive** | Live ruleset `23862538` is active and requires exact `governance / Governance Checks`; preserve that context. VPS production release chain is excluded from this follow-up. |
| RPagentOS database checks | **KEEP_AND_MIGRATE / production-sensitive** | Prior run `38254920015` shows meaningful migration-policy rejection; production recovery and migration workflows remain untouched. |
| OrderMgmt | **KEEP / production-sensitive pending owner review** | Active API/relay/worker deployment workflows and same-day DB/governance runs; no cutover proposed. |
| boutique-listing | **UNKNOWN_BLOCKED / preserve** | Production deploy runs exist; historical governance checkout failures need product-owner review before replacement. |
| retailpulses-tool-services | **UNKNOWN_BLOCKED** | Last observed default-branch activity/run is 2026-09-15; insufficient evidence of current active non-production use. |
| homebliss-vpn | **UNKNOWN_BLOCKED** | Default branch remains `feat/initial-implementation`; no runs returned in prior live query. |
| inbox post-deploy wrapper | **UNKNOWN_BLOCKED** | `workflow_call` wrapper present, but no caller was demonstrated; absence is not established. |
| commerce-ops | **KEEP_LOCAL / no blanket central gate** | App-local governance remains product-owned; no universal gate was added. |
| External callers, dynamic refs, local-agent runtime installs, full open-PR heads, most consumer rulesets/runners/environments | **UNKNOWN_BLOCKED** | Not exhaustively read back; requires owner/path-level census before kit retirement. |

No consumer migration or required-context/ruleset change was made. Old kit retirement, #11 closure, and #44 closure are not ready. Keep both issues open until caller census, owner decisions, consumer rollback evidence, and release-chain review are complete. Next bounded action: exhaustive per-repository workflow/open-PR and local-agent caller census, preserving CatalogSync's required context and excluding production release writes.
