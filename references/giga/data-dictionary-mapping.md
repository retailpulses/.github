# REF-GIGA-DATA — Shared Business Dictionary & Field Mapping

Status: **PARTIALLY VERIFIED — price + order-level fee fields runtime-verified (2026-11-28); regional fee semantics confirmed by official spec, per-SKU remote quote unavailable** · Reviewed: 2026-11-28 · Owner: Engineering Registry (definitions); executable owners retain mappings · [Issue #53](https://github.com/retailpulses/.github/issues/53)

**Authority:** GigaB2B 是采购平台/渠道，不是 Seller；ASUKA、HEYA、TBO 是 Seller；Mercari Shop1–4 是 Shop。供应商 API seller 字段必须从源样本核对其身份类型，不能按字面推断为 Retailpulses Seller。本文是语义与映射索引，不是数据库迁移或 Runtime 映射引擎。

## Semantic terms

| ID | Business term | 粒度与规则 |
|---|---|---|
| GIGA-TERM-001 | Procurement Channel | 采购平台，例如 GigaB2B；**不得**用作 seller_code |
| GIGA-TERM-002 | Seller | ASUKA/HEYA/TBO 等经营主体；与平台、Shop、上游 API sellerInfo 不同 |
| GIGA-TERM-003 | Shop | 市场销售店铺，如 Mercari Shop1–4；需独立 shop ID |
| GIGA-TERM-004 | Item Code | Giga SKU / B2B Item Code 的识别与别名映射需证据；不能独立证明订单相同 |
| GIGA-TERM-005 | Variant / SPU1 | Variant 是 SKU 级，SPU1 是上层聚合；并非同字段 |
| GIGA-TERM-006 | Giga Standard Unit Price | Giga 当前标准价概念，含时点与币种；**不可直接等于采购订单实际成交价** |
| GIGA-TERM-007 | Actual Purchase Unit Cost | 采购记录中实际分摊单价，依采购事件和数量 |
| GIGA-TERM-008 | Confirmed Unit Purchase Cost | 经人工确认的用于经营核算采购单价，不自动等于 Giga 标价 |
| GIGA-TERM-009 | Unit Fulfillment Cost | 每件履约成本，运输、包装等依 Owner 契约；独立于采购价 |
| GIGA-TERM-010 | Discounted / Exclusive Price | 优惠价/专享价；生效期、空值和优先级不得与标准价混淆 |
| GIGA-TERM-011 | Supplier RMA | 已实际提交的供应商售后/RMA 记录，与 Purchase Price RMA Candidate 分开 |
| GIGA-TERM-012 | Purchase Price RMA Candidate | 按规则识别的候选人工核查项，不等于退款资格或 Supplier RMA |

## Cross-system mapping (code/schema evidence, **not** end-to-end verified)

| ID / term | API endpoint / raw JSON path | Adapter / transform evidence | DB field and grain | Verification / gap |
|---|---|---|---|---|
| MAP-001 / 004 Item Code | `product/price/v1` request `skus[]`, response SKU resolution TBD | [CatalogSync adapter](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/lib/giga-client.mjs) maps by SKU | Supabase `public.product_variants.item_code`, item-level; SQLite `pnl_purchase_events.item_code` | CODE VERIFIED; exact live response JSON path UNKNOWN |
| MAP-002 / 006 Standard price | `product/price/v1`, response `item.price` as read by adapter | [CatalogSync](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/lib/giga-client.mjs) produces `price_only=item.price`; `unit_price=item.price ?? item.exclusivePrice` | Supabase `public.product_commercials.source_unit_price`; SQLite `pnl_purchase_price_rma_candidates.standard_unit_price_yen` | **PARTIAL**: API adapter path evidenced, **writer → both DB fields and live semantics NOT VERIFIED**. Never call normalized `unit_price` guaranteed standard price |
| MAP-003 / 010 Discount | `product/price/v1`, `item.discountedPrice`, `item.exclusivePrice` in adapter | `discounted_price` and `exclusive_price` separate; promotion timestamps captured | Supabase `public.product_commercials.discounted_unit_price` | PARTIAL; writer, effective time, NULL/reset semantics UNKNOWN |
| MAP-004 / 007 Actual purchase | Direct API path **UNKNOWN**; source purchase file/event | [Monthly P&L importer](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/service.py) `PURCHASE` rows, allocation by order + item code where present | SQLite `pnl_purchase_events.unit_purchase_cost_yen`, `pnl_cost_matches.unit_purchase_cost_yen` | CODE/SCHEMA only; **not Giga Price API-derived** |
| MAP-005 / 008 Confirmed cost | No live API mapping; operator action | Monthly P&L confirmation logic | SQLite P&L confirmed cost records, [service.py](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/service.py) | PARTIAL, exact persistence field/record linkage needs Owner confirmation |
| MAP-006 / 009 Fulfillment | `product/price/v1` → `data[].shippingFee` (integer, JPY per sales unit) is the **Unit Fulfillment Fee**; **no** regional/packing field is populated | plugin `normalizePriceItem` → `shipping_fee`; CatalogSync writer → `product_commercials.fulfillment_fee` | Supabase `public.product_commercials.fulfillment_fee`; SQLite `pnl_cost_matches.unit_fulfillment_cost_yen` | **PARTIAL**: raw path + currency + JPY grain verified on 210 SKUs / 217 records (110/115 agree with DB; 5 diverge, see evidence appendix). Regional Hokkaido/Okinawa fee and Packing Fee are **NOT exposed**; do not derive from F_u |
| MAP-007 / 002 Seller | API sellerInfo is **supplier-side inventory/pricing context**, not assumed operational Seller | Owner mapping TBD | Supabase `public.giga_cogs_shipment_lines.seller_code` | Schema exists; ASUKA/HEYA/TBO mapping requires real row and writer |
| MAP-008 / 011 Supplier RMA | Upstream endpoint UNKNOWN | Monthly P&L import `SUPPLIER_RMA` | Local SQLite supplier RMA records (Owner schema check pending) | Giga API support UNKNOWN; do not assert |
| MAP-009 / 012 RMA candidate | price fact provenance TBD, actual purchase events separate | [Monthly P&L RMA rule](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/service.py): actual allocated cost == accepted Giga price | SQLite `pnl_purchase_price_rma_candidates.standard_unit_price_yen`, `actual_purchase_unit_cost_yen`, `price_fact_id`, `price_accepted_at` | **PARTIAL**; source `giga.price` producer & lineage not fully reconciled |
| MAP-013 Unit Fulfillment Fee (F_u) | `product/price/v1` → `data[].shippingFee` | plugin `shipping_fee`; CatalogSync writer → `fulfillment_fee` | `public.product_commercials.fulfillment_fee` (JPY, per sales unit) | **VERIFIED (API)** 2026-11-28: 210 SKUs / 52 real fee tiers, 217/217 records JPY, `shippingFeeRange.min=max=shippingFee` in all 118 records that carry a fee. Equivalence to the **UI label** "Unit Fulfillment Fee" is inferred from identical tier values in DB and Sponsor table, not yet confirmed on screen |
| MAP-014 Currency | `product/price/v1` → `data[].currency` | plugin `currency` | — | **VERIFIED**: `JPY` in 217/217 records; validate before any arithmetic, never assume JPY |
| MAP-015 Remote Area Shipping Fee (R_a) / Estimated Fulfillment Fee (E_a) | **Per-SKU:** `price/v1` → `data[].remoteShippingFee` — official spec: "Fulfillment fee for the shipment sent to **remote areas** … includes **Shipping and Packing Fee**", i.e. it **is** E_a, not R_a. **Per-order actual:** `buyer/order/detail/v1` → `data[].feeDetails[]` where `feeType=2` | none today (no consumer code) | not persisted in production schema | **SPEC-VERIFIED but UNPOPULATED**: `null` in 217/217 price records, so no per-SKU remote quote is obtainable. Order-level `feeType=2` does return actuals (Hokkaido 1881, Okinawa 4246, Tokyo 1001 for the 1001 tier). `detailInfo/v1.remoteAreaPostalCodes` stays `[]` (135/135) — not an area key |
| MAP-016 Packing Fee (P_a) | **Not a separate field on the buyer price API** — packing is already inside `shippingFee` and `remoteShippingFee` per official spec. Seller-side `onsite-seller/order/detail/v1` → `data[].shippingFee` + `data[].packingFee` + `currencyCode` splits them | none today | not persisted | **buyer: NOT EXPOSED as a line item / seller: documented but buyer credentials cannot call it**. Never add P_a on top of `shippingFee`/`remoteShippingFee`, and never treat `protectionServiceRates` as packing |
| MAP-017 Area identifier / Delivery eligibility | **NO API PATH**: no region enum, prefecture code or destination parameter accepted (`price/v1` silently ignores extra request fields); `data[].skuAvailable` is purchase availability only, not destination serviceability | none | — | **NOT EXPOSED**: destination support remains an operator/UI judgement |
| MAP-018 Combo / package structure | `product/detailInfo/v1` → `data[].comboFlag` (boolean) + `data[].comboInfo[]` with `sku`, `qty`, `weightKg`, `lengthCm`, `widthCm`, `heightCm` | plugin `normalizeDetailItem` **drops both fields** | `public.product_variants.package_quantity` exists but disagrees | **PARTIAL**: `len(comboInfo)`≈component/box groups, `sum(qty)`=physical pieces; 17/17 sampled `package_quantity=1` rows contradict `comboInfo` (0/17 match by `sum(qty)`, only 3/17 by group count) and 4831/6557 rows are NULL — do not use DB as package authority |
| MAP-019 Seller context on price | `product/price/v1` → `data[].sellerInfo.sellerCode` / `.sellerStore` | plugin `seller` object | `public.giga_cogs_shipment_lines.seller_code` | **VERIFIED**: one SKU can return multiple records (observed `MS283514AAA` twice: `N509`/KF and `N504`/IE, same 4983). SKU alone is not a unique key in the price response |
| MAP-020 Order-level fee breakdown (destination-aware) | `buyer/order/detail/v1` → `data[].feeDetails[]` with `feeType` (`1` Item Cost, `2` Fulfillment Fee incl. shipping+packing, `3` Customs, `4` Storage, `5` DSR, `6` Protection, `7` Return Label), `feeName`, `feeAmount`; also `totalAmount`, `netTotalAmount`, request body `{"orderNo":[shipmentId],"includeRecipientInfo":bool}` | none today | `public.giga_cogs_shipment_lines.order_total_jpy` covers order total only, not the fee split | **VERIFIED (2026-11-28)**: 1001 tier → Hokkaido 1881 / Okinawa 4246 / Tokyo 1001; other tiers mostly equal to standard fee (no Hokkaido surcharge). Use for evidence of E_a by destination, not as a per-SKU quote service |

Supplementary observed DB fields (schema existence per [#53](https://github.com/retailpulses/.github/issues/53)): `public.product_commercials.effective_cost_price`, `baseline_price`, `previous_unit_price`; `public.baserow_886994_compat_vw."Unit Price"`, `"Discounted Unit Price"`, `"Effective Cost Price"`. **Names are not proof of business equivalence.**

## Shipping fee evidence 2026-11-28

Read-only verification against production (`https://openapi.gigab2b.com`), signed Open API 2.0. No write endpoint was called; no credential or signature header is reproduced here.

| Item | Value |
|---|---|
| Endpoints | `POST /b2b-overseas-api/v1/buyer/product/price/v1`, `POST /b2b-overseas-api/v1/buyer/product/detailInfo/v1` |
| Calls / records | 6 price calls → 217 records → 210 distinct SKUs / 52 distinct fee tiers; 3 detail calls → 135 records → 131 SKUs |
| Observation window | 2026-11-28 16:29–16:33 JST (UTC+9) |
| Sample selection | Mercari Shop4 catalogue plus tier-spread sample from `product_commercials.fulfillment_fee` (1001, 1705, 2002, 2057, 2530, 3988, 8504 …), including multi-package combos |
| Sanitization | Response envelopes kept; request headers, `client-id`, `sign`, `nonce` removed |
| Official spec source | Public help-center Open API 2.0 docs: `information/help_center/details&id=1829` → `information/open_api/index&doc_id=3`; field definitions read from doc_id 7 (Price), 12 (Shipping Info / tracking), 32 (Shipment Details), 14 (seller Shipment Details) |

### Sanitized raw fragment — price (F_u = 1001 tier)

`requestId 391186b6994043b8`, observed 2026-11-28T16:29:36+09:00, request `{"skus":["WF292693BAA"]}`:

```json
{
  "success": true, "code": "200", "requestId": "391186b6994043b8", "msg": "success",
  "data": [{
    "sku": "WF292693BAA",
    "currency": "JPY",
    "price": 5000,
    "shippingFee": 1001,
    "remoteShippingFee": null,
    "shippingFeeRange": { "minAmount": 1001, "maxAmount": 1001 },
    "internationalFulfillmentFees": [],
    "sellerInfo": { "sellerStore": "HEYA", "sellerType": "GENERAL", "sellerCode": "N512" },
    "skuAvailable": true
  }]
}
```

### Sanitized raw fragment — detail (combo / package structure)

`requestId 990d99b5300501e8`, observed 2026-11-28T16:32:22+09:00, SKU `SETN506P469771B`:

```json
{
  "sku": "SETN506P469771B",
  "comboFlag": true,
  "remoteAreaPostalCodes": [],
  "protectionServiceRates": [
    { "protectionService": "Basic•Return Protection Service", "rate": "2.00%" },
    { "protectionService": "Advanced•Return Protection Service", "rate": "3.50%" },
    { "protectionService": "Drop Shipping•Logistics Protection Service", "rate": "3.20%" }
  ],
  "comboInfo": [
    { "sku": "N506P469773B", "qty": 1, "weightKg": 16.55, "lengthCm": 76, "widthCm": 62, "heightCm": 51 },
    { "sku": "N506P469772B", "qty": 1, "weightKg": 29.55, "lengthCm": 76, "widthCm": 73, "heightCm": 64 },
    { "sku": "N506P469771B", "qty": 1, "weightKg": 28.35, "lengthCm": 76, "widthCm": 73, "heightCm": 65 }
  ]
}
```

### Sanitized raw fragment — order detail fee breakdown (Hokkaido, 1001 tier)

`requestId 7a8df582307af589`, observed 2026-11-28, request `{"orderNo":["2JTGxpjypCMXEKUJQ4QS9Q"],"includeRecipientInfo":false}`:

```json
{
  "orderNo": "2JTGxpjypCMXEKUJQ4QS9Q",
  "totalAmount": 5211,
  "feeDetails": [
    { "feeType": 1, "feeName": "Item Cost",       "feeAmount": 3330 },
    { "feeType": 2, "feeName": "Fulfillment Fee", "feeAmount": 1881 }
  ]
}
```

Same shape for Okinawa (`feeType 2 = 4246`, requestId `be893f83d7f4acba`) and Tokyo (`feeType 2 = 1001`).

### Aggregate field behaviour (217 price records / 135 detail records)

| Field | Non-null or non-empty | Meaning established |
|---|---:|---|
| `data[].shippingFee` | 118/217 non-null (`null` where `skuAvailable=false`) | Standard per-unit fulfillment fee in JPY |
| `data[].shippingFeeRange.minAmount`/`maxAmount` | equals `shippingFee` in 118/118 cases | Range is not a destination quote |
| `data[].remoteShippingFee` | **0/217** | Documented as the **remote-area** fulfillment fee incl. shipping+packing (= E_a); never populated in this sample, so no per-SKU remote quote |
| `data[].internationalFulfillmentFees` | **0/217** | Structure never observed; must stay UNKNOWN |
| `data[].currency` | 217/217 `JPY` | Currency validation source |
| `data[].sellerInfo.sellerCode` | present on all records | Seller context; SKU not unique (duplicate `MS283514AAA`) |
| `detailInfo.data[].remoteAreaPostalCodes` | **0/135** | Field exists, never populated in sample; semantics unproven |
| `detailInfo.data[].comboFlag` | 106/123 `true` in scan batch | Decomposition flag; `true` with 1 element = single-package bundle |
| `detailInfo.data[].comboInfo` | same 106 SKUs | Component list: `len` = groups, `sum(qty)` = pieces |

### API F_u vs internal DB `fulfillment_fee` (115 comparable SKUs)

110/115 equal. Divergences (API `price` equals DB `source_unit_price` in all five, so the gap is fee-specific, not a price revision):

| SKU | DB `fulfillment_fee` | API `shippingFee` |
|---|---:|---:|
| MS317851AAA | 2057 | 1705 |
| N504S522471A | 3762 | 3058 |
| N511C307176B | 6237 | 5764 |
| N511C307176W | 6237 | 5764 |
| SETN506P497041A | 7040 | 7513 |

Implication: the API is the current authority for F_u; a DB-only read may quote a stale fee.

### Order-level destination fees (verified)

`POST /b2b-overseas-api/v1/buyer/order/detail/v1`, body `{"orderNo":["<shipmentId>"],"includeRecipientInfo":false}`; requestIds `7a8df582307af589`, `be893f83d7f4acba`, `97a506c3db2c1270`. `feeDetails[feeType=2].feeAmount` is the fulfillment fee actually charged (spec: "Fulfillment Fee (including shipping and packing fees)").

| Destination | Shipment / SKU | Standard F_u | Charged feeType=2 |
|---|---|---:|---:|
| Hokkaido | 2JTGxpjypCMXEKUJQ4QS9Q / N510P469767Z | 1001 | **1881** |
| Hokkaido | 2JSmy26vEz2RhqMveozZgR / WF296965EAA | 1001 | **1881** |
| Okinawa | 2JSXnQXZQKBnZN2i9bGcw7 / N510P254504N | 1001 | **4246** |
| Tokyo | 2JTDoaoKihVAmN8ockzQEp / N511P429780B | 1001 | **1001** |
| Hokkaido | 2JRzf8yQJisBnfzN3f4Ay2 / N504P284384Z | 1705 | 1705 |
| Hokkaido | 2JQkhxSFW5y4hQSR8WVR3N / N506P339216D | 2057 | 2057 |
| Hokkaido | 2JQtZ48fkihFZSZcdWTMGc / N511P387242B | 2530 | 2530 |
| Hokkaido | 2JREyhfgcL9qG9aoCiaZf3 / N509P277758B | 2987 | 2987 |
| Hokkaido | 2JQZ6WFBCsrX3BdWr9nkGi / N511S358748B | 3410 | 3410 |
| Hokkaido | 2JQM7DDZxaT5gQ37TRW8G5 / N509P176640K | 3966 | 3966 |
| Hokkaido | order_2JNm2cS5JAoKPQGsG3joYx / N509SA353981A | 3058 | 3938 (+880) |
| Hokkaido | order_2JJg3om5yxqxro2xUjcCg4 / SETN506P295412BB | 4004 | 7524 (combo) |

The 1001-tier rows independently confirm Sponsor RATE-001 (Hokkaido 1881 / Okinawa 4246). Across a full enumeration of **39 fee tiers / 139 orders**, the Hokkaido surcharge is **+880 at 1001 and 3058 only**; 1705, 2057, 2530, 2987, 3410, 3966, 6953, 7679 show **+0** (45 orders); 4004 combo +3520; 2987-tier Okinawa single item +14400 (oversized). Fee amounts aggregate per order line (1705 + 1881 = 3586 observed). Full table: [BUS-LOG-002 §7.2.3](../../business/shipping-fee-master-rule.md#723-区域费全档位枚举订单级实测2026-11-28).

### Alternatives and remaining manual verification

1. **Order-level evidence (working API path)** — `buyer/order/detail/v1.feeDetails` returns the destination-aware charged fee. Use it to validate E_a for a tier; it is retrospective, not a per-SKU forward quote.
2. **Giga B2B buyer UI** — product page / "Related Fulfillment Fee Order" give the same rows interactively; useful when no order exists for the SKU. Not exercised here.
3. **Supplier request** — ask Giga for a per-SKU destination quote endpoint, since `remoteShippingFee` exists in the spec but is never populated for the JP marketplace.
4. **Do not** treat `internationalFulfillmentFees` (`countryCode`-keyed) or `remoteAreaPostalCodes` as Japanese prefecture keys, and do not derive E_a from `order_total − price`.

## Mapping record contract and acceptance



Future machine-readable records, only when useful, use:
`term_id | definition | source_system | api_endpoint/version | source_json_path | transform | target_system | schema.table.column | grain/join_key | currency/unit | null_policy | effective_time | owner | evidence | status | consumers`.

- `VERIFIED`: actual sanitized source sample + adapter writer + DB row/query + product consumer, with environment/date/commit/test evidence.
- `PARTIALLY VERIFIED`: some code/schema edges inspected, no full chain.
- `UNKNOWN`: no trustworthy current evidence; never silently fill.
- Never rename columns or add a mapping DB for documentation convenience. Business-rule behavior remains with Owner-specific Design/TRD/tests.
- E2E confirmation priority: (1) price `item.price` → CatalogSync → `source_unit_price` vs SQLite accepted `standard_unit_price_yen`; (2) seller identity; (3) actual purchase + PO/Item Code association; (4) fulfillment fee provenance; (5) candidate ↔ Supplier RMA distinction.
