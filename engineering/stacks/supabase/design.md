# supabase — Design v1.0

**状态：** 设计定稿（2026-11-22）。**未实施**，无生产变更。
**取代：** 本目录 v0.1 设计（`supabase-local`，仅本地、默认只读、`PGOPTIONS` 兜底）。
**配套：** [栈记录](README.md) · [Database Governance](../../../docs/DATABASE_GOVERNANCE.md) · [Central Agent Guidance §3](../../../AGENTS.md)

---

## 1. 背景与问题

v0.1 解决了"Agent 读本地 Supabase 要每次手写 `docker exec psql`"的问题：三个工具、只读默认、容器自动探测。它明确写了两条边界——不接生产、不做写入。现在要跨过这两条：

1. 生产数据在 Supabase Cloud，Agent 需要读它。
2. 日常运维需要写（修数据、补状态），但写不能是"默认就有的能力"。

同时，v0.1 的两个隐含假设在云端不成立，且**失败方式是静默的**：

- 直连 `db.<ref>.supabase.co` 只有 AAAA 记录，本组织两台机器都没有全局 IPv6；
- 池化器不转发 libpq startup `options`，`PGOPTIONS` 的只读与超时**都不会生效**。

第 2 条尤其危险：它让"两层只读保障"退化成只有关键词门禁，而关键词门禁正是设计文档里写明可被数据修改型 CTE 绕过的那个薄弱层。

## 2. 目标与非目标

**目标**

- 一个插件、多个具名目标，Agent 按名选择，不靠环境变量猜。
- 云端可读、可写；写入默认不可发生，必须显式授权且留痕。
- 只读与超时在**任何代理后面**都成立。
- 生产写入使用最小权限角色，DDL 与 DML 分离。
- 失败信息可操作：区域错、角色不存在、权限不足、目标只读，各有明确指引。

**非目标**

- 不替代 Studio / psql 的人工探索。
- 不提供 auth admin、storage 上传、REST 语义（`supabase_schema` 只读可见 `auth`/`storage`）。
- 不做审批工作流，不依赖 Host 的审批弹窗（当前 profile 已关闭审批）。
- 不实现迁移/回滚工具；DDL 仍应通过受审迁移。

## 3. 架构

```
Agent ── tool call ──► DSH Host 插件 "supabase" (inject: tools)
                         │
                         ├─ resolveTarget(name) → config.targets[name]
                         │
                         ├─ kind: docker-exec
                         │    └─ docker exec supabase_db_<project> psql -U postgres …
                         │       （peer 认证，无口令、无 TLS）
                         │
                         └─ kind: tcp
                              └─ docker run --rm postgres:17-alpine psql
                                   "host=… port=… user=… dbname=… sslmode=…"
                                   -v <state>/.pgpass:/pgpass:ro
                                   -e PGPASSFILE=/pgpass
                                 （口令不进 argv、不进宿主机环境）
```

选型理由：v0.1 的全部 SQL 语义都建立在 `psql` 上（`json_agg` 包裹、`--csv` 写入输出、命令标签）。保留 psql 为客户端，意味着传输替换不动语义；两台机器都已具备 Docker 与 `postgres:17-alpine`，不引入 npm 依赖。`pg` 驱动作为二期适配器，接口不变（§10）。

## 4. 目标模型

```yaml
- insert:
    - id: supabase
      name: '@local/dsh-supabase'
      config:
        defaultTarget: local
        targets:
          local:
            kind: docker-exec
            project: inbox-backoffice-poc    # 省略则自动探测
          cloud:                             # 默认云路径：仅 DML
            kind: tcp
            host: aws-1-ap-northeast-2.pooler.supabase.com
            port: 5432
            user: rp_agent_readwrite.gqeyfhshxdiyhugvmbuk
            sslmode: require
            mode: read-write
            writePolicy: confirm
            ddl: false
            guard:
              - '^\\s*drop\\s+(database|schema)\\b'
              - '^\\s*truncate\\b'
              - '^\\s*(create|drop|alter)\\s+role\\b'
              - '^\\s*alter\\s+system\\b'
          cloud-admin:                       # 可选：schema 变更
            kind: tcp
            host: aws-1-ap-northeast-2.pooler.supabase.com
            port: 5432
            user: postgres.gqeyfhshxdiyhugvmbuk
            sslmode: require
            mode: read-write
            writePolicy: confirm
            ddl: true
          macmini:
            kind: tcp
            host: rpagents-mac-mini.tail220e8d.ts.net
            port: 54322
            user: postgres
            sslmode: disable
            mode: read-write
            writePolicy: confirm
```

