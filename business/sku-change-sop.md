# SKU Change — Master SOP (Draft, facts only)

状态：**Draft · Facts-only baseline** · Evidence：**PARTIAL** · 日期：2026-11-25 · Owner：待定

> 本文件只记录**已核实的事实**与**已观测到的状态**，不包含流程步骤、决策规则、责任人、审批或 SLA。
> 这些内容待事实基线评审后再补。每条事实标注证据等级：`VERIFIED`（官方来源或可复现证据）/ `OBSERVED`（内部实测或快照）/ `PARTIAL`（部分核实）/ `UNKNOWN`（未核实）。
> 本文件不新增 BUS ID；引用既有 [`marketplace-model.md`](marketplace-model.md)、[`mercari/listing-csv-guideline.md`](mercari/listing-csv-guideline.md)、[`mercari/product-group-management.md`](mercari/product-group-management.md) 的定义。

---

## 1. 范围

覆盖一次 SKU 变更在以下系统中的事实边界：

| 层 | 系统 | 本文件覆盖 |
|---|---|---|
| 供应 | GigaB2B（Product List / Price / Inventory API 2.0） | Item Code 的可见性、变更信号 |
| 内部 | Supabase `sales_orders` / `product_variants` / `product_commercials` | 联接键与历史归属 |
| 销售 | Mercari Shops（商品 / SKU / 商品グループ） | 字段语义、可编辑性、身份层级 |
| 销售 | Rakuten RMS（Item / SKU） | 字段存在性（官方语义未完全核实） |

不覆盖：具体批次操作步骤、价格决策、供应商谈判、财务重分类。

---

## 2. 术语与当前证据状态

| 术语 | 当前定义来源 | 证据状态 |
|---|---|---|
| SPU1 | BUS-PROD-001：主产品聚合身份，含其 Variant 与 Listing，不自动等同平台商品组 | VERIFIED（内部定义） |
| Variant | BUS-PROD-003：内部 SKU 级身份，关联 Item Code、规格、成本与共享内容 | VERIFIED（内部定义） |
| Item Code | 供应商 SKU 编码；在 Mercari 对应 `SKUi_商品管理コード`，内部对应 `product_variants.item_code` | VERIFIED（字段存在）；**跨平台等价性未核实** |
| Mercari 種類 / SKU | BUS-MKT-003：一个商品可设多种「種類」，CSV 标为 SKU；每种含名称、数量、JAN/管理码等 | VERIFIED（官方指南，2026-11-18 核对） |
| Mercari 商品グループ | BUS-MKT-004：同一 Shop 内关联多个独立商品供买家切换；不合并 商品ID/价格/库存/订单 | VERIFIED（官方指南） |
| Rakuten Item / SKU | BUS-MKT-005：商品层级与 SKU 层级须分开建模；观察字段含 `商品管理番号（商品URL）`、`商品番号`、`SKU管理番号` | **PARTIAL**（CSV 字段存在，官方完整约束未核实） |
| `SKUi_ID` | Mercari 平台侧 SKU 槽位标识，UPDATE 定位用 | VERIFIED（BUS-MER-011） |

**事实：** 内部 `Variant` 是代理身份，`Item Code` 是它的一个商业属性；两者当前在数据库中被当作同一个联接键使用（见 §4.1）。

---

## 3. 平台事实

### 3.1 Mercari Shops（官方来源，BUS-MER 系列）

| 事实 | 来源 / 状态 |
|---|---|
| 一个商品最多 10 个 SKU 槽位（`SKU1`–`SKU10`）；一个 CSV 行 = 一个平台商品 | BUS-MER-001，VERIFIED |
| `販売価格` 由一个商品的所有 SKU **共用**，不能按 SKU 定价 | BUS-MER-004，VERIFIED |
| `SKUi_商品管理コード` 可选，≤50 个 ASCII 字母/数字/`-`/`_` | BUS-MER-006，VERIFIED |
| `SKUi_種類` 平台侧可选；公司规则要求：创建或有意修改时必须为非空、准确的日文规格名 | BUS-MER-014，公司规则 VERIFIED（2026-11-18） |
| 已复核的 UPDATE 指南中 `種類` 字段上限为 16 字符；以当前模板为准 | BUS-MER-014，VERIFIED（2026-11-18 复核） |
| SKU 级 UPDATE 需要 `商品ID` + 目标 `SKUi_ID` + 变更字段；**`種類`、JAN、商品管理コード 三类字段均可作为 SKU 级变更字段** | BUS-MER-011，VERIFIED |
| 库存变更需 `商品ID` + `SKUi_ID` + `現在の在庫数` + `増減フラグ` + `在庫増減数` | BUS-MER-011，VERIFIED |
| 普通商品 UPDATE 的分组字段**不能**创建、修改或移除商品グループ；分组走专用 CSV | product-group-management，VERIFIED（2026-11-19） |
| 商品グループ ID 的查询条件每项 ≤30 字符；公司据此把内部生成上限定为 30 字符 | product-group-management，平台限制 VERIFIED / 内部上限为自定规则 |
| 商品グループ每组最多 10 个成员；组不合并商品ID、价格、库存或订单 | BUS-MKT-004 + product-group-management，VERIFIED |
| 内部 Item Code / SKU 值禁止出现在 `商品名` / `商品説明` | BUS-MER-010，公司规则 VERIFIED |

