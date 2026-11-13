# Giga Supplier Category Inventory — Local Supabase Read-only Audit

**Snapshot:** 2026-11-13 JST · **Source:** Mac mini `rp-macmini-01`, local Supabase PostgreSQL (`supabase_db_local-supabase-smoke`), schemas `canonical_product` / `mercari`. **No DB writes.** This is a saved company business source snapshot, not a current Giga website inventory assertion.

## Reconciliation

| Metric | Count | Definition |
| --- | ---: | --- |
| Active Canonical Variants | **6,464** | `canonical_product.variants.status='active'` |
| Variants with at least one Giga category observation | **6,309** | Distinct latest `source_category_observations.variant_id` |
| Variants with no Giga category observation | **155** | Active Variant anti-join; **141** have current Giga SKU external identity |
| Distinct Giga categories on latest variant observations | **111** | Distinct `category_code`; distinct `category_path` also 111 |
| Existing `mercari.giga_category_registry` | **72** | 72 distinct registered category codes |
| Actually observed codes missing from registry | **39** | Do not use registry alone as enumeration SSOT |
| Prior `mercari.giga_category_mapping_pairs` | **313** | 280 `DRAFT`, 33 `CONFIRMED`, on existing taxonomy snapshot; **historical evidence only**, not approved dictionary for #312 |
| Historical category observation rows | 11,091 | Multiple observations per Variant; **not** distinct products |
| Giga external SKU identity rows | 6,450 | `source_system='giga'`; not the category denominator |
| Latest category observation | **2026-10-12** | Classification snapshot is **stale for recent arrivals** |
| Latest Giga OpenAPI source observation | 2026-11-13 | Primarily list/price/inventory; latest product_list payloads do not include Giga category; not evidence that 155 are categorized |

**Check:** 6,309 + 155 = 6,464. The 111 Giga inventory rows sum to exactly 6,309 distinct active Variants. Counts are per **Canonical Variant**, not SPU group, Giga raw record or Seller Listing.

## Distribution by Giga top family

| Giga top family | Distinct Variants | Observed supplier codes |
| --- | ---: | ---: |
| Furniture | 4,034 | 31 |
| Travel | 676 | 3 |
| Garden & Outdoor | 584 | 17 |
| Toys | 367 | 7 |
| Pet Supplies | 183 | 5 |
| Fitness & Sports | 155 | 14 |
| Household Supplies & Décor | 67 | 7 |
| Electrical Appliances | 67 | 6 |
| Mobility & Daily Living Aids | 56 | 3 |
| Tools & Tool Organizers | 40 | 6 |
| Kitchen | 29 | 2 |
| Bath & Faucets | 28 | 5 |
| Other | 15 | 1 |
| Commercial | 5 | 2 |
| Auto Parts & Transport | 3 | 2 |
| **TOTAL** | **6,309** | **111** |

## Coverage and priority

Top ten supplier categories: Desks & Work Surfaces 786; Hard Case Luggage 669; Chairs & Accent Seating 570; Beds, Frames & Bases 531; Sofas 497; Youth, Kids & Baby Furniture 278; Office Chairs 248; Cabinets 175; Sheds 165; Tables 156. **Top 10 total 4,075 = 64.6% of categorized Variants.**

**Critical ambiguity:** a generic source category is not necessarily equivalent to a single Mercari leaf category. Real product titles verified in the source show: `10657 Beds` includes both loft beds and sofa beds; `10669 Sofas` includes floor chairs, sofa beds and ordinary sofas; `10698 Youth Furniture` includes child car seats and toy storage; `10681 Cabinets` includes glass display cases and other furniture. Simply mapping all 111 Giga IDs one-to-one will silently miscategorize thousands of items.

## Evidence files and source governance

- [Complete 111-code count snapshot](giga-category-inventory-20261113.csv) — fields `code,name,path,active_variant_count,latest_category_observation_date,registry_state`.
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
  COUNT(*) AS active_variant_count,
  MAX(l.observed_at)::date AS latest_category_observation_date,
  CASE WHEN r.category_code IS NULL THEN 'OBSERVED_ONLY'
       ELSE 'IN_REGISTRY' END AS registry_state
FROM latest l
JOIN canonical_product.variants v ON v.id = l.variant_id
  AND v.status = 'active'
LEFT JOIN mercari.giga_category_registry r ON r.category_code = l.category_code
GROUP BY l.category_code, l.category_name, l.category_path, r.category_code
ORDER BY active_variant_count DESC, l.category_code;
```

To identify missing category observations (including recent items), anti-join `canonical_product.variants` against distinct `source_category_observations.variant_id`. **Do not label these 155 as a Giga 'Other' category; they are source facts not yet observed.** Current-state refresh must use new Giga category capture to close coverage, with source-date and denominator recorded.

## Next actions and ownership
1. **Source owner (Canonical/Giga):** reconcile 155 missing categories and the October-stale category-observation job; do not change production ingestion merely to complete this one-shot mapping.
2. **Mercari business owner:** establish Giga virtual subtypes for heterogeneous source categories, backed by real name/fact samples. Version and review rules in `/.github/business/mercari/taxonomy`, not NPL tables.
3. **Standalone Web #312:** consume pinned approved mapping and scoped fallback by `(giga category_code, virtual_subtype_key)`, validate official ID and report exceptions. No hard NPL Category Resolver dependency.
