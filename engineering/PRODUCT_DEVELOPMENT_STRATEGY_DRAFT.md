# 产品开发策略草案：Capability-First, Database-Backed, UI-Minimal

> 状态：**DRAFT / 讨论稿，尚未批准为组织级强制规范**
> 日期：2026-11-13
> 适用候选范围：リテルパルス合同会社内部运营软件、批量数据处理工具与 Agent 辅助业务系统
> 权威边界：本文件是策略提案；现行 `engineering/ENGINEERING_PRINCIPLES.md` 与 `engineering/DOCUMENTATION_STANDARD.md` 的既有权威不变。不得据此直接修改生产系统或扩大已批准产品范围。

## 1. 要解决的问题

运营软件开发容易以页面为单位规划功能：先设计管理列表、详情、编辑、异常处理和审核界面，再补齐后台数据与处理逻辑。这会把人工点击流程误当作产品能力边界，增加前端开发、测试与维护成本，并使 Agent/自动化无法独立完成后台工作。

本策略希望优化的不是“页面数量”本身，而是**单位业务成果所需的工程工作量、持续维护负担和人工运营注意力**。

## 2. 战略定义

**Capability-First, Database-Backed, UI-Minimal（能力优先、持久化支撑、最小必要 UI）**

- **Capability-First：** 先定义业务成果、领域对象、状态转换、执行操作和失败恢复，再决定交互形式。功能完成不等于页面完成。
- **Database-Backed：** 对需要跨会话复用、审计、恢复或异步处理的业务事实、运营决定、任务状态与结果建立明确的持久化权威；不要求所有中间数据落库，也不要求所有产品共享数据库。
- **UI-Minimal：** 只为人工输入、判断、例外授权及必要的结果反馈建设 UI。后台能力不应因为没有专用页面而缺失。
- **Agent-Operable（配套要求）：** Agent/CLI/批处理与 UI 应复用受控的业务操作和校验，而不是绕过领域规则任意修改数据库。能确定性完成的工作优先由普通代码执行，Agent 用于分析、解释、建议与受控批量处理。

**核心原则：UI 暴露业务能力，但不定义业务能力的上限。**

这里的 Database-Backed 并非传统“先建表再找需求”的 Database-First。数据模型必须由业务能力驱动，并随真实需求渐进演化。

## 3. 对开发工作的预期价值（待实测）

| 目标 | 机制 | 可观察指标 |
| --- | --- | --- |
| 缩短业务结果交付时间 | 先交付可运行的处理引擎、状态与导出，再补必要 UI | 首个有效业务产物所需时间 |
| 降低 UI 建设与维护成本 | 不为每类后台异常建完整管理页面 | UI 页面/交互数量、维护工时 |
| 提高 Agent 可操作性 | 结构化状态、错误码、受控操作与重试入口 | Agent 无人工点击完成的安全任务比例 |
| 提高失败恢复能力 | 持久化队列、幂等、逐项隔离和审计 | 重启后恢复率、重复处理/丢单数 |
| 降低 Sponsor/Operator 注意力 | 只将真实业务判断和权限边界升级给人 | 人工干预次数、异常处理耗时 |

这些是**待验证的收益假设**，不是已实现的性能或成本结果。必须与 UI-Centric 基线比较，不能凭减少页面数声称成功。

## 4. 推荐设计与交付顺序

1. **Business Outcome：** 定义输入、业务结果、完成证据、失败时的可接受降级。
2. **Domain & State：** 定义实体、状态转换、身份、所有权、幂等与不变量；明确哪些状态必须持久化。
3. **Operations：** 实现可由服务、CLI、Agent 或 UI 复用的受控业务操作；明确权限、参数验证和审计。
4. **Durability & Recovery：** 按风险实现最小必要的持久化、任务队列、逐项失败隔离、重试与恢复。
5. **Working Vertical Slice：** 使用真实或受控 fixture 验证从输入到业务产物的端到端结果。
6. **Minimal Operator UI：** 只为不可省略的人工交互和必要反馈建设界面；验证可用性和安全边界。

这是设计优先级，不是禁止前后端并行开发，也不要求每个微型工具引入数据库、Agent 或队列。

## 5. UI 减法判断

对每个拟议页面或控件询问：

