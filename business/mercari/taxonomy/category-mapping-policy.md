# Giga → Mercari Category Dictionary and Fallback Contract

**Status: candidate mapping baseline; suitcase category rule explicitly approved on 2026-11-17 (see current amendment below). Other candidates retain their existing review state.** Owner: Mercari Store Operations; consumers: standalone Giga→Mercari Web app (#312), future clients by explicit contract. Not an NPL resolver migration.

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


## Canonical one-to-many candidate set v1.1 (2026-11-16)

The current artifact is [giga-to-mercari-category-map-v1.csv](giga-to-mercari-category-map-v1.csv). Its key is the exact Giga source category code: every candidate relation carries a `candidate_set_id=GIGA:<code>`; a Mercari ID may be repeated across Giga codes only when the evidence independently supports that relation. No universal `その他` ID is permitted.

**Coverage correction:** v1 originally contained 74 candidate relations (75 physical CSV rows including the header), covering only 46/111 Giga category codes. It was therefore a partial candidate extract, not an exclusive complete mapping. v1.1 adds the Mattress category (Giga 10754): 21 exact Mercari mattress leaves (3 mattress constructions × 7 sizes), plus the scoped `家具・インテリア > ベッド・マットレス > その他` candidate. The literal leaf-name lookup failed because Mercari encodes mattress subtypes and sizes below `マットレス`, not a leaf named `マットレス`.

**Current status:** the file now has 75 candidate relations for 47 candidate sets. It still does not cover all 111 Giga category codes. Do not describe or use it as the complete canonical mapping until every code in the inventory has an explicit, source-specific candidate set and a documented applicability basis. Missing category coverage is a release-blocking dictionary gap, not permission to use a global fallback.

**Agent selection contract:** first resolve the exact Giga code; only consider Mercari IDs under that code's candidate set. For Mattress, use the specific type-and-size leaf only where product facts support both; use the scoped mattress `その他` only if mattress family is certain and no specific leaf can be supported. Otherwise return `UNRESOLVED` / `REVIEW_REQUIRED`. Candidate rows remain `PROPOSED_NOT_BUSINESS_APPROVED`; they do not authorize CSV export or Seller writes.

**Reproduction:** fetch the pinned 2026-11-13 Category Master (SHA-256 `30f1c9dc3ee2f2133fe568e28213a392b54e7a5254f72bc2f552f6321895e4ac`), select rows whose full path begins `家具・インテリア > ベッド・マットレス > マットレス >` and whose next path segment is one of `エアーマットレス・エアーベッド`, `スプリングマットレス`, or `ノンスプリングマットレス`; retain exact IDs and paths and sort by type, size, then ID. Add the `家具・インテリア > ベッド・マットレス > その他` row only as a scoped fallback candidate. The earlier 74 relations remain reproducible from the source candidate files as described in Git history; the v1.1 mattress rows are derived directly from the pinned master.


## 2026-11-16 expansion audit: 107/111, four hard blockers (not approved)

This is an **evidence-constrained candidate proposal**, not an approved deterministic dictionary. The canonical `giga-to-mercari-category-map-v1.csv` has 184 candidate relations for 107 of the 111 Giga codes. Four codes are intentionally **uncovered** rather than assigned unrelated `その他` IDs. No listing export, CSV upload, or Seller write is authorized. The original 21 mattress type/size leaves and its bed/mattress-scoped Other remain intact.

### Hard blockers (do not invent a mapping)

| Giga code | Source category | Exact blocker / unblock evidence |
| --- | --- | --- |
| 10817 | Garden & Outdoor > Accessories | Category is accessory-only and heterogeneous. Need item title/spec/product-kind inventory grouped by actual accessory family, then match a relevant Mercari leaf in the pinned master. |
| 10749 | Household Supplies & Décor > Accessories | Unqualified accessories spanning multiple household branches. Need observed item types and corresponding exact master branches. |
| 10832 | Other | Giga path is literally `Other`; no semantic family. Need representative product facts and a narrower supplier classification or explicit reviewed per-item exceptions; cannot use a global Other. |
| 10835 | Tools & Tool Organizers > Ventilation Fans | No matching ventilation-fan product leaf found in pinned master. `換気口` is an air vent (not a fan); `換気扇カバー・フィルター` is a cover/filter (not the fan). Need actual model/spec and Mercari-supported product category evidence before proposing a scoped alternative. |

### Reproduction and audit method

1. Freeze source inventory `giga-category-inventory-20261113.csv` and official `masters/categories/20261113-30f1c9dc/category_master.csv` (snapshot `20261113-30f1c9dc`, SHA-256 `30f1c9dc3ee2f2133fe568e28213a392b54e7a5254f72bc2f552f6321895e4ac`). Read the direct, virtual subtype and scoped fallback candidate files from this PR; do not regenerate from the current live Mercari taxonomy without a version change.
2. Key every relation by `(giga_category_code, mercari_category_id)`; store `candidate_set_id=GIGA:<code>`. Resolve IDs **from the pinned master full-path column**, not from catalog IDs, labels, or fuzzy name alone. Preserve the exact master full path, snapshot ID, and SHA-256 on each row.
3. For previously uncovered categories, start from the Giga full path and category meaning, identify a narrowly scoped Mercari branch, and enumerate only semantically plausible product-kind leaves. Where Giga meaning is heterogeneous, record several candidate leaves and require later item-level title/spec/image verification. A broad branch `その他` is only a *proposed* candidate when the source category is known to belong to that exact branch and no specific leaf is supported. A parent or unrelated Other is never a coverage shortcut.
4. The new candidate rows cite the pinned inventory, pinned master, and source-category semantic proposal in `source_evidence`. **This is category-level evidence only, not observed per-item title coverage.** `selector_hint_hit_count` is intentionally blank where not measured. The later agent must verify facts before selecting; if the facts do not distinguish a unique candidate, return `UNRESOLVED / REVIEW_REQUIRED`. In particular, gendered luggage/backpack branches, multi-item furniture sets, broad exercise/outdoor categories, and all Other proposals require review; a source category label alone is insufficient.
5. Stable sort by numeric Giga code, then exact Mercari ID; deduplicate by `(Giga code, Mercari ID)`. Retain distinct Giga-to-ID relationships even when Mercari IDs recur across Giga codes, provided each has its own source-specific basis. Preserve original mattress candidate evidence.
6. Validate that the inventory has 111 unique codes; every candidate's ID exists in the pinned master and its full path is byte-for-byte identical; candidate set ID equals `GIGA:<code>`; status equals `PROPOSED_NOT_BUSINESS_APPROVED`; there are no duplicate relations; scoped Other paths have a matching source-family basis; enumerate uncovered codes and per-code counts. **Do not report 111/111 while any of the four blockers remains.**

### Quality caveats requiring review

Some expanded candidates use source-category semantics plus exact official taxonomy paths rather than title-level product-kind evidence. In particular, Giga 10766 Kitchen Sinks has a garden-sink candidate, 10702 Massage Tables uses a broad massage Other, 10694 Dining and Kitchen Sets spans table and chair leaves, and 10795 commercial display refrigeration uses a showroom/showcase leaf. These are **not confirmed interchangeable item categories** and must be rejected or refined before business approval. The canonical CSV is a proposal inventory, not a safe auto-export allowlist.



## 2026-11-16 approved scoped-Other candidate follow-up (supersedes prior four uncovered blockers)

User approved three scoped Other proposals, and requested a *most plausible* fourth provisional candidate. Canonical CSV now has **188 candidate relations / 111 of 111 Giga codes**; **0 uncovered Giga codes**. This is **structural coverage only**, not verified per-item accuracy, nor business approval of all 188 relations. Earlier section documenting four uncovered codes remains as historical audit evidence, superseded by this dated update.

| Giga | Mercari ID | Pinned master full path | Decision / eligibility |
| --- | --- | --- | --- |
| 10817 | `CBtfuJn7pMEb3QkkkYbvdY` | `フラワー・ガーデニング > 園芸用品 > その他` | User-approved proposed garden-accessory scoped Other; only if actual item belongs to garden supplies |
| 10749 | `mw5xhvbY4GZ6HLeaAxmuCA` | `家具・インテリア > インテリア小物 > その他` | User-approved proposed interior-decoration-accessory scoped Other; not a general household catchall |
| 10835 | `DkjqZAKBXaZN8FB2Kb6zhX` | `DIY・工具 > 住宅設備 > その他` | User-approved proposed building-equipment scoped Other for ventilation fans; reject if actual item is not residential equipment |
| 10832 | `mw5xhvbY4GZ6HLeaAxmuCA` | `家具・インテリア > インテリア小物 > その他` | **LOW-CONFIDENCE HEURISTIC ONLY**. Giga source path is `Other`; no evidence that its 11 distinct products are interior items. This is a provisional review candidate, **never** a safe default or auto-selection |

**Important:** A user's approval to record a scoped Other proposal does not change `candidate_status=PROPOSED_NOT_BUSINESS_APPROVED`. Every candidate must be validated against the actual product title/specifications before selection. For 10832, obtain the 11 distinct canonical products and determine actual branches; if none are home-interior accessories, delete or replace its provisional relation. No Giga-only deterministic auto-selection for 10832 is allowed.

Validation: parse the canonical CSV, require 111 unique source codes and 188 unique `(giga_category_code,mercari_category_id)` keys, and verify each candidate ID/full path against the pinned master. Do not merge or deploy before item-level QA.


## Execution contract: deterministic 1-to-1 first; agent 1-to-N second (2026-11-16)

**Source of truth:** `business/mercari/taxonomy/giga-to-mercari-category-map-v1.csv` at a pinned commit, with the pinned Mercari Category Master. Never infer a Mercari ID outside the candidate set. This document and CSV supersede draft category-resolver mapping lists; preserve historical artifacts as read-only evidence rather than treating them as parallel authorities.

**Stage 0 — Validate and load (fail closed):** Parse CSV by header, verify all ID/path pairs against the pinned master, ensure unique `(giga_category_code, mercari_category_id)`, require a matching source code, require `PROPOSED_NOT_BUSINESS_APPROVED` to be treated as *candidate only*, and reject missing/duplicate/invalid mappings. Normalize only explicit source Giga codes, never fuzzy-match Giga category names. Cache the mapping by version and SHA; log provenance.

**Stage 1 — Code resolver for 1-to-1:** Group by `giga_category_code`. Where the set has exactly one eligible candidate, return `DETERMINISTIC_CANDIDATE` with `mercari_category_id`, exact full path, mapping version, and evidence; this is a deterministic *candidate selection*, **not permission to publish**. If the only candidate is a scoped `その他`, verify its stated product-kind/branch guard first; otherwise return `REVIEW_REQUIRED`. A 1-to-1 row with an explicit semantic-quality caveat also remains review-required until reviewed. Never silently fall back to any Other.

**Stage 2 — Agent resolver for 1-to-N:** For multiple eligible candidates, give the agent the actual product title, specifications, source Giga code/path, and **only that code's canonical candidate rows**, including exact ID/path and constraints. Agent returns structured `{status,mercari_category_id,reason,evidence,confidence,mapping_version}`. Accept a selection only if ID is in the supplied set, facts support the branch/subtype, and confidence meets the configured review threshold. Otherwise return `UNRESOLVED` or `REVIEW_REQUIRED`; never hallucinate a new ID or widen the candidate set. Prefer specific leaves to scoped Other when evidence supports them.

**Special guard:** Giga `10832` is a generic `Other` category with 11 distinct products. Its single provisional interior-item `その他` candidate is **not eligible for Stage 1**: always send it to item-level review/agent, and reject when actual facts are not interior items. Likewise, `10835` residential-ventilation `その他` must not be used for a different fan type. Giga `10817` and `10749` require garden/interior-family verification respectively.

**Stage 3 — QA before release:** Run on a fixed, representative sample per Giga code (Shop4 first). Log `item_code`, source code, candidate set size, resolver stage, selected ID/path, confidence, evidence, review outcome, and unresolved reason. Compute 1-to-1 deterministic coverage, 1-to-N agent accuracy against human labels, scoped-Other frequency, false-positive rate, and unresolved rate. No production CSV changes until a separate approval/release gate. Keep mapping fixes in the canonical CSV via a reviewed PR, not in prompts or application-specific shadow maps.

**WIP cleanup:** Close only PRs proven to be superseded by the canonical map; leave unrelated feature PRs intact. On each superseded PR, record its replacement path, PR #109, and whether any unique facts need migration. Delete no branches or evidence files as part of this cleanup. New implementation work should be a separate scoped issue/PR; avoid re-opening multiple competing taxonomy-map drafts.


## Approved suitcase rule — 2026-11-17 (current amendment)

**Rule ID: SUITCASE_CATEGORY_20261117. Business owner: Jim. Status: APPROVED CATEGORY SELECTION RULE; no Seller publication authorization.** [User decision and evidence](https://github.com/retailpulses/.github/issues/133#issuecomment-6935845955). This amendment supersedes earlier requirements to infer gender or abstain for an unspecified-gender suitcase. It does not approve unrelated category candidates.

All actual travel suitcases — hard or soft, men's, women's, unisex, or gender unspecified — use exactly **`5iWsn24UMbPf3MMMYBLhyT` = `ファッション > レディース > バッグ > キャリーケース`**. The レディース path is the approved operational destination, not a claim about the buyer's gender. Color, size and marketing gender do not change this selection. Do not select the men's suitcase leaf `oaRD8SorG7tSgWWrME7Nz5` for these products.

The existing canonical CSV is updated in place: **Giga 10829 Soft Case Luggage and 10830 Hard Case Luggage each have the single approved suitcase destination**, with explicit product-kind guards and approval evidence. The CSV now contains **186 candidate relations covering all 111 Giga codes** (two alternative men's relations removed; all other relations unchanged). Historical 188-relation counts above describe prior snapshots.

Apply the rule only after the title establishes an actual suitcase. A tote bag, backpack, pet carrier, carrier wagon, hand truck, cover or replacement part is not a suitcase merely because of a supplier category or an ambiguous キャリー keyword. If such a product is under 10829/10830, retain its title-based exception. If a genuine suitcase appears under a different source code, the approved destination is still this ID; record a `CANDIDATE_MAPPING_GAP` until the relevant code-specific relation is reviewed and added. Never use this rule as a global non-suitcase fallback.

**Approval compatibility:** `candidate_status=PROPOSED_NOT_BUSINESS_APPROVED` is retained in the existing CSV schema to avoid changing consumer enums or implying row/batch publication approval. For the two suitcase relations, the semantic category-rule approval is explicitly carried in `candidate_basis`, `source_evidence`, and this section; the old status value must not be interpreted as an unresolved gender decision. Review-sheet `approval_status` remains `NOT_APPROVED` until the separate listing/batch approval step. No upload-ready CSV, Seller writes, production data mutation, resolver deployment or automatic approvals are authorized by this amendment.

Validation: verify all 186 ID/path pairs against the pinned 7,625-ID master (SHA-256 `30f1c9dc3ee2f2133fe568e28213a392b54e7a5254f72bc2f552f6321895e4ac`), unique source-code/ID keys, 111-code coverage, exactly one suitcase candidate for each of 10829/10830, and unchanged non-suitcase relations. Shop4 application: identify actual suitcase titles independently of current category and supplier label, update the 295 suitcase decisions, rebuild filtered tabs/summary, and reconcile all 2,480 listing IDs. Keep the mis-bucketed 10829 tote-bag title in human review.


## Shop4 observed-catalog completeness review — 2026-11-17 (draft enrichment)

See the [complete 513-row gap audit and 107-relation disposition](shop4-candidate-gap-audit-20261117.md). **111/111 source-code coverage is structural coverage, not full title-described product coverage.** Release acceptance must also reconcile the complete current catalog against applicable product-kind candidates and explicit genuine exceptions; do not claim semantic completeness from source-code coverage alone.

The linked draft proposes 82 title-grounded candidate relations for 430 observed gap records (186 → 268 candidate relations on this branch), while 15 relation groups / 66 records need semantic recheck and 10 relation groups / 17 records show source-code/title mismatches. These are audit triage counts, not calibrated accuracy or proven root-cause statistics. All 107 groups / 513 records have an explicit disposition. Existing candidate rows and approved suitcase rule are unchanged; this proposal is not a production release and does not mark any review-sheet gap resolved.

Before adopting the enrichment, correct false gaps and over-specific assertions (e.g. unspecified folding bed → slat bed), review legitimate sibling leaves and product-kind guards, and retain source conflicts without creating an unrestricted fallback. Re-run all-catalog validation and targeted title-only QA before updating final workflow statuses. No description/image/SPOE requirement or product-family decision registry is introduced. The current review workbook remains the listing-decision authority; the audit is evidence, not a parallel mapping.


## User-defined completeness baseline — full Shop4 product CSV (2026-11-17)

**Accepted business standard:** the actual products in [shop4 product_data_2026-11-16.csv](https://drive.google.com/file/d/1YScThDIlJD_kbbMTGLjopjkkAC4Qb2ma/view) should almost all have a stable, semantically suitable Mercari category. This replaces any interpretation that source-code coverage, adding a fixed count of relations, or merely labelling every exception proves completion. The user did not specify a numeric target; do not invent one.

The complete raw CSV was downloaded and parsed for this clarification: **2,480 records / 2,480 unique Listing IDs**, **9,027,343 bytes**, SHA-256 **`08472984ae79dbd37cd02509b829339c41c466bf09e7b4226b9ba0ac8a01122c`**. All Listing IDs and product titles exactly match the existing full-review input: **0 missing, 0 extra, 0 title differences**. Classification remains title-only; descriptions and images are not classification inputs. This is the whole-product acceptance corpus, not only the 513 currently flagged gaps.

Acceptance requirements:

1. **Use the whole corpus as denominator:** stable title-supported category count / 2,480, plus separately enumerated remaining ambiguities, mapping gaps and source problems. Review all previous NO_CHANGE/READY rows as well as exceptions. Never count a source-conflict label or a mapping-gap label as successful classification.
2. **Stable product meaning → stable Category ID:** resolve actual primary product from its title against approved canonical applicability rules and exact official full paths. The same unchanged product title under the same approved rules should not alternate categories because of gender guesses, synonym/SEO terms, a different source bucket, or a model refresh. Preserve approved choices such as the all-suitcase rule. Do not create product-family clustering or a parallel decision registry.
3. **Supplier taxonomy is candidate routing, not the acceptance boundary:** when the title clearly identifies a product, an inappropriate Giga category must not become a permanent excuse to leave it unclassified. Review and record the required guarded relation or approved title-based applicability within the existing canonical mapping/policy. Preserve the raw source discrepancy as diagnostic evidence; do not require supplier/source repair before a defensible product-category proposal can exist. Source-identity uncertainty that prevents knowing which product is being classified remains distinct.
4. **Use defensible granularity:** choose a real, appropriate broader leaf when the title cannot support a finer subtype and the official taxonomy provides it; do not infer size, mechanism, species or material from Giga labels. Scoped Other is permitted only in the correct product branch after checking more-specific leaves. No global fallback to force coverage.
5. **Genuine residual exceptions must be small, specific and reviewable:** record the exact title limitation and recommended category or alternatives where possible. Logging 83 special records, 513 gaps, or all remaining issues does not itself meet this business standard. Do the title-only reasoning and candidate corrections that are possible; separate truly undecidable titles from missing candidate work.
6. **Full-catalog regression after enrichment:** verify all 2,480 identities, IDs/full paths, rule applicability and comparison/status consistency, with special QA for misleading source buckets and previous over-specific selections. Save/read back the final review results and report the actual stable coverage; do not automatically promote old gaps by set-membership alone.

The existing draft's 82 additions / 430 observed records are an intermediate proposed enrichment, **not a completed mapping**. Its remaining 25 relation groups require substantive resolution under this full-product standard. This standard approves the acceptance basis; it does not approve all proposed relations, listing batches, production updates or CSV uploads.
