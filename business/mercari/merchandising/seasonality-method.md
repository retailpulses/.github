# Mercari Seasonality Analysis Method — Canonical Knowledge Methodology
Status: DRAFT / Evidence PARTIAL · As of 2026-11-11 · Owner: Marketplace Operations
Source: Supabase project `gqeyfhshxdiyhugvmbuk`, `public.sales_orders`. No raw customer/order records copied to Git.

## Purpose and strict separation
Maintain three **distinct** outputs: (A) all-time cumulative revenue leaders, (B) evergreen Hero products, and (C) seasonal outperformers **after excluding evergreen Heroes**. All-time revenue leadership by itself is not evidence of evergreen behavior. A seasonal bestseller must also show a *relative* monthly/seasonal lift, not merely rank highly in absolute sales.

## Source contract (current exploratory run)
- `sales_channel='mercari'`, `order_status='COMPLETED'`, `line_origin='marketplace'`; exclude canceled, waiting and operator-component lines.
- Date: `purchase_date AT TIME ZONE 'Asia/Tokyo'`; month is JST calendar month. Exclude the currently incomplete November 2026. Current exploratory SQL used `purchase_date < '2026-11-01'` in server timestamp context; future production queries MUST use exact JST month boundaries.
- `sku = coalesce(nullif(btrim(b2b_item_code),''),nullif(btrim(manage_number),''),nullif(btrim(original_product_id),''),product_name)`. This is an exploratory fallback, not yet canonical product-family mapping. Different colors/variants may need parent-family rollup.
- `units = sum(coalesce(quantity,1))`, `gross_item_revenue = sum(coalesce(product_price,0)*coalesce(quantity,1))` JPY. Revenue is a **proxy**, not reconciled Mercari Sales Report net revenue; discounts, shipping, tax, refunds and fee accounting require verification.
- Exclude name regex `手数料|追加料金|金額調整|送料差額` and codes `N00000000`, `RP004`; manually review fee/bundle/custom-order outliers. Treat zero/negative/missing quantity or price as data-quality exceptions rather than silently accepting them.
- Scope is Mercari across four stores unless explicitly scoped. Shop3 is a separate business entity for company accounting and MUST NOT be blended into company revenue or margin. For commercial demand intelligence, combined marketplace observations may be shown with an explicit cross-entity label. Shop4-specific recommendations require shop mapping verification and a separate Shop4 calculation.

## Ranking contracts
1. **All-time revenue leaders:** rank by `gross_item_revenue DESC`, show units, distinct sales months, stores, date range. These are not automatically evergreen.
2. **Evergreen Hero candidate:** preliminary deterministic rule `distinct_sales_months >= 8 AND total_units >= 20`. Record sales-month count and distribution. This is a candidate filter, **not** a proven stable-demand model; verify month-to-month concentration, listing availability, first/last active dates and recent momentum before approving as evergreen. Store-scoped hero set may differ from cross-store set.
3. **Seasonal candidate:** `sku NOT IN approved_evergreen_hero_set`; rank by month/season revenue and units separately, but require **seasonal lift**. For each SKU or parent family compute monthly share of *comparable shop sales* (or sales per available listing-day) versus its baseline share across comparable complete months. Recommended lift = `(target_month_item_revenue / target_month_comparable_revenue) / (other_comparable_months_item_revenue / other_comparable_months_revenue)`. Require minimum sample size and at least two comparable year-season observations for VERIFIED seasonality; otherwise PARTIAL/HYPOTHESIS. Protect against division by zero.
4. Seasons (Japan meteorological): spring Mar–May; summer Jun–Aug; autumn Sep–Nov; winter Dec–Feb (winter crosses calendar years). Exclude incomplete seasons from season-over-season comparisons.
5. **Category-level intelligence:** group by validated canonical product category, not keyword alone. Keyword CASE can be a provisional exploratory approximation; record its unclassified share, precedence, and false matches.
6. **Ranking dimensions:** show revenue rank, unit rank, and gross profit rank where verified cost data exists. Profit requires Effective TCOGS + actual fees; do not infer from gross revenue.
7. **Promotion use:** Newsletter can use seasonal demand and hero mix; Timesale/Coupon must also validate current listing, stock, effective TCOGS, floor margin, quota and pricing. No automatic scheduling or discounts from a knowledge document.

## Verification gates / refresh
- Reconcile sales totals against Mercari Sales Report by shop-month; check duplicate order lines and quantity/price anomalies.
- Validate store ID → Shop1/2/3/4 mapping before shop-specific recommendations.
- Resolve canonical product/variant/family identity and listing availability. Control for store launch, assortment growth, inventory, historical promotions, and 2026-11 partial month.
- Recompute monthly (recommended 25th–month end), record query version/as-of date; invalidate on schema, product mapping, or platform policy changes.
- Evidence statuses: OBSERVED FACT for reproducible historical aggregates; HYPOTHESIS for seasonal causal claims; VERIFIED only after comparable-period validation.
- Git files contain aggregated evidence, not PII. Runtime decisions and Campaign Service remain owned by implementing products.
