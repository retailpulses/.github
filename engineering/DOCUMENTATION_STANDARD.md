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
