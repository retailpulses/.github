# Mercari Newsletter Merchandising Strategy

Status: APPROVED BUSINESS STRATEGY / operational execution requires validation · 2026-11-14
Owner: Marketplace Operations
Companion canonical platform rules: [newsletter.md](newsletter.md)
Merchandising evidence: [hero-products](merchandising/hero-products.md), [seasonality method](merchandising/seasonality-method.md), [seasonality intelligence](merchandising/seasonality-intelligence.md), [monthly candidates](merchandising/monthly-top20-candidates.md).

## Objective and campaign portfolio

Use three repeatable, distinct newsletter types per shop; prioritize Shop4 as the initial operational pilot. Default cadence: one of each type monthly (3 of 4 available sends); reserve the fourth slot for exceptional campaigns, not a mandatory send. Campaigns target each shop's own opted-in newsletter subscribers; no cross-shop subscriber pooling. Each send attaches at most 10 actual published products from the sending shop. Shop4 prioritization does not change the unified demand-ranking source.

| Campaign | Goal | Discovery window | Default monthly slot |
|---|---|---|---|
| NEW_ARRIVALS | Introduce fresh assortment, test demand | First publication in last 30 days, preferably last 14 | 1 |
| SEASONAL_BESTSELLERS | Capture season-relevant demand | Historical comparable calendar month / approaching season, cross-year evidence | 1 |
| ROLLING_30D_BESTSELLERS | Convert proven recent demand | Last 30 complete JST calendar days before selection cutoff | 1 |

Do not force ten products or send when fewer than useful, eligible candidates exist. Avoid repetitive subject lines, identical assortments and repeated SPU1 families across campaign types in the same month where reasonable.

## Shared reusable selection pipeline

1. **Snapshot and evidence:** record cutoff JST, data refresh time, source tables, shop IDs and run ID. Aggregate Mercari Shop1–4 COMPLETED marketplace order lines only; exclude canceled, non-marketplace and duplicate lines. Shop3 contributes to market-demand intelligence, not company P&L. Revenue metric is historical gross item revenue proxy (unit price × quantity), not audited net sales.
2. **Canonical grouping:** join order item_code to canonical variant and SPU1 product family; aggregate demand by SPU1 across all four shops. One product family should not crowd out multiple slots through color/variant duplication. Mercari listing policy remains **one SKU per listing**; group families for analytics only, never merge item codes/listings.
3. **Campaign-specific candidate pool:** use the rules below. Rank primarily by gross sales revenue, with units, distinct selling days, trend and data quality as secondary evidence; do not fabricate gross profit from missing TCOGS.
4. **Hard eligibility: in-stock and NOT presale.** A newsletter candidate must have verified immediately-available, sellable stock for the exact target-shop listing/SKU. Exclude all presale/preorder (予約販売・入荷待ち), even if a platform listing is published or shows a nominal stock quantity. Unknown availability is ineligible pending verification. Never equate Giga supplier available quantity with immediately deliverable stock without fulfillment confirmation. Recheck at approval and just before scheduling; log evidence and timestamps.
5. **Shop eligibility:** map each candidate to one actual live published listing in the target shop, with correct listing ID, item code, current price, stock, images and shop ID. Reject draft, unavailable, invalid listing or unverifiable claims. Confirm inventory and current price immediately before approval/scheduling. Margin/Effective TCOGS gate applies where cost is available; if unverified, flag for manual review rather than claiming profitable.
6. **Engagement signals:** collect current target-shop listing **いいね数** and **閲覧数**, with snapshot timestamp and measurement window if known. Both are key ranking inputs, not hard minimum thresholds: likes signal expressed interest, views indicate exposure. Compare like/view rate only where denominator and observation periods are comparable; do not reward raw views without regard to conversion or listing age. Do not invent missing metrics; mark unknown and request export/UI readback. Historical cross-store sales determine demand pool, while listing-level likes/views help prioritize which eligible listing to feature.
7. **Portfolio curation:** choose up to 10 distinct eligible listings, preferably a useful category/use-case mix, avoiding excessive repetition from prior sends. Record inclusion/exclusion reason and final order. Never substitute another shop's listing.
8. **Copywriting and review:** produce Japanese subject (≤60 chars), fixed heading (≤40), plain-text body (≤2,000), optional header image (recommended 600×320), ordered product IDs (≤10). Validate every factual claim against current listing data; no unsupported 'No.1', discounts, scarcity, review counts or customer testimonials.
9. **Governed execution:** agent creates proposal only. Campaign Service/operator checks remaining quota (max 4/shop/calendar month), 08:00–22:00 JST 30-minute slot and ≤14-day scheduling horizon, registered sender disclosure, approval, deduplication and preview. Seller UI is the initial execution path; read back status/time and log evidence. Never equate proposal with scheduled/sent.

