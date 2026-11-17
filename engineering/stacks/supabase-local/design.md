# supabase-local — Design

**状态：** Pilot · **版本：** v0.1 · **日期：** 2026-11-17
**Owner：** Engineering（本地 Agent 工具链）
**性质：** 本机开发工具栈，不涉及生产数据库，不改变既有 Runtime 或部署方式。
**配套：** [栈记录](README.md) · [Database Governance](../../../docs/DATABASE_GOVERNANCE.md)

## 1. 背景与问题

Agent 需要读本地 Supabase 数据（如 `office_stock_events`、`auth.users`、`storage.objects`）时，只能临时走 shell：

```bash
docker exec -e PGOPTIONS=... supabase_db_x psql -X -U postgres -t -A \
  -c "select coalesce(json_agg(t),'[]'::json) from (select * from (...) q limit 200) t"
```

这条路径有三个稳定问题：

1. **每次重建**：容器名、`psql` 参数、JSON 包裹、转义都要重新推导，容易静默出错。
2. **没有护栏**：shell 没有任何机制阻止误写（`delete`、`drop`、无 `where` 的 `update`）。
3. **结果形态差**：CSV/文本丢失 null 与类型，还需人工搬进对话。

## 2. 目标与非目标

**目标**

- 让 Agent 在对话中可直接查询本地 Supabase，结果以带类型的 JSON 进入上下文。
- 默认只读，写入必须显式开启。
- 容器/连接自动发现，无密码、无 DSN 管理。
- 失败信息可操作（Docker 未启动、栈未起、多栈歧义）。

**非目标**

- 不替代 Studio / psql 的人工探索。
- 不覆盖生产库、远程库、RLS 行为验证。
- 不提供 auth admin、storage 上传、REST 语义。
- 不做审批工作流（写入审批属 Host 层能力，见 §8）。

## 3. 架构

```
Agent ── tool call ──► DSH Host 插件 (index.js, inject: tools)
                          │
                          ├─ docker ps -a --filter label=com.supabase.cli.project
                          │     └─ 选 supabase_db_*，解析 project / container
                          │
                          └─ docker exec <container> psql -X -U postgres -d postgres
                                ├─ 只读：-e PGOPTIONS=-c default_transaction_read_only=on
                                ├─ 读取：-t -A -c "<json_agg 包裹>"
                                └─ 写入：--csv -c "<原始 SQL>"
                                      │
                                      ▼
                                  Postgres (容器内 socket, peer 认证)
```

选型理由：宿主未安装 `psql`，也没有 `pg` 依赖；容器内 `psql` 与 peer 认证天然可用，因此无需凭据、无需额外依赖，也不引入 npm 安装步骤。

## 4. 数据流

**探测（每次调用）**
`docker ps -a` 列出带 `com.supabase.cli.project` 标签的容器 → 过滤 `supabase_db_*` → 若配置了 `container` 直接使用，否则要求恰好一个 running 实例（多栈时报错并列出候选）。

**读取**
1. 关键词门禁：`SELECT` / `WITH` / `VALUES` / `TABLE` / `SHOW` / `EXPLAIN` 之外且未开启写入 → 直接拒绝。
2. 包裹：`select coalesce(json_agg(__row), '[]'::json) from (select * from (\n<sql>\n) __src limit N+1) __row`。
3. `N+1` 用于判定截断；返回行数 > `maxRows` 时截断并置 `truncated`。
4. 解析 stdout 为 JSON 行数组。

**写入**
`write: true` 时按原样执行 SQL（`--csv`，`ON_ERROR_STOP=1`），返回命令标签或 CSV 文本；不包只读事务。

**状态**
复用读取路径查询 `version()`、库大小、连接数、public 表数、uptime；探测失败时返回 `running: false` 而非抛出，便于对话继续。

## 5. 关键取舍

| 决策 | 选择 | 放弃的替代 | 原因 |
|---|---|---|---|
| 传输 | `docker exec psql` | `pg` 驱动 / PostgREST | 无依赖、无凭据；`pg` 需安装依赖，REST 无法执行任意 SQL |
| 只读保证 | 关键词门禁 + `PGOPTIONS` | 仅关键词 / 仅事务 | 两道防线：前者给可读报错，后者覆盖 CTE 等绕过路径 |
| 输出格式 | `json_agg` 包裹 | CSV / 表格文本 | 保留类型与 null，Agent 可直接推理 |
| 行数控制 | 外层 `limit N+1` | 解析后计数 | 避免大表把整表 JSON 堆进内存 |
| 配置形式 | patch 行 + 环境变量 | Config schema | 免依赖（无 schemastery），代价是 Settings 无可编辑字段 |
| 错误处理 | 抛错（写入/查询失败），状态工具返回结构化结果 | 统一抛错 | 状态探测失败是常态，不应打断对话 |

## 6. 接口契约

| 工具 | 参数 | 返回 | 失败 |
|---|---|---|---|
| `supabase_query` | `sql`（必填）、`write`（默认 false） | `{sql, container, rowCount, truncated, rows}` 或 `{sql, container, output}` | 门禁拒绝、psql 报错、超时 |
| `supabase_schema` | `schema`（逗号分隔，默认 `public`） | `{container, schemas, tableCount, truncated, tables[]}` | 无效 schema 名、psql 报错 |
| `supabase_status` | 无 | `{running, container, project, serverVersion, databaseSize, connections, publicTables, uptime, endpoints}` | 返回 `{running:false, error}`，不抛 |

## 7. 安全模型

| 层 | 机制 | 覆盖 |
|---|---|---|
| 1 | 关键词门禁 | 明显的写语句 |
| 2 | `default_transaction_read_only=on` | 绕过门禁的写入（CTE、函数副作用） |
| 3 | 行数上限 / 超时 | 误查大表、长事务 |
| 4 | 写入需 `write: true` | 默认路径不会写 |

**未覆盖：** 通道以 `postgres` 超级用户运行，绕过 RLS；插件直接 spawn docker，不受 bash 工具沙箱/审批约束；写入路径允许一次多条语句且无 dry-run。因此本栈只应指向本地开发库。

## 8. 后续工作（未承诺）

1. 写入改走 `ctx.subprocess` + 审批，补齐第 4 层缺口。
2. 增加 `pg` 驱动传输，支持非容器化的本地/远程 Postgres。
3. 增加 REST 工具（auth admin、storage），减少回退到 shell 的频率。
4. 容器探测结果做短时缓存，降低多工具连续调用的固定开销。

## 9. 验证摘要

2026-11-17 本机实测：三工具可用、只读拦截生效、写入（临时表）可用且无残留、截断正确、跨 schema 可读。完整用例与未验证项见[栈记录](README.md#验证记录2026-11-17本机)。
