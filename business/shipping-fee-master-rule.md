# Shipping Fee Master Rule — BUS-LOG-002

状态：**Sponsor-confirmed business decision (2026-11-28) / Runtime verification pending**  
Owner（建议）：Retailpulses Business Operations / Procurement  
适用范围：GigaB2B 商品在 Mercari Shops 的运费询价；Shop4 优先。其他平台、地区及供应商须另行定义，不自动套用。  
依据：Sponsor 2026-11-28 明确指示；[Pricing Contract](pricing-contract.md)、[Giga Data Dictionary](../references/giga/data-dictionary-mapping.md)。本文件定义业务判断，不授权自动改价、收款或发送客户消息。

## 1. 主数据与权威来源

| 业务概念 | 权威来源 | 说明 |
|---|---|---|
| F_u — Unit Fulfillment Fee | 当前 GigaB2B 对应商品/变体 | 标准单件履约费，不等于商品采购价 |
| F_h — Hokkaido Remote Area Shipping Fee | 当前 GigaB2B 对应商品/变体的 Remote Area Shipping fee（北海道） | 使用同一商品、币种、单件粒度、适用时点及费用口径；F_u=¥1,001 时采用下述固定映射 |
| S — Current Listing Shipping Fee | 当前 Mercari 实时 Listing 及其有效运费配置 | 区分送料込み（seller-paid）与送料別（buyer-paid）；核实北海道实际金额、适用数量及三种模板类型：全国一律、地域毎に設定、都道府県毎に設定 |
| Delivery eligibility | Giga 当前地区配送条件及 Listing 配置 | 不可配送与需要追加运费是不同结果 |

不得使用历史客服回复、其他商品、过期快照或通用地区费率替代上述事实。产品变体、店铺 Listing 和目的地须一一对应。Giga API 字段到业务语义的映射尚未验证；不得仅凭相似字段名假定等价，不得将 Remote Area Shipping Fee 擅自解释为在 F_u 之上另加的费用。

Mercari 运费配置解析遵循 Pricing Contract：Shop + CSV 送料ID → ShippingConfiguration.displayId → ShippingConfiguration.id → 地区/都道府県金额；ID 本身不是运费金额。若存在数量折扣、运费上限或特殊配置，按实际适用规则核对。

## 2. BUS-LOG-002-HKD — 北海道追加运费判断

先确认具体 Listing、关联 Giga SKU/Variant、北海道配送可行性及当前费用证据，再进行以下判断。F_h 与 F_u 使用相同口径的精确金额比较，不使用估算或人为容差。

### 固定映射（Sponsor 2026-11-28）
若当前已确认 F_u = ¥1,001，则直接采用 F_h = ¥1,880，无需另外查询 Giga Remote Area Shipping Fee。记录来源为 BUS-LOG-002 固定映射而非实时查询。此例外仅针对北海道及确切 ¥1,001，不插值、不推导其他费率；仍须核实商品身份、配送可行性及 Listing 配置。

### 决策矩阵

| 条件 | Listing 运费模式 | 决策 |
|---|---|---|
| F_h = F_u | 送料込み或送料別 | NO_ADDITIONAL_FEE：无需另收北海道附加运费，保留 Listing 已有运费 |
| F_h ≠ F_u | 送料込み | ADDITIONAL_FEE_REQUIRED：需要另外收取运费；金额和合规收取方式须另行确认 |
| F_h ≠ F_u | 送料別・全国一律 | ADDITIONAL_FEE_REQUIRED：全国统一运费未覆盖北海道差异，需追加收费；具体金额另行确认 |
| F_h ≠ F_u | 送料別・地域毎に設定 | NO_ADDITIONAL_FEE：北海道差异已在地区运费模板中设置，保留现有模板收费 |
| F_h ≠ F_u | 送料別・都道府県毎に設定 | NO_ADDITIONAL_FEE：北海道差异已在都道府县运费模板中设置，保留现有模板收费 |
| F_h ≠ F_u | 送料別・模板类型未确认 | OPERATOR_CONFIRM：Operator 核实当前有效模板属于以上哪一种，确认后按对应分支执行 |
| 任一必要数据缺失、过期、无法映射、费用口径不一致或必要配置未知 | 任意 | OPERATOR_CONFIRM：列出缺失证据，不承诺金额 |
| 已确认目的地不可配送 | 任意 | NOT_SERVICEABLE：告知不可配送；不得通过追加费用暗示可以配送 |

Sponsor 指定条件为“不相等”，不是“大于”。如出现 F_h < F_u，仍遵循上述分支，同时标记异常费用关系并由 Operator 核实金额，不将负差额转为客户附加费。零值须有明确来源，NULL/未知不得转为零。

**Additional fee** 指在当前 Listing 已有商品价及买家运费之外另行收取的北海道费用，不等于所有买家运费。送料別商品不能因 F_h = F_u 就告知客户免运费。

## 3. 金额与执行边界

- ADDITIONAL_FEE_REQUIRED 是收费必要性判断，而非金额公式。不得直接把 F_h、F_h−F_u 或 F_h−S 当作客户应付金额；另核实成本覆盖、佣金、数量及有效 Pricing Contract，避免重复收取。
- 如 Listing 已采用地域毎に設定或都道府県毎に設定，且北海道有效配置可确认，则无需在模板收费之外追加北海道运费。Operator 仅在模板类型、适用配置或证据无法确认时介入；如发现模板异常、缺失或冲突，转人工，不擅自追加收费。
- 仅在 Operator 确认金额、适用政策及平台允许的支付路径后，才可对客户承诺具体追加金额。不得要求站外付款或未经授权更改商品价格/运费配置。
- 对已成立订单另行核实平台规则、原交易条款与客户权益，本规则不直接授权追收费用。
- 本规则不改变 Giga Standard TCOGS 或 Direct Margin 的定义，成本/买家运费/实际结算分别记录，遵循 Pricing Contract 的费用去重原则。

