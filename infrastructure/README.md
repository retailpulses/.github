# Infrastructure — Canonical Asset Registry

跨产品基础设施资产的统一索引。这里记录资产身份、归属、部署契约及只读观察证据；实际运行状态仍以运行平台为准。

| 范围 | 入口 | 当前状态 |
| --- | --- | --- |
| Mac mini | [mac-mini/](mac-mini/README.md) | Runtime Registry、Workspace mapping 与有时间戳的只读观察；本地 Supabase/PostgreSQL 已只读核实 |
| Cloudflare | [cloudflare/](cloudflare/README.md) | 待只读盘点 |
| VPS | [vps/](vps/README.md) | 待只读盘点 |
| Databases | [databases/](databases/README.md) | 跨平台数据库实例索引待建立 |
| Credentials | [credentials/](credentials/README.md) | Mac mini 本地 registry 的访问与注册指南 |

每个平台可维护机器可读 Registry 与有时间戳的 Observed Snapshot。不得把临时 PID、一次性健康检查或数据库业务内容当作长期 Canonical 配置。产品仓库仍负责详细部署设计及操作手册。

执行追踪：[Cloudflare + VPS Inventory #14](https://github.com/retailpulses/.github/issues/14)。
