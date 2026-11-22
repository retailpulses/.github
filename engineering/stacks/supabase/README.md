# 栈记录：supabase

> 索引：[Engineering Stack Registry](../README.md) ／ 设计：[design.md](design.md)
> 取代：`engineering/stacks/supabase-local/`（v0.1，仅本地、默认只读）。本记录与设计自 2026-11-22 起定义 v1.0；v1.0 已实施，并于同日完成首次云端写入验证。

## 概览

| 项 | 值 |
|---|---|
| 状态 | Pilot。本地传输 2026-11-17 实测；云连接事实 2026-11-22 只读核实；v1.0 于 2026-11-22 实施：`local` 只读、`cloud` 读写（`rp_agent_readwrite`，`confirm`）已实测 |
| 形态 | DeepSeek Harness Host 插件，向 Agent 暴露 4 个工具 |
| 目标 | 具名 targets：`local`（默认）、`cloud`、`cloud-admin`（可选）、`macmini`（可选） |
| 入口 | `supabase_query`、`supabase_schema`、`supabase_status`、`supabase_targets` |
| 运行前提 | Docker Desktop（两种传输都借用容器内 `psql`）；云目标另需可用的池化器网络路径 |
| 是否生产 | 可指向生产。默认只读；写入需 `write: true` + `confirm: true`；DDL 只在 `cloud-admin` |

## 能力

| 工具 | 作用 | 关键约束 |
|---|---|---|
| `supabase_query` | 执行一条 SQL；SELECT 系返回带类型 JSON 行 | 默认只读；写入需 `write: true` 且目标允许；`maxRows` 默认 200 并标记截断 |
| `supabase_schema` | 列出表/视图、字段、类型、默认值、RLS、估算行数 | 只读；`estimated_rows` 来自 `pg_stat_user_tables`，是估算不是精确值 |
| `supabase_status` | 逐目标探测连通性、版本、库大小、连接数、uptime、TLS、写权限 | 只读；失败返回 `reachable: false` + 原因，不中断对话 |
| `supabase_targets` | 列出已配置目标与策略 | 只读；不返回任何凭据 |

## 目标与传输

| 目标 | 传输 | 身份 | 用途 |
|---|---|---|---|
| `local` | `docker exec supabase_db_<project> psql`（peer 认证） | `postgres` | 运行 DSH 的这台机器上的本地开发库 |
| `cloud` | TCP → Supavisor 池化器 | `rp_agent_readwrite.<ref>` | 生产读写（DML），无 DDL |
| `cloud-admin` | TCP → 同一池化器 | `postgres.<ref>` | 仅 schema 变更；可选、默认不安装 |
| `macmini` | TCP → `rpagents-mac-mini.tail220e8d.ts.net:54322` | `postgres` | 从笔记本经 tailscale 访问 Mac mini 开发栈 |

传输不改变 SQL 语义：只读门禁、`json_agg` 包裹、截断、`--csv` 写入输出均沿用 v0.1。

## 云连接事实（2026-11-22 核实）

| 事实 | 值 | 证据 |
|---|---|---|
| 项目 | `gqeyfhshxdiyhugvmbuk`（Retailpulses Project） | Management API `/v1/projects/<ref>` |
| 区域 | **`ap-northeast-2`** | 同上（`region`） |
| 状态 / 版本 | `ACTIVE_HEALTHY`；PostgreSQL 17.6；库约 3045 MB | 同上 + 只读 SQL |
| 直连主机 | `db.<ref>.supabase.co` 只有 AAAA 记录 | `dig A` 为空 |
| 本机与 Mac mini 全局 IPv6 | 均为 0 | `ifconfig` |
| 直连结果 | `No route to host` | `nc -6 … 5432` |
| **正确池化器主机** | **`aws-1-ap-northeast-2.pooler.supabase.com`** | 该主机到达租户（仅报密码错误）；`aws-0-ap-northeast-2`、`aws-0-ap-northeast-1` 均报 `tenant/user … not found` |
| 池化器端口 | 5432 会话模式 / 6543 事务模式，本栈统一 5432 | 两端口均连通 |
| TLS | TLSv1.3，`sslmode=require` | `\conninfo` |
| 项目角色形式 | `<role>.<ref>` 受支持 | 不存在的角色返回 `(EAUTHQUERY) user not found in the database` |

