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

只保留正在调查、实施、部署、验证，或已推进到 genuine hard block / owner approval 的工作。Open Issue 本身不等于 Active WIP。最后执行复核：**2026-09-17 JST**。

| 优先级 | Business Value | Engineering Value | 当前工作 | 本轮推进后的状态 / 实际进展 | 下一步 / Hard block | Canonical 记录 |
|---|---|---|---|---|---|---|
| P0 | High · Revenue Protection / Growth | High | Giga catalog upstream / Open API 1.0 retirement | **Root cause 已确认。** Giga Open API 1.0 在 2026-09-14 19:28 JST 起明确拒绝 inventory/pricing；6,280 active SKUs 最终全部进入 `dead_letter`，而旧 health semantics 仍可 exit 0。今天已 merge PR #212（systemic-failure exit/health guard）到 `main`：`9080e41…`；未部署 | Draft PR #213 的 Open API 2.0 adapter 必须先在生产 credential context 跑 **one-SKU read-only canary**，确认 credential + response contract，再进入 bounded catalog canary / dead-letter recovery。当前 automation 无 ConoHa/Giga production credential execution path，属于 genuine hard block | [CatalogSync #210](https://github.com/retailpulses/CatalogSync/issues/210) · [PR #212](https://github.com/retailpulses/CatalogSync/pull/212) · [draft PR #213](https://github.com/retailpulses/CatalogSync/pull/213) |
| P1 | High · Growth / Revenue Protection | High | Giga→Mercari intermittent owner-API timeout | **失败边界已收窄。** 10:00、12:00、15:00–17:00 JST 的 exit 2 均来自 RPagentOS `/api/internal/catalog/listing-scores/batch` timeout；相邻 11:00、13:00、14:00、18:00 成功。今天已 merge PR #214 到 `main`：`f15dd803…`，lifecycle error 时不再推进 discovery checkpoint；未部署 | 需要 owner-side access/latency/request-correlation evidence 判定 slow query、saturation 或 network path；随后经 immutable release 部署 checkpoint guard 并观察 failed→recovered natural cycle。当前 automation 无 owner runtime logs/ConoHa control plane | [CatalogSync #211](https://github.com/retailpulses/CatalogSync/issues/211) · [PR #214](https://github.com/retailpulses/CatalogSync/pull/214) |
| P1 | High · Revenue Protection / Operating Leverage | High | Orders scheduler ownership / Mercari close-order | **生产业务路径已恢复并验证。** `ordermgmt_shop_order_close` ownership 已与 live Worker release `555421e…` 对齐；natural cron 完成 20/20 close，后续 run 为 0 candidates。#86 已从 active-outage P0 降为 P1 | #87 完成全部 Orders workload 的 live owner/release/timer matrix；实现 deploy→ownership renewal/self-renewal + stale ownership health detection。当前环境缺 Cloudflare/VPS control plane | [commerce-ops #86](https://github.com/retailpulses/commerce-ops/issues/86) · [#87](https://github.com/retailpulses/commerce-ops/issues/87) |
| P1 | High · Growth / Revenue Protection | Medium | Shop4 listing coverage gap / top seller 未上架 | **仍是系统性 coverage gap，但依赖顺序已改变。** Shop4 6,272 active variants 中只有 435 有 mapping，5,837 无 mapping；其中 2,443 source qty > 0。#210 证明当前 supplier inventory/pricing freshness 已全局失效，因此不能把旧 source state 当成 bulk-listing 决策依据 | **先恢复 #210 upstream freshness**；同时把 #147 收窄为历史 33-SKU forensic closeout，#211 处理当前 publisher reliability。三者完成后再做 Shop4 exact mapping/blocker dry-run；禁止基于 stale supplier state 做 bulk apply | [CatalogSync #207](https://github.com/retailpulses/CatalogSync/issues/207) · [#147](https://github.com/retailpulses/CatalogSync/issues/147) · [#157](https://github.com/retailpulses/CatalogSync/issues/157) |
| P1 | High · Operating Leverage / Revenue Protection | Medium | Ops Portal operator Gmail access incident | **Live access incident，第一层边界诊断完成。** Repo 证明同时存在 Cloudflare Access policy 与 gateway verified-subject/capability；尚无证据定位拒绝发生在哪一层，不能直接放宽 allowlist | genuine hard block：需要 Cloudflare/production-capable session 查看 Access identity decision、请求是否到达 gateway、以及 deployed subject config；只恢复目标 operator，不用 `*` workaround | [commerce-ops #89](https://github.com/retailpulses/commerce-ops/issues/89) |
| P1 | High · Revenue Protection / Operating Leverage / Strategic Enablement | High | Production Monitor POC → MVP | **Reuse gate 继续保持 EXTEND 方向。** Healthchecks 承担 commodity schedule/grace/history/notifications，Retailpulses 只保留 business-progress probes/adapters；#210 再次证明“scheduler green ≠ business healthy” | 收敛 draft PR #121 为 thin-probe acceptance POC，明确 Orders ownership、Giga business freshness、Sales Brief 三类 failure contract；不再自建完整 monitoring platform | [inbox #120](https://github.com/retailpulses/inbox/issues/120) · [draft PR #121](https://github.com/retailpulses/inbox/pull/121) |
| P1 | High · Revenue Protection / Strategic Enablement | High | Commerce Ops production-source cutover | **部分完成，仍未达到 Done Gate。** Ops Portal、Inquiry 已有 `commerce-ops` exact-SHA production provenance，Orders 已有 direct production readback；Tickets 与 database/migration-source ownership 尚需 authoritative cutover evidence | genuine hard block：需要 production-capable session 完成 Tickets exact-SHA deploy + business smoke + rollback readback，并把 #87 ownership audit 纳入最终 cutover checklist | [commerce-ops #13](https://github.com/retailpulses/commerce-ops/issues/13) · [database governance #115](https://github.com/retailpulses/inbox/issues/115) |
| P1 | Medium · Revenue Protection / Operating Leverage | High | CatalogSync release retention / VPS disk recurrence | **Implementation merged，未把 MERGED 当 DONE。** PR #204 `ee9907f…` 已把 fail-safe bounded retention 接入 canonical deploy adapter，并保护 live symlink / rollback / newest 5 releases | genuine hard block：首次 production activation 会删除历史 release，需显式 approval + production-capable session；解锁后记录 pre/post disk、release count、symlink/rollback targets 与 watcher readback | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [CatalogSync PR #204](https://github.com/retailpulses/CatalogSync/pull/204) |

## Issue Dashboard

这里回答“**整个 active engineering backlog 有多大**”，与下方只挑 material items 的 Issue Triage 明确分开。统计口径为 GitHub **open Issue（排除 PR）**，并排除 archived/superseded repositories；快照时间 **2026-09-17 JST**。

**Active organization management scope：194 open Issues。** 下列 6 个主要 active repos 合计 **180**；其他 active repos 合计 **14**。Issue Triage 只有少量 rows，不代表完整 backlog 只有这些事项。

| 主要 active repo | Open Issues | 当前管理含义 |
|---|---:|---|
| [inbox](https://github.com/retailpulses/inbox/issues) | **76** | Cross-repo portfolio / governance backlog |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/issues) | **30** | Canonical commerce application backlog |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/issues) | **29** | Catalog/platform sync backlog；含当前 #210/#211 production incidents |
| [RPagentOS](https://github.com/retailpulses/RPagentOS/issues) | **23** | Agent / catalog owner backlog |
| [boutique-listing](https://github.com/retailpulses/boutique-listing/issues) | **15** | Listing tool backlog |
| [workers](https://github.com/retailpulses/workers/issues) | **7** | Worker/runtime backlog |
| **主要 active repos subtotal** | **180** | 上述 6 repo |
| **其他 active repos** | **14** | Active scope 中其余 unarchived repos |
| **Active organization scope total** | **194** | `archived:false`；排除 PR |

> Priority labels / fields 尚未跨 repo 标准化，因此这里不伪造全量 P0/P1 统计；高优先事项由 Active WIP 与 Issue Triage 依照 canonical **60% Business Value / 40% Engineering Value** 方法显式表达。

## Issue Triage

这是管理层面的精选队列，**不是完整 backlog**。只列尚未进入明确执行、需要重新分类/决策、存在状态冲突、明显 stale，或对多个 workstream 有系统性影响的 material Issue。

| 优先级 | Business Value | Engineering Value | Issue / Triage 状态 | 下一步决策 / 动作 | Canonical Issue |
|---|---|---|---|---|---|
| P1 | High · Growth / Revenue Protection | High | Historical Giga→Mercari interrupted cohort — **canonical state conflict 已纠正**：#147 先前写“publisher remains stopped”，但 2026-09-16 live evidence 已证明 timer active 且有成功/失败 mixed runs | 把 #147 限定为原 33-SKU historical forensic closeout：逐项对 owner mapping + live Mercari；无剩余 uncertainty 就关闭/标记 runtime state 已由 #211 接管，不要为了旧恢复计划重新停 timer | [CatalogSync #147](https://github.com/retailpulses/CatalogSync/issues/147) · [#211](https://github.com/retailpulses/CatalogSync/issues/211) |
| P1 | Medium · Revenue Protection / Strategic Enablement | High | Supabase auth / RLS product boundary — emergency anonymous-write condition 已 bounded，但仍有 29 张表对 browser roles 暴露 privilege | 继续 29-table caller/auth 分类，区分 intentional browser read 与 backend-only/obsolete access；先定 product boundary，再做最小 RLS/server-mediated design | [inbox #104](https://github.com/retailpulses/inbox/issues/104) |
| P1 | Medium · Revenue Protection / Operating Leverage | High | Mercari Supabase read / egress 放大 — 架构方向明确但未进入执行 | 先 instrumentation + durable mapping cache，再做 crash-safe incremental cursor；保留 daily full reconciliation，Mercari live API 继续作为 actual listing state SoT | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [inbox #80](https://github.com/retailpulses/inbox/issues/80) |
| P1 | Medium · Strategic Enablement | High | RPagentOS hosted migration history — owner/history mismatch 会阻断受治理 deploy | 核对 hosted exact versions 与 canonical owner；不要把长期 open PR #36 自动等同于 #133 implementation，必要时 supersede 后做 focused PR | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) |
| P1 | High · Operating Leverage / Revenue Protection | Medium | Rakuten Ticket Portal send button disabled — 仍是未解释的 operator-facing 功能阻断 | 用 platform/session state + send-capability contract 做 read-only diagnosis，先区分产品 eligibility、permission 状态或 UI bug，再决定修复 | [commerce-ops #67](https://github.com/retailpulses/commerce-ops/issues/67) |
| P1 | Medium · Operating Leverage | Medium | GitHub Actions hard budget — 9月 quota 仍是 CI operating constraint，但不是 runtime dependency | 继续按 trigger/path/concurrency 砍无价值 minutes；Actions 不可用时用 local/direct validation，不通过增加预算掩盖 workflow 设计问题 | [inbox #89](https://github.com/retailpulses/inbox/issues/89) |
| P2 | Medium · Operating Leverage / Customer Service | Medium | Mercari 收据开具工具 — v7 manual-only form 已完成到 fail-closed boundary，当前不是生产故障 | 先定 gateway dependency packaging 与 private persistence/storage owner，再实现 deterministic Japanese PDF、immutable snapshot、signed URL 与 customer message | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [draft PR #58](https://github.com/retailpulses/commerce-ops/pull/58) |
| P2 | Low | Medium | Boutique bundle workspace — stale open PR，当前是否仍匹配 product need 不明确 | 对照 #76 当前需求：仍需要则 rebase/merge + visual smoke；需求已变化则 supersede/close | [boutique-listing #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |
| P2 | Low | Medium | Open PR hygiene / source-of-truth drift — 当前 CatalogSync PR #209 已因 main 前进变为 unmergeable，说明此类 drift 仍真实存在 | 用 #111 对 stale/orphan/conflicted PR 做 canonicality review：merge、rebase、supersede 或 close；PR 只能作为 evidence，不能替代 canonical Issue | [inbox #111](https://github.com/retailpulses/inbox/issues/111) |

### 如何使用此页面

1. **Active Engineering WIP**：现在实际在推进什么、推进到了哪里、真正卡在哪里。
2. **Issue Dashboard**：active backlog 有多大，以及主要 repo 的分布。
3. **Issue Triage**：哪些 material Issue 值得进入执行、收口、合并、supersede 或重新判断。
4. 排序优先考虑 **Business Value 60% / Engineering Value 40%**；active outage、security exposure、数据损坏等明确证据可以覆盖默认映射。
5. 审批、证据与技术细节保留在 canonical Issue / PR / workflow / document；本页只做组织级 projection。
6. 已完成或 superseded 的工作应从组织级视图移除，而不是长期挂在 WIP。

## Supporting repositories

- [retailpulses-tool-services](https://github.com/retailpulses/retailpulses-tool-services) — 共享 tool-service 基础设施
- [homepage](https://github.com/retailpulses/homepage) — 公司官网源码

## Work routing

- 不确定归属或跨仓库事项 → [inbox](https://github.com/retailpulses/inbox)
- Commerce/Ops Portal/Inquiry/Orders/Tickets → [commerce-ops](https://github.com/retailpulses/commerce-ops)
- 商品、库存、平台同步 → [CatalogSync](https://github.com/retailpulses/CatalogSync)
- Agent 运营任务 / Listing intelligence → [RPagentOS](https://github.com/retailpulses/RPagentOS)
- Listing UI / 编辑发布 → [boutique-listing](https://github.com/retailpulses/boutique-listing)
- 架构与治理 → [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)