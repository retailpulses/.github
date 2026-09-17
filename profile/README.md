# Retailpulses

面向日本市场的电商运营与软件团队。这里是组织级工程入口：**最常用仓库保持在顶部，下面每天展示真实 Active Engineering WIP**。详细事实、审批和反馈仍落在各 canonical GitHub Issue / PR / workflow run。

## 最常用仓库

| 仓库 | 定位 | 适合处理… |
|---|---|---|
| [inbox](https://github.com/retailpulses/inbox) | 跨仓库协调与组合管理 | 新需求、调查、handover、跨仓库决策 |
| [commerce-ops](https://github.com/retailpulses/commerce-ops) | Canonical commerce 运营应用源码 | Ops Portal、Inquiry、Orders/Tickets、shared runtime |
| [CatalogSync](https://github.com/retailpulses/CatalogSync) | 商品目录与平台同步 | 库存、可售状态、marketplace sync |
| [RPagentOS](https://github.com/retailpulses/RPagentOS) | Agent 驱动的电商运营 | Catalog owner、运营闭环、Listing intelligence |
| [boutique-listing](https://github.com/retailpulses/boutique-listing) | Listing 工具 | Listing 创建、编辑、发布 |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit) | 工程治理 | Architecture、runtime/workload、database governance |

## Active Engineering WIP — 2026-09-17 JST

这里只列**正在调查、实施、部署、验证，或已推进到 genuine hard block / owner approval** 的工作。Open Issue 本身不等于 WIP。当前 MVP 不使用 3+3 agent slot 限制；每天 08:00 JST 刷新此表，Jim 从这里进入具体 artifact 手动推进。

| 优先级 | 当前工作 | 已验证状态 | 下一步 / Hard block | Canonical artifacts |
|---|---|---|---|---|
| **P0** | Giga catalog upstream / Open API 1.0 retirement | Root cause 已确认：生产仍使用已退役 Giga Open API 1.0；6,280 failures 全部成为 `GIGA_SOURCE_READ_FAILED` dead letters。False-health guard PR #212 已 merge；Open API 2.0 adapter PR #213 已完成本地 contract tests | **BLOCKED_EXTERNAL**：read-only VPS canary 对现有 production credentials 返回 `400004 Invalid sign`。需要 Giga-issued/confirmed Open API 2.0 Client ID + Secret 及 inventory/price permissions；成功 source-read 前禁止 bulk reset dead letters | [Issue #210](https://github.com/retailpulses/CatalogSync/issues/210) · [PR #212](https://github.com/retailpulses/CatalogSync/pull/212) · [PR #213](https://github.com/retailpulses/CatalogSync/pull/213) |
| **P0** | Commerce Ops post-migration runtime integrity | #86 已证明 repo merge 后存在“runtime green / business dead”风险；#87 是唯一 canonical closeout umbrella | 继续 live workload matrix，优先 revenue/customer-operation workloads；验证 owner/release/scheduler/business signal，具体缺陷再拆 child remediation | [Issue #87](https://github.com/retailpulses/commerce-ops/issues/87) · [incident #86](https://github.com/retailpulses/commerce-ops/issues/86) |
| **P0/P1** | Shop4 top-seller listing coverage gap | `N504P384909A` 等 top-seller 未覆盖具有直接 revenue risk；同时 #210 表明 supplier freshness 当前不能作为 bulk-listing 决策依据 | 可并行做 read-only exact-SKU forensic：Giga → owner candidate/mapping → live Shop4。Bulk remediation 等 #210 freshness 恢复 | [Issue #207](https://github.com/retailpulses/CatalogSync/issues/207) |
| **P1** | Giga→Mercari intermittent owner API timeout | Exit 2 已收窄到 RPagentOS `/api/internal/catalog/listing-scores/batch` timeout；相邻小时可成功。Checkpoint safety guard PR #214 已 merge，未部署 | 需要 owner-side latency/request correlation，确定 slow query / saturation / network；之后 immutable deploy #214 并观察 natural failed→recovered cycle | [Issue #211](https://github.com/retailpulses/CatalogSync/issues/211) · [PR #214](https://github.com/retailpulses/CatalogSync/pull/214) |
| **P1** | Production Monitor POC → MVP | 方向保持 **EXTEND existing mature monitoring**，不自建完整 observability platform；业务 health probe 与 commodity monitoring 分层 | 收敛 POC 为 thin business-health contract；验证 Orders ownership、Giga business freshness、Sales Brief 三类 failure semantics | [Issue #120](https://github.com/retailpulses/inbox/issues/120) · [PR #121](https://github.com/retailpulses/inbox/pull/121) |
| **P1** | Commerce Ops production-source cutover | Ops Portal / Inquiry 已有 commerce-ops provenance；整体仍未通过 Done Gate | 完成 Tickets exact-SHA deploy/business smoke/rollback 与 database migration-source governance；结合 #87 runtime integrity evidence | [Issue #13](https://github.com/retailpulses/commerce-ops/issues/13) · [database governance #115](https://github.com/retailpulses/inbox/issues/115) |
| **P1** | CatalogSync release retention / VPS disk recurrence | Bounded retention implementation 已 merge；保护 referenced releases + rollback window，但 MERGED ≠ DONE | 首次 production cleanup 会删除历史 release，需要显式 production approval；执行前后记录 disk、release count、symlink targets、watcher readback | [Issue #106](https://github.com/retailpulses/inbox/issues/106) · [CatalogSync PR #204](https://github.com/retailpulses/CatalogSync/pull/204) |
| **P1** | Ops Portal operator access incident | 已确认 Access policy 与 gateway subject/capability 是两层边界；尚未证明拒绝发生在哪层 | 需要 production Cloudflare/gateway evidence；只恢复目标 operator，不用 wildcard workaround | [Issue #89](https://github.com/retailpulses/commerce-ops/issues/89) |

## Issue Dashboard

统计口径：GitHub open **Issues**（排除 PR），主要 canonical active repos，快照 **2026-09-17 JST**。

| Repo | Open Issues |
|---|---:|
| [inbox](https://github.com/retailpulses/inbox/issues) | **76** |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/issues) | **30** |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/issues) | **29** |
| [RPagentOS](https://github.com/retailpulses/RPagentOS/issues) | **23** |
| [boutique-listing](https://github.com/retailpulses/boutique-listing/issues) | **15** |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit/issues) | **8** |
| **以上主要 canonical repos 合计** | **181** |

> Issue 数量不是优先级。工程优先级按 [canonical triage methodology](https://github.com/retailpulses/inbox/blob/main/docs/17_ENGINEERING_TRIAGE_METHODOLOGY.md) 的 Business Value 主导模型判断。

## Material Issue Triage

| Priority | Issue | 当前判断 / 下一步 | Canonical URL |
|---|---|---|---|
| P0 | Giga upstream outage | Business Priority **65/65**；external v2 credential 是 genuine hard block | [CatalogSync #210](https://github.com/retailpulses/CatalogSync/issues/210) |
| P0 | Post-migration runtime integrity | Business Priority **65/65**；继续 runtime-first workload matrix，不再另建 audit | [commerce-ops #87](https://github.com/retailpulses/commerce-ops/issues/87) |
| P0/P1 | Shop4 top-seller coverage | Business Priority **61/65**；先 exact-SKU forensic，bulk remediation 等 upstream freshness | [CatalogSync #207](https://github.com/retailpulses/CatalogSync/issues/207) |
| P1 | Giga→Mercari timeout | Business Priority **52/65**；owner-side latency evidence + checkpoint guard deployment | [CatalogSync #211](https://github.com/retailpulses/CatalogSync/issues/211) |
| P1 | Supabase security boundary | 继续 caller/auth/RLS 分类；避免把 shared database security 当单 repo patch | [inbox #104](https://github.com/retailpulses/inbox/issues/104) |
| P1 | Mercari read/egress amplification | 先 instrumentation + durable mapping cache，再 incremental cursor；保留 reconciliation | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [inbox #80](https://github.com/retailpulses/inbox/issues/80) |
| P1 | RPagentOS migration history | owner/history mismatch 仍会阻断 governed deploy；先核对 exact hosted versions/owner | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) |
| P2 | Receipt issuance tool | 不是 production incident；先定 gateway dependency packaging + private persistence owner | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [PR #58](https://github.com/retailpulses/commerce-ops/pull/58) |

## 使用方式

1. 每天从本页 **Active Engineering WIP** 开始。
2. 点击 exact canonical Issue / PR / run；审批、评论、业务决定直接写在那里。
3. `inbox` 只承担跨 repo / 未明确归属 / portfolio 事项，不复制 repo-local implementation truth。
4. 完成标准以实际 evidence 为准：**PR merged 不自动等于 DONE**；需要 deploy / canary / readback 的工作必须完成对应 gate。

## Phase 2 — 暂停中的 Agent Automation

GitHub Agentic Workflow / webhook → Codex 自动 dispatch 作为 **Phase 2** 记录，当前 MVP 不启用。现阶段先验证“每天更新 GitHub organization WIP → Jim 手动进入 canonical artifact 推进”是否已经足够降低管理负担。

## Governance

- [Engineering Triage Methodology](https://github.com/retailpulses/inbox/blob/main/docs/17_ENGINEERING_TRIAGE_METHODOLOGY.md)
- [Issue Governance](https://github.com/retailpulses/inbox/blob/main/docs/14_ISSUE_GOVERNANCE.md)
- [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)
