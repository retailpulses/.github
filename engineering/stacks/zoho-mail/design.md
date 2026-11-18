# zoho-mail — Design

**状态：** Pilot · **版本：** v0.1 · **日期：** 2026-11-18
**Owner：** Engineering（本地 Agent 工具链）
**性质：** 本机 Agent 工具栈，读取生产共享邮箱；发送/状态变更属生产敏感操作，不改变既有 Runtime 或部署方式。
**配套：** [栈记录](README.md) · [插件说明](plugin/README.md) · [Credential Access Guide](../../../infrastructure/credentials/ACCESS_GUIDE.md)

## 1. 背景与问题

Agent 在处理 Mercari Shops / Amazon 买家咨询、订单通知与运营邮件时，需要直接读取 Zoho Mail。过去只能临时拼 `curl` 调 Zoho REST API：

```bash
curl "https://mail.zoho.com/api/accounts/<id>/messages/view?folderId=<fid>&limit=10" \
  -H "Authorization: Zoho-oauthtoken <access_token>"
```

这条路径有四个稳定问题：

1. **每次重建**：账号 id、文件夹 id、分页、token 刷新都要重新推导，容易把 19 位 id 当成 JavaScript number 而静默舍入。
2. **token 生命周期**：access token 约 1 小时过期，手工刷新容易把 client secret 写进 shell history。
3. **没有边界**：随手 `curl` 无法区分读取与发送；也没有下载目录、收件人白名单等约束。
4. **结果形态差**：原始 JSON 字段（`status`、`hasAttachment`、HTML entity）需要人工解释，正文是 HTML。

现有 `retailpulses/mail-integration` Worker 只做入站同步（Amazon/Mercari 邮件 → 数据库），不提供通用读信/发信接口，也不暴露给 Agent。因此需要一个面向对话的 Agent 工具栈。

## 2. 目标与非目标

**目标**

- 在对话中完成 Zoho Mail 的账号/文件夹发现、列表、搜索、读取、附件下载、发送/回复、状态变更。
- OAuth refresh token 自动换 access token；凭据不进入对话、日志或仓库。
- 19 位 Zoho id 全程按字符串/原始数字处理，不丢失精度。
- 兼容两种既有授权形态：完整 scope 的 Self Client，以及 `mail-integration` 式 messages-only token。
- 失败信息可操作（缺少 scope、token 失效、限流、找不到邮件）。
- 发送有显式门禁：`dryRun`、`allowSend`、`allowedRecipients`。

**非目标**

- 不替代 Zoho Mail Web UI 的人工操作。
- 不做邮件归档/合规留存、全文索引或定时同步。
- 不覆盖 Zoho Calendar、Contacts、Tasks。
- 不做组织级审批流；审批属于 Host/调用方能力，见 §7。
- 不把凭据注册表当作运行时依赖；注册表只是授权来源之一。

## 3. 架构

```
Agent ── tool call ──► DSH Host 插件（plugin/index.js，inject: tools）
                          │
                          ├─ resolveSettings()
                          │    ├─ config / 环境变量
                          │    └─ credentials/zoho.json（0600）
                          │
                          ├─ getAccessToken()
                          │    └─ POST accounts.zoho.com/oauth/v2/token
                          │         grant_type=refresh_token
                          │
                          └─ Zoho Mail REST（mail.zoho.com/api）
                               ├─ /accounts
                               ├─ /accounts/{id}/folders
                               ├─ /messages/view · /messages/search
                               ├─ /folders/{fid}/messages/{mid}/content|details|attachmentinfo
                               ├─ /messages（发送）· /messages/{mid}（回复）
                               ├─ /updatemessage（标记/移动/归档/垃圾）
                               └─ /folders/{fid}/messages/{mid}（删除）
```

选型理由：DSH 原生 Host 插件比额外跑一个 MCP server 更轻，工具 schema、错误与展示卡片都在同一进程；Zoho REST 比 IMAP/SMTP 更适合结构化文件夹、搜索与附件，也避免申请应用专用密码。

## 4. 数据流

**配置解析（每次调用）**
优先级：显式 config > 环境变量 > `credentials/zoho.json`。region 默认 `com`；若用户未显式配置 region，凭据文件里的 region 优先。`accountId` 与 `email` 可来自 config、`ZOHO_ACCOUNT_ID`/`ZOHO_MAIL_ADDRESS` 或凭据文件。