**因此：直连 `db.<ref>` 在本组织两台机器上都不可用，云访问必须走池化器。**

### 两个会静默改变安全语义的行为

1. **池化器不转发 libpq startup `options`。** `PGOPTIONS=-c default_transaction_read_only=on` 在 5432 与 6543 上都被忽略——实测 `create temp table` 成功。v0.1 依赖的"数据库层只读兜底"在云端会消失，只剩关键词门禁。v1.0 因此把只读与超时改写进 SQL（`BEGIN READ ONLY`、`SET LOCAL statement_timeout`），实测两端口都能拒绝写入。
2. **`pg_stat_ssl` 在池化器后面显示 `ssl=false`。** 这是池化器终止 TLS 的正常表现，不能据此判断链路未加密；以客户端 `\conninfo` 的 `SSL connection` 为准。

## 角色模型

| 角色 | 超级用户 | BYPASSRLS | 现状 |
|---|---|---|---|
| `rp_agent_readonly` | 否 | 是 | 已存在：`public` 的 `SELECT`，另含 `public.inquiries` 的 `UPDATE` |
| `rp_agent_readwrite` | 否 | 是 | 已建 2026-11-22：`public` 的 DML + 序列、`storage` 只读、`pg_monitor`；**`auth` 不可读**（见下） |
| `postgres` | 是 | 是 | 仅 `cloud-admin` 目标使用 |

- 写角色**不授予 `public` 的 `CREATE`**：DDL 在配置层（`ddl: false`）与数据库层同时被拒（实测 `permission denied for schema public`）。
- `auth` 与部分 `storage` 表由 Supabase 自有管理角色持有，`postgres` 无授予权限，因此 `grant` 只发出警告、实际未生效；`auth` 缺少 schema `USAGE`，写角色读不到它。需要读 auth 时应改用 `cloud-admin`，不要放宽本角色。
- `BYPASSRLS` 沿用现有 `rp_agent_*` 约定，代价是 RLS 不构成兜底；控制点因此落在插件门禁与审计上。
- 待清理项（不属本栈范围）：`rp_agent_readonly` 名称与 `public.inquiries` 的 `UPDATE` 授权不一致，需要单独裁决。

## 数据边界

- **只读默认**：非 `SELECT`/`WITH`/`VALUES`/`TABLE`/`SHOW`/`EXPLAIN` 在发往数据库前即被拒绝。
- **数据库层兜底**：只读事务 `BEGIN READ ONLY`，对池化器与直连同样有效；只读请求另设 `statement_timeout`/`lock_timeout`。
- **写入**：需目标 `mode: read-write` + `write: true` + `confirm: true`，并通过 `guard` 正则与"无 WHERE 的 UPDATE/DELETE"启发式；多目标时必须显式指定 `target`。
- **原子性**：写入包在 `BEGIN … COMMIT` 内，`ON_ERROR_STOP` 失败即整体回滚（v0.1 可能部分生效）。
- **DDL**：仅在 `ddl: true` 的目标（`cloud-admin`）允许，且默认 `guard` 拒绝 `drop database`、角色变更、`alter system`。
- **审计**：每次放行的写入在插件 `.state/writes.jsonl` 追加一行（时间、目标、角色、语句类型、SQL 哈希与 200 字符预览、命令标签、耗时），不含数据值与凭据。
- **权限说明**：`postgres` 目标绕过 RLS；`rp_agent_readwrite` 因 `BYPASSRLS` 同样绕过，**不代表** `anon` 或登录用户的真实可见性。

