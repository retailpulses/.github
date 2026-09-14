# Retailpulses

Japan-based ecommerce operations and software. This is the organization front door: start with the repos used most often, then use the current development WIP list to see what still needs attention.

## Most Used

| Repo | Role | Go here for... |
|---|---|---|
| [inbox](https://github.com/retailpulses/inbox) | Cross-repo coordination + portfolio | New/unclear work, investigations, handovers, knowledge, cross-repo decisions |
| [commerce-ops](https://github.com/retailpulses/commerce-ops) | Canonical operator-app source | Ops Portal, Inquiry, Orders/Tickets consolidation, shared commerce runtime work |
| [CatalogSync](https://github.com/retailpulses/CatalogSync) | Catalog + marketplace sync | Inventory, availability, marketplace state, synchronization |
| [RPagentOS](https://github.com/retailpulses/RPagentOS) | Agent-driven ecommerce operations | Operational loops, agent-owned ecommerce work, listing intelligence |
| [boutique-listing](https://github.com/retailpulses/boutique-listing) | Listing tooling | Listing creation/editing/publishing workflows |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit) | Engineering governance | Architecture standards, runtime/workload governance, engineering policy |

## Development WIP

Concise snapshot of material unfinished engineering work that still needs follow-up. Detailed status and evidence remain in the linked GitHub artifacts. Last reviewed: **2026-09-14 JST**.

| Priority | WIP | Current state | Next action | Canonical artifacts |
|---|---|---|---|---|
| P0 | Supabase API security hardening | IN PROGRESS — Batch 0+1 production activation completed; later security scope remains open and the final broad-executable Giga COGS import RPC now has a focused PR | Review/merge the focused RPC ACL fix, apply it with production ACL readback/canary evidence, then continue the explicitly separated later batches in #104 | [inbox #104](https://github.com/retailpulses/inbox/issues/104) · [PR #70](https://github.com/retailpulses/commerce-ops/pull/70) · [completed corrective PR #60](https://github.com/retailpulses/commerce-ops/pull/60) |
| P0 | Commerce Ops production-source cutover | PARTIAL — Ops Portal, Inquiry and Orders VPS/Worker cutover evidence exists; Orders VPS is verified on a `commerce-ops` SHA. Tickets and database/migration-source closeout remain unfinished. GitHub-hosted Actions are currently constrained by the restored hard budget | Finish Tickets exact-SHA production-source verification and reconcile the database/migration ownership/history gates before closing Phase 2; use the approved non-Actions path where appropriate rather than assuming the old Orders run is still blocked | [Issue #13](https://github.com/retailpulses/commerce-ops/issues/13) · [successful Orders VPS run](https://github.com/retailpulses/commerce-ops/actions/runs/34821378666) · [historical failed run](https://github.com/retailpulses/commerce-ops/actions/runs/34752608872) · [inbox #115](https://github.com/retailpulses/inbox/issues/115) |
| P0 | CatalogSync stopped/degraded workloads and interrupted Giga→Mercari recovery | UNCERTAIN / CONFLICTING EVIDENCE — #147 requires the Giga→Mercari timer to remain disabled until 33 unknown outcomes are reconciled, while newer cross-runtime evidence reports the timer enabled; #157 still requires live business-level verification of several degraded/blocked workloads | Establish authoritative live timer/release/business state first; reconcile the 33 unknown outcomes before any replay/write; then decide recover/keep-disabled/retire per workload and update the canonical inventory | [Incident #157](https://github.com/retailpulses/CatalogSync/issues/157) · [Recovery #147](https://github.com/retailpulses/CatalogSync/issues/147) · [runtime investigation #110](https://github.com/retailpulses/inbox/issues/110) |
| P1 | Production workload health + bounded self-healing | ACTIVE — Sales Brief recurrence was traced to scheduler-ownership evidence expiry and bounded recovery restored freshness; permanent health detection/renewal/runbook semantics are not complete. No new dashboard/registry is intended | Fix ownership-evidence renewal authority/expiry semantics, implement schedule-aware derived health and exception alerts, then validate normal business-output cycles across the >24h boundary before enabling L1/L2 repair | [inbox #110](https://github.com/retailpulses/inbox/issues/110) · [commerce-ops #34](https://github.com/retailpulses/commerce-ops/issues/34) · [PR #50](https://github.com/retailpulses/commerce-ops/pull/50) · [PR #51](https://github.com/retailpulses/commerce-ops/pull/51) |
| P1 | CatalogSync VPS disk recurrence prevention | PARTIAL — emergency cleanup is complete and the daily watcher is healthy; CatalogSync release retention / allowlisted cleanup ownership is still not closed | Implement the smallest safe immutable-release retention policy that always preserves current + rollback releases, then verify it on VPS without building a parallel monitoring system | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [watcher #107](https://github.com/retailpulses/inbox/issues/107) · [PR #108](https://github.com/retailpulses/inbox/pull/108) |
| P1 | Reduce Mercari Supabase read/egress amplification | DESIGNED / NOT IMPLEMENTED — current 10-minute full reads are materially larger than the observed change rate; #188 defines incremental candidates, durable mapping cache and daily full reconciliation while preserving Mercari API as live-state SoT | Implement instrumentation + durable mapping cache first, then introduce crash-safe incremental cursor processing and only after evidence cut full reconciliation to daily | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [mapping follow-up #187](https://github.com/retailpulses/CatalogSync/issues/187) · [cross-repo egress #105](https://github.com/retailpulses/inbox/issues/105) |
| P1 | RPagentOS hosted migration-history alignment | BLOCKED / SCOPE NEEDS RECONCILIATION — owner deployment is blocked by shared hosted migration versions; #133 specifies 18 Ticket-owned comment-only markers, while open PR #36 describes 21 shared-history placeholders | Reconcile the issue/PR version set and ownership evidence, keep markers comment-only, then rerun production migration dry-run and require only the intended RPagentOS owner migration to remain pending | [Issue #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) · [failed run](https://github.com/retailpulses/RPagentOS/actions/runs/34748527246) |
| P1 | Mercari receipt issuance tool | IMPLEMENTING — canonical design is established and Ops-side scaffold exists, but the OrderMgmt live receipt-snapshot owner endpoint and immutable issuance/storage/PDF/share flow are still missing | Implement the bounded live Mercari owner endpoint, wire preview/revalidation, then add immutable document persistence + PDF + signed-link delivery and perform end-to-end VPS acceptance | [Issue #57](https://github.com/retailpulses/commerce-ops/issues/57) · [PR #58](https://github.com/retailpulses/commerce-ops/pull/58) · [coupon persistence #59](https://github.com/retailpulses/commerce-ops/issues/59) |
| P2 | Boutique bundle workspace | REVIEW / DEPLOYMENT STATUS UNCERTAIN — implementation PR #77 is still open and claims local/dry-run verification for the #76 canonical spec; current production deployment evidence is not established in the reviewed artifacts | Review PR #77 against #76, merge only if still desired/current, then perform production smoke/visual verification; otherwise explicitly supersede it rather than leaving an ambiguous open PR | [Issue #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |

### How to use this page

1. Start here to see material development work that is still open.
2. Open the linked canonical Issue / PR / workflow run for detailed evidence.
3. Approve, defer, or comment there so the decision lands directly in GitHub history.
4. Refresh this section from GitHub evidence: remove completed/superseded work, update changed work, and add newly material WIP.

There is no fixed WIP-slot model. GitHub artifacts remain the detailed engineering source of truth; this section is only a concise organization-level index of unfinished work.

## Runtime / Transition Repositories

These still matter operationally, but some source authority is moving into `commerce-ops`. Check current-state/cutover evidence before starting new engineering work here.

| Repo | Current role |
|---|---|
| [OrderMgmt](https://github.com/retailpulses/OrderMgmt) | Existing order runtime / legacy source during Commerce Ops cutover |
| [inquiry-automation](https://github.com/retailpulses/inquiry-automation) | Existing inquiry runtime / transition repository |
| [ticket-handling](https://github.com/retailpulses/ticket-handling) | Existing ticket runtime / transition repository |
| [skills](https://github.com/retailpulses/skills) | Shared agent skills and capabilities |
| [retailpulses-tool-services](https://github.com/retailpulses/retailpulses-tool-services) | Shared tool/service integrations |

## Route Work

- **Not sure where it belongs or spans repos?** → [inbox](https://github.com/retailpulses/inbox)
- **Operator apps / shared commerce platform / current consolidation work?** → [commerce-ops](https://github.com/retailpulses/commerce-ops)
- **Catalog, inventory or marketplace synchronization?** → [CatalogSync](https://github.com/retailpulses/CatalogSync)
- **Agent operational loop or listing intelligence?** → [RPagentOS](https://github.com/retailpulses/RPagentOS)
- **Listing operator tooling?** → [boutique-listing](https://github.com/retailpulses/boutique-listing)
- **Architecture / engineering governance?** → [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)

## Governance

Organization engineering and architecture governance lives in [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit). Repo-local architecture/current-state documents remain authoritative for repo-specific facts.

> Keep this page low-maintenance: most-used repos + current development WIP + direct canonical artifact links. Detailed status and evidence belong in their canonical artifacts.
