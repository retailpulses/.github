# Commerce — 顶层逻辑产品设计

> **Status:** Draft / Sponsor Review（2026-11-23）  
> **Issue:** [/.github#90](https://github.com/retailpulses/.github/issues/90)  
> **Scope:** Retailpulses 自营与受托电商运营的跨组件逻辑产品  
> **Design authority:** 本文只对 Commerce **共同目标、能力划分、跨组件业务契约与系统边界**提出父级设计；组件详细行为仍由对应仓库的已批准 Design/Architecture/TRD 管理。  
> **Not authorized:** 物理合并、monorepo、数据库合并、运行时搬迁、UI 统一、生产变更。  
> **Normative context:** [Documentation Standard](../../engineering/DOCUMENTATION_STANDARD.md)（Pilot）、[Engineering Principles](../../engineering/ENGINEERING_PRINCIPLES.md)；既有有效组件决策在发生冲突时须显式调和，而非被本文自动覆盖。

## 1. Product definition

### 1.1 一个逻辑 Commerce 产品

Commerce 是一个跨平台、跨生命周期的**电商运营能力体系**，为 Operator 提供从供应商商品数据获取、商品目录及上架、价格/库存与促销、客户咨询、订单履行、售后到经营核算的可追踪业务闭环。

这里的 **one logical product** 指：
- 对外和对 Operator 可解释的共同业务目标、用户旅程、术语和责任边界；
- 组件之间有明确的输入、输出、业务身份、权威数据与失败恢复契约；
- 每个组件可拥有独立代码仓库、产品设计、发布节奏、存储、运行时及 Owner；
- 不因为组件跨仓库而失去整体流程责任，也不因逻辑统一而强行物理集中。

### 1.2 Users / outcomes

| 用户/利益相关方 | 价值与待解决问题 | 观察结果 |
|---|---|---|
| 商品与店铺 Operator | 从可靠商品事实准备跨平台 Listing，减少漏上架、重复上架、无效价格和不可发布状态 | 可核查的覆盖率、每个例外可定位和恢复 |
| 客服/订单 Operator | 将 Inquiry、Order、Ticket 关联到正确商店、商品及业务状态 | 可以追踪状态、责任人与下一步动作；无隐性丢单 |
| 采购/供应商 Operator | 供应商商品、库存、成本、采购与履约信息有来源和新鲜度 | 来源、时间、差异、人工例外明确 |
| 经营/财务 Owner | 从平台与供应商事实形成可对账的 P&L 和 Accounting 输入 | 可追溯到订单/采购/平台费用；不创建竞争账本 |
| 工程/Agent | 能从统一入口定位组件设计、Owner、数据契约和运行证据 | 不需猜测一个业务能力由哪个仓库或数据库负责 |

### 1.3 In scope / Non-goals

**In scope：** 父级能力地图、跨模块业务身份、关键旅程、责任与接口契约、资料入口、跨组件例外处理和决策机制。

**Out of scope：** 各店铺具体运营规则、API 字段字典、组件内部页面/算法、统一 UI、将财务数据变成 Commerce 共享写入库、对供应商/平台的自动写入、组织仓库重构、Cloud Supabase 退役本身。

## 2. Capability map — proposed logical contexts

以下是**逻辑分类建议**，不是对现有仓库组织或数据库 Owner 的重命名。实际 Authority 以对应组件的当前已批准设计及仓库/运行证据为准；未知处标为待核实。

| Context / ID | 对业务结果的责任 | 当前可能的实现入口（待逐项核实） | 对外主要契约 |
|---|---|---|---|
| COM-CAP-01 Supplier & Catalog Ingestion | 获取、解释供应商事实，保留 source/version/freshness | `CatalogSync`、`commerce-lab` | supplier item/variant facts → canonical identity |
| COM-CAP-02 Canonical Product & Assets | 商品与变体身份、可复用事实、图片来源与衍生资源 | `commerce-lab` canonical services | immutable/stable identity、asset provenance、freshness |
| COM-CAP-03 Listing & Publication | 店铺特定 listing identity、覆盖、准备/发布、平台回读 | `store-ops` NPL、canonical listing observations | variant × marketplace × shop、publication state |
| COM-CAP-04 Marketplace Operations | 平台特定商品、价格、库存、促销/销售操作 | `store-ops` 与现有 platform adapters | state/provenance、approval、external write receipt |
| COM-CAP-05 Inquiry & Order | 售前咨询、订单决策、履约与物流状态 | `commerce-ops` | inquiry/order/shop/product linkage、state transitions |
| COM-CAP-06 Tickets & After-sales | 售后问题、RMA、文件证据及责任流转 | `commerce-ops` | ticket/order link、secure evidence delivery |
| COM-CAP-07 Finance & Analytics | 经营核算、COGS、平台费用、对账和分析投影 | `store-ops` MonthlyPnL、既有财务系统 | governed read/import facts；finance ledger remains separately owned |
| COM-CAP-08 Shared Platform & Integration | Auth、数据库、网络、Scheduler、公共 API/Agent 能力 | 现有平台、`commerce-lab` 与服务仓库 | least-privilege access、deployment/recovery；**不是另一个商业产品** |

**边界注意：** 上表的 Supplier / Canonical、Listing 与 Marketplace Operations、Orders 与 Tickets 可能有重叠。父级设计定义业务责任的分界，不改变已有 Schema Owner 或 API Owner；具体重叠点记录在第 7 节，逐个裁定。

## 3. End-to-end journeys

### COM-WF-01 Supplier → Listing → Seller Readback
1. Supplier 数据被采集，保留供应商 ID、版本、时间及不确定性。
2. Canonical Product/Variant 决定内部稳定身份；拒绝把 Supplier item_code 当全局唯一 Listing identity。
3. Canonical Assets 和商品事实提供可核实的发布材料；价格、库存和状态保留来源及有效性。
4. Listing Preparation 根据**明确的 marketplace + shop** 查询现有发布状态，识别 OPENED、UNOPENED、UNKNOWN；未知不默认为未上架。
5. Operator 使用现有可审核的 CSV/平台流程发布；只有得到平台 readback/receipt 才更新真实发布状态。
6. 失败时保留工作项、原因和可恢复操作；不创建重复 listing 或覆盖人工编辑。

**Component detail authority:** [Commerce Catalog & Listing Draft PR #310](https://github.com/retailpulses/store-ops/pull/310)、[store-ops #307](https://github.com/retailpulses/store-ops/issues/307)、[/.github#90](https://github.com/retailpulses/.github/issues/90)。既有 2026-11-12 设计双重审批要求仍有效。

### COM-WF-02 Listing → Inquiry → Order → Fulfillment
- Inquiry / Order 使用一致的店铺、平台和商品关联上下文；历史外部 ID 与内部 identity 映射须可追溯。
- 业务状态由其所属 Domain 的权威服务写入；其他 Domain 消费已定义的投影或 API，不自行推断订单已批准/已付款/已发货。
- 当价格、库存或供应商成本需要人工确认时，审批路径须受相应订单产品规则保护；父设计不重定义具体字段或默认批准策略。
- 延迟、失败与重复 webhook 以幂等和人工例外可见为原则，具体机制由实现组件规定。

### COM-WF-03 Order → Ticket / RMA → Resolution
- Ticket 关联 Order/Shop/Actor；附件/收据的访问受身份、有效期和撤销权限约束。
- 售后行为不直接篡改原订单事实；必要状态变更经有权组件及可审计契约。
- 失败后可恢复；不得因为跨组件调用不可达而静默丢失证据或关闭 Ticket。

### COM-WF-04 Operational Facts → Monthly P&L / Accounting
- 订单、采购/COGS、平台费用、退款及其他交易流入核算层，并保留来源、期间及匹配键。
- Finance/MonthlyPnL 是独立的计算/核算责任域；父产品提供上下文和数据交换契约，不接管既有财务 SoT、仕訳或会计政策。
- 对账差异保留为可审核例外，不用未经核实的商品目录快照自动替代已存在的采购匹配事实。

## 4. Cross-component design contracts

### COM-REQ-01 — Stable business identity
**Intent:** 无论使用哪个组件，都能正确识别 Supplier item、Canonical Product/Variant、Listing（含 marketplace/shop）、Inquiry、Order、Ticket 和核算事实。  
**Required:** 标识符的 owner、mapping、有效时间及冲突策略；不以 SKU/item_code 同名认定跨平台身份。  
**Acceptance:** 给定一个真实订单/Listing，Operator 可定位权威上游记录与下游业务对象；未知关联显式标 UNKNOWN。

### COM-REQ-02 — Single authoritative writer per fact
**Intent:** 每个业务事实在一个指定阶段只有一个权威写入所有者。  
**Required:** 按 Domain 声明 writer、reader、source of truth、只读投影或 Replica；保留必要隔离。  
**Acceptance:** 跨组件数据更新不形成两个互相竞争的权威记录。

### COM-REQ-03 — Freshness and provenance
**Required:** 重要库存/价格/成本/Listing 状态必须声明来源、as-of 时间、可用性与过期处理；`synced` 等技术状态不能自动证明业务数据新鲜。  
**Acceptance:** 业务用户能识别未知、过期、未确认；自动动作不将 UNKNOWN 视为 0 或有效价格。

### COM-REQ-04 — Cross-component state transitions
**Required:** 业务状态的 Owner、触发者、前置条件、写入后 readback/receipt、重复事件和失败恢复；涉及平台外部写入保留明确操作权限。  
**Acceptance:** 在来源失败、重复事件、部分成功时不出现静默错误或未经批准的外部提交。

### COM-REQ-05 — Component independence
**Required:** 子组件保有自己的 Design、Architecture/TRD、代码、测试、部署、运行与回滚决策；父级只规范**跨组件共享语义**。  
**Acceptance:** 一项单组件修复在不改变跨组件契约时，不因 #90 被迫增加新的组织级设计审批。

### COM-REQ-06 — Traceability and discovery
**Required:** 从父级入口可以找到每个 Context 的权威子 Design、Owner、生产事实/证据入口及相互依赖。  
**Acceptance:** 新 Operator/Agent 可仅凭文档定位当前功能 owner；未核实的链接标记为 Proposed/Unknown。

### COM-REQ-07 — Separation of product and infrastructure changes
**Required:** 网络、数据库及运行时定位不由逻辑统一自动推导；迁移是独立风险/业务决策。  
**Acceptance:** #90 结束不需要 PR 合并系统代码或变更数据库；Cloud retirement [#148](https://github.com/retailpulses/.github/issues/148) 独立交付、独立生产门槛。

## 5. Documentation authority & contribution rules

```text
retailpulses/.github/products/commerce/     ← Parent logical Commerce context
  README.md                                  ← Canonical navigation / authority
  design.md                                  ← Shared business intent and contract

Existing component repositories              ← Child authoritative detail
  <component>/README or docs/...             ← Product-specific Design / Architecture / TRD
  GitHub Issues/PRs                           ← Execution / decisions / evidence
  Actual database/runtime                     ← Operational SoT / production state
```

**Precedence and conflict handling**
1. 已获批准的 Parent Design 对**明确界定的跨组件共同契约**有约束力；不能静默覆盖未审查的子产品具体业务规则。
2. 子产品 Design/Architecture 对本组件行为与实现边界保留权威；涉及跨组件契约变更时，提出对 Parent 对应 COM-REQ 的修订。
3. 产品细节、字段/接口 schema、运行参数、规则和历史证据均以子产品仓库或运行系统为准；父级只链接，不复印。
4. 若父子设计冲突或存在多个 Owner 声明，先记录冲突与证据，在 #90 或相关组件 Issue 裁定；批准后同步修订相应权威文档。
5. `/.github` 根仓库原有 Engineering Registry `design.md` 是**Engineering Registry 自身的产品设计**，不是 Commerce 设计，二者不能混淆。

**Agents 的读取顺序：** Commerce Parent README/Design → 目标子产品 README/Design/Architecture → 相关 Contract/TRD → GitHub Issue/PR → 当前代码与必要运行证据。父级文档不是自动注入每个 Agent 的指令。

## 6. Child product navigation (verification required)

| Logical context | Reference / existing evidence | Detail authority status |
|---|---|---|
| Catalog & Listing | [store-ops PR #310](https://github.com/retailpulses/store-ops/pull/310)、[Sprint #307](https://github.com/retailpulses/store-ops/issues/307) | Draft design / approval gate; **not approved by this document** |
| Supplier / Canonical | [commerce-lab canonical-lab](https://github.com/retailpulses/commerce-lab/tree/main/services/canonical-lab)、[CatalogSync](https://github.com/retailpulses/CatalogSync) | Code entry known; final Design authority to verify |
| Inquiry / Orders / Tickets | [commerce-ops](https://github.com/retailpulses/commerce-ops) | Repo known; exact component Design paths to verify |
| Marketplace Operations | [store-ops](https://github.com/retailpulses/store-ops) | Repo known; per-marketplace Design ownership to verify |
| Finance / Analytics | [store-ops MonthlyPnL](https://github.com/retailpulses/store-ops) | Accounting/finance authority remains separate; specific Design path to verify |
| Shared infrastructure | [/.github Infrastructure Registry](https://github.com/retailpulses/.github/tree/main/infrastructure)、[Database Governance](https://github.com/retailpulses/.github/blob/main/docs/DATABASE_GOVERNANCE.md) | Platform governance, **not child business product** |

## 7. Decisions, open questions, and non-decisions

| ID | Statement | Status |
|---|---|---|
| COM-DEC-01 | One overarching logical Commerce product with subordinate component products and design context | **Sponsor-approved direction, 2026-11-23** |
| COM-DEC-02 | Physical merge of repositories, databases, runtimes or UI is **not** presumed and not a #90 deliverable | **Sponsor-approved constraint** |
| COM-DEC-03 | Parent location `/.github/products/commerce/` is a cross-repo design exception; product details stay in owned repos | **Proposed for review** |
| COM-DEC-04 | Catalog & Listing approved logical scope and PR #310 / #307 design gates remain independently valid | **Existing decisions preserved** |
| COM-OPEN-01 | Does a given Supplier/Canonical/Listing fact have a unique currently deployed writer and canonical identifier? | Open — domain owner + runtime proof |
| COM-OPEN-02 | Which specific child Design files are approved and authoritative vs draft/stale? | Open — source inventory |
| COM-OPEN-03 | Where exactly should Finance/Analytics boundary end relative to Commerce and the accounting SoT? | Open — business owner |
| COM-OPEN-04 | Which shared workflow semantics need a cross-component contract, and which are component internal? | Open — minimize parent scope |

## 8. Implementation of the documentation baseline (docs only)

**Phase A — #90 review:** review this parent mission/capability map, cross-component COM-REQs, directory and exception to ordinary product-repo location; identify component owners.  
**Phase B — links and reconciliation:** inspect current component documents, fill the authoritative path / state / Owner index, record conflicts with links; update existing child docs only where an actual interface/authority conflict is accepted.  
**Phase C — adoption:** add stable navigation from `/.github/README.md` and relevant component READMEs *through separate reviewed doc changes*; use Parent COM-REQ IDs only for cross-component changes. Do not impose a mandatory organization-wide product migration.

**Definition of Done (#90):**
- Reviewed parent product goal, logical context/capability map and core cross-component contracts.
- Each currently active component is discoverable with owner, canonical detail design, inputs/outputs, SSOT and dependency boundary, or an explicit documented UNKNOWN with follow-up owner.
- Existing approved child decisions are respected; conflicts are recorded, not silently overwritten.
- At least two representative cross-component journeys can be followed end-to-end from authoritative documentation.
- No physical consolidation, production deploy, or duplicate sprint backlog required.

## 9. References
- [#90 — Logical Commerce architecture](https://github.com/retailpulses/.github/issues/90)
- [#148 — Cloud Supabase retirement project](https://github.com/retailpulses/.github/issues/148)
- [#93 — Cloud repatriation feasibility evidence](https://github.com/retailpulses/.github/issues/93)
- [Store-ops Catalog & Listing design PR #310](https://github.com/retailpulses/store-ops/pull/310)
- [Commerce Ops repo](https://github.com/retailpulses/commerce-ops)
- [Canonical Lab](https://github.com/retailpulses/commerce-lab/tree/main/services/canonical-lab)
