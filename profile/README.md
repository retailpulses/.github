# Retailpulses

面向日本市场的电商运营与软件团队。

这个页面是 **组织级 Portfolio / Triage 首页**。它不是 Issue 列表，也不是实现状态的第二份数据库；它从公司目标向下回答：

> **我们现在在推进哪些 Program？每个 Program 下有哪些 Epic？每个 Epic 的下一层执行 Issue / evidence 在哪里？**

详细事实、实现状态、审批和完成证据始终保留在对应的 canonical GitHub Issue / PR / runtime evidence。

---

## Portfolio hierarchy

```text
Company / Business Goal
        ↓
Program
        ↓
Epic
        ↓
Issue / Workstream
        ↓
Task / PR / Manual Action
        ↓
Deploy / Read-back / Operational Evidence
```

### 层级定义

| Level | 用途 | Canonical record |
|---|---|---|
| **Program** | 公司级战略结果；容纳多个相关 capability / transformation | 通常由 `inbox` 协调 |
| **Epic** | 一个可完成、可验收的 business capability 或 bounded transformation | canonical Epic Issue |
| **Issue / Workstream** | 可独立交付的 feature、investigation、incident remediation、operational change | owning repository Issue |
| **Task / PR / Action** | 执行单元 | PR / task / manual action |
| **Evidence** | 证明结果真正发生 | deploy SHA / runtime read-back / operational evidence |

**管理层从 Program → Epic 看；执行层从 Epic → Issue → evidence 看。**

---

# 1. Programs

当前 Portfolio 使用三个顶层 Program。Program 是稳定的战略分组，不应因为 repository 重组而频繁变化。

## Program A — Commerce

**Outcome:** 建立并持续改善从 product/catalog → listing → marketplace operation → fulfillment → inquiry/after-sales → growth 的完整电商业务系统。

原 **Program B — Commerce Operations 已完整并入 Program A**。Commerce Growth 与 Commerce Operations 不再作为两个顶层 Program 分开管理。

### Active / defining Epics

