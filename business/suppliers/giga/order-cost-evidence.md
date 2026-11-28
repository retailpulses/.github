# Giga 订单级成本取证（Order Cost Evidence）— BUS-PRC-005

状态：**API 事实 VERIFIED（2026-11-28，只读实测）／毛利与 RMA 用法 PROPOSED（待 Sponsor 决定）** · Owner（建议）：Business Operations / Finance · 依据：[Pricing Contract](../../pricing-contract.md)、[Shipping Fee Master Rule](../../shipping-fee-master-rule.md)、[REF-GIGA-DATA](../../../references/giga/data-dictionary-mapping.md)

范围：本文记录 GigaB2B 订单级成本字段的可取性、口径与用途讨论。**不改变任何 RMA 阈值、审批流程或会计政策**；不授权写库、改单、联系供应商或自动提交 RMA。

## 1. 结论

1. **按 shipment ID 可以取到该笔订单的真实成本拆分**：商品成交成本（`feeType=1`）、履约费（`feeType=2`，含运费+包装）、仓储费（`feeType=4`）以及另外 11 类费用。这是目前唯一"订单时点"的成本证据。
2. production Postgres 的 `giga_cogs_shipment_lines` **只有订单总额**（`order_total_jpy` / `grand_total_jpy` / `storage_and_protection_fee_jpy`），**没有拆分、没有成交单价**；`product_commercials.source_unit_price` 是**当前目录价**，不是成交价。
3. 因此：**单笔毛利可以用 API 算准；RMA 筛选可以从"合计近似"升级为"分量精确比对"**——但后者属规则变更，须 Sponsor 批准后才能替换现行的 `current_price_proxy`。
4. **两个下游系统尚未接入**：store-ops/monthlypnl 的履约成本仍是人工确认产物，commerce-ops/Order Mgmt 的 Giga 客户端只调 `track-no` 与 `dropShip-sync`，都没有 `order/detail/v1`。详见 §6。

## 2. API 事实（已验证）

`POST https://openapi.gigab2b.com/b2b-overseas-api/v1/buyer/order/detail/v1`

```json
{ "orderNo": ["<Giga shipment ID>"], "includeRecipientInfo": false }
```

- `orderNo` 是 **Giga shipment ID**（形如 `2JTGxpjypCMXEKUJQ4QS9Q`），不是 Mercari 订单号，也不是 `purchase_order_id`。
- 单次最多 200 个；只读；签名同 Open API 2.0（`client-id` / `timestamp` / `nonce` / `sign`）。
- 返回：`totalAmount`、`netTotalAmount`、`discountAmount`、`storeCreditAmount`、`currencyCode`、`orderStatus`、`orderType`、`isException`、`feeDetails[]`、`orderDetails[]`。

### 2.1 feeDetails 的 15 类费用（官方枚举）

| feeType | 名称 | 含义 | 本批 161 单出现次数 |
|---:|---|---|---:|
| 1 | Item Cost | **成交价 × 数量**（`Transacted price * Quantity`） | 159 |
| 2 | Fulfillment Fee | **含运费与包装费** | 159 |
| 3 | Customs Clearance Fee | 清关费 | 0 |
| 4 | Storage Fee | 仓储费 | 18 |
| 5 | DSR Service Fee | DSR 服务费 | 0 |
| 6 | Protection Service Fee | 保障服务费 | 0 |
| 7 | Return Label Service Fee | 退货面单费 | 0 |
| 8 | Pallet Measurement Charge | 托盘测量费 | 0 |
| 9 | Restocking Fee | 重新入库费 | 0 |
| 10 | Pallet Usage Fee | 托盘使用费 | 0 |
| 11 | Specified Warehouse Fee | 指定仓费（含共享库存） | 0 |
| 12 | Cloud Warehouse Fee | 云仓费 | 0 |
| 13 | Warehouse Change Fee | 换仓费 | 0 |
| 14 | Required Ship Date Service Fee | 指定发货日服务费 | 0 |
| 15 | Interception Fee | 拦截费（**不计入 totalAmount**） | 0 |

`totalAmount` 官方公式 = Item Cost + Specified Warehouse Fee + Fulfillment Fee + Storage Fee + Protection Service Fee + Return Label Service Fee + DSR Service Fee + Customs Clearance Fee + Pallet Measurement/Usage Fee + Restocking Fee + Required Ship Date Service Fee + Cloud Warehouse Fee + Warehouse Change Fee。**Interception Fee 不在其中。**

