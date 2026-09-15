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

只保留正在实施、部署、验证，或已推进到 genuine hard block / owner approval 的工作。Open Issue 本身不等于 Active WIP。最后执行复核：**2026-09-15 JST**。

| 优先级 | 当前工作 | 本轮推进后的状态 | 本轮实际推进 | 下一步 / Hard block | Canonical 记录 |
|---|---|---|---|---|---|
| P0 | Supabase API 安全边界加固 | **Auth/RLS product boundary reached** — broad SECURITY DEFINER RPC、mutable `search_path`、unexplained definer-view findings 已归零；RLS-disabled + browser-accessible tables **45 → 31**，Advisor **81 = 31 ERROR / 49 INFO / 1 WARN** | Fresh hosted read-only inventory 已证明剩余 31 tables 全部 RLS disabled、0 policies，并向 `anon` + `authenticated` 暴露 CRUD；canonical audit docs 已同步到 production reality | **Hard block：需要先明确剩余 catalog/listing、project、task browser caller identity + authorization/RLS contract。** 在此之前不能安全 blanket revoke / enable RLS；后续 hosted ACL/RLS migration 仍需独立 canary/授权 | [inbox #104](https://github.com/retailpulses/inbox/issues/104) · [RLS/grants](https://github.com/retailpulses/commerce-ops/blob/main/docs/supabase-audit/p0/rls-and-grants-cutover.md) |
| P0 | Commerce Ops production-source cutover | **部分完成 / runtime-bound** — Ops Portal、Inquiry、Orders 已有 `commerce-ops` exact-SHA production readback；Orders VPS cutover 已验证；Tickets + database/migration-source ownership 尚未达到 Done Gate | 复核 #13 最新证据：Orders direct readback 已稳定；此前 credential / approval 叙述已 superseded | **Hard block：当前执行环境没有 Cloudflare/VPS production control plane，且 Actions hard budget 不可擅自放宽。** 需要 production-capable session 完成 Tickets exact-SHA cutover、business smoke、rollback readback，再完成 migration-source ownership gate | [commerce-ops #13](https://github.com/retailpulses/commerce-ops/issues/13) · [Orders run](https://github.com/retailpulses/commerce-ops/actions/runs/34821378666) · [database governance #115](https://github.com/retailpulses/inbox/issues/115) |
| P1 | CatalogSync release retention / VPS 磁盘复发防护 | **Merged / first production activation hard-blocked** — bounded retention 已进入 `CatalogSync/main`，merge SHA `ee9907f6a69b0f6c477c0ef71affec76fe95304f` | Canonical deploy adapter 已保护所有 live symlink targets、一跳 `PREVIOUS_RELEASE`、最新 5 个 timestamp-sorted releases；unknown/manual dirs 不删，broken release link fail-safe skip | **Hard block：首次 production activation 会删除历史 release，属于高影响操作，需要 owner approval + production-capable session。** 解锁后一次性记录 pre/post symlink、release count/disk usage、rollback target 与 WeCom watcher readback | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [merged PR #204](https://github.com/retailpulses/CatalogSync/pull/204) |
| P1 | Mercari 收据开具工具 | **代码继续推进 / VPS integration hard-blocked** — draft PR #58 已有 live owner snapshot + Ops preview scaffold，且本轮修复了 coupon receipt amount 的实质 correctness bug | 将 `paid_amount` 修正为经商业行对账后的 live `totalPrice`，不再二次扣减 coupon；API failure 不再误报 `order_not_found`；新增 fail-closed reconciliation；snapshot tests **7/7 passed**；canonical v6 design 已更新到 `main`；同时消除了 PR #58 的 merge conflict，当前 `mergeable=true` | **Hard block：需要 VPS Mercari runtime 验证 exact branch 的 COMPLETED / non-completed / wrong-shop / coupon / missing-paidAt 路径。** 通过后继续 `POST` fresh re-fetch、immutable persistence、private Storage、deterministic PDF、10-day signed link、E2E 与 controlled deploy | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [draft PR #58](https://github.com/retailpulses/commerce-ops/pull/58) |

## Issue Dashboard

这里回答“**整个 active engineering backlog 有多大**”，与下方只挑 material items 的 Issue Triage 明确分开。统计口径为 GitHub **open Issue（排除 PR）**，快照时间 **2026-09-15 JST**。

**Active organization management scope：214 open Issues。** 口径明确排除 superseded 与 archived repositories。下列 6 个主要 active repos 合计 **181**；其他 active repos 合计 **33**。因此 Issue Triage 只有少量 rows，不代表完整 backlog 只有这些事项。

| 主要 active repo | Open Issues | 当前管理含义 |
|---|---:|---|
| [inbox](https://github.com/retailpulses/inbox/issues) | **85** | Cross-repo portfolio / governance backlog |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/issues) | **25** | Catalog/platform sync backlog |
| [RPagentOS](https://github.com/retailpulses/RPagentOS/issues) | **24** | Agent / catalog owner backlog |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/issues) | **23** | Canonical commerce application backlog |
| [boutique-listing](https://github.com/retailpulses/boutique-listing/issues) | **17** | Listing tool backlog |
| [workers](https://github.com/retailpulses/workers/issues) | **7** | Worker/runtime backlog |
| **主要 active repos subtotal** | **181** | 上述 6 repo |
| **其他 active repos** | **33** | Active scope 中其余 repos |
| **Active organization scope total** | **214** | 排除 superseded / archived repos；排除 PR |

> Priority labels / fields 尚未跨 repo 标准化，因此这里不伪造全量 P0/P1 统计；高优先事项由 Active WIP 与 Issue Triage 显式表达。

## Issue Triage

这是管理层面的精选队列，**不是完整 backlog**。只列尚未进入明确执行、需要重新分类/决策、存在状态冲突、明显 stale，或有系统性影响的 material Issue。

| 优先级 | Issue / 分类 | Triage 状态 | 下一步决策 / 动作 | Canonical Issue |
|---|---|---|---|---|
| P0 | CatalogSync interrupted / degraded workloads | **needs authoritative reconciliation** — #147 对 unknown-result 禁止盲目 replay/write；#157 记录多个 degraded/blocked workload | 以 live scheduler + immutable release + business-level output 逐 workload 核对；unknown result 未明确前禁止猜测性 replay/write | [CatalogSync #157](https://github.com/retailpulses/CatalogSync/issues/157) · [#147](https://github.com/retailpulses/CatalogSync/issues/147) |
| P1 | CatalogSync L0 health follow-ups | **Actionable** — #202 针对 `rakuten-inventory`，#203 将 Shop4 L0 contract 延伸到 Shops 1–3 | 分别完成 schedule/release/business-output readback、五态 evaluator 与 natural observation；不要让 umbrella #110 永久充当执行单元 | [CatalogSync #202](https://github.com/retailpulses/CatalogSync/issues/202) · [#203](https://github.com/retailpulses/CatalogSync/issues/203) · [inbox #110](https://github.com/retailpulses/inbox/issues/110) |
| P1 | GitHub Actions consumption / hard budget | **Systemic operating constraint** — hard budget 会让部分 CI 在 `runner_id=0 / steps=[]` 前失败 | 按 #89 做 trigger/path/concurrency 优化；Actions 不可用时优先 local/direct validation，不擅自增加预算 | [inbox #89](https://github.com/retailpulses/inbox/issues/89) |
| P1 | Mercari Supabase read / egress 放大 | **READY / 未进入执行** | 先 instrumentation + durable mapping cache，再做 crash-safe incremental cursor；cross-repo platform risk 由 inbox #80 协调 | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [inbox #80](https://github.com/retailpulses/inbox/issues/80) |
| P1 | RPagentOS hosted migration history | **BLOCKED / evidence mismatch** | 核对 hosted exact versions / canonical owner；不要把长期 open PR #36 直接当 #133 实现，必要时 supersede 后做 focused PR | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) |
| P1 | Rakuten Ticket Portal send button disabled | **未诊断** | 用 platform/session state + send-capability contract 做 read-only diagnosis，先判断产品约束还是 UI eligibility bug | [commerce-ops #67](https://github.com/retailpulses/commerce-ops/issues/67) |
| P2 | Boutique bundle workspace | **STALE / open PR since 2026-06** | 对照 #76 当前 product need：仍需要则 rebase/merge + visual smoke；需求已变化则 supersede/close | [boutique-listing #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |
| P2 | Open PR hygiene / source-of-truth drift | **需要清理** | 通过 #111 对 stale/orphan PR 做 canonicality review：merge、supersede 或 close；先纠正事实再统计 WIP | [inbox #111](https://github.com/retailpulses/inbox/issues/111) · [CatalogSync PR #194](https://github.com/retailpulses/CatalogSync/pull/194) |

### 如何使用此页面

1. **Active Engineering WIP**：现在实际在推进什么、推进到了哪里、真正卡在哪里。
2. **Issue Dashboard**：active backlog 有多大，以及主要 repo 的分布。
3. **Issue Triage**：哪些 material Issue 值得进入执行、收口、合并、supersede 或重新判断。
4. 审批、证据与技术细节保留在 canonical Issue / PR / workflow / document；本页只做组织级控制面。
5. 已完成或 superseded 的工作应从组织级视图移除，而不是长期挂在 WIP。

## Supporting repositories

- [skills](https://github.com/retailpulses/skills) — 共享技能与 agent 能力资产
- [retailpulses-tool-services](https://github.com/retailpulses/retailpulses-tool-services) — 共享 tool-service 基础设施

## Work routing

- 不确定归属或跨仓库事项 → [inbox](https://github.com/retailpulses/inbox)
- Commerce/Ops Portal/Inquiry/Orders/Tickets → [commerce-ops](https://github.com/retailpulses/commerce-ops)
- 商品、库存、平台同步 → [CatalogSync](https://github.com/retailpulses/CatalogSync)
- Agent 运营任务 / Listing intelligence → [RPagentOS](https://github.com/retailpulses/RPagentOS)
- Listing UI / 编辑发布 → [boutique-listing](https://github.com/retailpulses/boutique-listing)
- 架构与治理 → [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)
