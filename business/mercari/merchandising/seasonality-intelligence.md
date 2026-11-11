# Mercari Seasonality Intelligence — Item Code / SPU1 Ranking
Status: **HISTORICAL PRODUCT RANKING AVAILABLE; VERIFIED SEASONAL LIFT NOT YET ESTABLISHED** · Evidence PARTIAL · 2026-11-11
Source: Supabase `public.sales_orders` joined by `b2b_item_code` → `product_variants.item_code` → `product_spus.spu_code`. Dates grouped JST, completed Mercari marketplace order lines, through complete October 2026. Values are gross item-revenue estimates (JPY), not reconciled net sales. See [methodology](seasonality-method.md), [Hero intelligence](hero-products.md).

## Product-level monthly revenue leaders, excluding cross-store Hero SPU1 candidates
**Actual item_code and SPU1 are provided for each rank.** Each row is the monthly revenue of the **entire SPU1 family**, with a representative item_code (not necessarily the largest individual variant). Multiple variants are consolidated. Historical ranking is **not** proof of seasonal lift. January–October combine 2025 and 2026 where data exists; November–December are 2025-only and must not be compared as equal-size months.

| Month | Rank | SPU1 | Representative item_code | Units | Gross revenue (JPY) |
|---|---:|---|---|---:|---:|
| Jan | 1 | W1266S00 | W1266S00008 | 2 | 128,857 |
| Jan | 2 | N506P255944 | N506P255944A | 4 | 88,109 |
| Jan | 3 | N512P401909 | N512P401909B | 5 | 54,233 |
| Feb | 1 | N508P359533 | N508P359533B | 1 | 68,980 |
| Feb | 2 | N512P360687 | N512P360687W | 2 | 56,565 |
| Feb | 3 | N511P329013 | N511P329013N | 5 | 53,486 |
| Mar | 1 | N515P401190 | N515P401190B | 22 | 380,570 |
| Mar | 2 | N506P339216 | N506P339216A | 10 | 168,963 |
| Mar | 3 | N511S407763 | N511S407763G | 3 | 115,245 |
| Apr | 1 | N506P339216 | N506P339216A | 16 | 266,942 |
| Apr | 2 | W1266S00 | W1266S00005 | 4 | 212,072 |
| Apr | 3 | N515P401190 | N515P401190B | 9 | 160,920 |
| May | 1 | N515P401190 | N515P401190B | 8 | 140,040 |
| May | 2 | N508P397567 | N508P397567A | 8 | 105,684 |
| May | 3 | MX292211 | MX292211BAA | 2 | 79,130 |
| Jun | 1 | N509P176640 | N509P176640B | 4 | 92,645 |
| Jun | 2 | N509P387207 | N509P387207A | 2 | 73,994 |
| Jun | 3 | WF324486 | WF324486BAA | 4 | 69,757 |
| Jul | 1 | N506P503228D | N506P503228D | 9 | 150,722 |
| Jul | 2 | WF315212 | WF315212BAA | 6 | 113,376 |
| Jul | 3 | N515P401190 | N515P401190B | 5 | 83,611 |
| Aug | 1 | WF315212 | WF315212BAA | 4 | 76,787 |
| Aug | 2 | N508P397567 | N508P397567A | 6 | 75,443 |
| Aug | 3 | WF296359 | WF296359BAA | 5 | 63,851 |
| Sep | 1 | WF303355 | WF303355AAA | 5 | 97,760 |
| Sep | 2 | N508P427541 | N508P427541G | 1 | 69,372 |
| Sep | 3 | N504P384907 | N504P384907A | 7 | 67,698 |
| Oct | 1 | N510P371976 | N510P371976B | 31 | 119,498 |
| Oct | 2 | N515P401190 | N515P401190B | 6 | 105,492 |
| Oct | 3 | N509SA304384 | N509SA304384A | 3 | 86,172 |
| Nov | 1 | N512P360687 | N512P360687W | 4 | 98,765 |
| Nov | 2 | WF310742 | WF310742AAA | 3 | 79,446 |
| Nov | 3 | N506P339216 | N506P339216B | 4 | 69,060 |
| Dec | 1 | N512P360687 | N512P360687W | 7 | 175,270 |
| Dec | 2 | N515P196885 | N515P196885B | 8 | 98,782 |
| Dec | 3 | WF326433 | WF326433AAA | 3 | 96,239 |