## Campaign-specific selection

### A. NEW_ARRIVALS
- Source: canonical listing publication/first-live timestamp **in target shop**, not product creation date or recent editing timestamp. First published within 30 days; prioritize 14-day recency.
- Cross-store demand may inform ordering, but is not necessary for newness; use product utility, completeness, season fit and availability. Do not call a product newly launched if only a listing was relisted without genuine new assortment; label as 新入荷/新掲載 only when accurate.
- Rank: recency and listing quality first, then likes, views and engagement efficiency (when comparable), relevant demand signal and product diversity; stock and non-presale status are mandatory gates. If fewer than 3 strong candidates, skip/merge rather than fill with old items.

### B. SEASONAL_BESTSELLERS
- Source: unified four-shop historical comparable months/seasons; use [seasonal-top20](merchandising/seasonal-top20.md) and [monthly-top20](merchandising/monthly-top20-candidates.md) as discovery, not live inventory or proven lift.
- Use Japan seasons: spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb. Select ahead of the demand window when reasonable.
- Distinguish **high historical seasonal sales** from statistically demonstrated **seasonal lift**. Current research explicitly has NOT verified normalized lift; do not market a candidate as season-specific sales winner without supporting evidence.
- Prefer non-Hero SPU1 discovery candidates, excluding the provisional 25-family Hero set in [hero-products](merchandising/hero-products.md), subject to refresh. Optional evergreen anchor max 1–2 only when editorially justified; never let evergreen Heroes dominate. Validate exposure, active days, stockouts and unequal year coverage before interpreting seasonality.
- Rank: comparable-season gross revenue and units, evidence across years, category relevance, verified lift (only when available), then current target-shop likes/views as interest and exposure signals. In-stock non-presale is mandatory.

### C. ROLLING_30D_BESTSELLERS
- Source: unified four-shop completed sales in the last 30 *complete JST days*; not the previous calendar month by default.
- Rank SPU1 by gross revenue DESC, units DESC, distinct selling days DESC; then prioritize target-shop listings with stronger likes and views (normalize exposure where comparable). All selected items must be in-stock and non-presale. Capture rank and period in proposal; include evergreen Hero families if genuinely in top ranks.
- Avoid using cumulative all-time rankings as substitute; check concentration in one unusual bulk order and current listing availability.
- Copy may say 最近30日間の人気商品 only with grounded scope; avoid platform-wide ranking or ベストセラーNo.1 claims. When citing ranking, clarify it is 当社取扱商品内, not all Mercari.

## Copywriting templates (Japanese; replace brackets, remove unsupported assertions)

### NEW_ARRIVALS
Subject: 【新着商品】暮らしに役立つアイテムをご紹介
Heading: 今月の新着アイテム
Body:
いつも当ショップをご利用いただき、ありがとうございます。
新しく掲載した商品から、日々の暮らしに役立つアイテムを選びました。
今回は［商品カテゴリ／用途］を中心にご紹介します。
気になる商品は、下記の商品一覧から詳細をご確認ください。
※価格・在庫・配送条件は各商品ページをご確認ください。

### SEASONAL_BESTSELLERS
Subject: 【季節のおすすめ】［季節・用途］に役立つ商品特集
Heading: ［季節］のおすすめ商品
Body:
いつも当ショップをご利用いただき、ありがとうございます。
［季節の具体的な利用シーン］に向けて、過去の販売傾向と商品特長を参考に、おすすめ商品を選びました。
［カテゴリ／用途］を中心にご紹介します。
商品の仕様や配送条件は、下記の商品ページからご確認ください。
※掲載内容・在庫・価格は変更となる場合があります。

### ROLLING_30D_BESTSELLERS
Subject: 【最近の人気商品】この30日間によく選ばれたアイテム
Heading: 最近30日間の人気アイテム
Body:
いつも当ショップをご利用いただき、ありがとうございます。
当社Mercari Shops取扱商品の直近30日間の販売実績を参考に、人気のアイテムを選びました。
［主なカテゴリ／用途］など、注目の商品をご紹介します。
気になる商品は、下記の商品一覧をご覧ください。
※当社取扱商品の販売傾向に基づくご紹介です。メルカリ全体のランキングではありません。

Copy rules: customer benefit and use case before generic adjectives; specific material/size/features only when validated. No invented urgency, limited quantities, discounts, free shipping, warranties, reviews or ranking. Keep all copy plain text, naturally Japanese and non-repetitive. Product attachments appear at bottom in selected order; do not fake inline cards/HTML.

## Proposal output contract (business-level; future implementation schema in product repo)

