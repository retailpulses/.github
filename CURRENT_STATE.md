# Engineering Registry — Current State / Historical Evidence

**Status:** Historical source inspection; live runtime verification UNKNOWN. **Owner:** retailpulses/.github. **Snapshot date:** 2026-10-25 (JST). Product Design and implementation facts remain separate.

## 1. Historical audit baseline (2026-10-25)

**审计基线：** `main` merge commit `c48d27e3cd1831e614956235c86103aa57a105ef`（PR #29）；现工作分支从该 main 创建，`design.md` 尚待本 Follow-up PR 合并。并行 PR #23 在本节撰写时仍为开放状态。此快照不代表永久状态；每次重要变更由对应 Issue / PR 和平台 read-back 更新证据。

| Area | Current evidence / state | Gap / target |
|---|---|---|
| Organization navigation / repository directory | **Implemented:** PR #29 的根 README 与 `profile/README.md` 已合并，Organization Overview 已核实渲染；`registry/repositories.yaml` 存在且声明粗粒度快照。 | Design 入口合并后加入根 README；仓库 Owner / 职责仍按 Registry 的 UNKNOWN 标注逐项核实。 |
| Standards / templates | **Pilot:** `DOCUMENTATION_STANDARD.md`、`DESIGN_MIGRATION_GUIDE.md` 和 Product Design 模板已在 main；不等于全组织强制采用。 | #16 Pilot review 未完成；#22 的方法迁入内容当时位于开放 PR #23，合并前不算已实现。 |
| Infrastructure / runtime | **Implemented / In Progress:** 有 infrastructure 目录、Mac mini Runtime inventory 与 snapshot；#14/#15 跟踪现场 Inventory / Workspace mapping。 | Cloudflare / VPS / database platform facts、Workspace ↔ Release ↔ Runtime 映射与现场证据有待各 Issue 核实。 |
| Foundational API References | **Pilot:** `references/README.md` 和三个产品域资料存在；PR #18 已合并。 | #19 的跨仓库 census、MacBook 本地资料、字典字段证据及旧副本处置仍未全部完成。 |
| Governance | **Implemented current boundary:** Registry README 指向当前 `rp-governance-kit` Owner。 | #11 尚未完成工具/Workflow 消费者兼容验证或 authority cutover；ERG-005 不能表述为已迁入。 |
| Agent guidance | **Implemented file:** `.github/AGENTS.md` 已修订 credential boundary；但 main 的文件头仍将其描述为所有仓库的默认行为。 | GitHub 默认 Community Health 机制不分发 AGENTS；不同 Agent 的加载覆盖仍 Unknown。main 的 `docs/adoption-guide.md` 旧文亦声称它会自动继承；本 Follow-up PR 同步澄清两个入口，后续仍需按 Agent runtime 单独核实。 |
| Asset migration | **In Progress:** Issue #25 有矩阵及本轮 QW-01 writeback；迁移状态由各现有 Issue / PR 维护。 | inbox 完整 census、部分来源路径、Owner 和权威切换尚待核对；本文不复制这些逐项动态记录。 |

状态词含义：**Implemented** 表示对应文件/导航已在基线 main 中；**Pilot** 表示可试用但采用评估未完；**In Progress** 以实际存在的开放 PR、工作产物或验证任务为据；**Planned** 表示仍待启动/定义；**Unknown** 表示证据不足。它们描述设计基线，不覆盖 GitHub Issue / PR 实时状态。


## 2. Interpretation and ongoing verification

This is a **source/Issue/PR inspection snapshot**, not a live deployment or health report. Its original wording and historical SHA are preserved from the former Product Design §7; entries describing then-open PRs remain **historical** and must not be treated as live status. Verify current repository main, product owners and runtime evidence before operational decisions.

- Current source of asset identity: [repository registry](registry/README.md), [infrastructure index](infrastructure/README.md), [foundational references](references/README.md).
- Dynamic work and decisions: [Issue #25](https://github.com/retailpulses/.github/issues/25), [Issue #16](https://github.com/retailpulses/.github/issues/16), [Issue #42](https://github.com/retailpulses/.github/issues/42), related PRs.
- Current product intent: [Product Design](design.md); target logical architecture: [Architecture](ARCHITECTURE.md).
