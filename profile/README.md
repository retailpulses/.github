# Retailpulses

面向日本市场的电商运营与软件团队。这里是组织级入口：优先从最常用仓库进入，再查看当前 Active Engineering WIP 与跨仓库 Issue Triage。

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

这是优先查看的执行层视图：只保留正在实施、部署、验证，或因明确 blocker / owner action 而暂停的工作。Open Issue 本身不等于 Active WIP。最后复核：**2026-09-15 JST**。

| 优先级 | 当前工作 | 执行状态 | 下一步 | Canonical 记录 |
|---|---|---|---|---|
| P0 | Supabase API 安全边界加固 | **执行中 / 阶段完成** — Batch 0+1 已生产激活；最后一个已识别的 broad-executable Giga COGS import `SECURITY DEFINER` RPC 也已通过 PR #70 合并并在生产完成 ACL readback。#104 仍未达到整体 DoD：table/RLS、`SECURITY DEFINER` views、`search_path`、runtime identity、Advisor final disposition 与最终 critical-path 验证仍需收口 | 以最新生产结果重新 baseline #104 剩余 DoD，按最小安全 batch 继续处理 table/view/function/runtime-identity 剩余项；不要继续把已完成 PR #70 当成开放 blocker | [inbox #104](https://github.com/retailpulses/inbox/issues/104) · [PR #70](https://github.com/retailpulses/commerce-ops/pull/70) · [corrective PR #60](https://github.com/retailpulses/commerce-ops/pull/60) |
| P0 | Commerce Ops 生产源码 / deployment ownership cutover | **部分完成** — Ops Portal、Inquiry、Orders 已有 `commerce-ops` exact-SHA 生产 readback；Orders VPS 成功 run #34821378666 已验证。Tickets 与 database / migration-source ownership 仍未完成。组织 Actions 预算已恢复到 `$15` hard cap，后续 VPS 操作默认不依赖 GitHub-hosted Actions | 完成 Tickets exact-SHA cutover、business smoke 与 rollback evidence；随后收敛 database migration ownership/history gate，并据证据关闭 Phase 2 | [commerce-ops #13](https://github.com/retailpulses/commerce-ops/issues/13) · [成功 Orders VPS run](https://github.com/retailpulses/commerce-ops/actions/runs/34821378666) · [database governance #115](https://github.com/retailpulses/inbox/issues/115) |
| P1 | CatalogSync release retention / VPS 磁盘复发防护 | **Awaiting owner action** — 事故清理与每日 WeCom disk watcher 已完成；真正导致 71 GB 历史 release 堆积的 bounded retention 尚未落地。#106 已被定义为 GitHub-native Codex POC，但启动 coding agent 需要在 GitHub UI 手工 `Assign to agent` | 在 #106 选择 OpenAI Codex，target repo=`retailpulses/CatalogSync`；让 agent 只实现最小 retention PR，保护 `current` / `marketplace-current` 与明确 rollback window，随后再做 VPS deploy/readback | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [已完成 watcher PR #108](https://github.com/retailpulses/inbox/pull/108) |
| P1 | Mercari 收据开具工具 | **实施中 / draft PR** — canonical v6 design 已确定；当前唯一开放的 `commerce-ops` PR #58 已完成 Ops-side scaffold，但 live OrderMgmt receipt-snapshot owner endpoint 与 issuance/storage/PDF/share path 尚未实现 | 先实现 bounded live `/api/internal/mercari/receipt-snapshot`，完成 completed/non-completed/wrong-shop VPS 验证；再做 immutable persistence、private Storage、PDF、10-day signed link 与端到端验收 | [commerce-ops #57](https://github.com/retailpulses/commerce-ops/issues/57) · [draft PR #58](https://github.com/retailpulses/commerce-ops/pull/58) · [coupon follow-up #59](https://github.com/retailpulses/commerce-ops/issues/59) |

## Issue Triage

这里是管理层面的 Issue 视图，**不重复上面的 Active WIP**。只列尚未进入明确执行、需要重新分类/决策、存在状态冲突，或有时间窗口的 material Issue；完整 backlog 仍留在各仓库。

