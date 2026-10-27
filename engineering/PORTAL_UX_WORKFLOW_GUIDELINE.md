# Retailpulses 内部运营 Portal UX 与工作流规范 v0.1（Draft）

> 状态：Draft / Reference Guideline；Owner：Engineering Registry；关联 [#41](https://github.com/retailpulses/.github/issues/41)。2026-10-27。适用于 Commerce OPS、Mac mini StoreOps 及后续内部操作台。**不要求共享运行时、前端框架、Portal Shell 或组件库。**
>
> 目标优先级：**任务完成率与正确性 > 工作流可理解性 > 一致性与可维护性 > 装饰性美观**。不增加独立审批门槛。

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

## 2. MVP Mandatory Baseline（新建或实质修改工作流时适用）

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

### 7.1 现有前端技术标准的权威冲突

[inbox/docs/11_FRONTEND_STANDARDS.md](https://github.com/retailpulses/inbox/blob/main/docs/11_FRONTEND_STANDARDS.md) 目前明确写 **React + Vite + TypeScript 是内部 Admin UI 默认技术栈**，其他栈需在 Issue/PR 中说明例外。其方向是技术栈标准化；本规范讨论的是**跨技术栈的交互结果**。两者不应被混淆。

**本 Draft 不废止、不擅自修改该现有技术标准。** 需要工程 Owner 决定它与 `.github` 当前工程原则及 StoreOps Python-rendered UI 的适用范围、例外和规范迁移关系。不得为了通过本 UX 标准强迫现有本地页面迁移 React，也不得把本 Draft 当作豁免现有技术规范的正式批准。

### 7.2 以案例驱动的下一轮核验

- **P0 可用性**：Windows 滚轮/嵌套滚动（#142）、按钮被挤压竖排（Sponsor 报告，尚未定位页面）、长日文文本、编辑区有效宽度（#151）。按 #414 的 OS/浏览器/视口/缩放矩阵记录。
- **P0 工作流**：NPL 六步流程中当前步骤、可执行操作、失败恢复和发布 readback（#139）；Time Sale 生成、刷新恢复和结果一致性（#115）。
- **P1 工作台**：Monthly P&L 四工作区与成本反馈（#185）；Commerce OPS 队列默认/过滤/排序（#293）及 Needs Reply 与生命周期正交（#165）。

此处为**历史 Issue 与文档对账**，不是这些验收已通过的证明。历史 Issue 的开放/完成状态也不等于当前生产状态；真实浏览器检查仍标记 NOT RUN。
