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
| P0 | Supabase API 安全边界加固 | **执行中** — broad SECURITY DEFINER RPC、mutable `search_path`、unexplained definer-view findings 已归零；backend-only table batches #73–#75 已继续生产收敛，RLS-disabled 且仍 browser-accessible 的 table 从当日 baseline **45 → 31**，Advisor 到 **81 total = 31 ERROR / 49 INFO / 1 WARN** | 复核 #104 最新生产证据并纠正旧 dashboard；确认 PR #73–#75 已分别收紧 AgentOS execution/audit、import/intelligence、review backend tables/views，未扩大 browser/base-table 权限 | 继续按 caller/runtime identity 把剩余 31 tables 分成 backend-only、client-accessible+RLS、intentional public；**Hard block 仅适用于新的 hosted migration / production ACL-RLS activation，需要独立 production canary/授权。** `supabase_admin` future-function default ACL 维持 platform-owned residual，不用不安全 role-membership workaround | [inbox #104](https://github.com/retailpulses/inbox/issues/104) · [PR #73](https://github.com/retailpulses/commerce-ops/pull/73) · [PR #74](https://github.com/retailpulses/commerce-ops/pull/74) · [PR #75](https://github.com/retailpulses/commerce-ops/pull/75) |
| P0 | OrderMgmt 已暴露 credential rotation | **Repo-side cleanup complete / provider rotation hard-blocked** — 当前 `main` 已不再硬编码 Baserow token / Supabase service-role key，但历史 Git/旧 clone 中的旧值不能靠删代码失效 | 核对 PR #279 已 merge；直接读取当前 `scripts/compare-sales-brief.mjs`，确认改为 `requireEnv("BASEROW_DATABASE_TOKEN")` / `requireEnv("SUPABASE_SERVICE_ROLE_KEY")` fail-closed；在 #280 留下精确 closure sequence | **Hard block：credential/security-sensitive provider action。** 需要从 authoritative Baserow / Supabase 轮换或撤销旧 credential，并安全更新所有仍合法依赖的 secret stores；不得把值贴到 Issue/chat/log。完成后验证 old values unusable + legitimate consumer smoke + sanitized scan | [OrderMgmt #280](https://github.com/retailpulses/OrderMgmt/issues/280) · [PR #279](https://github.com/retailpulses/OrderMgmt/pull/279) |
| P0 | Commerce Ops 生产源码 / deployment ownership cutover | **部分完成 / runtime-bound** — Ops Portal、Inquiry、Orders 已有 `commerce-ops` exact-SHA 生产 readback；Orders VPS run #34821378666 已验证。当前证据仍不足以把 Tickets 与 database/migration-source ownership 标记 Done | 重新核对 #13 最新证据：早期 Environment credential blocker 已解决，Orders VPS cutover 已完成；当前不能再把旧“等待 Orders approval”当作事实 | **Hard block：当前执行环境没有 Cloudflare/VPS production runtime 控制面。** 在有 production runtime access 的 execution session 完成 Tickets exact-SHA cutover、business smoke、rollback readback，再收敛 database migration ownership/history gate | [commerce-ops #13](https://github.com/retailpulses/commerce-ops/issues/13) · [Orders run](https://github.com/retailpulses/commerce-ops/actions/runs/34821378666) · [database governance #115](https://github.com/retailpulses/inbox/issues/115) |
| P1 | CatalogSync release retention / VPS 磁盘复发防护 | **Merged / production activation hard-blocked** — bounded retention 已进入 `CatalogSync/main`，merge SHA `ee9907f6a69b0f6c477c0ef71affec76fe95304f`；不是“等待 coding/merge” | Review 完整 patch 后直接 squash-merge PR #204；实现保护所有 live symlink targets、一跳 `PREVIOUS_RELEASE` rollback、最新 5 个 timestamp-sorted releases；unknown/manual dir 不删，broken release link 时 fail-safe skip；并更新 inbox #106 | **Hard block：首次 production activation 会实际删除历史 release，属于高影响操作，需要 owner approval + production-capable session。** 解锁后执行一次 canonical deploy，记录 pre/post symlink、release count/disk usage、retained rollback target 与 WeCom watcher readback | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [merged PR #204](https://github.com/retailpulses/CatalogSync/pull/204) · [watcher PR #108](https://github.com/retailpulses/inbox/pull/108) |
| P1 | Mercari 收据开具工具 | **实施中 / runtime-validation blocked** — draft PR #58 已从 Ops-side scaffold 推进到 OrderMgmt live owner snapshot contract | 本轮重新确认 PR #58 是 `commerce-ops` 当前唯一 open PR；owner snapshot、coupon paid amount、recipient fallback 与 fail-closed logic 已在 branch，未把 CI 0-step 当作 test success | GitHub-hosted CI 受 Actions hard budget 约束，当前环境也无 VPS Mercari token/runtime。**Hard block：需要 repo-capable/VPS runtime** 验证 COMPLETED / non-completed / wrong-shop / coupon order；通过后继续 POST re-fetch、immutable persistence、private Storage、PDF、10-day signed link、E2E 与 controlled deploy | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [draft PR #58](https://github.com/retailpulses/commerce-ops/pull/58) · [Actions budget #89](https://github.com/retailpulses/inbox/issues/89) |

