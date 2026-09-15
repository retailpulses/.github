# Retailpulses

面向日本市场的电商运营与软件团队。这里是组织级入口：优先从最常用仓库进入，再查看当前 Active Engineering WIP、Issue Dashboard 与跨仓库 Issue Triage。

## 最常用仓库

| 仓库 | 定位 | 适合处理… |
|---|---|---|
| [inbox](https://github.com/retailpulses/inbox) | 跨仓库协调与组合管理 | 新需求、归属不明确事项、调查、handover、知识沉淀、跨仓库决策 |
| [commerce-ops](https://github.com/retailpulses/commerce-ops) | Canonical 运营端应用源码 | Ops Portal、Inquiry、Orders/Tickets 整合、共享 commerce runtime 工作 |
| [CatalogSync](https://github.com/retailpulses/CatalogSync) | 商品目录与平台同步 | 库存、可售状态、平台状态、同步逻辑 |
| [RPagentOS](https://github.com/retailpulses/RPagentOS) | Agent 驱动的电商运营 | 运营闭环、Agent 负责的电商任务、Listing intelligence |
| [boutique-listing](https://github.com/retailpulses/boutique-listing) | Listing 工具 | Listing 创建、编辑与发布流程 |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit) | 工程治理 | 架构标准、runtime/workload 治理、工程规范 |

## Active Engineering WIP

这是优先查看的执行层视图：只保留正在实施、部署、验证，或因 genuine hard block / owner approval 而暂停的工作。Open Issue 本身不等于 Active WIP。最后执行复核：**2026-09-15 JST**。

| 优先级 | 当前工作 | 本轮推进后的状态 | 本轮实际推进 | 下一步 / Hard block | Canonical 记录 |
|---|---|---|---|---|---|
| P0 | Supabase API 安全边界加固 | **执行中** — Batch 0+1、后续 broad RPC hardening 已生产落地；首轮 12-view `security_invoker` activation 因 caller canary 失败按 stop condition 回滚，随后 corrective PR #72 已生产完成：11 个兼容 view 使用 invoker semantics，`baserow_886994_compat_vw` 保留 definer 但撤销 PUBLIC/anon/authenticated SELECT | 重新读取 #104 最新生产证据，纠正此前“views 尚未处理”的旧状态；确认 PR #71 的失败 canary 与 PR #72 corrective activation 已形成安全闭环 | 继续按 #104 剩余 DoD 收敛 table/RLS、`search_path`、`supabase_admin` future-function defaults、runtime identity / Advisor residual；任何新 hosted migration 仍需独立 production canary | [inbox #104](https://github.com/retailpulses/inbox/issues/104) · [PR #71](https://github.com/retailpulses/commerce-ops/pull/71) · [corrective PR #72](https://github.com/retailpulses/commerce-ops/pull/72) |
| P0 | Commerce Ops 生产源码 / deployment ownership cutover | **部分完成 / runtime-bound** — Ops Portal、Inquiry、Orders 已有 `commerce-ops` exact-SHA 生产 readback；Orders VPS run #34821378666 已验证。当前证据仍不足以把 Tickets 与 database/migration-source ownership 标记 Done | 本轮重新核对 #13 与相关 PR；未发现可证明 Tickets exact-SHA source cutover 已完成的新证据，避免把“deploy workflow 存在”误写成 cutover 完成 | **Hard block：当前执行环境没有 Cloudflare/VPS production runtime 控制面。** 在有 production runtime access 的 execution session 完成 Tickets exact-SHA cutover、business smoke、rollback readback，再收敛 database migration ownership/history gate | [commerce-ops #13](https://github.com/retailpulses/commerce-ops/issues/13) · [Orders run](https://github.com/retailpulses/commerce-ops/actions/runs/34821378666) · [database governance #115](https://github.com/retailpulses/inbox/issues/115) |
| P1 | CatalogSync release retention / VPS 磁盘复发防护 | **Implementation ready / awaiting production approval** — 不再是“等待 assign coding agent”；bounded retention 已实现为 CatalogSync PR #204 | 新增 `prune-releases.sh`、deterministic tests 与 runbook，并将 retention **直接集成进 canonical `catalogsync-deploy-adapter.sh`**，因此 direct/manual/Codex deploy 与可选 GitHub workflow 共用同一路径、不依赖 Actions。保护所有 live symlink targets（含 `current` / `marketplace-current`）、一跳 `PREVIOUS_RELEASE` rollback、最新 5 个 release；未知目录不删，broken link fail-safe skip。实现过程中发现并修正“按 SHA 而非 timestamp 排序”的潜在 retention bug | **Hard block：首次 production activation 会删除历史 release，属于高影响操作，需要明确批准。** 批准后 merge/deploy，并记录 pre/post symlink + release count/disk usage + WeCom watcher readback | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [CatalogSync PR #204](https://github.com/retailpulses/CatalogSync/pull/204) · [watcher PR #108](https://github.com/retailpulses/inbox/pull/108) |
| P1 | Mercari 收据开具工具 | **实施中 / runtime-validation blocked** — draft PR #58 已从 Ops-side scaffold 推进到 OrderMgmt live owner snapshot contract | 本轮实现 authenticated `/api/internal/mercari/receipt-snapshot`、复用现有 server-side Mercari token convention、live `orderTransaction(id)` snapshot、product coupon discount / paid amount normalization、recipient fallback 与相关 tests；同时更新 PR/Issue，移除“owner endpoint 尚不存在”的旧 blocker | GitHub Actions 两个 CI job 均在 runner 启动前失败（0 steps），当前环境也无 VPS shell/token runtime，因此无法取得 live validation。**Hard block：需要 repo-capable/VPS runtime** 验证 COMPLETED / non-completed / wrong-shop / coupon order；通过后继续 POST re-fetch、immutable persistence、private Storage、PDF、10-day signed link、E2E 与 controlled deploy | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [draft PR #58](https://github.com/retailpulses/commerce-ops/pull/58) · [coupon follow-up #59](https://github.com/retailpulses/commerce-ops/issues/59) |

## Issue Dashboard

这里回答“整个 backlog 有多大”，而不是只展示被挑进 Triage 的少量 Issue。统计口径为 GitHub **open Issue（排除 PR）**，快照时间 **2026-09-15 JST**。

**组织全量：318 open Issues。** 下列 10 个主要工程仓库合计 **239**；其他 Retailpulses 仓库合计 **79**。因此下面的 Issue Triage 只是 material management queue，绝不代表完整 backlog。

| 主要仓库 | Open Issues | 当前管理含义 |
|---|---:|---|
| [inbox](https://github.com/retailpulses/inbox/issues) | **85** | 最大的跨仓库 portfolio / research / governance backlog；Active WIP 当前关联 #104、#106 |
| [ticket-handling](https://github.com/retailpulses/ticket-handling/issues) | **30** | 仍有大量 legacy / Ticket-domain backlog；source cutover 需与 commerce-ops #13 区分 |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/issues) | **26** | sync/runtime backlog；当前重点包括 #201–#203、#188、#157/#147 |
| [RPagentOS](https://github.com/retailpulses/RPagentOS/issues) | **24** | Agent / catalog owner backlog；含 hosted migration-history governance |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/issues) | **23** | Canonical commerce app backlog；Active WIP 当前关联 #13、#57 |
| [OrderMgmt](https://github.com/retailpulses/OrderMgmt/issues) | **18** | 过渡 / legacy Orders backlog；新 source ownership 应优先检查 commerce-ops cutover 状态 |
| [boutique-listing](https://github.com/retailpulses/boutique-listing/issues) | **17** | Listing tool backlog；含长期 open bundle workspace work |
| [inquiry-automation](https://github.com/retailpulses/inquiry-automation/issues) | **7** | 过渡 Inquiry backlog |
| [workers](https://github.com/retailpulses/workers/issues) | **7** | Worker/runtime backlog |
| [ops-portal](https://github.com/retailpulses/ops-portal/issues) | **2** | Legacy Ops Portal repo backlog；canonical app work 优先看 commerce-ops |
| **主要仓库 subtotal** | **239** | 上述 10 repo |
| **Retailpulses org total** | **318** | 所有组织仓库；排除 PR |
| **其他仓库** | **79** | `318 - 239`；用于提示 dashboard scope，不代表全部都需要立即 triage |

## Issue Triage

这里是管理层面的精选 Issue 视图，**不重复完整 backlog，也不把所有 open Issue 冒充成 Active WIP**。只列尚未进入明确执行、需要重新分类/决策、存在状态冲突，或有时间窗口的 material Issue。

| 优先级 | Issue / 分类 | Triage 状态 | 下一步决策 / 动作 | Canonical Issue |
|---|---|---|---|---|
| P0 | CatalogSync interrupted / degraded workloads | **状态冲突 / needs authoritative reconciliation** — #147 仍要求 unknown-result 在 replay/write 前完成核对；#157 又记录多个 degraded/blocked workload | 以 live scheduler + immutable release + business-level output 为权威证据逐 workload 核对；unknown-result 未明确前禁止猜测性 replay/write | [CatalogSync #157](https://github.com/retailpulses/CatalogSync/issues/157) · [#147](https://github.com/retailpulses/CatalogSync/issues/147) |
| P1 | CatalogSync L0 health follow-ups | **NEW / actionable** — #202 针对 `rakuten-inventory`，#203 把已验证的 Mercari Shop4 L0 contract 延伸到 Shops 1–3；两者由 umbrella #110 拆出 | 保持 owner-local、per-workload evidence；分别完成 schedule/release/business-output readback、五态 evaluator 与 natural observation，不再把 umbrella #110 永久留作执行单元 | [CatalogSync #202](https://github.com/retailpulses/CatalogSync/issues/202) · [#203](https://github.com/retailpulses/CatalogSync/issues/203) · [inbox #110](https://github.com/retailpulses/inbox/issues/110) |
| P1 | Amazon SP-API 2026-09-28 product-type changes | **deadline-sensitive** — production quantity-sync 是否受影响尚未验证 | 在 **2026-09-28 前**确认 production endpoint/feed，并给出 affected / not affected 结论；只有确受影响才做最小修复 | [CatalogSync #201](https://github.com/retailpulses/CatalogSync/issues/201) |
| P1 | Mercari Supabase read / egress 放大 | **READY / 未进入执行** — #188 已定义 incremental candidate、durable mapping cache 与 daily full reconciliation | 有 capacity 后先做 instrumentation + durable mapping cache，再做 crash-safe incremental cursor；没有实际执行证据前不进入 Active WIP | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [mapping #187](https://github.com/retailpulses/CatalogSync/issues/187) |
| P1 | RPagentOS hosted migration history | **BLOCKED / evidence mismatch** — #133 的 exact version set 与长期 open PR #36 的旧 shared-history scope 不一致 | 核对 hosted exact versions / canonical owner；不要把旧 PR #36 直接当成 #133 实现，必要时 supersede 后做 focused PR | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) |
| P1 | Rakuten Ticket Portal send button disabled | **未诊断** | 用 ticket 的 platform/session state 与 send-capability contract 做 read-only diagnosis；确认是产品约束还是 UI eligibility bug 后再实施 | [commerce-ops #67](https://github.com/retailpulses/commerce-ops/issues/67) |
| P2 | Boutique bundle workspace | **STALE / open PR since 2026-06** | 对照当前 #76 product need 做 relevance review：仍需要则 rebase/merge + production visual smoke；需求已变化则 supersede/close | [boutique-listing #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |
| P2 | Open PR hygiene / source-of-truth drift | **需要清理** — 存在 Issue 已 closed/completed、implementation PR 仍 open 且 production evidence 未对齐的情况（例如 CatalogSync #193 / PR #194） | 通过 #111 做 canonicality review：每个 stale/orphan PR 选择 merge、supersede 或 close；先纠正事实再统计 WIP | [inbox #111](https://github.com/retailpulses/inbox/issues/111) · [CatalogSync PR #194](https://github.com/retailpulses/CatalogSync/pull/194) |

### 如何使用此页面

1. **先看 Active Engineering WIP**：回答“工程现在实际在推进什么、这一轮推进到了哪里、真正卡在哪里”。
2. **再看 Issue Dashboard**：回答“全局 backlog 有多大，主要 repo 的 open Issue 分布是什么”。
3. **最后看 Issue Triage**：回答“哪些 material Issue 值得进入执行、收口、合并、supersede 或重新判断”。
4. 打开 canonical Issue / PR / workflow run 查看详细证据；审批或产品决定直接留在对应 GitHub artifact。
5. Active work 完成后立即从 WIP 移出；Issue 未关闭不代表它必须继续占据 WIP。

GitHub artifacts 始终是详细工程事实的 source of truth；本页只是组织层面的执行、规模与 triage 索引。

## Runtime / 过渡仓库

以下仓库仍具有运营意义，但部分源码权威正在迁移至 `commerce-ops`。开始新的工程工作前，应先检查当前状态与 cutover 证据。

| 仓库 | 当前定位 |
|---|---|
| [OrderMgmt](https://github.com/retailpulses/OrderMgmt) | Commerce Ops cutover 期间的现有订单 runtime / legacy source |
| [inquiry-automation](https://github.com/retailpulses/inquiry-automation) | 现有 inquiry runtime / 过渡仓库 |
| [ticket-handling](https://github.com/retailpulses/ticket-handling) | 现有 ticket runtime / 过渡仓库 |
| [skills](https://github.com/retailpulses/skills) | 共享 Agent skills 与 capabilities |
| [retailpulses-tool-services](https://github.com/retailpulses/retailpulses-tool-services) | 共享工具与服务集成 |

## 工作应放到哪里

- **不确定归属，或跨多个仓库？** → [inbox](https://github.com/retailpulses/inbox)
- **Operator app / shared commerce platform / 当前整合工作？** → [commerce-ops](https://github.com/retailpulses/commerce-ops)
- **Catalog、库存或 marketplace 同步？** → [CatalogSync](https://github.com/retailpulses/CatalogSync)
- **Agent 运营闭环或 listing intelligence？** → [RPagentOS](https://github.com/retailpulses/RPagentOS)
- **Listing 运营工具？** → [boutique-listing](https://github.com/retailpulses/boutique-listing)
- **架构 / 工程治理？** → [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)

## 治理

组织级工程与架构治理统一放在 [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)。涉及具体仓库的事实，以该仓库内的 architecture / current-state 文档为准。

> 保持本页低维护成本：最常用仓库固定置顶；Active WIP 只放真实执行中的工作；Issue Dashboard 提供 backlog 全景；Issue Triage 只放 material management queue。详细状态和证据留在对应 canonical artifact。