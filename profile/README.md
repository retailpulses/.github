# Retailpulses

面向日本市场的电商运营与软件团队。这里是组织级入口：先看最常用仓库，再看真实执行中的 Active Engineering WIP、全局 Issue Dashboard，以及精选的跨仓库 Issue Triage。

## 最常用仓库

| 仓库 | 定位 | 适合处理… |
|---|---|---|
| [inbox](https://github.com/retailpulses/inbox) | 跨仓库协调与组合管理 | 新需求、归属不明确事项、调查、handover、知识沉淀、跨仓库决策 |
| [commerce-ops](https://github.com/retailpulses/commerce-ops) | Canonical commerce 运营应用源码 | Ops Portal、Inquiry、Orders/Tickets、共享 commerce runtime |
| [CatalogSync](https://github.com/retailpulses/CatalogSync) | 商品目录与平台同步 | 库存、可售状态、平台状态、同步逻辑 |
| [RPagentOS](https://github.com/retailpulses/RPagentOS) | Agent 驱动的电商运营 | 运营闭环、Agent 任务、Listing intelligence |
| [boutique-listing](https://github.com/retailpulses/boutique-listing) | Listing 工具 | Listing 创建、编辑与发布流程 |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit) | 工程治理 | 架构标准、runtime/workload 治理、工程规范 |

## Active Engineering WIP

只保留正在调查、实施、部署、验证，或已推进到 genuine hard block / owner approval 的工作。Open Issue 本身不等于 Active WIP。最后执行复核：**2026-09-16 JST**。

| 优先级 | Business Value | Engineering Value | 当前工作 | 本轮推进后的状态 / 实际进展 | 下一步 / Hard block | Canonical 记录 |
|---|---|---|---|---|---|---|
| P1 | High · Revenue Protection / Operating Leverage | High | Orders scheduler ownership / Mercari close-order | **生产业务路径已恢复并验证。** `ordermgmt_shop_order_close` ownership 已与 live Worker release `555421e…` 对齐；09:59 JST natural cron 完成 **20/20** close，10:09 JST 后续 run 为 0 candidates。验证子项 #88 已关闭；#86 从 active-outage P0 降为 P1，永久预防仍未完成 | #87 完成全部 Orders workload 的 live owner/release/timer matrix；实现 deploy→ownership renewal/self-renewal + stale ownership health detection。当前环境缺 Cloudflare/VPS control plane，无法完成全矩阵 readback | [commerce-ops #86](https://github.com/retailpulses/commerce-ops/issues/86) · [#87](https://github.com/retailpulses/commerce-ops/issues/87) |
| P1 | High · Growth / Revenue Protection | Medium | Shop4 listing coverage gap / top seller 未上架 | **从单 SKU 升级为系统性 gap。** `N504P384909A` 在 Shop4 catalog active、无 listing mapping；source sync 已 dead-letter（`GIGA_SOURCE_READ_FAILED`，5 attempts）。Shop4 当前 **6,272** active variants，仅 **435** 有 mapping，**5,837** 无 mapping；其中 **2,443** 当前 source qty > 0 | 先完成 #147 unknown-result reconciliation 与 #157 publisher runtime truth；随后在 VPS 用既有 `--dry-run --only-sku ... --only-shop shop4` 做 exact blocker readback。当前 publisher safety gate 未解除前禁止 bulk apply/restart；同时需明确 zero-stock/presale 是否应长期保持 listing coverage | [CatalogSync #207](https://github.com/retailpulses/CatalogSync/issues/207) · [#147](https://github.com/retailpulses/CatalogSync/issues/147) · [#157](https://github.com/retailpulses/CatalogSync/issues/157) |
| P1 | High · Operating Leverage / Revenue Protection | Medium | Ops Portal operator Gmail access incident | **Live access incident，已完成第一层边界诊断。** Repo 证明存在 Cloudflare Access policy 与 gateway verified-subject/capability 两层；当前没有证据证明是哪一层拒绝，不能直接改代码或放宽 allowlist | genuine hard block：需要 Cloudflare/production-capable session 看 Access identity decision / 请求是否到达 gateway，并核对 deployed subject config；只恢复目标 operator，不用 `*` 作为 incident workaround | [commerce-ops #89](https://github.com/retailpulses/commerce-ops/issues/89) |
| P1 | High · Revenue Protection / Operating Leverage / Strategic Enablement | High | Production Monitor POC → MVP | **Reuse gate 正在收敛到 EXTEND。** Healthchecks 负责 commodity schedule/grace/history/notifications，Retailpulses 只保留 business-progress probes/adapters。#86 再次证明“green scheduler, broken business”：Worker 其他 cron 正常但 close job 被 stale ownership fence 静默阻断 | 完成 ADOPT/EXTEND/BUILD checkpoint；把 #121 收敛成 thin-probe acceptance POC，不扩成重复 monitoring platform；验证 Orders→Giga、Sales Brief 与 scheduler-ownership/business-progress 三类 failure contract | [inbox #120](https://github.com/retailpulses/inbox/issues/120) · [draft PR #121](https://github.com/retailpulses/inbox/pull/121) |
| P1 | Medium · Revenue Protection / Strategic Enablement | High | Supabase auth / RLS product boundary | **P0 exit 已完成，正式降为 P1。** PR #82 后 emergency anonymous-write condition 已 bounded。Fresh hosted readback：110 public tables，45 RLS disabled，其中 **29** 仍对 `anon`/`authenticated` 有 browser privilege | 继续 29-table caller/auth 分类，区分 intentional browser reads 与 backend-only/obsolete access；先定 product boundary 再做最小 RLS/server-mediated design。后续 hosted ACL/RLS migration 仍需独立 approval/canary/rollback | [inbox #104](https://github.com/retailpulses/inbox/issues/104) |
| P1 | High · Revenue Protection / Strategic Enablement | High | Commerce Ops production-source cutover | **部分完成，仍未达到 Done Gate。** Ops Portal、Inquiry 已有 `commerce-ops` exact-SHA production provenance，Orders 后续已有 direct production readback；Tickets 与 database/migration-source ownership 尚需最终 authoritative cutover evidence | genuine hard block：当前环境没有 Cloudflare/VPS production control plane。需要 production-capable session 完成 Tickets exact-SHA deploy + business smoke + rollback readback，并把 #87 ownership audit 纳入最终 cutover checklist | [commerce-ops #13](https://github.com/retailpulses/commerce-ops/issues/13) · [database governance #115](https://github.com/retailpulses/inbox/issues/115) |
| P1 | Medium · Revenue Protection / Operating Leverage | High | CatalogSync release retention / VPS disk recurrence | **Implementation merged，未把 MERGED 当 DONE。** PR #204 merge `ee9907f…` 已把 fail-safe bounded retention 接入 canonical deploy adapter，并保护 live symlink / rollback / newest 5 releases | genuine hard block：首次 production activation 会删除历史 release，需显式 approval + production-capable session；解锁后记录 pre/post disk、release count、symlink/rollback targets 与 WeCom watcher readback | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [CatalogSync PR #204](https://github.com/retailpulses/CatalogSync/pull/204) |
| P2 | Medium · Operating Leverage / Customer Service | Medium | Mercari 收据开具工具 | **Canonical v7 已取代 v6。** PR #58 现在是 manual-only form：Order ID / 宛名 / 領収日 / 金額 / 但し書き均由 operator 输入；不再依赖 Mercari/OrderMgmt lookup。POST 在 durable issuance 未配置前 fail closed | 定义最小 gateway dependency packaging + receipt-specific private persistence/storage ownership；之后实现 deterministic Japanese PDF、immutable snapshot、10-day signed URL、customer message 与 VPS E2E | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [draft PR #58](https://github.com/retailpulses/commerce-ops/pull/58) |

## Issue Dashboard

这里回答“**整个 active engineering backlog 有多大**”，与下方只挑 material items 的 Issue Triage 明确分开。统计口径为 GitHub **open Issue（排除 PR）**，并排除 archived/superseded repositories；快照时间 **2026-09-16 JST**。

**Active organization management scope：215 open Issues。** 下列 6 个主要 active repos 合计 **182**；其他 active repos 合计 **33**。因此 Issue Triage 只有少量 rows，不代表完整 backlog 只有这些事项。

| 主要 active repo | Open Issues | 当前管理含义 |
|---|---:|---|
| [inbox](https://github.com/retailpulses/inbox/issues) | **77** | Cross-repo portfolio / governance backlog |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/issues) | **30** | Canonical commerce application backlog |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/issues) | **27** | Catalog/platform sync backlog |
| [RPagentOS](https://github.com/retailpulses/RPagentOS/issues) | **24** | Agent / catalog owner backlog |
| [boutique-listing](https://github.com/retailpulses/boutique-listing/issues) | **17** | Listing tool backlog |
| [workers](https://github.com/retailpulses/workers/issues) | **7** | Worker/runtime backlog |
| **主要 active repos subtotal** | **182** | 上述 6 repo |
| **其他 active repos** | **33** | Active scope 中其余 unarchived repos |
| **Active organization scope total** | **215** | `archived:false`；排除 PR |

> Priority labels / fields 尚未跨 repo 标准化，因此这里不伪造全量 P0/P1 统计；高优先事项由 Active WIP 与 Issue Triage 依照 canonical 60% Business Value / 40% Engineering Value 方法显式表达。

## Issue Triage

这是管理层面的精选队列，**不是完整 backlog**。只列尚未进入明确执行、需要重新分类/决策、存在状态冲突、明显 stale，或对多个 workstream 有系统性影响的 material Issue。

| 优先级 | Business Value | Engineering Value | Issue / Triage 状态 | 下一步决策 / 动作 | Canonical Issue |
|---|---|---|---|---|---|
| P1 | High · Growth / Revenue Protection | High | Giga→Mercari interrupted/degraded publisher — legacy P0 recovery label 仍在，但当前关键是 unknown external outcomes + publisher disabled/degraded；它也是 #207 coverage gap 的直接安全依赖 | 先对 #147 的 33 pending exact marketplace outcomes 做 authoritative reconciliation，再按 #157 建 live runtime truth；unknown result 未明确前禁止 replay、bulk listing 或盲目 re-enable | [CatalogSync #147](https://github.com/retailpulses/CatalogSync/issues/147) · [#157](https://github.com/retailpulses/CatalogSync/issues/157) |
| P1 | Medium · Revenue Protection / Operating Leverage | High | Mercari Supabase read / egress 放大 — 架构方向明确但未进入执行 | 先 instrumentation + durable mapping cache，再做 crash-safe incremental cursor；保留 daily full reconciliation，Mercari live API 继续作为 actual listing state SoT | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [inbox #80](https://github.com/retailpulses/inbox/issues/80) |
| P1 | Medium · Strategic Enablement | High | RPagentOS hosted migration history — owner/history mismatch 会阻断受治理 deploy | 核对 hosted exact versions 与 canonical owner；不要把长期 open PR #36 自动等同于 #133 implementation，必要时 supersede 后做 focused PR | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) |
| P1 | High · Operating Leverage / Revenue Protection | Medium | Rakuten Ticket Portal send button disabled — 仍是未解释的 operator-facing 功能阻断 | 用 platform/session state + send-capability contract 做 read-only diagnosis，先区分产品 eligibility 约束、permission 状态或 UI bug，再决定修复 | [commerce-ops #67](https://github.com/retailpulses/commerce-ops/issues/67) |
| P1 | Medium · Operating Leverage | Medium | GitHub Actions hard budget — 9月 quota 已成为 CI operating constraint，但不是 runtime dependency | 继续按 trigger/path/concurrency 砍无价值 minutes；Actions 不可用时用 local/direct validation，不通过增加预算掩盖 workflow 设计问题 | [inbox #89](https://github.com/retailpulses/inbox/issues/89) |
| P2 | Low | Medium | Boutique bundle workspace — stale open PR，当前是否仍匹配 product need 不明确 | 对照 #76 当前需求：仍需要则 rebase/merge + visual smoke；需求已变化则 supersede/close | [boutique-listing #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |
| P2 | Low | Medium | Open PR hygiene / source-of-truth drift — 治理价值存在，但不应抢占业务/生产工作 | 用 #111 对 stale/orphan PR 做 canonicality review：merge、supersede 或 close；先纠正事实再统计 WIP | [inbox #111](https://github.com/retailpulses/inbox/issues/111) |

### 如何使用此页面

1. **Active Engineering WIP**：现在实际在推进什么、推进到了哪里、真正卡在哪里。
2. **Issue Dashboard**：active backlog 有多大，以及主要 repo 的分布。
3. **Issue Triage**：哪些 material Issue 值得进入执行、收口、合并、supersede 或重新判断。
4. 排序优先考虑 **Business Value 60% / Engineering Value 40%**；active outage、security exposure、数据损坏等明确证据可以覆盖默认映射。
5. 审批、证据与技术细节保留在 canonical Issue / PR / workflow / document；本页只做组织级 projection。
6. 已完成或 superseded 的工作应从组织级视图移除，而不是长期挂在 WIP。

## Supporting repositories

- [skills](https://github.com/retailpulses/skills) — 共享技能与 agent 能力资产
- [retailpulses-tool-services](https://github.com/retailpulses/retailpulses-tool-services) — 共享 tool-service 基础设施

## Work routing

- 不确定归属或跨仓库事项 → [inbox](https://github.com/retailpulses/inbox)
- Commerce/Ops Portal/Inquiry/Orders/Tickets → [commerce-ops](https://github.com/retailpulses/commerce-ops)
- 商品、库存、平台同步 → [CatalogSync](https://github.com/retailpulses/CatalogSync)
- Agent 运营任务 / Listing intelligence → [RPagentOS](https://github.com/retailpulses/RPagentOS)
- Listing UI / 编辑发布 → [boutique-listing](https://github.com/retailpulses/boutique-listing)
- 架构与治理 → [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)
