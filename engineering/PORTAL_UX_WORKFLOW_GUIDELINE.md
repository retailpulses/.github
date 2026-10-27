# Retailpulses Product-grade Operator Experience Standard v0.2（Draft）

> 状态：Draft / Product-grade MVP Quality Guideline；Owner：Engineering Registry；关联 [#41](https://github.com/retailpulses/.github/issues/41)。2026-10-27。适用于 Commerce OPS、Mac mini StoreOps 及后续内部操作台。**不要求共享运行时、前端框架、Portal Shell 或组件库。**
>
> 目标优先级：**任务完成率与正确性 > 工作流可理解性 > 一致性与可维护性 > 装饰性美观**。不增加独立审批门槛。

## 配套验收规范（Agent-driven UX Testing）

**正式配套 Draft**：[PORTAL_UX_TEST_CATALOG.md](PORTAL_UX_TEST_CATALOG.md)。本文件定义产品体验的 **WHAT / WHY**，Test Catalog 定义 Agent 在浏览器中如何 **PLAN → EXPLORE → EXECUTE → VERIFY → FIX → RE-TEST**、如何记录证据以及如何判定 PASS/FAIL/NOT RUN/BLOCKED。

- **UI MVP 验收三部分**：Functional Verification + Visual Verification + End-to-End Operator Workflow Verification；均应有与业务风险相称的执行证据。
- **实际浏览器**：截图、DOM/Accessibility Tree、真实点击/滚动/刷新/重试；不能用代码审查、HTTP 200 或截图单独替代操作员任务验收。
- **业务结果**：需区分 submit/queued/verified/published，必要时核对 Job、持久化和外部 Seller readback。
- **Agent 工具**：Codex、Claude、Playwright 或人工均可；不强制统一框架/浏览器代理。自动修复测试不得删除关键断言、放宽产品要求或绕过必要 Gate。
- **成本与权限**：按风险选择案例，优先主路径和高风险异常路径；真实发布等外部副作用需明确授权；不新增审批流程。
- **试点**：New Product Listing [store-ops#139](https://github.com/retailpulses/store-ops/issues/139) 的任务闭环、已存在 Listing、图片/类目 Gate 和视觉可用性；本次仅定义测试计划，未执行真实浏览器验收。

## 0. 定位：产品级 MVP，而不是 POC UI 修补清单

**Sponsor 方向（2026-10-27）**：将内部 UI 质量从 POC-level 提升至商业产品可持续运营的 MVP 水平。目标是**降低完成真实业务任务的总摩擦**，而非追求视觉精致。历史代码和旧 Baseline 是问题证据与可复用资产，**不是质量上限**。该标准是组织级 [Engineering Principles](ENGINEERING_PRINCIPLES.md)、[Documentation Standard](DOCUMENTATION_STANDARD.md)、[Architecture Review Guide](ARCHITECTURE_REVIEW_GUIDE.md) 在产品体验层面的落实，Canonical Owner 为 `retailpulses/.github`。

### 0.1 POC → MVP → 后续成熟度

| 维度 | POC（验证假设） | MVP（必须可持续操作） | 后续增强（按价值投入） |
|---|---|---|---|
| 用户任务 | 证明关键技术可行，可用脚本或演示 | 明确目标用户、主任务、入口、完成定义，真实操作员能独立完成主路径 | 更高效率、个性化 |
| 流程 | Happy path 可以接受 | 成功、失败、部分完成、未知结果及恢复路径可理解 | 复杂编排/批量自动化 |
| 数据与状态 | 允许明确标识的 Mock | 关键动作接真实数据和可信回读；不把排队/草稿当成功 | 预测与优化 |
| 交互 | 临时控件可接受 | 按钮、表单、队列、长文本、滚动、键盘、布局基本可用；不阻断主任务 | 视觉精修、动效 |
| 工程支撑 | 隔离实验即可 | 最小持久化、错误处理、幂等/重试、诊断、权限/事实边界按风险实现 | 大规模扩展 |

**MVP 不等于功能齐全，也不等于页面好看；MVP = 少量明确功能，但核心业务工作流可真实完成、可解释、可恢复、可验证。** 不允许将“代码已合并”“API 通过”“UI 已显示”替代 Operator Acceptance。

### 0.2 Friction Budget：审查端到端任务，而非只看前端

对每个 P0 工作流，Product Design 应说明：操作者目标 → 输入/事实 → 主要操作 → 系统自动处理 → 状态/反馈 → 失败恢复 → 最终回读。Review 时主动识别：

- **无意义 Gate**：没有明确业务风险、合规或数据正确性依据的审批、人工确认、重复校验、状态对齐。
- **重复劳动**：重复输入、复制粘贴、跨页面寻找对象、刷新后丢失上下文、反复重试。
- **不透明系统行为**：隐藏 Job、无法判断是否已提交/完成、异常只给 ValueError、过时或不可信数据。
- **技术约束外溢**：内部模型、版本/身份关联、数据库缺字段等实现细节被转嫁为操作员障碍。

每项 Gate 必须有**明确触发条件、业务理由、负责方和可操作的解除/恢复方式**；若不能解释其必要性，默认考虑删除或改为非阻断提示。不得以减少摩擦为由绕过真实的外部发布、财务或数据正确性边界。

### 0.3 与 Engineering Standards 的双向连接

- **Product Design**（按 Documentation Standard）：写目标用户、Capabilities、E2E Workflows、业务规则、异常路径与 UX Acceptance；不是仅有 UI 页面清单。
- **Architecture/TRD**：承担支撑交互的状态模型、持久化、Job/Queue、事实来源、错误契约、幂等/回读；不能让 UI 以猜测代替后端能力。
- **Current State**：记录已实现与已验证的实际运行行为，不把 POC 或 Demo 误报为 MVP。
- **Issue/PR**：每个新增/实质变更的主工作流有轻量 Operator Acceptance 证据：任务完成、错误恢复、长文本/布局、实际浏览器操作，标 PASS/FAIL/NOT RUN；**不新增独立审批流程**。
- **Engineering Principles**：落实用户目标优先、比例架构、独立验证、失败恢复、复用成熟方案与证据驱动；若 UX 不达标的根因在后端，修复应落到正确产品/技术层，而非仅修改 CSS。

### 0.4 质量投入原则

**MVP Must-have**：主任务可完成、核心状态可信、错误可恢复、关键操作可达、基础兼容性、可观测验证。**Recommended**：可复用的轻量交互模式、常用快捷操作、合理的默认值。**Optional**：动画、视觉品牌统一、组件库抽象、全面重构、昂贵自动化测试平台。优先修复高频、高影响、高错误成本的摩擦；仅在两个以上真实场景有收益时提炼共享组件。React + Vite + TypeScript 仍是推荐而非强制。

### 0.5 建议的 MVP Operator Acceptance（每条关键工作流）

1. 操作者能从明确入口找到任务和正确业务对象，不需要知道内部 UUID/代码结构。
2. 操作前知道将改变什么；操作后能区分执行中、成功、失败和未知；不会误报成功。
3. 正常路径无需无业务依据的人工 Gate 或重复输入；遇错有可执行的恢复路径。
4. 实际数据和业务状态可回读；刷新、重试和返回不会无故丢失任务上下文。
5. 在主要操作员设备/浏览器上，按钮、表单、滚动、长文本与主要操作区可用。
6. 证据标明 PASS/FAIL/NOT RUN；关键失败不能以“已有单元测试”替代浏览器/业务验收。

**本节是目标质量标准；既有 UI 并未因此被宣称达到 MVP。** 对老页面采用按风险/使用频次分批改善，不要求一次性重做。

## 1. 调研依据与现状（代码级抽样，非浏览器验收）

抽样源码：
- [StoreOps operator console render.py](https://github.com/retailpulses/store-ops/blob/main/apps/operator_console/render.py)：自定义 CSS、导航、表单、表格；有 `flex-wrap` 和 `min-width` 等局部处理。
- [StoreOps NPL workflow UI](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/new-products-to-listing/npl_workflow_ui.py)：多阶段列表/详情/图片/文案/发布；HTML 由 Python 生成，工作流状态和操作耦合。
- [StoreOps Monthly P&L UI](https://github.com/retailpulses/store-ops/blob/main/monthlypnl/ui.py)：成本审核、RMA、月度概览，存在演示数据/真实数据分支；需要清晰区分来源和完成状态。
- [StoreOps Time Sale portal](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/portal.py)：独立页面内联样式和 CSV 工作流。
- [StoreOps Inquiry render](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/customer-operations-agent/ui/render.py)：独立样式、状态、表单和人工交接操作。
- [StoreOps Rakuten render](https://github.com/retailpulses/store-ops/blob/main/apps/rakuten/ui/render.py)：单独样式和表格布局，采用 `overflow-wrap:anywhere`，存在将长内容任意断词的风险。
- [Commerce OPS #321](https://github.com/retailpulses/commerce-ops/issues/321)：深链接、作用域内实体标识、歧义 fail-closed；三个业务域已有各自实现。
- [Commerce OPS #370](https://github.com/retailpulses/commerce-ops/issues/370)：同一操作台导航在 React 和静态 HTML 中分叉。

**初步判断**：多个 UI 各自定义基础 CSS、按钮、表格、状态和操作布局；现有局部响应式处理不能保证所有页面可用。用户反馈的按钮文字挤成竖排属于待复现缺陷，**不是已经由代码证实的特定根因**。工作流上更需要标准化任务入口、下一步操作、失败恢复和验证结果，而非视觉重设计。需在实际浏览器中验证后建立按页面的 PASS/FAIL 证据。

## 2. MVP UX Default Baseline（新建或实质修改工作流时优先采用）

### UX-01 任务入口和下一步
每个操作页应在首屏清楚回答：当前对象/范围是什么、当前状态是什么、最重要的下一步是什么。工作流以用户任务命名，不以技术子系统命名。每个关键操作必须有成功、失败、部分完成、未知结果的处理路径；不得把所有异常都导向人工确认。

### UX-02 状态与反馈
明确区分：待处理、执行中、已完成、失败、需人工处理、结果未知（按业务选用，**不得强行复用一套状态机**）。提交后显示执行中或操作结果；后台 Job 展示最近更新时间、可用的重试/回读动作。显示的是事实、推断还是 Demo 必须标识。禁止“点击没反应”和将任务排队成功伪装为业务完成。

### UX-03 操作与按钮
一组操作仅突出一个主操作；次要操作弱化；破坏性操作隔离。按钮标签用动词+对象/结果，例如“保存成本”“生成 CSV”，避免“确认”“执行”这类脱离上下文的文字。链接用于导航，按钮用于动作。异步操作防重复提交，失败后可恢复。禁止以不解释原因的 disabled 代替明确反馈。

### UX-04 宽度、换行与布局（P0）
按钮标签不得逐字竖排、被裁切或覆盖其他控件。**默认按钮标签不换行**；操作区宽度不足时，优先让按钮组整体换行/换列，而非压窄单个按钮。CSS 实现可采用 `white-space:nowrap`、`flex-wrap:wrap`、`flex:0 0 auto`、`min-width:max-content`，具体按上下文选择，避免制造横向溢出。长标签应缩短而非硬编码超宽按钮。表格允许自身横向滚动，不允许整个页面因为操作栏而无意义地横向滚动。至少验证桌面 1280px、窄桌面 1024px 和 400% Zoom/320 CSS px 等效重排；对必须二维滚动的表格按 WCAG 例外处理。

### UX-05 表单与验证
字段有明确标签、单位、是否必填、来源和保存行为。字段旁展示可修正的错误；不得仅返回 ValueError/Traceback。提交前校验关键业务约束，提交后保留上下文和输入，避免用户从头填写。业务审核需区分“保存草稿”“采用”“发布”“确认完成”等不同后果。

### UX-06 列表、详情与队列
列表必须提供业务可识别标识、状态、最后更新时间和下一动作；按任务需要提供过滤/搜索。详情页保留返回原列表/筛选上下文；重要对象可复制 Deep Link。避免只显示 UUID。队列项需要有 Owner（若适用）、阻塞原因、下一步与可恢复路径；不制造无必要的人工 Gate。

### UX-07 工作流设计先于页面堆砌
每个有 2+ 阶段的关键流程在 Product Design 中写一张简明表：触发 → 输入/事实 → 操作 → 状态变化 → 用户反馈 → 异常恢复 → 完成验证。明确自动化与人工边界、幂等/重试和最终 readback。不可仅列页面/按钮清单。优先简化步骤，减少无业务依据的审批和阻塞。

### UX-08 一致性而非统一框架
复用术语、按钮语义、状态反馈、字段单位、时间与金额格式、列表/详情行为；允许不同技术栈和局部 CSS。已有可靠实现可 Copy & Adapt；只有多个消费者证实收益时才考虑共享组件。不得为了规范而重写页面。

### UX-09 可验证的交互
关键路径至少检查：初次打开、典型操作、失败/空状态、长文本和长标识、窄屏/Zoom、直接链接/刷新、后台任务回读。PR 中记录 PASS/FAIL/NOT RUN 与截图或自动化证据；测试存在不等于通过。禁止只测 API 成功却不验证按钮/页面可用。

### UX-10 最小可访问性
采用原生 button/input/label；键盘焦点可见；错误与状态可识别。交互目标遵循 WCAG 2.2 AA 24×24 CSS px 最小尺寸或规范例外；内部桌面页面可优先使用更舒适的尺寸，但不要强制装饰性样式。

## 3. 新页面的轻量 Review Checklist
- [ ] 任务对象、状态和下一步操作明确；无虚假完成/人工 Gate
- [ ] 主次操作清楚；危险操作隔离；失败有原因和恢复动作
- [ ] 按钮文本在 1280/1024px 和放大场景不竖排、不裁切
- [ ] 长 Item Code、日文文本、金额、错误提示不会破坏布局
- [ ] 表单有字段说明、即时/提交后反馈、数据保存语义
- [ ] 列表/详情/队列能保留用户上下文；关键业务对象可深链接
- [ ] 关键流程有状态转换与 readback/完成条件
- [ ] 记录浏览器实际验证 PASS/FAIL/NOT RUN

## 4. Bottom-up P0 试点与非目标

**试点顺序**：New Product to Listing（长标签、图片/文案/发布多阶段）→ Monthly P&L（成本审核、RMA、反馈）→ Time Sale（生成、下载、Seller 回读）→ Inquiry Review（人工交接）。每个试点只改最明显的 1–3 个交互缺陷，形成可复用案例；不做整站 UI 重绘。

**非目标**：强制 Commerce OPS 和 Mac mini 共用 Shell；设计系统/组件库先行；统一 React；品牌视觉升级；增加发布审批、人工 Gate 或全量 UI 自动化平台。

## 5. 外部依据与取舍
- [Nielsen Norman Group — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)：状态可见、错误预防、控制权、一致性、恢复帮助。用于工作流和反馈原则，不照搬视觉。
- [USWDS — Button](https://designsystem.digital.gov/components/button/) 与 [Button Group](https://designsystem.digital.gov/components/button-group/)：操作语义、主次层级、窄屏按钮组换列。
- [USWDS — Form](https://designsystem.digital.gov/components/form/)：标签、输入顺序、字段旁错误、谨慎使用 disabled。
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)：1.4.10 Reflow、2.5.8 Target Size Minimum。它是可访问性最低参考，不是对所有内网 UI 做全面认证的要求。

## 6. Draft 验收与升级条件
当前仅为源码抽样与外部参考形成的 **v0.1 Draft**，不是已批准规范，也不宣称生产 UI 已通过验证。下一步需在 Mac mini 真实 Portal 选择 2–3 个工作流做浏览器核验，记录问题截图、修复前后、任务成功率/失败恢复、最少必要的布局断言。确认后再决定是否升级为 v0.2 Reference Guideline。


## 7. 历史 Issue 与 System Design 对账（2026-10-27 补充）

本规范不是从零创立；以下已有设计/工程资产必须被视为来源，并按其适用范围和最新决策引用，不重复建立权威。

| 来源 | 已有规则/证据 | 本规范处理方式 |
|---|---|---|
| [inbox #331](https://github.com/retailpulses/inbox/issues/331) | 已提出 Internal UI Engineering Standards、Operator-first 信息层级、状态/证据/配置/操作、共享原语候选、Agent 指导；明确不是品牌美化项目 | **原有 UI 标准化 Sprint**，本 Draft 是其规范文本候选；不新建竞争性 UI Kit 项目。共享组件仍须有复用证据 |
| [inbox #414](https://github.com/retailpulses/inbox/issues/414) | Windows 滚轮问题触发 PC 跨平台标准；1280×720、1366×768、大屏；100%/125% 缩放；Windows Chrome/Edge、macOS Chrome/Safari；滚轮/触控板/键盘 | 作为跨平台 QA 的**现有专项设计**。本 Draft 的 1024px、320 CSS px/400% Zoom 是补充的 Reflow 检查，不能取代实际 PC 矩阵 |
| [commerce-lab #142](https://github.com/retailpulses/commerce-lab/issues/142) | Windows 下长日文 Description 可用键盘阅读，但鼠标滚轮不能正常滚动 | 已观察到的操作缺陷；根因尚未验证。加入嵌套滚动/焦点/输入方式的验收 |
| [commerce-lab #151](https://github.com/retailpulses/commerce-lab/issues/151) | Canonical Copy Review 编辑区需要更大的可用空间（右侧工作区宽度） | 内容编辑/审核工作区需按任务分配宽度，不以视觉均分代替可操作性 |
| [commerce-ops #293](https://github.com/retailpulses/commerce-ops/issues/293) | Queue → Filters → Ranking → Results；队列优先、过滤器不能隐式隐藏待办、服务端排序、URL 可恢复 | **工作台模式的重要既有业务契约**，不可将队列伪装成默认过滤器；注意后续评论：Inquiry 已允许 Expected Value 排序，Ticket/Orders 仍按其各自决策 |
| [commerce-ops #321](https://github.com/retailpulses/commerce-ops/issues/321) / [#370](https://github.com/retailpulses/commerce-ops/issues/370) | 可分享业务实体 Deep Link、歧义 fail-closed、顶层导航一致 | 作为交互行为参考，不要求 StoreOps 与 Commerce OPS 共享 Shell |
| [commerce-ops #165](https://github.com/retailpulses/commerce-ops/issues/165) | Needs Reply 是独立操作义务，不等于 Ticket 生命周期状态；SLA 为派生维度 | 不得混淆业务状态、操作义务和紧急程度 |
| [store-ops #115](https://github.com/retailpulses/store-ops/issues/115) | Time Sale CSV 选择、生成文件在刷新后恢复、JST 默认时间、失败不能显示全成功、同一 Job 回读 | 作为状态反馈/恢复能力的具体验收案例 |
| [store-ops #139](https://github.com/retailpulses/store-ops/issues/139) | Variant-centric 多阶段上架工作台、持续准备、人工发布、状态与真实回执 | 作为 UX-07 的端到端流程试点；不要把各阶段技术门槛等同于业务必需 Gate |
| [store-ops #185](https://github.com/retailpulses/store-ops/issues/185) | Sponsor 明确要求从产品整体工作流评审，而非逐条 UI 补丁；PR #187 为 docs-only Holistic UX 草案 | 评审 Monthly P&L 时应先检查工作区与任务流，再修复单个控件 |
| [inbox system design/README](https://github.com/retailpulses/inbox/blob/main/system%20design/README.md) | Issue → Real Case → Architecture Questions → Concepts → Design Artifact 的知识提炼方法；系统设计提问包括状态、失败、恢复、验证 | 将真实案例与规范关联，避免把 Issue 证据复制为另一个平行 SSOT |
| [inbox system design/development-principles.md](https://github.com/retailpulses/inbox/blob/main/system%20design/development-principles.md) | 先用户目标和工作流、明确成功证据、优先成熟实现、失败恢复、按比例设计；该文档标为 Historical/Source Reference | 作为历史来源，组织级权威仍在 `.github/engineering/ENGINEERING_PRINCIPLES.md` |
| [inbox #345](https://github.com/retailpulses/inbox/issues/345) / [#346](https://github.com/retailpulses/inbox/issues/346) | 标准应明确 Default/适用条件/例外/证据；调研结论回写 owning Issue | 规范以 DEFAULT 为主，不泛化为强制审批；外部研究不是业务权威 |

### 7.1 技术架构对齐与 Sponsor 决策（2026-10-27）

**决定 D-UI-01：React + Vite + TypeScript 是新建或较大改造的内部 Admin UI 的 DEFAULT（推荐），不是 MANDATORY（强制）。**

- 与 [Engineering Principles](ENGINEERING_PRINCIPLES.md) 和 [Architecture Review Guide](ARCHITECTURE_REVIEW_GUIDE.md) 一致：先明确业务工作流和验收，再选择现有成熟技术；按产品规模、已有代码和维护成本作决定。
- 现有 Python-rendered、Worker HTML 等页面可继续低摩擦维护；新建简单内网工具也可采用更轻的实现。**不要求迁移 React，不要求例外审批**；重大技术取舍仅在对应产品 Issue/PR 中简述理由。
- 不强制 Commerce OPS 与 Mac mini StoreOps 共享 Shell、组件库或 Runtime。UX 行为/跨平台 QA 适用于各种技术栈。
- [inbox/docs/11_FRONTEND_STANDARDS.md](https://github.com/retailpulses/inbox/blob/main/docs/11_FRONTEND_STANDARDS.md) 是此前技术栈默认建议的历史来源，其中“不同技术栈必须申请例外”的旧表述由**本次 Sponsor 决策取代**；待本 Draft 合并后，`.github` 的组织级规范为唯一当前权威，旧文件只保留历史引用或导航。
- 本规范属于 DEFAULT / Reference Guideline；其中避免不可达关键操作、误报业务成功等是具体功能正确性验收，不应被“推荐”二字理解为允许交付无法操作的页面。

**决定 D-UI-02：Canonical Destination = `retailpulses/.github`。** 组织级 UX、前端栈建议、跨平台 PC QA、轻量检查清单在本仓库统一维护。产品仓库仅维护自己的 Product Design、业务工作流、实现及具体 Bug；`inbox/system design/` 的历史案例保留来源链接，不维护竞争性的规范副本。

**Harvest / Closeout 边界**：原始标准化规划 [inbox#331](https://github.com/retailpulses/inbox/issues/331) 和 [inbox#414](https://github.com/retailpulses/inbox/issues/414) 的知识和规范所有权迁入 [.github#41](https://github.com/retailpulses/.github/issues/41)。关闭它们代表规划归档与工作迁移，**不代表**其全部浏览器测试、Shared UI Kit 或产品缺陷已经完成；未完成验收继续由 #41 与各产品 Issue 跟踪。

### 7.2 以案例驱动的下一轮核验

- **P0 可用性**：Windows 滚轮/嵌套滚动（#142）、按钮被挤压竖排（Sponsor 报告，尚未定位页面）、长日文文本、编辑区有效宽度（#151）。按 #414 的 OS/浏览器/视口/缩放矩阵记录。
- **P0 工作流**：NPL 六步流程中当前步骤、可执行操作、失败恢复和发布 readback（#139）；Time Sale 生成、刷新恢复和结果一致性（#115）。
- **P1 工作台**：Monthly P&L 四工作区与成本反馈（#185）；Commerce OPS 队列默认/过滤/排序（#293）及 Needs Reply 与生命周期正交（#165）。

此处为**历史 Issue 与文档对账**，不是这些验收已通过的证明。历史 Issue 的开放/完成状态也不等于当前生产状态；真实浏览器检查仍标记 NOT RUN。

## 8. Operator Intent Capability Map（跨 Commerce OPS / Mac mini 的治理候选）

本节基于 2026-10-27 的跨产品 Intent Audit；它定义**运营者想完成什么**，不是强制六个菜单、六套数据库或统一组件。Mac mini 已做页面级只读抽样；Commerce OPS Orders / Inquiry 生产页面受 Cloudflare Access 限制，Tickets 仅见未登录外壳，因此后者主要是代码/Design 证据（E0），**不代表生产 UX 已通过验收**。

| ID | Operator Intent | 操作者要回答的问题 | 最小 UI 契约（仅适用产品） | 对应既有测试 |
|---|---|---|---|---|
| OI-01 | Work Queue & Prioritization | 哪些业务对象需要我处理、为什么、先做哪个？ | 可识别对象、触发原因、优先级/时效、当前责任、下一动作；完成后退出活动待办，保留历史 | T05/T07/T11/T18/T19 |
| OI-02 | Job Control & Observability | Agent/Scheduler 正在执行什么、是否健康、何时重试？ | 运行状态、最近执行/成功时间、失败原因、依赖/阻塞、数据新鲜度；可观察不等于必须允许人工强制执行 | T10/T12/T15/T19 |
| OI-03 | Review & Decision | 需要我判断什么，依据与差异是什么？ | 候选/当前事实、来源、关键差异、业务后果、清楚的接受/拒绝/暂缓动作 | T06/T13/T16/T17/T20 |
| OI-04 | Action & Execution | 我发起的发送/发布/履约动作发生了什么？ | 操作范围、确认边界、提交反馈、异步状态、防重复；不能把已提交称为已完成 | T08/T09/T10/T12/T20 |
| OI-05 | Exception & Recovery | 出错或结果未知时怎样安全继续？ | 业务原因、受影响对象、负责方、可执行恢复方式；未知外部写入先查证再决定重试 | T13/T14/T15/T16/T17 |
| OI-06 | Outcome & Reconciliation | 外部业务结果真的完成了吗？ | 权威回读/证据、时间、来源、部分完成/未知的区别、历史追溯与队列退出条件 | T09/T11/T12/T19 |

**跨域控制维度**：Policy & Scheduling（策略、运行范围、调度、阈值、人工控制）按产品需要贯穿 OI-01/02/04；不是所有产品必须建设独立 Settings 页。信息架构、数据表达、Copy Hygiene、视觉/可访问性也是跨域质量，不另造能力域。

### 8.1 Work Queue 与 Job Queue 不得混淆

- **Work Queue** 是按业务责任形成的人工待办：新客户消息、成本未匹配、需审阅的文案等。业务问题解决才退出活动队列；一个业务对象可关联多个 Job。
- **Job Queue** 是后台自动执行账本：请求、排队、运行、重试、成功/失败。Job 成功不必然等于业务完成；外部状态未知也不必然等于 Job 失败。
- UI 应能从业务对象追溯关联 Job/事件，但不强制把两套状态机合并。不能因为 Ticket 曾关闭就忽略新的未回复消息；不能因为发布 Job 成功就声称 Seller 已核实上架。

### 8.2 跨产品证据与边界

| 产品 | 可观察/设计中的 Intent | 证据与限制 |
|---|---|---|
| Mac mini Mercari StoreOps / NPL | Work Queue、后台处理、人工审核、Seller readback | 2026-10-27 Chromium 只读页面抽样；未证明完整 E2E |
| Mac mini Monthly P&L / RMA | 成本复核、候选队列、人工确认、证据与关闭 | 2026-10-27 Chromium 只读页面抽样；未执行写操作 |
| Mac mini Time Sale / Stock Monitor | Campaign 生成、运行观察、规则与人工处理 | 2026-10-27 Chromium 只读页面抽样 |
| Commerce OPS Orders | Pipeline health、DAG/ownership、backlog、freshness、生命周期对账 | [控制面代码](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/src/lib/portal/control-plane.mjs)、[Sync Job Inventory](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/SYNC_JOB_INVENTORY.md)；部分设计注明 branch-only，不推断已部署 |
| Commerce OPS Tickets | 消息驱动待办、人工处理、证据、重开与幂等恢复 | [Current State](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/docs/00_CURRENT_STATE.md)、[历史 message-first 设计](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/docs/canonical_message_first_architecture.md)；后者为 Draft，不作为已实现事实 |
| Commerce OPS Inquiry | 咨询审核/发送、平台回读、Follow-up 队列、补漏与重试 | [目标架构](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/docs/01_ARCHITECTURE.md)、[Follow-up 实现](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/dashboard/functions/_lib/follow-ups.ts)；目标设计不等于已部署 |

### 8.3 产品设计与 Agent 验收的最小使用方法

1. Product Design 的 Capability/Workflow 指明涉及哪些 OI（可以只选 1–2 项），写明业务对象、完成语义、自动化/人工边界。
2. 对每项涉及的 OI，从上表挑选最相关的现有 UX-T 测试，不新增平行测试清单或通用审批。
3. 对 Work Queue 检查真实待办进入、优先级、人工处理与退出；对 Job Queue 检查执行、阻塞、重试、可观测性；对 Outcome 检查权威回读。分别标 PASS/FAIL/NOT RUN/BLOCKED。
4. 高风险外部副作用需单独授权；无登录/无回读时不得用静态代码或 HTTP 200 宣称 E3/E4 通过。

**非目标**：统一前端技术栈、强制六个页面、建设跨产品共享 Job 平台、一次性重做历史 UI、对所有产品施加全部能力。
