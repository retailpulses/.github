# Giga Supplier Category Inventory — Local Supabase Read-only Audit

**Snapshot:** 2026-11-13 JST · **Source:** Mac mini `rp-macmini-01`, local Supabase PostgreSQL (`supabase_db_local-supabase-smoke`), schemas `canonical_product` / `mercari`. **No DB writes.** This is a saved company business source snapshot, not a current Giga website inventory assertion.

## Reconciliation

| Metric | Count | Definition |
| --- | ---: | --- |
| Active Canonical Variants | **6,464** | `canonical_product.variants.status='active'` |
| Variants with at least one Giga category observation | **6,309** | Distinct latest `source_category_observations.variant_id` |
| Variants with no Giga category observation | **155** | Active Variant anti-join; **141** have current Giga SKU external identity |
| Distinct Canonical Product IDs among categorized Variants | **3,161** | Product groups globally distinct across the 6,309 categorized Variants |
| Sum of per-category distinct Canonical Product IDs | **3,191** | Each category counted independently; **30 Product IDs span two source categories**, so not additive |
| Distinct Giga categories on latest variant observations | **111** | Distinct `category_code`; distinct `category_path` also 111 |
| Existing `mercari.giga_category_registry` | **72** | 72 distinct registered category codes |
| Actually observed codes missing from registry | **39** | Do not use registry alone as enumeration SSOT |
| Prior `mercari.giga_category_mapping_pairs` | **313** | 280 `DRAFT`, 33 `CONFIRMED`, on existing taxonomy snapshot; **historical evidence only**, not approved dictionary for #312 |
| Historical category observation rows | 11,091 | Multiple observations per Variant; **not** distinct products |
| Giga external SKU identity rows | 6,450 | `source_system='giga'`; not the category denominator |
| Latest category observation | **2026-10-12** | Classification snapshot is **stale for recent arrivals** |
| Latest Giga OpenAPI source observation | 2026-11-13 | Primarily list/price/inventory; latest product_list payloads do not include Giga category; not evidence that 155 are categorized |

**Check:** 6,309 + 155 = 6,464. The 111 Giga inventory rows sum to exactly 6,309 distinct active Variants. The inventory additionally contains `distinct_canonical_product_count` per source category. Counts labeled `active_variant_count` are per **Canonical Variant / SKU**, not Seller Listing, while the new Product count is per distinct `canonical_product.variants.product_id`. Product per-category totals are **not additive** because 30 Product IDs occur in two Giga categories.

## Distribution by Giga top family

Grouped by `level_1_category` (the first segment of `giga_category_path`); ranked by sum of `active_variant_count` descending. Ties use category name ascending. This is a snapshot of **categorized** Active Variants only; the 155 without a category observation are not assigned to any family.

| Rank | Giga level 1 category | Distinct Variants | Observed supplier codes |
| ---: | --- | ---: | ---: |
| 1 | Furniture | 4,034 | 31 |
| 2 | Travel | 676 | 3 |
| 3 | Garden & Outdoor | 584 | 17 |
| 4 | Toys | 367 | 7 |
| 5 | Pet Supplies | 183 | 5 |
| 6 | Fitness & Sports | 155 | 14 |
| 7 | Electrical Appliances | 67 | 6 |
| 8 | Household Supplies & Décor | 67 | 7 |
| 9 | Mobility & Daily Living Aids | 56 | 3 |
| 10 | Tools & Tool Organizers | 40 | 6 |
| 11 | Kitchen | 29 | 2 |
| 12 | Bath & Faucets | 28 | 5 |
| 13 | Other | 15 | 1 |
| 14 | Commercial | 5 | 2 |
| 15 | Auto Parts & Transport | 3 | 2 |
| | **TOTAL** | **6,309** | **111** |

## Product-group granularity and cross-category quality

Among the 6,309 categorized active Variant IDs there are **3,161 globally distinct Product IDs**. Across 111 categories, summing distinct Product IDs per category yields **3,191**, a 30-ID duplication due to groups spanning two different source Category IDs (maximum observed two per Product). This matters both for factual reporting and virtual subtype rule design: do not unify or merge categories based solely on shared canonical Product ID. The published inventory provides **both** `active_variant_count` and `distinct_canonical_product_count` per Giga category.

## Coverage and priority

Top ten supplier categories: Desks & Work Surfaces 786; Hard Case Luggage 669; Chairs & Accent Seating 570; Beds, Frames & Bases 531; Sofas 497; Youth, Kids & Baby Furniture 278; Office Chairs 248; Cabinets 175; Sheds 165; Tables 156. **Top 10 total 4,075 = 64.6% of categorized Variants.**