## Issue Dashboard

这里回答“整个 backlog 有多大”，而不是只展示被挑进 Triage 的少量 Issue。统计口径为 GitHub **open Issue（排除 PR）**，快照时间 **2026-09-15 JST**。

**组织全量：317 open Issues。** 下列 10 个主要工程仓库合计 **238**；其他 Retailpulses 仓库合计 **79**。因此下面的 Issue Triage 只是 material management queue，绝不代表完整 backlog。Priority label/field 在各 repo 并未统一，所以这里不伪造全量 P0/P1 计数；高优先事项通过 Active WIP / Issue Triage 显式列出。

| 主要仓库 | Open Issues | 当前管理信号 |
|---|---:|---|
| [inbox](https://github.com/retailpulses/inbox/issues) | **85** | 最大的 cross-repo portfolio / governance backlog；Active WIP 关联 #104、#106；Actions constraint 由 #89 跟踪 |
| [ticket-handling](https://github.com/retailpulses/ticket-handling/issues) | **30** | 大量 legacy / Ticket-domain backlog；source cutover 状态必须与 commerce-ops #13 分开判断 |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/issues) | **25** | 本轮关闭 #201 后由 26 → 25；重点仍有 #202/#203、#188、#157/#147 |
| [RPagentOS](https://github.com/retailpulses/RPagentOS/issues) | **24** | Agent / catalog owner backlog；含 hosted migration-history governance |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/issues) | **23** | Canonical commerce app backlog；Active WIP 关联 #13、#57 |
| [OrderMgmt](https://github.com/retailpulses/OrderMgmt/issues) | **18** | 过渡 / legacy Orders backlog；Active security owner-action #280 |
| [boutique-listing](https://github.com/retailpulses/boutique-listing/issues) | **17** | Listing tool backlog；含长期 open bundle workspace work |
| [inquiry-automation](https://github.com/retailpulses/inquiry-automation/issues) | **7** | 过渡 Inquiry backlog |
| [workers](https://github.com/retailpulses/workers/issues) | **7** | Worker/runtime backlog |
| [ops-portal](https://github.com/retailpulses/ops-portal/issues) | **2** | Legacy Ops Portal repo backlog；canonical app work 优先看 commerce-ops |
| **主要仓库 subtotal** | **238** | 上述 10 repo |
| **Retailpulses org total** | **317** | 所有组织仓库；排除 PR |
| **其他仓库** | **79** | `317 - 238`；用于提示 dashboard scope，不代表全部都需要立即 triage |

## Issue Triage

这里是管理层面的精选 Issue 视图，**不重复完整 backlog，也不把所有 open Issue 冒充成 Active WIP**。只列尚未进入明确执行、需要重新分类/决策、存在状态冲突，或有明确系统性影响的 material Issue。

| 优先级 | Issue / 分类 | Triage 状态 | 下一步决策 / 动作 | Canonical Issue |
|---|---|---|---|---|
| P0 | CatalogSync interrupted / degraded workloads | **状态冲突 / needs authoritative reconciliation** — #147 仍要求 unknown-result 在 replay/write 前完成核对；#157 又记录多个 degraded/blocked workload | 以 live scheduler + immutable release + business-level output 为权威证据逐 workload 核对；unknown-result 未明确前禁止猜测性 replay/write | [CatalogSync #157](https://github.com/retailpulses/CatalogSync/issues/157) · [#147](https://github.com/retailpulses/CatalogSync/issues/147) |
| P1 | CatalogSync L0 health follow-ups | **NEW / actionable** — #202 针对 `rakuten-inventory`，#203 把已验证的 Mercari Shop4 L0 contract 延伸到 Shops 1–3；两者由 umbrella #110 拆出 | 保持 owner-local、per-workload evidence；分别完成 schedule/release/business-output readback、五态 evaluator 与 natural observation，不再把 umbrella #110 永久留作执行单元 | [CatalogSync #202](https://github.com/retailpulses/CatalogSync/issues/202) · [#203](https://github.com/retailpulses/CatalogSync/issues/203) · [inbox #110](https://github.com/retailpulses/inbox/issues/110) |
| P1 | GitHub Actions consumption / hard budget | **Systemic operating constraint** — #89 已有真实 billing baseline 与首轮 concurrency 优化；当前 hard budget 会让部分 CI 在 `runner_id=0 / steps=[]` 前失败，不能把这些 run 当成 code-test failure | 继续按 #89 做组织级 trigger/path/concurrency 优化；保留 deterministic safety gates。Active WIP 在 Actions 不可用时优先 local/direct validation，不用擅自提高预算绕过约束 | [inbox #89](https://github.com/retailpulses/inbox/issues/89) |
| P1 | Mercari Supabase read / egress 放大 | **READY / 未进入执行** — #188 已定义 incremental candidate、durable mapping cache 与 daily full reconciliation；跨 repo Supabase 风险仍由 inbox #80 协调 | 有 capacity 后先做 instrumentation + durable mapping cache，再做 crash-safe incremental cursor；用 #80 保持 egress / platform-risk cross-repo ownership | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [inbox #80](https://github.com/retailpulses/inbox/issues/80) |
| P1 | RPagentOS hosted migration history | **BLOCKED / evidence mismatch** — #133 的 exact version set 与长期 open PR #36 的旧 shared-history scope 不一致 | 核对 hosted exact versions / canonical owner；不要把旧 PR #36 直接当成 #133 实现，必要时 supersede 后做 focused PR | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) |
| P1 | Rakuten Ticket Portal send button disabled | **未诊断** | 用 ticket 的 platform/session state 与 send-capability contract 做 read-only diagnosis；确认是产品约束还是 UI eligibility bug 后再实施 | [commerce-ops #67](https://github.com/retailpulses/commerce-ops/issues/67) |
| P2 | Boutique bundle workspace | **STALE / open PR since 2026-06** | 对照当前 #76 product need 做 relevance review：仍需要则 rebase/merge + production visual smoke；需求已变化则 supersede/close | [boutique-listing #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |
| P2 | Open PR hygiene / source-of-truth drift | **需要清理** — 存在 Issue 已 closed/completed、implementation PR 仍 open 且 production evidence 未对齐的情况（例如 CatalogSync #193 / PR #194） | 通过 #111 做 canonicality review：每个 stale/orphan PR 选择 merge、supersede 或 close；先纠正事实再统计 WIP | [inbox #111](https://github.com/retailpulses/inbox/issues/111) · [CatalogSync PR #194](https://github.com/retailpulses/CatalogSync/pull/194) |

> 本轮已把 CatalogSync #201 从 Triage 移出：已沿 production code path + Amazon 官方 2026-09-28 变更说明完成 affected/not-affected 判断，结论为当前 inventory-only `fulfillment_availability` PATCH **not affected**，Issue 已 closed；因此 org open Issue 由 318 → 317。

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