### 2.2 口径要点

- **税**：`feeAmount` 对 JP/US/DE/UK 市场为**不含税**，仅 CAN 为含税。日本帐可直接取用，不得再加税。
- **币种**：必须读 `currencyCode`，不得假定 JPY。
- **状态**：`orderStatus=1` 为 Unpaid，此时成本可能未定稿。
- **未出账**：`feeDetails` 为空且 `totalAmount=null` 属未计费（本批 2 笔），**不得记为零成本**。
- **无逐行单价**：`orderDetails[]` 仅含 `sku` / `sellerStore` / `qty` / `skuStatusInfo` / `isCombo` / `comboInfo` / `rmaId`，**没有 unitPrice**；`feeType=1` 是整单合计。
- **限流**：官方文档标注 `order/detail/v1` 为 **5 requests / 10 seconds**、单次最多 200 单；批量取数需自行限速与缓存。

### 2.3 与内部数据的一致性（实测 3 例）

| shipment ID | 目的地 | feeType 1 | feeType 2 | feeType 4 | API totalAmount | DB `order_total_jpy` |
|---|---|---:|---:|---:|---:|---:|
| `2JTGxpjypCMXEKUJQ4QS9Q` | 北海道 | 3,330 | 1,881 | — | 5,211 | 5,211 ✔ |
| `2JSXnQXZQKBnZN2i9bGcw7` | 冲绳 | 3,000 | 4,246 | 4 | 7,250 | 7,250 ✔ |
| `2JTDoaoKihVAmN8ockzQEp` | 东京 | 7,080 | 1,001 | — | 8,081 | 8,081 ✔ |

→ **总额一致**，差异只在"有无拆分"。requestId：`7a8df582307af589`、`be893f83d7f4acba`、`6201d7750f7732b8`、`b6ca18e654bbf4d1`、`1d5f4e73c7a81b94`。

## 3. 毛利计算用法

### 3.1 口径映射

| Pricing Contract 概念 | 本文证据 | 说明 |
|---|---|---|
| BUS-PRC-001 Standard TCOGS = U + F_u | `price` + `shippingFee`（Price API，当前值） | 定价用，**不是**实际成本 |
| BUS-PRC-002 Effective TCOGS | `feeType=1` + `feeType=2`（订单实际） | 核算用，**不得**与 Standard TCOGS 混用 |
| BUS-PRC-003 Direct Margin | 收入 − 平台佣金 − 实际成本 | 分母/分子口径见 Contract，本文不改 |

**去重红线**：`feeType=2` 已含运费与包装费，**不得**再加 `fulfillment_fee`、`shippingFee` 或包装费；`feeType=4` 与 DB `storage_and_protection_fee_jpy` 是同一笔，不可双计。

### 3.2 单笔毛利（可用今天的 API 完成）

```
实际成本 = Σ feeType(1,2,4,6,7,9,...)        # 逐单取，不估算
单笔贡献 = 结算收入 − 平台佣金 − 实际成本
```

同一天三个目的地订单的实际成本率差异极大（履约费占 3,000 成本的比例：东京 1,001 / 北海道 1,881 / 冲绳 4,246），**因此按订单实际目的地核算，禁止用平均运费率**。

### 3.3 已知缺口

1. **多行订单无逐 SKU 成交价**。`feeType=1` 是整单合计；要把成本拆到 SKU 必须另行分摊（或改用 PO 报表 CSV/UI 的 `Unit Price (After Discount)`），分摊方法属会计决策，本文不预设。
2. **组合商品**：`feeType=2` 覆盖整套包裹，`comboInfo` 只给子 SKU 构成，无金额分摊。
3. 历史价差：当前 `product_commercials.source_unit_price` 与成交价可比性有限（见 4.3 实例）。

## 4. RMA 筛选用法（讨论稿 — 不改变现行规则）

### 4.1 现行做法（仍为有效口径）

`supplier-rma-price-gap` 技能按 **合计近似** 判候选：`order_total ≈ (当前 Unit Price + 当前 shippingFee) × qty`，严格差值 < ¥100，模式 `current_price_proxy`；并排除任何已存在 RMA 的采购单。该方法自认是近似，因为 `order_total` 是合计、当前价会漂移。

### 4.2 新证据带来的改进点

有了 `feeType=1`（成交价×数量）和 `feeType=2`（实际履约费），可以**分量比对**，而不是只比合计：

