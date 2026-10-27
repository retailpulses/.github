# Retailpulses Agent-driven Operator UX Test Catalog v0.1（Draft）

> Canonical Owner: `retailpulses/.github` · Issue [#41](https://github.com/retailpulses/.github/issues/41) · [PR #48](https://github.com/retailpulses/.github/pull/48) · 2026-10-27
>
> 配套规范：[Product-grade Operator Experience Standard](PORTAL_UX_WORKFLOW_GUIDELINE.md)、[Engineering Principles](ENGINEERING_PRINCIPLES.md)、[Documentation Standard](DOCUMENTATION_STANDARD.md)、[Architecture Review Guide](ARCHITECTURE_REVIEW_GUIDE.md)。
>
> **目标**：以最低合理成本证明核心运营任务可完成、可理解、可恢复，发现并减少 UI 与后端 Gate 的总摩擦。**不是**新审批流程、视觉设计系统或统一技术栈要求。

## 1. 适用范围与证据纪律

- POC：可做探索性验证；**不能**仅凭 Demo、HTTP 200、代码 Review 或单元测试宣布 MVP。
- MVP：对已承诺的 P0 操作员工作流执行 **Functional Verification + Visual Verification + End-to-End Operator Workflow Verification**，深度按风险调整。
- 测试方法可由 Codex、Claude Code、本地 Agent 或人工执行；工具无关。**只有真正执行的检查才能标 PASS**。
- 产品自身的 Design/TRD 定义任务目标、必要 Gate、完成语义和真实数据边界；本目录只规定通用检查与证据格式。
- 允许浏览器截图 + 手工操作记录，不强制搭建 Playwright 基础设施。高频稳定场景优先自动化。
- 已有业务数据可做只读验证；**真实发布、删除、资金变更等外部副作用必须有明确授权**。隔离 Fake Seller/Fixture 的结果不得写作真实 Seller Acceptance。

### 1.1 证据等级（不混淆）

| 等级 | 证据 | 可以证明 | 不能单独证明 |
|---|---|---|---|
| E0 | 静态源码/Design/Issue 审查 | 设计意图、潜在风险 | 实际浏览器可用性 |
| E1 | 单元/集成测试、HTTP/DOM 断言 | 代码路径和接口契约 | 真实视觉质量和业务完成 |
| E2 | 实际浏览器截图 + DOM/Accessibility Tree + 视口信息 | 渲染、可见性、视觉缺陷 | 点击后业务是否成功 |
| E3 | 浏览器操作轨迹、输入、点击、刷新、错误恢复 | 用户交互和任务步骤 | 外部系统最终状态 |
| E4 | 与真实数据/Job/持久化/Seller readback 关联的 E3 证据 | 完整业务任务是否完成 | 其他未测试场景的质量 |

**状态**：`PASS`（有对应等级的执行证据）、`FAIL`（复现问题）、`NOT RUN`（未执行）、`BLOCKED`（环境、权限或依赖导致不能执行）。`BLOCKED` 不等于产品失败；也不能写成 PASS。每项写明时间、环境、代码版本和证据链接。

## 2. Agent UX Acceptance Loop

1. **Plan（按 Product Design）**：定义操作者、任务起点、真实完成条件、关键状态、必要 Gate、非正常路径；列出用户可见的功能承诺。
2. **Explore（真实浏览器）**：检查页面、DOM/Accessibility Tree、截图、布局、键盘/滚轮、实际可点击性；发现代码之外的摩擦。
3. **Execute（任务走查）**：按真实运营者路径点击、输入、保存、刷新、返回、重试；记录额外步骤和不可解释的阻止。
4. **Verify（分层证据）**：功能状态、视觉状态、持久化/后台 Job/外部回读分别验证；区分 submit、queued、verified、published。
5. **Diagnose → Fix → Re-test**：将问题定位到 UI、API、数据事实、Job、状态机或 Gate 的正确 Owner；修复后复跑原失败路径和邻近回归。
6. **Report**：逐项 PASS/FAIL/NOT RUN/BLOCKED，保留证据与剩余风险。不得把失败用例删掉、放宽断言或标记 skip 以制造通过。

### 2.1 借鉴 Agent 工具实践（参考，不绑定厂商）

- **Codex / Playwright Interactive**：将 *functional QA* 与 *visual QA* 分开列出；覆盖用户可见控件、状态变化和异常路径。参考：[OpenAI Playwright Interactive Skill](https://github.com/openai/skills/blob/main/skills/.curated/playwright-interactive/SKILL.md)。
- **Claude / browser automation**：使用语义化 Locator / Accessibility Tree 进行交互，必要时用截图验证视觉；避免依赖脆弱的屏幕坐标。参考：[Playwright MCP](https://github.com/microsoft/playwright-mcp)。
- **Playwright Test Agents**：Planner 负责探索和生成测试计划，Generator 生成测试，Healer 可修复失效 Locator/测试脚手架；**不能自行修改业务期望、删除关键断言或绕过真实 Gate**。参考：[Playwright Test Agents](https://playwright.dev/docs/test-agents)。
- 参考是实践来源而非组织强制依赖；工具功能与具体安装方式以官方当前文档为准。

## 3. 通用测试目录

| ID | 领域 | 通用测试案例 | 最低证据 |
|---|---|---|---|
| UX-T01 | Visual | 按钮/标签无竖排、裁切、重叠；主 CTA 可辨识 | E2 |
| UX-T02 | Visual | 主要桌面视口（至少 1280×720、1366×768）及 100%/125% 缩放，关键操作可达 | E2 |
| UX-T03 | Visual | 长日文、Item Code、金额、错误消息、空状态不破坏布局 | E2 |
| UX-T04 | Interaction | 鼠标滚轮、触控板（可用时）、键盘及嵌套滚动能操作长内容 | E3 |
| UX-T05 | Navigation | 看似导航的元素可用；非交互步骤标识不伪装为可点击 | E3 |
| UX-T06 | Interaction | 主操作、危险操作、禁用状态和禁用原因可理解 | E3 |
| UX-T07 | Persistence | 保存、刷新、返回后任务上下文和已保存内容一致 | E3 |
| UX-T08 | Form | 输入校验指向具体字段，错误后不丢输入，可修正后继续 | E3 |
| UX-T09 | Workflow | 从任务入口到业务完成形成完整闭环，非仅到提交按钮 | E4（涉及后端） |
| UX-T10 | Async | Job 的 queued/running/success/failure 可区分，失败可重试/恢复 | E3+E4 |
| UX-T11 | Queue | 已完成任务退出 Active Queue，但可从历史/详情追溯 | E4 |
| UX-T12 | State | UI 成功/发布状态与真实持久化、Seller/外部 readback 一致 | E4 |
| UX-T13 | Friction | 没有无业务依据的重复审批、版本对齐、额外保存或人工 Gate | E3 + Design |
| UX-T14 | Error | 同一根因归并为可理解错误，给出下一步而非堆叠内部错误码 | E3 |
| UX-T15 | Recovery | 失败、中断、超时或结果未知后可安全恢复，不重复外部副作用 | E3+E4 |
| UX-T16 | Ownership | 数据/依赖缺失能明确指出缺什么、谁处理、如何继续 | E3 |

**按风险选测**：所有 P0 核心工作流优先 T05–T15；T01–T04 对有页面/布局变更或已知跨平台问题的场景必须覆盖；T16 适用于跨系统依赖。无关案例标 N/A 并简述原因，不强制每次跑完全部 16 项。

## 4. 视觉状态覆盖与设备矩阵

- **Visual State Coverage**：至少检查初始/可操作状态和任务结果状态；对存在的 loading、validation error、blocked、partial failure、recovered 状态按风险补充截图。不要只截首页。
- **默认桌面矩阵**：Windows Chrome/Edge、macOS Chrome/Safari 中与实际运营环境有关的组合；1280×720、1366×768、常用大屏；100%/125% 缩放。无法访问的平台标 NOT RUN，不能假设通过。
- **截图记录**：页面 URL/业务对象（敏感数据脱敏）、浏览器、OS、视口、Zoom、版本、状态、时间。对比截图时同时检查 DOM/交互，避免只凭像素变化判断质量。
- **Accessibility 最小项**：语义化控件、可见焦点、可键盘触达、标签与错误关联；按产品风险与实际环境决定进一步 WCAG 覆盖。

## 5. Friction Audit 与 Gate 分类

每个 P0 工作流记录：**目标 → 入口 → 输入 → 关键动作 → 系统处理 → 反馈 → 结果回读 → 失败恢复**。

对每个阻止或人工确认，判定：
- **Required**：外部真实写入授权、重复创建保护、可信身份/图片/类目/财务事实等有明确业务理由的 Gate；保留并使其可操作。
- **Redundant**：同一事实多次确认、已接受资产再次保存、无业务依据的 Copy/Image 版本同步、已完成仍阻止；优先移除。
- **Broken**：必要 Gate 触发条件或错误解释不准确；修复后端事实/契约，不是直接删除。
- **Unknown**：依据不充分；记录 NOT VERIFIED，不猜测。

建议量化：任务完成率、额外人工步骤数、任务耗时、失败恢复成功率、Operator Blocker 数。**不设脱离具体产品的统一数字 KPI 门槛**；与该产品上次基线或可接受目标比较。

## 6. New Product Listing 试点测试计划（引用产品 Issue，不复制 backlog）

Owner: [store-ops #139](https://github.com/retailpulses/store-ops/issues/139)；故障样本：[store-ops #198](https://github.com/retailpulses/store-ops/issues/198)；状态语义：[store-ops #190](https://github.com/retailpulses/store-ops/issues/190)。

| 场景 | 测试目标 | 重点通用 Case | 当前证据状态 |
|---|---|---|---|
| NPL-A 正常 Variant → 图片 → Copy → 预检 → 发布 | 真实主任务、保存刷新、发布 readback、退出 Active Queue | T05–T12 | NOT RUN（本目录未执行） |
| NPL-B Seller SKU 已存在/先前已发布 | 显示 PUBLISHED、Listing 链接、历史归属；不误报阻止、不重复 create | T09/T11/T12/T15 | NOT RUN |
| NPL-C 缺类目/图片接受失败 | 具体缺失事实、合并错误、可执行恢复，不虚假解锁 | T08/T13–T16 | NOT RUN |
| NPL-D 长日文 Copy/窄屏/顶部步骤 | 编辑区、滚动、CTA、步骤可点击性与 JST 时间 | T01–T05 | NOT RUN |

**执行边界**：先只读探索及隔离写入；已有真实 Seller 记录可读回；任何新的真实发布需明确授权。对已在 #139/#198 记录的成功/失败证据可引用，但不能据此把本次尚未执行的浏览器测试标为 PASS。

## 7. 最小验收报告模板

```markdown
# Operator UX Acceptance — <Product / Workflow>
- Product Design / Issue:
- Code commit / runtime:
- Browser / OS / viewport / zoom:
- Data scope / write authorization:
- Date / tester / tool:
- Task and expected business completion:
- Tested cases (ID / PASS|FAIL|NOT RUN|BLOCKED / evidence link):
- Screenshots (initial / relevant error / completion):
- Interaction trace (click/input/refresh/retry):
- Backend / Job / Seller readback:
- Friction observations (unnecessary actions, Gate reason, recovery):
- Open defects and owner:
- Overall: PASS | FAIL | INCOMPLETE (NOT RUN/BLOCKED)
```

**判定规则**：核心任务有未解决的 P0 FAIL，不能宣布 MVP UX PASS；未执行关键证据则为 INCOMPLETE。允许明确标注“功能验证通过、视觉/业务回读未执行”，禁止将部分通过包装为整体通过。

## 8. 成本控制与维护

- 先做 **1 个代表性成功路径 + 2 个高风险异常路径**，覆盖真实操作员最常见的阻塞；再按价值扩展。
- 优先复用现有 Playwright、浏览器和 CI；不要为本目录建设独立平台或强制共享 UI 框架。
- 每个产品只补业务特定场景和 fixtures；通用测试语义在 `.github` 唯一维护。
- 测试结果可放产品 Issue/PR，不要求每次新增报告文件；长周期测试证据可以归档到产品仓库。
- 失败后优先修复产品根因；只有稳定且重复出现的模式才升级到组织级规范。