| 优先级 | Issue / 分类 | Triage 状态 | 下一步决策 / 动作 | Canonical Issue |
|---|---|---|---|---|
| P0 | CatalogSync interrupted / degraded workloads | **状态冲突 / needs authoritative reconciliation** — #147 仍要求 33 个 unknown-result 在 replay/write 前完成核对；较新的 runtime evidence 又显示相关 timer 已启用，#157 仍保留多个 degraded/blocked workload | 以 live scheduler + immutable release + business-level output 为权威证据重新核对；33 个 unknown-result 未明确前禁止猜测性 replay/write，然后分别 close、retire 或另开具体 owner issue | [CatalogSync #157](https://github.com/retailpulses/CatalogSync/issues/157) · [CatalogSync #147](https://github.com/retailpulses/CatalogSync/issues/147) |
| P1 | Amazon SP-API 2026-09-28 product-type changes | **NEW / deadline-sensitive** — 尚无 implementation PR；风险是否影响当前 quantity sync 尚未验证 | 在 **2026-09-28 前**确认 production quantity-sync 使用的 endpoint/feed，并给出 affected / not affected 结论；只有确受影响才做最小修复 | [CatalogSync #201](https://github.com/retailpulses/CatalogSync/issues/201) |
| P1 | Production health / bounded self-healing | **需要收口范围** — Sales Brief renewal/readback 已验证 HEALTHY，Shop4 L0 evaluator 与 continuous observation 也已部署；当前没有对应开放 implementation PR，但 umbrella #110 仍 open | 明确 #110 是否还有一个具体 next workload；若没有，关闭当前 umbrella milestone，并把后续 workload health 按 owner 拆成独立 Issue，避免形成永久 WIP | [inbox #110](https://github.com/retailpulses/inbox/issues/110) |
| P1 | Mercari Supabase read / egress 放大 | **READY / 未进入执行** — #188 已定义 incremental candidate、durable mapping cache 与 daily full reconciliation；仍缺实现与生产 evidence | 有执行 capacity 后先做 instrumentation + durable mapping cache，再做 crash-safe incremental cursor；没有 PR 前不列入 Active WIP | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [mapping #187](https://github.com/retailpulses/CatalogSync/issues/187) · [cross-repo #105](https://github.com/retailpulses/inbox/issues/105) |
| P1 | RPagentOS hosted migration history | **BLOCKED / evidence mismatch** — #133 要求 18 个 Ticket-owned comment-only markers；开放 PR #36 是 2026-07 的旧 work，描述 21 个 shared-history placeholders，不能直接视为 #133 的正确实现 | 先核对 exact hosted version set 与 canonical owner；不要直接 merge 旧 PR #36。必要时 supersede 它并开一个只覆盖 #133 18-version set 的 focused PR，再 rerun production migration dry-run | [RPagentOS #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) · [失败 run](https://github.com/retailpulses/RPagentOS/actions/runs/34748527246) |
| P1 | Rakuten Ticket Portal send button disabled | **NEW / 未诊断** — 当前还不能判断是 Portal bug 还是 Rakuten message-session constraint | 用该 ticket 的 platform/session state 与实际 send-capability contract 做 read-only diagnosis；确认产品约束后再决定修 UI eligibility 还是显示明确不可发送原因 | [commerce-ops #67](https://github.com/retailpulses/commerce-ops/issues/67) |
| P2 | Boutique bundle workspace | **STALE / open PR since 2026-06** — #77 有完整 local/dry-run evidence，但长期没有 production acceptance；继续作为 Active WIP 会误导 | 对照当前 #76 product need 做一次快速 relevance review：仍需要则 rebase/merge + production visual smoke；需求已变化则 supersede/close PR，保留 canonical decision | [boutique-listing #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |
| P2 | Open PR hygiene / source-of-truth drift | **需要清理** — 组织仍有一批长期开放 PR；同时出现 `CatalogSync#193` 已 closed/completed、但 implementation PR #194 仍 open 且声明“尚未部署”的状态冲突 | 通过 #111 做一次 canonicality review：对每个 stale/orphan PR 选择 merge、supersede 或 close；Issue 已 closed 但 PR/production evidence 不一致时先纠正 canonical state，不以 open PR 数量代表 WIP | [inbox #111](https://github.com/retailpulses/inbox/issues/111) · [CatalogSync PR #194](https://github.com/retailpulses/CatalogSync/pull/194) |

### 如何使用此页面

1. **先看 Active Engineering WIP**：这里回答“工程现在实际在推进什么、卡在哪里、下一步是什么”。
2. **再看 Issue Triage**：这里回答“哪些 material Issue 需要进入执行、收口、合并、supersede 或重新判断”。
3. 打开对应 canonical Issue / PR / workflow run 查看详细证据；审批、延后或产品决定直接留在对应 GitHub artifact。
4. Active work 完成后立即从 WIP 移出；Issue 未关闭不代表它必须继续占据 WIP。

GitHub artifacts 始终是详细工程事实的 source of truth；本页只是组织层面的执行与 triage 索引。

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

> 保持本页低维护成本：最常用仓库固定置顶；Active WIP 只放真实执行中的工作；Issue Triage 只放 material management queue。详细状态和证据留在对应 canonical artifact。