**取 token**
1. 进程内缓存 access token；有效期取 `expires_in - 60s`。
2. 缓存未命中时用 refresh token 换新 token；失败按 `invalid_client` / `invalid_code` / `invalid_refresh_token` 给出不同提示。
3. API 返回 401 时清缓存、重试一次；再次失败则抛错。

**账号解析**
- 配置了 `accountId`：直接构造 account 对象，跳过 `/accounts`，因此 messages-only token 也能工作。
- 未配置：`GET /accounts`，按 `email` 匹配 primary/alias，否则取第一个账号。

**列表 / 搜索**
- 有 folders scope：`GET /folders` 解析文件夹名/类型/id，`GET /messages/view?folderId=...`。
- 无 folders scope：回退到 `GET /messages/view`（不带 folderId，Zoho 返回 Inbox），并在结果里标记 `folder.scopeFallback: true`。
- 搜索：`GET /messages/search?searchKey=...`，使用 Zoho 搜索语法。

**读取**
1. `details` 取元数据，`content` 取 HTML，`attachmentinfo` 取附件列表（三者并行）。
2. 可选 `header?raw=false` 取 SPF/DKIM/Message-ID 等原始头。
3. HTML 经保守的标签剥离与 entity 解码生成 `text`；原 HTML 一并返回。
4. 缺少 `folderId` 时按 Inbox → 自定义 → Sent → Archive → Spam → Trash 顺序最多扫描 15 个文件夹定位。

**发送 / 回复**
1. 校验 from 属于账号 primary/alias；校验 to/cc/bcc 格式与 `allowedRecipients`。
2. 附件先 `POST /messages/attachments?uploadType=multipart`，拿到 `attachmentName`/`attachmentPath`/`storeName`；总大小上限 25 MB。
3. `POST /messages`；回复走 `POST /messages/{messageId}` + `action: "Reply"`。
4. `dryRun` 在真正上传/发送前返回预览。

**状态变更**
`PUT /updatemessage`，mode 映射：`markAsRead`、`markAsUnread`、`archiveMails`、`unArchiveMails`、`moveToSpam`、`markNotSpam`、`moveMessage`。删除走 `DELETE /folders/{fid}/messages/{mid}?expunge=`。批量上限 50 条。

**附件下载**
先取 `attachmentinfo` 找到 attachmentId，再以 `Accept: application/octet-stream` 取二进制；写入 `downloadsDir`，拒绝路径穿越，冲突加序号，权限 `0600`。

## 5. 关键取舍

| 决策 | 选择 | 放弃的替代 | 原因 |
|---|---|---|---|
| 集成形态 | DSH Host 插件 | MCP server / 独立 CLI | 少一个进程与传输层；工具 schema、错误与展示都在 Host 内 |
| 传输 | Zoho Mail REST | IMAP/SMTP | 结构化文件夹/搜索/附件；OAuth 而非应用专用密码 |
| 代码位置 | 随仓库 `plugin/` 维护 | 仅登记工作区外部路径 | 能力记录与实现同仓，可复现；代价是需同步工作区副本 |
| 凭据 | 本地 `0600` JSON | 运行时读凭据注册表 | 无数据库依赖、可离线；代价是轮换需重新导入 |
| 账号解析 | `accountId` 可跳过 `/accounts` | 始终调 `/accounts` | 兼容 messages-only token；代价是失去 alias 自动发现 |
| 文件夹缺失 | 回退无 folderId 的 Inbox | 直接报错 | 既有 token 可继续读信；代价是只能读 Inbox |
| ID 处理 | 原始数字串拼 JSON | `JSON.stringify(number)` | 19 位 id 超出安全整数范围，必须保精度 |
| 读取定位 | 无 folderId 时扫描 15 个文件夹 | 要求调用方必须先列表 | 降低使用门槛；代价是慢邮箱下多几次请求 |
| 工具粒度 | 9 个语义化工具 | 一个通用 `zoho_api` | 参数可校验、权限可分级、错误更可读 |

## 6. 接口契约

