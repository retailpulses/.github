# google-workspace — Design

**状态：** Pilot · **版本：** v0.1 · **日期：** 2026-11-18
**Owner：** Engineering（本地 Agent 工具链）
**性质：** 本机 Agent 工具栈，读写生产 Google Drive；不改变既有 Runtime 或部署方式。
**配套：** [栈记录](README.md) · [接入配置](mcp/README.md)

## 1. 背景与问题

Shop4 商品组策略、Giga 比价、社保证明等运营资料已经沉淀在 Google Drive（见 `docs/mercari/` 中多处 Drive 链接），但 Agent 侧只有两个选择：

1. **人工贴链接**：把 Drive URL 给 Agent，靠 `web_fetch` 抓公开页——需要文件是"知道链接即可访问"，且拿不到文件夹列表、搜索、写入。
2. **手工 `curl` Google API**：要自己处理 OAuth 授权码、refresh token、`fields` 投影与分页，一次性的成本远高于收益。

2026-11-17 已在 DSH profile 中登记 `workspace-mcp` 的 MCP server 条目，但**从未完成授权**：`client_secret.json` 缺失，每个工具调用都以 `OAuth client credentials not found` 失败。即"装了但不可用"。

所以本栈要解决的不是"如何调用 Drive API"，而是"如何把一次性的 Google 授权做成可重复、可审计、边界明确的 Agent 能力"。三个具体障碍：

- **授权只能由账号持有人完成**：Desktop OAuth client 必须在该账号的 Google Cloud 项目里创建，无法随插件分发。
- **同意屏类型受账号身份限制**：非 Workspace 账号不能选 `Internal`，只能 `External`；`External` + `Testing` 的 refresh token 每 7 天过期。
- **发布门槛不可见**：`External` 应用要进 production 才能去掉 7 天过期，但 Publish 按钮只给一句 "complete your configuration on the Branding page"，不说是哪个字段。

## 2. 目标与非目标

**目标**

- 在对话中完成 Drive 的搜索、列目录、读正文、导出、建文件/文件夹、取共享链接。
- 授权状态可自检：失败时能区分"没有凭据文件"、"token 过期"、"API 未启用"、"账号无该服务"。
- 凭据不进对话、日志与仓库；仓库只留接入配置与流程。
- 一次性解决 7 天过期问题，使日常使用无需周期性重新授权。
- 保持与既有栈一致的记录格式，便于索引与交接。

**非目标**

- 不替代 Google Drive Web UI 的人工操作。
- 不做 Drive 同步盘、离线镜像或批量迁移。
- 不实现多用户/多租户授权（`--single-user` 固定一个账号）。
- 不在本仓库维护上游 `workspace-mcp` 代码；升级跟随 PyPI。
- 不覆盖 Gmail/Calendar 的可用性——本账号没有这两项服务，属账号事实而非栈缺陷。

## 3. 架构

```
Agent ── tool call ──► DSH MCP client（@deepseek-ai/dsh-mcp-client）
                          │  transport: stdio
                          │  serverName: google_workspace
                          ▼
                       workspace-mcp 2.5.0（本机 .venv/bin/workspace-mcp）
                          ├─ auth：client_secret.json → InstalledAppFlow
                          │        → 回环 127.0.0.1:8000/oauth2callback
                          ├─ store：credentials/<email>.json（refresh token，0600）
                          ├─ services：再次调用时按 scope 从文件恢复 Credentials
                          └─ Google APIs（Drive / Docs / Sheets / Slides / …）
```

**为什么是 MCP server 而不是 vendored Host 插件？**

`zoho-mail` 与 `supabase-local` 选择 Host 插件，是因为 API 面窄、需要精细的工具契约与边界。Google Workspace 相反：11 个服务、40+ 个工具、OAuth 流程与 token 刷新都由上游维护。自己重写等于维护一个与上游赛跑的 OAuth 实现，收益只有"少一个进程"。因此本栈反过来：**上游提供能力，仓库固化接入与边界**。

## 4. 数据流

**首次授权**

1. 调用任一 Google 工具 → server 读到 `GOOGLE_CLIENT_SECRET_PATH` 指向的 `client_secret.json`。
2. 生成 `authorization_url`（`access_type=offline`、`prompt=consent`、`login_hint=<email>`、PKCE），并在 stdio 模式下自动 `webbrowser.open`。
3. 浏览器完成同意 → 回调 `http://localhost:8000/oauth2callback` → 交换 code → 写 `credentials/<email>.json`。
4. 工具调用返回 "ACTION REQUIRED"，重试即成功。**注意：这个失败是设计内的**——它把授权 URL 交给调用方，而不是静默挂起。

**日常调用**

1. 从 `credentials/<email>.json` 载入 `Credentials`。
2. 未过期直接用；过期则用 refresh token 换 access token 并回写。
3. 按工具构造对应 service（`build('drive','v3',credentials=...)`）并发请求。

**授权状态机**

