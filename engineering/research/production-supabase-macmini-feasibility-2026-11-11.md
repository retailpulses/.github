# Production Supabase → Mac mini：方案 A 完全退出 Cloud 可行性研究（2026-11-11）

> **类型：** Architecture Feasibility Study / Engineering Research（Informative；不是实施批准）  
> **研究状态：** **可行性研究完成**；生产实施、迁移及订阅取消均未授权、未执行  
> **结论：** **方案 A 技术可行（FEASIBLE），但迁移工程投入不可忽略；商业投资回报仍需与架构简化价值共同评估**  
> **研究责任：** Retailpulses Engineering；现场证据来自 Mac mini Desktop Commander 只读检查、Supabase 只读 SQL，以及 GitHub 源码与治理记录  
> **主 Issue：** [retailpulses/.github#93](https://github.com/retailpulses/.github/issues/93)（Feasibility 完成）  
> **备选研究：** [retailpulses/.github#94](https://github.com/retailpulses/.github/issues/94)（Cloud Pro → Free）  
> **上位架构：** [.github#90](https://github.com/retailpulses/.github/issues/90)；[inbox#341](https://github.com/retailpulses/inbox/issues/341)  
> **原始现场研究记录：** [#93 完整证据评论](https://github.com/retailpulses/.github/issues/93#issuecomment-6785632922)；[初始现场快照](https://github.com/retailpulses/.github/issues/93#issuecomment-6785487385)  
> **证据有效时点：** 2026-11-11 JST。运行时部署清单的上一轮全量核查为 2026-09-18，不能当作 11 月的实时发布版本证明。

## 1. 研究问题、边界与裁决

**研究问题：** 现有常开的 `rp-macmini-01` 是否可以承担目前托管在 Supabase Cloud 的生产数据和必需服务，从而完全退出 **Supabase Cloud**？这与“把全部应用迁移到 Mac mini”不是一回事。

**Sponsor 明确约束：** 偶尔**计划内重启可以接受**，不能将零停机或连续 90 天无重启作为可行性研究的前提。评估重点是架构能否成立、实际消费者是否可达、数据是否可保护，以及新增运维责任与收益。

### 裁决

**A — 技术可行，建议在未来实施决策中保留为正式候选方案。** 当前没有发现 PostgreSQL 版本、数据规模、Mac mini 资源、Supabase 功能或网络技术方面的**结构性不可行因素**。

但要把“可行”与“已做好上线准备”严格分开：本研究**没有**执行生产数据迁移、真实恢复演练、生产级网络切换、Auth 令牌迁移、部署切换或 Cloud 取消。它们属于**后续实施工作**，不是判断结构可行性的前置条件。

**最重要的推论：** 方案 A 的难点不是“Mac mini 跑不动数据库”，而是**云端消费者到私有 API 的连接、Tickets/收据外部签名文件访问、生产自托管运维、认证与密钥、原有双数据面权威归属**。这些都有可描述的工程路径，代价仍需计入投资决策。

### 不能混同的四件事

- **一个 Commerce 产品 ≠ 一个物理数据库**；参见 [.github#90](https://github.com/retailpulses/.github/issues/90) 与 [commerce-ops#490](https://github.com/retailpulses/commerce-ops/issues/490)。
- **Mac mini 生产数据面 ≠ 当前 Local 开发/实验数据面**。不能直接覆盖已有 `local-supabase-smoke`。
- **完全退出 Supabase Cloud ≠ 退出 Cloudflare/VPS/GitHub**。现有业务运行时可以继续保持其运行位置。
- **技术可行 ≠ 仅为每月 $25 经济划算**。工程时间、备份和运维是实际成本。

## 2. 证据口径

| 级别 | 含义 | 在本研究中的示例 |
| --- | --- | --- |
| E1 — 现场只读观测 | 指定时刻真实运行环境或生产库元数据 | Mac mini 主机/容器、Cloud DB/Storage/Auth/函数清单 |
| E2 — 版本受控的设计/源码 | 证明代码或规范中的依赖与实现路径，不自动证明目前生产部署与其完全一致 | Wrangler、Orders API、Tickets 文件共享代码、治理注册表 |
| E3 — 官方产品能力文档 | 证明功能/迁移机制存在，不证明当前账号已开通或实现测试成功 | Supabase Self-hosting/Restore、Cloudflare Workers VPC |
| 未验证 | 不能从已有材料断言 | 过去 90 天 SLA、实际峰值 TPS、全量生产调用方、异机恢复成功、Cloudflare VPC 账号授权、真实迁移工程耗时 |

**所有数据库查询为只读统计；未保存生产行级数据、客户 PII 或凭证。**

## 3. Mac mini 现场调查（2026-11-11）

| 项目 | 现场结果 | 解读 |
| --- | --- | --- |
| 主机 | `rp-macmini-01`，macOS 27.0，24 GiB RAM | 硬件资源不构成当前规模的明确限制 |
| 运行时间 | 2026-10-19 15:22:35 JST 启动；现场 uptime 22 天 20 小时 | 证明近期连续运行，不是 60–90 天的可靠性统计 |
| 电源设置 | `sleep=0`，`autorestart=1`，`womp=1` | 常开设置已具备；计划内重启允许 |
| 磁盘 | APFS Data 460 GiB 总量、约 212 GiB 已用、186 GiB 可用 | 可容纳另一个几 GB 的隔离候选环境；仍需为 WAL、备份、增长与其他业务保留空间 |
| 当前 Supabase | CLI 2.117.0；`local-supabase-smoke` 中 11 个相关容器运行约三周；DB/Auth/Storage/Realtime healthy | **现有的是 CLI Local 栈，不是已认定的生产级部署** |
| 本地 Postgres | PostgreSQL 17.6；`postgres` DB 3266 MB | 存在 `mercari`、`canonical_product`、`backoffice`、`marketplace_offer`、`canonical_images` 等业务 Schema；**不可覆盖** |
| Docker 内存 | Docker daemon 可用约 8.31 GB；DB 容器 `HostConfig.Memory=0` | 先前 `docker stats` 显示的约 7.74 GiB 是 Docker VM 内存分母，**不是主机总 RAM，也不是每容器限额** |
| 资源快照 | PostgreSQL 约 310 MiB、Analytics 约 622 MiB（瞬时）；系统 memory free 43% | **非压力测试/峰值**，不得推断实际高负载能力 |
| Tailscale | `rpagents-mac-mini.tail220e8d.ts.net` Serve 为 **tailnet only**；路由 `/`、`/yuzu`、`/codex` | 私有入口真实存在；外部 Cloudflare Workers **不能直接使用此私有域名** |
| Local Supabase 配置 | `api.tls.enabled=false`、`db.network_restrictions.enabled=false`、`db.pooler.enabled=false`、`local_smtp.enabled=true` | 说明当前 CLI 栈不能未经隔离/加固直接晋升生产 |
| 端口 | Docker 对 54321/22/23/24/27 映射 `0.0.0.0`；现场宿主机侦听进程显示 SSH | 需检查完整网络路径；**不能单凭 Docker 绑定推断公网暴露** |
| 重启行为 | Postgres 容器 `unless-stopped`；Mac 电源自动重启开启 | 有基本自恢复设置，但未证明业务入口、数据库、工作队列和调度器恢复完好 |
| 备份 | `tmutil destinationinfo`：无 Time Machine 目标；抽查用户 cron、LaunchAgent/Daemon 名称与本地备份目录，发现部分临时 `.dump`，未验证定期异机备份/PITR/恢复演练 | **备份能力证据缺口，不等于证明不存在其他备份** |

**容量判断：** Cloud 数据库约 2.51 GB、Storage 对象元数据约 2.12 GB；本地已有约 3.27 GB DB。在 186 GiB 可用盘空间下，**物理数据量本身不是明显阻断项**。但并未基于瞬时内存/磁盘观测证明生产峰值容量或故障恢复指标。

## 4. 托管 Supabase 现场调查（2026-11-11）

| 指标 | 只读证据 | 对 A 的意义 |
| --- | --- | --- |
| 实例 | 单个 ACTIVE_HEALTHY 项目，`ap-northeast-2`，PostgreSQL 17 | 与现有本地 PG17 主版本一致，降低版本跨度；仍需校验 Supabase 服务/Schema 差异 |
| 订阅 | Retailpulses Org = Pro / tier_payg；Sponsor 确认 **$25/月** | $300/年是可避免的订阅**基线**，不代表全部成本节省 |
| DB 总量 | `pg_database_size` = **2,630,126,739 bytes（约 2508 MiB）** | 远小于可用磁盘 |
| Schema | `public` 119 表、约 2231 MB；`auth` 27 表、约 257 MB | 不是单一业务表迁移 |
| 主要表 | `source_import_rows` 1548 MB（估算约 180,894 行）；`pipeline_run_log` 131 MB（估算约 156,709 行） | **A 默认迁移保存**，无需先删除来满足 Free；关系大小不等于可回收空间 |
| Auth | 6 用户、6 个 `email` identity；`auth.sessions` **323,451 行** | 账号量小，但 Session 数据多，需保留兼容/重新认证方案；不应直接清理 Auth 系统表 |
| Storage | 2 个私有 Bucket、594 对象；`ticket-attachments` 591 个、元数据声明约 **2106 MB**；`receipt-pdfs` 3 个、约 **17 MB** | 必须**单独转移对象字节与权限**；统计并非独立账单字节核对 |
| Edge Functions | 1 个 ACTIVE：`ticketing-deployment-broker` v3 | 需迁往 self-hosted Edge Functions 或等价受控运行时 |
| SQL 能力 | `public` 166 SQL Functions、53 非内部触发器、28 个 public RLS policies | SQL/权限测试工程不可忽略 |
| RLS | `public` 119 表中 73 表开启 RLS、46 表未开 | 必须核对 API 暴露 Schema/GRANT/Access Class；**未开启不自动等于公网漏洞** |
| 扩展 | `pg_stat_statements`、`pg_trgm`、`pgcrypto`、`uuid-ossp`、`supabase_vault`、`plpgsql` | 都需在新 Postgres 镜像中逐项验证 |
| Realtime | `supabase_realtime` 发布表数 0，`realtime.messages` 行数 0 | **未发现 Postgres Changes 使用证据**；不能因此排除 Broadcast/Presence 等所有使用形态 |
| Vault | `vault.secrets` = 0 | 当前无 Vault Secret 记录；不表示应用没有外部 Secret |

原始查询类型：`pg_database_size`、`pg_total_relation_size`、`pg_stat_user_tables`、`storage.objects` metadata、`auth.users` / `auth.sessions`、`pg_extension`、`pg_policies`、`pg_publication_tables` 等。未进行 DML、DDL、备份或数据导出。

## 5. 真正的生产依赖（不是只改数据库 URL）

[Commerce Ops 生产 Runtime Inventory](https://github.com/retailpulses/commerce-ops/blob/main/docs/PRODUCTION_RUNTIME_INVENTORY.md) 标明：Portal 运行在 Cloudflare Pages，Inquiry/Tickets/Orders 的部分服务运行于 Cloudflare Workers，Orders/Portal Gateway/CatalogSync 的部分 API 和 Timer 运行在 VPS。**完全退出 Supabase Cloud 不要求它们跟着迁往 Mac mini。**

| 领域 / 数据所有者 | 已证实的服务/代码依赖 | 方案 A 处置及风险 |
| --- | --- | --- |
| Catalog / canonical 产品（[RPagentOS owner registry](https://github.com/retailpulses/rp-governance-kit/blob/main/docs/DATABASE_OWNERSHIP.yaml)） | [CatalogSync VPS](https://github.com/retailpulses/CatalogSync/blob/main/deploy/vps/README.md) 使用 Supabase REST/service key；Orders/Inquiry/Tickets 也消费产品投影 | 独立生产 PG17 重建 Schema、Functions、Views、RLS；迁移 URL/凭证，**不得直接拿现有本地 Canonical 副本替代 Production SoT** |
| Inquiry | [Inquiry Worker](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/worker/wrangler.toml) 含 Cloud Supabase URL 和定时写入开关；Pages API 也消费 API | 从 Cloudflare 到 Mac mini 安全连通、角色/凭证替换、保留 webhook/定时任务所有权 |
| Orders / OrderMgmt | [Orders VPS API 环境代码](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/portal-api/src/env.mjs) 使用 Supabase REST/service key；Cloudflare Worker 与 VPS scheduler 协调 | 端点替换与租约/幂等/调度 fencing 一致性；避免迁移期双写 |
| Tickets | [Tickets Worker](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/web/worker/wrangler.toml) 及 [Evidence Share](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/web/worker/src/handlers/ticket-shares.ts) 使用数据库 RPC、Storage、signed URL | **实质复杂度最高之一**：迁移对象、保留附件安全控制，外部接收者下载不能返回内网 URL；视频 Range/过期/撤销契约需保留 |
| Ops Portal / Receipt | [Receipt Supabase Adapter](https://github.com/retailpulses/commerce-ops/blob/main/apps/ops-portal/gateway/receipts/supabase-adapter.mjs) 直接以 Supabase URL 构造文件签名下载链接 | 需受控公共文件交付代理；已签发/历史 URL 是否继续有效需单独处理 |
| Auth | 云端 `auth.users`、Sessions；业务 Actor/Cloudflare Access 需要与 Supabase Auth 区分 | 迁移账户但可能需重新登录；JWT/API keys、邮件 SMTP、OAuth 配置逐项映射 |
| Deployment Broker | [ticketing-deployment-broker 源码](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/supabase/functions/ticketing-deployment-broker/index.ts)、[其 GitHub 部署 Workflow](https://github.com/retailpulses/commerce-ops/blob/main/.github/workflows/tickets-production-broker-deploy.yml) | 其 `verify_jwt=false` 由**函数内 GitHub OIDC JWT/claims 验证**补充；不能简单当作匿名写入漏洞，也不能去除验证。可选择 self-hosted Function 或等价有界 Broker |
| 本地业务 Hub / MonthlyPnL | 本地 `canonical_product`、`mercari`、`backoffice` 等现存数据；[DSN 权限冲突案例](https://github.com/retailpulses/store-ops/issues/217) | 首阶段**保留原有数据面及独立身份**；单机共存不等于强行合并或共享 service role |
| Local Replica | [inbox#415](https://github.com/retailpulses/inbox/issues/415) 已记录 `updated_at` 游标缺陷 | 即使同机部署，时戳缺陷也不会自动消失；如果退休复制则需定义读取权威与消费者去向 |

**治理注意：** [数据库 Owner Registry](https://github.com/retailpulses/rp-governance-kit/blob/main/docs/DATABASE_OWNERSHIP.yaml) 仍包含部分旧仓库名，具体 owner/consumer 登记须按 Commerce Ops 合并后的实际代码核对；不要把登记历史命名误解为现在仍部署的独立运行时。

## 6. 目标拓扑与外部连通性

```text
[Cloudflare Pages / Workers]           [VPS APIs / timers]
       |        ^                             |
       |        | 授权文件下载代理              | 私有网络或限权服务 API
       v        |                             v
[Workers VPC Service / Tunnel] ----> [Mac mini 自托管 Supabase Production]
                                     |-- PostgreSQL 17 / Functions / RLS
                                     |-- PostgREST / Auth / Storage
                                     |-- 独立生产数据卷、身份、升级/监控
                                     |
                                     +--> 独立加密异机备份 / 可恢复归档

[Mac mini 现有 local-supabase-smoke / Local Hub] -- 初期独立保留
[GitHub] -- Schema / migration / release / governance control plane
```

### 外部连接的实际约束

- **确认事实：** 目前 Mac mini `tailscale serve status` 显示 **tailnet only**，不能拿现有 Tailnet URL 直接当公网 Worker 后端。
- **可行技术路径（未在公司账号验证）：** Cloudflare **Workers VPC Service + Cloudflare Tunnel** 允许 Workers 访问私有服务，Mac mini 可维持不开放入站 PostgreSQL 端口。官方参考：[Workers VPC 示例](https://developers.cloudflare.com/workers-vpc/examples/private-api/)、[VPC Service 配置](https://developers.cloudflare.com/workers-vpc/configuration/vpc-services/)、[定价](https://developers.cloudflare.com/workers-vpc/platform/pricing/)。**2026-11-11 该功能的 Beta、账号可用性与最终定价尚需实施选型时确认。**
- **VPS 调用方：** 优先受控 Tailscale/私有线路；不满足时使用 Cloudflare Access service authentication 或窄权限 HTTPS API。**不得暴露原始 PG5432、Studio 或 broad service role。**
- **关键反例：** Tickets `createSignedUrl` 会把 Storage URL 返回给外部使用者；Receipt Adapter 也直接构造签名 URL。若只返回私有 VPC 地址会破坏下载。应由现有 Worker/Gateway 提供对外**经授权、短期有效、支持撤销与 Range**的文件代理；**不要公开整个 Storage**。
- 这些是可实现的设计路径；本研究**没有**部署 Tunnel 或进行网络配置变更。

## 7. 官方迁移机制与兼容性

Supabase 官方 [Restore a Platform Project to Self-Hosted](https://supabase.com/docs/guides/self-hosting/restore-from-platform) 给出了角色、Schema、数据导出与自托管导入机制。该过程覆盖数据库函数、触发器、RLS、`auth.users` 等，但**不自动迁移 Storage 对象、Edge Functions、JWT/API 密钥、SMTP、OAuth Redirect、域名**。建议自行使用官方 [self-hosted Docker 部署指南](https://supabase.com/docs/guides/self-hosting/docker) 的独立生产 Stack，不将当前 CLI smoke 直接晋升生产。

本项目云端与现有本地均为 PostgreSQL 17，**降低但没有消除**服务版本、Auth/Storage Schema、Extension 兼容性差异。Commerce Ops 已有 [PostgreSQL 17 cross-domain schema replay 记录](https://github.com/retailpulses/commerce-ops/blob/main/docs/CROSS_DOMAIN_DATABASE_ASSEMBLY.md)，支持“可重建”的判断，但不是完整生产迁移的成功证明。

## 8. 四方案比较与经济判断

| 选项 | 技术判断 | 优点 | 主要代价/缺点 | 研究结论 |
| --- | --- | --- | --- | --- |
| **A. 全部退出 Supabase Cloud** | **FEASIBLE** | 生产数据统一到自有受控运行环境；避免继续维护 Cloud Supabase 订阅及部分跨面复制摩擦 | 自托管升级、安全入口、异机备份/恢复、Auth/Storage/文件交付代理、配置迁移 | **正式保留为候选架构，优先考虑有限范围原型验证** |
| **B. Mac mini 为主、Cloud Supabase Free 保留少量服务** | **目前原样不符合 Free 额度** | 可能降低托管费用并保留必要 Cloud 服务 | 当前 DB ~2.51 GB，Storage 元数据 ~2.12 GB，均超过常见 Free 限额；继续维护双面权威且涉及归档/暂停策略 | [#94](https://github.com/retailpulses/.github/issues/94) 单独研究 |
| **C. 按 Domain Split Cloud/Local** | FEASIBLE | 易做渐进迁移 | 长期保留跨面调用、Schema/身份、复制游标及冲突复杂度；可能仍需 Pro | 仅在明确业务依赖要求时采用 |
| **D. 保持现状 Pro** | FEASIBLE | 迁移投入最少，托管平台负责部分运维功能 | 每月 $25 费用，Cloud/Local 双架构仍存在 | 若 A 的工程/运维成本超过简化收益，则合理 |

**Free 方案的额外事实：** Cloud 的 591 个 Ticket 附件约 2106 MB，加 3 个收据约 17 MB（按对象 metadata），因此 **#94 不只是删除 `source_import_rows` 一个大表就能完成**；还必须重新设计证据对象的存储与下载。Free 当前额度、自动暂停、降级条件和实际账单应以 [Supabase 定价页](https://supabase.com/pricing) 和 #94 独立核查为准。

### 成本模型（明确区分事实与假设）

- **已确认基线：** Sponsor 确认 Supabase Pro **$25/月 = $300/年**；尚未核对实际账单中的可变费用。
- **粗略工程范围（规划估计，不是实测）：** 约 **11–26 单工程师工作日**：消费者/网络清单 1–3，独立 Stack/数据库/Auth 兼容 2–4，Workers/VPS 接入 2–5，文件签名交付/对象/Broker 2–5，备份恢复 2–4，演练与回滚设计 2–5。存在重叠和未知，不能将其视为承诺工期。
- **假设敏感性：** 如果额外自托管日常工作为 1–3 小时/月，即 12–36 小时/年；以**举例而非实际计价**的 $50/小时机会成本计算，仅增量人工就是 $600–1800/年，超过 $300 订阅基线。若单纯以 $25/月节省作为目标，$50/小时意味着最多容纳 **0.5 小时/月** 的新增人工（还不包括异机备份、电费、意外故障）。
- **正确决策依据：** 将**减少跨数据面同步/权限/发布故障和降低重复架构复杂度**所产生的收益，与工程一次性投入、备份、维护和安全责任综合比较。**A 可以技术可行，但经济性不一定胜出。**

## 9. 后续实施思路（不是可行性研究的关闭条件）

这些是未来**独立实施授权**才执行的工作：

1. **明确消费者和数据权威：** 核对当前部署的 Cloudflare/VPS 版本、所有有效连接和 External URL；记录按 Domain 的写入所有者。区分历史仓库名与实际运行时。
2. **隔离候选环境：** 以版本固定、自托管 Docker Compose 构建**不同于 `local-supabase-smoke`** 的 Production Candidate；独立数据卷、Secrets、Roles、TLS/入口。
3. **先验证最大差异点：** 一个 Worker→私有 PostgREST 的连通性、Tickets 文件签名下载代理、GitHub OIDC Broker、Auth/RLS 与 PG17 SQL 兼容。
4. **设计备份与恢复：** 加密异机拷贝、检查和恢复；根据用户实际可接受的计划停机和业务影响确定 RPO/RTO，而不是默认零停机。
5. **做迁移 rehearsal：** 官方 roles/schema/data 导出，约 2.12 GB 私有对象另外拷贝和校验；独立验证、Auth 重新登录策略、禁用双写、可回滚。
6. **只有实施批准后才安排生产变更：** 更新 URL/Secrets、逐域切换、读回一致性、运行观察及最终 Cloud 退出。**本研究没有进行以上改动。**

## 10. 未验证项与风险登记

| 未验证事实 | 为什么不妨碍本次“技术可行”结论 | 何时必须解决 |
| --- | --- | --- |
| 60–90 天历史 uptime/峰值负载 | 已有可运行事实，不能据缺失历史资料推断“不可自托管”；但不能声明当前 SLA | 实施容量/故障分析 |
| 异机加密备份、PITR、完整恢复实测 | 属自托管需建立的运营能力；没有找到可靠的现有恢复证据 | 实施前的恢复策略与上线验收 |
| Workers VPC 在当前账号的使用资格/Beta 后续变化 | 官方存在可行实现路径，尚未在公司账户证明 | 网络方案选择/试点 |
| 生产所有消费者与活跃 Secret 清单 | 已证明多个明确的服务依赖，**不是全量流量追踪** | URL/Secrets 替换前 |
| Storage 历史对象/签名链接生命周期 | 已证明外部 URL 交付约束，迁移实现细节待设计 | Tickets/收据原型 |
| 具体 Auth token/logout、SMTP、OAuth 配置 | 官方说明可迁移用户但令牌/配置需独立处理 | 认证设计/迁移 rehearsal |
| Cloud 实际流量/费用和自托管增量人工 | 不影响技术路径，影响 Business GO | 投资与实施授权 |
| 46 张无 RLS 的 public 表具体暴露范围 | **不能仅凭开关判断安全风险**，需要 GRANT/API/exposed schema 审查 | 安全设计前 |

### 最终状态

- **完成：** 证据汇总、核心依赖、不可忽略的文件 URL 约束、网络技术路径、官方迁移机制、四方案比较、成本敏感性、分阶段实施建议。
- **研究结论：** **方案 A 可行，商业性条件判断；没有发现结构性 NO-GO。**
- **未执行：** 一切 Schema/生产数据写入、对外新开端口、服务重启/生产部署、用户会话迁移、订阅切换。
- **规范归属：** 本文为**唯一整理后的研究报告**；[#93 Issue](https://github.com/retailpulses/.github/issues/93) 保留工作历史和初始原始证据；[#94](https://github.com/retailpulses/.github/issues/94) 单独负责 Free Plan 可行性；任何正式产品架构调整仍需纳入 [#90](https://github.com/retailpulses/.github/issues/90) 及 [#341](https://github.com/retailpulses/inbox/issues/341) 对应的决策流程。

## 11. 主要资料与溯源

**内部代码/治理：**
- [GitHub #93 原始完整调查](https://github.com/retailpulses/.github/issues/93#issuecomment-6785632922)
- [Commerce Ops 生产运行时清单](https://github.com/retailpulses/commerce-ops/blob/main/docs/PRODUCTION_RUNTIME_INVENTORY.md)
- [Commerce Ops 跨域 PostgreSQL 17 replay](https://github.com/retailpulses/commerce-ops/blob/main/docs/CROSS_DOMAIN_DATABASE_ASSEMBLY.md)
- [Database Ownership Registry](https://github.com/retailpulses/rp-governance-kit/blob/main/docs/DATABASE_OWNERSHIP.yaml)、[Workloads Registry](https://github.com/retailpulses/rp-governance-kit/blob/main/docs/DATABASE_WORKLOADS.yaml)
- [Inquiry Worker](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/worker/wrangler.toml)、[Tickets Worker](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/web/worker/wrangler.toml)、[Ticket Share Handler](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/web/worker/src/handlers/ticket-shares.ts)、[Receipt Adapter](https://github.com/retailpulses/commerce-ops/blob/main/apps/ops-portal/gateway/receipts/supabase-adapter.mjs)、[Orders API Env](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/portal-api/src/env.mjs)
- [CatalogSync VPS 部署说明](https://github.com/retailpulses/CatalogSync/blob/main/deploy/vps/README.md)、[Ticket Deployment Broker](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/supabase/functions/ticketing-deployment-broker/index.ts)
- [Replica 故障记录 inbox#415](https://github.com/retailpulses/inbox/issues/415)、[本地 DSN 权限冲突 store-ops#217](https://github.com/retailpulses/store-ops/issues/217)

**供应商官方机制（账号级适配仍需验证）：**
- [Supabase Self Hosting](https://supabase.com/docs/guides/self-hosting)、[Docker](https://supabase.com/docs/guides/self-hosting/docker)、[Platform → Self-hosted Restore](https://supabase.com/docs/guides/self-hosting/restore-from-platform)
- [Cloudflare Workers VPC Private API](https://developers.cloudflare.com/workers-vpc/examples/private-api/)、[VPC Service](https://developers.cloudflare.com/workers-vpc/configuration/vpc-services/)、[定价](https://developers.cloudflare.com/workers-vpc/platform/pricing/)
- [Supabase Pricing](https://supabase.com/pricing)