| 工具 | 参数 | 返回 | 失败 |
|---|---|---|---|
| `zoho_mail_status` | 无 | `{configured, authenticated, region, account, folders[], foldersAvailable, warnings?, setup?}` | 未配置/未授权返回结构化状态，不抛 |
| `zoho_mail_folders` | `accountId?` | `{account, accounts[], folders[], count}` | scope 缺失返回 `foldersAvailable: false` |
| `zoho_mail_list` | `folder?`, `limit?`, `start?`, `unreadOnly?`, `sort?` | `{account, folder, messages[]}` | 文件夹不存在、scope 不足、限流 |
| `zoho_mail_search` | `searchKey`, `limit?`, `start?` | `{account, searchKey, messages[]}` | 空查询、限流 |
| `zoho_mail_read` | `messageId`, `folderId?`, `includeHeaders?` | `{subject, from, to, html, text, attachments[], headers?}` | 找不到邮件、scope 不足 |
| `zoho_mail_send` | `to`, `subject`, `body`, `cc?`, `bcc?`, `from?`, `format?`, `attachments?`, `replyToMessageId?`, `dryRun?` | `{sent, preview?}` 或发送结果 | 收件人非法、白名单拒绝、附件超限、发送失败 |
| `zoho_mail_update` | `action`, `messageIds[]`, `folderId?`, `destinationFolderId?`, `expunge?` | `{action, deleted[]/failed[]}` 或状态结果 | 未知 action、缺 folderId、部分失败 |
| `zoho_mail_attachment` | `messageId`, `folderId?`, `attachmentId?`, `filename?` | 附件列表或 `{path, sizeBytes, contentType}` | 附件不存在、下载失败、路径越界 |
| `zoho_mail_connect` | `grantCode`, `clientId?`, `clientSecret?`, `region?`, `redirectUri?`, `accountId?`, `email?` | `{connected, accounts[]}` | code 过期、client 不匹配 |

所有工具输出可 JSON 序列化；`render` 统一输出缩进 JSON，未做定制 UI 卡片。

## 7. 安全模型

| 层 | 机制 | 覆盖 |
|---|---|---|
| 1 | 凭据文件 `0600` + `plugin/.gitignore` | 仓库与本地误读 |
| 2 | refresh token 换 access token，access token 仅内存 | 长期 token 不进入每次请求 |
| 3 | `allowSend` / `allowedRecipients` / `dryRun` | 误发送与收件人越界 |
| 4 | 下载目录固定 + 文件名清洗 + 路径检查 | 任意文件写入 |
| 5 | 原始数字 id | 错误 id 导致误操作其他邮件 |
| 6 | 错误信息不包含 secret，只报告缺失字段 | 对话/日志泄露 |

**未覆盖：** 插件在 Host 进程直接 `fetch`，不受 bash 工具沙箱/审批约束；没有二次确认弹窗；refresh token 明文落盘；HTML 正文未净化，属不可信外部内容；`ZohoMail.messages.ALL` 包含删除权限，scope 未做最小化拆分。因此本栈只应在受控操作员账户下使用，发送/删除前由调用方确认。

## 8. 与既有 `mail-integration` 的兼容

归档的 [mail-integration](https://github.com/retailpulses/mail-integration) 与当前 `workers/packages/mail-integration` 使用同一 US 数据中心和同一组 env 名称。本栈刻意保持兼容：

- 支持 `ZOHO_CLIENT_ID`、`ZOHO_CLIENT_SECRET`、`ZOHO_REFRESH_TOKEN`、`ZOHO_ACCOUNT_ID`、`ZOHO_MAIL_ADDRESS`。
- 配置 `accountId` 时跳过 `/accounts`，因此只有 messages scope 的 token 也能读 Inbox。
- folders scope 缺失时回退无 folderId 列表；读取/更新/发送使用消息结果里的 `folderId`。
- 不读取、不导出 Worker 的 secret；凭据只来自 Credential Registry 或用户显式导入。

## 9. 后续工作（未承诺）

1. 接入 `ctx.credentials` 或以注册表为运行时来源，支持轮换而不落明文文件。
2. 发送/删除接入 Host 审批或二次确认，补齐第 3 层缺口。
3. 增加 429 重试与退避、请求预算；当前只返回错误。
4. 增加 `originalmessage`（MIME）与批量附件下载，支持工单取证。
5. 搜索结果分页与 receivedTime 增量游标，支持大邮箱同步。
6. 多账号路由：同一授权下按 alias 选择发件身份与默认签名。

## 10. 验证摘要

2026-11-18 本机实测：插件加载 9 个工具；mock API 17 项检查通过；真实连接共享邮箱，12 个文件夹；真实列表 3 封 Inbox 邮件；真实读取 1 封完整 HTML/纯文本。发送、状态变更、附件上传/下载仅 mock 覆盖，未对生产邮箱执行。完整用例与未验证项见[栈记录](README.md#验证记录2026-11-18本机)。
