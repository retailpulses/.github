# Design Migration Guide — Agent Handoff

Status: Pilot v1.0
Standard: [Documentation Standard](DOCUMENTATION_STANDARD.md)
Tracking: https://github.com/retailpulses/.github/issues/16

## Goal
将历史 Issue-centric、累积追加式文档整理为易理解、可追踪的 Product Design Baseline。此任务是知识结构重整，不授权重设计产品、改代码、部署或修改生产数据。

## Workflow
1. Inventory: 枚举产品 README、Design、Architecture、TRD、Current State、ADR、相关 Issue/PR、AGENTS；识别当前权威和文件状态。
2. Extract: 从文档中提取能力、用户工作流、需求、共享业务规则、决策、技术契约、实施事实、POC/历史证据。为每条重要规则记录原始出处。
3. Reconcile: 建立 source → target 迁移矩阵；分类为 Current Approved、Proposed、Historical/Superseded、Implementation Evidence、Open Question。冲突不得按时间最新自动裁决。
4. Draft: 依模板组织当前有效 Design；技术契约保留/移至 TRD，运行事实保留/移至 Current State，历史材料保留原始出处或可访问引用。
5. Validate: 逐项检查原有有效需求、关键例外、数据权威、业务公式和安全约束是否保留；验证链接；列出无法确定的冲突。
6. Review: 提交单独 docs-only PR，提供变化摘要、迁移对照、冲突与 Sponsor 决策清单。未经批准不得直接替换既有权威正文。
7. Adopt: Sponsor 审阅批准后合并，更新 README/AGENTS 导航；后续功能 PR 依标准做文档 reconciliation。

## Non-negotiable rules
- 不修改业务规则或隐含批准待决设计。
- 不把 POC 通过、测试通过或代码存在写成生产已验证。
- 不删除唯一历史证据；保留可追溯来源和原始文件/Git 历史。
- 不创建平行 Issue Backlog、第二个架构 SSOT 或新治理服务。
- 不机械地按 Requirement ID 打散完整用户工作流。
- 不因为某段历史文字较新就认为它具有最高权威。
- 不在迁移过程中修改应用代码、数据库、部署或密钥。

## Required PR output
- Product overview and capability map.
- Current authoritative document map.
- Requirement ID registry and workflow mapping.
- Source → destination migration table, including historical/superseded references.
- As-Is vs To-Be and approval/implementation status distinctions.
- Unresolved contradictions requiring Sponsor decisions.
- Evidence that no approved business behavior was lost.
- Agent reading entrypoint and next-iteration handoff.

## Pilot A: Monthly P&L
Focus: distinguish Design from field-level cost calculation/TRD, accounting pending policies, source evidence and delivery scope. Preserve PNL IDs and unresolved decisions.

## Pilot B: New Products to Listing
Focus: consolidate appended chapters and successive POC feedback into living product behavior, with separate historical evidence. Do not infer actual Mercari publication from tests or local deployment.

## Copyable instruction for next agent
请读取 retailpulses/.github/engineering/DOCUMENTATION_STANDARD.md、engineering/DESIGN_MIGRATION_GUIDE.md 和 engineering/templates/PRODUCT_DESIGN.md。先审计目标产品的 README、Design、Architecture、TRD、Current State、AGENTS、ADR 与相关 Issue/PR，建立原始条款到新文档的迁移矩阵；区分批准设计、提案、历史证据与已验证实现。按 Capability/Workflow + Requirement ID 双轴重构 Product Design，保留所有有效业务语义，不改变代码或生产环境。提交 docs-only PR，并列出冲突、待 Sponsor 决策、验收证据及阅读入口。未经确认不得合并。

## Foundational Reference reconciliation (Pilot addition)

在迁移任何依赖外部平台或共享数据契约的产品设计时，**先审计基础输入，再重组 Design**：