Required: `campaign_type`, `target_shop_id`, `snapshot_at_jst`, `sales_window_start_jst` (where applicable), `sales_window_end_jst`, `source_refs`, `candidate_spu1`, `selected_products[]` (shop listing ID, item_code, SPU1, rank, rationale, price/stock checked_at, presale_status, likes_count, views_count, engagement_snapshot_at), `excluded_candidates[]` (reason), `subject`, `heading`, `body`, `proposed_delivery_at`, `proposal_status`, `approval_required`. Final approved schedule and execution state are separate; keep idempotency key and Seller UI readback evidence.

## Measurement and improvement

Per campaign record eligible pool size, selected 0–10, coverage of ranking, send quota, approved/scheduled/sent status, operator and timestamps. If Seller UI exposes audience, delivery, open/click or attributable orders, record measured values and attribution window; otherwise mark **unavailable**, not zero. Review monthly whether new arrivals gain first sales, seasonal candidates outperform baseline, and 30-day bestsellers convert, with stock and listing exposure caveats. No invented uplift or causal attribution.

## Open implementation questions

Exact listing first-publication timestamp and freshness; real-time stock/price source; reliable attribution/analytics; official newsletter API scope; Campaign Service ownership and execution adapter. None block manual proposal drafting but all block claims of end-to-end automation.

## Operational signal source: Timesale CSV (2026-11-14 sample)

The operator-supplied `timesale_registration_2026-11-14-1752.csv` contains columns `商品ID`, `SKU1_商品管理コード`, `商品登録日時`, `いいね数`, `閲覧数`, among others. It contains 419 data rows including a `# CREATE` example row; exclude sample/comment rows before joining. This demonstrates a practical **listing-level engagement snapshot** input, but the export is a Timesale registration file, **not** proof of sellable inventory, presale status, unique views, or a standardized measurement period. Never infer in-stock from `処理フラグ=CREATE` or from a listing's presence in this file. Join by target shop + 商品ID (with item_code cross-check); independently verify fulfillment availability and presale flags. Snapshot provenance and shop identity must be recorded before use. No actual campaign or inventory eligibility is asserted from this CSV alone.


## November 2026 real-data shortlist (DRAFT; not send-ready)

Source: operator-uploaded Timesale CSV snapshots 2026-11-14, registration (418 real rows) and update (1,894 rows). These files do **not** identify their source shop, prove stock/presale eligibility, or provide completed-order sales. Therefore the rows below are real listings and observed engagement, **not verified Shop4 listings**, **not verified in-stock**, and **not a true 30-day bestseller ranking**. Treat as November merchandising / engagement campaign candidates, pending explicit shop mapping and hard inventory gate. Do not publish or send from this shortlist.

| Source | Item code | Listing ID | Category / distinguishing feature | Likes | Views |
|---|---|---|---|---:|---:|
| update | N515P401190B | 2JMg7WaZDwabvHWBxYocrf | Glass display cabinet, 4 shelves, LED, 40cm | 451 | 1616 |
| update | N515P401211B | 2JMePenrXB8dEmDJrTojXv | Glass display cabinet, double doors, sensor LED, 80cm | 246 | 369 |
| update | N506P332030A | 2JMjEuihfWUDY2a8AuWWbg | Sofa bed, 180cm, no assembly | 172 | 115 |
| update | N508P301428B | 2JMfUTkX3kVwM2T9EDqX4s | Outdoor steel storage shed, 290cm | 174 | 40 |
| update | N509P277758B | 2JMfUSNCJSGmxy22mtSoLT | Children's soft play block set, 7 pcs | 117 | 76 |
| update | N508P397567B | 2JMgKrTtBHYGrgyKeLSRuG | Self-propelled / attendant wheelchair | 112 | 145 |
| update | WF195238FAA | 2JMfgq6xUmd3jeHdqzMTNX | Compact 2-seat faux-leather sofa | 114 | 239 |
| update | MS283514AAA | 2JMjfb9sUZ3zNCpCwuxo4d | Foldable table tennis table | 101 | 121 |
| registration | WF324486BAA | 2JMfgpDsDTZ7zf7uu9zs77 | Outdoor storage shed | 118 | 1831 |
| registration | N510P240763B | 2JMePghNrw6nVVcpKVV8wC | Carry-on suitcase S size | 71 | 783 |

Editorial selection favors strong likes plus exposure and category diversity, not raw likes alone; two cabinet styles are distinct listings but may belong to the same SPU1 family, so retain at most one if canonical mapping confirms family duplication. The apparent registration/update source split is **not** evidence of shop identity. Before producing the actual Shop4 10-item send: verify which export is Shop4 (or fetch its live listings), verify immediate sellable stock and presale flags per item, join four-shop completed sales for 2026-10-15 through 2026-11-13 JST for true rolling-30-day claims, validate listing IDs/prices and operator approval. Neither export supports NEW_ARRIVALS this month based on registration timestamps (none first registered in November); first-live timestamps are also unverified.
