# Shipping Fee Master Rule — BUS-LOG-002

状态：Sponsor-confirmed business decisions / Giga API runtime verified 2026-11-28（字段语义经官方文档确认；区域费实测 1881/4246，逐 SKU 预取不可行）· 2026-11-28
Owner（建议）：Business Operations / Procurement
范围：Mercari Shops 的 GigaB2B 商品运费询价，Shop4 优先。此文档不授权自动收费、改价或发送消息。
依据：Sponsor 2026-11-28 指示及提供的 Giga 区域费用表；[Pricing Contract](pricing-contract.md)、[Giga Data Dictionary](../references/giga/data-dictionary-mapping.md)。

## 1. MECE 决策结构

依次执行配送资格、成本解析、收费必要性、收费金额四个层级；风险控制是独立并行维度。每层按顺序选唯一适用分支；已确认不可配送优先于其他判断，未知不等于否。不将是否收费与金额是否可确定混为一谈。

### L1 — Delivery eligibility

- 已确认不可配送：NOT_SERVICEABLE，停止报价。
- 配送资格未知：OPERATOR_CONFIRM，核实后继续。
- 可配送：按目的地区分北海道、冲绳、其他离岛、其他普通地区（北海道或冲绳所属离岛仍先核实其特殊配送资格及费用，不默认适用本岛费用）。无法确定适用区域则转人工。

### L2 — Cost resolution

| 符号 | 定义 |
|---|---|
| F_u | Giga Unit Fulfillment Fee（标准单件履约费） |
| R_a | 目的地区域的 Giga Remote Area Shipping Fee（仅运输费） |
| P_a | Packing Fee |
| E_a | Estimated Fulfillment Fee（P_a + R_a）；本规则中业务简称 Remote Area Fee，包含包装费，是比较及追加运费公式的唯一供应商成本输入 |
| S_a | 当前 Listing 向客户收取的目的地区域运费 |

确认同一 SKU/Variant、同一销售单位、币种、时点和费用粒度。保留原始 R_a 与 P_a 供追溯；规则统一使用 E_a，不使用单独 R_a，也不重复加包装费。Giga 字段映射已运行验证（见 §7.2）：`shippingFee`=F_u（已含包装费），`remoteShippingFee`=E_a 语义但样本恒空；E_a 取值仍靠固定类别、订单级 feeDetails 或 UI 实取。Listing 实时配置优先于旧快照。

#### ¥1,001 固定类别（BUS-LOG-002-RATE-001）

Sponsor 提供的典型数据，约占该类别商品的50%以上（比例为 Sponsor 估计，未独立统计）：

| Area | Packing Fee (JPY/unit) | Remote Area Shipping Fee (JPY/unit) | Estimated Fulfillment Fee (JPY/unit) |
|---|---:|---:|---:|
| Hokkaido | 165 | 1716 | 1881 |
| Okinawa | 165 | 4081 | 4246 |

确认 F_u=1001 时，按已指定固定规则直接取得上述区域费用，无需再次查 Giga 区域费；若已有明确的 SKU 特殊费率、不同销售单位或冲突证据，转人工核实。不得将该典型费率推广到其他 F_u。Sponsor 已确认：此前北海道 1880 为笔误，正确值为 E_a=1881；R_a=1716。北海道该类别确定为费用不相等；比较和金额计算均采用 E_a。

其他 F_u：必须查询当前 Giga 对应商品的区域 Estimated Fulfillment Fee E_a，或根据同一条有效记录的 R_a+P_a 得出；缺失或粒度不明则转人工。不得从 ¥1001 类别或标准费倍数推导其他区域费用。北海道比较统一使用 E_a 与 F_u。

#### Listing 运费解析

| Listing 模式 | S_a |
|---|---|
| 送料込み | NOT_APPLICABLE（运费已包含在商品售价，隐含金额未知；不得设为0或推定为F_u） |
| 送料別・全国一律 | 当前模板统一运费 |
| 送料別・地域毎に設定 | 当前模板目的地区域运费 |
| 送料別・都道府県毎に設定 | 当前模板目的地都道府县运费 |
| 未知/无法解析 | UNKNOWN，不能用0代替 |

运费金额属于有限离散档位，通常为 ¥1,001 的倍数（Sponsor 运营观察）；并非连续整数，也不保证所有实际模板金额均为倍数。以当前实际模板为准，不强制取整至该档位或猜测未读取的价格。验收应优先覆盖真实档位，并保留 ¥199/¥200 等数学边界测试。