## 凭据

只登记名称与路径，不记录值。

| 目标 | 凭据名 | 存放 |
|---|---|---|
| `cloud` | `rp_agent_readwrite` 的密码 | 插件 `credentials/supabase.json`（0600）或环境变量 `SUPABASE_CLOUD_DB_PASSWORD` |
| `cloud-admin` | `postgres` 的密码 | 同上，独立条目 |
| `local` / `macmini` | 无（peer 认证 / 本地栈默认口令） | — |

- 密码以 0600 `.pgpass` 临时文件挂载进容器（`PGPASSFILE`），**不进 argv、不进宿主机环境变量**，用后即删。
- 规范查找路径仍是 [Credential Access Guide](../../../infrastructure/credentials/ACCESS_GUIDE.md)。`20_REPOS/master_credentials.md` 仅为历史兼容指针，且其中 `SUPABASE_POOLER_HOST` 写的是 `aws-0-ap-northeast-1`，**该值对本项目是错误的**（见上表）。
- 本文件与 `design.md` 不写入任何密钥；插件代码在错误信息里对密码做脱敏。

## 运维手册

| 场景 | 操作 |
|---|---|
| 安装 / 重装 | `plugin_manager` → `install_bundle`，target 指向工作区的 `supabase/` 绝对路径 |
| 升级 | 改代码后重装；替换已安装包需重启 Harness 才能加载新的 ESM 模块 |
| 停用 | `plugin_manager` → `set_plugin`（id `supabase`）设为 disabled |
| 从 v0.1 迁移 | 安装新包后禁用旧 `supabase-local` 行；工具名未变，旧会话提示词无需改写 |
| 切换目标 | 在插件 config 的 `targets` 下按名覆盖；`defaultTarget` 决定省略 `target` 时的落点 |
| 池化器报 `tenant/user … not found` | 区域或 `<role>.<ref>` 写错；用 Management API 复核 `region`，注意本项目是 `ap-northeast-2` |
| 排障 | 先调 `supabase_status`；`reachable: false` 时读 `error`（Docker 未启动 / 容器未运行 / 多栈歧义 / 网络不可达） |

常见错误：

- `Docker CLI not found ...` —— Docker 未安装或不在候选路径。
- `... is not running: supabase_db_x (exited)` —— 本地栈已停，需 `supabase start`。
- `More than one local Supabase stack is running` —— 多项目并存，需指定 `project` / `container`。
- `Refusing to run a DELETE statement ... without write: true` —— 只读门禁生效，属预期。
- `Target cloud refuses DDL (ddl: false)` —— 用 `cloud-admin` 或走迁移。

## 验证记录

### 2026-11-17（v0.1，Mac mini）

`supabase_status` 可用；`supabase_schema` 正确列出 `public.office_stock_events` 及 9 个字段；只读拦截生效；`write: true` 建临时表无残留；250 行截断为 200 并标记。

### 2026-11-22（v1.0 设计期，只读核实）

| 用例 | 结果 |
|---|---|
| Management API 读取项目区域 | `ap-northeast-2`、`ACTIVE_HEALTHY` |
| 池化器租户定位（错误口令区分） | `aws-1-ap-northeast-2` 到达租户；`aws-0-ap-northeast-2`、`aws-0-ap-northeast-1` 未找到 |
| 云只读连接 | 成功；`ssl=false`（池化器终止 TLS），`\conninfo` 显示 `TLSv1.3` |
| `PGOPTIONS` 只读经池化器 | **未生效**：`create temp table` 成功 |
| `BEGIN READ ONLY` 经池化器（5432 / 6543） | 生效：拒绝 `create temp table` |
| `PGOPTIONS` 超时经池化器 | 未生效 |
| `SET statement_timeout` 经池化器 | 生效：`pg_sleep(5)` 在 2s 被取消 |
| 容器内 `psql` → Mac mini 栈（tailscale） | 成功：读、`json_agg` 包裹、事务内写入、只读拒绝、超时 |
| `psql -q` + 事务包裹 | 仅输出 JSON 行，命令标签被抑制 |
| 本机 / Mac mini 全局 IPv6 | 均为 0，直连不可用 |