**事实：** Mercari 侧 `種類`、`商品管理コード`、`SKUi_ID` 是同一 SKU 行内的三个独立字段；平台没有规定三者之间的派生关系。

### 3.2 Rakuten RMS

| 事实 | 状态 |
|---|---|
| Item 与 SKU 是两个层级；CSV 观察字段含 `商品管理番号（商品URL）`、`商品番号`、`SKU管理番号` | PARTIAL（BUS-MKT-005） |
| `SKU管理番号` 变更是否构成新 SKU 身份、是否影响 URL/评价/订单归属 | **UNKNOWN** |
| DEAL / スーパーSALE 报名以 SKU/商品为锚，报名记录含截止日与审核状态 | OBSERVED（`rakuten/december-2026-super-deal-plan.md`，2026-11-14 登录证据） |

### 3.3 GigaB2B

| 事实 | 状态 |
|---|---|
| Price / Inventory v2 以 SKU 为查询键；Product List 按时间窗返回带 `updateTime` 的 SKU 记录 | VERIFIED（API 2.0 实测） |
| Product List 返回 `updateTime` / `addedTime`，支持 `lastUpdatedAfter`、`queryTimeType`、`startTime`、`endTime` 变更窗口 | VERIFIED（#244 记录） |
| Giga UI 存在 “Key Information Changes” 与手工 Excel 导出 | OBSERVED |
| 手工 Excel **不是**运行时数据源，只作人工核对证据 | VERIFIED（[`canonical-product-history.md`](https://github.com/retailpulses/inbox/blob/main/operations/catalog/canonical-product-history.md) §1） |
| 2026-11-25 实测：N511 的 31 个新 SKU 中 **18 个在 Inventory v2 查无此码** | OBSERVED（API 实测） |

---

## 4. 内部系统事实

### 4.1 数据库联接路径

来源：`retailpulses/inbox` 的 `.github/workflows/poc-daily-stock-report.yml`（OBSERVED）。

```text
sales_orders.b2b_item_code  (fallback: original_product_id)
        └─ join product_variants.item_code
                └─ product_commercials.variant_id   (owned_qty / source_available_qty / restock_date / inventory_status)
```

| 事实 | 状态 |
|---|---|
| `item_code` 是业务自然键，`variant_id` 是代理键 | OBSERVED |
| 报表/补货/毛利闸门按 `item_code` 直连，未做别名解析 | OBSERVED |
| `product_variants` 存在描述性字段为空的情况（`product_name`、`marketing_description`、`product_features`、`product_specification`） | OBSERVED（#199） |

### 4.2 Listing 快照

来源：`work/issue-524/listing_sku.json`，2026-11-24/25 生成（OBSERVED）。

| 指标 | 数值 |
|---|---|
| Listing 总数 | 22,361 |
| 不同 SKU 数 | 6,359 |
| 覆盖店铺 | shop1–shop4 |

### 4.3 N511 观测基线（2026-11-25）

来源：Google Drive `N511最近SKU变更.xlsx`（file id `1qmbE3rKQHImLMtTBn_uIlG3YsblrvH5v`，2026-11-25 01:19 UTC）+ Giga 实测 + 上述 listing 快照。

| 事实 | 数值 |
|---|---|
| 新 SKU 行数 | 31 |
| 老码链长度 | 1 个旧码 19 行、2 个旧码 9 行、3 个旧码 3 行 |
| 变更类型 | 尺寸图 11 / 去掉插座+页面整体更新 10 / 无 9 / 待上架 1 |
| 入库状态 | 已入库 15 / 12月上旬 8 / 12月下旬 5 / 12月下旬+原木色无下批 2 / 无入库计划 1 |
| 新 SKU 有在售 listing | 4 / 31 |
| 老 SKU 有在售 listing | 31 / 31 |
| 同时挂老+新 SKU 的 listing | 16（4 新 SKU × 4 店） |
| 其中颜色错配 | 2（Shop4） |
| 仍挂第 2 代码的 listing | 12（3 个二代码） |
| 新 SKU 供应商可售库存 | 809 台 / 13 个 SKU |
| 已入库但无 listing 的新 SKU | 9 个 / 742 台 |
| 老 SKU 仍有供应商库存 | 5 个 / 157 台 |

**事实：** 本次变更中同时存在“纯换号（买家可见零变化）”与“规格变更（去掉插座）”两类，文件用同一张表承载。

### 4.4 相关 Issue 先例

| Issue | 已记录事实 |
|---|---|
| [#269](https://github.com/retailpulses/inbox/issues/269) | 26 行因 `TCOGS` 缺失/无效或 `SKU1_商品管理コード` 未匹配被排除；其中 4 行属 SKU 未匹配 |
| [#199](https://github.com/retailpulses/inbox/issues/199) | 前 5 个精确 SKU 案例均有 `product_variants` 行，但核心描述字段为 NULL |
| [#244](https://github.com/retailpulses/inbox/issues/244) | 变更历史按“变更触发全量观测”设计；Giga 变更信号只是触发器，不等于 canonical 事实变更 |
| [#524](https://github.com/retailpulses/inbox/issues/524) | 组装信息错误客诉；根因类别为“规格事实与买家可见文案不一致” |
| [#483](https://github.com/retailpulses/inbox/issues/483) | 商品グループ ID 采用 SPU1；已上线组 ID 保持稳定，不批量重命名 |
| [#498](https://github.com/retailpulses/inbox/issues/498) / [#499](https://github.com/retailpulses/inbox/issues/499) | 12 月 SALE / 販売期間・二重価格以 SKU 或商品为锚 |

### 4.5 治理现状

| 事实 | 状态 |
|---|---|
| `retailpulses/.github` 无 SKU 变更/世系专用 issue 模板 | OBSERVED |
| PR 模板含 Data Model / Runtime Database Impact，无“业务自然键变更”检查项 | OBSERVED |
| 库存报表 join 不含别名解析 | OBSERVED |

---

## 5. 已观测到的失败模式（仅记录，不含处置）

| # | 观测 | 证据 | 事实强度 |
|---|---|---|---|
| F1 | SKU 改名后，历史销售与成本按旧码、新 listing 按新码，联接路径断开 | §4.1 + #269 | OBSERVED |
| F2 | 同一 listing 内老码与新码并列，且共用同一售价 | 16 个混合 listing | OBSERVED |
| F3 | listing 内的老码/新码配对与变更表不一致（颜色位不同） | Shop4 两个 listing | OBSERVED |
| F4 | Listing 停留在第 2 代码，落后一代 | 12 个 listing | OBSERVED |
| F5 | 已入库新码无可售 listing | 742 台 / 9 SKU | OBSERVED |
| F6 | 新码在供应商目录中缺失 | 18 / 31 | OBSERVED |

---

## 6. 未决问题（本文件不回答）

1. Mercari 原地修改 `SKUi_商品管理コード` 是否完整保留 商品ID/URL/评价/销售历史？（逻辑上 商品ID 不变，但未实测）
2. 修改 `種類` 是否影响 商品グループ 的 `商品i_省略名` 或成员资格？
3. 同一 listing 内两个 SKU 使用相同 `種類` 是否被平台接受？是否构成重复 listing？
4. Rakuten `SKU管理番号` 变更的官方语义与副作用？
5. 双轨期（老码+新码并存）的持续时间与判定条件？
6. 新码的 TCOGS 继承规则？
7. 两个边柜的“原木色”是否仍有独立 SKU？
8. 商品グループ ID 在 SPU1 变化后是否必须换组、如何换？
9. 10 个“去掉插座”SKU 的 listing 正文与图片是否仍含插座表述？（未读取 Seller 文案/图片，UNKNOWN）

---

## 7. 证据清单

| 证据 | 位置 | 日期 |
|---|---|---|
| N511 SKU 变更表 | Drive `1qmbE3rKQHImLMtTBn_uIlG3YsblrvH5v` | 2026-11-25 01:19 UTC |
| Giga Inventory v2 实测（62 SKU） | API 调用；原始响应未入库 | 2026-11-25 |
| Listing 快照 | `retailpulses/inbox` 工作区 `work/issue-524/listing_sku.json` | 2026-11-24/25 |
| 库存报表联接 | `poc-daily-stock-report.yml` | 2026-11-24 |
| Mercari CSV 规则 | `business/mercari/listing-csv-guideline.md` | 2026-11-18 |
| 商品グループ规则 | `business/mercari/product-group-management.md` | 2026-11-19 |
| 变更历史契约 | `inbox/operations/catalog/canonical-product-history.md` | 2026-10-04 |