```
paid_unit_price      = feeType1 / qty            # 单行订单可直接得出
current_unit_price   = Price API price           # 或 discounted/exclusive（视比对基准）
base_gap             = (paid_unit_price − current_unit_price) × qty
fulfillment_gap      = feeType2 − current_shippingFee
```

价值：**合计比对会把两个方向的价差互相抵消**（例如商品多付 500、运费少付 500，合计看起来"刚好等于标准价"）。分量比对能区分"真的按标准价买入"与"两项偏差互相掩盖"，减少假阳性/假阴性。

### 4.3 实例（真实数据）

| SKU | 成交单价（feeType1/qty） | 当前 Price API | 结论 |
|---|---:|---:|---|
| `N511P429780B` | 7,080 | 7,080（无折扣、无专享价） | **典型候选**：完全按标准价买入 |
| `N510P469767Z` | 3,330 | 3,700 | 非候选：买入价低于当前标准价 |
| `N510P254504N` | 3,000 | 4,600（专享价 4,300） | 非候选：买入价远低于当前专享价 |

`N510P469767Z` 同时说明：**当前目录价与成交价可以相差约 10%**，这正是 `current_price_proxy` 的风险来源。

### 4.4 建议的判定式（PROPOSED，需 Sponsor 批准后才替换现行规则）

- 候选条件：`base_gap > 0` 且 `abs(base_gap) ≥ difference_threshold_jpy`（默认仍为 ¥100，**阈值不变**），且 `abs(fulfillment_gap) < 容忍值`（避免把运费差当成价差索赔）。
- 仍排除：任何已有 RMA 的采购单（全 item、全类型、全状态），跨状态查询。
- 仍要求：人工复核后才可提交；本流程不自动提交、不联系供应商。
- 允许降级：若 `feeType=1` 缺失（未出账/接口不可用），退回现行 `current_price_proxy` 近似，并在输出中标注 `price_reference_mode`。

### 4.5 尚需确认的会计问题

1. 比对基准应取 `price`（标准价）还是 `discountedPrice`/`exclusivePrice`？若当时已有专享价而按标准价买入，才是可索赔差额。
2. 返点（`rebatesPrice`）、阶梯价（`spotPrice`）、协议价（`marginPrice`）与 `feeType=1` 的关系未验证——成交价可能已含这些优惠，直接与 `price` 比对会误判。
3. 多行订单无法拆价（4.3 已述），只能整单比对。

## 5. 限制与不得做的事

- 本文不改变 BUS-PRC-001/002/003 定义，不改变 RMA 阈值与排除规则。
- 不得把 `feeType=2` 与 `shippingFee` 相加；不得把 `storage_and_protection_fee_jpy` 与 `feeType=4/6` 相加。
- 不得把空 `feeDetails` 当 0，不得把 Unpaid 订单计入已发生成本。
- 不得用合计差额直接对外索赔：需分量证据 + 人工复核。
- 不得据本文自动创建 RMA、改单、写库或联系供应商。

## 6. 下游消费者与集成点（现状事实）

本节只记录**已读到的代码事实**，不代表已实施任何改动。两个系统的现状都还停留在"合计 + 人工/启发式"，尚未接入 `order/detail/v1`。

### 6.1 store-ops / monthlypnl（核算侧）

现状（`monthlypnl/`）：

| 事实 | 位置 |
|---|---|
| 成本匹配表按销售行记录 `unit_purchase_cost_yen`、`unit_fulfillment_cost_yen`，带 `status`（`PROPOSED` / `MATCHED` / `CONFIRMED`）与 `evidence_json` | [monthlypnl/service.py](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/service.py)（`pnl_cost_matches` 写入路径） |
| 履约成本目前**不是** API 派生：代码注释明确 "ambiguous PO candidates and **fulfillment remain unresolved**"，`CONFIRMED` 要求采购成本与履约成本都已填 | [monthlypnl/service.py](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/service.py)（约 1196、1272 行） |
| 供应商 RMA 结算事实由供应商报表导入（一行一条源记录，保留重复 RMA ID），并做 `order_` 前缀归一化与 PO ID 科学计数法归一化 | [monthlypnl/rma.py](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/rma.py) |
| 采购/履约成本的来源是 P&L 导入 + 人工确认，**没有**逐单费用拆分 | 同上 |

