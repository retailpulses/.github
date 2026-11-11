# Mercari All-time Best Sellers & Evergreen Hero Intelligence
Status: DRAFT / Evidence PARTIAL · Analysis as of 2026-11-11
Source: Supabase `public.sales_orders`; Mercari COMPLETED marketplace lines through 2026-10-31 (exploratory UTC boundary; see method). Gross item revenue proxy in JPY, not finance-reconciled.
Method: [seasonality-method.md](seasonality-method.md).

## A. All-time cumulative revenue leaders (NOT automatically evergreen)
| Rank | SKU | Short description | Units | Gross item revenue (JPY) | Months with sales |
|---:|---|---|---:|---:|---:|
| 1 | N508P301428B | 大型屋外物置 290cm | 32 | 1,365,868 | 7 |
| 2 | N509P277758B | ソフトブロック7点 | 40 | 841,376 | 13 |
| 3 | N515P401211W | ガラスディスプレイキャビネット両扉 W | 30 | 835,487 | 6 |
| 4 | N515P401211B | ガラスディスプレイキャビネット両扉 B | 27 | 753,168 | 9 |
| 5 | N515P401190B | ガラスディスプレイキャビネット単扉 B | 40 | 701,175 | 6 |
| 6 | N506P339216D | ソファベッド | 24 | 391,733 | 5 |
| 7 | N512P360687W | 冷凍庫153L | 15 | 384,714 | 5 |
| 8 | N508P301428A | 大型屋外物置 variant A | 9 | 380,576 | 5 |
| 9 | N509P165538 | 屋外物置 | 13 | 345,895 | 8 |
| 10 | N509P277758A | ソフトブロック7点 variant A | 16 | 324,588 | 6 |

**Interpretation:** High-ticket outdoor storage and glass cabinets dominate revenue but often have limited sales-month breadth. Do not treat revenue rank as evidence of year-round demand.

## B. Preliminary evergreen Hero candidates (exclude from seasonal candidate list)
Rule for this exploratory extraction: **>=8 distinct months with sales AND >=20 units**, aggregated across Mercari stores. This is a provisional exclusion list; before making it authoritative verify sales continuity and store-specific performance.

| SKU | Product | Units | Gross item revenue (JPY) | Sales months |
|---|---|---:|---:|---:|
| N509P277758B | ソフトブロック7点 | 40 | 841,376 | 13 |
| N515P401211B | ガラスキャビネット両扉 B | 27 | 753,168 | 9 |
| N509P305801A | 屋外収納ボックス170L | 47 | 261,819 | 13 |
| PP307878AAA | Lサイズスーツケース | 23 | 134,156 | 8 |

**Exclusion contract:** Seasonal candidate rankings exclude these four SKU IDs, not all top-revenue products. When canonical parent-product mapping is validated, extend exclusion to approved Hero product families and variants to avoid leakage through color codes or listing duplicates. A product can be an all-time revenue leader without being a Hero and can still qualify for a seasonal list *if* seasonality lift is validated.

## B2. SPU1-level exclusion (supersedes SKU-only exclusion for merchandising)

The four-item SKU exclusion above was the original exploratory rule. **Do not use SKU-only exclusion in product-level promotions.** Join `sales_orders.b2b_item_code` → `product_variants.item_code` → `product_spus.spu_code`, aggregate variants into SPU1, and evaluate Hero continuity at that level.

Shop4 independently qualifies `N515P401211` as provisional evergreen Hero: **44 units, ¥1,196,637, 8 distinct sales months** through October 2026. This SPU1 must be excluded from the Shop4 monthly seasonal candidate table, including both `N515P401211B` and `N515P401211W`.

Cross-store SPU1 Hero membership must be recomputed at family granularity, and not inferred by applying the four-SKU list as-is. All-time revenue leaders remain a separate output.

## C. Business use
- Newsletter: evergreen Heroes may anchor campaigns separately, while seasonal discovery slots draw exclusively from the non-Hero seasonal candidate pool.
- Monthly promotion: do not automatically discount Heroes; prioritize incremental lift and margin. Verify listing/stock/Effective TCOGS and promotion history.
- **Shop4:** current table is cross-store and cannot be used as Shop4's definitive Hero list until Shop4 store-ID mapping and shop-specific analysis are validated.
