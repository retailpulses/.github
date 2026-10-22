# Database Asset Registry

**状态：跨平台盘点待完成。** 记录数据库实例、存储类型、所属产品、所在平台、备份责任和权威 Schema 链接；不存储业务数据、连接凭据或数据导出。

Mac mini 已登记的两个 SQLite 配置路径见 [mac-mini/runtime-inventory.yaml](../mac-mini/runtime-inventory.yaml) 的 `data_assets`；本地 PostgreSQL / Supabase、其他 SQLite / DuckDB 和生产数据库实例仍需核实。

**避免重复登记：** 本目录用于跨平台数据库资产索引，平台内的实例事实由对应基础设施目录维护，产品 Schema 仍由产品仓库维护。
