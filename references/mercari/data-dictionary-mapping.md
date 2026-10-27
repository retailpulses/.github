# REF-MERCARI-DATA — Mercari Shops 官方术语、契约与内部映射

Status: OFFICIAL DOC CHECKED / INTERNAL LINEAGE UNVERIFIED · 2026-10-27 · [Issue #53](https://github.com/retailpulses/.github/issues/53)

## 权威来源与约束

- [Mercari Shops Public API Reference](https://api.mercari-shops.com/docs/index.html)（官方，GraphQL schema、Query、Mutation、Webhook、FAQ、Changelog）。Production `https://api.mercari-shops.com/v1/graphql`；Sandbox `https://api.mercari-shops-sandbox.com/v1/graphql`。
- API 文档中的类型/字段为官方语言；本地 SPU1、Canonical Variant、Hero、Copy 状态、needs_reply 等为 **Retailpulses 内部概念**，不得冒充官方枚举。
- 官方说明 API 访问令牌识别 Shop；Rate Limit 按 Shop 共享，多个 Token 不形成独立额度。字段可用性随 schema 版本变化，映射需注明查询版本与证据日期。
- 官方 2026-10-14 Changelog 与后续购物车/消息 API 变更计划要求消费者进行兼容性审计；不得把计划中的接口视为已上线。

## A. 官方原生实体与字段（保留原名）

| ID | 官方对象 / 原始字段 | 官方含义 / 基数 | 内部候选映射与注意事项 |
|---|---|---|---|
| MRC-O01 | `Shop`, `shopId`, webhook `shop_id` | 店铺身份；Webhook 带 shop_id | Shop1–4 是内部别名；需要一对一 ID 表，不能与 Seller 混同 |
| MRC-O02 | `Product`, `product_id` | 商品级实体；一个 Product 可以有多个 ProductVariant | Shop-specific Listing 候选；不等于内部 SPU1 |
| MRC-O03 | `ProductVariant`, `id`, `skuCode` | 商品下的 SKU/变体；官方 FAQ：商品管理コード → ProductVariant.skuCode | Item Code 候选映射，但需要确认编码规则与跨店唯一性；不是内部 Variant UUID |
| MRC-O04 | `OrderVariant.skuCode` | 订单明细 SKU；官方 FAQ：CSV `original_product_id` 对应此字段 | 订单行与商品 SKU 关联；需核验历史订单及空值 |
| MRC-O05 | `OrderStatus` | `CREATING`, `WAITING_FOR_PAYMENT`, `WAITING_FOR_SHIPPING`, `COMPLETING`, `COMPLETED`, `CANCELING`, `CANCELED`, `UNSPECIFIED` | 平台交易状态；不可直接等同内部 fulfillment/job 状态 |
| MRC-O06 | `OrderShippingStatus` | `CREATED`, `WAITING_FOR_SIZING`, `COMPLETING`, `COMPLETED`, `CANCELED`, `UNSPECIFIED` | 独立的发货状态机；不能以 OrderStatus 代替 |
| MRC-O07 | `completeOrder` | 官方发货完成相关 Mutation | 生产写入；须验证权限、幂等、回读 |
| MRC-O08 | `updateProductVariant`, `updateProductVariants` | 单 SKU / 批量 SKU 更新；官方 FAQ 批量上限 20 SKU | 与库存绝对值写入相关；并发更新可能覆盖 |
| MRC-O09 | `productVariant` Query | 官方建议按 SKU 查询确认商品是否注册成功 | `createProduct` 即使返回错误也可能实际创建；重试前先回读 |
| MRC-O10 | `ShippingConfiguration`, `shippingConfigurationId` | 商品配送配置的实体与关联 ID | 运费事实不能从 Inquiry 文本或内部模板猜测 |
| MRC-O11 | `Inquiry` / message / webhook topics | 官方 Inquiry/消息域；具体版本和替代关系以 schema 为准 | Inquiry thread、needs_reply 与回复策略分离；消息 API 有变更计划 |
| MRC-O12 | `catalogId`, `janCode` | 商品目录关联 / JAN 编码 | 不等于内部 SPU1 / Item Code |
| MRC-O13 | `price` | API 商品价格；官方 FAQ：Time Sale 时可返回折后展示价格 | 不能当作常态原价、采购价或利润成本 |
| MRC-O14 | `order_id`, `product_id`, `variant_id` | 外部平台 ID；官方不保证固定长度 | DB 用字符串，避免固定 22 字符或强制整数 |
| MRC-O15 | `X-Ratelimit-Used`, `X-Ratelimit-Reset` | 官方速率限制响应 Header | 每店小时 10,000 points；按实际查询成本与 Header 观测 |

## B. Retailpulses 内部词汇（明确不是平台 Schema）

| Internal term | 业务定义 | 不能等同于 |
|---|---|---|
| SPU1 | 内部商品族/上层分组 | Mercari Product ID |
| Canonical Variant | 跨店共享文案/图片的内部 Variant 实体 | Mercari ProductVariant.id |
| Item Code | 内部/上游 SKU 识别码；需通过编码规则映射 | 所有 Shop 的外部 SKU 自动全局唯一 |
| Shop1–4 | 本地运营店铺别名 | Mercari 官方 shopId 字面值 |
| Copy READY/PUBLISHED/BLOCKED | 内部文案/发布状态 | Mercari OrderStatus、Product 发布枚举 |
| needs_reply | 内部 Inquiry 人工接手意图 | Mercari 原生 Inquiry 状态 |
| Time Sale GENERATED/ACTIVE | 内部 CSV 生成状态与卖家侧观测 | Product.price 的单一数值 |

## C. 端到端映射核验矩阵（尚未 VERIFIED）

| Mapping | Source contract | Owner adapter / schema | 必须补充的证据 |
|---|---|---|---|
| Shop | `shopId` / `shop_id` | [commerce-ops shop state](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/src/lib/mercari-shop-state.mjs) | 四店 external ID→本地 alias→DB column |
| SKU / Listing | `ProductVariant.skuCode`, `Product.product_id` | [NPL](https://github.com/retailpulses/store-ops/tree/main/apps/mercari) | API payload→Variant mapping→per-shop publication readback |
| Order lifecycle | `OrderStatus`, `OrderShippingStatus` | [Orders webhook contract](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/webhook/mercari-event-contract.md) | Webhook→mapper→Supabase/SQLite→UI |
| Inquiry | Inquiry API + webhook | [Inquiry mappers](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/worker/src/mercari/mappers.ts) | 官方字段→projection→Agent policy |
| Price / Time Sale | `price` / CSV | [CSV uploader](https://github.com/retailpulses/retailpulses-tool-services/blob/main/packages/mercari/upload-csv/upload-mercari-csv/upload_mercari_csv_to_shops.py) | 原价、活动价、状态、观察时间独立留存 |

**不得推断：** API 不提供 likes/views 的公开读取能力（官方 FAQ）；不得把 Hero demand signal 伪称可由该 API 直接读取。原始字段与 schema 名称需要对当前正式 schema 再做机械比对；以上是官方文档抽样核验，不是完整 GraphQL schema dump。禁止保存 Token、买家 PII、原始私密消息。

Related: [API Reference](inquiry-api.md) · [Access Inventory](capability-inventory.md).
