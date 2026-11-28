# Shipping Fee Master Rule — BUS-LOG-002

状态：Sponsor-confirmed business decisions / Runtime verification pending · 2026-11-28
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
| E_a | Estimated Fulfillment Fee（表中 P_a + R_a） |
| S_a | 当前 Listing 向客户收取的目的地区域运费 |

确认同一 SKU/Variant、同一销售单位、币种、时点和费用粒度。禁止把 E_a 或 F_u 直接当作 R_a。当前 Giga 字段映射尚待运行验证。Listing 实时配置优先于旧快照。

#### ¥1,001 固定类别（BUS-LOG-002-RATE-001）

Sponsor 提供的典型数据，约占该类别商品的50%以上（比例为 Sponsor 估计，未独立统计）：

| Area | Packing Fee (JPY/unit) | Remote Area Shipping Fee (JPY/unit) | Estimated Fulfillment Fee (JPY/unit) |
|---|---:|---:|---:|
| Hokkaido | 165 | 1716 | 1881 |
| Okinawa | 165 | 4081 | 4246 |

确认 F_u=1001 时，按已指定固定规则直接取得上述区域费用，无需再次查 Giga 区域费；若已有明确的 SKU 特殊费率、不同销售单位或冲突证据，转人工核实。不得将该典型费率推广到其他 F_u。Sponsor 已确认：此前北海道 1880 为笔误，正确值为 E_a=1881；R_a=1716。北海道该类别确定为费用不相等；金额计算采用明确命名的 R_a。

其他 F_u：查询当前 Giga 对应区域数据；缺失或粒度不明则转人工。北海道原规则以区域费用与 F_u 相等/不等为判断依据；若源数据同时提供 R_a 与 E_a 且二者比较会产生不同结论，转 Operator 确认比较口径（建议用同口径 E_a 与 F_u 比较，尚待 Sponsor 确认）。不影响 ¥1001 类别。

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
| 北海道 | 区域费用与 F_u 相等且证据有效 | NO_ADDITIONAL_FEE |
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

定义 G=R_a−S_a。Sponsor 新增 ¥200 差额豁免：冲绳送料別 G<200 时不追加（包括零及负差额），G≥200 时按下式。北海道送料別的同一公式及阈值作为统一 Formula Version 对照；若与既有北海道 workflow（相等豁免、地区/都道府县模板豁免）冲突，保留差异并转 Operator，待 Sponsor 确认最终优先级。不得静默废除已有豁免。

当适用公式且 G≥200 时：
 
**Additional shipping fee = ceil((R_a − S_a) × 1.1 / 100) × 100 JPY**

- R_a 严格指 Giga Remote Area Shipping Fee，不包含 Packing Fee，不使用 Estimated Fulfillment Fee。
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

## 6. 验收与一致性（假设模板金额，非实际报价）

F_u=1001 类别：北海道 R=1716、E=1881；冲绳 R=4081。实际运费档位有限，以下优先使用 1001 倍数，但不将该规律当作模板数据。

| 地区 | Listing 模式 / S | 原 workflow | Formula Version | 一致性 / 当前处理 |
|---|---|---|---|---|
| 北海道 | 送料込み / N/A | REQUIRED | N/A | workflow，金额人工 |
| 北海道 | 全国一律 / 1001 | REQUIRED | 800 | 一致 |
| 北海道 | 全国一律 / 2002 | REQUIRED | 0 | 冲突，人工 |
| 北海道 | 地域別 / 1001 | NO | 800 | 冲突，人工 |
| 北海道 | 都道府県別 / 2002 | NO | 0 | 一致 |
| 冲绳 | 送料込み / N/A | REQUIRED | N/A | workflow，金额人工 |
| 冲绳 | 全国一律 / 1001 | REQUIRED | 3400 | 一致 |
| 冲绳 | 地域別 / 3003 | REQUIRED | 1200 | 一致 |
| 冲绳 | 都道府県別 / 4004 | 原 REQUIRED | 0 | 新阈值明确覆盖旧 always |
| 冲绳 | 全国一律 / 5005 | 原 REQUIRED | 0 | 新阈值明确覆盖旧 always |
| 任意 | 不可配送 | NOT_SERVICEABLE | N/A | 停止 |
| 任意 | 组合商品、多包裹 | 按主流程 | 按适用性 | 独立风险核查 |

数学边界：G=199→0；G=200→300；G=0或负值→0。送料込み无 S，不进入公式。非¥1001类别应使用当前真实费率；北海道相等比较口径仍待确认。

## 7. Governance / remaining decisions

- [Business Governance](GOVERNANCE.md)；消费方 Inquiry Skill、Commerce Ops、CatalogSync、Store Ops 引用此规则；Supabase Knowledge #36 待对齐，不另设竞争规则。
- 业务结构按 MECE 分层；尚未确认的边界显式转人工，不假装已有最终定价规则。
- 待 Sponsor 核实：非 ¥1001 商品北海道比较使用 R_a 还是 E_a（同口径建议 E_a）；北海道 workflow 与 Formula Version 冲突时的最终优先级；多件订单取整粒度。送料込み不适用公式已确认，冲绳送料別 ¥200 阈值已确认。固定类别北海道 Estimated Fulfillment Fee 已由 Sponsor 确认为1881，旧1880为笔误，不再作为有效费率。最新费用表为 Sponsor 提供，未做独立供应商验证。
- 本次不涉及生产收费、数据库变更、运行验证或部署。
