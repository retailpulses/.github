# Giga 订单级成本取证（Order Cost Evidence）— BUS-PRC-005

状态：**API 事实 VERIFIED（2026-11-28，只读实测）／毛利与 RMA 用法 PROPOSED（待 Sponsor 决定）** · Owner（建议）：Business Operations / Finance · 依据：[Pricing Contract](../../pricing-contract.md)、[Shipping Fee Master Rule](../../shipping-fee-master-rule.md)、[REF-GIGA-DATA](../../../references/giga/data-dictionary-mapping.md)

范围：本文记录 GigaB2B 订单级成本字段的可取性、口径与用途讨论。**不改变任何 RMA 阈值、审批流程或会计政策**；不授权写库、改单、联系供应商或自动提交 RMA。

## 1. 结论

1. **按 shipment ID 可以取到该笔订单的真实成本拆分**：商品成交成本（`feeType=1`）、履约费（`feeType=2`，含运费+包装）、仓储费（`feeType=4`）以及另外 11 类费用。这是目前唯一"订单时点"的成本证据。
2. production Postgres 的 `giga_cogs_shipment_lines` **只有订单总额**（`order_total_jpy` / `grand_total_jpy` / `storage_and_protection_fee_jpy`），**没有拆分、没有成交单价**；`product_commercials.source_unit_price` 是**当前目录价**，不是成交价。
3. 因此：**单笔毛利可以用 API 算准；RMA 筛选可以从"合计近似"升级为"分量精确比对"**——但后者属规则变更，须 Sponsor 批准后才能替换现行的 `current_price_proxy`。

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

## 6. 待 Sponsor 决定

1. 是否批准 4.4 的"分量比对"模式替换 `current_price_proxy`（若不批准，维持现状，本文仅作证据记录）。
2. RMA 比对基准（`price` / `discountedPrice` / `exclusivePrice`）与返点、阶梯价的处理顺序。
3. 多行订单成本分摊方法（按数量平均 / 按当前价比例 / 不拆）。
4. 是否将订单级实际成本回溯写入核算表，及其更新频率。

## 7. 验收与证据

- API 事实：6 次 Price 调用（217 条 / 210 SKU）、3 次 Detail 调用（135 条）、订单详情 161 单，均只读；requestId 见 2.3。
- 官方文档：GigaB2B 帮助中心 Open API 2.0（`doc_id=32` Shipment Details Query，`doc_id=7` Product Price Query）。
- DB 交叉验证：3 单 `totalAmount` = `order_total_jpy`。
- 原始响应与脚本保存在研究目录（未入库），文档只保留净化片段。
