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

## Epic Portfolio Dashboard — 2026-09-19 JST

这里从“独立 Issue / PR 清单”升级为 **Epic-first portfolio view**。Epic 表示一个完整业务/运营/工程能力或 bounded transformation；实现可以跨仓库，也可以包含代码、数据、SOP、人工运营、会计/供应商协作和验证工作。

优先级使用 **Business Value 60% + Engineering / Delivery Value 40%**。Issue / PR 是 supporting execution evidence，不再作为组织首页的主要管理颗粒度。

| Priority | Initiative | Epic | Business Value | Eng. Leverage | Status | 当前判断 / 最近进展 | Blocker / Next Action | Canonical |
|---|---|---|---|---|---|---|---|---|
| **P0** | Catalog Reliability | **Catalog Freshness & Resilience** | **High** | **High** | Active | Giga API 1.0 retirement 暴露出 upstream failure → dead-letter → stale canonical/downstream state 的系统性 freshness 问题；已从单次 incident 提升为 freshness architecture | 优先恢复/验证 Giga 2.0 可访问 SKU，分类 4,152 dead letters，安全恢复 marketplace freshness；同时建立 freshness SLO / recovery contract | [inbox #151](https://github.com/retailpulses/inbox/issues/151) |
| **P0** | Agent-Driven Engineering Capability | **Deterministic Engineering Delivery Controls** | **High** | **Critical** | Active | 已识别 orphan PR、未进 main、merged≠deployed、dirty worktree、重复 regression 等为 control failure，而非单次 agent mistake | 建立 Standards → deterministic control coverage matrix；先落 main-before-deploy、PR terminal state、worktree hygiene、completion evidence 等 P0 controls | [inbox #153](https://github.com/retailpulses/inbox/issues/153) |
| **P0** | Commerce Fulfillment | **Marketplace Fulfillment Runtime Ownership & Reliability** | **High** | **High** | Active | Mercari VPS cutover 已进入 exact canary / ownership / natural-cycle acceptance；Rakuten 10/1 cutover 作为同一 capability 的平台 workstream | 完成 Mercari production acceptance + legacy retirement；并行准备 Rakuten cutover，避免按 marketplace 重复造架构 | [Mercari #123](https://github.com/retailpulses/commerce-ops/issues/123) · [Rakuten #152](https://github.com/retailpulses/commerce-ops/issues/152) |
| **P0** | Commerce Fulfillment | **Mercari Multi-unit Purchase Readiness** | **High** | **High** | Active | Multi-unit 已确认需要真实库存与 order-line/partial-cancel 安全性；sandbox 不再作为 hard block | 完成 partial cancellation / procurement safety、真实库存 rollout 与 live acceptance | [commerce-ops #115](https://github.com/retailpulses/commerce-ops/issues/115) |
| **P0/P1** | Product Content & Listing Growth | **Product Visual / Listing Image Capability** | **Critical** | **High** | Radar / forming | 已确认这是独立高价值 capability：asset model、SPU/variant关系、readiness、sequence、generation/transformation、platform rules、publish/read-back、效果学习；现有 codebase 成熟度不能代表业务价值 | 把近期 image data-model/design 收敛成 v1 capability roadmap；建立 canonical Epic anchor，并把 #64、Boutique/RPagentOS image work 纳入 | [inbox #64](https://github.com/retailpulses/inbox/issues/64) · [portfolio #149](https://github.com/retailpulses/inbox/issues/149) |
| **P0/P1** | Financial Operations | **Accounting & Financial Operations Capability** | **High** | **High** | Active / forming | FY3 closing、canonical accounting archive、freee API round-trip、税务/工资/社保 evidence 已形成一个完整业务能力，而非零散 admin tasks | 优先完成 FY3 close control 与 freee POC；再把 recurring controls 纳入统一 accounting capability | [Accounting POC #6](https://github.com/retailpulses/inbox/issues/6) · [FY3 #133](https://github.com/retailpulses/inbox/issues/133) |
| **P1** | Engineering Capability | **Critical Capability & Regression Test Governance** | **Medium** | **High** | Active | 已从“测试数量”转向 capability-centered regression governance；WS1 正建立 Critical Capability Registry | 完成 capability registry → test coverage/gap matrix → incident-to-regression mapping | [inbox #146](https://github.com/retailpulses/inbox/issues/146) |
| **P1** | Engineering Capability | **CI / Runner Execution Architecture** | **Medium** | **High** | Active | 双 Mac runner 已运行；重点从单机 POC 转为 workload placement、queue/cache、macOS compatibility、production isolation 与第二节点 | 继续 daily runner evidence；完成 workload classification / routing policy，并决定 VPS second node | [inbox #147](https://github.com/retailpulses/inbox/issues/147) |
| **P1** | Runtime Reliability | **Runtime Business Health & Observability** | **High** | **High** | Active | Production Monitor 方向已明确：检测 green scheduler / broken business，而不是再造通用 observability platform | 推进 thin health-contract POC/MVP，并把 Catalog/Commerce critical runtime 接入统一 business-health view | [inbox #120](https://github.com/retailpulses/inbox/issues/120) |
| **P1** | Portfolio Operations | **Daily Epic Portfolio Review & Prioritization** | **High** | **High** | Active | Epic metadata 已开始回填；组织首页从 Issue/PR-first 升级为 Epic-first | 完成 active Epic registry、每日 material-progress review、priority drift/blocker/next-action 更新自动化 | [inbox #154](https://github.com/retailpulses/inbox/issues/154) |

### Portfolio rules

- **Epic first**：组织首页只展示需要管理层持续关注的 capability / transformation；Issue/PR 作为证据链接。
- **Cross-repo is normal**：Epic 可以跨 Inbox、CatalogSync、commerce-ops、boutique-listing、RPagentOS。
- **Business work counts**：Epic 下可以包含工程、运营、数据、内容、SOP、会计、供应商/外部协作，不要求所有工作都产生代码。
- **MERGED != DONE**：完成标准看目标状态和 evidence，不看 PR 是否合并。
- **No artificial progress**：每日没有 material change 就保持状态，不制造活动。
- **Priority can move**：deadline、business impact、hard blocker、dependency 变化时允许重新排序，并保留依据。

### Daily review focus

每天对 Active Epic 只回答八个问题：状态、material progress、evidence、hard blocker、next action、是否需要 Jim 介入、priority 是否漂移、child Issue/PR 是否出现 orphan/stale。

详细执行事实仍留在 canonical Issue / PR；本页只保留足够做 portfolio decision 的信息。

## 使用方式

1. 从 **Active Engineering WIP** 进入 exact canonical artifact。
2. Issue 是 requirements / engineering facts 的 canonical work record；PR、workflow、runtime evidence 是 supporting evidence。
3. `inbox` 只承担 cross-repo / portfolio / governance，不复制 repo-local implementation truth。
4. 完成标准以实际 evidence 为准：**MERGED != DONE，SCHEDULED != RUN，DEPLOY STARTED != VERIFIED**。

## Governance

- [Engineering Triage Methodology](https://github.com/retailpulses/inbox/blob/main/docs/17_ENGINEERING_TRIAGE_METHODOLOGY.md)
- [Issue Governance](https://github.com/retailpulses/inbox/blob/main/docs/14_ISSUE_GOVERNANCE.md)
- [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)
