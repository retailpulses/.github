# Retailpulses

Japan-based ecommerce operations and software. This is the organization front door: start with the repos used most often, then use the development-control links to see what is currently moving or needs a decision.

## Most Used

| Repo | Role | Go here for... |
|---|---|---|
| [inbox](https://github.com/retailpulses/inbox) | Cross-repo coordination + portfolio | New/unclear work, investigations, handovers, knowledge, cross-repo decisions |
| [commerce-ops](https://github.com/retailpulses/commerce-ops) | Canonical operator-app source | Ops Portal, Inquiry, Orders/Tickets consolidation, shared commerce runtime work |
| [CatalogSync](https://github.com/retailpulses/CatalogSync) | Catalog + marketplace sync | Inventory, availability, marketplace state, synchronization |
| [RPagentOS](https://github.com/retailpulses/RPagentOS) | Agent-driven ecommerce operations | Operational loops, agent-owned ecommerce work, listing intelligence |
| [boutique-listing](https://github.com/retailpulses/boutique-listing) | Listing tooling | Listing creation/editing/publishing workflows |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit) | Engineering governance | Architecture standards, runtime/workload governance, engineering policy |

## Development Control

Use this layer when managing several development threads rather than working inside one repo.

| Surface | Purpose |
|---|---|
| [Development Portfolio](https://github.com/retailpulses/inbox/issues/116) | Canonical POC and portfolio-control decisions |
| [Portfolio state](https://github.com/retailpulses/inbox/blob/main/agents/portfolio-manager/portfolio.json) | Machine-readable WIP projection for Portfolio Manager and execution agents |
| [Development Dashboard](https://ops.homesbliss.net/development) | Live 3+3 execution slots, Needs Jim, stalled/almost-done work, and later bounded Jim feedback |
| [Inbox issues](https://github.com/retailpulses/inbox/issues) | Organization-level work queue and durable cross-repo artifacts |

**Operating model:** GitHub Issues/PRs/docs remain the detailed engineering truth. `inbox` holds portfolio-level state and cross-repo decisions. The Development Dashboard is a projection/control surface, not another task database.

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

> Keep this page low-maintenance: navigation and control entry points belong here; detailed status and documentation belong in their canonical artifacts.