1. **Discover**：读取 [组织级 Reference Registry](../references/README.md)，枚举原 App/仓库内的 API Dictionary、官方链接、快照、SDK、SOP、字段表和消费者。找不到 Registry 项时登记缺口，不新建未经核实的平行权威。
2. **Classify**：对每个输入记录 Reference ID、Canonical source/版本、Owner、消费者、验证日期与环境，标注 Registered / Partially Verified / Verified(scope) / Stale / Retired；区分官方声明、代码推断、POC 结果和生产证据。
3. **Verify blocking facts**：主动核实影响设计行为的关键技术事实（API 权限、字段、分页、地域粒度、数据时效、读写限制、错误与恢复）；必要时用安全只读调用和脱敏证据。不能把验证任务推给 Sponsor。
4. **Map dependencies**：Design 的 Dependencies/References 只引用 Reference ID 与产品影响；TRD/Contracts 保留技术事实、证据和开放问题；Current State 仅记录可证明的部署/运行状态。不要在 Design 复制完整 API 字典。
5. **Retire duplicates**：旧目录的跨产品重复 Reference 加 Retired/Superseded 提示并指向组织级入口；产品特定契约、可执行 schema、实现代码及历史调查仍留原仓库。检查双向链接和下游消费者。
6. **Gate approval**：Blocking unknown 必须在 Design Baseline Approval 前验证，或经 Sponsor 明确批准独立于未知事实的安全降级；非阻断缺口可进入现有 Issue backlog。PR 说明哪些事实已经 Verified、哪些仍 Unverified，不将链接可用误称验证完成。

### 试点检查清单

- **GigaB2B**：Open API **1.0 Retired / 2.0 Required**；检查消费者的真实版本、认证及字段映射，不允许 1.0 fallback。
- **Mercari Inquiry / Customer Operations**：区分 Inquiry Dictionary 与 Listing/Shipping API；Shipping API Granularity（例如地区运费）仍为 Unverified，直到实际接口及证据确认。
- **Rakuten RMS**：先引用组织级按能力划分的 Reference Index，逐步补官方 Dictionary；历史 POC 不自动证明当前生产 read/write 权限。

