# Findy Architecture Conference 2026 — Reference and Retailpulses Architecture Reflections

Status: Reference / Discussion notes (not an adopted policy or implementation approval)
Recorded: 2026-11-19
Event: Findy Architecture Conference 2026 (scheduled 2026-11-26–27)
Source: https://architecture-con.findy-tools.io/2026
Evidence limitation: Pre-event agenda and speaker/session descriptions; no claim that sessions have already been delivered.

## Why this reference matters

For a small team building and operating multiple ecommerce systems with AI-assisted development, the main challenge is not code generation throughput. It is maintaining correct business ownership, recoverable workflows, understandable architecture, and enforceable constraints as development accelerates.

## Relevant themes and evaluation

1. **Domain-Driven Design (DDD) / bounded contexts** — Model business identity and state ownership explicitly. Product, marketplace Listing, Inventory, Order, Ticket and Accounting are related but distinct concepts. Avoid turning DDD into excessive classes, layers or frameworks.
2. **Evolutionary architecture / refactoring** — Prefer incremental, testable evolution over speculative redesign. Preserve runtime and data ownership boundaries while allowing internal implementation to change.
3. **AI-assisted development with executable constraints (AI-DLC)** — Agent instructions and Markdown architecture docs are necessary but insufficient. Express critical invariants in types, contracts, schema validation, CI checks and regression tests.
4. **Modular monolith / minimal infrastructure** — A coherent core and deliberately constrained stack often outperform premature microservices for a small team. Do not introduce Kafka or new service layers merely to follow conference trends.
5. **C4 architecture communication** — Context and Container diagrams can expose system integrations, canonical writers, runtime dependencies, failure domains and recovery paths. Link canonical per-repository architecture documents; do not create a competing SSOT.
6. **Event-driven design and auditability** — Useful selectively for reconciliation, state changes and operational traceability. An immutable audit log plus current-state tables may be simpler than full Event Sourcing.
7. **Agent autonomy with bounded authority** — Agents can implement and validate work within explicit contracts, but cross-domain writes, irreversible changes and production verification need defined boundaries.

## Retailpulses baseline (existing sources, not new decisions)

- Central architecture change governance: [docs/ARCHITECTURE_CHANGE_GOVERNANCE.md](../ARCHITECTURE_CHANGE_GOVERNANCE.md). Architecture changes require bounded phases and ADR/decision-log records.
- CatalogSync architecture: https://github.com/retailpulses/CatalogSync/blob/main/docs/01_ARCHITECTURE.md. Invariants include one canonical writer per responsibility, governed marketplace projections/contracts, explicit SKU/variant identity and no guessed ambiguous mapping.
- Commerce OPS cross-domain contracts: https://github.com/retailpulses/commerce-ops/blob/main/docs/CROSS_DOMAIN_CONTRACTS.md. Shared UI does not confer cross-domain write authority; idempotency, unknown-result handling, readback and rollback boundaries remain domain-specific.
- Commerce OPS agent guidance: https://github.com/retailpulses/commerce-ops/blob/main/AGENTS.md. Repository boundaries are not business-domain boundaries.
- commerce-lab remote execution guidance: https://github.com/retailpulses/commerce-lab/blob/main/services/canonical-lab/docs/REMOTE_EXECUTION.md. Delegated tasks already specify domain, ownership, constraints, deliverables, acceptance criteria and stop conditions.

## Case study: Shop4 relisting and inventory synchronization

Recent bulk changes to 300+ old listings raised mapping and inventory-sync questions. The design lesson is to distinguish Listing identity reconciliation from Inventory reconciliation and prevent a single invalid mapping from unnecessarily blocking valid stock updates for the rest of a store.

Proposed target behavior, **not a statement of current implementation**:
- Explicitly detect changed/invalid Listing–SKU mappings; never silently guess identity.
- Separate listing synchronization and inventory synchronization as distinct workflows with independent failure reporting.
- Quarantine row-level mapping exceptions, provide an auditable CSV review/fix path, and continue safe independent updates.
- Reconcile marketplace readback against intended inventory and provide retry/recovery mechanisms.
- Define acceptance tests for partial failures, duplicate operations, unknown results, and recovery.

Existing sprint/issue ownership should be checked before creating additional work; this reference does not supersede active Shop4 patch decisions.

## Candidate follow-up improvements (proposals, not approved tasks)

### P1 — Architecture invariants as code
Select 5–10 critical invariants each from CatalogSync and Commerce OPS; implement executable contract or CI tests. Success: known violations fail reliably in CI, with a clear owner and actionable message.

### P2 — System context and ownership map
Maintain lightweight C4 Context/Container views linking canonical architecture docs. Success: an agent can locate the owner, permitted writer, data flow, failure boundary and recovery path for critical state.

### P3 — Agent development contract refinement
Extend existing issue/PR acceptance criteria to distinguish business correctness, architecture compliance, regression evidence and production-only verification. Avoid adding redundant approval roles. Success: each agent change exposes what was automatically validated and what remains unverified.

## Anti-patterns to avoid

- Premature microservice decomposition or distributed infrastructure.
- Full Event Sourcing without an evidenced need.
- Treating natural-language AGENTS.md guidance as proof of compliance.
- Autonomous cross-domain or production changes without bounded authority.
- Duplicating canonical architecture SSOT in conference notes or central governance.

## Conference follow-up / evidence

Priority sessions to revisit after the event: Martin Fowler and Vlad Khononov on architecture and DDD; AWS AI-DLC v2 and domain boundaries; Base44's constrained-stack AI-assisted development; Simon Brown on C4; large-scale architecture evolution case studies.

Post-event task, if useful: compare actual slides/recordings with the preliminary descriptions, revise these notes, and only then propose specific changes through existing repository Issue/ADR governance.

## Decision state

Fact: Existing governance and architecture contracts already cover significant parts of these themes.
Assessment: The highest incremental value is executable invariants and recovery-oriented workflow design, not a new platform.
Decision: None recorded by this reference.
Open question: Which existing issues already cover the three candidate improvements?
