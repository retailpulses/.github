# Database Asset Registry

**状态：跨平台盘点待完成；Mac mini 本地 PostgreSQL/Supabase 已现场核实。** 记录数据库实例、存储类型、所属产品、所在平台、备份责任和权威 Schema 链接；不存储业务数据、连接凭据或数据导出。

Mac mini 的 PostgreSQL/Supabase 实例 `supabase_db_local-supabase-smoke`（数据库 `postgres`，端口 `54322`）承载本地 credential registry；证据、范围与权限边界见 [Mac mini runtime inventory](../mac-mini/runtime-inventory.yaml) 和 [Credential Access Guide](../credentials/ACCESS_GUIDE.md)。该实例不是生产数据库。Mac mini 已登记的两个 SQLite 配置路径也见 `runtime-inventory.yaml` 的 `data_assets`；其他 SQLite/DuckDB 和生产数据库实例仍需核实。

**避免重复登记：** 本目录用于跨平台数据库资产索引，平台内的实例事实由对应基础设施目录维护，产品 Schema 仍由产品仓库维护。