**Important:** This is a **revenue leaderboard after preliminary Hero exclusion**, not a validated seasonality ranking. Most winners have sales evidence in only one year. Do not use this alone to assert seasonal demand or to configure discounts.

## Shop4-specific non-Hero SPU1 revenue candidates
Shop4 confirmed by `platform_accounts`: `source_store_id=2JMLHBxjiFHDr55jMwA7fs`. **Use source_store_id**, not an inner join to `platform_accounts`: many July–October 2026 Shop4 rows have NULL `platform_account_id`, which would silently omit sales.

**Shop4 ranking excludes the entire cross-store 25-SPU1 Hero set** (not only Shop4's own Hero). This prevents cross-store evergreen products from leaking into the Shop4 seasonal discovery pool. Shop4 Hero `N515P401211` is included in that global exclusion set.

| Month (2026) | #1 SPU1 / item_code / revenue | #2 SPU1 / item_code / revenue | #3 SPU1 / item_code / revenue |
|---|---|---|---|
| Feb | TX311189 / TX311189AAA / ¥22,240 | N509P323410 / N509P323410B / ¥12,810 | N515P266079 / N515P266079S / ¥3,010 |
| Mar | N515P401190 / N515P401190B / ¥359,320 | N506P339216 / N506P339216A / ¥49,794 | N511P437311 / N511P437311H / ¥41,457 |
| Apr | W1266S00 / W1266S00005 / ¥163,793 | N515P401190 / N515P401190B / ¥160,920 | N509P379986 / N509P379986A / ¥74,273 |
| May | N515P401190 / N515P401190B / ¥140,040 | N508P397567 / N508P397567A / ¥89,694 | MX292211 / MX292211BAA / ¥79,130 |
| Jun | N509P387207 / N509P387207A / ¥73,994 | N515P401190 / N515P401190B / ¥69,729 | WF295683 / WF295683CAA / ¥47,458 |
| Jul | WF315212 / WF315212BAA / ¥95,726 | N515P401190 / N515P401190B / ¥83,611 | N504P398915 / N504P398915B / ¥78,096 |
| Aug | N508P397567 / N508P397567A / ¥75,443 | WF315212 / WF315212BAA / ¥57,848 | WF195239 / WF195239FAA / ¥57,294 |
| Sep | N508P268905 / N508P268905A / ¥59,484 | N508P397567 / N508P397567A / ¥48,972 | N512P360685 / N512P360685W / ¥43,764 |
| Oct | N515P401190 / N515P401190B / ¥105,492 | N510P371976 / N510P371976B / ¥102,898 | N512P291470S / N512P291470SA / ¥68,800 |

Shop4 had no qualifying completed marketplace orders in January 2026 under this filter. November 2026 is incomplete and excluded. Historical months shown are 2026 only.

## Listing execution readiness — BLOCKED, not hidden
The historical item_code/SPU1 mapping is **resolved**, but the current Shop4 listing mapping is **not**. Direct joins of sampled winning `product_variants.id` to `platform_listings.variant_id` returned no Shop4 listing for `N515P401190`, `N510P371976`, `N508P397567`, `N508P301428`. Shop4 has 6,204 `platform_listings` rows, but only 996 with `variant_id`, **0 with `product_spu_id`**, **0 with `manage_number`**, and 5,799 with external_listing_id. Therefore **do not invent listing IDs, availability or stock**. This is a canonical mapping/data-lineage gap; resolve with supported catalog linkage or authoritative shop listing matching before execution.

## Downstream usage
- **Newsletter Agent:** use the SPU1 and item_code candidates as historical discovery inputs, with Hero exclusion; Campaign Service must resolve current Shop4 listing and validate stock, current price, quota and authorization before scheduling.
- **Monthly Promotion:** same candidate pool, but require Effective TCOGS, fee, margin floor and inventory; no discount computed from this historical ranking.
- **Seasonal qualification:** requires a positive seasonal-lift index, comparable years and listing-day coverage. This file deliberately labels unverified candidates as historical monthly revenue leaders.
- Supporting category-level aggregate is retained in Git history of PR #101, but is **not** the actionable unit of merchandising.
