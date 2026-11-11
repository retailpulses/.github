# Mercari Seasonality Intelligence — Monthly Demand Candidates
Status: DRAFT / Evidence PARTIAL · As of 2026-11-11
Source: Supabase `public.sales_orders`, Mercari COMPLETED marketplace lines through October 2026. Gross item revenue proxy; mixed 2024–2026 calendar months with **uneven coverage**. See [method](seasonality-method.md) and [Hero exclusions](hero-products.md).

## Interpretation / IMPORTANT
The table below is **observed monthly revenue ranking of keyword-derived categories after excluding four preliminary evergreen Hero SKUs**. It is **not a validated seasonal-lift ranking**. Because stores expanded and historical month coverage differs, these absolute totals cannot prove seasonal demand. Category labels are heuristic; product family mapping and Shop4-specific scope are pending.

| Calendar month | #1 category / revenue | #2 category / revenue | #3 category / revenue |
|---|---|---|---|
| Jan | 桌类 ¥825,692 | 储物 ¥570,751 | 架子 ¥549,282 |
| Feb | 桌类 ¥432,639 | 架子 ¥432,437 | 储物 ¥416,236 |
| Mar | 桌类 ¥1,232,711 | 储物 ¥1,050,850 | 展示柜 ¥958,659 |
| Apr | 储物 ¥1,269,306 | 沙发 ¥988,014 | 桌类 ¥813,235 |
| May | 储物 ¥894,786 | 沙发 ¥737,088 | 展示柜 ¥445,219 |
| Jun | 储物 ¥762,575 | 桌类 ¥589,099 | 展示柜 ¥464,183 |
| Jul | 储物 ¥773,670 | 沙发 ¥768,483 | 桌类 ¥568,051 |
| Aug | 储物 ¥760,023 | 沙发 ¥739,325 | 桌类 ¥621,420 |
| Sep | 储物 ¥1,017,957 | 沙发 ¥795,301 | 桌类 ¥717,416 |
| Oct | 沙发 ¥1,094,465 | 桌类 ¥879,469 | 储物 ¥762,829 |
| Nov | 储物 ¥928,133 | 沙发 ¥569,793 | 桌类 ¥517,167 |
| Dec | 储物 ¥1,484,016 | 桌类 ¥1,048,329 | 沙发 ¥694,488 |

## Exploratory category logic
Mutually exclusive keyword precedence: suitcase > glass display > parasol > sofa > desk/table > storage > kids cycle > bed > chair > rack/shelf > other. Current categories are title-regex approximations, and unclassified products are omitted. Counts above are **gross revenue**, not units. Revenue rank may differ from unit rank. No seasonality index, year-over-year validation or Shop4-only cut has yet been applied.

## Working hypotheses (not approved)
- Outdoor storage / 物置 has high revenue contribution across several months, but the pattern may reflect expensive SKUs and expanding assortment rather than a seasonal lift.
- Desk/table and sofa are recurring revenue categories; they may be evergreen *categories*, despite individual SKU Hero exclusion.
- Glass display cabinets appear in several months; variant-level continuity and parent-family consolidation are needed before calling them seasonal.
- Newsletter merchandising should use this table as a discovery seed only, not as automatic campaign selection.

## Downstream usage contract
For each month and shop, generate `month, shop_id, canonical_product_id, product_family_id, gross_revenue, units, revenue_rank, unit_rank, seasonal_lift, evidence_status, hero_excluded, stock_checked_at, price_checked_at, margin_checked_at`.
- Newsletter Agent proposes theme, product order, Japanese copy and delivery time; Campaign Service validates explicit shop, live listings, quota and approval (see [newsletter.md](../newsletter.md)).
- Promotion candidate service validates Effective TCOGS, fees, margin floor, available inventory and existing timesale constraints. Never derive a discount directly from seasonal rank.
- Keep Hero anchors in a **separate list**, not duplicated in the seasonal discovery list.

## Next validation
1. Resolve Shop4 store ID and run independent Shop4 revenue/units rankings.
2. Reconcile revenue with official Mercari Sales Report, verify discount and quantity treatment.
3. Map SKU variants to canonical parent products and canonical categories.
4. Compute monthly share-based seasonal lift with comparable 2025/2026 shop-months, inventory/listing-day normalization and minimum evidence thresholds.
5. Publish **VERIFIED seasonal winners only** after repeatable multi-period evidence; otherwise retain PARTIAL.
