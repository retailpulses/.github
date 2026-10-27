# REF-RAKUTEN-DATA — Rakuten RMS 官方术语与内部映射

Status: OFFICIAL TERMINOLOGY CANDIDATES / FIELD CONTRACT UNVERIFIED · 2026-10-27 · [Issue #53](https://github.com/retailpulses/.github/issues/53)

## Authority 与系统边界

- **RMS WEB SERVICE** 是 Rakuten Ichiba 商家后台的 API 域。部分官方 API 文档须登录 RMS 才能核实，现有代码与第三方 SDK 不能替代官方 schema。
- **Rakuten Web Service**（公开消费者/商品搜索 API）与 **RMS WEB SERVICE** 不同；不得将 Ichiba Search API 的字段、认证、额度套用到 RMS。
- 原始日文术语保持日文；中文仅解释业务语义。英文 API 名称按官方原样引用。未取得官方 schema 的字段路径标 **UNVERIFIED**，不伪造。
- 参考 [现有 RMS API Reference](rms-api.md)；后续须补官方 RMS 登录文档的 URL/版本/字段截图或脱敏响应（不得含凭据）。

## A. 平台术语层（Japanese original / API family）

| ID | 日文平台术语 | API family / 已知代码证据 | 正确定义与边界 | 核验状态 |
|---|---|---|---|---|
| RKT-O01 | 店舗 / ショップ | RMS ESA credential context | Rakuten 店铺账户；不能与 GigaB2B Seller 或 Mercari Shop ID 合并 | BUSINESS TERM; ID FIELD UNKNOWN |
| RKT-O02 | 商品管理番号 | ItemAPI 2.0 / [item snapshot](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_item_snapshot.py) | 店铺商品管理身份；与内部 Item Code / SPU1 的对应须显式 join | RAW FIELD UNKNOWN |
| RKT-O03 | 商品番号 | ItemAPI / RMS UI | 与商品管理番号不同的商品编号语义；不能凭名称混同 | RAW FIELD UNKNOWN |
| RKT-O04 | SKU / バリエーション | ItemAPI 2.0 / InventoryAPI 2.1 | 同商品下的销售规格与库存管理粒度；须核实 RMS SKU key 和内部 Variant UUID | RAW FIELD UNKNOWN |
| RKT-O05 | 商品名 / 商品説明文 | ItemAPI / SEO | RMS 商品标题、说明文；SEO 策略是内部设计，不是平台原生字段 | RAW FIELD UNKNOWN |
| RKT-O06 | 販売価格 | ItemAPI / pricing | 店铺销售价格，**不是** Giga 标准采购单价或实际采购成本 | RAW FIELD UNKNOWN |
| RKT-O07 | 在庫数 | InventoryAPI 2.1 / [CatalogSync adapter](https://github.com/retailpulses/CatalogSync/blob/main/lib/catalogsync/rakuten.py) | SKU 库存数；更新策略/同步方向必须标注 | RAW FIELD UNKNOWN |
| RKT-O08 | 注文番号 / 受注 | Order API / [commerce-ops pipeline](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/rakuten-order-pipeline.md) | Rakuten 订单实体；不同于内部 fulfillment job | RAW FIELD UNKNOWN |
| RKT-O09 | 発送 / 出荷報告 | Order API / [order closer](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/src/lib/rakuten-closer.mjs) | 发货/回报流程；需核对真实平台状态机与可写动作 | RAW FIELD UNKNOWN |
| RKT-O10 | クーポン / クーポン発行 | CouponAPI / [coupon POC](https://github.com/retailpulses/RPagentOS/blob/main/poc/rakuten-coupon-api/POC_REPORT.md) | Coupon 定义、发放、使用条件分别建模；不等于促销 Calendar Event | RAW FIELD UNKNOWN |
| RKT-O11 | ポイント倍率 / キャンペーン | RMS promotion operations | 积分/活动与 Coupon 是不同促销 archetype；各自执行通道可能为 RMS UI | API SUPPORT UNKNOWN |
| RKT-O12 | お問い合わせ / R-Messe | InquiryManagementAPI / [read POC](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/docs/poc/rakuten-rmesse-api-read-poc.md) | Inquiry thread/message，不等于内部 Ticket 状态 | READ POC ONLY |
| RKT-O13 | 画像 / R-Cabinet | Cabinet tools / [collector](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_cabinet_inventory.py) | 店铺图片资源与商品图片关联需分开建模 | RAW FIELD UNKNOWN |
| RKT-O14 | CSV 商品一括登録 / SFTP | [SFTP runbook](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/docs/SFTP-RETRIEVAL.md) | 文件导入/导出通道，非 RMS REST API；能力和费用单独核实 | FILE CONTRACT UNKNOWN |

## B. 内部概念（非 RMS 官方术语）

| Internal concept | 与平台的关系 |
|---|---|
| SPU1 / Canonical Variant / Item Code | 内部产品族、规格和供应链 SKU；必须建立 RMS 商品管理番号 / SKU 的外部身份映射 |
| Promotion Archetype | 内部对 Coupon、Points、Campaign 等机制的分类，不等于一个 RMS API |
| Promotion Calendar | 活动窗口/运营规划；不是 Coupon 发行成功证据 |
| SEO Action Queue | 内部作业队列；不是 RMS 原生 SEO API |
| Draft / Review / Publish / Readback | 内部操作流程；与平台发布状态分开存储 |
| Seller ASUKA/HEYA/TBO | 供应商/销售方业务维度，不能直接当作 Rakuten 店铺 ID |

## C. 必须完成的字段链路

| Priority | Source | Adapter / consumer | Blocking evidence |
|---|---|---|---|
| P0 | ItemAPI 2.0 商品管理番号 / SKU / 商品名 / 販売価格 | [item collector](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_item_snapshot.py) → Rakuten listing/SEO | 官方原始 JSON paths、主键、写入 DB 列 |
| P0 | CouponAPI クーポン / 使用条件 | [coupon POC](https://github.com/retailpulses/RPagentOS/blob/main/poc/rakuten-coupon-api/README.md) → Promotion archetype | 官方 Coupon schema、发行/更新权限、readback |
| P0 | Order API 注文番号 / 出荷状態 | [commerce-ops Orders](https://github.com/retailpulses/commerce-ops/tree/main/apps/orders) | Order ID→Supabase/SQLite→UI 生命周期 |
| P1 | InventoryAPI 在庫数 | [CatalogSync](https://github.com/retailpulses/CatalogSync/blob/main/lib/catalogsync/rakuten.py) | SKU join、绝对/增量更新、错误/重试 |
| P1 | R-Messe 問い合わせ | [Tickets POC](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/docs/poc/rakuten-rmesse-api-read-poc.md) | 原始字段→Ticket projection |
| P1 | R-Cabinet 画像 | [commerce-lab tools](https://github.com/retailpulses/commerce-lab/tree/main/services/rakuten/tools/rms) | 文件/图片 ID 与 Listing 引用 |

Mapping 必填：`official_japanese_term | official_API_field | endpoint/version | source_json_path | adapter | DB table.column | grain | join_key | unit | time | owner | evidence | status`。**当前所有具体 Live API→DB lineage 尚未完成验证**，不能因术语合理就标 VERIFIED。

Related: [RMS Reference](rms-api.md) · [Inventory](capability-inventory.md).