解析链：Shop + CSV 送料ID → ShippingConfiguration.displayId → ShippingConfiguration.id → 目的地费用。ID 不是金额。多件时核对运费上限、数量折扣及实际收费粒度。

## 2. L3 — Surcharge decision（互斥分支）

前提：L1 已确认可配送。表内“其他”仅指不属于北海道、冲绳及特殊离岛的普通区域。状态表示是否需要在当前 Listing 收费之外追加，不等于是否免运费。

| 地区 | 条件（按顺序） | 决策 |
|---|---|---|
| 北海道 | E_a 与 F_u 相等且证据有效 | NO_ADDITIONAL_FEE |
| 北海道 | 不相等 + 送料込み | ADDITIONAL_FEE_REQUIRED |
| 北海道 | 不相等 + 送料別・全国一律 | ADDITIONAL_FEE_REQUIRED |
| 北海道 | 不相等 + 送料別・地域毎に設定或都道府県毎に設定 | NO_ADDITIONAL_FEE（有效北海道配置已确认） |
| 北海道 | 其他情况（缺失、冲突、未知模式等） | OPERATOR_CONFIRM |
| 冲绳 | 送料込み | ADDITIONAL_FEE_REQUIRED；金额由 Operator 确认，公式不适用 |
| 冲绳 | 送料別且 G<200 | NO_ADDITIONAL_FEE |
| 冲绳 | 送料別且 G≥200 | ADDITIONAL_FEE_REQUIRED；金额按 L4 |
| 冲绳 | 运费模式或必要数据未知 | OPERATOR_CONFIRM |
| 其他离岛 | 特殊费率/配送条件 | OPERATOR_CONFIRM；不套用北海道或冲绳费率 |
| 其他普通地区 | 当前 Listing 配置有效，无特殊附加条件 | NO_ADDITIONAL_FEE；保留现行运费 |
| 其他普通地区 | 配置未知或特殊条件 | OPERATOR_CONFIRM |

北海道不等且送料別时，Operator 必须确认三种模板中的实际类型，才可选择对应分支。若区域模板配置异常或无法核实，则转人工。不可配送优先于收费判断。冲绳送料別须先应用差额豁免；送料込み仍按 workflow 判断。

## 3. L4 — Surcharge calculation（BUS-LOG-002-CALC）

公式仅适用于送料別、当前目的地运费 S_a 可从有效模板确定的商品。送料込み不适用公式；按 L3 workflow 判断必要性，若需追加则由 Operator 确认金额。不可将隐含运费当作0。

定义 G=E_a−S_a。Sponsor 新增 ¥200 差额豁免：冲绳送料別 G<200 时不追加（包括零及负差额），G≥200 时按下式。北海道送料別的同一公式及阈值作为统一 Formula Version 对照；若与既有北海道 workflow（相等豁免、地区/都道府县模板豁免）冲突，保留差异并转 Operator，待 Sponsor 确认最终优先级。不得静默废除已有豁免。

当适用公式且 G≥200 时：
 
**Additional shipping fee = ceil((E_a − S_a) × 1.1 / 100) × 100 JPY**

- E_a 为 Giga Estimated Fulfillment Fee，包含 Packing Fee；原始 Remote Area Shipping Fee R_a 不单独用于计算。
- S_a 指当前 Listing 对该地区已另行收取的运费，按 L2 确定。
- 1.1 是 Sponsor 指定的业务系数，不声称等价于精确的10%平台佣金逆推（后者为1/0.9）。
- 先乘1.1，再向上取整到100日元；整百不再加100。
- L3=NO_ADDITIONAL_FEE 时追加金额为0，不执行公式。原 Listing 运费仍适用。
- G<200 时公式结果为0；G=200 时为300。未知输入不等于零；不生成负收费、退款或任意最低收费。北海道 workflow 与公式结果冲突时转人工。
- 多件订单按同一销售/订单粒度对齐成本和已收运费后计算，不将单件费用直接与整单运费比较；具体数量聚合、取整粒度待验证，不能自动报价。
- 对已成立订单另核实平台规则、原交易条款、客户权益；仅经批准且平台允许的方式收费。不得直接要求站外支付。

## 4. L5 — Parallel risk control

