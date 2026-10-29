# Engineering Lifecycle Integrity — vNext Gap & Patch Matrix

Status: **Review candidate / docs-only** · 2026-10-29 JST  
Owner: [.github #42](https://github.com/retailpulses/.github/issues/42) · Standard authority: [DOCUMENTATION_STANDARD.md](../DOCUMENTATION_STANDARD.md)

## 1. Scope and method
审查现行 Standard §§2–18 与 Product Design/Architecture templates，按 **Covered / Partial / Missing** 判定“文字规则覆盖”，并将 **Execution Gap** 与 **Standards Gap** 分开。案例是证据，不自动证明标准缺失；静态 Issue 审查不等于完成 Runtime Audit。行动分 Keep / Clarify / Patch / Pilot。禁止第二套权威、强制统一目录或全 PR 真实 Seller E2E。

## 2. Gap matrix

| ID / concern | Existing authority | Coverage | Evidence / type | Action and minimal delta | Owner / validation |
| --- | --- | --- | --- | --- | --- |
| H1 Requirement → Workflow → Test → Evidence | §§3,6,15,16 | **Covered** principle; **Partial** practical chain | [NPL #236](https://github.com/retailpulses/store-ops/issues/236) 284 PASS 仍有工作流逃逸；Execution + clarity | **Clarify** §16：关键业务路径用已有 ID 和链接串起，明确实际断言；不强制矩阵文件 | #37 / NPL #236 |
| H2 Test ownership and discovery | §16.1–2 | **Partial** | [StoreOps #206](https://github.com/retailpulses/store-ops/issues/206) 根 tests 与产品 tests、make verify/CI 发现范围不一致；Execution + discoverability | **Patch** §16：声明 Owner、可执行入口、CI 收集/跳过事实；不要求移动目录 | #49 / StoreOps #206 |
| H3 Mock/Fixture fidelity | §15.1, §16.2–3 | **Partial** | [NPL #236](https://github.com/retailpulses/store-ops/issues/236) FakePublisher 跳过 local_blockers、NULL 尺寸 fixture 失真；Standards clarity + execution | **Patch** §16：真实/替身边界和关键约束，关键业务判断用 contract/integration/readback 验证 | #37 / NPL #236 |
| H4 Execution evidence & test report | §§4,9,16.1–3 | **Covered** core; **Partial** collected-vs-executed semantics | [NPL #241](https://github.com/retailpulses/store-ops/issues/241) 3/3 隔离 PASS，Mac CI job SKIPPED，正式 Runtime 仅只读；Execution + clarity | **Clarify** §16：Catalog 是定义，Report 是运行事实；SHA、host/port、real/mock、PASS/FAIL/SKIP/NOT RUN | #37 / NPL #241 |
| H5 Code → Runtime / Business verification | §§4,9,14–16 | **Covered** | NPL #241 code SHA 与 runtime SHA 不同；Runtime read-only smoke 不等于业务验收；Execution gap | **Keep** 原则，**Clarify** §9 最小交付链（PR/SHA→target→running SHA→业务证据）；不强制每 PR 上线 | #42 / NPL #241 |
| H6 Agent execution and handoff | §§8–9,15.3,16 | **Covered** principle; **Partial** practical completion | #236 的 Agent/CI PASS 与 Operator 真实缺陷；Execution gap | **Clarify** §9：Agent 提交执行证据、未验证项、Owner handoff，不新增审批 | #37 / NPL #236 |
| H7 Business/data invariants | §§3,15.1,17 | **Covered** | [NPL #241](https://github.com/retailpulses/store-ops/issues/241) 409 首次失败后缺 DB readback；[Monthly P&L #132](https://github.com/retailpulses/store-ops/issues/132) 数据口径/迁移；Execution gap | **Keep** §§15,17；产品按风险定义跨层不变量与断言，非强制新文档 | #42 / Monthly P&L |
| H8 Escaped defect feedback | §16.2 item 4 | **Covered** basic; **Partial** why escaped | NPL #236 的 FakePublisher/fixture 缺口；Standards clarity | **Clarify** §16：记录最早可检测层、逃逸原因、最小回归、剩余风险 | #37 / NPL #236 |
| H9 Architecture independent of UI menus | §§2,14,17; Architecture template | **Covered** | [StoreOps #206](https://github.com/retailpulses/store-ops/issues/206) 产品/Package/Runtime ownership 需核查；未证实新标准缺失 | **Keep**；Operator Intent 决定产品验收，Architecture 自主处理 ownership、data、reliability、deployment | #42 / #49 |
| H10 Ownership-first repository structure | §§2,7,11 | **Partial** repo-level application | [.github #49](https://github.com/retailpulses/.github/issues/49) Reference only，StoreOps #206 尚需实证；Proposal | **Pilot**，不强制 frontend/backend/tests 目录或提前标准化 | #49 / StoreOps #206 |
| H11 Capability research/reuse maturity | §§12,14–15; Engineering Principles | **Covered** baseline-first; **Partial** explicit tool maturity | [.github #38](https://github.com/retailpulses/.github/issues/38)，[NPL #241](https://github.com/retailpulses/store-ops/issues/241) CLI flag≠callable≠tested | **Keep**，在 #38 实验；暂不纳入 mandatory standard | #38 / NPL #241 |
| H12 Data model / lifecycle / mapping | §17 | **Covered** substantive | [Monthly P&L #132](https://github.com/retailpulses/store-ops/issues/132)，GigaB2B field mapping 需按数据 Owner 核实 | **Keep** §17；用产品验证字段映射、Source of Truth、迁移和 reconciliation，不重复加章 | #42 / Monthly P&L |

## 3. Proposed minimal patch (Deliverable B)
仅对现有 §§9、16 做**增量澄清**：交付链路、测试发现、Mock Fidelity、Test Report vs Catalog、Escaped Defect。§§15、17 数据与技术契约已覆盖；不重复立法。模板不增加必填表；保留 v1 Pilot 状态。所有新增措辞按 L1/L2/L3 和风险裁剪。

## 4. Product pilots / evidence contract
- **NPL #236/#241**：对照 Test ID → 真实/Mock 边界 → 关键 invariant → CI collected/executed → runtime readback。#241 当前 Codex CLI browser callable 未验证；不宣称 Agent-first 全部验收。
- **Monthly P&L #132**：验证来源字段/DB mapping、金额计算、缺失覆盖、迁移与独立 reconciliation；§17 先按现有规则实践。
- **Customer Operations Agent**：验证长期 Test Catalog 对初次响应工作流、草稿/Review/Reject 的映射及运行证据；未做现场审计，不宣称通过。
- **StoreOps #206**：验证测试 owner、实际发现范围、Package 消费者与部署 SHA；未完成前不提升 repo 结构规范。

## 5. Promotion / decision
此文档为 **Gap Review Evidence**，不是新标准。PR 合并只代表 Pilot 澄清落地；是否提升 Mandatory Baseline，由 #42 在产品试点后决策。无需新平台、额外审批、统一目录或通用 Seller E2E gate。
