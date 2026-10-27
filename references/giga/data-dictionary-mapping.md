# REF-GIGA-DATA — Shared Business Dictionary & Field Mapping

Status: **PARTIALLY VERIFIED (schema/code existence only)** · Reviewed: 2026-10-27 · Owner: Engineering Registry (definitions); executable owners retain mappings · [Issue #53](https://github.com/retailpulses/.github/issues/53)

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
| MAP-006 / 009 Fulfillment | Potential API fee fields require official contract verification; actual P&L import feed | Monthly P&L charges and operator confirmation | SQLite `pnl_cost_matches.unit_fulfillment_cost_yen`; Supabase `public.product_commercials.fulfillment_fee` | UNKNOWN semantic equivalence; distinct sources and grain |
| MAP-007 / 002 Seller | API sellerInfo is **supplier-side inventory/pricing context**, not assumed operational Seller | Owner mapping TBD | Supabase `public.giga_cogs_shipment_lines.seller_code` | Schema exists; ASUKA/HEYA/TBO mapping requires real row and writer |
| MAP-008 / 011 Supplier RMA | Upstream endpoint UNKNOWN | Monthly P&L import `SUPPLIER_RMA` | Local SQLite supplier RMA records (Owner schema check pending) | Giga API support UNKNOWN; do not assert |
| MAP-009 / 012 RMA candidate | price fact provenance TBD, actual purchase events separate | [Monthly P&L RMA rule](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/service.py): actual allocated cost == accepted Giga price | SQLite `pnl_purchase_price_rma_candidates.standard_unit_price_yen`, `actual_purchase_unit_cost_yen`, `price_fact_id`, `price_accepted_at` | **PARTIAL**; source `giga.price` producer & lineage not fully reconciled |

Supplementary observed DB fields (schema existence per [#53](https://github.com/retailpulses/.github/issues/53)): `public.product_commercials.effective_cost_price`, `baseline_price`, `previous_unit_price`; `public.baserow_886994_compat_vw."Unit Price"`, `"Discounted Unit Price"`, `"Effective Cost Price"`. **Names are not proof of business equivalence.**

## Mapping record contract and acceptance

Future machine-readable records, only when useful, use:
`term_id | definition | source_system | api_endpoint/version | source_json_path | transform | target_system | schema.table.column | grain/join_key | currency/unit | null_policy | effective_time | owner | evidence | status | consumers`.

- `VERIFIED`: actual sanitized source sample + adapter writer + DB row/query + product consumer, with environment/date/commit/test evidence.
- `PARTIALLY VERIFIED`: some code/schema edges inspected, no full chain.
- `UNKNOWN`: no trustworthy current evidence; never silently fill.
- Never rename columns or add a mapping DB for documentation convenience. Business-rule behavior remains with Owner-specific Design/TRD/tests.
- E2E confirmation priority: (1) price `item.price` → CatalogSync → `source_unit_price` vs SQLite accepted `standard_unit_price_yen`; (2) seller identity; (3) actual purchase + PO/Item Code association; (4) fulfillment fee provenance; (5) candidate ↔ Supplier RMA distinction.
