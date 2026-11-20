# Engineering Stack Registry

**状态：** Pilot（初始登记）
**范围：** 为 Engineer 与 Agent 提供可复用能力的**工具栈**——运行时之外的另一层："某类日常工程操作以什么方式被稳定执行"。

本目录登记工程/工具栈：一条栈 = 一个能独立交付能力的组件组合（运行时 + 入口 + 依赖 + 数据边界 + 运维方式）。它回答"这类操作怎么被安全、可重复地做"，不回答"某个服务部署在哪里"。

## 与既有目录的边界

| 目录 | 记录什么 | 不记录什么 |
|---|---|---|
| [`docs/runtime-strategy.md`](../../docs/runtime-strategy.md) | 部署运行族（Worker / VPS Node / Python Cron / 静态前端 / Actions） | 工程操作方式 |
| [`infrastructure/`](../../infrastructure/README.md) | 平台资产、实例、凭据入口与现场核实状态 | 使用这些资产的上层工具 |
| [`products/`](../../products/) | 产品设计、Current State 与能力 | 跨产品的工具栈 |
| `engineering/stacks/`（本目录） | 工程/工具栈：组合方式、入口、安全边界、验证证据 | 产品行为、运行状态、凭据值 |

## 状态定义

- **Pilot** — 已在本机（或指定环境）实测可用，尚未作为组织标准推广；采用与否由使用者判断。
- **Standard** — 经评审并被采纳为默认方式。
- **Retired** — 停止使用，保留记录与替代方案链接。

## 登记要求

每个栈一个目录 `engineering/stacks/<slug>/`，至少包含：

- `README.md` — 栈记录：状态、形态、入口、组成、前置条件、数据边界、运维与排障、验证记录、限制。
- `design.md` — 基础设计：目标 / 非目标、架构、数据流、关键取舍、接口契约、安全模型、后续工作。

记录必须区分**已实测**与**未验证**；没有本机证据的条目不得标 `Pilot`。凭据只登记名称与获取路径，不记录值。

## 索引

| 栈 | slug | 状态 | 形态 | 入口 |
|---|---|---|---|---|
| 本地 Supabase 访问 | [`supabase-local`](supabase-local/README.md) | Pilot（2026-11-17 本机实测） | DeepSeek Harness Host 插件 | `supabase_query`、`supabase_schema`、`supabase_status` |
| Zoho Mail 访问 | [`zoho-mail`](zoho-mail/README.md) | Pilot（2026-11-18 本机实测） | DeepSeek Harness Host 插件 | `zoho_mail_status`、`zoho_mail_folders`、`zoho_mail_list`、`zoho_mail_search`、`zoho_mail_read`、`zoho_mail_send`、`zoho_mail_update`、`zoho_mail_attachment`、`zoho_mail_connect` |
| GigaB2B Open API 2.0 访问 | [`gigab2b`](gigab2b/README.md) | Pilot（2026-11-20 本机实测） | DeepSeek Harness Host 插件 | `giga_status`、`giga_inventory`、`giga_price`、`giga_products`、`giga_product_detail`、`giga_order_status`、`giga_tracking`、`giga_dropship_sync` |
