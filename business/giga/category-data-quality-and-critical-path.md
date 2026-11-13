# Giga supplier category quality — canonical company rule and critical path

**State:** ACTIVE BUSINESS CONTROL / OPEN INVESTIGATION · 2026-11-13 JST  
**Canonical location:** `/.github/business/giga/`  
**Evidence snapshot:** [30 canonical Product conflicts](../mercari/taxonomy/giga-cross-category-product-conflicts-20261113.csv) and [full 111-category inventory](../mercari/taxonomy/giga-category-inventory-20261113.csv).  
**Related work:** [Mercari one-shot category mapping and quantified risks](../mercari/taxonomy/giga-virtual-subcategory-design-20261113.md), [standalone Shop4 listing feature #312](https://github.com/retailpulses/store-ops/issues/312), [Mercari business data PR #109](https://github.com/retailpulses/.github/pull/109).

## 1. Decision: supplier categories are untrusted observations, not Canonical Product truth

**Confirmed DQ defect signal:** The read-only 2026-11-13 Mac mini local Supabase snapshot has **6,309 active Canonical Variants with Giga category observations** (from **3,161 distinct Canonical Product IDs**) and **30 Product IDs that span two distinct supplier Category IDs**, containing **89 active Variants**. The conflict register identifies **11 cross-top-level-family conflicts (P0)** and **19 within-top-level-family conflicts (P1)**. For example, the same Canonical Product groups a patio-furniture Category with hard-case luggage, sofas with office desks, and youth furniture with outdoor sheds. An ordinary color/size variation does not explain these combinations without more evidence.

**Evidence scope:** `canonical_product.products.id` is the product-group identity used in this audit, not proof that the group is the supplier's true **SPU1**. Before assuming SPU1 equivalence, validate external SKU/SPU identity and the Canonical grouping decision lineage. **We have proven a cross-category consistency failure at the Canonical Product boundary, not yet which system introduced it.** Do not declare every row a Giga defect, nor assume Giga data is perfect.

**Business policy:**
1. Never treat Giga Category ID/name/path as automatically correct, complete, immutable, or semantically granular enough for a Mercari Category ID.
2. Preserve `raw_giga_category_code`, `raw_giga_category_path`, source SKU, observation timestamp and source run, without rewriting supplier values to conceal conflicts.
3. **Do not inherit a single category from Canonical Product to all Variants when the Product contains conflicting source categories.** Evaluate each Variant / source SKU based on independently verified product kind and explicit business classification. Do not silently merge or split Canonical Products.
4. Keep a company-controlled `virtual_subtype_key` and approved `mercari_category_id` as separate derived business facts. Use versioned rules and exception evidence. These do not mutate supplier category or product identity.
5. Never resolve a category contradiction by a universal fallback ID. A scoped fallback is permitted only when a known product **family** has been independently established and its actual fallback Category ID is in the version-pinned official Mercari Master.
6. For unresolved cross-family or false-merge suspicions, quarantine only the **affected SKU/row** for CSV generation; unaffected rows may continue. A batch must show the excluded SKU and reason in an error manifest, not silently omit or relabel it.
7. A previously marked `CONFIRMED` legacy NPL mapping is not authority to waive these checks. New standalone tooling must not rely on the NPL resolver.

## 2. Reconciled metrics and other supplier data coverage issues

| Signal | Read-only count | Implication |
| --- | ---: | --- |
| All active Canonical Variants | 6,464 | Operational product denominator |
| With category observation | 6,309 | 111 observed source Category IDs |
| Without category observation | 155 | 141 have a current Giga external SKU: source fact unavailable, not legitimately `Other` |
| Distinct Product groups among categorized Variants | 3,161 | Do not automatically equate with Giga SPU1 |
| Cross-category Product groups | **30** | **89** affected active Variants |
| Cross-top-level Giga families | **11 Product groups (P0)** | Strong category or identity conflict signal |
| Same top-level family, different Giga categories | **19 Product groups (P1)** | Still a DQ exception until verified |
| Old Giga registry vs observed supplier categories | 72 vs 111 | **39** observed codes absent from registry |
| Latest dedicated category observation | 2026-10-12 | Category facts are stale relative to Nov 13 Giga OpenAPI observations |
| One-shot virtual subtype regex overlap | 978 Variant titles | Rule overlap is not necessarily misclassification but must be tested |

These metrics are frozen observations, not a current supplier-side category audit. Category counts reflect each Variant's latest observed category only. Each per-category distinct Product count can overlap because one Product appears under two supplier categories.

## 3. Root cause classification: do not jump from symptom to supplier blame

For every Product in the 30-row register, compare **all member Variant IDs**, Giga SKU/optional supplier SPU keys, title/product kind, latest original Giga category evidence, Canonical grouping lineage, and timestamps. Classify:

- `SUPPLIER_CATEGORY_INCONSISTENCY`: same true supplier product family, inconsistent source categories across SKUs. Preserve raw values; create verified business classification without overwriting supplier data. Supplier report separately if warranted.
- `CANONICAL_FALSE_PRODUCT_GROUP`: unrelated supplier products erroneously grouped by Canonical identity resolution. Fix Canonical identity **only** in a separately reviewed, reversible migration/correction owned by the Canonical Product team. New listing mapping must not conceal identity corruption.
- `STALE_OR_WRONG_OBSERVATION_LINK`: source observation associated to the wrong SKU/Variant, or outdated category observation; correct observation pipeline and replay with evidence.
- `TRUE_MIXED_BUNDLE_OR_MULTI_TYPE`: supplier sells materially different types/sets under one product family; do **not** force a single category or assume automatically valid for Mercari listing.
- `UNDETERMINED`: insufficient evidence; remain quarantined per row and retain decision owner.

A status of `CLOSED_VERIFIED` requires concrete per-SKU evidence and a signed-off disposition; a business override is not a proof that upstream data is valid.

## 4. Critical path — unblock Shop4 without hiding systemic defects

| Gate | Owner | Deliverable | Exit condition |
| --- | --- | --- | --- |
| **CP0 — Freeze & contain (immediate)** | Mercari business / Product owner | 30-row immutable exception list; P0 11 / P1 19, mark 89 affected SKU candidates; category inheritance prohibition, source snapshot and read-only evidence | No Product-level category propagation or generic fallback on known conflicts; unaffected rows can proceed |
| **CP1 — Evidence & root-cause triage** | Canonical Product + Giga ingestion owner | For **all 30** Product IDs: each Variant/source SKU, source category history/latest, titles/images and product kind, Canonical identity/grouping lineage, outcome class and explicit owner | All 30 have evidence-backed root-cause/disposition or documented `UNDETERMINED` row exclusion; prioritize 11 cross-family P0, then 19 P1 |
| **CP2 — Independent business classification** | Mercari business owner | Approved 111-source mapping version, virtual subtype rules for mixed groups, item-/family-scoped fallback policy; official Master SHA pinned; 30 conflicts resolved or quarantined | **Zero unverified conflict groups silently mapped**, no invalid Category IDs, overlapping rule cohorts audited, all enabled fallbacks have exclusion criteria and approval |
| **CP3 — Standalone Listing CSV preflight** | Store-Ops #312 Product/implementation owner | Row-level `CATEGORY_SOURCE_CONFLICT`, `CATEGORY_UNKNOWN`, `UNVERIFIED_FALLBACK`, `SOURCE_CATEGORY_MISSING` states; resolution provenance, excluded-row manifest; no NPL dependency | CSV contains **only ready/verified rows**; all blocked rows visible; positive and negative replay of 30 conflict groups, including 11 P0 |
| **CP4 — Prevent recurrence (nonblocking follow-on)** | Canonical/Giga data owner | Audit on source refresh of category changes, conflict counts, new Giga codes, missing categories, false grouping; durable rules/incident update | New cross-family grouping conflicts flagged before downstream reuse; monitoring does not become a Shop4 listing dependency |

**Dependency order:** CP0 → CP1 evidence → CP2 *approved* dictionary → CP3 ready CSV. CP4 is follow-on, not a launch blocker. **CP1 root-cause repair/migration is NOT necessarily a prerequisite for unrelated Shop4 listings**: disputed SKUs are blocked/excluded individually. Source-side remediation (155 missing, 39 registry gap, 2026-10-12 freshness) runs in parallel and may contribute to CP1.

## 5. Required evidence schema for closing the 30 cases

`canonical_product_id, canonical_variant_id, giga_sku, external_spu_or_group_key_if_proven, raw_giga_category_code, raw_giga_category_path, observed_at, source_observation_id, product_title, product_kind_evidence, identity_resolution_evidence, root_cause_class, confidence, recommended_mercari_category_id, exception_disposition, reviewer, reviewed_at, issue_or_pr_ref`

All **raw** values retain provenance. A merged Product may not have one unambiguous category, even if a Category ID can be assigned to each SKU. The mapping release artifact stores `rule_id, category_master_sha, mapping_version, resolution_kind, selected_mercari_category_id, evidence, override_reason`.

## 6. Explicit non-actions

**Not approved by this finding:** reassigning Product IDs; splitting or merging Product/SPU1 groups; overwriting Giga Category values; bulk repair of Canonical DB; enabling fallback mappings; changing production resolver; automatically publishing Mercari listings. These require a separate, scoped change with rollback/verification.

**Definition of Done for this business DQ issue:** 30/30 case dispositions documented and cross-checked against actual source/identity evidence; 89 affected Variants tracked without silent inheritance; a reviewed Category mapping contract published (or per-row exclusions preserved); Shop4 CSV critical path not blocked by unrelated Giga and Canonical remediation.
