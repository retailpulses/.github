# 栈记录：supabase-local

> 索引：[Engineering Stack Registry](../README.md) ／ 设计：[design.md](design.md)

## 概览

| 项 | 值 |
|---|---|
| 状态 | Pilot（2026-11-17 本机实测通过） |
| 形态 | DeepSeek Harness Host 插件，向 Agent 暴露 3 个工具 |
| 目标实例 | 本机 `supabase start` 拉起的 Postgres；实测 `supabase_db_local-supabase-smoke`（PG 17.6，端口 54322） |
| 入口 | `supabase_query`、`supabase_schema`、`supabase_status` |
| 运行前提 | Docker Desktop + 本地 Supabase 栈 + 容器内 `psql` |
| 是否生产 | 否。仅面向本地开发库；不接入生产库 |

## 能力

| 工具 | 作用 | 关键约束 |
|---|---|---|
| `supabase_query` | 执行一条 SQL；SELECT 系返回 JSON 行（类型与 null 保留） | 默认只读；写入需 `write: true`；默认返回上限 200 行并标记截断 |
| `supabase_schema` | 列出表/视图、字段、类型、默认值、RLS、估算行数 | 只读；单次最多 2000 张 |
| `supabase_status` | 探测容器、PG 版本、库大小、连接数、uptime、本地端点 | 只读；栈未启动时返回 `running: false` 与原因，不中断对话 |

## 组成

```
Agent
  └─ DSH Host 插件（inject: tools）
       └─ docker exec supabase_db_<project> psql -U postgres -d postgres
            └─ Postgres（容器内 Unix socket，peer 认证，无需密码）
```

容器定位：`docker ps -a --filter label=com.supabase.cli.project`，取名称以 `supabase_db_` 开头的实例。多栈并存时按配置的 `project` / `container` 选择，否则报错并列出候选。

## 前置条件

1. Docker Desktop 已启动，目标项目已 `supabase start`。
2. `supabase_db_*` 容器处于 running。
3. 容器镜像自带 `psql`（官方 Supabase Postgres 镜像均满足）。
4. 宿主机无需安装 `psql`，也不需要数据库密码——本栈刻意不依赖这两者。

## 数据边界

- **只读默认**：非 `SELECT` / `WITH` / `VALUES` / `TABLE` / `SHOW` / `EXPLAIN` 语句在发往数据库前即被拒绝。
- **数据库层兜底**：只读请求携带 `PGOPTIONS=-c default_transaction_read_only=on`；即使绕过关键词检查（例如数据修改型 CTE），Postgres 仍会拒绝。
- **写入**：仅 `write: true`（或插件配置 `allowWrite: true`）放行；写入不包只读事务。
- **输出**：结果截断到 `maxRows`（默认 200）并置 `truncated: true`；语句超时默认 30s。
- **权限**：以 `postgres` 超级用户执行，**绕过 RLS**，不能代表 anon / 登录用户的真实可见性。
- 与 [AGENTS.md §3](../../../AGENTS.md) 一致：对数据库 schema 或批量数据的变更属生产敏感操作；本栈默认只读，写入需显式开启，且不用于生产库。

## 运维手册

| 场景 | 操作 |
|---|---|
| 安装 / 重装 | `plugin_manager` → `install_bundle`，target 指向工作区中的 `supabase-local/` 绝对路径 |
| 升级 | 改代码后重装；替换已安装包需重启 Harness 才能加载新的 ESM 模块 |
| 停用 | `plugin_manager` → `set_plugin`（id `supabase-local`）设为 disabled |
| 切换目标栈 | 按 id `supabase-local` 覆盖插件 config 的 `project` 或 `container` |
| Docker 路径 | 配置 `dockerPath`，或设置环境变量 `DSH_SUPABASE_DOCKER` |
| 排障 | 先调 `supabase_status`；`running: false` 时读 `error`（Docker 未启动 / 容器未运行 / 多栈歧义） |

常见错误：

- `Docker CLI not found ...` —— Docker 未安装或不在候选路径。
- `... is not running: supabase_db_x (exited)` —— 栈已停，需 `supabase start`。
- `More than one local Supabase stack is running` —— 多项目并存，需指定 project / container。
- `Refusing to run a DELETE statement ... without write: true` —— 只读门禁生效，属预期行为。

## 验证记录（2026-11-17，本机）

| 用例 | 结果 |
|---|---|
| `supabase_status` | running；容器 `supabase_db_local-supabase-smoke`；PG 17.6；库大小 3323 MB |
| `supabase_schema` | 正确列出 `public.office_stock_events` 及 9 个字段、默认值、`RLS=false` |
| 读取真实行 | `select * ... order by id desc limit 3` 返回带类型 JSON，timestamptz 正常 |
| 跨 schema | `auth.users`、`storage.objects` 计数可读 |
| 只读拦截 | 未带 `write` 的 `delete ...` 被前置拒绝；数据修改型 CTE 被数据库拒绝 |
| 写入路径 | `write: true` 建临时表并插入，返回命令标签；临时表随会话销毁，无残留 |
| 截断 | 250 行结果返回 200 行并标记 `truncated: true` |

**未验证：** 插件在 Plugin Manager 中的标题与图标实际渲染（无浏览器控制），仅确认 `locale/*.json` 与 `icon.svg` 导出可解析。

## 限制与风险

- 强依赖 `docker exec` 与本地容器；远程或托管 Postgres 需改换 `pg` 驱动实现。
- 仅覆盖 SQL 层，不含 auth admin、storage、REST 语义。
- 插件在 Host 进程直接 spawn docker，**不经过** bash 工具的沙箱与审批层——数据库语义上有护栏，操作系统层面没有。
- 无 Config schema：配置来自 bundle patch 行与环境变量，Settings 中没有可编辑字段。
- 写入路径允许多语句，无审批、无 dry-run。

## 相关入口

- [设计文档](design.md)
- [Database Governance](../../../docs/DATABASE_GOVERNANCE.md)（本地开发建议使用 `supabase start`）
- [Database Asset Registry](../../../infrastructure/databases/README.md)（该实例的资产登记，非生产）
- [Central Agent Guidance §3](../../../AGENTS.md)（数据库变更的生产敏感性）

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-11-17 | 初始登记：3 个工具、只读默认、容器自动探测；安装到本机 `desktop` profile 并完成实测 |
