# Giga → Mercari Category Dictionary and Fallback Contract

**Status: DESIGN REVIEW — official category source snapshot structurally verified; no Giga mapping rules approved yet.** Owner: Mercari Store Operations; consumers: standalone Giga→Mercari Web app (#312), future clients by explicit contract. Not an NPL resolver migration.

## Decision and business purpose
For the standalone application, **do not use the existing NPL Category Resolver**. Create a one-time, verified mapping of Giga supplier categories / product-kind qualifiers to actual current Mercari `カテゴリID`, and persist the approved deterministic dictionary here as canonical company business knowledge. Follow with incremental exception review, not ongoing per-item human approval. Never confuse official `catalog_id` with Mercari `カテゴリID`.

## Three distinct inputs
1. Official `catalog_master.csv` lists 7,646 product catalog identities across 15 mostly-electronics category *labels*. It is not an ID taxonomy.
2. Official `category_master_updated.csv` is a **separately downloaded** source of actual Mercari Category IDs; **now provided and structurally verified:** 7,625 distinct category IDs and complete paths; user-supplied source SHA-256 `30f1c9dc3ee2f2133fe568e28213a392b54e7a5254f72bc2f552f6321895e4ac`; original bytes are now committed in `masters/categories/20261113-30f1c9dc/category_master.csv` and official live-byte comparison has PASSED. Exact identity, hierarchy, eligibility and versions must be checked from bytes.
3. Giga downloaded XLSX supplier categories and product facts are *source taxonomy*, not Mercari taxonomy.

## Proposed records

**Approved dictionary (giga-category-map.v1.csv)**
`rule_id,source_system,giga_category_id,giga_category_path,product_kind_qualifier,include_terms,exclude_terms,mercari_category_id,mercari_category_path,master_sha256,priority,approval_status,approval_evidence,approved_at_jst,rule_version`.

Prefer exact Giga stable category ID + path when present, rather than display name alone. Multiple Giga categories may map to one Mercari ID; a single supplier category may require distinct product-kind-specific rules, such as sofa vs sofa bed. Qualifiers only from verifiable source facts. Rules must not overlap ambiguously; exact qualified rules outrank generic ones. Normalize Japanese whitespace/synonyms for *matching*, never alter Mercari ID bytes/case.

**Fallback rules (fallback-category-policy.v1.csv)**
`fallback_rule_id,giga_category_prefix_or_family,product_kind_filter,excluded_terms,mercari_category_id,category_master_sha256,approved_scope,enabled,review_evidence,approved_at_jst`.

Fallback must be **scoped to a semantically suitable supplier family/type**, validated as an active allowed Mercari category ID. It must not be a single global Shop4 ID applied to furniture/pet/garden/electronics indiscriminately. If Sponsor wants a single fallback, restrict to a demonstrably homogeneous explicit batch scope and show every affected row before export; never invent an ID. Unknown category remains a row-level exception, not automatically incorrect listing.

## Deterministic one-shot mapping strategy
1. Freeze the **already uploaded and verified Category Master** (7,625 IDs, UTF-8 despite filename) under `masters/categories/20261113-30f1c9dc/`; manifest and raw bytes are committed in GitHub. Independently verify against official current downloadable source and review official eligibility semantics before treating as current.
2. From the Giga XLSX/source category inventory, enumerate distinct Giga category IDs/paths and item counts. Prefer **all available historical Giga category labels** if source inventory is accessible; otherwise label the one-shot dictionary as explicitly scoped to supplied file, not global. Generate candidate Mercari leaf categories by Japanese name/path and product facts; do not automatically approve suggestions based on similarity alone.
3. Review candidate mappings **once per category rule**, with representative product samples, contradiction cases and approval record. Product-kind-specific split rules for heterogeneous categories. Do not require per-SKU routine approval.
4. Save approved versioned dictionary + evidence in /.github; pin official master SHA and mapping version; fail preflight on invalid/retired category ID.
5. On new Giga category: (a) exact approved rule; (b) more-specific qualified rule; (c) scoped approved fallback; (d) row-level CATEGORY_UNRESOLVED if none. Treat fallback as an explicit applied decision, visible in review/export manifest.
6. Maintain an exception queue by Giga category and volume. Batch approve new rule PRs to /.github; regenerate relevant exports only after version updates. Do not silently mutate effective export snapshots.

## Resolution pseudocode
```text
resolve(giga_category, facts, shop, pinned_master, pinned_rules):
  assert master and rules validated
  exact = matching_approved_specific_rules(giga_category, facts)
  if unique(exact): return MAPPED(exact.category_id, evidence)
  if conflicting(exact): return BLOCKED(AMBIGUOUS_MAPPING)
  broad = matching_approved_general_rules(giga_category, facts)
  if unique(broad): return MAPPED(broad.category_id, evidence)
  if conflicting(broad): return BLOCKED(AMBIGUOUS_MAPPING)
  fallback = matching_approved_scoped_fallback(giga_category, facts, shop)
  if unique(fallback) and applicable_to_product(fallback, facts):
     return FALLBACK_APPLIED(fallback.category_id, evidence)
  return BLOCKED(CATEGORY_UNRESOLVED)
```

Every ID must be present and eligible in the pinned official Category Master. An exact mapping and fallback are not interchangeable confidence states. Unknown NPL identity must not block dictionary lookup.

## Acceptance measures
- All actual Category IDs validated against official Category Master; `catalog_id` never copied into `カテゴリID`.
- Complete mapping inventory: number of distinct Giga categories; item-count coverage; exact/qualified/fallback/unresolved shares; ambiguity count; current master version. Publish denominators and data dates.
- Test at least 30–50 representative items across high-volume and borderline categories (same supplier category but differing product kinds); record false-category examples and correct them at rule level.
- Valid standalone export continues without NPL Category Resolver; changing a dictionary version does not retroactively rewrite a published batch.
- A mapped category that becomes stale/retired blocks fresh CREATE CSV until re-validated.
- Fallback exceptions remain measurable and should decline as dictionary coverage improves. No arbitrary universal category ID.

## Governance and ownership
Company business dictionary + official source manifest are owned by `/.github/business/mercari`; standalone application only consumes released version and records applied evidence. Changes via reviewable GitHub PR and tests, with protected historical versions and rollback. Different business meaning across source and marketplace is explicit. Parent Commerce Catalog & Listing may read this approved company mapping in future but is not a precondition or a writer. Existing #306/#307 remain their own scopes.

References: [Official Mercari CSV guide](https://support.mercari-shops.com/hc/ja/articles/8859698858649), [Master registry](../masters/README.md), [Standalone issue #312](https://github.com/retailpulses/store-ops/issues/312).

## 2026-11-13 source verification and first Giga sample

Input `ProductsInfo_All 20261112(1).xlsx`: 32 product rows representing **14 distinct supplier category paths** (one row is `Part`, requiring independent identification). This supports generating a pilot mapping of exact source paths and optional product-kind rules. The uploaded official category source has 7,625 uniquely identified paths. Example eligible candidate IDs from raw byte lookup include sofa bed `fv7NAWJqfaqqh7GsP7q2dN`, floor jack `br6qGALYUhkjvTNDkgBzqK`, single bed frame `UcGCFjG5rAdrqMM88NdkN9`, and loft bed `TH4acvDBAupdG2TnrVGVuC`. **These are real IDs in supplied master but are not yet approved business mapping rules.** Categories such as `Furniture>>Primary Living Space>>Sofas` mix sofa bed and sofa so a generic one-to-one path mapping would be materially inaccurate. A tool cabinet category also cannot simply assume an exact `工具キャビネット` leaf, which does not appear under that name in uploaded master.

A one-shot categorization pass must combine supplier category + product title/facts, assign confidence/error class, produce proposed distinct category rules and fallback cohorts, then test all 32 records before approving a dictionary. Do not apply single broad fallback to mixed products.

## Evidence-backed one-shot candidate outputs (2026-11-13)

[Local Giga census](giga-category-audit-20261113.md) establishes 111 source categories and 6,309 active categorized Variants (155 with no category observation). [Candidate base mappings](giga-category-mapping-candidates-20261113.csv) cover all 111 codes; [virtual subtype candidate mappings](giga-virtual-subtype-candidates-20261113.csv) contain 52 prioritized pattern rules in 14 heterogeneous categories; [11 scoped fallback options](giga-scoped-fallback-candidates-20261113.csv) are all **disabled**. See [quantitative rule-quality review](giga-virtual-subcategory-design-20261113.md), including 978 overlapping subtype matches. These are NOT approved canonical operational mapping release files; an explicit review/approval gate remains.

## Critical data-quality rule — 30 cross-category Canonical Products (2026-11-13)

**Canonical business ownership:** [Giga data-quality decision and critical path](../../giga/category-data-quality-and-critical-path.md) and [DQ control Issue #110](https://github.com/retailpulses/.github/issues/110); [30-ID, 89-Variant exception register](giga-cross-category-product-conflicts-20261113.csv). Of the 30 Product IDs assigned more than one Giga Category ID, 11 cross supplier top-level families and 19 are different within a family. Root cause is not yet proven to be Giga misclassification, faulty Canonical grouping, or stale observations. Product identity is **not assumed equivalent to Giga SPU1**.

**Mandatory policy correction:** Giga `category_code/category_path` is *untrusted source observation*, never a Category truth simply because it is attached to a Giga SKU. **Do not automatically inherit a Product-level category to every Variant**, including when a source category appears coherent. For any known conflicting Product group, per-SKU verified item kind (title/spec/identity lineage) must determine category or the affected row remains blocked. Store raw Giga observations independently of derived `virtual_subtype_key`, approved Mercari `カテゴリID`, and override evidence; never rewrite raw supplier fields as a shortcut.

Treat `CATEGORY_SOURCE_CONFLICT` as an explicit error state. A scoped fallback is valid **only if actual product family is independently verified**; it is not an allowed way to suppress cross-family conflict. `CATALOG_READY` or Mercari CSV export is prohibited for an affected SKU with unverified category selection, but unrelated valid Shop4 rows proceed. Evidence audit and exception dispositions are tracked in Issue #110; product grouping repairs, if required, stay in the Canonical identity owner workstream.