| 状态 | 表现 | 处置 |
|---|---|---|
| 无 client_secret.json | 调用即报 `OAuth client credentials not found` | 放文件 |
| 有 client_secret，无 token | 返回授权 URL | 浏览器授权 |
| token 有效 | 正常返回 | — |
| token 被撤销/过期 | 401 或返回授权 URL | 删 token 文件后重新授权 |
| API 未启用 | 403 `accessNotConfigured` | 项目内启用该 API |
| 账号无该服务 | 403 `notACalendarUser` / `Mail service not enabled` | 无法修复；换服务或换账号 |

## 5. 关键取舍

| 决策 | 选择 | 放弃的替代 | 原因 |
|---|---|---|---|
| 能力来源 | 上游 `workspace-mcp`（MCP） | 自写 Host 插件 | 11 服务 40+ 工具由上游维护；自写等于长期追平 OAuth 与 API 变更 |
| 工具范围 | `--tool-tier core`（43 工具） | `--tools drive docs sheets slides` | 先要"能用"，收窄留作后续；代价是上下文与 scope 变大 |
| OAuth 客户端 | 自己的 Desktop client | 第三方托管授权（Composio/Pipedream 等） | 文件与邮件不出本机；代价是要自己建一次客户端 |
| 同意屏类型 | `External`（账号非 Workspace 成员） | `Internal` | `Internal` 在该账号下不可选，非偏好 |
| 发布状态 | 已发布 production、不提交验证 | 留在 `Testing` | `Testing` 的 refresh token 7 天过期，日常使用不可接受；未验证的代价是授权时多一次警告与 100 用户上限 |
| 凭据存放 | 本机 `0600` 文件 + profile 环境变量指向 | 系统 Keychain / 凭据注册表 | MCP server 只认文件与环境变量；注册表可作为后续统一入口 |

**关于 Publish 门槛的实测结论：** Publish 是服务端完备性检查。字段全部合法且 `Save` 可用时按钮仍可能为 disabled；本例中唯一缺项是 **公开可达的 privacy policy URL**。补上真实隐私政策链接后按钮立即启用。此结论与 Google 开发者论坛的多份报告一致（该检查不会指出缺哪一项）。

## 6. 接口契约

**Namespace：** `mcp__google_workspace__<tool>`

**返回值形态：** 上游把结果渲染成面向 LLM 的文本（文件名、ID、类型、大小、时间、链接），不是原始 JSON。需要原始结构时用 `includeRaw` 类参数（部分工具提供）。

**错误分类（调用方应能区分）**

| 文本特征 | 含义 |
|---|---|
| `OAuth client credentials not found` | 缺 `client_secret.json` |
| `ACTION REQUIRED ... Authorization URL` | 需要授权，按 URL 走一次 |
| `accessNotConfigured` | 项目未启用该 API |
| `notACalendarUser` / `Mail service not enabled` | 账号无该服务 |
| `insufficientPermissions` | scope 不足（通常是收窄 `--tools` 后旧 token 未覆盖） |

**幂等性：** 读取类工具幂等；`create_*`、`import_*`、`modify_*` 非幂等，重试会产生新文件或重复写入。

## 7. 安全模型

- **秘密边界**：`client_secret.json` 与 `credentials/*.json` 只在本机，权限 `0600`，由 `mcp/.gitignore` 排除。仓库只记录变量名与路径模式。client secret 一旦泄漏需在 Cloud Console 重置（重置后旧 token 仍有效，但新授权需新 secret）。
- **Scope 即能力**：token 内含 `drive` 全量与 `gmail.*`/`calendar.*`。收窄能力只能靠改 `--tools` 并重新授权，不能靠"不调用"。
- **未验证应用的现实**：授权页会显示 "Google hasn't verified this app"，用户必须点 "Go to DSH Drive (unsafe)"。这不是可绕过的配置项，而是未提交验证的必然结果；对单人自用可接受，对多人分发不可接受。
- **用户上限**：未验证 + 敏感 scope 的项目有 100 用户终身上限，不可重置。因此不能把该 client 当组织级共享凭据。
- **写操作纪律**：按 [AGENTS.md §3](../../../AGENTS.md)，删除、批量移动、权限/共享变更需显式确认并说明回滚路径；本栈不实现审批流。

## 8. 后续工作

1. **收窄工具层**：确认日常只用 Drive/Docs/Sheets/Slides 后，改为 `--tools drive docs sheets slides`，重新授权，把 scope 与工具数一起降下来。
2. **凭据统一**：把 client secret 与 refresh token 迁到凭据注册表（`infrastructure/credentials/ACCESS_GUIDE.md` 的路径），profile 只保留注册表查询，不在磁盘留明文 JSON。
3. **文档口径**：`docs/mercari/` 中的 Drive 链接应逐步改为"栈 + 文件 ID"的可解析引用，减少人工贴链接。
4. **验证请求（可选）**：若该栈需要给第二个人用，则必须提交 OAuth 验证，否则 100 用户上限与未验证警告不可接受。
5. **Gmail/Calendar 替代**：邮件已由 `zoho-mail` 覆盖；Calendar 若需要，应在 Google Workspace 侧真正开通服务，或另立栈对接实际在用的日历系统。
