# Retailpulses Engineering Registry & Governance — Product Design

**版本：** v0.1
**状态：** Draft（供 Sponsor / Engineering review；不代表所有能力已交付）
**Design Owner：** `retailpulses/.github` · Engineering
**范围：** 组织级工程资产发现、轻量标准索引、基础设施 / Runtime 目录、治理指引和迁移权威对齐。
**规范：** [Documentation Standard](engineering/DOCUMENTATION_STANDARD.md)（当前 Pilot）· [Product Design Template](engineering/templates/PRODUCT_DESIGN.md) · [Design Migration Guide](engineering/DESIGN_MIGRATION_GUIDE.md)
**Current State：** 本文第 7 节记录 2026-10-25 的审计基线；持续状态以 Registry、Issue / PR 和平台证据为准。

## 1. Product Overview

### 用户与问题

Retailpulses 的 Engineer、AI Agent、Product Owner 及基础设施维护者需要跨仓库发现组织级工程资料。当前文档分布于 `.github`、`inbox`、产品仓库和平台现场；不同资产的来源、Owner、状态和验证边界并不总是容易辨认。这会增加开发前查找、问题诊断、交接和迁移时产生重复权威的风险。

### 产品目标与成功标准

**Retailpulses Engineering Registry & Governance** 为 Engineer、AI Agent 和 Product Owner 提供统一、可信、可发现的组织级工程资产、规范和基础设施索引，减少跨仓库开发、诊断、交接及维护摩擦。

用户从组织主页或 `.github` README 能进入正确资产；能分辨组织层与产品层 Owner；能识别 Pilot、迁移中、未知和有验证证据的资料；能沿链接追踪来源、Issue 和必要的验证证据。索引本身保持轻量、可维护，执行状态仍由现有 GitHub Issues / Projects 承载。

### 范围与非目标

**In scope：** Organization Landing Page 与 README 导航；Engineering Standards / Templates 索引；Repository Registry；Infrastructure / Runtime / Workspace Registry；跨产品 Foundational API References；组织级 Agent guidance 的定位与适用边界；迁移来源、Owner 和状态追溯。

**Non-goals：** 不迁移产品 Design、TRD、代码或运行手册至 `.github`；不取代 `rp-governance-kit` 当前治理工具权威；不建立第二套 Governance、Backlog、Project tracker 或 Asset Database；不将快照当作实时 Runtime 状态；不创建独立 Web Portal；不在本文维护逐项 Sprint 进度。

## 2. Capability Map

Capability ID 在组织级 Design / Issue 追踪中保持稳定；名称或目录调整不回收 ID。Current State 以 2026-10-25 的 main `c48d27e3cd1831e614956235c86103aa57a105ef`、QW-01 工作分支、可见 Issues / PRs 和现存路径为基线，可能随合并改变。

### ERG-001 — Engineering Asset Registry

