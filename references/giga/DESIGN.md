# GigaB2B Shared Capabilities — Design
Status: **Draft / Sponsor Review** · Owner: Engineering / Giga capability owners · Updated: 2026-10-29 · Tracking: [#53](https://github.com/retailpulses/.github/issues/53)

> 本文件描述**共享能力发现与复用的目标行为（To-Be）**，不是新产品管理后台或已部署服务。组织级 Foundational Reference 仍以 [REF-GIGA-OPENAPI-2](open-api-2.0.md)、[REF-GIGA-CAPABILITY](capability-inventory.md)、[REF-GIGA-DATA](data-dictionary-mapping.md) 为权威。**Product Center 尚未建成，不属于当前依赖、数据 Owner、工作流或验收前置条件。**

## 1. 目标与非目标

**用户**：接入 GigaB2B 的工程 Agent、CatalogSync/Orders/Monthly P&L 的维护者，以及审查共享数据口径的 Operator。

**目标**：从一个组织级入口准确找到 GigaB2B 2.0 官方契约、现有可调用代码、部署/凭据位置、业务数据定义及 API→数据库字段映射，并能判断证据成熟度，避免重复造 Client、错误 Seller 归类或混淆 Unit Price。

**非目标**：建设 Product Center、统一 Giga SDK、Gateway、共享数据库、运行时映射引擎、通用 ETL 平台；迁移现有 Supabase/SQLite 字段名；替换既有生产 Client；从此文档触发真实订单写入。

## 2. Capability Map / Requirement IDs

| ID | Capability | 预期行为与验收意图 |
|---|---|---|
| GIGA-CAP-001 | API Reference | 可按版本/能力查 Endpoint、字段、认证、限流、错误；Open API 2.0 为新接入必需版本，1.0 Retired，不能 fallback |
| GIGA-CAP-002 | Access Code Discovery | 能找到代码 Owner、repo/path、入口、部署意图、测试、限制、运行状态；CODE OBSERVED ≠ Runtime Verified |
| GIGA-CAP-003 | Shared Data Semantics | GigaB2B 是采购平台而非 Seller；ASUKA/HEYA/TBO 为 Seller；Shop 与 Seller 不混用；各类 Unit Price 有不同定义 |
| GIGA-CAP-004 | Field Lineage | 能追踪源 API JSON path → adapter/transform → Supabase/SQLite 目标字段 → Consumer；每条边记录证据与 UNKNOWN |
| GIGA-CAP-005 | Reuse & Preflight | 优先既有 Owner Client；从真实 caller runtime 做安全只读 preflight，报告凭据权限/连通性/数据契约和未核实项 |
| GIGA-CAP-006 | Change/Drift Management | 上游 API/字段或消费者变更时同步修订受影响 Reference、Owner Contract 与测试；Retired 资料明确指向新入口 |

## 3. Operator / Agent Workflows

### W1 — 发现并接入 Giga API（GIGA-CAP-001/002/005）
1. 从 [Registry](../README.md) 定位 REF-GIGA-OPENAPI-2，确认版本与 Endpoint。
2. 从 [Capability Inventory](capability-inventory.md) 选当前 Owner 的现有 Client；比较运行环境、依赖、错误处理和测试，禁止直接假设历史代码生产可用。
3. 查 [Credential Registry](../../infrastructure/credentials/README.md) 的配置**元数据**；仅在实际 caller runtime 做 DNS/TLS/鉴权/只读 API preflight，记录时间、SHA、环境与脱敏响应。
4. 失败区分 Credential Missing、Permission Denied、Network Unreachable、Contract Mismatch、Runtime Config Missing；标记 Blocked/UNKNOWN 并说明可行安全降级。写接口不以生产下单作为探针。
5. 将复用策略（Direct Import / Copy & Adapt / Shared Contract 等）和验证证据写入 Owner Issue/PR，不在 Registry 创建第二份可执行 Client。

### W2 — 解释跨库字段（GIGA-CAP-003/004）
1. 从 [Data Dictionary](data-dictionary-mapping.md) 选择稳定 Term ID（如 Giga Standard Unit Price）。
2. 明确源字段、币种、单位、有效时点、粒度/Join Key、NULL/缺省、转换与 Writer Owner。
3. 对照 **当前** Supabase schema、Mac mini SQLite schema 和实际 adapter/ETL，保留既有不同列名；不以字段名相似推断语义相等。
4. 使用脱敏样本和只读 DB/API 查询核对映射链；缺证据标 PARTIALLY VERIFIED/UNKNOWN，不将代码存在冒充 live 事实。
5. Consumer 引用 Term ID；产品特定计算、映射及测试留在 Owner repo。

### W3 — 修复漂移（GIGA-CAP-006）
识别错误语义/映射 → 定位业务定义 Owner 与 executable writer → 区分事实缺口和产品决策 → 最小修改 Owner 合同/代码/测试 → 回写 Reference 的证据状态和受影响消费者。已有问题见 [store-ops #132](https://github.com/retailpulses/store-ops/issues/132) 的 Seller 分类案例。

## 4. 关键业务规则

- **GigaB2B ≠ Seller**；ASUKA、HEYA、TBO 是 Seller；Mercari Shop 是销售店铺，三者不同维度。
- Giga Standard Unit Price、Discounted/Exclusive Price、Actual Purchase Unit Cost、Confirmed Unit Purchase Cost、Unit Fulfillment Cost、Selling Unit Price **不得因为名称相近而合并**。
- Source API `item.price` 与 Supabase `source_unit_price`、SQLite `standard_unit_price_yen` 的完整等价性**尚未 E2E 验证**；其余未知字段不补造。
- 外部供应商官方文档是 API 契约来源；内部 Reference 是有版本和证据的索引；Owner 仓库保有 executable contract / migration / test 权威。
- Product Center 不参与本轮设计，不能作为 Canonical Owner、Writer 或消费者前置依赖；未来建成后另立集成决策。

## 5. 核心状态与轻量界面

此能力当前仅提供 GitHub Markdown 导航，不规划独立 UI。入口 README 展示三个 Reference、Owner/状态和证据链接；关键状态为 Registered / Partially Verified / Verified / Stale / Superseded / Retired。Verified 必须附范围、环境、时间和证据；未运行标 NOT RUN。

## 6. 验收与证据（设计目标，不是完成声明）

| Test ID | 关联需求 | 预期验证 |
|---|---|---|
| GIGA-T-001 | 001/002 | 从 Registry 找到 2.0 API、真实代码 Owner、调用方式及 1.0 retirement |
| GIGA-T-002 | 003 | Seller/GigaB2B/Shop 及价格字段互不误判；记录反例 |
| GIGA-T-003 | 004 | 对价格、Seller、Item Code、Fulfillment Fee 逐条提供 API→adapter→DB→consumer 的证据；不完整时明确 UNKNOWN |
| GIGA-T-004 | 005 | 真实调用方只读 preflight，报告 endpoint、环境、SHA、PASS/FAIL/BLOCKED/NOT RUN，禁止生产订单写探针 |
| GIGA-T-005 | 006 | 变更发生后 Reference/Owner 合同/测试链接一致，旧副本明确 Retired/Superseded |

**当前证据**：上述 Reference 主要为 code/schema inspection，尚未完成 Live API→两套 DB 的全链路核验；不得宣称 GIGA-T-003/004 PASS。

## 7. Architecture / Deployment Boundary

```text
Supplier GigaB2B Open API 2.0 (external contract)
    → existing Owner clients (CatalogSync / commerce-ops / commerce-lab / tools)
    → existing Owner writers and data stores (Production Supabase / local SQLite)
    → existing consumers (Orders / Monthly P&L / catalog workflows)

.github/references/giga = discovery + semantics + evidence index (no runtime)
```

Runtime、Credential、调度、备份、写权限和故障恢复均由现有调用方/Owner 负责，不能从 Registry 推断其已部署。新集成前从实际 Caller 环境做预检。No Product Center dependency.

## 8. Open Facts / Decisions

- **OPEN (blocking for mapping verification)**：Live 2.0 响应 JSON path、NULL/优惠语义及 writer→Supabase→SQLite 全链路；Seller 身份来源和订单关联键。
- **OPEN**：各现有 Client 的当前 Runtime SHA、凭据权限、生产/历史状态；只读 canary 的运行证据。
- **Decision**：保持 Markdown Reference 与 Owner-managed executable contracts；不创建共享 SDK/DB/Gateway；未来若出现多个实测消费者需求，再按 [#38](https://github.com/retailpulses/.github/issues/38) 评估。
- **Decision**：不依赖尚未构建的 Product Center。未来出现真实 Product Center 接口时独立提案，不预设 Schema。

参考：[Documentation Standard](../../engineering/DOCUMENTATION_STANDARD.md) §§2–9, 12, 14–17；[Engineering Principles](../../engineering/ENGINEERING_PRINCIPLES.md)；[#53](https://github.com/retailpulses/.github/issues/53)。