轻量 Registry 与链接已足够作为本次 Pilot 的交付；完整跨仓库及 MacBook 资料扫描、Dictionary 补全和旧入口退役由 [Issue #19](https://github.com/retailpulses/.github/issues/19) 跟踪，不应阻断现阶段文档迁移。

### Updated copyable instruction for agents

在原有迁移步骤之前，先读取 `retailpulses/.github/references/README.md` 并识别所有跨仓库 Foundational References；逐项检查 source/version/verification scope，主动核实 blocking technical facts，记录脱敏证据；把 Reference ID 与验证状态写入 Design/TRD 的相应位置，退役重复字典但保留历史证据。Sponsor 负责业务决策，不负责验证 API 事实。不要因引用了 Reference 就声称 API 已经 Runtime Verified。

## UI Sketch consolidation and optional promotion

迁移产品设计时，**UI Sketch 默认属于 `DESIGN.md`**，而不是默认独立的 UI Spec：

1. Inventory 时同时发现历史 Sketch、Wireframe、Mermaid、截图、Figma/HTML 原型及其来源，区分设计意图与已运行界面证据。
2. 将仍有效的核心界面草图就近放入相应 Workflow/Requirement 章节，或汇总到简洁的 UI/UX Design 章节；保留关键交互、状态与 Requirement ID 关联，不把图示当成新的业务规则来源。
3. 仅在单文件难以维护时将细节 **promote** 到 `docs/ui/` 等从属文件。保留 `DESIGN.md` 内的核心 UI 概览、决策和入口链接；不强制为每个产品新建 UI 目录。
4. 标注 Exploratory / Approved / Implemented / Runtime Verified 状态；设计批准不等于生产界面已验证。迁移时保留历史原型及证据引用，避免静默丢失有效交互设计。
5. PR reconciliation 检查 UI 与业务流程是否一致、链接是否有效、独立细节是否产生平行设计权威；如 UI 调整改变产品行为，按既有 Sponsor 决策流程处理。

Agent 执行提示：默认把 UI Sketch 作为 Product Design 的组成部分直接整合进 `DESIGN.md`；只有维护复杂度确实需要时才拆分，拆分后仍以 `DESIGN.md` 为唯一产品设计权威。

## P0 migration: early POC, stack, deployment and architecture

在既有 Inventory / Extract / Reconcile / Draft / Validate 中补充：

1. **Concept and experiments**：收集产品目标、未验证假设及早期 POC（Issue、草稿、代码、实验数据）；提炼 Hypothesis → Method → Result → Limitations → Design Impact。仅将当前有效结论写入 DESIGN，实验细节保留在 Issue 或独立 experiments 文档。
2. **Technical choices**：识别现行技术栈与候选方案，区分 Proposed / Verified / Deployed；组件职责、数据所有权、关键技术选择归 Architecture；重大长期取舍归 ADR，避免把每个库的选择升级为 ADR。
3. **Deployment topology**：分别建立 Target Deployment（Architecture）与 Observed Runtime（Current State / Evidence）；列出运行主机、service/worker/job、触发、Secrets、监控、备份和恢复。代码存在或配置提交不证明进程已运行。
4. **Architecture review**：重大跨系统或风险较高的迁移，按 [Architecture Review Guide](ARCHITECTURE_REVIEW_GUIDE.md) 检查 Ownership、Truth、Authority、Transitions、Flow、Idempotency、Reconciliation、Failure、Evidence 和 Safe Change；小改动按需裁剪。
5. **Progressive promotion**：小项目允许把简短 Architecture/POC 结论写在 DESIGN 内；复杂度提升后将技术细节提升到 [Architecture Template](templates/ARCHITECTURE.md)、TRD、ADR 或 experiments。保留 DESIGN 的核心约束、决策和引用，不产生平行权威。

迁移 PR 还应说明：哪些 POC 结果影响了目标设计、哪些技术栈/部署仍属假设、哪些运行状态有证据，以及是否需要独立的 ADR/Current State。完整方法以 [Engineering Principles](ENGINEERING_PRINCIPLES.md) 为组织级入口；原始研究案例继续留在 inbox。

## Data Model reconciliation (Issue #42 Pilot patch)

迁移设计时，在既有 Inventory → Reconcile → Validate 流程内检查数据模型，不增加独立审批或必需的 `DATA_MODEL.md`：

1. **Discover**：寻找旧数据字典、ERD、DDL/ORM、migrations、同步/保留/删除说明，辨认各自 Owner 和版本；记录文档所声称的设计状态与代码/Runtime 证据。
2. **Separate authority**：业务实体意义与用户可见数据承诺 → Product Design；逻辑实体/关系、source of truth、读写责任和数据流 → Architecture；精确字段/约束/幂等/迁移/删除机制 → TRD、现有技术说明或可执行 schema（以链接引用）；已应用迁移和真实数据状态 → Current State。
3. **Reconcile lifecycle**：至少检查关键实体及关系、来源/派生、身份与唯一键、数据保留/删除（含备份/缓存）、迁移兼容和恢复；对不适用项标 N/A，对未核实项标 Open/UNKNOWN。历史文档若声称“不持久化”而代码包含持久化写入，必须显式列出 drift，不得静默采用较新说法。
4. **Validate and hand off**：在原有 source→destination 对照中列出数据模型语义的归位、关键缺口及技术证据；按 [Documentation Standard §17](DOCUMENTATION_STANDARD.md#17-data-model-documentation--lifecycle-pilot-patch-issue-42) 与 §15–16 核实阻断项；产品保留期限等业务决定由 Sponsor 确认，工程事实由 Agent 主动调查。

**Proportionality：** 单库小工具可以只保留简洁的 Architecture/技术段及指向 DDL 的引用；跨系统和关键财务产品需满足可验证的数据契约。不要为遵循迁移规范重写所有 Schema 或复制一份新的字段字典。参考：[Issue #42](https://github.com/retailpulses/.github/issues/42)。

## Brownfield Design Pack reconstruction and scattered-doc harvest (2026-10-29 clarification)

**适用场景**：已有运行代码、历史 Sprint/POC、散落 Design/TRD/SOP/测试材料的持续迭代产品。此节补充上文的既有 Workflow，**不创建第二套 Design Authority 或必填文件树**。本节属于 Pilot Guidance；既有 [Documentation Standard](DOCUMENTATION_STANDARD.md) §§2–9、15–17 仍为权威。

### 1. Reconstruct intent and reconcile actual behavior separately

- **Design Reconstruction (To-Be)**：从获批准的 Product Decision、历史 Design、Issue/PR 和仍有效业务规则恢复目标产品行为。代码中已有的实现不能自动成为批准设计。
- **Current State Reconciliation (As-Is)**：核对代码入口、依赖、Schema/migrations、Test Catalog/实际执行、CI、目标部署及可获取的 Runtime SHA/服务证据。无法直接验证的事实标 **UNKNOWN / Not Verified**；不将代码存在、Mock PASS、HTTP 200 误称 Runtime Business Verified。
- 对不一致处建立 **As-Is vs To-Be Gap**，注明证据、业务影响、Owner 和所需 Sponsor 决策；不得以“最新文件”或“当前代码”静默裁决。

### 2. Source inventory and harvest disposition

发现范围包括产品目录及上层 README/AGENTS、Design/Architecture/TRD/Current State/ADR、SOP、POC、Sketch、Test Plan、Test Catalog、fixtures、Issue/PR、相关共享 Registry。每份材料至少记录 **Source path/link、主题、原状态/日期（若可核实）、候选 Authority、Disposition、目标/保留位置、冲突或 UNKNOWN**。Source → Destination 映射可以放在 PR/Issue，不要求永久建立新文件。

| Source type | Harvest disposition |
| --- | --- |
| 历史 Product/Sprint Design | 将仍有效的 Operator Workflow、Capability、Requirement、业务规则合入当前 Product Design；保留原来源 |
| 旧 TRD/实施计划 | 仍有效的技术契约归 TRD/Contracts；执行进度与历史方案留 Issue/PR |
| Architecture/部署叙述 | 目标架构归 Architecture；经核实的运行事实归 Current State；重大取舍保留 ADR |
| POC/Research | 提炼已核实结论、局限及 Design impact；原实验留 Issue/归档，不自动升级为 Approved |
| Test Plan/逃逸缺陷 | 稳定测试定义归 Test Catalog；可执行代码及 CI/Runtime 证据保持各自 Owner |
| SOP/Operator Guide | 实际操作指引独立保留并从 README 导航，不与 Product Design 争夺业务权威 |
| 共享 API/Business Dictionary | 引用组织级 Foundational Reference / Business Authority；产品特定映射仍由产品 Owner 管理 |
| 重复/过时文档 | 核对来源、未解决问题与下游引用后标 Superseded/Retired；不删除唯一历史证据 |

### 3. Target Design Pack (logical roles, not fixed filenames)

- **README/DOC_INDEX**：单一阅读入口，列出权威、状态和历史材料。
- **Product Design**：Product Overview → Capability Map → End-to-End Operator Workflow → Requirement ID/Business Rules → Decisions/Open Questions。
- **Architecture**：组件、Owner、Source of Truth、数据流、集成、目标部署和故障/恢复边界。
- **TRD/Contracts**：适用的 API/字段映射、状态转换、数据契约、异常/幂等/迁移和可验证条件。
- **Current State**：实际代码、运行入口、部署环境/SHA、CI 与 Runtime 证据、已知差异。
- **Test Catalog**：Requirement/Workflow → Test ID → Expected Result；Test Report/CI 仅记录执行事实，不能取代 Catalog。

按 Standard §7 的 **L1/L2/L3** 适度合并物理文件；不强制新增 `docs/`、`tests/` 或 `frontend/backend` 目录，也不要求每个 Requirement 单独 TRD。

### 4. Brownfield execution and acceptance

1. **Inventory (read-only)**：列出全部候选资料、相关 GitHub Issue/PR、代码/测试/运行入口和当前导航。
2. **Reconcile**：逐条区分 Approved / Proposed / Superseded / Implemented / Deployed / Runtime Verified / UNKNOWN；建立冲突和差异表。
3. **Harvest**：逐条映射 Source → Authority/Target；保留关键公式、边界、状态、错误恢复、外部依赖及历史决策来源。
4. **Rebuild**：优先修订已有 Design Pack，保留稳定 Requirement ID；以 Current State 记录真实实现，不把未验证项写成已验收。
5. **Review / Consolidate**：docs-only PR 记录 source mapping、As-Is/To-Be gaps、决策待定、未验证项、历史链接及导航变更；Sponsor Review 后才更新权威与处理旧入口。

**验收（按适用性裁剪）**：
- Product Owner 无需阅读源码即可理解产品目标、能力、核心工作流及业务规则；
- Agent 能从 Requirement ID 找到适用的 Contract、Test ID 和实现入口；
- Architecture 能定位组件、数据 Owner、关键集成与运行边界；
- Current State 中的已部署/已验证主张均有对应 SHA、环境及独立证据，缺失时标 UNKNOWN；
- 历史有效规则、决策、未解决问题都有可追溯去向，重复文档不再构成平行权威；
- README/AGENTS 导航、链接和旧入口的 Superseded 状态经过检查。

**试点建议**：NPL 验证历史 Design/Meta/发布流程收敛；Monthly P&L 验证数据契约与运行事实；Customer Operations Agent 验证 Test Catalog/Current State。它们是待执行验证案例，不能因本 Guide 合并而宣称产品重建已完成。