### 2026-11-22（v1.0 实施验证）

| 用例 | 结果 |
|---|---|
| 角色引导 SQL（§design 7） | 成功：`rp_agent_readwrite` login+bypassrls，`public` 得 DELETE/INSERT/SELECT/UPDATE，`storage` 得 SELECT，成员含 `pg_monitor` |
| `auth`/`storage` 授权 | 部分失败：`auth` 与部分 `storage` 表由 Supabase 管理角色持有，`postgres` 无授予权，只产生 warning；`auth` 缺 `USAGE` 故不可读 |
| 以新角色经池化器登录 | 成功：`current_user = rp_agent_readwrite`，可见 `public` 119 张表 |
| 新角色直接 DDL | 被数据库拒绝：`permission denied for schema public` |
| 插件 `supabase_status` (cloud) | `reachable: true`、`currentUser = rp_agent_readwrite`、连接数 11（`pg_monitor` 生效）、TLS 必需 |
| 写入未指定 target | 被拒：多目标必须显式命名 |
| 首次云端写入（`dsh_smoke.writes`） | 成功：`BEGIN → INSERT 0 1 → COMMIT`，`transactional: true`，约 566 ms，`written_by = rp_agent_readwrite` |
| 写入后回读 | 返回该行，时间戳与角色正确 |
| `cloud` 上执行 DDL | 被配置层拒绝（`ddl: false`），未连库 |
| 带 WHERE 的 DELETE | 成功：`DELETE 1`，事务提交 |
| 审计日志 | 2 行（INSERT/DELETE），含目标、角色、命令标签、耗时；无口令、无数据值 |
| 凭据文件 | `credentials/supabase.json` 权限 0600，口令未出现在 argv、进程环境或日志 |

**未验证**：插件在 Plugin Manager 中的标题、详情页与图标渲染（无浏览器控制）；`cloud-admin`（`postgres`）目标未安装。

## 限制与风险

## 限制与风险

- 强依赖 Docker 作为 `psql` 客户端载体；远程或托管 Postgres 仍走容器，后续可换 `pg` 驱动。
- 仅覆盖 SQL 层，不含 auth admin、storage 上传、REST 语义。
- 插件在 Host 进程直接 spawn docker，**不经过** bash 工具的沙箱与审批层；数据库语义上有护栏，操作系统层面没有。
- 无 Config schema：配置来自 bundle patch 行与环境变量，Settings 中没有可编辑字段。
- `BYPASSRLS` + 生产写权限是最大残余风险；插件门禁与审计是唯一控制点，`cloud-admin` 影响面最大。
- 写角色覆盖整个 `public` schema（119 张表），未按表收窄；后续可按 schema/表细化。
- `dsh_smoke` 为一次性冒烟 schema，保留以便复测，可用 `drop schema dsh_smoke cascade` 清理。
- 池化器行为可能随平台升级变化（尤其 startup options 与模式差异），升级后应重跑上表用例。

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-11-17 | 初始登记 `supabase-local`：3 个工具、只读默认、容器自动探测 |
| 2026-11-22 | 更名 `supabase` 并升为 v1.0 设计：多目标（local/cloud/cloud-admin/macmini）、写入路径与角色模型、`BEGIN READ ONLY` 取代 `PGOPTIONS`、修正池化器区域与主机事实 |
| 2026-11-22 | v1.0 实施：`rp_agent_readwrite` 角色与凭据就位，`cloud` 目标启用读写，`dsh_smoke` 完成首次写入与回读；补记 `auth` 不可读 |