**可对接点**：`feeType=1` 可直接作为 `unit_purchase_cost_yen` 的证据，`feeType=2` 可作为 `unit_fulfillment_cost_yen` 的证据（均需 `/ qty` 且限单行订单），从而把这两列从"人工确认"升级为"API 取证 + 人工复核"。注意 [monthlypnl/rma.py](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/rma.py) 会把 `order_` 前缀去掉，与 Giga shipment ID 的实际形态一致，join 时须沿用同一归一化规则。

### 6.2 commerce-ops / Order Mgmt（订单运营侧）

现状（`apps/orders/`）：

| 事实 | 位置 |
|---|---|
| 已实现签名的 Giga 2.0 客户端，且**只调用两个端点**：`buyer/order/track-no/v1`（`getTrackingInfo`）与 `buyer/order/dropShip-sync/v1`（`createOrder`） | [apps/orders/src/lib/giga-client.mjs](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/src/lib/giga-client.mjs) |
| 客户端硬性拒绝非 `openapi.gigab2b.com` / sandbox 的主机，符合"只用 2.0"约束 | 同上 |
| 毛利拆解组件在 `effective_cogs == source_unit_price`（Giga Unit Price）时告警 "⚠ Supplier price needs confirmation" | [MarginBreakdown.tsx](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/portal/src/components/detail/MarginBreakdown.tsx) |
| 运营可筛选 `price_confirmation_needed`（"Price confirmation needed"） | [FilterBar.tsx](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/portal/src/components/layout/FilterBar.tsx) |
| 订单行类型已有 `cogs_unit_price_equal: boolean` | [orders.ts](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/portal/src/types/orders.ts) |

**关键差异**：Order Mgmt 的这条告警是**启发式**——它比较的是"我们算出的 Effective COGS 是否等于**当前** Giga Unit Price"，而不是"这笔订单**当时实际付了多少钱**"。而 `order/detail/v1` 的 `feeType=1` 正是当时的成交价，`feeType=2` 是当时的实际履约费。

**未接入**：`giga-client.mjs` 目前没有任何 `order/detail/v1` 调用，因此订单运营界面拿不到逐单费用拆分；采购前的成本判断仍依赖目录价启发式。

### 6.3 可能的集成方向（PROPOSED，未实施，不授权）

1. **Order Mgmt**：在"下单前确认"和"毛利拆解"环节，按 shipment ID 拉取 `order/detail/v1`，用实际 `feeType 1/2` 替换启发式告警；保留人工确认步骤。
2. **monthlypnl**：把 `feeType 1/2` 作为 `pnl_cost_matches` 的 `evidence_json` 来源，缺失时仍走人工 PROPOSED 流程。
3. **RMA 技能**：按 §4.4 的分量比对替换 `current_price_proxy`（需 Sponsor 批准）。
4. 实施注意：`order/detail/v1` 官方限流 **5 requests / 10 seconds**、单次 200 单；Price API 为 10/10s。批量化与缓存策略必须设计，否则会拖慢运营界面。

## 7. 待 Sponsor 决定

1. 是否批准 4.4 的"分量比对"模式替换 `current_price_proxy`（若不批准，维持现状，本文仅作证据记录）。
2. RMA 比对基准（`price` / `discountedPrice` / `exclusivePrice`）与返点、阶梯价的处理顺序。
3. 多行订单成本分摊方法（按数量平均 / 按当前价比例 / 不拆）。
4. 是否将订单级实际成本回溯写入核算表，及其更新频率。

## 8. 验收与证据

- API 事实：6 次 Price 调用（217 条 / 210 SKU）、3 次 Detail 调用（135 条）、订单详情 161 单，均只读；requestId 见 2.3。
- 官方文档：GigaB2B 帮助中心 Open API 2.0（`doc_id=32` Shipment Details Query，`doc_id=7` Product Price Query）。
- DB 交叉验证：3 单 `totalAmount` = `order_total_jpy`。
- 原始响应与脚本保存在研究目录（未入库），文档只保留净化片段。

## 9. 用订单详情 API 取准成本的正确操作（DRAFT 待审）

目的：说明需要"某笔订单的真实成本"时应如何取数、如何判定、如何与 Charges 报表核对。**字段名、表名、枚举值一律沿用原始表述，不做翻译。** 本节不涉及任何具体月份或店铺的比对结论。

### 9.1 调用方式

