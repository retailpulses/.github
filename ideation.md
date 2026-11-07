# Outcome Management & Embedded Copilot — Ideation

Status: **Ideation / Exploration**（非 Design Baseline；技术选型未批准）
Updated: 2026-11-07 JST
Owner / scope: 跨产品产品探索；首个验证对象为 Store OPS / New Products to Listing (NPL)
Tracking: [组织级战略 #85](https://github.com/retailpulses/.github/issues/85) · [NPL Pilot #280](https://github.com/retailpulses/store-ops/issues/280)

> 本文是当前讨论的主要 Harvest Output。记录目标、背景、方案、论证、已形成的方向和未决问题；**不构成已批准的 Architecture、TRD、API Schema、部署或开发授权**。Issues/PRs 仍为工作与执行状态权威；产品运行数据仍以各业务系统为准。

## Context

- 现有内部运营产品（首先是 NPL）主要围绕 Work List、SPU1、Variant Review、COPY/IMAGES 阶段、发布预览和技术诊断组织操作。运营人员不得不理解大量内部流程，才能回答「什么已经完成、什么阻塞、下一步做什么」。
- 希望从 **Workflow Management** 转向 **Outcome Management**：运营人员管理目标、异常、可审查成果和审批；Copilot 辅助查询、诊断、准备和受控 Action Orchestration；确定性业务规则、持久 Job Queue、重试、对账与审计仍由业务后端负责。
- 目前 ChatGPT 浏览器侧边栏可以支持跨工具分析，但不应假设其可直接访问 Mac mini 的 Local Supabase / SQLite。云端与本地网络隔离；本地 SQLite 本身是文件，不是远程服务。Tailscale 地址并不自动赋予 ChatGPT 访问能力。
- 另一方向是在 NPL 页面直接嵌入使用 DeepSeek API 等模型的 Copilot，利用产品已有的用户身份、页面状态、后端接口和本地数据访问路径。
- 目标是复用成熟开源实现，不从零开发 AI 聊天、流式交互、Tool Calling 和 UI/Agent 状态同步。

## Objective

1. 减少运营人员为完成业务结果而操作内部流水线的负担；保持图片、文案、价格等视觉审查与明确发布审批。
2. 探索 **Embedded Copilot** 与 **ChatGPT/browser-side Copilot** 是否可以共享业务能力，而非预先二选一。
3. 使 Copilot 能基于真实 NPL 状态回答问题、定位阻塞、呈现结构化下一步，而不是生成无依据的建议。
4. 保留 Local Supabase / SQLite 等既有 Source of Truth，不引入第二套 Listing 业务账本。
5. 优先通过现有技术栈与开源组件做最小纵向验证；不提前冻结框架、模型或 Gateway 部署方案。

## Key Ideas / Discussion

### 1. Outcome Management ≠ Chat-first UI

- 目标导向入口可以是 Outcome Queue：ready for review / needs decision / blocked / in progress / published & verified。
- Copilot 是上下文查询与行动编排能力，不应取代可视化商品审查、快速筛选、显式批准、持久任务队列及可恢复的确定性后端。
- AI 说「published」不等于外部 Mercari 已发布；成功必须由平台回执、持久记录与必要对账验证。

### 2. Embedded 与 Browser Side Panel：互补而非必然替代

- **Embedded** 更适合 NPL 等产品内高频任务：读取当前 Variant/shop、原生显示商品与诊断、与审批控件联动、复用应用身份和后端。
- **ChatGPT/browser-side** 更适合跨产品、GitHub、运营分析和临时性管理工作；在有合适连接器/MCP 时也可能使用相同 Business APIs。
- Embedded 在单产品深度操作上可能优于侧边栏，但并非在所有工作能力上 supersede 后者。
- 候选原则：**One Capability Layer, Multiple Copilot Experiences**。两种入口可有不同 UI、会话和权限上下文，但不重复实现业务规则。

### 3. Local data access constraint

- CopilotKit 或 DeepSeek **不应直接持有数据库写权限**；模型通过受控 Server Tools / Business APIs 请求数据和动作。
- NPL 后端可在本地查询 PostgreSQL（Local Supabase）与 SQLite；统一返回最小必要的、脱敏且有来源/时间戳的业务 Read Model。
- 对 ChatGPT 外部入口，待验证 MCP Connector、受控隧道或 Mac mini 主动出站 Relay 等方式；不直接公开数据库端口。
- 业务 API 应进行身份/店铺权限校验、字段裁剪、审计、幂等、限流；发布和价格等高风险外部变更需审批与结果核实。
- **Local Business Gateway** 是候选抽象，不代表必须新建独立服务。先调查现有 NPL 后端和 commerce-lab capability layer，优先复用已有接口。

### 4. Embedded Copilot 技术候选（未选型）

- **CopilotKit**：优先评估的开源 React/Agent 交互方案，关注页面上下文、Shared State、Tool/UI Actions、Human-in-the-loop、AG-UI 与结构化业务结果。
- **assistant-ui + Vercel AI SDK**：较轻量的聊天组件与模型/流式工具调用组合，作为对照备选。
- **DeepSeek API**：首个模型候选，验证 Function Calling、流式响应、结构化工具结果及错误处理；不将 DeepSeek 设为不可替换的架构依赖。
- **commerce-lab**：已有模型/能力层方向，但需要检查真实 API、当前实现和 NPL 既有集成，不能仅凭概念假设已可直接接入。
- 需要先检查 NPL 前端是否 React、现有后端/身份/部署边界，以及引入 CopilotKit 是否带来不成比例的改造成本。

### 5. CopilotKit 如何使用数据、有哪些主要模型

CopilotKit 是 UI/Agent 交互层，**不是业务数据库 ORM 或 NPL 数据库**。典型链路：页面上下文 → Copilot Runtime/Agent → 模型决定 Tool Call → 服务端业务工具 → NPL Business API → Local DB → 结构化结果 → UI。

讨论过的运行时概念（**概念模型，非已核实的固定数据库表 Schema**）：
- **Agent**：运行的助手与可用工具；
- **Thread / Message**：对话与消息历史；
- **Tool / Tool Call**：工具定义、参数、执行与结果；
- **Agent State / Context**：选中 Variant、Shop、当前任务、审查结果等共享交互状态；
- **Run / Event**：一次执行和流式事件、工具状态与结果。

重要边界：Thread/Agent State 不得成为 Listing、库存、价格、发布审批或 Job 的第二份业务权威；是否持久化对话需按恢复需求再决定。NPL 可向 Copilot 提供聚合 Read Model（例如 variantId、shopId、inventory provenance、listing status、readiness blockers、available actions），**字段仅为探索性示例，非最终契约**。

### 6. Open-source reuse vs build

- 优先复用成熟的聊天 UI、streaming、tool-call visualization、context/state integration 和审批交互范式。
- 自有实现仅聚焦 NPL Business APIs、权限、业务规则、审计、任务与 UI 集成。
- 不为了 Copilot 重写 NPL 前端，不创建独立 AI 业务账本，不将聊天记录当作操作日志。
- POC 应验证真实只读数据闭环，而不只验证「聊天窗口能打开」。

## Decisions / Direction (as of 2026-11-07)

| Item | Status | Current position |
|---|---|---|
| Outcome-oriented operations | Direction agreed | NPL 为首个探索对象；业务状态与执行仍归确定性后端 |
| Embedded + external Copilot | Direction agreed | 可以共存；不强制二选一 |
| Shared Business Capabilities | Principle agreed | 多入口复用业务接口、权限与任务权威 |
| NPL embedded-first exploration | Direction agreed | 先验证当前页面内的原生业务体验 |
| Local DB direct access by LLM | Rejected as default | 经服务端受控工具访问；不直接向模型开放数据库写入 |
| CopilotKit | Candidate | 优先技术评估，**尚未选定** |
| assistant-ui + AI SDK | Alternative | 保留对照 |
| DeepSeek API | Candidate | 验证后决定，不锁定 |
| Local Business Gateway deployment | Open | 先评估复用现有 NPL / commerce-lab 能力 |
| Formal design pack / API contract | Deferred | 当前只维护 ideation.md；进入设计阶段后再创建 |

## Open Questions / Validation

1. NPL 当前前端技术栈、状态管理和组件体系是否适合 CopilotKit？引入成本如何？
2. CopilotKit 与现有 NPL API、身份会话、DeepSeek tool calling、流式响应的实际适配路径是什么？
3. 现有 NPL 后端哪些只读业务接口可直接复用？哪些数据只在 Local SQLite / Supabase？
4. commerce-lab 的现有 capability/model router 能否复用，还是 NPL 直接调用模型更简单？
5. 外部 ChatGPT 访问本地能力的受支持连接方式、认证、可用性和成本如何验证？
6. Agent Thread 是否需要跨设备/跨会话恢复？保存期限与数据最小化如何定义？
7. 如何量化运营收益：完成时间、操作次数、阻塞发现率、误报/漏报、重复发布风险？
8. 现有 NPL 技术流水线缺陷与 Copilot UI 改造如何分开处理，避免用 AI 掩盖可靠性问题？

## Next Validation (not yet authorized as implementation)

- 阅读现有 NPL UI/Backend 与 commerce-lab 的实际代码、接口及运行边界。
- 比较 CopilotKit 官方示例与 assistant-ui + AI SDK 的最小接入成本。
- 选择一个**只读**纵向场景：在 NPL 页面选中真实 Variant 与 Shop4，询问未上架原因；工具从权威业务记录查询并返回来源、时间戳和 blockers，在页面显示结构化结果。
- 记录 POC 的 Hypothesis / Method / Result / Limitations / Decision impact；成功不自动批准技术栈或生产部署。
- 只有在验证结果支持后，再决定是否进入正式 Design / Architecture / implementation Issues。

## References

### Internal
- [Outcome Management strategy — retailpulses/.github #85](https://github.com/retailpulses/.github/issues/85)
- [NPL outcome-oriented console — retailpulses/store-ops #280](https://github.com/retailpulses/store-ops/issues/280)
- [NPL existing MVP / runtime context — store-ops #139](https://github.com/retailpulses/store-ops/issues/139)
- [Local LLM / Capability Gateway — .github #24](https://github.com/retailpulses/.github/issues/24)
- [Documentation Standard (Pilot)](engineering/DOCUMENTATION_STANDARD.md)

### External candidates (references, not adoption decisions)
- [CopilotKit GitHub](https://github.com/CopilotKit/CopilotKit)
- [CopilotKit documentation](https://docs.copilotkit.ai/)
- [AG-UI protocol](https://docs.ag-ui.com/)
- [assistant-ui GitHub](https://github.com/assistant-ui/assistant-ui)
- [Vercel AI SDK GitHub](https://github.com/vercel/ai)
- [DeepSeek API documentation](https://api-docs.deepseek.com/)

## Harvest governance

- 只维护本文件作为当前跨产品 Copilot ideation 的主要讨论归档；相关 Issues 通过链接回指，不复制整篇内容。
- 新的讨论以修订现有章节的方式收敛；区分 Fact / Hypothesis / Direction / Decision / Open Question，避免把提案写成已验证事实。
- 本文不替代 store-ops 的产品设计权威、commerce-lab 的实现权威，也不记录实时运营数据或敏感客户信息。
