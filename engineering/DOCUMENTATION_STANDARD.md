# Retailpulses Documentation Standard v1.0 (Proposed)

Status: Pilot — merged for trial adoption; subject to pilot findings
Owner: retailpulses/.github
Governance: https://github.com/retailpulses/.github/issues/16
Change review: https://github.com/retailpulses/.github/issues/42 (Data Model / completeness Pilot)
Change notes: [Engineering Registry revision notes](README.md#documentation-standard-revision-notes)
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

**交付证据链（按风险适用）**：在既有 PR/Issue closeout 中可定位变更 PR/Commit SHA、目标部署环境、实际运行版本/SHA、适用的 Smoke/业务验证与尚未验证的部分。Code SHA 与 Runtime SHA 不同须分别标注；CI PASS、页面 HTTP 200、只读 Smoke 不能被写成已验证生产写入或完整业务结果。不要求每个 PR 部署或执行外部写入测试。

## 10. Adoption and acceptance
先在 Monthly P&L（需求/计算契约）和 New Products to Listing（历史追加收敛）双试点，不一次性改造全组织。验收：Owner 不看代码能理解能力/流程/规则；Agent 能从 Requirement ID 找到契约；原有有效业务语义无损；历史证据可追溯；没有新建平行任务账本。试点验证完成并完成必要修订后，再将本规范标记为 Approved。

## 11. Compatibility
不强制重命名现有 DESIGN.md、design.md、01_ARCHITECTURE.md 或 TRD。使用 README/DOC_INDEX 标明角色和链接。与现行中央架构治理发生冲突时，记录冲突并先取得明确决定，禁止静默覆盖。

## 12. Foundational References and source authority (Pilot)

跨产品、跨仓库复用的外部 API Dictionary、平台规则、第三方字段/错误码契约及稳定的基础数据定义，属于 **Foundational References**，不应隐藏在某个 Product Design、TRD 或 App 的历史 SOP 中。

- **Organization-level discovery**：统一从 [Foundational Reference Registry](../references/README.md) 查找。Registry 负责稳定 Reference ID、Owner、类型、Canonical source、来源版本、验证范围/日期、消费者、状态和未核实项；初期采用 Markdown + 链接，不新增服务或数据库。
- **Authority separation**：供应商官方文档或机器可读 schema 是外部契约来源；组织级 Reference 是内部可检索、可核验的整理/索引，不得假装替代官方来源。内部 API 的 executable schema 与代码仍由服务 Owner 仓库维护；产品特定映射、配置、测试和部署证据留在相应产品仓库。
- **One canonical entry**：跨产品内容以组织级 Registry 为统一入口。旧产品目录中的重复 Dictionary 标为 Retired/Superseded 并链接新入口；历史 POC/SOP 作为证据保留，不得以新旧两个可编辑副本并行维护。
- **Version & status**：区分 Registered / Partially Verified / Verified（明确字段、环境和适用范围）/ Stale / Superseded / Retired。来源可访问不等于行为已核实；POC、代码、Merged、Deployed、Runtime Verified 分别标注。API 版本淘汰必须显式注明，不能把旧版当 fallback。
- **Security**：Reference 只能包含脱敏样本、占位符及凭据获取方式链接，禁止嵌入真实 Secret、Token、Cookie 或敏感顾客数据；从当前文件移除 Secret 不等于清理 Git 历史或使其失效。

### Fact Verification Gate

- **Product Decision**（Sponsor）：目标业务行为、安全降级与产品边界。
- **Technical Fact / Assumption**（Engineering/Agent）：实际 API 能力、字段语义、授权、数据粒度、时效、错误、版本、限制；主动检索 Reference、官方资料、代码及必要只读验证，保留来源、日期、适用环境和脱敏证据。
- **Implementation Decision**（Engineering）：在已核实契约下的适配器、数据流、错误处理和测试方案。

设计可在 Draft/Sponsor Review 阶段列出未核实事实；但影响核心行为、数据权威或验收的 **blocking technical fact**，原则上必须在 Design Baseline Approval 前核实，或由 Sponsor 明确批准不依赖该事实的安全降级。不能要求 Sponsor 猜 API 字段，也不能把未知事实静默写成 Verified。

推荐链路：**Official Source → Foundational Reference → Verified Fact → Product Requirement → Technical Contract → Implementation Evidence**。Design 引用 Reference ID 和对业务行为的影响，TRD 记录技术契约、验证证据及 unresolved facts，避免复制大段 API Dictionary。上游 API 变更、响应冲突、新消费者或运行事故触发按影响范围重新核实。

试点案例：[Giga Open API 2.0](../references/giga/open-api-2.0.md)（1.0 Retired，2.0 Required）、[Mercari Inquiry](../references/mercari/inquiry-api.md)、[Rakuten RMS](../references/rakuten/rms-api.md)。详细补全工作见 [Issue #19](https://github.com/retailpulses/.github/issues/19)。

## 13. UI Sketch as part of Product Design (default)

**默认将 UI Sketch / Wireframe / 核心交互说明直接放在产品 `DESIGN.md` 中**，作为对应 Capability、Workflow 和 Requirement 的视觉表达，而非另立一份必须维护的设计权威。优先就近嵌入相关 Workflow 章节；当多个界面需要整体说明时，也可使用一个精简的 `UI/UX Design` 章节。允许 Markdown、Mermaid、嵌入图片及原型链接，不规定单一绘图工具。

- 每个重要 Sketch 说明对应 Workflow/Requirement ID、关键用户操作和必要状态（如 Empty、Loading、Error、Success）；只写影响用户行为的细节，避免重复完整业务规则。
- **渐进拆分（promotion）**：当草图数量、文件体积、协作频率或交互复杂度使单一 `DESIGN.md` 难以阅读维护时，可将详细 Wireframe、交互状态或 HTML Prototype 提升至 `docs/ui/` 等独立文件。无固定数量门槛，不要求预先建目录。
- 拆分后 `DESIGN.md` **仍保留核心 UI 概览、关键交互决策、Requirement 关联和明确链接**；独立文件是从属细节，不成为第二个 Product Design Authority。变更影响已批准产品行为时，应先同步修订 Design 的相应规则。
- 区分 Exploratory Sketch、Approved UI Specification 与 Implemented / Runtime Verified；批准草图不等于界面已上线。原型和截图不能取代真实运行证据。
- 小产品不强制创建独立 UI Spec、Design System、Figma 文件或目录；优先减少碎片化和重复维护。

### 13.1 Two-stage UI design pilot (2026-10-30)

**Status: Pilot / Sponsor Review; not an organization-wide mandatory gate.** This supplements §13 and the existing Product Design authority, without creating a second product-design authority or requiring a particular framework.

**Stage A — Wireframe (structure review).** Before implementing a new or materially redesigned core UI workflow, describe the screen map, information hierarchy, navigation, main actions and initial/default selection. Keep sketches editable and Git-reviewable: Markdown, Mermaid, or lightweight HTML are preferred over image-only artifacts. Link the relevant Workflow / Requirement IDs. Sponsor feedback focuses on what appears, where it appears and how the user proceeds.

**Stage B — Interactive Prototype (behavior review).** For core or surprise-prone MVP UI workflows, provide a runnable, browser-accessible prototype before substantial UI implementation. It must demonstrate the primary path, initial state and defaults, navigation, meaningful loading/empty/error/success states, save/submit semantics and key recovery behavior. Use realistic but synthetic data; label mocked actions and unavailable backend behavior. Sponsor reviews actual clicks and gives feedback; update the same design baseline rather than accumulating competing versions.

**Preferred handoff format.** Favor Git-native, code-backed HTML/CSS/JS or React prototypes when practical, not a mandatory Figma or framework dependency. Store small sketches alongside the relevant Workflow in `DESIGN.md`; promote larger runnable prototypes and state specifications to `docs/ui/` when justified. The Product Design remains authoritative for product behavior; prototype source is the approved interaction reference, not a replacement for business rules or backend contracts. Include how to run, the target viewport/device, Requirement IDs, reviewed commit SHA, status (Exploratory / Sponsor Review / Approved), and explicit gaps between prototype and real backend.

**Agent implementation contract.** For each core screen/flow specify screen identity, initial/default state, user action, resulting transition, exceptional states and observable acceptance. Agents must read the approved design and prototype before coding, reuse the prototype where technically appropriate, and flag contradictions rather than silently choose between design and prototype. Do not infer an unreviewed behavior from screenshots.

**Conformance verification.** In the implementing PR, compare the running UI against the approved prototype at representative viewport(s) and key states using actual browser interaction, screenshots and, where useful, Playwright assertions. Report PASS / FAIL / NOT RUN, material deviations and approved changes. A screenshot alone does not prove interaction correctness; prototype approval does not prove runtime correctness. Integrate evidence into existing Test Catalog / PR closeout rather than establishing a duplicate checklist or new approval workflow.

**Proportionality / pilot exit.** A minor patch or low-risk UI may use an embedded wireframe and short interaction description without a runnable prototype. Run at least one real product pilot; assess whether Sponsor catches material UI/UX surprises before implementation, Agent handoff is faithful, and authoring/review cost is reasonable. Only after documenting findings should this pilot be proposed for general adoption.

## 14. Progressive design: concept, POC, architecture and deployment (P0)

设计不是单向的阶段瀑布：**Concept / Draft Design ↔ targeted POC / Experiment → evidence-based refinement → Design Baseline → implementation → deployment → runtime verification**。后续变更可再次启动 POC。早期允许未完成的技术假设，但阻断核心行为的技术事实需在批准前验证或明确采用不依赖该事实的安全降级（见 §12）。

| Concern | Default authority / artifact | Promotion rule |
|---|---|---|
| Product concept, user outcome, workflows, UI sketch | `DESIGN.md` | UI 细节复杂时拆至 `docs/ui/`；DESIGN 仍为唯一产品行为权威 |
| Early POC / experiment | Issue 或 DESIGN 中简短 hypothesis + result + limitation + decision link | 方法、数据、可复用结果复杂时放 `docs/experiments/`；不将实验日志堆入 living DESIGN |
| Components, ownership, key tech stack and **target deployment** | Architecture（小产品可先写在 DESIGN 的简短 Architecture 段） | 复杂后提升独立 Architecture；参见 [Template](templates/ARCHITECTURE.md) |
| Significant hard-to-reverse trade-off | ADR | 仅重大决策单独 ADR；一般技术栈清单留 Architecture |
| API/data details and acceptance contracts | TRD / Contracts | 按风险和规模拆分，不复制跨产品 Foundational References |
| Actual code, deployed release, runtime/health and evidence | Current State / operational evidence | 与 To-Be 独立；Merged ≠ Deployed ≠ Runtime Verified |

POC 的最小记录为 **Hypothesis / Method / Result / Limitations / Design impact**。POC 通过不自动批准技术栈、部署方案或生产可靠性。技术栈选择应比较现有内部能力、成熟开源、原生平台与自建成本；重大锁定或难逆转取舍写 ADR。部署设计应交代目标环境、service/worker/job、触发、网络与凭据边界、运维责任、备份恢复和验证方式；**真实部署位置**必须通过 Current State/运行证据证明。

组织级配套入口：[Engineering Principles](ENGINEERING_PRINCIPLES.md)、[Architecture Review Guide](ARCHITECTURE_REVIEW_GUIDE.md)。文档以最小可理解集合起步，只有阅读、协作、复用或审计需求证明必要时才拆分；不得以模板创建文件数量作为完成标准。

### 14.1 Existing-product Change Request → Design Baseline → Agent Sprint (Pilot clarification, 2026-10-31)

**Scope**：持续迭代产品的 New Feature、Change Request 和重要 UI 改动；沿用 §§2–9、§13–16 的权威与证据规则。**不新增独立 Sprint Design Authority、固定审批阶段或必填文件树。**

1. **Discover / discuss**：用现有 Issue 或 Analysis 记录 Operator Problem、As-Is、候选方案、影响范围、未验证事实与讨论。建议不等于批准；关键产品取舍保留 Sponsor Decision 来源。
2. **Confirm decisions / update To-Be**：业务目标、Scope、Workflow、规则及可观察验收确定后，**在实质依赖性开发前**将有效决策合入现有 Product Design（Requirement ID）；按影响同步 Architecture、TRD/Contracts、Test Catalog。阻断核心业务正确性的未知事实需核实或明确批准安全降级。非阻断 Open Questions 可以保留。
3. **UI change handling**：新核心 UI 或重大旧 UI 改造按 §13 / §13.1 Pilot 采用 Wireframe →（按风险）Interactive Prototype；明确 Existing → Target UI Diff、默认状态、操作、反馈、异常/恢复、视口和 Requirement ID。记录 Reviewed SHA、Exploratory / Sponsor Review / Approved 状态。原型中的 Mock、Fixture、Debug/验证文案不得混入 Operator UI。Prototype 是从属交互参考，Product Design 仍是业务行为权威。
4. **Sprint handoff**：以**Implementation/Sprint Issue 为任务入口**，引用已确认的 Design Baseline（路径、章节/Requirement IDs、commit SHA）、Architecture、TRD、UI Spec/Prototype、Test IDs、Current State、组织标准。Issue 只写本次目标、In/Out Scope、Current → Target Delta、约束、依赖、验收、交付，不复制完整设计或变成第二套 Living Design。可采用 [Existing Product Change / Sprint Issue Template](../.github/ISSUE_TEMPLATE/existing-product-change.md)。
5. **Agent execution**：Agent 先读 README/AGENTS 和上述权威，检查 As-Is vs To-Be、代码/测试/Runtime 事实及复用资产；冲突或新增业务取舍回报 Sponsor，不静默采用旧 Issue、未批准原型或当前代码作为新设计。工程细节按已批准契约实施。
6. **PR reconciliation / verification**：产品行为、技术契约或 UI 发生实质变化时，同一 PR 同步权威文件或说明 N/A；按适用风险执行 Unit/Contract、浏览器 Functional + Visual + Operator Workflow，核对实际 UI 与批准 Prototype 的偏差，记录 PASS/FAIL/NOT RUN 和证据。Merged、Deployed、Runtime Verified、Business Verified 分开声明；运行事实仅在有证据后更新 Current State。

**Proportionality**：小 Bug Fix/低风险 UI Patch 可在一个实现 PR 中同步修订 Design，无需单独 Design PR 或可运行原型；重大 New Feature、跨系统变更、复杂 Operator UI 推荐先 Review Design PR/Prototype，再启动大规模编码。上述为工作顺序与可追溯性约定，**不是六道强制 Gate**。

### 14.2 Low-friction Experiment-to-Production — Optional Sandbox & Last Good Version Registry（Pilot Design，2026-10-31）

**Status: Sponsor-approved design direction / Pilot implementation pending; not an organization-wide mandatory gate.** [Engineering #77](https://github.com/retailpulses/.github/issues/77) 为方法论与证据入口，[StoreOps #260](https://github.com/retailpulses/store-ops/issues/260) 为首个功能 Pilot。现有 Product Design、§§14/14.1、[Worktree Development Flow](../docs/worktree-development-flow.md) 和受控生产发布规则仍有效。

**优先级：低摩擦开发与迭代 → 真实功能体验 → 简单可靠的发布 → 最低限度恢复保障。** **只保留简易 Last Good Version Registry；不将 Rollback 建设为核心工程投资或所有发布的硬性 Gate。** Sandbox 是按需的非生产运行环境，不是强制步骤；不为本 Pilot 建设通用 Sandbox Platform、复杂回滚系统、Artifact Registry、自动部署切换器或统一 Recovery Orchestrator。

| 情境 | 最小工作流 |
| --- | --- |
| 小 Bug、文案、低风险 UI | Branch → Tests/CI → PR → 受控 Deploy → 简单 Smoke；不强制 Sandbox 或恢复演练 |
| 重大 UI / 业务算法改版（如 #260） | 独立 Branch/Worktree 与非生产 Runtime → 真正浏览器体验/迭代 → PR/Tests → 受控 Deploy → Smoke；旧应用继续运行直到明确切换 |
| 技术 POC | 局部实验运行或 Fixture，清楚标注其不能证明完整 E2E |
| 不兼容 Schema、外部不可逆写入、高价值数据变更 | 按实际风险补充兼容性检查、合理备份与恢复步骤；必要时加强隔离，不默认全量复制或通用平台 |

**Last Good Version Registry（唯一轻量恢复要求，不是新平台）：** 复用现有 [Mac mini Runtime Registry](../infrastructure/mac-mini/runtime-inventory.yaml)；不创建第二个 Release/Recovery Registry。每个运行服务在**已部署且基本 Smoke 通过后**，可在其原有 Runtime 条目增加/更新最小 `last_good` 指针：`commit_sha`、`verified_at`（JST/带时区时间）及 `smoke_evidence`（Issue/Run/URL 引用）。现有 `launch_label`、`entrypoint`、`working_directory` 和 `launch_config` 等字段直接复用，不重复存储。**`git_commit` 或 GitHub main HEAD 不自动等于 last_good**；尚无现场验证证据时保持 `UNKNOWN`/空，不捏造版本。更新新版本前先保留旧的 Last Good；新版本 Smoke 成功才推进指针，失败则仍指向之前可用的版本。优先由当前 Runtime Owner/部署 Agent 顺带维护，**不设新服务、数据库、CI Gate、自动 Rollback 或 Registry 管理平台**。

版本 Registry 只能帮助**定位旧代码**，并非恢复成功证明。若有故障，优先复用现有 Git Checkout/部署脚本与启动配置恢复旧版应用；兼容性不允许时采用最小前向修复。**不要求**每次额外生成 Artifact、维护复杂依赖快照或做回滚演练。发布成功时记录版本 + 简单 Smoke 即可；如无法确定可用版本，标记 `UNKNOWN`，由本地 Agent 调查，而不是因此建设回滚系统。

**共享数据与 To-Be Schema：** 实验的是应用版本，不自动意味着业务数据必须隔离。#260 可让新旧应用共享现有 SQLite / Local Supabase；人工明确触发的 Generate 是真实持久化的 GENERATED/Job/History 业务记录，不加 Sandbox/Production 数据字段，也不需要数据转正。What-if Preview 无持久化副作用；没有授权不得自动 Seller 上传、修改订单/库存/价格、发送消息或启动额外 Scheduler。需要 Schema 调整时优先提前把共享业务库改为**向后兼容的 To-Be Schema**，但要先核实旧应用兼容性与正常 DB 备份，使用现有受控变更流程。**应用代码回退不能撤销已产生的合法业务记录**；绝不以旧库快照覆盖新业务数据。若变更破坏旧版兼容性，先解决兼容性再实施。

**轻量 Sandbox 的实际边界：** 独立 Branch/Worktree、非生产进程/端口/URL、可见源码版本；继续复用 Mac mini、现有 DB、受控 Credential 与 Tailscale，**不得**替换正在运行的生产进程或把 Feature Branch 直接部署为 Production（Production `main` only）。检查旧版/新版对共享 Ledger、Runner、去重、Latest Job/下载和 SQLite 锁的兼容性；只在查出真实风险时增加隔离或小范围修复。不默认 Docker、Capability Layer、单独 Sandbox SQLite/Postgres Sink、新 Secret Manager 或通用 CLI。

**Mac mini Agent Handoff / Pilot 验收（非额外审批流水线）：** 先核实实际生产 Runtime/版本/启动方式与数据库/Job 读写，以及 Runtime Registry 内 Last Good 是否为已验证值（否则维持 UNKNOWN）；复用既有部署和启动方式启动 #260 新版独立服务；测试真实 CSV 上传 → Segmented Pricing/Soft Cap → 只读 What-if → 明确 Generate → Download/History，覆盖既有 Cancel 回归；验证旧版仍正常、无未经授权外部动作。记录 Sponsor 反馈、手工 Setup 步骤、代码 SHA/URL、CI/Smoke、存在的兼容性风险，产品接受后再按现有规则决定合并和生产发布。**未在 Mac mini 实测时标为 NOT VERIFIED，不把静态文档/CI PASS 冒充运行验收。**

## 15. Technical Contract Completeness & Drift Prevention (Pilot Patch)

目标：防止 TRD 技术契约不足导致 Coding Agent 自行假设、跨模块集成失败或验收漂移；不以文档长度、文件数量或新增审批为指标。保留 §2、§6、§7 的权威与比例原则。

### 15.1 Contract completeness before implementation

- **Completeness over document count**：不是每项 Requirement 都需要独立 TRD；但关键业务、金额/状态计算、数据迁移、跨系统调用及生产依赖必须具备足够可实施、可验证的契约。可写在现有 TRD/Contracts 或已有技术说明，不强制新文件。
- Engineering Agent 按适用性检查六项：① Requirement ID 与业务行为/禁止行为映射；② 数据来源、Schema、计算、幂等及一致性；③ API/系统集成、认证、异常与重试；④ Runtime、Scheduler、配置、迁移与恢复；⑤ 正常/异常/边界及业务结果验收；⑥ As-Is 代码、目标变更范围与共享模块所有权。
- 每项适用内容标明 **Specified / Verified / Open / N/A**，必要时附来源与验证环境。只阻断会改变核心业务行为、关键数据正确性或不可绕过的集成路径的未决事实；其余可并行推进，不增加统一的人工审批关卡。
- 对金额、状态转换、数据映射及外部调用，优先使用具体输入、预期输出、失败示例；重要示例尽可能落实为自动化契约/回归测试。CI 或 Mock PASS 不等于真实业务结果通过。

### 15.2 Integration, credential & connectivity readiness

涉及跨 Repository、Runtime、网络边界或外部 Open API 的关键调用，TRD/Contracts 必须在大量依赖性编码前明确：

1. **真实调用链**：Caller（Agent/Service + 实际 Runtime）→ Endpoint/Provider → 数据源；Read/Write 意图、既有 Client/Relay、网络路径与服务 Owner。
2. **认证与权限**：既有 API Key/Service Token/OAuth/SSH/Cloudflare Access 等认证机制、所需 Scope、调用方及服务端配置名称与责任人；**只记录 Secret 所在的受控环境/配置引用，绝不记录值**。
3. **Reuse-first discovery**：先核实已有 API Client、Credential、VPS 固定出口 Relay、Tailscale/SSH/受控 Connector 和配置是否可复用；变量缺失不等于必须新建同数量身份。不得默认 Codex Cloud、ChatGPT Work、Mac mini、MacBook 与 VPS 具有相同访问权限。
4. **Caller-side preflight**：从**实际调用方的目标环境**执行最小、优先只读的 DNS/TLS、认证、API 权限、响应契约及必要数据可读性验证；记录脱敏命令/方法、时间、环境、结果及证据链接。代码存在、Mock 成功、变量名存在均不算 Connectivity Verified。不得为验证而发送真实客户消息或进行不必要生产写入。
5. **Missing dependency resolution**：区分 Credential Missing、Permission Denied、Network Unreachable、Provider Contract Mismatch、Runtime Config Missing。Engineering Agent 在已有授权范围内自主修复配置/连接；仅账户持有人交互、权限扩大等不可委托事项提交 Sponsor，并附具体操作。不能把常规技术配置推给 Product Owner。
6. **Failure/alternative**：关键依赖未验证时明确标为 Open/Blocked，记录可执行的 fallback 或不依赖该接口的安全降级；不把尚未证实的 Cloud→VPS/Relay 路径写成 Verified。允许独立模块继续开发，但不得宣称相关 E2E Ready。

组织级 API Dictionary/版本/字段定义引用 `references/README.md`；基础设施与访问路径引用 `infrastructure/README.md`；产品特定映射和 Preflight 证据留在产品仓库/Issue。真实 Secret 只存在于批准的 Runtime/Secret 配置中。**本 Patch 不授权新建 Credential Gateway、Capability Layer、通用 Secret 平台、第二套 Relay 或广泛生产访问。**

### 15.3 Drift reconciliation during delivery

- Agent 发现 Design、TRD、Architecture、Code、Runtime 冲突时先分类：产品行为决策 → Design/Sponsor；技术事实 → Engineering 验证并更新 Contract；实现偏差 → Code/Test；实际部署状态 → Current State/运行证据。不得静默以现有代码覆盖已批准设计。
- 共享 API、Schema、Migration、数据口径和跨 Agent 接口由明确的 Integration Owner 统一管理；Subagent 不得各自发明不兼容契约。
- 相关 PR 在既有 closeout 中关联 Requirement ID、变更的契约、自动化/真实 E2E 验收证据与仍未验证的依赖。优先原位 Patch，不复制新的 TRD 或建立平行检查账本。

**案例依据**：[inbox#451](https://github.com/retailpulses/inbox/issues/451)（Inquiry Credential/Integration late discovery）、[inbox#455](https://github.com/retailpulses/inbox/issues/455)（Cloud→VPS Relay 路径待验证）、[inbox#257](https://github.com/retailpulses/inbox/issues/257)（业务结果不能由绿色 CI 代替）、[store-ops#132](https://github.com/retailpulses/store-ops/issues/132)（Monthly P&L 技术合同与数据/迁移完整性）。

## 16. Test Catalog & Agent-driven Acceptance (Pilot)

**原则：Agent-first, Product Owner-governed, Evidence-driven Testing。** Agent 默认负责识别、维护、执行测试及收集证据；Product Owner 决定业务正确性和必要的业务取舍。测试用例是可复用的产品资产，不是 Sprint 完成后即废弃的执行日志。测试设计应在关键功能编码前明确预期结果，但不强制所有测试代码先于实现。

### 16.1 Authority, placement and proportionality

| Artifact | Authority / 内容 | 默认位置 |
|---|---|---|
| Product Design | 业务规则、Workflow、Acceptance Criteria（**What is correct**） | 现有 `design.md` / `DESIGN.md` |
| TRD / Contracts | 数据/API/权限/异常契约及技术测试条件（**What must be verified technically**） | 现有 TRD/Contracts |
| Test Catalog | 稳定的 Test ID、可复现的场景/步骤、输入、预期业务结果及关联（**How to verify**）；不得重新定义业务规则 | 复杂产品优先产品现有 `tests/test-catalog.md`，或既有 `docs/testing/`；由 README/DOC_INDEX 链接 |
| Executable Tests | Unit、Integration/Contract、Workflow/UI E2E 测试及 Fixtures | 现有代码测试目录，避免为遵守规范迁移目录 |
| Test Evidence | 实际执行环境、时间、版本 SHA、通过/失败/未执行及脱敏证据 | CI、PR、Issue 或测试报告链接；Current State 仅记录已核实的运行事实 |

- **L1/小改动**：可将关键场景写在 Issue、TRD 或测试代码，不强制 Catalog；**持续迭代、跨系统或高风险产品**建议维护轻量 Catalog，尤其涉及金额、状态流转、外部消息、生产写入或核心 UI Workflow。
- Catalog 最小字段：`Test ID`（稳定、不回收）、`Requirement ID`、场景/风险、前置条件与输入、执行步骤/方式、**明确预期结果**、测试层级、自动化/证据链接（可标 Pending）。可按 Workflow 组织；不复制 Design 全文、自动化代码或每次运行日志。
- 一条 Requirement 可关联多条 Test；一个 Test 可覆盖多个 Requirement。测试代码变动可保留稳定 Test ID；废弃用例标 Superseded/Retired，不静默删除有用的历史关联。

### 16.2 Agent execution and coverage

1. **Before coding**：Agent 先读取 Design、TRD、已有测试及当前代码；为受影响的关键 Workflow 明确 Happy Path、边界、异常/恢复、幂等及数据正确性场景，补充缺失用例。对不适用的层级说明原因，不做机械覆盖率门槛。
2. **During implementation**：优先将确定性逻辑落实为 Unit/Calculation Tests；跨模块/API/数据库使用 Integration/Contract Tests；关键用户旅程使用 Workflow/UI E2E（例如真实 Portal 的输入→保存→刷新→结果）。尽可能复用既有 Fixtures 和测试工具。
3. **Before closeout**：对本次变更执行适用测试，报告 Passed / Failed / Blocked / Not Run、环境与代码/部署 SHA。适用时从实际目标 Runtime 做受控 Business Acceptance；外部写入/真实消息只在已有授权与安全控制下执行，不为测试产生不必要的生产副作用。
4. **After defects**：修复实际缺陷时更新 Catalog，并尽可能新增可重复的 Regression Test；变更业务语义须先回到 Design/Sponsor，不得由测试用例暗中决定。

### 16.2A Test reliability, discovery and evidence fidelity (Pilot clarification)

以下是现有测试职责的**可执行澄清**，不是新测试平台、通用门禁或统一目录要求：

- **Test ownership / discovery**：持续迭代产品的关键测试应可定位维护 Owner、实际运行入口及 CI 发现范围。区分 Test Exists、Collected、Executed、Passed、Skipped、Not Run；若 `make verify` 与 CI 覆盖不同，说明差异，不能用绿色 CI 推断未收集测试已通过。
- **Mock / fixture fidelity**：记录影响结论的真实/替身边界及已知差异。替身可以隔离外部服务，但不能无说明地绕过正在验收的关键业务约束；对高风险规则优先用真实本地 Contract、脱敏真实形态样本、独立状态 readback 或适用的只读 Runtime 验证。Fixture 与生产数据形态不一致时标记覆盖限制。
- **Test Catalog vs execution evidence**：Catalog 记录稳定测试定义、预期结果及关联；Test Report/CI/Issue 记录某次执行事实（SHA、环境、Test ID/范围、真实/Mock 边界、PASS/FAIL/BLOCKED/SKIP/NOT RUN、证据链接）。Report 可由 GitHub Actions 和简短 PR/Issue closeout 承载，不强制新增报告目录或重复保存日志。
- **Workflow / independent assertions**：关键 Operator Workflow 的验证应覆盖适用的保存、刷新、下游契约与失败恢复，且对业务状态变化尽可能使用独立 DB/API/Publisher readback。UI 点击、截图、HTTP 200 和 Agent 自述成功不能单独证明持久化或外部业务结果。
- **Escaped defect feedback**：真实缺陷回溯最早可检测层、测试为何逃逸（未发现、未执行、fixture 失真、mock 绕过、断言不足或 runtime 差异），优先收敛为最小可重复回归；未复现的风险显式保留。Agent 探索性发现与确定性回归的证据分别记录。

**证据案例与待验证限制**：[StoreOps #236](https://github.com/retailpulses/store-ops/issues/236)（测试逃逸与 Mock Fidelity）、[#241](https://github.com/retailpulses/store-ops/issues/241)（隔离 Golden Journey 通过但 Codex CLI Browser 自身未验证）、[StoreOps #206](https://github.com/retailpulses/store-ops/issues/206)（测试发现范围/Ownership 审计）。[组织级 Gap Matrix](research/engineering-lifecycle-integrity-gap-matrix-2026-10-29.md) 记录 Covered/Partial、证据与 Pilot 责任。

### 16.3 Completion is evidence-based, not a new approval pipeline

**Implemented、Tests Passed、Workflow Verified、Deployed、Runtime Business Verified 是不同维度的事实，而非五个串行审批关卡。** CI PASS、Mock PASS、HTTP 200、页面可打开或 PR Merged 均不自动证明 Workflow/Runtime Business Verified。对关键业务场景缺少真实验收证据时明确标 **Not Verified / Blocked**，不能宣称完整验收。允许按风险并行开发、分阶段部署与降级，但须披露尚未验证的业务能力。

Agent 在既有 PR/Issue closeout 中给出 Requirement/Test ID、执行结果、环境、SHA、证据链接与未覆盖风险；无需为每个 Test Case 新建 Issue、测试管理平台、独立审批或平行追踪矩阵。参见 §6、§7、§9、§15。

## 17. Data Model documentation & lifecycle (Pilot Patch; Issue #42)

**目标是可发现、足够实施和可验证的数据契约，不是强制创建 `DATA_MODEL.md`、ERD 或新增审批。** 数据模型跨多个权威层；仅在相关风险适用时记录细节，引用已有代码 Schema/DDL，避免复制第二份可编辑权威。

| 关注点 | 唯一责任与默认位置 |
| --- | --- |
| **Product Design (To-Be)** | 定义业务实体的业务含义、用户可见的数据行为和规则、保留/删除等产品决定及验收意图；不复制表结构。 |
| **Architecture (To-Be)** | 定义逻辑实体/关系、系统边界、canonical owner 与 writer、read model/projection、数据流、生命周期与跨系统同步、源数据与派生数据的界线；必要时内嵌简洁 ERD；可沿用既有 `docs/01_ARCHITECTURE.md`。 |
| **TRD / Contracts（或现有技术说明）** | 对影响正确性的字段、类型、必填/默认、主外键/唯一性、约束、计算和状态不变量、幂等键、冲突/一致性、保留与删除执行机制、迁移兼容/回滚及验证场景给出足够精确的契约。代码/DDL/机器可读 Schema 已是权威时，链接其具体位置/版本，只补其无法说明的业务语义及验证条件。 |
| **Executable schema / migrations** | 具体数据库 DDL、模型声明与迁移的实施来源；仓库存在或测试通过不等于目标 Runtime 已执行迁移。 |
| **Current State / evidence** | 记录当前实际 schema、应用版本、已应用迁移、运行环境、数据覆盖、保留/删除行为与 drift；缺现场证据记 `UNKNOWN`，不能用设计反证现实。 |
| **Foundational References** | 仅跨产品稳定的数据定义或外部规范索引；产品独有的表、映射和业务语义仍属于其 Owner 仓库。 |

### 17.1 Minimum data-model contract（按适用性核对）

在有持久化、跨组件交换、财务金额或敏感数据时，Engineering Agent 应确认下列内容是否可由现有文档、源码或契约**唯一定位**：

1. **Entities & relationships：** 关键实体及含义、实体间关系/基数、身份/主键、生命周期（创建→更新→终止/归档/删除）。只有关系复杂时才需要图；一个表的脚本不强制 ERD。
2. **Source and authority：** 数据来源、canonical ownership、允许写入的组件、observed/desired/derived data、复制与同步规则、时间窗口/新鲜度。
3. **Integrity & semantics：** 影响业务行为的字段定义、NULL/缺省语义、唯一/引用约束、金额与状态不变量、幂等/去重、并发冲突及一致性或 reconciliation。
4. **Governed lifecycle：** 何时采集/保存、保留时限和删除/匿名化（含子表、缓存、备份）、谁能触发、失败/重试/恢复；涉及个人/儿童/敏感数据时，**存储行为与 Product Design 的用户承诺必须一致**。
5. **Schema evolution & verification：** 迁移的前置条件、兼容/回填、可恢复性、执行责任和数据正确性测试；区分预期 Schema 与已部署 Schema，保留版本和可脱敏的验证证据。

只对适用的关键项标注 `Specified / Verified / Open / N/A`（使用既有 §15 状态），记录 Owner 和证据链接；`Verified` 必须说明**验证了什么、在哪里、何时**。Critical Open：导致数据来源/归属错误、财务错误、不可恢复迁移、未授权留存或产品承诺失真的未知事实，应在 Design Baseline Approval 前核实或由 Sponsor 明确批准安全降级；不阻止无依赖模块并行工作。

### 17.2 Placement / triggers / agent preflight

- **L1/轻量 L2：** 可在现有 README、Design 的简短 Architecture 段或技术说明中说明关系、持久化和隐私机制，并链接实际 Schema；无需新文件、表格或图。
- **复杂 L2/L3：** 在现有 Architecture 保留逻辑所有权/实体关系概览，精确字段和迁移在既有 TRD/Contracts 或可定位的 schema/migrations；只有阅读难度或 Owner 分离要求时才提升独立 `DATA_MODEL.md`。README / DOC_INDEX 要指向权威，而非复制内容。
- **变更触发：** 新实体、核心字段/关系/数据来源、持久化行为、PII/retention/deletion、Schema migration、同步/去重语义或对外数据合同变化，在同一 PR 更新受影响的权威或说明 N/A，并复核现有测试。不要定期重写无变化的模型。
- **Before design baseline：** 从适用的 Design → Architecture/technical note → Contract/Schema 找到数据主人、生命周期、关键假设及风险；重大未核实事实归类 Technical Fact vs Sponsor Decision（§12）。
- **Before implementation：** 对照当前源码/迁移、实际调用方数据源与必要运行证据，验证既有实体、写入点、迁移版本和故障恢复；为变更补充有明确输入/输出的正常、异常、删除及重算测试（§15–16）。若发现冲突按 §15.3 归类并向正确 Owner 升级，禁止以代码自动覆盖 Design。

**Regression illustration（非产品改造任务）：** 小型 SQLite 对话 POC 的 README 如声称“结束不留数据”，而源码实际写入 `sessions/turns/events`，Agent 必须列出 `Product privacy promise ↔ actual persistence` drift，并确认删除、保留、备份和孩子使用前的安全条件；不要求先写完整 ERD。跨平台 Monthly P&L 必须在 Schema/Contract 上区分来源事件与导出聚合、店铺/月份/订单粒度、唯一键及去重/迁移回滚，不允许以一个成功查询断言四店对账通过。相关产品 Issue：[store-ops#132](https://github.com/retailpulses/store-ops/issues/132)；家庭 POC 示意：[Yuzu PR #41](https://github.com/jimyyl/inbox/pull/41)。

**Scope and compatibility:** This patch clarifies §§2, 7, 12, 14–16; it does not override their role/approval policy, mandate physical file naming, introduce a new governance platform, or authorize runtime, data or credentials changes. Design remains Draft until explicitly approved.

## 18. External Methodology References (Informative; Issue #42)

以下为本标准的**设计参考和完整性审查辅助资料（informative）**，不是 Retailpulses 的第二套规范或必须遵循的独立验收清单。具体约束以本标准、产品 Owner 的 Design/Architecture/Contracts 及适用的仓库规则为准。引用外部方法时优先直接链接原始维护方，并按当前问题风险裁剪。

| 外部方法与维护方入口 | 借鉴用途 | 采用边界 |
| --- | --- | --- |
| [arc42 — Architecture Documentation](https://arc42.org/overview/) | 检查系统目标、上下文、约束、组件、部署、运行、质量场景、风险和决策是否存在实质性遗漏；与 §14 和 [Architecture Template](templates/ARCHITECTURE.md) 对照 | **Completeness reference only**；不强制采用 arc42 的章节体系、文档数量或全部视图。 |
| [C4 Model — Diagrams](https://c4model.com/diagrams) | 统一系统上下文、容器/部署边界、组件职责及依赖关系的图示语言，减少架构讨论歧义 | **Visualization reference only**；按沟通需要选图，不要求每个产品绘制全部层级，也不以 C4 图取代数据契约。 |
| [Diátaxis — Documentation Framework](https://diataxis.fr/) | 区分教程（Tutorial）、操作指南（How-to）、技术参考（Reference）及概念解释（Explanation），改善 README/操作手册及规范导航的可发现性 | **Information-architecture reference only**；不强制创建四套目录或改变 Product Design / TRD / Current State 的既有权威。 |

**使用方式：** 在新系统、重大架构变更或文档审查中，Agent 可借助这些框架提出有证据的覆盖缺口，但必须指出本标准中对应的文档 Owner、具体未满足的风险与最小修订。不要仅因外部框架中存在某一章节就新建文件或阻断交付。详见 [Top-down review Issue #42](https://github.com/retailpulses/.github/issues/42)。
