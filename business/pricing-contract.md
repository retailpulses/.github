# Canonical Pricing & Margin — Business Contract（Draft）
状态：**Sponsor Review / NOT executable authority** · 日期：2026-10-29
依据：[inbox #379](https://github.com/retailpulses/inbox/issues/379)、[Pricing Review](https://github.com/retailpulses/commerce-lab/blob/main/docs/pricing-margin-review-2026-10-07.md)、[Giga Dictionary](../references/giga/data-dictionary-mapping.md)。本文件是跨产品**业务语义提案**；现有可执行实现及已批准策略的 Owner 需在评审中核对，不以本 Draft 静默替换。

## 术语
| ID | Term | 定义 |
|---|---|---|
| BUS-PRC-001 | Standard TCOGS (C_std) | **Giga Standard Unit Price (U) + Unit Fulfillment Fee (F_u)**，同币种、同单件粒度、同适用时点；履约费的来源与包含范围须核实 |
| BUS-PRC-002 | Effective TCOGS (C_eff) | 以 Effective Cost Price 为采购成本基础、按现行 Canonical Contract 计入适用履约费用的有效总成本；**不得**直接等同于 Standard TCOGS |
| BUS-PRC-003 | Direct Margin | 基于实际结算收入、平台佣金及 Effective TCOGS 的 Direct Contribution / Revenue；现有合同为主要经营定价口径 |
| BUS-PRC-004 | Standard TCOGS 8% Profit Floor | 在扣除适用佣金与未包含的额外成本后，单件利润 **>= 0.08 × C_std**；不是 U×1.08、也不是销售收入 8% Margin |

## 数学契约（待核实结算与取整细节）
设 X=商品有效售价，S=买家支付且计入该笔商家结算的运费收入，r=对 X+S 适用的佣金率，E=未计入 C_std 的额外卖家成本（不得重复扣除 Unit Fulfillment Fee）。

- Revenue P = X + S。
- Standard-basis Profit = P(1-r) - C_std - E。
- Safety invariant: P(1-r) - C_std - E >= 0.08 C_std。
- 因此 X_floor_std = ceil((1.08 C_std + E)/(1-r) - S)，前提是 0 <= r < 1 且佣金确实作用于 P。
- Canonical-basis Direct Margin = [P(1-r) - C_eff - E_eff] / P；E_eff 仅为未包含在 C_eff 的额外成本，避免重复计费。
- 如存在适用的 Canonical Margin **强制底线**，最低安全售价为 max(X_floor_std, X_floor_canonical)；Standard Strategy 12% **目标**不能未经 Policy 决策自动升级为强制 Floor。

## 必须显式处理的边界
1. **佣金基数**：买家另付运费是否计入 Mercari 佣金、Coupon 平台/商家承担比例等按真实结算合同核实；不满足同基数假设时按分项佣金重新推导，不套用上式。
2. **履约费不重计**：Unit Fulfillment Fee 与实际运费/卖家配送费用的重叠部分只能计算一次；差额/其他成本须有明确来源。
3. **有效价格**：Listing 原价、Time Sale、Coupon 后商家实际收入分别计算；有未知的折扣承担方时 UNKNOWN，不标 SAFE。
4. **JPY 取整**：先在 Decimal 精度下计算，再按平台实际费用/舍入规则复算整数售价；ceil 公式仅为理想连续佣金模型的候选解。
5. **时点/身份**：U、F_u、Effective Cost、Listing Price、Shipping 与佣金需有 Item Code/Variant/Shop 关联和 freshness；缺失任一关键输入分别显示 UNKNOWN。
6. **保护范围**：本轮仅设计 Review，不授权自动改价或市场发布。

## Product Center 消费
Variant 保留 Standard/Effective 成本事实和来源；Listing 结合 Shop、有效价格、佣金、运费计算两条独立安全状态；SPU1 聚合所有 Variant/Listing 的风险。计算应由同一 Canonical Pricing Contract 的可执行实现提供，不复制多个不一致的计算器。

## Acceptance / Tests（尚未执行）
卖家包邮、买家付运费、运费佣金差异、促销/券、JPY 边界舍入、成本缺失/过期、Standard vs Effective 不同、履约费重复计费、全店 Listing 聚合；验证不变量和违反底线的拒绝/标记行为。实现与生产数据验证另行立项。

## Mercari 10% Commission & Shipping Resolution (review amendment)
- Mercari Shops 的通常销售手续费按 **10%** 作为当前 Mercari policy rate；买家另付运费时，官方明确**包含运费的销售额**亦计收 10%。实际交易手续费、优惠承担和政策生效日期仍应按平台订单/结算复核。官方：[送料別（購入者負担）の設定方法](https://support.mercari-shops.com/hc/ja/articles/38335694650137-%E9%80%81%E6%96%99%E5%88%A5-%E8%B3%BC%E5%85%A5%E8%80%85%E8%B2%A0%E6%8B%85-%E3%81%AE%E8%A8%AD%E5%AE%9A%E6%96%B9%E6%B3%95)。
- **送料ID (CSV) ≠ shippingConfiguration.id (GraphQL)**。官方 API 指出后台配置的送料ID 对应 `ShippingConfiguration.displayId`；创建/更新商品时使用 `ShippingConfiguration.id`。[Mercari API FAQ](https://api.mercari-shops.com/docs/index.html)。代码已处理区别：[StoreOps migration 003](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/local_offer/migrations/003_offer_identity_authority.sql)。
- 解析链：`Shop + CSV 送料ID → ShippingConfiguration.displayId → ShippingConfiguration.id → 区域/都道府県运费表 → destination shipping amount`。配置 ID 是引用，不是 JPY 数值；同一 ID 可随目的地有不同运费。无法解析目的地时可显示 worst-case 评估值，但不可冒充订单实际运费。
- 官方送料模板支持全国一律、地区、都道府県三种规则，且订单数量、最高运费和运费折扣另有计算设置：[Shipping Setup](https://support.mercari-shops.com/hc/ja/articles/38335694650137-%E9%80%81%E6%96%99%E5%88%A5-%E8%B3%BC%E5%85%A5%E8%80%85%E8%B2%A0%E6%8B%85-%E3%81%AE%E8%A8%AD%E5%AE%9A%E6%96%B9%E6%B3%95)、[Shipping Calculation](https://support.mercari-shops.com/hc/ja/articles/62060756312601-%E9%80%81%E6%96%99%E3%81%AE%E8%A8%88%E7%AE%97%E6%96%B9%E6%B3%95)。
- **成本去重**：Giga Unit Fulfillment Fee 是 Standard TCOGS 的成本输入；买家支付运费是收入；配送商实际运费是成本。三者不能按字段名直接互相抵消。需记录 fee coverage，未包含的额外成本才加 E。订单实付配送费与买家收取运费可能不同。
- 验收：seller-paid / buyer-paid、不同目的地、同商品多件、运费折扣、CSV displayId/API id 误用、过期/缺失模板、10% fee、JPY 舍入、TCOGS 去重。