- COMBO / MULTI_PACKAGE_CAUTION：组合商品超过一个包裹时独立标记。主区域判断不变；确认 Giga 费用及 Listing 运费覆盖整套还是单件/单包裹，不按包裹数量盲目乘算。粒度未确认则金额待人工核实。
- 费用冲突、数据过期、北海道 workflow/公式冲突、模板异常、特殊配送地址均需保留证据并人工确认；不覆盖已经可确定的收费必要性。
- B2B 卡车配送参见 [BUS-LOG-001](suppliers/giga/bulk-commercial-delivery.md)；上楼搬运、日時指定等服务单独处理。
- 本规则不改变 Standard TCOGS/Direct Margin 定义，避免重复计算费用。

## 5. Inquiry 执行与日志

读取 Inquiry 及当前 Listing、确切 SKU/Variant、数量、目的地；检查配送资格；记录 F_u、R_a、P_a、E_a（如有）、S_a、模板类型、数据来源与时间、固定映射命中、L3 决策、L4 金额/待确认原因、并行风险及 Operator 决定。以上为逻辑字段，不要求新建数据库字段。
仅对客户说明适用费用及必要条件，不披露内部采购费用。按 Inquiry Skill 的人工审核、授权发送和 Supabase closeout/readback 规则完成。未确认金额不得承诺，原 Listing 收费不可被误称为免运费。

## 6. 验收与一致性

唯一已知固定供应商类别 F_u=1001：北海道 E_a=1881，冲绳 E_a=4246。其他类别必须查询实际 Giga 数据。以下仅为单个已知类别的公式单元测试，假设对应 Listing 实际收取 S=1001，并非生产报价或全档位一致性证明。

| 地区 | Listing / S | G | Formula Version |
|---|---|---:|---|
| 北海道 | 送料別 / 1001 | 880 | 1000 |
| 冲绳 | 送料別 / 1001 | 3245 | 3600 |
| 北海道或冲绳 | 送料込み / N/A | N/A | 不适用，按 workflow |
| 任意 | 不可配送 | N/A | 停止 |
| 任意 | 其他费用类别且 E_a 未取得 | UNKNOWN | 不计算 |
| 任意 | 多包裹组合 | 按实际销售单位 | 独立风险核查 |

数学边界（纯单元测试）：G=199→0；G=200→300；G=0或负值→0。不得把不同供应商费率类别与假设 Listing 档位任意组合并据此宣称 workflow/formula 在生产中一致或冲突。真实验证须匹配同一 SKU、当前 Giga E_a、当前 Listing 实际区域 S_a 及模板类型。北海道 workflow 与公式的实际一致性尚未验证。

## 7. Business-to-API field mapping (BUS-LOG-002-MAP)

Mapping evidence as of 2026-11-28: Mercari = official schema verified; Giga = endpoint、标准履约费字段、币种、组合结构已用只读生产查询验证（6 次 Price 调用 / 217 条记录 / 210 个 SKU / 52 个 F_u 档位；3 次 Detail 调用 / 135 条记录），**区域费字段 `remoteShippingFee` 语义已由官方文档确认为含包装的 E_a，但实际样本恒为空**；区域费金额可由订单级 `feeDetails` 取证（北海道 1881 / 冲绳 4246 / 其他 1001 实测一致），逐 SKU 预取区域报价仍不可行。Do not treat logical names below as new DB columns.

### 7.1 Mercari Shops — official GraphQL schema