每目标默认值：`database: postgres`、`port: 5432`、`sslmode` 由协议族决定、`mode: read-only`、`writePolicy: confirm`、`ddl: false`、`statementTimeoutMs: 30000`、`lockTimeoutMs: 5000`、`maxRows: 200`。

解析规则：

- 省略 `target` → `defaultTarget`。
- 未知名称 → 报错列出**名称**，不暴露主机。
- `tcp` 主机匹配 `^db\..*\.supabase\.co$` → 拒绝，提示改用池化器（除非显式 `allowDirectDbHost: true`）。
- `tcp` 主机为 `*.pooler.supabase.com` 且用户名不含 `.` → 拒绝，提示格式为 `<role>.<project-ref>`。

## 5. 读路径

```
psql -X -q -t -A -v ON_ERROR_STOP=1
     -c "begin read only;
         set local statement_timeout = <N>;
         set local lock_timeout = <M>;
         select coalesce(json_agg(__dsh_row), '[]'::json)
           from (select * from (
             <body>
           ) __dsh_src limit <maxRows+1>) __dsh_row;
         commit;"
```

沿用 v0.1：关键词门禁（`SELECT|WITH|VALUES|TABLE|SHOW|EXPLAIN`）、`TABLE x` → `select * from x`、`maxRows+1` 判定截断、单行 JSON 解析。

改变：`begin read only` 取代 `PGOPTIONS`；超时写进同一条 simple-query，因此穿得过池化器；`-q` 抑制 `BEGIN`/`SET`/`COMMIT` 标签，输出只剩 JSON 行（已实测）。

`EXPLAIN ANALYZE` 仍按关键词归为读，但 `BEGIN READ ONLY` 会阻止其产生写入副作用。

## 6. 写路径

### 6.1 准入（在连库之前）

必须同时满足：

1. `target.mode === 'read-write'`；
2. `write: true`；
3. `writePolicy === 'confirm'` 时还需 `confirm: true`，否则报错并回显目标名与 SQL 预览（≤160 字符）；
4. 不命中 `guard` 正则；
5. 通过启发式：`UPDATE`/`DELETE` 无 `WHERE` 拒绝（可用 `unbounded: true` 放行）；SQL 超过 `maxSqlBytes`（默认 100 KB）拒绝；
6. 多目标并存时写入必须显式给 `target`；
7. DDL 关键词（`CREATE|ALTER|DROP|COMMENT|GRANT|REVOKE|REINDEX|VACUUM`）要求 `ddl: true`；默认 `cloud` 目标在连库前即拒绝。

### 6.2 执行

```
psql -X -t -A -v ON_ERROR_STOP=1
     -c "begin; set local statement_timeout = <N>; set local lock_timeout = <M>;
         <sql>; commit;"
```

- `ON_ERROR_STOP` + 连接关闭 ⇒ 任一步失败整体回滚。v0.1 的裸多语句写入可能部分生效，v1.0 不会。
- 用户 SQL 已自带 `BEGIN`/`COMMIT` 时不重复包裹。
- `CREATE INDEX CONCURRENTLY`、`VACUUM`、部分 `ALTER TYPE` 不能在事务内执行：识别后退化为不包裹，并在结果里置 `nested: true` 明示原子性已放弃，且不论策略都要 `confirm: true`。

### 6.3 输出与审计

写结果返回 `{target, sql, output, rowCount, tags[], transactional, durationMs}`；`rowCount` 从最后一个 `INSERT 0 n`/`UPDATE n`/`DELETE n` 标签解析。

每次放行的写入在插件 `.state/writes.jsonl` 追加一行：时间、目标、主机、角色、语句类型、`sqlSha256`、200 字符预览、命令标签、是否成功、耗时。**不含数据值、不含凭据。**

在没有审批弹窗的前提下，审计是唯一的事后复核手段，因此不可关闭。

## 7. 角色模型

| 角色 | 超级用户 | BYPASSRLS | 用途 |
|---|---|---|---|
| `rp_agent_readonly` | 否 | 是 | 既有只读访问（另含 `public.inquiries` 的 `UPDATE`） |
| `rp_agent_readwrite` | 否 | 是 | 本设计新增：云端 DML |
| `postgres` | 是 | 是 | 仅 `cloud-admin` |

引导 SQL（一次性、作为受审迁移执行，执行前经人复核；口令另行设置，不进仓库、不上命令行）：

