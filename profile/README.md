# Retailpulses

面向日本市场的电商运营与软件团队。这里是组织级工程入口。详细事实、审批和反馈仍落在各 canonical GitHub Issue / PR / runtime evidence。

## 最常用仓库

| 仓库 | 定位 |
|---|---|
| [inbox](https://github.com/retailpulses/inbox) | 跨仓库 portfolio / governance / 未明确归属事项 |
| [commerce-ops](https://github.com/retailpulses/commerce-ops) | Canonical commerce 运营应用：Ops Portal、Inquiry、Orders、Tickets |
| [CatalogSync](https://github.com/retailpulses/CatalogSync) | 商品目录、库存与 marketplace synchronization |
| [RPagentOS](https://github.com/retailpulses/RPagentOS) | Product Catalog owner、运营自动化与 Listing intelligence |
| [boutique-listing](https://github.com/retailpulses/boutique-listing) | Listing 创建、编辑与发布工具 |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit) | Architecture、runtime/workload、database governance |

## Active Engineering WIP — 2026-09-17 JST

只列正在调查、实施、部署、验证，或已到 genuine hard block 的工作。排序遵循 canonical 60% Business Value / 40% Engineering Value 方法。

| Priority | Business Value | Engineering Value | 当前工作 | Post-execution state / 下一步 | Canonical artifacts |
|---|---|---|---|---|---|
| **P0** | **High · Revenue Protection / Growth** | **High** | Giga catalog upstream / Open API 1.0 retirement | Root cause 已证明；6,280 active SKUs 已 dead-letter。PR #212 false-health guard 已 merge。PR #213 v2 adapter 本地 tests 通过，但 production one-SKU read-only canary 对现有 credentials 返回 `400004 Invalid sign`。**Genuine hard block：需要 Giga-issued/confirmed Open API 2.0 Client ID/Secret + inventory/price permissions。** 成功 source read 前禁止 bulk reset/replay dead letters | [CatalogSync #210](https://github.com/retailpulses/CatalogSync/issues/210) · [PR #212](https://github.com/retailpulses/CatalogSync/pull/212) · [PR #213](https://github.com/retailpulses/CatalogSync/pull/213) |
| **P0** | **High · Revenue Protection / Operating Leverage** | **High** | Commerce Ops post-merge runtime integrity | Orders VPS Mercari discovery/lifecycle 已 VERIFIED；其余 Cloudflare capabilities 仍部分迁移。#86 已证明 RELEASE_DRIFT / GREEN-BUT-DEAD；另发现 Mercari message-sync degraded、Rakuten close transitional、legacy reconcile paths stale。**Genuine hard block：需要 fresh VPS + Cloudflare control-plane readback 才能完成全 workload matrix 和 migration closeout。** | [commerce-ops #87](https://github.com/retailpulses/commerce-ops/issues/87) · [incident #86](https://github.com/retailpulses/commerce-ops/issues/86) |
| **P1** | **High · Growth / Revenue Protection** | **Medium** | Shop4 top-seller listing coverage gap | Top seller 未上架具有直接 revenue impact。可继续 exact-SKU read-only forensic：Giga → owner candidate/mapping → live Shop4；bulk remediation 必须等待 #210 upstream freshness 恢复 | [CatalogSync #207](https://github.com/retailpulses/CatalogSync/issues/207) |
| **P1** | **High · Growth / Revenue Protection** | **High** | Giga→Mercari owner API timeout | Exit 2 已收窄到 RPagentOS listing-score batch timeout；checkpoint guard PR #214 已 merge但未部署。下一步需要 owner-side latency/request correlation，再 immutable deploy + natural-cycle verification | [CatalogSync #211](https://github.com/retailpulses/CatalogSync/issues/211) · [PR #214](https://github.com/retailpulses/CatalogSync/pull/214) |
| **P1** | **High · Revenue Protection / Strategic Enablement** | **High** | Production Monitor POC → MVP | 继续 thin business-health contract，避免自建完整 observability platform；重点验证 scheduler green 但 business stale 的 failure semantics | [inbox #120](https://github.com/retailpulses/inbox/issues/120) · [PR #121](https://github.com/retailpulses/inbox/pull/121) |
| **P1** | **High · Revenue Protection / Strategic Enablement** | **High** | Commerce Ops production-source cutover | Source consolidation 已完成较多，但 `MERGED != DONE`。Tickets exact-SHA production provenance、business smoke/rollback 和 shared migration ownership 仍需完成，并与 #87 runtime integrity evidence 对齐 | [commerce-ops #13](https://github.com/retailpulses/commerce-ops/issues/13) · [inbox #115](https://github.com/retailpulses/inbox/issues/115) |
| **P1** | **Medium · Revenue Protection / Operating Leverage** | **High** | CatalogSync release retention / VPS disk recurrence | Retention implementation 已 merge；首次 production cleanup 会删除历史 release，因此仍需显式 production approval + pre/post disk/release/symlink readback | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [CatalogSync PR #204](https://github.com/retailpulses/CatalogSync/pull/204) |

## Issue Dashboard

统计口径：GitHub open Issues（排除 PR），主要 canonical active repos；快照 2026-09-17 JST。

| Repo | Open Issues |
|---|---:|
| [inbox](https://github.com/retailpulses/inbox/issues) | **76** |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/issues) | **30** |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/issues) | **29** |
| [RPagentOS](https://github.com/retailpulses/RPagentOS/issues) | **23** |
| [boutique-listing](https://github.com/retailpulses/boutique-listing/issues) | **15** |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit/issues) | **8** |
| **主要 canonical repos 合计** | **181** |

Issue 数量表示 backlog scale，不表示 priority。

## Issue Triage

| Priority | Business Value | Engineering Value | Material Issue / 当前判断 | Next action | Canonical Issue |
|---|---|---|---|---|---|
| **P0** | High | High | Giga upstream outage：external v2 credential 已成为明确 hard block | Giga v2 credential → one-SKU read canary → mapping validation → bounded recovery | [CatalogSync #210](https://github.com/retailpulses/CatalogSync/issues/210) |
| **P0** | High | High | Commerce Ops migration closeout：已有 concrete silent-death evidence，不能按 repo merge 状态宣告完成 | fresh Cloudflare/VPS readback → complete workload matrix → remediate P0/P1 drift | [commerce-ops #87](https://github.com/retailpulses/commerce-ops/issues/87) |
| **P1** | High | Medium | Shop4 coverage gap：直接影响可售商品，但 supplier state 当前 stale | exact-SKU forensic 可并行；bulk listing 等 #210 | [CatalogSync #207](https://github.com/retailpulses/CatalogSync/issues/207) |
| **P1** | High | High | Giga→Mercari timeout：publisher 未死，但 owner dependency 间歇失败 | owner latency evidence + deploy checkpoint guard + natural recovery verification | [CatalogSync #211](https://github.com/retailpulses/CatalogSync/issues/211) |
| **P1** | Medium | High | Supabase security boundary：仍是 shared platform least-privilege / RLS / RPC exposure work | 继续 caller/runtime identity classification，再做最小 hosted cutover | [inbox #104](https://github.com/retailpulses/inbox/issues/104) |
| **P1** | Medium | High | Mercari/Supabase read amplification：full reads 与 mapping fetch 仍有成本风险 | instrumentation → durable mapping cache → crash-safe incremental cursor；daily full reconciliation 保留 | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [inbox #80](https://github.com/retailpulses/inbox/issues/80) |
| **P1** | Medium | High | RPagentOS hosted migration history：owner/history mismatch 会阻断 governed deploy | 核对 exact hosted versions 与 canonical owner；禁止 migration repair/历史重写 | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) |
| **P2** | Medium | Medium | Receipt issuance：operator MVP 有价值，但不是当前 production incident | 完成 dependency packaging/private persistence boundary，再做 PDF/storage/signed URL E2E | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [PR #58](https://github.com/retailpulses/commerce-ops/pull/58) |

## 使用方式

1. 从 **Active Engineering WIP** 进入 exact canonical artifact。
2. Issue 是 requirements / engineering facts 的 canonical work record；PR、workflow、runtime evidence 是 supporting evidence。
3. `inbox` 只承担 cross-repo / portfolio / governance，不复制 repo-local implementation truth。
4. 完成标准以实际 evidence 为准：**MERGED != DONE，SCHEDULED != RUN，DEPLOY STARTED != VERIFIED**。

## Governance

- [Engineering Triage Methodology](https://github.com/retailpulses/inbox/blob/main/docs/17_ENGINEERING_TRIAGE_METHODOLOGY.md)
- [Issue Governance](https://github.com/retailpulses/inbox/blob/main/docs/14_ISSUE_GOVERNANCE.md)
- [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)
