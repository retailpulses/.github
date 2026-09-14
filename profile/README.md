# Retailpulses

Japan-based ecommerce operations and software. This is the organization front door: start with the repos used most often, then use the daily development WIP list to see what still needs attention.

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

This section is the MVP development dashboard. It should be refreshed daily from current GitHub evidence and contain only work that still needs follow-up.

| Priority | WIP | Current state | Next action | Canonical artifacts |
|---|---|---|---|---|
| P0 | Production health / Sales Brief self-healing | VERIFYING | Verify final authoritative health/readback evidence | [Issue #110](https://github.com/retailpulses/inbox/issues/110) · [PR #50](https://github.com/retailpulses/commerce-ops/pull/50) · [PR #51](https://github.com/retailpulses/commerce-ops/pull/51) |
| P0 | Supabase Batch 0/1 security rollout | BLOCKED — Jim decision | Approve or defer separately gated hosted production activation | [Issue #104](https://github.com/retailpulses/inbox/issues/104) · [PR #47](https://github.com/retailpulses/commerce-ops/pull/47) |
| P0 | Commerce Ops Phase 2 production-source cutover | BLOCKED — Jim action | Resolve the current production deployment/credential gate, then continue cutover evidence | [Issue #13](https://github.com/retailpulses/commerce-ops/issues/13) · [deployment run](https://github.com/retailpulses/commerce-ops/actions/runs/34752608872) |
| P1 | CatalogSync release retention / disk recurrence prevention | READY | Verify/implement the smallest safe release-retention fix; disk watcher itself is already complete | [Issue #106](https://github.com/retailpulses/inbox/issues/106) · [Watcher #107](https://github.com/retailpulses/inbox/issues/107) · [PR #108](https://github.com/retailpulses/inbox/pull/108) |

**Coordination:** [Portfolio MVP issue #116](https://github.com/retailpulses/inbox/issues/116) · [all Inbox issues](https://github.com/retailpulses/inbox/issues)

### How to use this page

1. Start here each day to see development work that is still open.
2. Open the linked canonical Issue / PR / workflow run.
3. Approve or comment there so the decision lands directly in GitHub history.
4. The next daily refresh removes completed work, updates changed work, and adds newly material WIP.

No execution-slot/WIP-limit model is required for this MVP. GitHub artifacts remain the detailed engineering source of truth; this page is only a concise daily coordination snapshot.

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
