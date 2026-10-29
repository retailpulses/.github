# Business Definition Governance（Pilot / Draft）
状态：Sponsor Review · 日期：2026-10-29

1. **适用性**：仅登记跨产品、跨仓库复用或易发生语义冲突的业务概念、计算不变量与身份定义。单产品细节留在产品 Design/TRD。
2. **一处定义，多处引用**：组织级 Business Registry 作为共享语义入口；外部事实由供应商官方资料及 [references](../references/README.md) 支持；Executable Schema、计算代码、测试、Runtime 证据归实现 Owner。
3. **审批与证据**：Draft → Sponsor Review → Approved → Superseded。事实验证状态独立记录 UNKNOWN/PARTIAL/VERIFIED；文档批准不等于代码或 Runtime 验证。
4. **稳定 ID**：BUS-领域-序号，不回收。每项说明定义、粒度、边界、Owner、来源、消费者和关键未决事实。ID 是引用锚点，不要求新增数据库主键。
5. **变更影响**：语义或公式变更 PR 需标注受影响的 Product Design、API、DB、Tests 和必要迁移；一般文字澄清不强制迁移。禁止静默覆盖已有已批准契约。
6. **Simple + Robust**：Git Markdown + PR Review 即可；不建立强制人工审批系统、业务定义服务、通用 runtime gate 或重复测试报告。
7. **试点**：Pricing、Product Identity、Marketplace Category；先验证 Product Center/NPL 的引用效果，再决定是否推广。未核实 Family、履约费字段、佣金/运费结算口径不应伪装成已批准事实。

遵循 [Engineering Documentation Standard](../engineering/DOCUMENTATION_STANDARD.md) 的 Design / TRD / Current State 权威区分和 [Foundational References](../references/README.md) 的外部来源原则。此文件是提案，尚未修改组织强制标准。