- Endpoint：`POST /b2b-overseas-api/v1/buyer/order/detail/v1`
- Body：`{"orderNo": ["<orderNo>"], "includeRecipientInfo": false}`
- `orderNo` 为订单/履约号，对应 Giga Charges 报表中的 `Related Order ID`
- 单次最多 200 个；官方限流 **5 requests / 10 seconds**
- 响应信封：`success` / `code` / `data` / `requestId` / `msg` / `subMsg` / `recommend`

### 9.2 取哪些字段（原始名称）

| 目标 | JSON path | 官方语义 |
|---|---|---|
| 商品成本 | `data[].feeDetails[]`，`feeType=1` | Item Cost = Transacted price * Quantity |
| 履约费（含运费与包装费） | `data[].feeDetails[]`，`feeType=2` | Fulfillment Fee (including shipping and packing fees) |
| 仓储费 | `data[].feeDetails[]`，`feeType=4` | Storage Fee |
| 其他费用 | `feeType` 3、5–15 | 完整枚举见 §2.1 |
| 币种 | `data[].currencyCode` | 不假定 JPY |
| 订单状态 | `data[].orderStatus` | 枚举见 9.3 |
| 订单总额 | `data[].totalAmount` | 含税口径按市场而定 |
| 折后总额 | `data[].netTotalAmount` | `totalAmount` − coupon − store credit |

每条 `feeDetails[]` 记录含 `feeType`、`feeName`、`feeAmount`。

### 9.3 计入与排除规则

- **排除** `orderStatus` = `1`（Unpaid）、`16`（Canceled）、`512`（Canceled (time out)）。
- `feeDetails` 为空且 `totalAmount` 为 `null` 时**不等于 0**，须先看 `orderStatus`。
- `feeAmount` 对 JP / US / DE / UK 市场为**不含税**，CAN 为含税。
- `feeType=2` 已含运费与包装费，**不得**再加 `Shipping Fee Per Unit (JPY)`、`Packing Fee Per Unit (JPY)`、或 `public.product_commercials.fulfillment_fee`。
- `feeType=4` 与 `public.giga_cogs_shipment_lines.storage_and_protection_fee_jpy` 口径不同（后者为 storage + protection），不可互替。

### 9.4 订单范围从哪来（Giga Charges 报表）

`Fulfillment Fee` sheet 的可用列：

`Fee ID`、`Related Order ID`、`Fee Type`、`Status`、`Creation Time`、`Purchase Order Detail ID(Product)`、`Item Code`、`Seller`、`QTY`、`Product Order ID/Detailed QTY`、`Shipping Fee Per Unit (JPY)`、`Packing Fee Per Unit (JPY)`、`Total(JPY)`、`Paid Amount(JPY)`、`Payment Time`、`Cancelled QTY`、`Refund Amount(JPY)`

规则：

1. **join key 是 `Related Order ID`**，直接作为 `orderNo` 调用 API。
2. `Purchase Order Detail ID(Product)` 是采购明细行标识，**不是** `purchase_order_id`；两者不是同一标识，不能互查。
3. 一个 `Purchase Order Detail ID(Product)` 可对应**多个** `Related Order ID`（分批发货、跨渠道），因此不能按明细只取一条。
4. `Related Order ID` 形态有三种：`2J…`、`order_2J…`、以及 3-7-7 形式的渠道订单号（如 `250-…`、`503-…`）；第三类属其他渠道，不计入本店铺。

### 9.5 与 Charges 报表核对时的净额口径

- 履约净额 = `Total(JPY)` − `Refund Amount(JPY)`；或等价地排除 `Status = "Refunded"` 与 `Cancelled QTY > 0` 的行。
- 仓储应付 = `Storage Fee Payable(JPY)`，与 `feeType=4` 一致；**不要**用 `Total Storage Fee(JPY)`（应计毛额）。`Paid Amount(JPY)` 与 `Payable` 应一致，可用于二次校验。
- 校验顺序：先确认 Charges 净额与 API 相等；若不等，先排查 `Status`、`Cancelled QTY`、`Refund Amount(JPY)` 与渠道号段，**再**考虑分摊问题。

### 9.6 与月报成本比较时的限制

- 月报的商品成本按"销售匹配单位"计，API `feeType=1` 按订单计，两者单位集不同，**不可直接相减**；比较时必须同时报单位数。
- 任何差异须归入三类之一：口径差 / 时点差 / 真实漏计；不能归类时记 UNKNOWN，不得直接当作调整金额。
