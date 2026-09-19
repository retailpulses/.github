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

## Program & Epic Portfolio Dashboard — 2026-09-19 JST

组织首页采用 **Program → Epic → Issue/PR evidence** 的管理视角，而不是平铺 Issue / PR。

当前 Program v0.1：

1. **Commerce Growth** — listing quality、content/image、pricing/promotion、channel growth。
2. **Commerce Operations** — order → fulfillment → inquiry → after-sales。
3. **Data & Engineering Platform** — catalog/data/runtime reliability + agent-driven engineering capability。
4. **Company Operations** — accounting、closing、statutory/admin controls。

> 当前仍在清理 stale/completed backlog 和收敛 Epic 边界。Four-Program mapping 是 working draft，不代表所有 Issue 已正式迁移。

### Epic execution gate

**Priority ≠ Readiness。** 高业务价值 Epic 可以是 P0，但如果还没有定义清楚，就不能进入开发。

| Readiness | 含义 | Allowed work |
|---|---|---|
| **EMPTY** | 只有问题/机会，尚无可靠边界与 DoD | discovery / research only |
| **DEFINING** | 正在形成 scope、architecture、workstreams、DoD | audit / design / planning |
| **DEFINED** | 已通过 Epic readiness gate | development / operational execution |

**Only well-defined Epics can start development.**

Defined Epic 至少应具备：problem/opportunity、target outcome、scope/non-scope、current-state evidence、capability/architecture direction、initial workstreams、dependencies、DoD、success measures、priority rationale。

### Current priority radar

| Priority | Program | Epic | Readiness | Value | Eng. Leverage | Current focus | Canonical |
|---|---|---|---|---|---|---|---|
| **P0** | Data & Engineering Platform | **Catalog Freshness & Resilience** | **DEFINED** | High | High | Giga upstream → canonical → marketplace freshness recovery；建立 freshness SLO / recovery contract | [#151](https://github.com/retailpulses/inbox/issues/151) |
| **P0** | Data & Engineering Platform | **Deterministic Engineering Delivery Controls** | **DEFINED** | High | Critical | 把 Engineering Standards 落成 deterministic controls：main-before-deploy、orphan PR、worktree hygiene、completion evidence | [#153](https://github.com/retailpulses/inbox/issues/153) |
| **P0** | Commerce Operations | **Marketplace Fulfillment Runtime Ownership & Reliability** | **DEFINED** | High | High | Mercari VPS cutover / production acceptance；Rakuten 作为同一 capability 的平台 workstream | [Mercari #123](https://github.com/retailpulses/commerce-ops/issues/123) · [Rakuten #152](https://github.com/retailpulses/commerce-ops/issues/152) |
| **P0** | Commerce Operations | **Mercari Multi-unit Purchase Readiness** | **DEFINED** | High | High | partial cancellation / procurement safety、真实库存 rollout、live acceptance | [#115](https://github.com/retailpulses/commerce-ops/issues/115) |
| **P0/P1** | Commerce Growth | **Product Visual / Listing Image Capability** | **DEFINING** | Critical | High | 收敛 image data model + capability layer + operator/publish/read-back workflow；**未过 readiness gate 前不启动新的 feature development** | [Image context #64](https://github.com/retailpulses/inbox/issues/64) · [Portfolio #149](https://github.com/retailpulses/inbox/issues/149) |
| **P0/P1** | Company Operations | **Accounting & Financial Operations** | **DEFINING** | High | High | FY3 closing + canonical archive + freee round-trip；收敛 recurring financial/statutory controls 到一个 capability | [POC #6](https://github.com/retailpulses/inbox/issues/6) · [FY3 #133](https://github.com/retailpulses/inbox/issues/133) |
| **P1** | Data & Engineering Platform | **Critical Capability & Regression Test Governance** | **DEFINED** | Medium | High | capability registry → coverage/gap matrix → incident-to-regression permanence | [#146](https://github.com/retailpulses/inbox/issues/146) |
| **P1** | Data & Engineering Platform | **CI / Runner Execution Architecture** | **DEFINED** | Medium | High | workload placement、runner reliability、queue/cache、production isolation、second node | [#147](https://github.com/retailpulses/inbox/issues/147) |
| **P1** | Data & Engineering Platform | **Runtime Business Health & Observability** | **DEFINING** | High | High | thin health-contract model，重点检测 green scheduler / broken business | [#120](https://github.com/retailpulses/inbox/issues/120) |
| **P1** | Data & Engineering Platform | **Epic Portfolio Review & Automation** | **DEFINED** | High | High | Four-Program mapping、stale cleanup、Epic metadata/readiness、daily dashboard automation | [#154](https://github.com/retailpulses/inbox/issues/154) |

### Portfolio operating rules

- **Program first, Epic execution**：管理层首先看 4 个 Program；实际推进以 well-defined Epic 为单位。
- **Priority ≠ Readiness**：P0 Empty/Defining Epic 的最高优先动作是把 Epic 定义清楚，而不是开始编码。
- **Cross-repo is normal**：Epic 可以跨 Inbox、CatalogSync、commerce-ops、boutique-listing、RPagentOS。
- **Business work counts**：Epic 可包含工程、运营、数据、内容、SOP、会计、供应商/外部协作和人工验证。
- **Capability > code volume**：现有代码少不代表业务优先级低。
- **MERGED != DONE**：完成看 capability target state 与 evidence。
- **DOCUMENTED != ENFORCED**：critical engineering standards 应逐步转为 deterministic control。
- **No artificial progress**：没有 material change 就保持状态。
- **Stale cleanup first**：旧 backlog 先判定 completed / superseded / stale，再用于 Program/Epic 规划。

### Daily review focus

每天从 Program → Epic review：

1. Readiness 是否仍正确；是否有未定义 Epic 在偷偷开发；
2. material progress + evidence；
3. genuine hard blocker；
4. single next action；
5. 是否需要 Jim 决策/批准；
6. priority/value 是否发生变化；
7. child Issue/PR 是否 orphan/stale；
8. Epic 是否达到 DoD，应关闭或转入 routine operation。

详细事实仍保留在 canonical Issue / PR，本页只保留 portfolio decision 所需信息。

### Canonical portfolio method

- [Epic & Portfolio Operating Method](https://github.com/retailpulses/inbox/blob/main/system%20design/playbooks/epic-and-portfolio-operating-method.md)
- [Four-Program Review Draft](https://github.com/retailpulses/inbox/blob/portfolio/four-program-review-draft/system%20design/artifacts/four-program-portfolio-review-draft-2026-09-19.md)
- [Portfolio Audit #149](https://github.com/retailpulses/inbox/issues/149)
- [Daily Portfolio Epic #154](https://github.com/retailpulses/inbox/issues/154)

## 使用方式

1. 从 **Program & Epic Portfolio Dashboard** 进入对应 canonical Epic / evidence。
2. Issue 是 requirements / engineering facts 的 canonical work record；PR、workflow、runtime evidence 是 supporting evidence。
3. `inbox` 只承担 cross-repo / portfolio / governance，不复制 repo-local implementation truth。
4. 完成标准以实际 evidence 为准：**MERGED != DONE，SCHEDULED != RUN，DEPLOY STARTED != VERIFIED**。

## Governance

- [Engineering Triage Methodology](https://github.com/retailpulses/inbox/blob/main/docs/17_ENGINEERING_TRIAGE_METHODOLOGY.md)
- [Issue Governance](https://github.com/retailpulses/inbox/blob/main/docs/14_ISSUE_GOVERNANCE.md)
- [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)