## 4. Inquiry 操作与证据

1. 读取 Inquiry 及最新消息，识别准确店铺、Listing、变体、数量和配送目的地。
2. 读取 live Listing 运费模式、配置及北海道实际适用金额，记录来源和观察时间。送料別且 F_h ≠ F_u 时，由 Operator 确认模板类型：全国一律、地域毎に設定、都道府県毎に設定。截图示例为全国一律 ¥4,000，仅为界面示例，非通用费率。
3. 从 GigaB2B 当前商品数据取得 F_u 及配送可行性；F_u=¥1,001 时直接采用 F_h=¥1,880，否则取得当前北海道 F_h。若 Supabase 镜像可证明来源和时效，可使用，否则回到 GigaB2B 验证。
4. 执行决策矩阵，记录决策、依据和任何待确认金额；仅将客户需要的结果写入日语回复，不披露采购履约成本。
5. NO_ADDITIONAL_FEE 可拟稿「北海道への追加送料はございません。」若原 Listing 送料別，须说明原运费仍按购买页面支付。ADDITIONAL_FEE_REQUIRED 未确认金额时告知需确认追加运费；OPERATOR_CONFIRM 先核实，不能猜测。
6. 按现行 Inquiry Skill 进行人工审核、授权发送、Readback Verification；在 Supabase Inquiry 记录和日志中保存 Listing/商品证据、运费决策、待办及实际发送结果。不要把尚未确认的费用写成已承诺费用。

## 5. 其他运费场景

- 普通地区：以当前 Listing 运费配置及实际购买页为依据；送料別通常随订单支付，实际金额核实后回复。
- 沖縄・離島：先查对应商品和具体目的地可配送性、运费及特殊限制；北海道判断矩阵不自动扩展至这些地区。
- 多件/企业地址卡车配送：参见 [BUS-LOG-001](suppliers/giga/bulk-commercial-delivery.md)；逐件普通运费与卡车报价分别核查。
- **并行风险规则（COMBO / MULTI_PACKAGE_CAUTION）**：组合商品（超过一个包裹）通常需要额外谨慎，但不替代或改变上述北海道主决策流程。标记风险，核实费用对应的是整套销售单位还是单包裹/组件、包裹数量及模板是否覆盖整套；不得直接按包裹数量乘算或重复收费。主决策结果照常记录；费用粒度不明或报价有风险时由 Operator 核实后再承诺金额。不要仅因多包裹而自动判定需加收。
- 上楼搬运、日期指定等服务不等于普通区域运费；分别核实适用性及收费，不混入 F_h 比较。

## 6. 验收样例（假设值，非实际报价）

| F_u | F_h | Listing 模式及北海道费用 | 预期 |
|---:|---:|---|---|
| 1000 | 1000 | 送料込み | NO_ADDITIONAL_FEE |
| 1000 | 1000 | 送料別，1500 | NO_ADDITIONAL_FEE；原1500仍适用 |
| 1000 | 1800 | 送料込み | ADDITIONAL_FEE_REQUIRED；不自动报价800 |
| 1000 | 1800 | 送料別・全国一律，2000 | ADDITIONAL_FEE_REQUIRED |
| 1000 | 1800 | 送料別・地域毎に設定 | NO_ADDITIONAL_FEE；模板运费仍适用 |
| 1000 | 1800 | 送料別・都道府県毎に設定 | NO_ADDITIONAL_FEE；模板运费仍适用 |
| 1000 | 1800 | 送料別・模板类型未知 | OPERATOR_CONFIRM |
| 1001 | 固定映射1880 | 送料別・全国一律，4000 | ADDITIONAL_FEE_REQUIRED；无需查询 Giga 北海道费 |
| 1001 | 固定映射1880 | 送料込み；多包裹组合 | ADDITIONAL_FEE_REQUIRED + MULTI_PACKAGE_CAUTION；核实整套费用后报价 |
| 1001 | 固定映射1880 | 送料別・地域毎に設定；多包裹组合 | NO_ADDITIONAL_FEE + MULTI_PACKAGE_CAUTION；核实整套费用覆盖 |
| 1000 | 800 | 送料込み | ADDITIONAL_FEE_REQUIRED；异常金额须确认 |
| 1000 | UNKNOWN | 送料込み | OPERATOR_CONFIRM |
| 1000 | 1000 | 运费模式未知 | OPERATOR_CONFIRM；先核实配置 |
| 任意 | 任意 | 已确认不可配送 | NOT_SERVICEABLE |

## 7. 消费者与变更治理

- Inquiry Handling Skill、Commerce Ops、CatalogSync、Store Ops 可引用 BUS-LOG-002，不另写冲突的判断逻辑。
- Supabase Knowledge 是客服运行时检索入口；现有地区配送候选 Knowledge #36 需在审核时引用此文件并对齐，不应保留竞争性北海道规则。本文档本次变更不自动批准或激活数据库知识。
- Product owner 核实 Giga 数据字段和 Mercari 配置映射后，才可实现自动判定；测试应覆盖缺失值、费用相等/不等、送料込み/送料別三种模板、固定映射、多包裹组合风险、多件、不可配送与费用异常。
- 按 [Business Governance](GOVERNANCE.md) 维护。源数据、运费政策、供应商语义或 Listing 配置变动时重新取证。Sponsor 已明确业务判断；本次未做实际商品回放、费用收取或生产验证。
