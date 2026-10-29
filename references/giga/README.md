# GigaB2B Shared Capabilities — Documentation Entry

**Status:** Draft design; References partially verified · **Owner:** Engineering Registry / respective executable-code owners · **Issue:** [#53](https://github.com/retailpulses/.github/issues/53)

此目录是组织级 **Foundational References** 与共享能力发现入口，**不是 Product Center，也不是新运行时服务**。Product Center 尚未建设，不作为当前设计依赖。

| Authority | File | Role |
|---|---|---|
| To-Be design | [DESIGN.md](DESIGN.md) | 目标用户、能力、工作流、规则、Requirement/Test ID、非目标 |
| External API reference | [open-api-2.0.md](open-api-2.0.md) | GigaB2B Open API 2.0 版本/端点/证据；1.0 Retired |
| Access code / Current Evidence | [capability-inventory.md](capability-inventory.md) | 已发现 Owner 代码、脚本、测试、Runtime UNKNOWN |
| Shared semantics / Mapping | [data-dictionary-mapping.md](data-dictionary-mapping.md) | Business Term IDs、Live API→Supabase/SQLite 映射与证据状态 |
| Organization policy | [Documentation Standard](../../engineering/DOCUMENTATION_STANDARD.md) | §12 Foundational References；§15 Integration；§16 Testing；§17 Data Model |

**阅读顺序：** 先 DESIGN 理解目的与边界，再按任务阅读 API / Code Inventory / Data Dictionary；实际部署与测试以 Owner 仓库和 Runtime 证据为准。

**现状边界（As-Is）**：上述 Reference 已建立；多数为仓库代码/Schema 证据，真实 Live API→DB 映射和多运行时 preflight 尚未验收。不得将 `CODE OBSERVED` 写成 `Runtime Verified`。不保存真实 Secret，不改现有数据库字段名。
