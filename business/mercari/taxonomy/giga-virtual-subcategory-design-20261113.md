# Giga Virtual Subcategory → Mercari Category ID — one-shot draft mapping audit

**Status: CANDIDATE DATA / REVIEW REQUIRED (2026-11-13 JST).** This is company-owned business taxonomy knowledge, NOT a deployed resolver, NOT an approved CSV mapping, and NOT a copy of NPL Category Resolver. **Owner:** Mercari Business Operations. Master snapshot [20261113-30f1c9dc](../masters/categories/20261113-30f1c9dc/manifest.json), byte-identical with Mercari official live download.

## Scope and factual reconciliation

| Stage | Rules/categories | Active Variant count | Meaning |
| --- | ---: | ---: | --- |
| Canonical Giga category inventory | 111 categories | **6,309** | All active Variants with latest Giga category observation |
| Category-less Active Variants | N/A | **155** | Source gap: 141 have an active Giga external SKU; do not classify as 'Other' |
| Mixed Giga categories selected for virtual-subtype research | 14 source categories | **4,475** | High-impact heterogeneous groups, **not automatically one Mercari ID each** |
| Virtual-subtype identification candidates | **52 title rules** | **3,640** matched (first priority wins) | Rule hits only, no guarantee of semantic accuracy |
| Virtual subtype rule hits with verified *existing* official Category ID | **41 rules** | **2,876** | Candidate ID derived from unique exact official leaf; **not approved** |
| All remaining source categories | 97 source categories | 1,834 | Can propose direct mapping or require additional split/review |
| Direct supplier-category mapping suggestions with unique exact official leaf | **33 source categories** | **895** | Candidate ID, **not approved** |
| **Combined initially proposed ID coverage** | Mixed strategies | **3,771 / 6,309 (59.8%)** | **Candidate ID presence, NOT classification quality, approval or CSV readiness** |
| Proposed scoped fallback policies | **11 options** | Not applied | Each ID checked in official master; **all disabled** pending business approval |
| Existing prior Mercari mapping pairs | 313 records | Not part of new coverage | 280 DRAFT, 33 CONFIRMED; historical, NPL-linked, not used as authority |

The 14 subtype categories are sampled from latest source category records and accepted/unresolved Japanese product titles in `canonical_product.current_facts`. Source classifications were observed no later than 2026-10-12; recent changes and 155 missing category records require separate source-reconciliation. Do not infer latest Giga site stock counts or category completeness from this frozen read.

## Why a virtual Giga child category is better than one broad fallback

A supplier classification `giga_category_code` is immutable raw provenance. Introduce company-owned **`virtual_subtype_key`** as a derived business layer, rather than mutating Giga's taxonomy or creating a second Canonical Product master:

```
Giga category_code + (grounded product_name/facts)
    -> virtual_subtype_key + rule_version + evidence
    -> approved Mercari Category ID
    -> optional category-scoped fallback
    -> per-row unresolved exception when still ambiguous
```

Rule hierarchy: **specific product type** (e.g. `10669/sofa_bed`) outranks Giga parent `10669`; exact approved Giga mapping outranks fallback; no global fallback across unrelated goods. Category ID must exist in pinned official Master. A parent-level mapping may only cover a genuinely homogeneous source category; even if many items appear to match, a mixed category requires subtype rules.

**Evidence-rich examples from local DB:**
- `10669 / Sofas` (497): 238 title matches `sofa_bed` → real ID `fv7NAWJqfaqqh7GsP7q2dN`; 29 `floor_chair`, 35 `corner_sofa`, 63 `single_sofa`, 68 `multi_sofa`; 64 lacked matching resolved facts. A universal sofa default would mislabel sofa beds/floor chairs.
- `10657 / Beds, Frames & Bases` (531): 252 `loft_bed` → official `TH4acvDBAupdG2TnrVGVuC`, 47 `sofa_bed`, 56 `bunk_bed`, 27 `folding_bed`, 84 single-bed frame patterns. All five have distinct official matching category leaves; 65 unmatched/no title.
- `10671 / Chairs & Accent Seating` (570): 449 title matches dining chair, mapped candidate `uCmnfJGdXF7HAhN2A9Ab7L`; remaining source includes office chairs, stools, floor chairs and unknown. Do not set entire 10671 to dining.
- `10689 / Desks & Work Surfaces` (786): 405 computer desk candidates; 152 study desk candidates; 12 gaming + 29 standing desks currently require explicit generalization/fallback; 188 lack matched title facts.
- `10698 / Youth, Kids & Baby Furniture` (278): child car seats (54), baby playpens (55), toy storage (67), kids desk (19), etc. **A furniture-family fallback is inappropriate for child car seats.**
- `10830 / Hard Case Luggage` (669): 591 title matches generic suitcase, but official Mercari `キャリーケース` has **men's and women's IDs**, not an identified neutral one. Both candidates are recorded as disabled alternatives; shop-specific gendered default requires a deliberate decision and visible audit.

