# Application-native AI Assistant — Ideation

> **状态：Ideation / Discovery（2026-10-31）**。本文件记录产品机会、讨论中的假设和待验证方案，**不是**已批准的 Product Design / Architecture / Implementation Plan，不授权部署、生产数据修改或扩大访问权限。  
> **归属：** 跨业务应用的潜在产品构思；暂存于 `retailpulses/.github`，待形成独立产品后再决定代码与设计权威仓库。  
> **Issue / 讨论入口：** [retailpulses/.github#76](https://github.com/retailpulses/.github/issues/76)。  
> **语言：** 简体中文为主，保留 Application-native、Intent、Tool、Runtime 等技术术语。

## 1. 背景与机会

Retailpulses 拥有 StoreOps、Commerce OPS、Product Center、CatalogSync 等不同业务系统，分布于 Mac mini、本地数据库和 VPS。面对运营界面上的异常，现有流程常需要向外部 Agent 重新说明当前页面、筛选条件、Job、数据结构、部署位置、代码仓库与授权方式，再编写 SQL/脚本排查。这造成大量上下文准备和跨系统访问摩擦。

**具体触发案例：** Mercari Time Sale Shop4 页面一次运行显示约 **850 条因 `Required local commercial data missing or invalid (TCOGS)` 而排除的商品**。用户想直接问“为什么这 850 个商品缺少 Commercial Data？”并追踪每条记录的真实原因及可能修复，而不是把页面截图交给 Codex 再重建调查链路。

目前代码里的 TCOGS 排除是复合结果，不能断言 850 条都缺少原始成本：`commercial_snapshot.py` 会受成本复制时效（24h）、供应商库存状态及数量门槛影响，`service.py` 将有效 TCOGS 不可用的多个情况合并归类。**实际 850 条的根因分布未经数据库与对应历史 Job 核实。**参考 [commercial_snapshot.py](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/commercial_snapshot.py)、[service.py](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/service.py)。

### 与“浏览器 Ask ChatGPT”不同在哪里？

页面阅读、问答、浏览器自动化、连接数据库或 GitHub **不足以形成差异化**。核心机会在于 Agent 作为业务应用的原生智能执行接口，直接复用应用的业务 Service、Repository、数据模型、规则、Job Context 和已有访问路径，以更低接入摩擦完成调查、影响模拟、受控处理与验证。它类似 **Siri + App Intents**：由应用开放可发现、可授权的业务能力，模型负责理解意图并选择调用；**不是**让模型绕过应用权限读取一切。

## 2. 候选价值主张（待验证）

> 让运营者在任何内部业务页面上，用自然语言调用该应用**原生**的业务分析与处理能力；把“发现异常 → 理解原因 → 评估影响 → 授权修复 → 验证结果”缩短为可追踪的闭环。

| 价值 | 具体业务效果 | 衡量方式（候选） |
|---|---|---|
| 低摩擦业务调查 | 不重复寻找 Repo/DB/Job、解释页面或重建权限 | 首次有效诊断耗时、接入/手动操作步数 |
| 业务语义正确 | 通过原有服务/规则而非模型自由生成未验证 SQL | 有证据支撑的根因覆盖率、错因率 |
| 运行结果可追溯 | 对齐执行时的数据快照、Commit、参数、日志 | 可复现案例比例、`UNKNOWN` 的明确率 |
| 决策与恢复 | 在隔离环境重算影响，受治理执行修复、核对效果 | 排除商品恢复率、人工介入率、修复到验收时间 |
| 跨应用规模效应 | 共用 Agent Core，不为每个产品重建 Copilot | 第二个应用接入工时、重复实现量 |

**与现有 Codex 的区别须被实证：** 若赋予 Codex 相同 Tool、权限、上下文，它在能力上可能做同样的事。本提案的差异化假设是**原生集成带来的工作流成本、可靠性、可追溯性、操作闭环优势**，不是模型智能的独占优势。如果 POC 测不出增益，不应另建产品。

## 3. 产品体验（To-Be 构思，不是已实现功能）

1. 用户打开任意已接入的内部页面（例如 Shop4 的一个 Time Sale Job），直接发问。
2. 应用提供最小上下文：`app_id`、业务对象/Job ID、当前筛选、用户身份与授权范围、运行/数据快照引用（有则提供）。前端可以是内嵌 UI、通用侧边栏或已有 AI 客户端；**不强制自建浏览器**。
3. 统一 Agent 根据上下文发现目标应用**已暴露、已授权**的业务 Intent/Tool，优先调用原生 `inspect` / `diagnose` / `simulate`，而非任意查询或 Shell。
4. Agent 返回根因、统计、证据、尚未核实项、修复与预期影响。必要时调用已有审批流程执行 `execute`，再通过 `verify` 核验。
5. 保留 Case 记录、来源、运行版本、执行轨迹、授权与恢复信息，供后续复盘。业务数据仍由原系统负责 Source of Truth。

**Time Sale 期望工作流：** 根据 Job ID 定位真实历史输入、`summary.json`、排除行、商业数据/库存来源与相应代码版本；对 850 条逐一分类并注明可能并存的原因；基于隔离快照模拟同步/映射修复能恢复的商品数，继续检查 Shop4 最低毛利等业务约束。不能以今天的 DB 快照冒充昨天执行时状态；历史证据缺失时明确说明，不能编造结果。

## 4. 架构方向与运行位置（候选，未决定）

```text
Web App UI / Browser / Chat Client
       | app context + user intent
       v
Shared Agent Core (model-neutral orchestration, evidence, dialogue)
       | authenticated scoped request
       +--> StoreOps native capability (Mac mini; existing Python services / Local DB)
       |
       +--> CatalogSync native capability (VPS; existing sync services / APIs / logs)
       |
       +--> other registered applications as needed
```

- **模型与执行分离：** DeepSeek、Mac mini Qwen 等只是推理候选。模型 API Key 仅让客户端调用模型，**不会自动取得生产 DB、VPS、Giga API、代码或进程权限**。模型不应接触生产 Secret。
- **原生执行位置：** 首选利用业务应用中的 Service/Repository，允许 **in-process tool adapter** 或 **同机隔离 sidecar / worker**。同进程可直接复用内部业务对象与调用上下文，但需审查阻塞、故障和资源隔离风险；sidecar 需要本地受控接口，并不会自动继承另一进程的内存/身份。
- **跨节点：** CatalogSync 的 VPS 组件若本身被授权访问 Giga / Supabase，可用现有业务调用能力处理请求；Mac mini Agent 访问 VPS 仍需要独立受控的身份、网络及审计契约，不能因为“同一 Agent”就跨越权限边界。
- **轻量业务适配：** 应用暴露有限、类型化的 Intent/Tool，并复用既有业务逻辑；不要为 Agent 复制第二套定价公式、成本计算、数据访问层或 Source of Truth。
- **薄 Context Contract：** 仅传递有业务价值、可验证的上下文；不要求所有旧应用一次性迁移框架。按需要复用 [Runtime-to-Source Mapping #15](https://github.com/retailpulses/.github/issues/15) 与现有 Registry。
- **现有 Capability Gateway 冻结边界：** [Capability Gateway Frozen Design](../capability-gateway/design.md) 已决定不再强制 Local Codex 通过通用 Gateway。**本构思不等于重启该 Gateway**；原生业务调用应 Direct-first，跨进程通信在有真实需要时才使用薄协议。

## 5. 授权与安全原则（构思约束）

- **不能等同于“直接继承生产程序的全部权限”。** Agent 的可见能力必须由调用用户身份、应用权限、业务对象范围、工具白名单和风险级别共同裁剪；应用持有高权限 Secret 不等于模型/所有用户都获授权。
- Agent 默认 **read-only**。`inspect` / `diagnose` 与只读 `simulate` 应优先复用已有服务。对价格、库存、订单、客户消息、外部 Seller、数据写入、部署等敏感操作保留明确授权与现有治理流程。
- 工具执行层验证输入、记录审计和幂等/超时/失败结果；限制长任务并避免影响生产主进程；尽量支持 Dry-run、回滚和可观察验证。
- 严格区分：页面看到的字段、数据库当前事实、执行时快照、代码主分支、**实际已部署 Commit**。这些不能相互替代。
- 面向云端 LLM 的上下文必须按权限最小化并脱敏，遵循实际数据外传与供应商合规约束。

## 6. 开源参考（候选研究，不代表技术选型）

| 项目 | 值得借鉴之处 | 对本提案的边界 |
|---|---|---|
| [Home Assistant Core](https://github.com/home-assistant/core)（Intent / LLM API） | 原生实体、服务与意图注册；统一助手调用设备能力 | 借鉴模式，不为内部电商应用引入整个 Home Assistant |
| [Pydantic AI](https://github.com/pydantic/pydantic-ai) | Python Toolset、类型化工具、依赖注入、模型适配 | 候选 StoreOps POC Runtime，验证已有服务复用难度 |
| [CopilotKit](https://github.com/CopilotKit/CopilotKit) | App UI 状态共享、交互和审批 | 主要解决界面，不取代后端业务权限与执行 |
| [MCP SDK](https://github.com/modelcontextprotocol) | 跨进程工具发现与调用协议 | 仅用于跨进程/跨系统需要；不设强制 Gateway |
| [LangGraph](https://github.com/langchain-ai/langgraph) | 长任务状态、审批与可恢复执行 | 简单 POC 可暂缓，防止过度设计 |

后续研究须核实各项目当前版本、维护状态、许可证、部署约束及与实际代码的适配成本；暂不确定框架、语言或推理服务的最终选择。

## 7. 候选 POC 与判定标准（尚未批准启动）

**POC-A：Mac mini / StoreOps / Time Sale**
- 对当前页面相关 Job，在权限内通过原生业务逻辑定位并归类约 850 条 TCOGS 排除。
- 有历史快照则完整对账；没有则可审计地报告证据缺口和不可复现边界。
- 通过独立隔离的输入数据或只读重算模拟修复效果；**禁止真实价格/库存/Seller 写入**。
- 与当前 Codex Agent 走同一案例比较：准备上下文与授权时间、诊断时间、调用/脚本数量、证据可复核性与维护改造量。

**POC-B：VPS / CatalogSync**
- 使用与 POC-A 相同的 Agent Core，另接一个最小原生能力组件；不向模型或中央服务搬运生产密钥。
- 验证跨 Runtime 身份、工具最小权限、网络联通、日志/执行结果，以及故障时隔离行为。
- 第二应用不重建 Agent、聊天 UI 或业务访问规则。以真实运行验证作为 E2E 条件，而非仅测试/代码存在。

**Go / No-go：** 原生接入能在两个不同业务应用中明确降低操作摩擦、提升诊断可验证性，且不增加不合理的生产风险或维护成本，才进入 Product Design。没有优势则优先改善既有 Codex + App Tool 方案。

## 8. 决策、假设与开放问题

### 当前共识（方向性，不代表 Sponsor 已批准实施）
- 目标是**跨业务应用复用**的一个产品，而不是每个应用各自一套 AI Copilot。
- 差异化应来自 **Application-native Context + Business Capability + Governed Execution**，不是浏览器截图识别或模型品牌。
- 先验证复用原生 Service 的价值，再考虑更复杂的编排和统一接口；不要重新引入强制 Capability Gateway。
- 设计始终区分模型推理、应用授权与业务执行。

### 关键开放问题
1. 用户身份如何可靠传递到工具执行层，并和服务账号实际权能分离？
2. 旧应用最小 Context Contract 是什么？如何避免逐产品昂贵集成？
3. 同进程嵌入与同机 Sidecar 的资源、可用性和风险取舍如何？
4. 哪些业务 Service 已能作为只读诊断 Tool 暴露，哪些需要提取成可复用的函数？
5. 历史 Job、数据快照和部署 SHA 的追溯链是否足以支持 Time-travel Debugging？
6. DeepSeek 云端处理数据的许可与成本、Mac mini 本地模型的可靠性是否适配？
7. 能否构成真实业务价值而不是“一个带更多 Tool 的 Codex”？将以实际操作对照实验检验。
8. 若未来产品对外提供，租户隔离、审计及业务权限模型是否足够普适？

## 9. References（明确来源）

**内部实际源：**
- [Time Sale README / 数据来源与新鲜度规则](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/README.md)
- [Time Sale 商业快照实现](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/commercial_snapshot.py)
- [Time Sale 排除逻辑](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/timesale/service.py)
- [CatalogSync VPS 部署说明](https://github.com/retailpulses/CatalogSync/blob/main/deploy/vps/README.md)
- [.github Runtime-to-Source Mapping #15](https://github.com/retailpulses/.github/issues/15)
- [.github Developer Capability Baseline #38](https://github.com/retailpulses/.github/issues/38)
- [Capability Gateway 既有冻结决定](../capability-gateway/design.md)
- [.github Documentation Standard（Pilot）](../../engineering/DOCUMENTATION_STANDARD.md)

**外部设计类比与技术参考：**
- [Apple App Intents](https://developer.apple.com/documentation/appintents)
- [Home Assistant developer docs](https://developers.home-assistant.io/docs/core/llm/)
- [Pydantic AI](https://ai.pydantic.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

> **文档与状态管理：** 本文件作为初期思考与未来 Design 的参考来源保留；Issue #76 是讨论和后续决策的发现入口。若形成 Approved Product Design，应把已确认的产品目标、业务行为、取舍与引用整理进入唯一正式设计权威，不把本 Ideation 当作第二套有效设计文档。