1. 移除它，Operator 是否会更难正确完成业务任务、做出必要判断或恢复失败？
2. 相同能力能否安全地由 Agent/CLI/自动化通过既有受控操作完成？
3. 该 UI 是否只是展示技术内部细节、测试控制、审计原始日志或开发流程？
4. 是否存在权限、法律、安全或高风险业务决定，必须保留明确的人类确认？

如果 UI 不是业务必需，优先不建专用页面；但不得隐藏会影响决策的真实异常、数据失效或操作结果。

## 6. 首个试点：Store-Ops Giga → Mercari CSV（PR #313）

**试点依据：** https://github.com/retailpulses/store-ops/pull/313#discussion_r4559316800

业务场景：一批 100 个商品中，85 个通过验证、15 个失败。期望：

- 85 个合格商品不因其余失败而阻断 CREATE CSV 导出。
- 15 个失败商品的来源、错误码、状态、运行关联与重试资格可持久化查询。
- Agent 可分析错误、提出批量修复并通过受控操作重试；不得绕过商业规则或自动批准未知事实。
- MVP 不要求独立 Failure Management UI；但应提供必要的失败数量与结果反馈。
- 图片排序、已接受标题/描述/分类等人工增值决定跨重导入保留，遵守身份与版本约束。
- Seller 上传/回执、Canonical Product/Image/Listing 写入仍在本独立产品范围之外；不得以策略之名扩展。
- SQLite 为此试点已明确的持久化选择，不意味着组织统一强制 SQLite。

**试点验收：** 使用受控输入与明确预期输出验证部分成功、失败隔离、重复导入幂等、重启恢复、Agent/CLI 查询和受控重试、必要 UI 的完整业务路径。记录实际开发工时、UI 复杂度与人工介入，不能仅以数据库表数或测试通过数评价。

**当前事实边界：** PR #313 仍是设计草案，不能据此认定相关数据库、队列、Agent 操作和 UI 已实现或运行验证。

## 7. 反模式与适用边界

- **Schema-First Overengineering：** 为不明确的未来功能预建大量表、状态与抽象。
- **Database as Public API：** 允许 Agent/页面直接写业务表，绕过领域规则、权限和审计。
- **No-UI Dogma：** 为了少做 UI 而把必要的人类判断变成危险的脚本或 SQL 操作。
- **Agent for Deterministic Work：** 让 LLM 替代已有可确定性验证的规则、导出或状态机。
- **Shadow SSOT：** 为便利而复制已有 Canonical 权威，形成难以协调的第二真相来源。
- **Premature Platform：** 为一个 MVP 引入通用 Agent 平台、消息基础设施或微服务体系。

适用性由业务风险、人工交互需求和运营规模决定。纯展示型产品、一次性小脚本、复杂人工创作界面等场景不应机械套用。

## 8. 与既有组织讨论的关系

本草案**不声称既有 Issues 已经批准此战略**。以下仅为相关证据与可复用经验：

- [/.github #58](https://github.com/retailpulses/.github/issues/58)：Presentation / Application / Domain / Infrastructure / Worker 职责分离（候选指导原则）。
- [/.github #73](https://github.com/retailpulses/.github/issues/73)：Time Sale 复盘，区分 Operator UI 与技术/测试/审计信息（候选经验）。
- [/.github #42](https://github.com/retailpulses/.github/issues/42)：最小 Data Model 契约、所有权、状态和恢复（标准评审）。
- [/.github #37](https://github.com/retailpulses/.github/issues/37)：Agent-first 工程与业务验收证据（提案）。
- [/.github #95](https://github.com/retailpulses/.github/issues/95)：Agent-Owned Sprint Delivery，解决的是**交付执行责任**，不等于本产品架构策略。
- [/.github #90](https://github.com/retailpulses/.github/issues/90)：逻辑产品边界与数据库/仓库/运行时边界分离；保留现有 SSOT。

## 9. 待讨论与后续动作

- **Open Question：** 是否采用该名称，还是对外保留更短的 “Database-First, UI-Minimal” 作为沟通简称？
- **Open Question：** 哪些类型的人工操作必须保留 UI，哪些允许 CLI/Agent 作为主要操作入口？
- **Next Action：** 在 PR #313 中验证上述假设，记录真实收益与失败模式；不预先推广为所有项目的强制规则。
- **Governance：** 经 Sponsor 评审并获得实证后，才考虑对现有 `engineering/ENGINEERING_PRINCIPLES.md` 做最小增补；不建立重复标准或新治理平台。
