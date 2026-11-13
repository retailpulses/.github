# Mercari Shops — CSV 一括出品业务契约（BUS-MER-001–008）

**Status:** Sponsor Review / Draft · **Evidence checked:** 2026-11-11 JST · **Business owner:** Mercari Store Operations · **Implementation owner:** `retailpulses/store-ops/apps/mercari/new-products-to-listing` (NPL)

此处定义 Mercari Shops CSV 出品的官方平台约束和跨产品业务语义。**不是可执行 CSV schema、生产发布授权或实际已部署能力**。CSV header/masters 应从当前官方模板或实际 Shop4 后台取得，并保留版本/hash；本文件只记录已经核实的字段语义。Marketplace identity 依 [BUS-MKT-001–004](../marketplace-model.md)，价格成本依 [BUS-PRC](../pricing-contract.md)。NPL Design/TRD 定义产品交互与实现。

## 官方来源及证据等级
- **VERIFIED / 官方指南：** [商品を一括登録する際のCSVファイルの作り方](https://support.mercari-shops.com/hc/ja/articles/8859698858649) — 字段、枚举、限制、示例文件/各 master 下载入口、流程。
- **VERIFIED / 官方指南：** [商品画像を一括登録する手順](https://support.mercari-shops.com/hc/ja/articles/10202904748057) — 图片 URL / 文件、大小与格式。
- **VERIFIED / 官方指南：** [商品データを一括登録する際にエラーが表示された](https://support.mercari-shops.com/hc/ja/articles/10206678157721) — 编码、header、导入错误。
- **VERIFIED / 官方指南：** [商品データの一括登録時に商品カテゴリが反映されていない](https://support.mercari-shops.com/hc/ja/articles/10205928980889) — category must be ID, exact case.
- **VERIFIED / 官方指南：** [商品データの一括公開・非公開ができない](https://support.mercari-shops.com/hc/ja/articles/10245492721433) — 缺图/类目时草稿限制。
- **VERIFIED / 官方指南：** [商品を一括変更する際のCSVファイルの作り方](https://support.mercari-shops.com/hc/ja/articles/60017371839513) — UPDATE 使用另一模板，不能混用。
- **VERIFIED / 用户提供样本原始字节（不是 Seller 导入验证）：** 2026-11-13 Sponsor 上传 `product_import_template_sample.csv`，来源称为 Mercari CREATE 样本；SHA-256 `66be37da22f320151af00bd40b05d64d74118c91be70b1b36952c2427d910829`，大小 2,737 bytes，UTF-8 BOM、CRLF、88 列固定 Header、2 个示例记录，均为 88 列。已将该文件持久化至 ChatGPT Library `/Retailpulses/Giga-Mercari-POC/product_import_template_sample_20261113.csv`。文件名与官方指南的 [样本入口](https://guide.mercari-shops-static.com/product_import_template_sample.csv) 对应，但因联网直接取 CSV 失败，**未独立证明用户文件 bytes 与官网当前在线 bytes 一致**；也未进行 Seller 接受验证。详细证据见 store-ops #314。
- **UNKNOWN:** Shop4 当前 Seller CSV 导入权限、注册区分与上限、现场 UI、实际 category/brand/shipping masters 版本、CSV 图片 URL 可达性、存量重复数量、NPL 生产待办数，均未现场读取。

## 适用范围澄清（2026-11-13）

BUS-MER 为跨产品的平台规则及其证据，下面部分 Shop4/NPL 历史运营与 Seller 查重/回执要求只适用于该历史流程，**不应自动延伸到独立通用 Giga XLSX→CSV 产品（store-ops #312）**。#312 已经排除 Seller 查询、回执/发布状态、Shop-specific Settings 和 Canonical 迁移。通用产品仍须遵守 CREATE 格式和必填校验，但不提供 Seller 读写功能。这里不是废除 Shop4 已有运营决定。

## Canonical rules
| ID | 平台事实 / 内部规则 | 实现与验收 |
|---|---|---|
| **BUS-MER-001** | CSV 注册是**新增商品**，不是更新现有商品；每行一个 Mercari Product，可包含最多 10 个 SKU（種類）。一次最多 10,000 商品；大于 1,000 仅预览前 1,000。PC Web Seller 使用。 | `CREATE_CSV` 与 `UPDATE_CSV` 和 GraphQL 发布意图分开；不得将内部 SPU1 默认为一行商品。 |
| **BUS-MER-002** | 出品目标使用确切 Mercari Shop identity；内部 `shop4` 仅 selector。内部 Variant / Item Code / SPU1 不等同平台 Product ID；CSV 无法沿用已有商品的更新语义。 | 生成前以 Seller 实际 Shop4 身份验证；逐 SKU 检查线上是否已存在、已在导入批次或 UNKNOWN_OUTCOME；不能以「本地无 mapping」当不存在。 |
| **BUS-MER-003** | CSV 的官方必需/条件必需字段按**注册**模板决定；header 含首行，不得凭 GraphQL payload 推断列。可省略任意字段，但先采用完整受版本约束模板。 | 固定当前样例 headers、来源、hash、编码、有效 master；严格检查 BOM/CSV quotes/行数/编码，差异 fail closed。 |
| **BUS-MER-004** | 商品名 `商品名` 必填 <=130 字符；`商品説明` 任意 <=3000；`販売価格` 必填 ¥300–¥9,999,999，所有 SKU 共享同一售价；`カテゴリID` 正式注册必需，必须是 master ID，不是类别名称。 | 输出最终采用的 title/description/shop boilerplate/price/taxonomy snapshot。现有 NPL GraphQL title 120 上限是**当前代码规则**，CSV 官方上限 130，不擅自改变其他发布通道。 |
| **BUS-MER-005** | `商品画像名` 可为预上传 filename 或可访问的 image URL，最多 20；无图片可草稿、不能完成正式批量注册。jpg/jpeg/png，单图 <=8MB；本地批量上传总量 <=1GB。 | 保留 canonical 选图顺序；校验 URL 能被平台获取，或按官方流程先上传文件并引用实际文件名；不能将本地私有路径直接写进 CSV。 |
| **BUS-MER-006** | `SKU1_在庫数` 必填；用户提供的 2026-11-13 CREATE 样本（88 列）**不包含** `SKU1_同時購入可能数`；当前官网 CREATE 页面字段表也未列该字段，早先关于此字段必填的表述撤销，后续若平台模板改变需重新核验；`SKU1_商品管理コード` 可选，<=50，ASCII alnum/-/_；`SKU1_JANコード` 可选 <=14；最多 SKU1–10。 `ブランドID` 可选，使用 brand master ID。 | 一 Variant 一商品为 NPL MVP 的建议，不自行将 SPU1 聚为多 SKU；用稳定 Item Code 管理映射（长度/字符需检查），库存不能用伪造的 0/1 补全未知事实。 |
| **BUS-MER-007** | `商品の状態` 1–6，`配送方法` 1–6，`発送元の地域` 如东京 `jp13`，`発送までの日数` 1–5，`商品ステータス` 1=非公開 / 2=公開，`配送料の負担` 1=卖家 / 2=买家；买家承担运费时 `送料ID` 必填。另有 Biz 冷链、预约商品日期等条件字段。 | UI 显示标签，adapter 输出官方代码；不盲拷 GraphQL enum，如 `UNOPENED`/ `SELLER`。运费ID是 Seller 配送配置标识，并非金额；按对应 master/Shop4 实际设置取值。 |
| **BUS-MER-008** | 缺图片或 category 的导入可成为 draft，不能视为完成上架；历史上传记录仅保留 7 天。Windows 推荐 Shift-JIS，非 Windows UTF-8（官方错误指南）。 | 将 `CSV_READY`, `DRAFT_ONLY`, `BLOCKED` 分开；保存原始 CSV、manifest、hash、Seller 导入结果和 reconciliation evidence 到持久存储；无回读不得标 `PUBLISHED`。 |

### 官方代码枚举（以最新模板为准）
- Condition `商品の状態`: `1` 新品未使用；`2` 未使用に近い；`3` 目立った傷や汚れなし；`4` やや傷や汚れあり；`5` 傷や汚れあり；`6` 全体的に状態が悪い。
- 配送方法: `1` 未定（出品者手配）、`2` クール便、`3` らくらくメルカリ便、`4` クールメルカリ便（冷蔵）、`5` クールメルカリ便（冷凍）、`6` メルカリBiz配送。只能使用对 Shop4 实际有效的方式。
- 発送までの日数: `1` 1–2日、`2` 2–3日、`3` 4–7日、`4` 90日以内、`5` 8–14日。条件/预售另外核对。
- 配送料の負担: `1` 送料込み（出品者負担）、`2` 送料別（購入者負担）。
- 商品ステータス: `1` 非公開、`2` 公開。**Shop4 CREATE CSV 的公司运营决定（Sponsor 2026-11-11）：默认使用 `2=公開`，不再将 `1=非公開` 作为 Shop4 首次导入默认值。**
- `メルカリBiz配送_クール区分` 等仅当对应配送方式需要；预售字段如発売日、予約受付开始/结束、キャンセル期限、お届け予定按条件出现，不能默认填造。

## 官方 CREATE CSV 字段参考（2026-11-11 直接复核）

**证据：** [Mercari 官方 CREATE 指南](https://support.mercari-shops.com/hc/ja/articles/8859698858649) + Sponsor 2026-11-13 上传的 CSV 原始字节。**已验证上传样本本身的 88 列/Header 顺序/UTF-8 BOM/CRLF/SHA-256**；尚未独立验证上传文件与在线官方样本字节完全相同，也未验证 Seller 当前租户的导入接受结果。样本中 20 张图片列、`商品名`、`商品説明`、SKU1–10 每组 5 列、`ブランドID`、`販売価格`、`カテゴリID` 等字段。**不应再把本次 88 列样本描述为无实物依据的内部候选**。

### 下载入口与行语义

- 官方提供 Excel 创建格式、Windows/Mac 通用 CSV 样例、Windows/Mac 品牌名 Master、Windows/Mac 商品类别 Master，以及通用 Catalog Master。品牌映射取 `ブランドID`，类别映射取 `カテゴリID`，Catalog 映射取 `catalog_id`。
- **每行一件商品**，可在行内使用 SKU1–SKU10 表达多个種類；每件商品最多 20 张图。不要将内部 SPU1 自动压缩为一个平台商品。
- 官方明确允许调整列顺序、删除无需填写的**可选**列。我们的 Agent 首次输出仍优先保留下载所得模板的完整真实 Header，以便稳定校验。
- 仅 PC Web 版支持商品一括登録；单次最多 10,000 商品，超过 1,000 时预览仅显示前 1,000。
- 页面还有**个人事业主**开店早期 200 商品限制的条件说明；不是自动适用于法人 Shop4，仍须以真实 Seller 状态为准。

### 官方字段定义（按网页逐项核对，非 Header fixture）

| 官方字段 | 要求 | 约束与映射注意 |
|---|---|---|
| `商品画像名`（至 `商品画像名_20`） | 正式一括登録需要 | 可用预上传的文件名或可直接访问的图像 URL；无图只能草稿 |
| `商品名` | 必填 | 最多 130 字符 |
| `商品説明` | 可选 | 最多 3,000 字符；换行保留 |
| `SKU1_種類` | 可选 | 同商品的種類名称 |
| `SKU1_在庫数` | 必填 | 无论是否填写種類均须填写；不得捏造库存 |
| `SKU1_同時購入可能数` | **当前样本不存在** | 2026-11-13 上传样本 88 列与当前网页字段表均无此字段；不得凭历史猜测新增该列。未来模板变化需重新核实。 |
| `SKU1_商品管理コード` | 可选 | 最多 50 字符，仅 ASCII 英数字及 `-`、`_` |
| `SKU1_JANコード` | 可选 | 最多 14 字符；官网说明支持英数字及 `-`、`_` |
| `SKU1_catalog_id` | 可选 | Catalog Master/检索中确认的 13 位英数字 |
| `SKU2`–`SKU10` 相应列 | 条件可选 | 多種類时使用；不可假定每个 SKU 单独定价 |
| `ブランドID` | 可选 | 使用官方品牌 Master 的 ID，不用品牌文本 |
| `販売価格` | 必填 | 300–9,999,999 日元；同商品所有 SKU 同价 |
| `カテゴリID` | 正式注册必需 | 必须使用**当前 Mercari 商品类别 Master 中存在的字符串 ID**。Shop4/NPL 生成时优先读取 Canonical/NPL category resolver 的当前 `canonical_presentation` / approved resolution；不得直接使用旧 `production.product_variants.mercari_category_id` 数字字段。缺失只能草稿，之后可在后台补齐 |
| `商品の状態` | 必填 | 数字 1–6 |
| `配送方法` | 必填 | 数字 1–6，Shop4 实际可用方式须核实 |
| `発送元の地域` | 必填 | 都道府县官方代码，例如东京为 `jp13` |
| `発送までの日数` | 必填 | 1=1–2日，2=2–3日，3=4–7日，4=90日以内，5=8–14日；官方注明应考虑营业日/休业日 |
| `商品ステータス` | 必填 | 1=非公開，2=公開 |
| `保証付き整備品` | 条件适用 | 0=未设置，1=Refurbished；只对适用的 program/m department 店铺显示 |
| `配送料の負担` | 必填 | 1=卖家负担，2=买家负担 |
| `送料ID` | 买家负担时必填 | 使用 Shop4 实际配置的 Shipping Fee ID，不是金额 |
| `メルカリBiz配送_クール区分` | Biz 配送时必填 | 1=普通，2=冷藏，3=冷冻 |
| `販売チャネル` | 条件可选 | 仅 m department 对象商店；1=ALL_CHANNELS、2=MERCARI_SHOPS；空白默认全部渠道 |
| `発売日` | 预约商品必填 | 预约商品的销售开始日，最多可指定未来 2 年 |
| `予約受付開始日` / `予約受付終了日` | 预约商品必填 | 必须来自实际批准的预约参数 |
| `キャンセル期限` | 预约商品必填 | 预约取消期限；官方要求与発売日的日期关系 |
| `お届け予定` | 预约商品必填 | 1=発売日到货，2=発売日之后到货 |

### 导入流程及状态语义

1. 先在 Seller 的商品一括登録界面上传商品图片，**或**准备可直接访问的图片 URL。
2. 下载当前 Seller CSV 模板，使用已验证的官方代码及 Master ID 生成 CREATE CSV。
3. 通过 `出品・商品一覧 → CSV一括登録 → ②CSVファイルをアップロード → 一括で登録する` 执行操作。上传前仍需人工审核；Agent 不得自行执行。
4. 缺少 `商品画像名` 或 `カテゴリID` 时可保存为草稿，但不能视为可正式批量注册/公开；不能把 `DRAFT_ONLY` 算入 `CSV_READY`。
5. CSV 上传后超过 7 天，平台会删除对应 CSV 文件并从变更历史移除。因此原始导入文件、manifest、Seller 导入结果及回读证据必须在公司受限存储中独立保留。

### #303 Agent 的验证关口

- **Fixture gate：** 下载官方 CSV 原始文件，逐字节保存 Header/编码、来源 URL 与 SHA-256；官网 HTML 表格不能冒充完整 Schema。
- **Master gate：** 读取实际分类、品牌（如使用）、Catalog（如使用）及 Shop4 配送配置；绝不把类别名称、配送费用或 GraphQL enum 当作 CSV ID。
- **Ready gate：** 校验 title/description 长度、价格区间、有效 SKU 字符、图库/可访问 URL、库存真实性、必填/条件字段，以及 Seller 中已存在或 UNKNOWN_OUTCOME 的重复风险。
- **Scope gate：** 仅 Shop4 CREATE；不生成 UPDATE，不调用发布 API，不修改 NPL。
- **Evidence gate：** manifest 对每个 Variant 记录 `CSV_READY` / `DRAFT_ONLY` / `BLOCKED`，注明依据和缺项；不声称已导入或公开。

## Shop4 CREATE CSV 默认发布策略（Sponsor 2026-11-11）

- `商品ステータス`：默认填 `2`（公開）。这是 Shop4 的公司运营决定，不是 Mercari 平台强制默认值。
- `商品の状態`：默认填 `1`（新品、未使用）。不得把商品状态与公开状态混淆。
- `発送元の地域`：`jp13`（東京）。
- `発送までの日数`：`2`（2–3日）。
- `配送料の負担`：`1`（送料込み／出品者負担）。Shop4 使用 `mercari_effective_price_incl_shipping` 作为销售价时，CSV 采用卖家承担运费。
- `配送方法`：当前公司决定为 `1`（未定）。如 Seller 配送方式发生变化，必须以 Shop4 实际有效配置重新核实。
- 本规则适用于 Shop4 新商品 CREATE CSV；若 Sponsor 明确要求某批次先非公开，则按批次指令覆盖默认值。

## Shop4 — Agent 利用现有 NPL 生成 CSV（Sponsor 2026-11-11 已明确）

**不是新功能开发需求。** 规则登记仅负责 CSV 业务语义；不授权建设 exporter、修改 NPL UI/后端/SQLite/schema、部署发布流程或追加产品审批。实际交付使用一次性 Agent 读取现有 NPL/Canonical/Seller 数据，离线生成 CSV，交给运营者审核与人工上传。

- 已有 NPL 共享 title、description、accepted images、按店铺渲染、价格/库存/分类字段及 Seller 查询能力；在**读权限允许且值真实可用**时直接复用，不重新生成内容、不覆盖人工修改。
- Agent 下载当前官方模板与分类等 master，保留原始文件及版本；根据真实 header/编码做字段映射，不把 GraphQL payload 当 CSV schema。
- 只筛选 Shop4 的真实缺口；对 Seller SKU 重复和 UNKNOWN_OUTCOME 做只读查重，不把本地未映射当不存在。
- 一次性输出 `shop4_new_listings_YYYYMMDD.csv`、紧凑 `manifest.csv` 与不足条件清单；将有完整字段可导入商品与缺图/类别可存草稿商品分开，不伪造库存、类目、售价。 **最终可上传的 `shop4_new_listings_YYYYMMDD.csv` 只能包含通过必填字段校验的行；缺图片、价格、库存、类别或其他阻断项的商品必须从最终上传 CSV 剔除，只保留在 gap/manifest 中。已存在 SKU 与 `UNKNOWN_OUTCOME` 同样不得进入 CREATE CSV。**
- 校验官方格式、价格范围、日文字符编码、图片可访问性、SKU、店铺身份、当前运营策略；**没有人工确认不上传**。
- 若缺现有环境访问权限或真实数据，报告具体阻断；不得生成虚构 CSV 或提出改造系统才能做。
- 操作追踪以 [Store OPS #303](https://github.com/retailpulses/store-ops/issues/303) 为准；不在规范中维护额外实施计划。

**Rule change governance:** 官方平台变更重新验证来源、修订 BUS-MER ID 及消费者测试；仅 Sponsor-approved 商业政策可改变公司内部运营规则。官方约束与商业决策分层，不把 Draft 当已经部署。