Source: [Mercari Shops API reference](https://api.mercari-shops.com/docs/index.html), types Product, ShippingPayer, ShippingConfiguration, ShippingConfigurationType, ShippingConfigurationDetail, ShippingConfigurationDetailDestination, CreateProductInput, UpdateProductInput; queries product, productShippingConfiguration, productShippingConfigurations.

| Business concept | Seller Web / CSV | API field | Rule mapping |
|---|---|---|---|
| Listing identity | 商品ID | Product.id | shop-scoped retrieval using the correct shop credential |
| Listing variant | SKU / 商品管理コード | Product.variants[].id / skuCode | link exact Giga SKU via verified product identity, not by title |
| Shipping payer | 送料負担 | Product.shippingPayer | SELLER = 送料込み, BUYER = 送料別 |
| Shipping ID / template display ID | 送料ID | Product.shippingConfiguration.displayId | human/CSV ID, NOT GraphQL object ID |
| Shipping Configuration ID | API object identifier | Product.shippingConfiguration.id | global ID; CreateProductInput.shippingConfigurationId / UpdateProductInput.shippingConfigurationId refer to this ID |
| Template title | 送料設定名 | Product.shippingConfiguration.title | display only; not an identity or fee |
| Template type | 送料設定方法 | Product.shippingConfiguration.type | NATIONWIDE_EQUAL / REGION / PREFECTURE |
| Destination | 地域・都道府県 | Product.shippingConfiguration.details[].destination | enum; select one matching entry |
| Destination fee | 送料（円） | Product.shippingConfiguration.details[].fee | integer JPY, S_a for applicable single-unit buyer-paid listing |
| Template timestamp | 更新日時 | Product.shippingConfiguration.updatedAt | evidence freshness, alongside retrieval timestamp |
| Listing timestamp | 更新日時 | Product.updatedAt | evidence freshness |

| Business shipping setting | shippingPayer | type | Hokkaido destination | Okinawa destination |
|---|---|---|---|---|
| 送料込み | SELLER | not applicable | S_a=N/A | S_a=N/A |
| 全国一律 | BUYER | NATIONWIDE_EQUAL | NATIONWIDE_EQUAL | NATIONWIDE_EQUAL |
| 地域毎に設定 | BUYER | REGION | REGION_HOKKAIDO | REGION_OKINAWA |
| 都道府県毎に設定 | BUYER | PREFECTURE | PREFECTURE_HOKKAIDO | PREFECTURE_OKINAWA |

Resolve BUYER: match the destination enum in details and use its fee; require exactly one valid applicable entry. Missing template, duplicate/missing destination, invalid amount or UNSPECIFIED => UNKNOWN / operator review, never choose min/max or assume zero. SELLER: fee embedded in total selling price is not available; do not use 0 or infer from a legacy configuration. For CSV-only reads enumerate shop's productShippingConfigurations with pagination and match displayId exactly; use productShippingConfiguration(id: String!) only with the true GraphQL ID. Do not assume that the shipping ID label encodes the amount. Multi-quantity/cart shipping calculation/discount requires separate validation of actual applicable buyer fee (not simply detail.fee multiplied by quantity); order buyerShippingFee is transaction evidence, not a replacement for current listing configuration.

Read-only query shape (official schema):

```graphql
query ShippingRuleListing($id: String!) {
  product(id: $id) {
    id
    updatedAt
    shippingPayer
    shippingConfiguration {
      id
      displayId
      title
      type
      updatedAt
      details { destination fee }
    }
    variants { id skuCode }
  }
}
```

Implementation evidence: [Pricing Contract](pricing-contract.md) and [StoreOps migration 003](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/local_offer/migrations/003_offer_identity_authority.sql) distinguish CSV shipping_rate_id from API shipping_configuration_id. Existing [Commerce Ops Inquiry relay](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/dashboard/functions/_lib/mercari-relay.ts) requests only shippingPayer and details.fee, derives buyerShippingCharge=0 for SELLER or a single common BUYER fee; that value is a margin-context projection, NOT BUS-LOG-002 S_a. It omits type/destination/displayId/id and cannot resolve regional surcharge today. Consumer implementation must read full template and preserve N/A vs UNKNOWN vs actual zero; no runtime change in this PR.

### 7.2 GigaB2B — Open API 2.0 only

Official-document-derived endpoint reference: [REF-GIGA-OPENAPI-2](../references/giga/open-api-2.0.md) and relocated [CatalogSync Quick Reference](https://github.com/retailpulses/CatalogSync/blob/main/docs/legacy/Gigab2b%20API%20guide/GIGA_OPEN_API_2_0_QUICK_REFERENCE.md). Product Price API: POST https://openapi.gigab2b.com/b2b-overseas-api/v1/buyer/product/price/v1, body skus[] (max 200), signed 2.0 request, common envelope success/code/data/requestId. Do not use retired 1.0. Use exact SKU and inspect raw record rather than summarized price projection.

**运行验证结论（2026-11-28，只读，生产 buyer 凭证 + 官方接口文档 doc_id=7/12/32）**：

1. **字段语义已由官方文档确认**：`shippingFee` 是"发往普通地区的履约费，**已含运费与包装费**"；`remoteShippingFee` 是"发往**偏远地区**的履约费，**同样已含运费与包装费**"。因此 `remoteShippingFee` 在语义上就是本规则的 **E_a**（packing-inclusive），`shippingFee` 就是 **F_u** 且 F_u 本身已含包装费。
2. **但 Price API 的 `remoteShippingFee` 在实际样本中恒为空**（210 个日本站 SKU / 217 条记录全部 `null`），无法按 SKU 预取区域报价；`shippingFeeRange` 也从未出现 min≠max。
3. **区域费的真实金额可从订单级接口取得**：`POST /b2b-overseas-api/v1/buyer/order/detail/v1` → `data[].feeDetails[]`，`feeType=2`（Fulfillment Fee，含运费与包装费）给出该笔订单**实际收取**的履约费。实测 1001 档：北海道 **1881**、冲绳 **4246**、东京 **1001**，与 Sponsor 参考值完全一致。
4. `internationalFulfillmentFees` 是"当前站点发往**其他国别**"的费用（按 `countryCode`/`countryName`，含 `remoteIntlFulfillmentFee`），**不是**日本国内都道府县，不得用于北海道/冲绳。

已核验的精确路径与语义：

| Business field | Exact JSON path（Open API 2.0） | Type | 观测示例 | 币种/单位 | 转换 | Null / missing | Status |
|---|---|---|---|---|---|---|---|
| Giga SKU | `product/price/v1` → `data[].sku`；`product/detailInfo/v1` → `data[].sku` | string | `WF292693BAA` | — | 精确等值匹配 internal item_code，不按名称 | 未返回即该 SKU 无记录 | VERIFIED |
| 卖家上下文 | `price/v1` → `data[].sellerInfo.sellerCode` / `.sellerStore` | string | `N509` / `KF` | — | 同一 SKU 可能返回多条不同 seller 记录 | `sellerInfo` 可缺失 | VERIFIED |
| Unit Fulfillment Fee F_u | `price/v1` → `data[].shippingFee` | integer | `1001` | JPY / 销售单位 | 无需换算 | `null`（`skuAvailable=false` 或供应商未给费） | VERIFIED（见 7.2.1） |
| Shipping fee range | `price/v1` → `data[].shippingFeeRange.minAmount` / `.maxAmount` | integer | `1001` / `1001` | JPY | 有 shippingFee 的 118 条记录全部 min=max=shippingFee | 不可用时两字段为 `null` | OBSERVED：不是目的地报价 |
| Remote Area Shipping Fee → **E_a**（含包装） | `price/v1` → `data[].remoteShippingFee` | number \| null | `null` | JPY / 销售单位 | 官方定义：偏远地区履约费，含运费+包装费；**即本规则 E_a**，无需再加 P_a | 抽样 217/217 为 `null` | **文档已确认 / 样本未填充**（不要当 0，也不要当成 R_a 的纯运费） |
| Packing Fee P_a（单列） | Price API **不单列**（已含在 shippingFee / remoteShippingFee 内）；seller 侧 `onsite-seller/order/detail/v1` → `data[].packingFee` 与 `shippingFee` 分列 | number | — | JPY | buyer 凭证不可用 seller 接口 | — | **buyer 侧 NOT EXPOSED / seller 侧文档存在** |
| 国际履约费（跨国家） | `price/v1` → `data[].internationalFulfillmentFees[]`，每项 `internationalFulfillmentFee`、`remoteIntlFulfillmentFee`、`countryName`、`countryCode` | array | `[]` | JPY | **按国家，不按都道府县**；不得用于北海道/冲绳 | 抽样 217/217 为空 | 文档已确认，语义**不适用**日本国内区域 |
| 订单级实际履约费（含区域） | `buyer/order/detail/v1` → `data[].feeDetails[]`；`feeType=2` = Fulfillment Fee（含运费+包装费），`feeAmount` 为金额 | array | `1881` / `4246` / `1001` | JPY（JP 站为不含税） | 按订单实际收取值；用于校验同一 SKU 在该目的地的 E_a | 无该 feeType 则未收履约费 | **VERIFIED（订单级）**，见 7.2.3 |
| Area identifier | 无区域枚举：feeDetails 的区域由订单收货地址决定，费用字段本身不含区域键；`detailInfo` → `data[].remoteAreaPostalCodes` 抽样恒 `[]` | — | — | — | 目的地必须来自订单收货地址/UI，不可从费用字段反推 | — | **NOT EXPOSED（作为字段）** |
| Currency | `price/v1` → `data[].currency` | string | `JPY` | ISO 4217 | 必须等于 `JPY`，否则转人工 | 缺失视为未知 | VERIFIED（217/217 为 JPY） |
| Purchase availability | `price/v1` → `data[].skuAvailable` | boolean | `true` / `false` | — | **不等于**"该目的地可配送" | — | VERIFIED（语义受限） |
| Delivery eligibility（目的地） | 无对应字段 | — | — | — | — | — | **NOT EXPOSED** |
| Combo / package 结构 | `detailInfo/v1` → `data[].comboFlag`（boolean）+ `data[].comboInfo[]`（每项 `sku`,`qty`,`weightKg`,`lengthCm`,`widthCm`,`heightCm`） | bool + array | `SETN506P469771B`：`comboFlag=true`，3 条明细，qty 各 1 | 件 | `len(comboInfo)`=组成（箱）组数；`sum(qty)`=实物件数 | `comboFlag=false` 时 `comboInfo=[]` | PARTIALLY VERIFIED（见 7.2.2） |

**字段处理规则**：`remoteShippingFee` 语义等于 E_a，但本抽样恒为 `null`，属于"存在但无数据"，**不得当作 0，也不得当作免收**。`internationalFulfillmentFees` 只用于跨境目的国，**禁止**映射为北海道/冲绳。`shippingFee` 与 `remoteShippingFee` **都已含包装费**，任何加总都不得再加一次 P_a。逐 SKU 预取区域报价仍不可行；可行的替代是用同 SKU、同目的地的订单级 `feeAmount(feeType=2)` 取证，或 RATE-001 固定类别。

#### 7.2.1 抽样与跨 SKU 验证

抽样覆盖 Mercari Shop4 在售商品，含 F_u=1001 档、其他真实档位与多包裹组合。Price API 的区域字段对这些 SKU 恒为 `null`，故区域列改用**同档位订单实收值**（7.2.3）；1001 档实测 1881/4246 与 Sponsor 参考值一致，构成对参考值的独立验证。

| SKU | F_u = `shippingFee`（API） | Hokkaido 实收 | Okinawa 实收 | Package Qty（`comboInfo`） | 状态 |
|---|---:|---:|---:|---|---|
| WF294157CAA | 1001 | 1881（同档位订单实测） | 4246（同档位订单实测） | 未拆分（`comboFlag=false`） | F_u 已核验；区域值按 1001 档实测 |
| WF294156DAA | 1001 | 1881（同档位） | 4246（同档位） | 未拆分（`comboFlag=false`） | 同上 |
| WF292693BAA | 1001 | 1881（同档位） | 4246（同档位） | 未拆分（`comboFlag=false`） | 同上 |
| BA430891A207236N | 2002 | 未取到（无同 SKU 订单） | 未取到 | 2 组 / 2 件 | 组合商品；区域值需实测 |
| W3571P469704 | 1705 | 1705（同档位订单实测，无附加） | 未取到 | 未拆分（`comboFlag=false`） | 该档北海道无附加费 |
| N506P332030D | 2530 | 2530（同档位订单实测，无附加） | 未取到 | 未拆分（`comboFlag=false`） | 该档北海道无附加费 |
| SETN506P469771B | 8504 | 未取到 | 未取到 | 3 组 / 3 件 | 多包裹（标题"3箱梱包"一致） |
| N508SET473626C | 3988 | 未取到 | 未取到 | 2 组 / 2 件 | 多包裹 |
| WF309568BAA | `null` | 未取到 | 未取到 | 未拆分（记录不可用） | `skuAvailable=false`，F_u 不可得 |

> Price API 对这些 SKU 的 `remoteShippingFee` 全部返回 `null`；表中区域金额来自同档位的**订单级实测**（7.2.3），属档位级证据，不等于该 SKU 的逐 SKU 报价。逐 SKU 区域报价仍无 API 路径。

**与 internal DB 的交叉验证**：115 个可比 SKU 中 110 个（95.7%）`shippingFee` 与 `product_commercials.fulfillment_fee` 相等；5 个不等，且这 5 个 API `price` 与 DB `source_unit_price` 完全一致（说明差异只在履约费，不是价格改版）：`MS317851AAA` DB 2057 / API 1705；`N504S522471A` 3762 / 3058；`N511C307176B` 6237 / 5764；`N511C307176W` 6237 / 5764；`SETN506P497041A` 7040 / 7513。结论：**API `shippingFee` 是当前权威值，DB 字段可能滞后或写入口径不同，报价必须读 API 或 UI，不得只信 DB。** 另观测到 `MS283514AAA` 一次返回两条记录（seller `N509`/`KF` 与 `N504`/`IE`，F_u 同为 4983），故 SKU 在 Price 响应中**不唯一**，必须带 seller 维度。

#### 7.2.2 包数语义与已知冲突

`comboInfo` 是实物组成明细，不是箱数权威：`4I291166AAA`（4 脚セット）为 2 条明细、`sum(qty)=8`；`HA305879AAA` 为 3 条明细；`2512P332286A` 仅 1 条明细但 `qty=2`。因此 `sum(qty)` 是实物件数，`len(comboInfo)` 接近组件/箱组数，两者都未获供应商书面定义。internal `product_variants.package_quantity` 与 `comboInfo` 冲突：抽样 17 个 `package_quantity=1` 的 SKU，`comboInfo` 组数为 1–3 组、`sum(qty)` 为 2–8；按件数计 **0/17 相符**，按组数计仅 3/17 相符；同时全库该字段 4831/6557 为 NULL。结论：包数必须从 `comboInfo` 实读并按 L5 独立核查，不得用 DB 字段或对 F_u 乘算。

#### 7.2.3 区域费实测（订单级，2026-11-28）

`buyer/order/detail/v1` 的 `feeDetails[feeType=2]` 是 Giga **实际收取**的履约费（含运费+包装费）。同一 SKU 按目的地对比：

| 目的地 | SKU（订单 shipmentId） | F_u（标准费） | 实收 feeType=2 | 与 F_u 关系 |
|---|---|---:|---:|---|
| 北海道 | N510P469767Z（2JTGxpjypCMXEKUJQ4QS9Q） | 1001 | **1881** | +880，等于 Sponsor E_a |
| 冲绳 | N510P254504N（2JSXnQXZQKBnZN2i9bGcw7） | 1001 | **4246** | 等于 Sponsor E_a |
| 东京 | N511P429780B（2JTDoaoKihVAmN8ockzQEp） | 1001 | **1001** | 无附加 |
| 东京 | W770P366224（2JTEdRKJk472iqnvXKR6ny） | 1001 | **1001** | 无附加 |
| 北海道 | N504P284384Z（2JRzf8yQJisBnfzN3f4Ay2） | 1705 | 1705 | 无附加 |
| 北海道 | N506P339216D（2JQkhxSFW5y4hQSR8WVR3N） | 2057 | 2057 | 无附加 |
| 北海道 | N511P387242B（2JQtZ48fkihFZSZcdWTMGc） | 2530 | 2530 | 无附加 |
| 北海道 | N509P277758B（2JREyhfgcL9qG9aoCiaZf3） | 2987 | 2987 | 无附加 |
| 北海道 | N511S358748B（2JQZ6WFBCsrX3BdWr9nkGi） | 3410 | 3410 | 无附加 |
| 北海道 | N509P176640K（2JQM7DDZxaT5gQ37TRW8G5） | 3966 | 3966 | 无附加 |
| 北海道 | N508P301428A（order_2JGTj8TDc6m7fZH4HX4b6d） | 6953 | 6953 | 无附加 |
| 北海道 | N511S407763G（order_2JNuhC26NB3JCt7tqF5Gev） | 7679 | 7679 | 无附加 |
| 北海道 | N509SA353981A（order_2JNm2cS5JAoKPQGsG3joYx） | 3058 | 3938 | +880 |
| 北海道 | SETN506P295412BB（order_2JJg3om5yxqxro2xUjcCg4） | 4004 | 7524 | 组合商品，非简单加总 |

**关键业务含义（不改公式，仅记录观测）**：①北海道附加费**并非全档位存在**——1001 与 3058 档出现 +880，其余 8 个档位实收等于标准费；②"E_a = F_u"的分支在多数档位成立，与 L3 的 `NO_ADDITIONAL_FEE` 分支相容；③同一 SKU 的 F_u 可能已变动（DB 值与 API 有差异时，以订单实际收取与当期 API 为准）；④组合商品（多包裹）实收显著高于单件标准费，须按 L5 单独核查，不得乘算。

Raw keys are evidenced by [Giga stack README](../engineering/stacks/gigab2b/README.md), [plugin index](../engineering/stacks/gigab2b/plugin/index.js) and [CatalogSync domain assessment](https://github.com/retailpulses/CatalogSync/blob/main/docs/legacy/architecture/GIGA_PRODUCT_DOMAIN_MAPPING_ASSESSMENT.md). The plugin normalizes shippingFee/remoteShippingFee, but internationalFulfillmentFees is reduced to array length in its summary. Use giga_price with includeRaw=true where available, or equivalent approved read-only API, to inspect regional records. CatalogSync price sync does not establish packing/area fee mapping. The original Product Price Query.pdf was not recovered from available sources in this review; do not label these candidate mappings official-spec verified. [Giga Data Dictionary MAP-006](../references/giga/data-dictionary-mapping.md) remains the cross-product mapping authority; verified paths and sanitized evidence are recorded in [REF-GIGA-DATA](../references/giga/data-dictionary-mapping.md#shipping-fee-evidence-2026-11-28).

Fallback: use current exact-SKU Giga UI Estimated Fulfillment Fee, or the Sponsor-confirmed F_u=1001 mapping in RATE-001 (Hokkaido 1881 / Okinawa 4246, subject to known SKU exceptions). Other tiers require actual regional quote, not extrapolation. If F_u itself cannot be verified, do not activate fixed mapping. **Because the Price API exposes no regional fee, the UI path is the standing alternative, not a temporary workaround**；API 侧只能作为"F_u 与 SKU/币种/组合结构"的校验来源。

### 7.3 Mapping acceptance and handoff

1. Read a live Shop4 Listing with each payer/template type; verify returned identity, destination selection, displayId vs id, UI/API fee agreement, zero vs N/A vs missing.
2. ~~For Giga run read-only price query … establish exact JSON paths …~~ **DONE 2026-11-28**：已对 210 个 SKU / 52 个 F_u 档位执行只读 Price 查询并记录 requestId、时间戳、原始字段与组合结构。结果：`data[].shippingFee` = F_u，`data[].currency` = JPY，`detailInfo` 的 `comboFlag`/`comboInfo` 给出组合结构；`remoteShippingFee` 恒 `null`、`internationalFulfillmentFees` 恒 `[]`、`remoteAreaPostalCodes` 恒 `[]`；但官方文档确认 `remoteShippingFee` 即含包装的偏远地区履约费（=E_a），且订单级 `buyer/order/detail/v1` 的 `feeDetails[feeType=2]` 实测给出北海道 1881 / 冲绳 4246 / 东京 1001。证据见 [REF-GIGA-DATA 证据附录](../references/giga/data-dictionary-mapping.md#shipping-fee-evidence-2026-11-28)。
3. **Remaining manual step（未完成，不得跳过）**：对同一 SKU 在同一时点读取 Giga B2B 买家端产品页/履约费订单，记录 UI 上的 Standard / Packing / Hokkaido / Okinawa 金额行，确认 UI 的 Unit Fulfillment Fee 与 `shippingFee` 是否一致、E_a 是否等于 R_a+P_a。该项完成前，非固定档位的区域费仍为人工输入。
4. Record raw-to-normalized transformation and provenance in REF-GIGA-DATA; link actual producer/consumer code and tests. Only then enable machine calculation for non-fixed tiers.
5. Join by verified shop + listing/variant identity + Giga SKU, never by template title or shipping fee amount. Apply L1–L5 after input resolution. Preserve source paths, timestamps, request IDs, applicable destination and operator decision in Inquiry closeout.
6. No production write/deployment authorized here. Mercury-side schema mapping is verified against official docs, not live canary. **Giga regional fee (R_a/P_a/E_a) is still not API-available — this remains a blocker for automated non-fixed-tier quoting.**

## 8. Governance / remaining decisions

- [Business Governance](GOVERNANCE.md)；消费方 Inquiry Skill、Commerce Ops、CatalogSync、Store Ops 引用此规则；Supabase Knowledge #36 待对齐，不另设竞争规则。
- 业务结构按 MECE 分层；尚未确认的边界显式转人工，不假装已有最终定价规则。
- 待 Sponsor 核实：北海道 workflow 与 Formula Version 冲突时的最终优先级；多件订单取整粒度。送料込み不适用公式已确认，冲绳送料別 ¥200 阈值已确认。固定类别北海道 Estimated Fulfillment Fee 已由 Sponsor 确认为1881，旧1880为笔误，不再作为有效费率。最新费用表为 Sponsor 提供，未做独立供应商验证。
- **Giga API 能力现状（2026-11-28 验证）**：`remoteShippingFee` 语义即含包装的 E_a，但 Price API 对 210 个日本站 SKU 一律返回 `null`，无法逐 SKU 预取；订单级 `buyer/order/detail/v1.feeDetails[feeType=2]` 可取得该目的地实收履约费（实测北海道 1881、冲绳 4246、东京 1001）。北海道附加费并非全档位存在（1001、3058 档 +880，其余档位实收=标准费）。是否向 Giga 申请按目的地的报价接口，待 Sponsor 决定。
- 本次不涉及生产收费、数据库变更、运行验证或部署；API 操作均为只读。
