# Retailpulses

面向日本市场的电商运营与软件团队。这里是组织级入口：优先从最常用仓库进入，再通过当前开发 WIP 查看仍需要持续跟进的事项。

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

以下仅保留仍需要跟进的重要未完成工程事项。详细状态与证据以链接中的 GitHub Issue、PR、workflow run 或文档为准。最后复核：**2026-09-14 JST**。

| 优先级 | WIP | 当前状态 | 下一步 | Canonical 记录 |
|---|---|---|---|---|
| P0 | Supabase API 安全加固 | **进行中** — Batch 0+1 已完成生产激活；后续安全范围仍未完成，最后一个过度开放的 Giga COGS import RPC 已有聚焦修复 PR | 审查并合并聚焦 RPC ACL 修复，在生产执行 ACL readback / canary 验证，再继续 #104 中明确拆分的后续 batch | [inbox #104](https://github.com/retailpulses/inbox/issues/104) · [PR #70](https://github.com/retailpulses/commerce-ops/pull/70) · [已完成 corrective PR #60](https://github.com/retailpulses/commerce-ops/pull/60) |
| P0 | Commerce Ops 生产源码切换 | **部分完成** — Ops Portal、Inquiry、Orders 的 VPS/Worker cutover 已有证据；Orders VPS 已验证运行在 `commerce-ops` SHA。Tickets 与数据库 / migration-source 收尾仍未完成。GitHub-hosted Actions 当前受恢复后的硬预算约束 | 完成 Tickets exact-SHA 生产源码验证，并收敛 database / migration ownership 与 history gate，再关闭 Phase 2；适合时使用已批准的非 Actions 路径，不再假设旧 Orders run 仍然阻塞 | [Issue #13](https://github.com/retailpulses/commerce-ops/issues/13) · [成功 Orders VPS run](https://github.com/retailpulses/commerce-ops/actions/runs/34821378666) · [历史失败 run](https://github.com/retailpulses/commerce-ops/actions/runs/34752608872) · [inbox #115](https://github.com/retailpulses/inbox/issues/115) |
| P0 | CatalogSync 已停止 / 降级 workload 与中断的 Giga→Mercari 恢复 | **状态不确定 / 证据冲突** — #147 要求在 33 个未知结果完成核对前保持 Giga→Mercari timer 禁用，但较新的跨 runtime 证据显示 timer 已启用；#157 仍要求对多个 degraded / blocked workload 做 live business-level 验证 | 先建立权威的 live timer / release / business 状态；在任何 replay / write 前核对 33 个未知结果；再逐个 workload 决定恢复、继续禁用或退役，并更新 canonical inventory | [Incident #157](https://github.com/retailpulses/CatalogSync/issues/157) · [Recovery #147](https://github.com/retailpulses/CatalogSync/issues/147) · [runtime investigation #110](https://github.com/retailpulses/inbox/issues/110) |
| P1 | 生产 workload 健康检查 + 有边界的自愈 | **活跃** — Sales Brief 复发已追溯到 scheduler ownership evidence 过期，bounded recovery 已恢复数据新鲜度；永久健康检测、续期及 runbook 语义尚未完成。当前不计划新建 dashboard / registry | 修复 ownership-evidence 的续期权限与过期语义，实现 schedule-aware derived health 与异常告警，再跨越 >24h 边界验证正常业务输出周期，之后再启用 L1/L2 repair | [inbox #110](https://github.com/retailpulses/inbox/issues/110) · [commerce-ops #34](https://github.com/retailpulses/commerce-ops/issues/34) · [PR #50](https://github.com/retailpulses/commerce-ops/pull/50) · [PR #51](https://github.com/retailpulses/commerce-ops/pull/51) |
| P1 | CatalogSync VPS 磁盘复发防护 | **部分完成** — 紧急清理已完成，每日 watcher 正常；CatalogSync release retention / allowlisted cleanup ownership 尚未收尾 | 实现最小且安全的 immutable-release retention 策略，始终保留 current + rollback release；直接在 VPS 验证，不建设平行监控体系 | [inbox #106](https://github.com/retailpulses/inbox/issues/106) · [watcher #107](https://github.com/retailpulses/inbox/issues/107) · [PR #108](https://github.com/retailpulses/inbox/pull/108) |
| P1 | 降低 Mercari Supabase read / egress 放大 | **已设计 / 未实施** — 当前每 10 分钟 full read 明显高于实际变化率；#188 定义了 incremental candidate、durable mapping cache 与每日 full reconciliation，同时保留 Mercari API 作为 live-state SoT | 先实施 instrumentation + durable mapping cache，再引入 crash-safe incremental cursor processing；有证据后再将 full reconciliation 降为每日一次 | [CatalogSync #188](https://github.com/retailpulses/CatalogSync/issues/188) · [mapping follow-up #187](https://github.com/retailpulses/CatalogSync/issues/187) · [cross-repo egress #105](https://github.com/retailpulses/inbox/issues/105) |
| P1 | RPagentOS hosted migration history 对齐 | **阻塞 / 范围需重新核对** — owner deployment 被共享 hosted migration version 阻塞；#133 定义 18 个 Ticket-owned comment-only marker，而开放中的 PR #36 描述为 21 个 shared-history placeholder | 核对 Issue / PR 中的 version set 与 ownership evidence；marker 继续保持 comment-only；之后重新执行 production migration dry-run，并要求仅剩目标 RPagentOS owner migration 为 pending | [Issue #133](https://github.com/retailpulses/RPagentOS/issues/133) · [PR #36](https://github.com/retailpulses/RPagentOS/pull/36) · [失败 run](https://github.com/retailpulses/RPagentOS/actions/runs/34748527246) |
| P1 | Mercari 收据开具工具 | **实施中** — canonical design 已确定，Ops 侧 scaffold 已存在；OrderMgmt live receipt-snapshot owner endpoint、immutable issuance/storage、PDF/share 流程仍缺失 | 实现有边界的 live Mercari owner endpoint，接入 preview / revalidation，再加入 immutable document persistence + PDF + signed-link delivery，最后完成 VPS 端到端验收 | [Issue #57](https://github.com/retailpulses/commerce-ops/issues/57) · [PR #58](https://github.com/retailpulses/commerce-ops/pull/58) · [coupon persistence #59](https://github.com/retailpulses/commerce-ops/issues/59) |
| P2 | Boutique bundle workspace | **待审查 / 部署状态不确定** — implementation PR #77 仍开放，并声称已完成针对 #76 canonical spec 的 local / dry-run 验证；当前未找到明确生产部署证据 | 按 #76 审查 PR #77；若仍符合当前需求则合并并执行生产 smoke / visual verification，否则明确 supersede，避免长期保留状态不清的开放 PR | [Issue #76](https://github.com/retailpulses/boutique-listing/issues/76) · [PR #77](https://github.com/retailpulses/boutique-listing/pull/77) |

### 如何使用此页面

1. 先在这里查看当前仍未完成、且值得组织级关注的工程事项。
2. 打开对应的 canonical Issue / PR / workflow run 查看详细证据。
3. 审批、延后或补充意见时，直接在对应 GitHub artifact 中留下决定，使历史记录可追溯。
4. 定期依据 GitHub 证据刷新本区：删除已完成 / 已 supersede 的工作，更新状态发生变化的事项，并补充新出现的重要 WIP。

这里不采用固定 WIP 槽位模型。GitHub artifacts 始终是详细工程事实的 source of truth；本区只是组织层面的未完成工作索引。

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

> 保持本页低维护成本：只保留最常用仓库、当前开发 WIP，以及直达 canonical artifact 的链接。详细状态和证据应留在对应的 canonical artifact 中。