| Epic | Readiness | Current outcome / focus | Canonical |
|---|---|---|---|
| **Cross-platform Commerce Growth** | DEFINED | Mercari / Rakuten / Amazon JP 的可衡量增长、margin-safe execution 和跨渠道优先级 | [#267](https://github.com/retailpulses/inbox/issues/267) |
| **Canonical Product Facts & Multi-platform Listings** | DEFINED | canonical product facts、copy impact、platform adapters、listing drift/read-back | [#202](https://github.com/retailpulses/inbox/issues/202) |
| **Canonical Product Images** | DEFINED | canonical image set、asset provenance、quality review、platform image sets | [#218](https://github.com/retailpulses/inbox/issues/218) |
| **Marketplace Fulfillment Runtime Ownership & Reliability** | DEFINED | Mercari / Rakuten fulfillment runtime ownership、production acceptance、recovery | [Mercari #123](https://github.com/retailpulses/commerce-ops/issues/123) · [Rakuten #152](https://github.com/retailpulses/commerce-ops/issues/152) |
| **Mercari Multi-unit Purchase Readiness** | DEFINED | partial cancellation / procurement safety、真实库存 rollout、live acceptance | [#115](https://github.com/retailpulses/commerce-ops/issues/115) |
| **Marketplace Offer & Commercial Operations** | DEFINING | seller/offer、price/inventory/promotion 的 canonical operational loop | [#234](https://github.com/retailpulses/inbox/issues/234) |

Commerce Program 可以跨 `commerce-ops`、`CatalogSync`、`boutique-listing`、`inbox` 等 repository；repository boundary 不决定 Program boundary。

---

## Program C — Data & Engineering Platform

**Outcome:** 让 runtime、agent-driven engineering delivery、CI/testing 和工程治理具备可靠、可恢复、可验证的基础能力。\n\nCatalog 业务能力不再放在 Program C；其中 **Catalog Freshness & Resilience #151 已移入 Program A**。

### Active Epics

| Epic | Readiness | Current outcome / focus | Canonical |
|---|---|---|---|
| **Catalog Freshness & Resilience** | DEFINED | Giga upstream → canonical → marketplace freshness；freshness SLO / recovery contract | [#151](https://github.com/retailpulses/inbox/issues/151) |
| **Engineering Delivery Reliability & Release Safety** | DEFINED | deterministic merge/release controls、staging/acceptance、runtime reconciliation、engineering hygiene | [#153](https://github.com/retailpulses/inbox/issues/153) |
| **Critical Capability & Regression Test Governance** | DEFINED | capability registry → coverage/gap matrix → incident-to-regression permanence | [#146](https://github.com/retailpulses/inbox/issues/146) |
| **Local Execution & Verification Platform** | DEFINED | workload placement、runner reliability、queue/cache、production isolation | [#147](https://github.com/retailpulses/inbox/issues/147) |
| **Runtime Business Health & Observability** | DEFINING | 检测“scheduler green / business broken”；建立 thin health-contract model | [#120](https://github.com/retailpulses/inbox/issues/120) |
| **Epic Portfolio Review & Automation** | DEFINED | Program mapping、Epic metadata/readiness、stale cleanup、dashboard operating loop | [#154](https://github.com/retailpulses/inbox/issues/154) |

---

## Program D — Company Operations

**Outcome:** 建立可靠的 accounting、fiscal close、tax/social-insurance、payroll/HR、administrative controls 和公司运营证据链。

Canonical Program control plane: [#157](https://github.com/retailpulses/inbox/issues/157)

### Active Epics

| Epic | Readiness | Current outcome / focus | Canonical |
|---|---|---|---|
| **Accounting & Fiscal Operations** | DEFINED | FY3/FY4 closing、canonical accounting archive、P&L/accounting foundation、freee reconciliation | [#299](https://github.com/retailpulses/inbox/issues/299) |
| **Tax, Social Insurance & Statutory Operations** | DEFINED | recurring tax/social-insurance payments、filings、notices、annual calendar、evidence and deadline control | [#300](https://github.com/retailpulses/inbox/issues/300) |
| **Payroll, HR & Company Administration** | DEFINED | monthly payroll、HR/payroll data、onboarding/offboarding、役員報酬及其他公司行政 | [#301](https://github.com/retailpulses/inbox/issues/301) |

Program D 的 Epic 不限于软件开发。Recurring payment、filing、manual reconciliation、evidence capture 等运营动作都是正式 execution work。

---

# 2. Epic execution gate

**Priority ≠ Readiness。**

高价值或紧急的 Epic 仍然必须先有足够定义，才能进入 implementation。

| Readiness | Meaning | Allowed work |
|---|---|---|
| **EMPTY** | 已识别机会/问题，但 target state 和边界不足 | discovery / research |
| **DEFINING** | 正在形成 scope、architecture、workstreams、DoD | audit / design / planning |
| **DEFINED** | 已通过 readiness gate | development / operational execution |

一个 DEFINED Epic 至少应明确：

1. Problem / opportunity
2. Target outcome
3. Scope / non-scope
4. Current-state evidence
5. Capability / architecture direction
6. Initial workstreams / child Issues
7. Dependencies / hard constraints
8. Definition of Done
9. Success measures
10. Priority rationale

**只有 `epic-readiness:defined` 的 Epic 才进入 implementation / operational execution。**

---

# 3. Epic → Issue execution model

每个 Epic 应成为下层工作的唯一 portfolio parent，而不是让 Program 直接连接大量零散 Issue。

```text
Program
└── Epic (target state + DoD)
    ├── Issue / Workstream A
    │   ├── PR
    │   └── runtime / payment / filing / read-back evidence
    ├── Issue / Workstream B
    │   └── operational evidence
    └── Issue / Workstream C
        └── PR / deploy / acceptance
```

### Issue triage

一个 Issue 应能明确回答：

- **Parent Epic**：它服务哪个 Epic？
- **Owner / repository**：事实和实现归谁？
- **Deliverable**：这个 Issue 独立完成什么？
- **Next action**：下一步是什么？
- **Evidence / DoD**：什么证明它完成？

没有有效 Parent Epic 的长期工作应被检查：它可能是新 Epic 的 discovery、routine operation、incident，或者 stale/orphan work。

---

# 4. Portfolio review

日常 review 顺序固定为：

**Program → Epic → child Issues → evidence**

对每个 active Epic 检查：

1. **State** — active / blocked / watch / done
2. **Readiness** — EMPTY / DEFINING / DEFINED 是否仍正确
3. **Material progress** — target state 有什么真实变化
4. **Evidence** — merge / deploy / runtime read-back / completed operational action
5. **Hard blocker** — 是否存在真正的 external / authority / dependency block
6. **Next action** — 单一最有价值的下一步
7. **Decision required** — 是否需要 owner / Jim 决策
8. **Child hygiene** — orphan / stale Issue 或 PR
9. **Completion** — 是否已达到 Epic DoD，应关闭并转入 routine operation

如果没有 material change，就保持 **no material change**；不要制造进度。

---

# 5. Completion rules

Portfolio completion 以 outcome 和 evidence 为准：

- **MERGED != DONE**
- **SCHEDULED != RUN**
- **DEPLOY STARTED != VERIFIED**
- **PAYMENT SCHEDULED != PAID**
- **FILING PREPARED != FILED**
- **DOCUMENTED != ENFORCED**

PR 是 implementation evidence，不是 Portfolio outcome。

跨 repository 是正常状态：Epic 可以同时包含 `inbox`、`commerce-ops`、`CatalogSync`、`RPagentOS`、`boutique-listing` 或其他 owning repositories 的 Issue。

---

# 6. Canonical control plane

## Portfolio / cross-repo coordination

- [inbox](https://github.com/retailpulses/inbox) — Program / Epic coordination、cross-repo governance、未明确归属事项
- [Epic & Portfolio Operating Method](https://github.com/retailpulses/inbox/blob/main/system%20design/playbooks/epic-and-portfolio-operating-method.md)
- [Portfolio Audit #149](https://github.com/retailpulses/inbox/issues/149)
- [Daily Portfolio Epic #154](https://github.com/retailpulses/inbox/issues/154)

## Primary execution repositories

| Repository | Ownership |
|---|---|
| [commerce-ops](https://github.com/retailpulses/commerce-ops) | Ops Portal、Inquiry、Orders、Tickets、commerce operational runtime |
| [CatalogSync](https://github.com/retailpulses/CatalogSync) | Catalog、inventory、marketplace synchronization |
| [RPagentOS](https://github.com/retailpulses/RPagentOS) | Product Catalog owner、automation、listing intelligence |
| [boutique-listing](https://github.com/retailpulses/boutique-listing) | Listing creation / editing / publishing |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit) | Deterministic repository governance controls |

## Governance references

- [Engineering Triage Methodology](https://github.com/retailpulses/inbox/blob/main/docs/17_ENGINEERING_TRIAGE_METHODOLOGY.md)
- [Issue Governance](https://github.com/retailpulses/inbox/blob/main/docs/14_ISSUE_GOVERNANCE.md)

---

## Source-of-truth rule

这个组织首页应保持为 **thin portfolio view**。

Program / Epic 定义、决策历史、Issue 状态和执行证据不应只存在于本 README。Canonical management knowledge 应落在 `retailpulses/inbox` 或对应 owning repository；这个页面只负责把最重要的 top-down 结构投影到 GitHub organization 首页。
