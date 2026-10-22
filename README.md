# Retailpulses — Engineering & Infrastructure

本仓库是 Retailpulses **内部工程与基础设施的 Canonical Registry 和导航入口**，同时保留 GitHub 组织默认社区文件的原生职责。

## 权威边界（P0 已生效）

| 领域 | Canonical owner | 说明 |
| --- | --- | --- |
| 跨仓库 Engineering Principles、Infrastructure Inventory、Repository Registry、中央导航 | **本仓库** | 维护跨产品身份、边界、指针和轻量规范 |
| 当前生效的治理工具、可复用 Actions、安装器、治理政策 | [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit) | **暂不切换**；依 [#11](https://github.com/retailpulses/.github/issues/11) 分阶段迁移并验证消费者 |
| 产品架构、TRD、代码、测试、部署实现 | **各产品仓库** | 不将产品文档复制到中央仓库 |
| Sprint、Backlog、工作状态、决策追踪 | GitHub Issues / Projects | 不建立平行 Markdown Backlog |
| 实际生产状态、数据库内容、日志、Secret | **运行平台 / 数据系统** | GitHub 只记录脱敏资产身份、部署契约和观测证据 |

**Canonical Registry ≠ Governance 工具切换。** P0 确立本仓库作为中央工程目录的职责，但现有 Governance 执行入口、Workflow 引用和产品部署链保持不变。中央与本地冲突时应核实归属，不能默默覆盖产品事实。

## 目录入口

| 路径 | 内容 | 状态 |
| --- | --- | --- |
| [engineering/](engineering/README.md) | 工程原则、标准与模板导航 | P0 索引 |
| [infrastructure/](infrastructure/README.md) | Mac mini / Cloudflare / VPS / Database 资产目录 | Mac mini 初始盘点；其余逐步补充 |
| [registry/](registry/README.md) | 全组织仓库生命周期与职责目录 | P0 快照 |
| [docs/](docs/) | 已有共享文档 | 保留 |
| [AGENTS.md](AGENTS.md) | 组织默认 Agent 指引 | 保留；后续单独核对过时假设 |
| [.github/](.github/) | GitHub 默认 Issue/PR 模板及 Workflow | 现有行为不变 |
| [profile/](profile/) | GitHub 组织主页 | 保留 |

## 维护原则

1. 中央只登记跨产品事实、共同标准和权威链接；产品内细节留在产品仓库。
2. Registry 是稳定资产身份；Snapshot 是有时间戳的现场观察，不能当作持续健康保证。
3. 工程规范应简洁、可操作，避免模糊非功能性要求及额外审批；MVP 优先。
4. 未验证的事实标记 UNKNOWN，不以 README、代码存在或 LaunchAgent loaded 推断生产状态。
5. 不提交凭据、客户数据、数据库副本、敏感运行配置。
6. 组织默认模板与 Workflow 的实际 GitHub 生效机制保持原样；中央 AGENTS 指引不等于 GitHub 自动强制应用到每个仓库。

## 现有计划

- [#11 — 治理仓库渐进整合](https://github.com/retailpulses/.github/issues/11)：当前 Governance 权威不变；待迁移验证后再切换。
- [#12 — README 模板](https://github.com/retailpulses/.github/issues/12)。
- [#14 — Cloudflare / VPS Runtime Inventory](https://github.com/retailpulses/.github/issues/14)。

**P0 范围：** 建立 README、目录骨架和 Repository Registry；不迁移治理工具、不修改其他仓库、不调整生产环境。
