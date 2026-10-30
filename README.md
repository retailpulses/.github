# Retailpulses Engineering Registry

本仓库是 Retailpulses 的组织级 Engineering、Infrastructure、Repository 与 Foundational Reference 导航入口，同时承载 GitHub Organization 默认社区文件。此处维护跨仓库标准和经证据支持的索引；不替代产品仓库的实现与运行权威，也不承载第二套工作状态库。

## Canonical ownership boundaries

| 领域 | 权威归属 |
|---|---|
| 跨仓库工程标准、组织级基础设施与仓库索引、跨产品 Foundational Reference 导航 | 本仓库；标准的采用状态见各文档 |
| 当前生效的治理工具、策略、安装器和执行 Workflow | [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit)，直到 #11 验证并批准切换 |
| 产品 Design、Architecture、TRD、代码、测试与产品运行手册 | 对应产品仓库；具体权威由该仓库文档声明 |
| Sprint、工作状态、交付与决策记录 | GitHub Issues / Projects |
| 实际生产状态、数据、Secret 与运行日志 | 对应运行平台和数据系统；本仓库只收录脱敏资产身份及证据链接 |

## Engineering standards & templates

- [Engineering navigation](engineering/README.md)：现行文件、Pilot/Proposed 文件及迁移中内容的状态说明。
- [Engineering Registry Product Design](design.md)：产品目标、能力、工作流、边界与当前状态（v0.1 Draft）。
- [Documentation Standard](engineering/DOCUMENTATION_STANDARD.md)：Pilot；不是全组织强制切换。
- [Design Migration Guide](engineering/DESIGN_MIGRATION_GUIDE.md)：Pilot 迁移流程。
- [Product Design template](engineering/templates/PRODUCT_DESIGN.md)：轻量参考模板。
- [GitHub defaults and workflows](.github/workflows/README.md)：默认文件与可复用 Workflow 索引；Workflow 需消费者显式调用。
- [Organization Agent guidance](AGENTS.md) 与 [Security policy](SECURITY.md)。

## Infrastructure, runtime & workspace registry

- [Infrastructure registry](infrastructure/README.md)：[Mac mini](infrastructure/mac-mini/README.md)、[Cloudflare](infrastructure/cloudflare/README.md)、[VPS](infrastructure/vps/README.md)、[databases](infrastructure/databases/README.md) 和 [credentials](infrastructure/credentials/README.md)。
- Mac mini 运行登记见 [runtime inventory](infrastructure/mac-mini/runtime-inventory.yaml)、[workspace-to-runtime mapping](infrastructure/mac-mini/workspaces.yaml) 与其 [timestamped snapshot](infrastructure/mac-mini/runtime-inventory-snapshot.md)；映射仍为部分核实，未知项见 [#15](https://github.com/retailpulses/.github/issues/15)。
- Cloudflare / VPS 只读资产核验由 [#14](https://github.com/retailpulses/.github/issues/14) 跟踪；不要将目录存在理解为现场盘点已完成。

## Repository registry

[Repository Registry](registry/README.md) · [machine-readable repository list](registry/repositories.yaml)。该清单是粗粒度组织索引，不代替各仓库自己的职责、架构或运行说明。

## Shared business definitions

[Canonical Business Registry](business/README.md)：Draft / Sponsor Review；包含Pricing、Product/Marketplace Identity及[Giga商品属性与图片交付规则](business/giga-content-preprocessing.md)。共享业务规则在business维护，对应代码/脚本及核实状态见[GigaB2B Capability Registry](references/giga/capability-registry.md#giga-content-preprocessing-assets)；文档存在不代表实现或部署完成。

## Foundational references

[Foundational Reference Registry](references/README.md) 当前为 Pilot，含 GigaB2B、Mercari Inquiry 与 Rakuten RMS 的来源和核实状态。它是内部发现入口，不取代供应商官方资料；全组织资料盘点与补全由 [#19](https://github.com/retailpulses/.github/issues/19) 跟踪。

## Governance & GitHub defaults

GitHub Organization Overview 位于 [profile/README.md](profile/README.md)。Issue / PR 模板和 Security 默认入口保留 GitHub 原生路径；中央 [AGENTS.md](AGENTS.md) 提供默认 Agent 指引，不代表 GitHub 会对所有仓库自动强制执行。Governance 工具权威仍在 `rp-governance-kit`，迁移计划见 [#11](https://github.com/retailpulses/.github/issues/11)。

## Active migration / tracking issues

进度和讨论以 Issue / PR 为准；本表只指向工作入口，不复制动态状态。

- [#11 Governance Kit Migration](https://github.com/retailpulses/.github/issues/11) · [#12 README Standards](https://github.com/retailpulses/.github/issues/12)
- [#14 Cloudflare / VPS Inventory](https://github.com/retailpulses/.github/issues/14) · [#15 Workspace / Runtime Mapping](https://github.com/retailpulses/.github/issues/15)
- [#16 Documentation Standard](https://github.com/retailpulses/.github/issues/16) · [#19 Foundational API References](https://github.com/retailpulses/.github/issues/19)
- [#22 Engineering Methodology Migration](https://github.com/retailpulses/.github/issues/22) · [#24 Local LLM / Capability Gateway](https://github.com/retailpulses/.github/issues/24)
- [#25 inbox → .github Asset Migration](https://github.com/retailpulses/.github/issues/25) · [#26 Credential Access Guide / AGENTS Cleanup](https://github.com/retailpulses/.github/issues/26) (已关闭；实现见已合并 PR #27/#28)

> 本次 QW-01 只改善导航与迁移归属可见性，不迁移产品资产、不更改 Runtime 或生产配置。
