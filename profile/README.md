# Retailpulses

面向日本市场的电商运营与软件团队。这里是组织级入口：先看最常用仓库，再看真实执行中的 Active Engineering WIP、全局 Issue Dashboard，以及精选的跨仓库 Issue Triage。

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

这是优先查看的执行层视图：只保留正在实施、部署、验证，或已推进到 genuine hard block / owner approval 的工作。Open Issue 本身不等于 Active WIP。最后执行复核：**2026-09-15 JST**。

| 优先级 | 当前工作 | 本轮推进后的状态 | 本轮实际推进 | 下一步 / Hard block | Canonical 记录 |
|---|---|---|---|---|---|
| P0 | Supabase API 安全边界加固 | **执行中 / auth-RLS boundary reached** — broad SECURITY DEFINER RPC、mutable `search_path`、unexplained definer-view findings 已归零；backend-only table batches 将 RLS-disabled + browser-accessible tables **45 → 31**，Advisor 到 **81 = 31 ERROR / 49 INFO / 1 WARN** | 本轮直接做 fresh hosted read-only inventory：剩余 **31 tables 全部 RLS disabled、0 policies，并向 `anon` + `authenticated` 暴露 CRUD**；已精确拆为 22 catalog/listing + 2 project + 7 task tables。同步修正 remediation manifest、RPC classification、RLS/grants doc 与 object-access manifest，使 canonical docs 与 production 一致 | **Hard block：剩余 31 已不是 inventory discovery 问题，而是 browser caller identity + authorization/RLS 产品边界。** 在明确合法客户端、session identity 与 policy 前不能 blanket revoke/enable RLS；后续 hosted ACL/RLS migration 仍需独立 production canary/授权 | [inbox #104](https://github.com/retailpulses/inbox/issues/104) · [RLS/grants](https://github.com/retailpulses/commerce-ops/blob/main/docs/supabase-audit/p0/rls-and-grants-cutover.md) · [object access manifest](https://github.com/retailpulses/commerce-ops/blob/main/docs/supabase-audit/p0/object-access-manifest.csv) |
| P0 | OrderMgmt 已暴露 credential rotation | **Repo-side cleanup complete / provider rotation hard-blocked** — 当前 `main` 不再硬编码 Baserow token / Supabase service-role key，但历史 Git/旧 clone 中的旧值不会因删除源码而失效 | 核对 PR #279 已 merge；读取当前 `compare-sales-brief.mjs`，确认改为 `BASEROW_DATABASE_TOKEN` / `SUPABASE_SERVICE_ROLE_KEY` env fail-closed；在 #280 写入精确 rotation closure sequence | **Hard block：credential/security-sensitive provider action。** 需在 Baserow + Supabase authority 轮换/撤销旧值，并安全更新所有合法 secret stores；之后证明旧值失效、合法 consumer smoke 通过，再 close | [OrderMgmt #280](https://github.com/retailpulses/OrderMgmt/issues/280) · [PR #279](https://github.com/retailpulses/OrderMgmt/pull/279) |
| P0 | Commerce Ops 生产源码 / deployment ownership cutover | **部分完成 / runtime-bound** — Ops Portal、Inquiry、Orders 已有 `commerce-ops` exact-SHA production readback；Orders VPS cutover 已验证。Tickets 与 database/migration-source ownership 尚未达到 Done Gate | 本轮重新核对 #13：早期 Environment credential blocker 已解决，Orders 已成功切换；不再保留“等待 Orders approval”的旧状态 | **Hard block：当前 execution environment 没有 Cloudflare/VPS production runtime 控制面。** 完成 Tickets exact-SHA cutover、business smoke、rollback readback 后，再收敛 database migration ownership/history gate | [commerce-ops #13](https://github.com/retailpulses/commerce-ops/issues/13) · [Orders run](https://github.com/retailpulses/commerce-ops/actions/runs/34821378666) · [database governance #115](https://github.com/retailpulses/inbox/issues/115) |
| P1 | CatalogSync release retention / VPS 磁盘复发防护 | **Merged / production activation hard-blocked** — bounded retention 已进入 `CatalogSync/main`，merge SHA `ee9907f6a69b0f6c477c0ef71affec76fe95304f` | 本轮 review 完整 patch 后直接 squash-merge PR #204；canonical deploy adapter 现在保护所有 live symlink targets、一跳 `PREVIOUS_RELEASE` rollback、最新 5 个 timestamp-sorted releases；unknown/manual dir 不删，broken release link fail-safe skip；#106 已同步 | **Hard block：首次 production activation 会删除历史 release，属于高影响操作，需要 owner approval + production-capable session。** 解锁后记录 pre/post symlink、release count/disk usage、rollback target 与 WeCom watcher readback | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [merged PR #204](https://github.com/retailpulses/CatalogSync/pull/204) |
| P1 | Mercari 收据开具工具 | **实施中 / runtime-validation blocked** — draft PR #58 已推进到 live owner snapshot contract | 确认 #58 是 `commerce-ops` 当前唯一 open PR；branch 已包含 owner snapshot、coupon paid amount、recipient fallback 与 fail-closed logic；没有把 Actions 0-step 当作 test success | GitHub-hosted CI 受 Actions hard budget 约束，当前环境也无 VPS Mercari token/runtime。**Hard block：需要 repo-capable/VPS runtime** 验证 COMPLETED / non-completed / wrong-shop / coupon order；通过后继续 persistence、private Storage、PDF、signed link、E2E 与 controlled deploy | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [draft PR #58](https://github.com/retailpulses/commerce-ops/pull/58) · [Actions budget #89](https://github.com/retailpulses/inbox/issues/89) |

## Issue Dashboard

这里回答“**整个组织 backlog 有多大**”，与下方只挑 material items 的 Issue Triage 明确分开。统计口径为 GitHub **open Issue（排除 PR）**，快照时间 **2026-09-15 JST**。

**Retailpulses organization total：317 open Issues。** 其中下面 10 个主要 / 仍具 runtime 意义的工程仓库合计 **238**；其他组织仓库合计 **79**。在 238 中，6 个 active canonical repos 为 **181**，4 个 transition / legacy runtime repos 为 **57**。因此只看到 7–8 个 Triage rows 不代表 backlog 只有 7–8 个。

| 仓库 / 范围 | Open Issues | 当前管理含义 |
|---|---:|---|
| [inbox](https://github.com/retailpulses/inbox/issues) | **85** | Cross-repo portfolio / governance backlog |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/issues) | **25** | 本轮关闭 #201 后由 26 → 25 |
| [RPagentOS](https://github.com/retailpulses/RPagentOS/issues) | **24** | Agent / catalog owner backlog |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/issues) | **23** | Canonical commerce app backlog |
| [boutique-listing](https://github.com/retailpulses/boutique-listing/issues) | **17** | Listing tool backlog |
| [workers](https://github.com/retailpulses/workers/issues) | **7** | Worker/runtime backlog |
| **Active canonical subtotal** | **181** | 上述 6 repo |
| [ticket-handling](https://github.com/retailpulses/ticket-handling/issues) | **30** | Transition / legacy Ticket runtime backlog；新 canonical work 优先进入 commerce-ops |
| [OrderMgmt](https://github.com/retailpulses/OrderMgmt/issues) | **18** | Transition / legacy Orders runtime；仍有 #280 等必须收口的 owner action |
| [inquiry-automation](https://github.com/retailpulses/inquiry-automation/issues) | **7** | Transition Inquiry backlog |
| [ops-portal](https://github.com/retailpulses/ops-portal/issues) | **2** | Legacy Ops Portal backlog |
| **Transition / legacy subtotal** | **57** | 上述 4 repo；仍统计，但不应成为新功能默认落点 |
| **10 个主要 repo subtotal** | **238** | `181 + 57` |
| **其他 Retailpulses repos** | **79** | `317 - 238` |
| **Retailpulses org total** | **317** | 所有组织仓库，排除 PR |

> Priority labels / fields 尚未跨 repo 标准化，因此这里不伪造全量 P0/P1 统计；高优先事项由 Active WIP 与 Issue Triage 显式表达。

## Issue Triage

这是管理层面的精选队列，**不是完整 backlog**。只列尚未进入明确执行、需要重新分类/决策、存在状态冲突、明显 stale，或有系统性影响的 material Issue。

| 优先级 | Issue / 分类 | Triage 状态 | 下一步决策 / 动作 | Canonical Issue |
|---|---|---|---|---|
| P0 | CatalogSync interrupted / degraded workloads | **needs authoritative reconciliation** — #147 对 unknown-result 禁止盲目 replay/write；#157 记录多个 degraded/blocked workload | 以 live scheduler + immutable release + business-level output 逐 workload 核对；unknown result 未明确前禁止猜测性 replay/write | [CatalogSync #157](https://github.com/retailpulses/CatalogSync/issues/157) · [#147](https://github.com/retailpulses/CatalogSync/issues/147) |
| P1 | CatalogSync L0 health follow-ups | **Actionable** — #202 针对 `rakuten-inventory`，#203 将 Shop4 L0 contract 延伸到 Shops 1–3 | 分别完成 schedule/release/business-output readback、五态 evaluator 与 natural observation；不要让 umbrella #110 永久充当执行单元 | [CatalogSync #202](https://github.com/retailpulses/CatalogSync/issues/202) · [#203](https://github.com/retailpulses/CatalogSync/issues/203) · [inbox #110](https://github.com/retailpulses/inbox/issues/110) |
| P1 | GitHub Actions consumption / hard budget | **Systemic operating constraint** — 当前 hard budget 会让部分 CI 在 `runner_id=0 / steps=[]` 前失败 | 按 #89 继续做 trigger/path/concurrency 优化；保留 deterministic safety gates；Actions 不可用时优先 local/direct validation，不擅自提高预算 | [inbox #89](https://github.com/retailpulses/inbox/issues/89) |
| P1 | Mercari Supabase read / egress 放大 | **READY / 未进入执行** | 先 instrumentation + durable mapping cache，再做 crash-safe incremental cursor；cross-repo platform risk 由 inbox #80 协调 | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [inbox #80](https://github.com/retailpulses/inbox/issues/80) |
| P1 | RPagentOS hosted migration history | **BLOCKED / evidence mismatch** | 核对 hosted exact versions / canonical owner；不要把长期 open PR #36 直接当 #133 实现，必要时 supersede 后做 focused PR | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) |
| P1 | Rakuten Ticket Portal send button disabled | **未诊断** | 用 ticket platform/session state + send-capability contract 做 read-only diagnosis，先判断产品约束还是 UI eligibility bug | [commerce-ops #67](https://github.com/retailpulses/commerce-ops/issues/67) |
| P2 | Boutique bundle workspace | **STALE / open PR since 2026-06** | 对照 #76 当前 product need：仍需要则 rebase/merge + visual smoke；需求已变化则 supersede/close | [boutique-listing #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |
| P2 | Open PR hygiene / source-of-truth drift | **需要清理** — 存在 Issue closed/completed、implementation PR 仍 open 且 production evidence 未对齐 | 通过 #111 对 stale/orphan PR 做 canonicality review：merge、supersede 或 close；先纠正事实再统计 WIP | [inbox #111](https://github.com/retailpulses/inbox/issues/111) · [CatalogSync PR #194](https://github.com/retailpulses/CatalogSync/pull/194) |

> 本轮已把 CatalogSync #201 从 Triage 移出：沿 production code path 与 Amazon 官方 2026-09-28 变更说明完成判断，当前 inventory-only `fulfillment_availability` PATCH **not affected**；Issue 已 closed，组织 open Issue 从 318 → 317。

### 如何使用此页面

1. **Active Engineering WIP**：现在实际在推进什么、推进到了哪里、真正卡在哪里。
2. **Issue Dashboard**：全局 backlog 有多大；canonical 与 transition/legacy 各占多少。
3. **Issue Triage**：哪些 material Issue 值得进入执行、收口、合并、supersede 或重新判断。
4. 审批、证据与技术细节保留在 canonical Issue / PR / workflow / document；本页只做组织级控制面。
5. Active work 完成后立即移出 WIP；Issue 仍 open 不代表它必须占据 WIP。

## Supporting / transition repositories

| 仓库 | 当前定位 |
|---|---|
| [OrderMgmt](https://github.com/retailpulses/OrderMgmt) | Commerce Ops cutover 期间的 Orders runtime / legacy source；只收口现有风险与迁移，不作为新功能默认落点 |
| [inquiry-automation](https://github.com/retailpulses/inquiry-automation) | 现有 Inquiry runtime / transition repo |
| [ticket-handling](https://github.com/retailpulses/ticket-handling) | 现有 Ticket runtime / transition repo |
| [ops-portal](https://github.com/retailpulses/ops-portal) | Legacy Ops Portal source |
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