# Mercari Time Sale 业务策略（Shop1–Shop4）

> 状态：业务规则归档；2026-11-14 从 [store-ops Time Sale DESIGN](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/DESIGN.md)、[README](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/README.md)、[CURRENT_STATE](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/CURRENT_STATE.md) 和 [ADR-0002](https://github.com/retailpulses/store-ops/blob/main/docs/decisions/ADR-0002-timesale-v2-commercial-fallback.md) harvest。
>
> **权威边界**：本文是跨产品可复用的商业政策与运营 SOP，不是产品设计、部署报告或 Seller 平台规则的替代品。具体计算/CSV 契约以 StoreOps DESIGN/TRD 为准；实际线上版本必须读 runtime 证据。V2.1 是获批目标策略，不代表已经上线。

## 1. 商业目标与适用范围

- 适用于 Mercari Shops Shop1–Shop4；运营分析与候选排序可以 Shop4 优先，但基础定价和成本治理不按店铺分别制定。
- Time Sale 的作用是提高合格 Listing 的曝光和转化，在保障**实际直接毛利底线**的前提下尽可能扩大可参加商品池；不是全店一刀切降价，更不能为了促销牺牲硬性毛利要求。
- 采用 **Shop 级别、Operator Human-in-the-Loop** 运行：选择商品/店铺 → 价格与风险预览 → 生成并审核 CSV → 人工上传 Seller → 检查 Seller 结果并留证。不存在经本文授权的自动上传或自动生效。
- 商品选择中的市场需求信号（近期销量、浏览、いいね、季节性）应用于**运营优先级**，不能替代成本、毛利和官方价格约束。仅凭本策略不自动触发促销。

## 2. 商业定价口径（获批 V2 规则，V2.1 继续保留）

**成本权威**：

1. 优先有效 **Effective TCOGS**；否则回退有效 **Standard TCOGS** = Giga 商品 Unit Price + Unit Fulfillment Fees。
2. 成本包含对应履约费，**不能重复计入运费**。不得把历史订单的 Monthly P&L 成本分配作为当前定价成本。
3. 两种成本均无有效数值时标记 `COST_UNAVAILABLE`，不得估算或填零。
4. Mercari commission 使用 10% 进行 Time Sale 定价；买家另外支付的运费须遵守现行计佣与运费口径，详情以 [pricing-contract](../pricing-contract.md) 为准。SELLER payer 对买家运费收入 S=0；未知 payer **不能**当作零。

**三分段默认政策**（可在单次运行中由 Operator 修改 margin floor 与 discount soft cap；修改应保留审计证据）：

| Segment | 归类 | Direct Margin Floor（硬底线） | Discount Soft Cap（偏好） |
| --- | --- | ---: | ---: |
| NO_DISCOUNT | Effective 与 Standard TCOGS 相等 | 8% | 5% |
| HIGH_DISCOUNT | Standard - Effective 的成本差额相对 Standard >=10% | 13% | 8% |
| OTHERS | 正差额 <10%，或分段输入缺失/无效/矛盾 | 11% | 5% |

分段阈值按**未四舍五入比例**判断；归类失败落入 OTHERS **不意味着**允许缺失定价成本。Discount Soft Cap 是折扣倾向，**不是**硬性资格拒绝条件。当 Seller 价格上限使首选折扣不可行、但更深折扣仍满足毛利及官方约束时允许 `SOFT_CAP_OVERRIDDEN`，必须记录实际折扣与毛利。不得为了恢复资格降低 Margin Floor。

**公式与边界**：设候选价 P、已含成本侧履约费的 C、买家支付运费收入 S、分段硬底线 m、偏好折扣 d，则最低毛利安全售价为 `ceil(C / (0.90 - m) - S)`（遵从 StoreOps 当前严格字段语义）。候选还须符合 Seller 提供的最低/严格最高价格，以及 Mercari 促销实际数字条件：促销价至少 ¥300、比当前价低至少 ¥100、处在折前价的 10%–99% 范围。不得突破平台规则强行导出。实现中其余字段 H/I/E 等解释见 [DESIGN TS-REQ-05](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/DESIGN.md)。

## 3. 资格策略：区分 V2 现状与获批 V2.1 目标

### V2（已有 2026-11-02 生产发布证据）

原 V2 将库存为零、库存观测过旧及部分 shipping/source 状态作为资格拒绝条件，同时维持毛利、身份、成本、官方数字限制等硬约束。它是历史实装基线，不应再被描述为目标策略。

### V2.1（2026-11-06 Sponsor 批准的 Margin-first 目标；部署待核验）

- **唯一内部商业硬门槛是可证明的 Direct Margin Floor。** 已确认零库存、库存未知/过时、来源覆盖/复制年龄、Seller/Promotion 观测未知及**运费观测时间过旧**属于非阻断 advisory，不是因为风险标签存在就剔除候选。
- **计算与导出前提仍为硬条件**：有效 Create CSV、无歧义商品身份、可计算正数成本、需要时真实可用的运费金额、官方 CSV/数字/折扣上下限。未知买家运费金额或 payer 令毛利无法计算时不得声称 PASS。未知 Seller 状态不等于 Seller 已认可。
- 资格分为 `commercial_candidate`（能算毛利且满足对应分段最低值）和 `exportable_candidate`（前者且满足官方结构、身份与价格限制）；advisory 与阻断原因独立显示。一个商品可同时具备多个 advisory。
- 已知零库存仍可成为候选或可导出，**不等于能即时履约**；实际上传前的供货及预售/交付判断仍属 Operator 的商业运营责任。不得因为候选资格扩大而宣称库存已补齐。
- 对 stale shipping 可以在来源、金额及计价语义可靠时使用 last-good 金额并提示年龄；不得把真正缺失的 buyer shipping 金额视为非阻断。
- Shipping 事实由 Canonical Listing/commerce-lab 负责生产，Time Sale 只读消费；不得在 Time Sale 内建设第二套 Seller 抓取、运费权威或重试队列。[commerce-lab #285](https://github.com/retailpulses/commerce-lab/issues/285)。

## 4. 运营运行 SOP

1. **选店与选品**：以 Shop4 为优先业务分析对象，但生成结果严格以单店 Shop context 隔离。使用最近 30 天销量、季节性、浏览/いいね 和商业贡献识别优先推广商品；这些信号为运营优先级建议而非系统资格门槛。
2. **输入**：从对应 Mercari Seller 获取官方 Create 原始注册 CSV（16 列），仅处理有效 CREATE；使用 SKU1 商品管理代码关联成本；不允许重复 Listing ID。Start/End 使用 JST，默认开始 now+30 分钟向上取整至 15 分钟，结束为严格晚于开始的下周一 02:00；Operator 可显式覆盖。
3. **模拟**：在同一冻结商业事实快照上比对 Default vs Adjusted 六参数，查看合格数、GAIN/LOSS、价差、实际毛利、soft-cap override、阻断原因及 advisories。修改参数或基础事实发生变化后必须重新 Preview。
4. **生成与审核**：仅在 Operator 明确 Generate 后生成官方 16 列 UTF-8 BOM CSV、`failed.csv`、`review.xlsx`、summary/ZIP；检查每个商品的毛利、价格与警告。失败报告不是 Seller 上传文件；零成功也应保留失败明细。不得以回放或 smoke 测试代替正式 Generate。
5. **Seller 人工上传与核验**：CSV GENERATED 仅代表本地生成，不代表 Seller `ACTIVE`、`ELIGIBLE` 或审核成功。上传后检查 Seller 结果/失败文件，按独立证据记录是否确认，并处理被拒商品。
6. **取消**：使用 Seller 的单独 14 列 UPDATE CSV；默认结束文件内全部行，也可选部分行；只将所选行的 `値引き終了日時` 写为字面 `end`，其他字段保持不变；人工上传并单独核验完成状态。
7. **审计与恢复**：保存 Shop、有效 policy、Job、input/output hash、Preview 绑定、排除原因、操作证据与阶段状态。PARTIAL 不得显示为成功；相同 Job 安全恢复，不得双重创建促销或将 GENERATED 冒充 ACTIVE。

## 5. 商业指标和评估方法

每店/每轮至少统计：有效 Create 数、Commercial candidates、Exportable candidates、实际上传数、Seller 实际接受数、实际销售额/件数、毛利与促销前后增量（注意对照和季节性）、未达标及平台排除原因、SOFT_CAP_OVERRIDDEN、零库存/过时数据等 advisory、有效数据覆盖和恢复情况。需求信号与销售增长属于**待验证效果**；Preview 只模拟合格与价格，**不**预测转化或增量销量。

Shop4 应优先分析：高浏览/高いいね但低转化、高近30天销量、冬季需求强且毛利安全的商品；不应因为热门就跳过可履约判断。促销效果要结合 Newsletter、自然流量和其它活动避免错误归因。

## 6. 发布证据与未完成事项（不可混写为当前线上状态）

- **已核实的历史 V2 发布**：2026-11-02，store-ops [#260](https://github.com/retailpulses/store-ops/issues/260) / [PR #268](https://github.com/retailpulses/store-ops/pull/268)，Time Sale provider SHA `3244017ca73695312096d71ce6fa2c580707e490`。当时 Shop4 1165 qualified / 1143 failed；仅代表当时快照。
- **V2.1 离线验证**：2026-11-06 同快照 Shop4 对比，V2 1085 qualified，V2.1 1629 commercial/exportable，增加 544、减少 0；含 141 个零库存被恢复；最低直接毛利 8%，零已观测输出/毛利违规。这是离线 Replay，**不是**真实 Seller 接受数或生产上线数据。见 [CURRENT_STATE](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/CURRENT_STATE.md)。
- **阻断项**：现有 CURRENT_STATE 记载 V2.1 尚未部署，独立代码评审、replay 输入认可/原始 11-06 样本核对和部署后 SHA/回滚/只读 smoke 证据尚需完成；跟踪 [store-ops #281](https://github.com/retailpulses/store-ops/issues/281)。本文的创建不构成部署授权。
- **数据冲突注意**：部分既有 merchandising 文档仍按 V2 口径把库存作为 Timesale 资格硬门槛。V2.1 策略对此作出区分：系统候选可保留零库存 advisory，但人工正式投放时仍应确认履约、预售规则和客户体验。不要擅自覆盖其它业务文档的库存销售政策。

## 7. 事实归属与维护

| 领域 | Canonical owner |
| --- | --- |
| 商业促销策略、优先级、运行 SOP | 本文件（`/.github/business/mercari/timesale-strategy.md`） |
| Time Sale 精确计算、源文件规范、状态机、测试 | [store-ops DESIGN/TRD](https://github.com/retailpulses/store-ops/tree/main/apps/mercari/timesale) |
| 当前代码/已部署 SHA、生产验证、回滚 | store-ops CURRENT_STATE、#260、#281 + 实际 runtime 读回 |
| 跨业务定价、平台手续费/运费口径 | [business/pricing-contract.md](../pricing-contract.md) |
| 当前 canonical shipping facts | commerce-lab Canonical Listing / #285 |
| 季节性/需求信号选择方法 | [merchandising/seasonality-method.md](merchandising/seasonality-method.md) |

更新规则：当产品设计批准新的商业决策，先核对原始 Sponsor decision、当前实施状态与冲突文档，再更新此归档；不得把实验、设计、生产和 Seller 接受四种证据混为一谈。
