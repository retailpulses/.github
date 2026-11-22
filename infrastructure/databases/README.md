# Database Asset Registry

**状态：跨平台盘点待完成；Mac mini 本地 PostgreSQL/Supabase 已现场核实。** 记录数据库实例、存储类型、所属产品、所在平台、备份责任和权威 Schema 链接；不存储业务数据、连接凭据或数据导出。

Mac mini 的 PostgreSQL/Supabase 实例 `supabase_db_local-supabase-smoke`（数据库 `postgres`，端口 `54322`）承载本地 credential registry；证据、范围与权限边界见 [Mac mini runtime inventory](../mac-mini/runtime-inventory.yaml) 和 [Credential Access Guide](../credentials/ACCESS_GUIDE.md)。该实例不是生产数据库。Mac mini 已登记的两个 SQLite 配置路径也见 `runtime-inventory.yaml` 的 `data_assets`；其他 SQLite/DuckDB 和生产数据库实例仍需核实。

**生产：Supabase Cloud 项目 `gqeyfhshxdiyhugvmbuk`（Retailpulses Project）。** 2026-11-22 只读核实：区域 `ap-northeast-2`，状态 `ACTIVE_HEALTHY`，PostgreSQL 17.6，库量约 3045 MB。`db.<ref>.supabase.co` 仅解析 AAAA，组织内两台常驻机器均无全局 IPv6，因此应用侧访问必须经 Supavisor 池化器；本项目可用池化器主机为 `aws-1-ap-northeast-2.pooler.supabase.com`（`aws-0-ap-northeast-1` 与 `aws-0-ap-northeast-2` 均返回 `tenant/user not found`）。Agent 侧访问栈与权限边界见 [supabase stack record](../../engineering/stacks/supabase/README.md)；本文件不记录口令、连接串或数据导出。

**避免重复登记：** 本目录用于跨平台数据库资产索引，平台内的实例事实由对应基础设施目录维护，产品 Schema 仍由产品仓库维护。