## Rule overlap: a necessary quality gate

**978** classified Variant titles match **more than one subtype regex** among the 14 source categories (not necessarily 978 wrong results). First-match priority prevents non-determinism, but **is not evidence of correct classification**. Major overlaps: Beds 294, Sofas 273, Desks 187, Recliners 84. Examples: `ロフトベッド` + `シングルベッド`, `ソファベッド` + `一人掛け`, `学習机` + `パソコンデスク`. Before approving mappings, audit overlap cohort, use specific exclusion/precedence or fact attributes, and assign a confidence/exception state rather than claim 100% precision. Do not promote mere regex hits into canonical accepted facts.

## Durable artifacts in /.github/business/mercari/taxonomy

- [Giga source inventory](giga-category-inventory-20261113.csv) — every 111 source codes and counts.
- [Base mapping candidates](giga-category-mapping-candidates-20261113.csv) — **111 rows** with one-shot direct candidate ID, `REQUIRES_VIRTUAL_SUBTYPE`, `HETEROGENEOUS_REVIEW`, or unresolved reason. No approved IDs yet.
- [Virtual subtype candidates](giga-virtual-subtype-candidates-20261113.csv) — **52 prioritized subtype pattern rules**, evidence counts, candidate official ID/path, unresolved buckets; candidates status `DRAFT_REVIEW`.
- [Scoped fallback candidates](giga-scoped-fallback-candidates-20261113.csv) — 11 options, all `enabled=false`; exact IDs confirmed in official master. Includes safe-family `その他` leaves and suitcase men's/women's alternatives.
- [Business source audit](giga-category-audit-20261113.md) — reproducible SQL and source freshness.

These are **mapping proposals**. Publication to operative `giga-category-map.v1.csv` + `fallback-category-policy.v1.csv` requires rule-by-rule evidence review, meaningful sampling and business approval; do not silently relabel DRAFT as APPROVED.

## Fallback policy without a dangerous global catch-all

A shop can have a fallback policy **per source category / virtual product family**, with exact, validated official ID. Examples: furniture desks `家具・インテリア > 机・テーブル > その他`; beds `家具・インテリア > ベッド・マットレス > その他`; chairs `家具・インテリア > 椅子・チェア > その他`; sofas `家具・インテリア > ソファ・ソファベッド > その他`. Exclude nonmatching product types and accessories. Child car seats cannot inherit a generic baby-furniture fallback. The fallback’s approval evidence should include positive and negative samples, approved shop scope and rule version, and batch usage statistics.

If Sponsor chooses a specific generic `キャリーケース` gendered ID for Shop4, label that **operational category choice**, not taxonomy truth, and allow batch override. No source data or canonical accepted identity should be rewritten.

## Release acceptance before this dictionary drives CREATE CSV

1. Verify all 111 rows, 6,309 classified Variants, 155 missing observations, Giga registry gap 39, and pinned 7,625-entry official Master SHA.
2. Sample by **sales/product count, not only number of categories**. Prioritize 14 mixed groups and overlap 978 cases; inspect both positive and negative source titles against proposed category.
3. Resolve `EXACT_LEAF_NOT_FOUND` and 111 base-level unresolved items using verified ID alternatives or specific fallbacks; no fabricated master IDs.
4. Confirm business review of every enabled fallback; show `exact/subtype/fallback/unresolved` proportions by both category and item count.
5. Export manifest records `giga_category_code,virtual_subtype_key,matching_rule_id,rule_version,master_sha,selected_category_id,decision_type,evidence,operator_override`; never call NPL resolver.
6. Distinguish candidate, approved, and deployed runtime; maintain immutable old snapshots and update only through reviewed PR.

## Open questions / owners

- **Canonical/Giga ingestion owner:** investigate why category observations stop 2026-10-12 and fill 155 missing Category facts; no DB changes were made in this review.
- **Mercari business owner:** review subtype overlap and the disabled 11 fallback choices; decide gendered suitcase policy and quality threshold.
- **Standalone Web product owner (#312):** consume business dictionary from /.github in a pinned read-only release, not NPL Category Resolver; launch/production writes under separate authorization.