```sql
create role rp_agent_readwrite login bypassrls;

grant usage on schema public to rp_agent_readwrite;
grant select, insert, update, delete on all tables in schema public to rp_agent_readwrite;
grant usage, select on all sequences in schema public to rp_agent_readwrite;
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to rp_agent_readwrite;
alter default privileges for role postgres in schema public
  grant usage, select on sequences to rp_agent_readwrite;

grant pg_monitor to rp_agent_readwrite;                -- 让 status 看到真实连接数

grant usage on schema auth, storage to rp_agent_readwrite;
grant select on all tables in schema auth, storage to rp_agent_readwrite;

-- 有意不授予：public 的 CREATE、DDL、角色成员、TRUNCATE
```

需要明确接受的后果：

- `BYPASSRLS` 沿用 `rp_agent_*` 既有约定，因此 DML 角色**不受 RLS 约束**——与 `service_role` 同姿态。控制点是插件门禁与审计，不是 RLS。
- 没有 `public` 的 `CREATE` ⇒ DML 角色在数据库层就无法建表/删表，与 `ddl: false` 形成双保险。
- DDL 因此只能经 `cloud-admin`（`postgres`），它是可选项、名字显眼、逐条审计。
- 角色创建属生产变更，需按 AGENTS.md §3 先报告目标、动作、影响、风险与回滚。

## 8. 安全模型

| 层 | 机制 | 本地 | 云 | 说明 |
|---|---|---|---|---|
| 1 | 关键词门禁 | ✅ | ✅ | 报错可读 |
| 2 | `BEGIN READ ONLY` | ✅ | ✅ | **穿得过池化器**；`PGOPTIONS` 不行 |
| 3 | `statement_timeout`/`lock_timeout` | ✅ | ✅ | SQL `SET LOCAL`，非 startup options |
| 4 | `mode` + `writePolicy` + `confirm` | ✅ | ✅ | 逐目标 |
| 5 | `guard` 正则 + 无 WHERE 启发式 | ✅ | ✅ | 可配 |
| 6 | 原子事务 | ✅ | ✅ | 失败整体回滚 |
| 7 | 审计 JSONL | ✅ | ✅ | 事后复核 |
| 8 | Host 审批弹窗 | ❌ | ❌ | 当期 profile 已关闭审批，不依赖 |

未覆盖（须写入栈记录）：

- `BYPASSRLS` 使结果不代表 `anon` / 登录用户视角。
- 插件直接 spawn docker，绕过 bash 沙箱与审批层。
- 云端已提交的写入无法由本工具撤销。
- `cloud-admin` 的影响面是整个项目。

## 9. 接口契约

| 工具 | 参数 | 返回 | 失败 |
|---|---|---|---|
| `supabase_query` | `sql`（必填）、`target`、`write`、`confirm`、`unbounded`、`transaction` | 读：`{target, sql, rowCount, truncated, rows[]}`；写：`{target, sql, output, rowCount, tags[], transactional, durationMs}` | 未知目标、目标只读、缺 confirm、guard 命中、无 WHERE、DDL 越权、psql 报错（口令已脱敏） |
| `supabase_schema` | `schema`（默认 `public`）、`target` | `{target, schemas, tableCount, truncated, tables[]}` | 非法 schema 名、权限不足 |
| `supabase_status` | `target`（省略=全部） | 逐目标 `{name, kind, reachable, latencyMs, serverVersion, databaseSize, connections, uptime, sslmode, tls, mode, writePolicy}` | 不抛错，返回 `reachable: false` + `error` |
| `supabase_targets` | 无 | `{defaultTarget, targets[]}` | 不含任何凭据 |

`supabase_status` 的语义修正：走池化器时 `connections` 是池化器到 Postgres 的后端数，不是客户端连接数；`uptime` 是服务端启动时间。需在输出中标注。

## 10. 后续工作（未承诺）

1. 写入改走 `ctx.subprocess` + 审批，补齐第 8 层。
2. 增加 `pg` 驱动传输，去掉"写库要依赖 Docker 运行"的耦合。
3. 增加 REST 工具（auth admin、storage），减少回退到 shell。
4. 目标探测结果短时缓存，降低多工具连续调用的固定开销。
5. 按 schema 细化 `rp_agent_readwrite` 授权，替代当前"整个 public"的 DML。

## 11. 验证摘要

2026-11-17（v0.1，Mac mini 本机）：三工具可用、只读拦截生效、写入临时表无残留、截断正确。

2026-11-22（v1.0 设计期，只读）：Management API 确认区域 `ap-northeast-2`；池化器主机以错误口令区分法定位为 `aws-1-ap-northeast-2`；`PGOPTIONS` 经池化器失效、`BEGIN READ ONLY` 与 `SET statement_timeout` 生效；容器内 `psql` 经 tailscale 打通 Mac mini 栈并完成读/写/只读拒绝/超时四类验证；`psql -q` 抑制命令标签。

完整用例与**未验证项**见[栈记录](README.md#验证记录)。
