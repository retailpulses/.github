# Retailpulses Documentation Standard v1.0 (Proposed)

Status: Pilot — merged for trial adoption; subject to pilot findings
Owner: retailpulses/.github
Governance: https://github.com/retailpulses/.github/issues/16
Language: 简体中文为主；保留产品、代码和日本业务的原生术语。

## 1. Purpose
建立可被 Product Owner 理解、Agent 定位和持续维护的产品知识基线，避免 Issue 与代码成为唯一事实来源。以降低理解、决策和迭代成本为首要目标，不以文档数量或流程合规为目标。

## 2. Authority and roles
- Product Design: 已批准的目标产品行为、能力、工作流、业务规则及边界。
- Architecture: 系统职责、数据所有权、依赖、拓扑和架构约束；保留现有 `docs/01_ARCHITECTURE.md` 约定。
- TRD / Contracts: 重要技术细节、数据/API契约和验证条件；不重复定义产品行为。
- Current State: 有证据的实现、部署和运行状态；代码存在不代表部署。
- ADR: 重要长期决策的背景、选择、后果与替代方案。
- GitHub Issues/PRs: 变更、执行、交付与验收记录；不建立平行 Markdown Backlog。
- README / AGENTS: 导航与执行指令；不得成为相互竞争的设计权威。

产品 Design 与 Architecture 是不同维度的权威；发生冲突应报告，不得以代码或最新 Issue 自动覆盖已批准设计。组织仓库维护规范与索引，产品细节留在产品仓库。现有 rp-governance-kit 仍是治理工具权威，本规范不替代其执行机制。

## 3. Design structure
推荐顺序：Product Overview（用户/价值/目标/非目标）→ Capability Map → End-to-End Workflows → Requirements（稳定 ID）→ Shared Business Rules → Decisions/Open Questions → Dependencies/References。
Capability/Workflow 是阅读主轴；Requirement ID 是定位与追踪锚点，不强制每项需求都成为独立主章节。需求描述应包含用户价值、预期行为、边界/异常、验收意图及必要引用。

## 4. States
明确分离：
- Design: Draft / Sponsor Review / Approved / Superseded。
- Implementation: Planned / Implemented / Merged / Deployed / Runtime Verified；缺少证据标 UNKNOWN。
- To-Be 与 As-Is 明确标注；Approved 不等于 Deployed，Canonical 不等于 Runtime Verified。
- 不得把代码现状直接反写为目标设计，或把目标设计描述成当前已运行事实。

## 5. Living-document rule
Design 正文仅描述当前有效的目标。新决策通过修订现有章节收敛；过期叙述、POC、Sprint、样本审计迁至适当历史/证据记录或以 Git 历史与 Issue/PR 链接保存。禁止无止境追加“第N轮反馈”章节。保留来源与迁移对照，不能静默丢失未解决问题。

## 6. Traceability
最小关联：Requirement ID ↔ Design；行为变更 Issue/PR → Requirement ID；交付范围内 Requirement ID → Acceptance Evidence。TRD、ADR、Gap、Runtime 按风险与需要引用，不建立强制八层人工追踪矩阵。ID 不回收、不随章节移动而变化。

## 7. Proportionality
L1（脚本/一次性工具）：README + Issue。
L2（持续迭代产品）：README + Product Design + Architecture/技术说明。
L3（跨系统/关键业务）：L2 + 必要 TRD/Contracts + Current State + 重要 ADR。
允许小型产品合并物理文件，但逻辑权威必须明确；不强制所有功能创建 TRD、ADR 或 Phase。

## 8. Agent entry and reading order
1. 阅读 repo AGENTS/README 和产品文档入口。
2. 阅读适用的 Product Design、Architecture 和 Current State。
3. 按 Requirement ID 定位相关 TRD/Contracts/ADR/Issues。
4. 检查代码与必要运行证据，形成 As-Is vs To-Be Gap。
5. 遇到矛盾或决策缺口，标记并请求 Sponsor 决定，不擅自选择。
6. 仅对已批准的变更实施代码或文档更新。

## 9. Documentation reconciliation
产品行为、架构、数据所有权、关键接口或已验证运行状态变化时，在同一 PR 中更新相应权威文档，或明确说明为何无需更新。Patch 不强制新增文档。PR closeout 应写明：相关 Requirement ID、变更的权威文件、测试/运行证据、未解决差异。部署状态必须有独立运行证据。

## 10. Adoption and acceptance
先在 Monthly P&L（需求/计算契约）和 New Products to Listing（历史追加收敛）双试点，不一次性改造全组织。验收：Owner 不看代码能理解能力/流程/规则；Agent 能从 Requirement ID 找到契约；原有有效业务语义无损；历史证据可追溯；没有新建平行任务账本。试点验证完成并完成必要修订后，再将本规范标记为 Approved。

## 11. Compatibility
不强制重命名现有 DESIGN.md、design.md、01_ARCHITECTURE.md 或 TRD。使用 README/DOC_INDEX 标明角色和链接。与现行中央架构治理发生冲突时，记录冲突并先取得明确决定，禁止静默覆盖。