- **Purpose:** 提供组织仓库、资产类别及权威入口的稳定目录。
- **User / Consumer:** Engineer、Agent、Product Owner、资产维护者。
- **Expected Behavior:** 从 Registry 定位已登记资产、仓库职责及其 Owner；未核实的职责明确标 UNKNOWN。
- **Canonical Owner / Asset:** `.github/registry/README.md` 与 `registry/repositories.yaml`；具体产品资产由产品仓库 Owner 管理。
- **Current State:** Implemented（基础仓库目录存在；职责为粗粒度、部分待核实）。
- **Target State:** 经 Owner 核对的组织资产入口，持续保留未知项与来源证据。
- **Related Issues:** [#25](https://github.com/retailpulses/.github/issues/25)。
- **Acceptance Intent:** 用户可由一份 registry 发现仓库，并不会误把仓库存在或名称当作当前运行事实。

### ERG-002 — Engineering Standards & Templates

- **Purpose:** 发现跨仓库适用的工程标准、模板及其生效阶段。
- **User / Consumer:** Product Owner、Engineer、Agent。
- **Expected Behavior:** 入口同时显示已存在、Pilot、Proposed、Reference 与迁入中的内容，链接至标准原文；不暗示尚未批准的规范为组织强制规则。
- **Canonical Owner / Asset:** `.github/engineering/README.md`、`DOCUMENTATION_STANDARD.md`、`DESIGN_MIGRATION_GUIDE.md`、`engineering/templates/`；产品级 Design / Architecture / TRD 归产品仓库。
- **Current State:** Pilot（文档标准与迁移指南已在 main）；In Progress（工程方法 PR [#23](https://github.com/retailpulses/.github/pull/23) 在本基线仍开放）。
- **Target State:** 标准状态清晰、轻量且有采用证据，模板为按需使用而非默认增设流程。
- **Related Issues:** [#16](https://github.com/retailpulses/.github/issues/16)、[#22](https://github.com/retailpulses/.github/issues/22)。
- **Acceptance Intent:** Agent 能找到适用标准和正确模板，同时辨认提案、Pilot 与已批准标准。

### ERG-003 — Infrastructure & Runtime Registry

- **Purpose:** 为组织级基础设施资产、Runtime 与其来源提供可追溯索引。
- **User / Consumer:** Infra / Runtime Owner、Engineer、Agent、需要诊断的产品团队。
- **Expected Behavior:** Registry 区分稳定资产身份与有时间戳的观察；连接 Source Repository、Workspace / Release、Runtime、Application / Route 和验证证据；未知值保留 Unknown。
- **Canonical Owner / Asset:** `.github/infrastructure/` 管理跨产品目录和脱敏证据索引；实际运行事实归运行平台，产品拓扑归产品仓库。
- **Current State:** In Progress（有 Mac mini inventory 和基础设施导航；Cloudflare / VPS 现场核验及 Workspace mapping 未完成）。
- **Target State:** 按证据维护资产映射和观察时间，清楚暴露未核实范围；不声称实时健康。
- **Related Issues:** [#14](https://github.com/retailpulses/.github/issues/14)、[#15](https://github.com/retailpulses/.github/issues/15)。
- **Acceptance Intent:** 用户能沿索引定位运行资产的源码和验证记录，并能看到它不是实时平台读数。

### ERG-004 — Foundational API References

- **Purpose:** 发现跨产品复用的外部 API / 平台契约整理资料及官方来源。
- **User / Consumer:** 产品 Owner、工程师、集成 Agent。
- **Expected Behavior:** 通过稳定 Reference ID 定位来源、版本、适用范围、验证日期、消费者和未知项；官方资料始终是外部契约来源。
- **Canonical Owner / Asset:** `.github/references/` 管跨产品发现和内部整理；供应商拥有官方契约，产品仓库拥有实现 schema、产品映射和运行证据。
- **Current State:** Pilot（GigaB2B Open API 2.0、Mercari Inquiry、Rakuten RMS 索引已合并；全量字典和跨仓库盘点未完成）。
- **Target State:** 每个共用契约可从单一入口发现，证据状态准确，不形成重复可编辑字典。
- **Related Issues:** [#19](https://github.com/retailpulses/.github/issues/19)。
- **Acceptance Intent:** 使用者能分辨来源可访问、字段已核实和生产行为已验证这几种不同事实。

### ERG-005 — Governance Distribution

- **Purpose:** 让组织成员发现已批准治理材料及其采用方式，并逐步评估治理资产整合。
- **User / Consumer:** Repository Maintainer、Engineer、Agent。
- **Expected Behavior:** 导航明示当前工具权威、消费者依赖及迁移状态；执行能力仅在消费者明确采用并验证后称为已分发。
- **Canonical Owner / Asset:** 当前治理工具、政策、安装器与执行 Workflow 的 Owner 是 `rp-governance-kit`；`.github` 承载 GitHub 原生组织默认文件和当前 registry 导航。
- **Current State:** Planned / Proposed（#11 正文将分阶段整合表述为提案；当前工具权威尚未切换）。
- **Target State:** 只有兼容性、消费者和回退路径得到验证且有明确 authority cutover 后，才更新权威声明。
- **Related Issues:** [#11](https://github.com/retailpulses/.github/issues/11)。
- **Acceptance Intent:** 治理使用者能选到当前生效入口，不会因导航或部分复制而丢失执行保护。

### ERG-006 — Agent Engineering Guidance

- **Purpose:** 提供组织级 Agent 安全、导航和工程协作指导，同时说明加载边界。
- **User / Consumer:** AI Agent、委托 Agent 的 Engineer、仓库 Maintainer。
- **Expected Behavior:** Agent 按执行环境支持的机制读取可用 guidance；组织 README 不把 `.github/AGENTS.md` 声称为 GitHub 自动分发给所有仓库或 Agent。
- **Canonical Owner / Asset:** `.github/AGENTS.md` 是组织指导文档的 Canonical Source；各运行环境自身的 instruction loader、产品仓库本地 `AGENTS.md` / `CLAUDE.md` 或 Copilot 配置决定实际加载行为。
- **Current State:** Implemented guidance file；自动分发至每个产品仓库/所有 Agent 为 Unknown，且 GitHub 的 Community Health 默认文件支持列表不包括 `AGENTS.md`。具体环境须逐一核验。
- **Target State:** 指引准确描述内容权威与工具加载机制，产品仓库可增加本地上下文且不削弱适用的安全边界。
- **Related Issues:** [#26](https://github.com/retailpulses/.github/issues/26)（已由 PR #27/#28 关闭）；相关机制须依据 Agent 平台自身配置持续核验。
- **Acceptance Intent:** Agent 能发现中央指引，但不会把文件存在误判为 GitHub 对所有 Agent 的强制执行。

### ERG-007 — Migration & Canonical Authority Management

- **Purpose:** 追踪跨仓库资产从来源发现到经证据支持的 Owner / Authority 收敛。
- **User / Consumer:** Migration Owner、Engineer、Sponsor、下游资产使用者。
- **Expected Behavior:** Source Inventory → Ownership Decision → Migration → Verification → Canonical Authority Cutover → Source Traceability；迁入完成本身不代表权威切换。
- **Canonical Owner / Asset:** 各迁移 Issue / PR 是执行状态与讨论权威；#25 内的 Migration Ownership Matrix 是当前聚合发现和路径指针，不是第二套任务 Backlog。
- **Current State:** In Progress（#25 有矩阵及待核实项；完整 census 和逐资产确认未完成）。
- **Target State:** 每项迁移在现有 Issue 中有 Owner、目标位置、依赖、验证证据和明确的 authority decision / 状态。
- **Related Issues:** [#25](https://github.com/retailpulses/.github/issues/25) 及矩阵引用的现有 Migration Issues。
- **Acceptance Intent:** 用户能分辨 Planned、In Progress、Migrated、Verified，并识别权威是否仍待切换，而无需维护新的 backlog。

### ERG-008 — Organization Navigation

- **Purpose:** 提供稳定、简洁的 Organization → Registry → Canonical Asset 导航路径。
- **User / Consumer:** 所有 Organization 成员、访问组织公共主页的贡献者、Agent。
- **Expected Behavior:** Profile 指向 Engineering Registry 和主要 repositories / Issues / Projects；README 连接 Standards、Runtime、Repository Registry、References 和追踪 Issues。
- **Canonical Owner / Asset:** `profile/README.md`（GitHub Organization Overview 特殊路径）、根 `README.md` 与各索引 README。
- **Current State:** Implemented（QW-01 PR #29 已合并；Design 入口由本 PR 增补）。
- **Target State:** 从组织主页到权威资料均有可解析链接；Profile 保持稳定 landing page，不成为第二套 portfolio 状态库。
- **Related Issues:** [#25](https://github.com/retailpulses/.github/issues/25)。
- **Acceptance Intent:** Engineer / Agent 在两分钟内找到相应的组织索引和执行入口，并能继续追到资产 Owner。

## 3. Core Workflows

### WF-01 — Engineering Asset Discovery

- **Trigger:** 工程工作开始、问题诊断或交接时需要定位资产、规范、接口、运行信息或 Owner。
- **Actor:** Engineer、Agent、Product Owner。
- **Inputs:** 任务上下文、能力/仓库/Runtime 线索、已知 Issue 或 Reference ID。
- **Main Flow:** 从 Organization Profile 进入 `.github` README；按 Engineering、Infrastructure、Repository 或 References 索引进入对应目录；阅读资产状态与来源；沿链接访问 Canonical Owner 文档、产品仓库或跟踪 Issue；比较需求时阅读其 Design / Architecture / TRD / Current State。
- **Exceptions:** 无条目、Owner 不清或链接冲突时标为 Unknown / 冲突并记录到已有相应 Issue；不基于仓库名称或旧快照猜权威。
- **Outputs:** Canonical Asset 链接、Owner、状态/证据边界和已有执行追踪入口。
- **Acceptance Intent:** 使用者在一条清晰导航链上定位资料，并知道当前链接是权威、索引还是历史来源。

### WF-02 — Engineering Asset Registration

- **Trigger:** 新组织级标准、共享参考、基础设施资产或稳定仓库职责需要被跨团队发现。
- **Actor:** 提议的 Asset Owner、Engineering Registry Maintainer；必要时对应 Product / Runtime Owner。
- **Inputs:** 资产目的、使用者、候选 Canonical Owner、来源、验证状态、依赖及已有 Issue / PR。
- **Main Flow:** 判断是组织级还是产品级；确认唯一 Owner 与适当的现有目录；保留来源与验证时间；按已有 Registry 所需的最小元数据登记；由现有 README / Index 加入稳定链接；涉及待办时关联现有 Issue / Project。
- **Exceptions:** Owner 有争议或同类副本存在时先记录冲突并保持 Unknown；不要创建新目录、服务、任务清单或重复字典来绕过冲突。
- **Outputs:** 有 Owner 的 Canonical Asset 或有来源/Owner 缺口的明确 Issue 追踪。
- **Acceptance Intent:** 使用者可发现资产，且不会因登记而产生第二个可编辑权威或把未经核实内容标成 Verified。

### WF-03 — Cross-repository Asset Migration

- **Trigger:** Issue 批准或安排将组织级资产从一个仓库/位置迁入另一个位置。
- **Actor:** Migration Issue Owner、Source Owner、Target Owner、Reviewer；需改变既有归属时由相应决策 Owner 明确确认。
- **Inputs:** Source Inventory、已有 Canonical Owner、迁移 Issue、消费者/依赖、目标位置、回退与验证意图。
- **Main Flow:** 核对来源内容及消费者 → 在现有 Issue 确认归属和目标 → 实施迁移并保留来源追溯 → 验证目标链接、语义与依赖 → 明确决定是否以及何时切换 Canonical Authority → 更新源端状态和链接。
- **Exceptions:** 未能核实来源/Owner 时保持 Unknown / Planned 并记入现有 Issue；未完成消费者验证则保持旧权威并保留兼容入口；存在两个活跃权威时不宣布完成。
- **Outputs:** Issue / PR 证据、目标 Canonical 路径、迁移状态及单独可读的 Authority Cutover 结果。
- **Acceptance Intent:** 使用 `Planned`、`In Progress`、`Migrated`、`Verified` 标识迁移事实；`Migrated` 表示内容已搬入，不自动表示已 Verified 或切换权威。

### WF-04 — Runtime-to-Source Traceability

- **Trigger:** 需要诊断长期 Runtime / Application / Route，确认其来源或版本。
- **Actor:** Runtime Owner、Engineer、Agent、Product Owner。
- **Inputs:** Runtime / Application / Route 标识、平台可读观察、Registry 中已有资产与 Workspace / Release 指针。
- **Main Flow:** 由 Infrastructure Registry 找资产 ID 和最近的 Observation → 读取其 Source Repository、Workspace 或 Release、部署版本/commit 和验证时间 → 在产品仓库查看部署契约 → 必要时从授权运行平台获取当前 read-back 并与 Registry 比对。
- **Exceptions:** Registry Snapshot 过期、Source/Release 关系缺失或平台不可访问时，显示 Observation 时间和 Unknown 原因；不得把 GitHub 值描述为实时状态，也不得用未经授权的生产变更修复差异。
- **Outputs:** 资产到来源的映射、可追溯版本、最近验证证据及差异/未知项。
- **Acceptance Intent:** 用户明确知道什么是 GitHub 中记录的观察，什么是现场即时核实，以及二者时间和覆盖范围。

## 4. Product Requirements

稳定能力编号即本产品的 Capability / Requirement IDs：ERG-001 至 ERG-008，见第 2 节。流程编号 WF-01 至 WF-04，见第 3 节。需求变更通过本 Design 的修订及现有 GitHub Issue / PR 追踪，不新增 Backlog。

## 5. Shared Business Rules

- **BR-01 — Single Canonical Authority:** 每项资产在同一时点只有一个明确 Canonical Owner。目录可为索引或副本兼容入口，但需标明非权威角色；Ownership Unknown 时不得默认为 `.github`。
- **BR-02 — Product vs Organization Ownership:** 组织级跨产品标准、组织索引和基础设施目录归 `.github`；产品 Design、TRD、代码、产品架构及运行手册归各产品仓库；真实平台运行状态归运行平台。
- **BR-03 — Design / Current State / Execution Separation:** `design.md` 定义此产品长期目标与业务规则；Registry / Infrastructure Files 记录资产及有范围、时间的可验证关系；GitHub Issues / PRs 记录执行、迁移、决策与验收。三类信息互相链接，不彼此替代。
- **BR-04 — Evidence-based Status:** 仅有来源明确、适用范围和验证时间的实际证据时才标 `Verified`。目录存在、Issue 打开、代码合并、Snapshot 记录均不足以单独证明生产运行状态。
- **BR-05 — Historical Traceability:** 迁移后保留来源链接、相关 Issue/PR 和必要历史记录；只有在唯一历史证据仍可追溯、消费者已验证且清理在授权范围内时才退役旧入口。
- **BR-06 — No Duplicate Backlog:** GitHub Issues / Projects 是任务、优先级和动态进度的权威；README、`design.md` 和 Ownership Matrix 只作导航/资产关系/状态定义，不复制完整任务清单或动态进度数据库。

## 6. UX / Information Architecture

此产品以 GitHub 文件导航为主要 UI，不包含独立 Web Portal。

```text
Retailpulses Organization Profile
  ├─ Engineering Registry → .github/README.md
  │    ├─ Engineering Standards & Templates → engineering/README.md
  │    │    └─ Product Design Baseline → design.md
  │    ├─ Infrastructure / Runtime → infrastructure/README.md
  │    ├─ Repository Registry → registry/README.md
  │    ├─ Foundational References → references/README.md
  │    └─ Active tracking → existing Issues / Projects
  └─ Product / Engineering Repositories
       └─ Product README → Design / Architecture / TRD / Current State
```

- **Profile → Registry:** Organization Overview 提供 `.github` Engineering Registry、主要产品/工程仓库、Issues / Projects 和文档目录链接；不重复产品能力或任务状态。
- **README → Domain Index:** 根 README 将 Standards、Infrastructure / Runtime、Repository Registry、Foundational References 和 Active Migration Issues 作为稳定入口。
- **判断 Canonical：** 资产页须展示 Canonical Owner / 路径、状态、来源和必要 Issue；未确认时明确显示 Unknown。README 链接本身只代表导航，不自动授予其目标 Canonical Authority。
- **Agent 定位：** 先读目标 repo 的 `AGENTS.md` / README 与本 Design，再按 ERG ID 找对应 Registry 和 Owner 文档，最后沿 Requirement / Reference ID、Issue / PR、必要运行证据核实事实。
- **Agent 加载边界：** `.github/AGENTS.md` 是指导文件的 Source of Truth，但实际自动加载由具体 Agent 产品、repo/workspace 配置决定。GitHub 的组织默认 Community Health 文件有单独支持清单；其机制不等同于把 `AGENTS.md` 自动注入每个仓库或每个 Agent。

## 7. Current State & Gaps

**审计基线：** `main` merge commit `c48d27e3cd1831e614956235c86103aa57a105ef`（PR #29）；现工作分支从该 main 创建，`design.md` 尚待本 Follow-up PR 合并。并行 PR #23 在本节撰写时仍为开放状态。此快照不代表永久状态；每次重要变更由对应 Issue / PR 和平台 read-back 更新证据。

| Area | Current evidence / state | Gap / target |
|---|---|---|
| Organization navigation / repository directory | **Implemented:** PR #29 的根 README 与 `profile/README.md` 已合并，Organization Overview 已核实渲染；`registry/repositories.yaml` 存在且声明粗粒度快照。 | Design 入口合并后加入根 README；仓库 Owner / 职责仍按 Registry 的 UNKNOWN 标注逐项核实。 |
| Standards / templates | **Pilot:** `DOCUMENTATION_STANDARD.md`、`DESIGN_MIGRATION_GUIDE.md` 和 Product Design 模板已在 main；不等于全组织强制采用。 | #16 Pilot review 未完成；#22 的方法迁入内容当时位于开放 PR #23，合并前不算已实现。 |
| Infrastructure / runtime | **Implemented / In Progress:** 有 infrastructure 目录、Mac mini Runtime inventory 与 snapshot；#14/#15 跟踪现场 Inventory / Workspace mapping。 | Cloudflare / VPS / database platform facts、Workspace ↔ Release ↔ Runtime 映射与现场证据有待各 Issue 核实。 |
| Foundational API References | **Pilot:** `references/README.md` 和三个产品域资料存在；PR #18 已合并。 | #19 的跨仓库 census、MacBook 本地资料、字典字段证据及旧副本处置仍未全部完成。 |
| Governance | **Implemented current boundary:** Registry README 指向当前 `rp-governance-kit` Owner。 | #11 尚未完成工具/Workflow 消费者兼容验证或 authority cutover；ERG-005 不能表述为已迁入。 |
| Agent guidance | **Implemented file:** `.github/AGENTS.md` 已修订 credential boundary；但 main 的文件头仍将其描述为所有仓库的默认行为。 | GitHub 默认 Community Health 机制不分发 AGENTS；不同 Agent 的加载覆盖仍 Unknown。main 的 `docs/adoption-guide.md` 旧文亦声称它会自动继承；本 Follow-up PR 同步澄清两个入口，后续仍需按 Agent runtime 单独核实。 |
| Asset migration | **In Progress:** Issue #25 有矩阵及本轮 QW-01 writeback；迁移状态由各现有 Issue / PR 维护。 | inbox 完整 census、部分来源路径、Owner 和权威切换尚待核对；本文不复制这些逐项动态记录。 |

状态词含义：**Implemented** 表示对应文件/导航已在基线 main 中；**Pilot** 表示可试用但采用评估未完；**In Progress** 以实际存在的开放 PR、工作产物或验证任务为据；**Planned** 表示仍待启动/定义；**Unknown** 表示证据不足。它们描述设计基线，不覆盖 GitHub Issue / PR 实时状态。

## 8. Decisions & Open Questions

| ID | Decision / Question | Status | Authority / evidence |
|---|---|---|---|
| DEC-ERG-01 | `.github` 是 Engineering Registry 的组织级 Canonical Entry Point，但不因此接管产品资产或当前治理工具权威。 | Draft baseline | #25 boundaries；当前 Registry 与各产品 repo owners。 |
| DEC-ERG-02 | Governance kit 何时满足消费者兼容和回退条件，可切换为单一中心治理 Owner？ | Open；非本 QW-01 阻塞 | [#11](https://github.com/retailpulses/.github/issues/11) 的依赖与决策记录。 |
| DEC-ERG-03 | 每个 Agent / IDE / Cloud Agent 实际加载组织级 guidance 的配置范围如何核对并更新？ | Open / Unknown；不把自动继承作为假设 | GitHub 官方 [Community Health defaults](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file) 不列 `AGENTS.md`；Copilot 有自己的 [custom instruction support](https://docs.github.com/en/copilot/reference/custom-instructions-support)。需由各 Agent runtime 的配置/行为证据回答。 |
| DEC-ERG-04 | 组织资产 Census 如何确认完整度及被裁定为产品级/业务级资产时的例外 Owner？ | Open | #25 的未完成 inventory 与已有 Issue 追踪；无需新增 Backlog。 |
| DEC-ERG-05 | Documentation Standard / Architecture Methodology Pilot 何时获批采用？ | Open | [#16](https://github.com/retailpulses/.github/issues/16)、[#22](https://github.com/retailpulses/.github/issues/22)、PR [#23](https://github.com/retailpulses/.github/pull/23)。 |

以上问题不阻塞 Draft v0.1、现有索引导航或其文档合并。若决策会改变已确认 Canonical Owner、治理工具切换或产品级行为，应在对应现有 Issue 内由授权 Owner 作出，不在本 Design 中预先推定。

## 9. Appendix — References and Traceability

### Canonical files

- [Engineering Registry README](README.md) · [Engineering Index](engineering/README.md) · [Organization Profile](profile/README.md)
- [Repository Registry](registry/README.md) · [Infrastructure Registry](infrastructure/README.md) · [Foundational References](references/README.md)
- [Organization Agent Guidance](AGENTS.md) · [Credential Access Guide](infrastructure/credentials/ACCESS_GUIDE.md)
- Product-level Design / Architecture / TRD / Current State：由各产品仓库拥有并维护；本仓库只提供跨产品标准与导航。

### Traceability

| Capability / Workflow | Existing tracking |
|---|---|
| ERG-001, ERG-007, ERG-008 / WF-01–WF-03 | [#25](https://github.com/retailpulses/.github/issues/25) |
| ERG-002 | [#16](https://github.com/retailpulses/.github/issues/16), [#22](https://github.com/retailpulses/.github/issues/22) |
| ERG-003 / WF-04 | [#14](https://github.com/retailpulses/.github/issues/14), [#15](https://github.com/retailpulses/.github/issues/15) |
| ERG-004 | [#19](https://github.com/retailpulses/.github/issues/19) |
| ERG-005 | [#11](https://github.com/retailpulses/.github/issues/11) |
| ERG-006 | [#26](https://github.com/retailpulses/.github/issues/26)；已合并来源 PR [#27](https://github.com/retailpulses/.github/pull/27)、[#28](https://github.com/retailpulses/.github/pull/28) |

### Status and sources

- QW-01 Navigation PR: [#29](https://github.com/retailpulses/.github/pull/29)（截至本 Design 基线已合并）。
- 工程方法迁移：[#22](https://github.com/retailpulses/.github/issues/22) / [PR #23](https://github.com/retailpulses/.github/pull/23)，其状态须以当前 PR 读回为准。
- GitHub：[default community health files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)；[Copilot custom instruction support](https://docs.github.com/en/copilot/reference/custom-instructions-support)。特定 GitHub Copilot、IDE 或其他 Agent 的适用范围应以平台当前配置和行为核实，不从文件存在推断。

本设计以简洁产品基线为目标，不逐节复刻模板强制目录，也不增加数据库 Schema、CLI、脚本实现或 Sprint 状态明细；具体技术契约和执行证据留给对应 Owner 文档与 Issue / PR。
