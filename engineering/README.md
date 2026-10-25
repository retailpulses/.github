# Engineering Registry

本目录维护跨仓库工程规范的入口和轻量模板。产品级事实仍由产品仓库维护；本页说明中央文件的实际状态，避免把 Pilot 或尚未合并的迁入内容误作已生效标准。

## 已存在于 main 的文件

| 文档 | 当前状态 | 用途 |
|---|---|---|
| [DOCUMENTATION_STANDARD.md](DOCUMENTATION_STANDARD.md) | **Pilot** | 产品知识与 Design、Architecture、TRD、Current State、ADR、Reference 的职责边界。PR #17 合并为提案；PR #20、#21 增补 Reference 与 UI Sketch 指引；按 Issue #16 后续评估，不视为全组织强制采用。 |
| [DESIGN_MIGRATION_GUIDE.md](DESIGN_MIGRATION_GUIDE.md) | **Pilot** | 产品文档迁移的审计、对照、验证与交接流程；它不授权批量改造产品仓库。 |
| [templates/PRODUCT_DESIGN.md](templates/PRODUCT_DESIGN.md) | **Reference / optional template** | 产品 Design 的可复用起点；是否使用由产品 Owner 按需决定。 |

## Proposed / Pilot / Reference

这些文件可供阅读或试点使用，但状态不代表组织范围内已批准或全面执行。迁移和试点评估由 [#16](https://github.com/retailpulses/.github/issues/16) 跟踪；Foundational Reference 补全见 [#19](https://github.com/retailpulses/.github/issues/19)。

## 正在迁入的工程方法

[Issue #22](https://github.com/retailpulses/.github/issues/22) 跟踪从 `inbox/system design` 提升通用工程方法。其当前开放 PR [#23](https://github.com/retailpulses/.github/pull/23) 提交了 `ENGINEERING_PRINCIPLES.md`、`ARCHITECTURE_REVIEW_GUIDE.md`、Architecture 模板，并修改 Documentation Standard、Design Migration Guide 和 Product Design 模板。这些变更仍在 PR 中；合并前不属于 main 的现行内容。研究、案例与原始来源仍留在 inbox。

## 权威归属

- **Product Design、业务目标与行为：** 各产品仓库的 Design 文档及其 Sponsor 决策。
- **Architecture：** 各产品仓库的架构文档；说明系统职责、数据所有权、依赖与部署结构。
- **TRD / Contracts：** 各产品仓库的技术契约、API/schema 及验证条件。
- **Current State：** 各产品仓库或运行平台的有证据实现、部署与运行事实。
- **决策、执行与状态：** ADR 记录长期技术决策；GitHub Issues / PR 记录工作和交付。二者均不替代产品 Design 或运行证据。

## `docs/` 与 `engineering/`

`engineering/` 是当前中央工程标准和模板的维护入口。根级 `docs/` 是既有共享参考材料集合，内容并非统一的现行标准，须按各自来源和上下文判断。没有因目录位置自动获得 Canonical Authority；本 Sprint 不批量搬移 `docs/` 文件。若未来迁移单项内容，应保留原始来源、状态和链接，并避免形成两个可编辑权威副本。

## 相关入口

- [组织级 Registry 首页](../README.md)
- [Engineering Registry Product Design](../design.md)（v0.1 Draft）
- [Documentation Standard](DOCUMENTATION_STANDARD.md)
- [Design Migration Guide](DESIGN_MIGRATION_GUIDE.md)
- [Product Design template](templates/PRODUCT_DESIGN.md)
- [Repository Registry](../registry/README.md)
- [Foundational References](../references/README.md)
