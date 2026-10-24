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