**Critical ambiguity:** a generic source category is not necessarily equivalent to a single Mercari leaf category. Real product titles verified in the source show: `10657 Beds` includes both loft beds and sofa beds; `10669 Sofas` includes floor chairs, sofa beds and ordinary sofas; `10698 Youth Furniture` includes child car seats and toy storage; `10681 Cabinets` includes glass display cases and other furniture. Simply mapping all 111 Giga IDs one-to-one will silently miscategorize thousands of items.

## Evidence files and source governance

- [Complete 111-code count snapshot](giga-category-inventory-20261113.csv) — fields `giga_category_code,giga_category_name,giga_category_path,level_1_category,active_variant_count,latest_category_observation_date,registry_state`. Rows are grouped by descending level-1 total Variant count, then by descending individual category count within each family.
- [Verified official Category Master](../masters/categories/20261113-30f1c9dc/category_master.csv): 7,625 IDs, official live download SHA-256 **matches supplied file**, `30f1c9dc3ee2f2133fe568e28213a392b54e7a5254f72bc2f552f6321895e4ac`.
- [Mapping policy](category-mapping-policy.md) — canonical business rule rather than NPL resolver.
- Store-Ops [#312](https://github.com/retailpulses/store-ops/issues/312) — independent listing Web app scope.

## Reproducible read-only query

```sql
WITH latest AS (
  SELECT DISTINCT ON (s.variant_id)
    s.variant_id, s.category_code, s.category_name,
    s.category_path #>> '{}' AS category_path,
    s.observed_at
  FROM canonical_product.source_category_observations s
  WHERE s.variant_id IS NOT NULL
  ORDER BY s.variant_id, s.observed_at DESC, s.id DESC
)
SELECT
  l.category_code,
  l.category_name,
  l.category_path,
  split_part(l.category_path, '>>', 1) AS level_1_category,
  COUNT(*) AS active_variant_count,
  MAX(l.observed_at)::date AS latest_category_observation_date,
  CASE WHEN r.category_code IS NULL THEN 'OBSERVED_ONLY'
       ELSE 'IN_REGISTRY' END AS registry_state
FROM latest l
JOIN canonical_product.variants v ON v.id = l.variant_id
  AND v.status = 'active'
LEFT JOIN mercari.giga_category_registry r ON r.category_code = l.category_code
GROUP BY l.category_code, l.category_name, l.category_path, r.category_code
ORDER BY SUM(COUNT(*)) OVER (PARTITION BY split_part(l.category_path, '>>', 1)) DESC,
         split_part(l.category_path, '>>', 1) ASC,
         active_variant_count DESC,
         l.category_code;
```

To identify missing category observations (including recent items), anti-join `canonical_product.variants` against distinct `source_category_observations.variant_id`. **Do not label these 155 as a Giga 'Other' category; they are source facts not yet observed.** Current-state refresh must use new Giga category capture to close coverage, with source-date and denominator recorded.

## Next actions and ownership
1. **Source owner (Canonical/Giga):** reconcile 155 missing categories and the October-stale category-observation job; do not change production ingestion merely to complete this one-shot mapping.
2. **Mercari business owner:** establish Giga virtual subtypes for heterogeneous source categories, backed by real name/fact samples. Version and review rules in `/.github/business/mercari/taxonomy`, not NPL tables.
3. **Standalone Web #312:** consume pinned approved mapping and scoped fallback by `(giga category_code, virtual_subtype_key)`, validate official ID and report exceptions. No hard NPL Category Resolver dependency.

## Critical DQ finding escalation (2026-11-13)

**Classified as actionable data-quality inconsistency, not a benign statistical overlap.** Read-only evidence proves **30 distinct Canonical Product IDs / 89 active Variants** are simultaneously associated with two Giga source Category IDs on latest per-Variant observations. In the [complete 30-group register](giga-cross-category-product-conflicts-20261113.csv), **11 groups cross supplier top-level families** and **19 groups disagree within a top-level family**. Examples: `Patio Furniture Sets` vs `Hard Case Luggage`, `Sofas` vs `Desks & Work Surfaces`, `Youth, Kids & Baby Furniture` vs `Sheds`. Source Giga categories are not presumed correct; neither is Canonical Product grouping necessarily the supplier's actual SPU1. Root causes remain **UNVERIFIED** until direct source SKU/identity lineage review.

**Controlling company rule and critical path:** [business/giga/category-data-quality-and-critical-path.md](../../giga/category-data-quality-and-critical-path.md); [central DQ Issue #110](https://github.com/retailpulses/.github/issues/110). Do **not** infer a Product-level category for member Variants or use a broad fallback to obscure this exception. For standalone #312, block only affected unresolved SKU rows, make errors visible and allow unaffected Shop4 listings to proceed. This is a company business source-quality issue, not merely an NPL category resolver issue.
