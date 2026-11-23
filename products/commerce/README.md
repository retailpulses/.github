# Commerce — One Logical Product

**Status:** Draft / Sponsor Review · **Decision owner:** [/.github#90](https://github.com/retailpulses/.github/issues/90)

本目录是 Retailpulses **跨仓库 Commerce 逻辑产品的顶层设计入口**。它为各组件解释共同业务目标、能力地图、跨组件身份/状态/数据契约与文档导航，但**不要求物理系统合并**，也不取代组件仓库自己的 Product Design、Architecture、TRD 或运行事实。

## Canonical files
- [顶层设计（Draft）](design.md)：Product Overview、Capability Map、Workflows、COM-REQ、文档权威与边界、Open Questions。
- [#90](https://github.com/retailpulses/.github/issues/90)：设计方向、Sponsor 决策和文档交付跟踪。
- [#148](https://github.com/retailpulses/.github/issues/148)：2026 年 12 月 Cloud Supabase 退役独立 Sprint；不是 #90 的物理整合阶段。

## 责任边界
| Level | Authority |
|---|---|
| **Parent Commerce（本目录）** | 共同业务目标、逻辑 Context Map、跨组件 Contract、导航与边界 |
| **各子组件仓库** | 本组件的 Product Design、Architecture、TRD、实现、发布与运行手册 |
| **组织 Engineering / Platform** | 组织标准、数据库治理、基础设施索引与安全规范 |
| **GitHub Issues/PRs** | 变更、审批、执行与验收 |
| **实际运行环境** | 实时部署、数据、健康状态与生产事实 |

**读取顺序：** 本 README → [Parent Design](design.md) → 相关子组件权威文档 → GitHub Issue/PR → 代码与运行证据。子组件入口与其确认状态见 [Design §6](design.md#6-child-product-navigation-verification-required)。

**重要：** `/.github/design.md` 是 Engineering Registry 产品设计，**不是** Commerce Parent Design；本目录的 `design.md` 仅作为跨仓库父级设计例外。尚未批准的内容不得被误用为已部署业务行为。
