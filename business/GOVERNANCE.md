# Business Governance — Canonical Definitions & Knowledge
状态：Proposed · 2026-11-11

## Purpose and scope
`business/` is the organization-level discovery and governance home for **canonical business definitions** and **canonical business knowledge** used across products, stores, and operational workflows.

- **Definitions / contracts:** stable identities, calculations, terminology, invariants, marketplace rules and cross-product semantics. Assign stable `BUS-<domain>-NNN` IDs when referenced as a contract; never recycle IDs.
- **Knowledge / intelligence:** validated operational facts, historical observations, analyses, seasonality, marketplace/supplier behavior, playbooks and decision-relevant insights. Do **not** assign BUS IDs to every observation. Link to evidence and method.
- **Not in scope:** raw transaction datasets, customer PII, credentials, executable schemas, application-specific TRDs, runtime logs, and speculative recommendations presented as settled facts. Keep these in the owning systems and link where appropriate.

## Authority and provenance
- Source systems (e.g. Supabase orders, marketplace reports, supplier records) remain authoritative for **raw facts**. GitHub knowledge is a curated, versioned interpretation, not a replacement data store.
- External marketplace/supplier policies require official sources and verification dates; reference `references/` where applicable.
- Executable logic, schemas, tests and runtime evidence remain with implementation owners. Product Design/TRD references canonical definitions and knowledge without copying independent versions.
- Record owner, scope (platform/store/period), source and query/report reference, as-of date, methodology, exclusions, confidence/verification, and consumers. Do not include personal order/customer data in this repository.

## Knowledge lifecycle
Separate **evidence verification** from **business approval**:
- Evidence: `UNKNOWN` / `PARTIAL` / `VERIFIED`.
- Governance: `Draft` → `Sponsor Review` → `Approved` → `Superseded`.
- Claim type: `Observed Fact`, `Hypothesis`, `Approved Business Insight`, or `Decision`. A hypothesis is never an approved fact.
- Approval of a document does not prove that the data, calculation, or runtime implementation is verified. Record both statuses independently.
- Historical snapshots retain their original as-of dates. New evidence supersedes conclusions explicitly; do not silently rewrite prior decisions.

## Updating and revalidation
- Each knowledge topic has a **single current entrypoint** and a reproducible methodology. Prefer updating the same Markdown file with Git history rather than creating monthly scattered reports.
- Define review cadence or invalidation triggers (e.g. monthly order refresh, assortment change, source schema change, platform policy change); mark stale conclusions as requiring revalidation.
- For quantitative insights, disclose coverage, comparison periods, normalization, sample sizes, and confounders (assortment, inventory, campaigns, growth, incomplete months).
- Changes to definitions/formulas require a PR impact assessment covering Product Design, API, DB, tests, and migration if relevant. Knowledge updates require provenance and review; no runtime gate or automatic deployment is implied.
- Use Git Markdown and PR review; avoid a second knowledge database or mandatory manual approval platform.

## Example: Mercari sales seasonality
`business/mercari/sales-seasonality/README.md` can contain the current evidence-backed conclusions and recommendations; `methodology.md` holds SQL, product grouping and exclusions. Source of truth remains `public.sales_orders` in Supabase. Treat apparent monthly peaks as `Observed Fact`; seasonality causation remains `Hypothesis` until year/store/assortment-adjusted validation. Analyze Shop4 separately before making Shop4 decisions.

## Existing pilot and compatibility
Existing Pricing, Product Identity, Marketplace Category, Giga and Mercari definition IDs and approval states are unchanged by this proposal. Existing `business/README.md` remains the registry/discovery index and should include both definitions and knowledge. This governance revision itself requires review; it does not approve any underlying business insight.

See [Engineering Documentation Standard](../engineering/DOCUMENTATION_STANDARD.md) and [Foundational References](../references/README.md).
