# Design Migration Guide — Agent Handoff

Status: Proposed v1.0
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
