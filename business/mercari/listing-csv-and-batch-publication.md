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
- **PARTIAL:** 官方样例文件确有下载链接 `https://guide.mercari-shops-static.com/product_import_template_sample.csv`，但此轮未成功读取 CSV 原始字节/完整 header；应通过 Seller 后台下载且做精确 header fixture，不自造字段名或默认列序。
- **UNKNOWN:** Shop4 当前 Seller CSV 导入权限、注册区分与上限、现场 UI、实际 category/brand/shipping masters 版本、CSV 图片 URL 可达性、存量重复数量、NPL 生产待办数，均未现场读取。

## Canonical rules
| ID | 平台事实 / 内部规则 | 实现与验收 |
|---|---|---|
| **BUS-MER-001** | CSV 注册是**新增商品**，不是更新现有商品；每行一个 Mercari Product，可包含最多 10 个 SKU（種類）。一次最多 10,000 商品；大于 1,000 仅预览前 1,000。PC Web Seller 使用。 | `CREATE_CSV` 与 `UPDATE_CSV` 和 GraphQL 发布意图分开；不得将内部 SPU1 默认为一行商品。 |
| **BUS-MER-002** | 出品目标使用确切 Mercari Shop identity；内部 `shop4` 仅 selector。内部 Variant / Item Code / SPU1 不等同平台 Product ID；CSV 无法沿用已有商品的更新语义。 | 生成前以 Seller 实际 Shop4 身份验证；逐 SKU 检查线上是否已存在、已在导入批次或 UNKNOWN_OUTCOME；不能以「本地无 mapping」当不存在。 |
| **BUS-MER-003** | CSV 的官方必需/条件必需字段按**注册**模板决定；header 含首行，不得凭 GraphQL payload 推断列。可省略任意字段，但先采用完整受版本约束模板。 | 固定当前样例 headers、来源、hash、编码、有效 master；严格检查 BOM/CSV quotes/行数/编码，差异 fail closed。 |
| **BUS-MER-004** | 商品名 `商品名` 必填 <=130 字符；`商品説明` 任意 <=3000；`販売価格` 必填 ¥300–¥9,999,999，所有 SKU 共享同一售价；`カテゴリID` 正式注册必需，必须是 master ID，不是类别名称。 | 输出最终采用的 title/description/shop boilerplate/price/taxonomy snapshot。现有 NPL GraphQL title 120 上限是**当前代码规则**，CSV 官方上限 130，不擅自改变其他发布通道。 |
| **BUS-MER-005** | `商品画像名` 可为预上传 filename 或可访问的 image URL，最多 20；无图片可草稿、不能完成正式批量注册。jpg/jpeg/png，单图 <=8MB；本地批量上传总量 <=1GB。 | 保留 canonical 选图顺序；校验 URL 能被平台获取，或按官方流程先上传文件并引用实际文件名；不能将本地私有路径直接写进 CSV。 |
| **BUS-MER-006** | `SKU1_在庫数` 必填；`SKU1_同時購入可能数` 官方表中必填、允许 1–9999且未填按未设置；`SKU1_商品管理コード` 可选，<=50，ASCII alnum/-/_；`SKU1_JANコード` 可选 <=14；最多 SKU1–10。 `ブランドID` 可选，使用 brand master ID。 | 一 Variant 一商品为 NPL MVP 的建议，不自行将 SPU1 聚为多 SKU；用稳定 Item Code 管理映射（长度/字符需检查），库存不能用伪造的 0/1 补全未知事实。 |
| **BUS-MER-007** | `商品の状態` 1–6，`配送方法` 1–6，`発送元の地域` 如东京 `jp13`，`発送までの日数` 1–5，`商品ステータス` 1=非公開 / 2=公開，`配送料の負担` 1=卖家 / 2=买家；买家承担运费时 `送料ID` 必填。另有 Biz 冷链、预约商品日期等条件字段。 | UI 显示标签，adapter 输出官方代码；不盲拷 GraphQL enum，如 `UNOPENED`/ `SELLER`。运费ID是 Seller 配送配置标识，并非金额；按对应 master/Shop4 实际设置取值。 |
| **BUS-MER-008** | 缺图片或 category 的导入可成为 draft，不能视为完成上架；历史上传记录仅保留 7 天。Windows 推荐 Shift-JIS，非 Windows UTF-8（官方错误指南）。 | 将 `CSV_READY`, `DRAFT_ONLY`, `BLOCKED` 分开；保存原始 CSV、manifest、hash、Seller 导入结果和 reconciliation evidence 到持久存储；无回读不得标 `PUBLISHED`。 |

### 官方代码枚举（以最新模板为准）
- Condition `商品の状態`: `1` 新品未使用；`2` 未使用に近い；`3` 目立った傷や汚れなし；`4` やや傷や汚れあり；`5` 傷や汚れあり；`6` 全体的に状態が悪い。
- 配送方法: `1` 未定（出品者手配）、`2` クール便、`3` らくらくメルカリ便、`4` クールメルカリ便（冷蔵）、`5` クールメルカリ便（冷凍）、`6` メルカリBiz配送。只能使用对 Shop4 实际有效的方式。
- 発送までの日数: `1` 1–2日、`2` 2–3日、`3` 4–7日、`4` 90日以内、`5` 8–14日。条件/预售另外核对。
- 配送料の負担: `1` 送料込み（出品者負担）、`2` 送料別（購入者負担）。
- 商品ステータス: `1` 非公開、`2` 公開。**建议首次受控试点用非公開，不将建议当平台强制要求。**
- `メルカリBiz配送_クール区分` 等仅当对应配送方式需要；预售字段如発売日、予約受付开始/结束、キャンセル期限、お届け予定按条件出现，不能默认填造。

## Shop4 / NPL 业务实现建议（尚未批准/实现）
1. **入口**：NPL Variant/SPU1列表增加 `Shop4 → 批量导出 CSV`；使用现有共享 title、description、selected image order、shop boilerplate、price intent 和 Canonical commercial facts；不新建另一套内容库。
2. **准备集**：选择仅 Shop4 缺口且 Seller SKU **查重已确认不存在**的目标；保留源 hash / versions / price / shop identity / intended status / operator selection，并将 UNKNOWN_OUTCOME 阻断重复创建。
3. **适配层**：独立 `MercariCsvCreateAdapter`，消费与 GraphQL publisher 相同的冻结业务 snapshot，但输出官方 CSV 的字符串字段/枚举/图片 URL/filename；载入官方 template+masters version fixture，不重新编码 GraphQL JSON。
4. **批次 UX**：展示 total / ready / draft-only / blocked 和逐行原因；Operator 一次显式确认批次，下载 `csv` + `manifest`（不额外强制复核已接受文案/图片）。CSV 只**生成文件**，不调用 Seller 发布 API。
5. **上传/回读**：操作员在 Shop4 的 Seller PC Web 上传 CSV；导入完成后回读商品/SKU，与导出的 manifest 对齐，分别标记已创建、草稿、失败、重复、待核实；UNKNOWN 只能人工恢复/核查，不能盲重试。
6. **加速目标**：优先处理 Shop4 的 HERO/NEW backlog，先导出有完整图片与类目的 20–50 条验收试批；再扩大批量（非平台限制），以成功 Seller 回读数量和减少的积压数衡量，不以生成 CSV 行数宣称完成。
7. **兼容**：沿用现有 Shop4 price rules（含已批准的 9% bottom-line 特例），Canon 来源、类别人工选择、无成本非阻断但显式 warning 等现有 NPL Sponsor 决定；不引入另一套定价算法或双重审核。现行代码的严格门槛与设计批准差异须按 Current State 核对。
8. **验收**：官方 header 精确 fixture、编码/日文换行、图片顺序/URL、1/10 SKU、价格边界、缺图/类目草稿、配送/运费组合、Shop4身份不符、Seller已存在、UNKNOWN_OUTCOME、重复导出、部分成功/7日证据保留、零自动 marketplace mutation。

**Open for owner/sponsor:** Shop4 当下真实 CSV template/master 下载与身份验证；图像可用公链还是要先预上传；销售价格/库存 provenance；Seller 真实试点。实施任务应留在 store-ops GitHub Issue，设计/TRD/Current State 分开更新，不在本文件维护另一个 Sprint 状态。

**Rule change governance:** 官方平台变更重新验证来源、修订 BUS-MER ID 及消费者测试；仅 Sponsor-approved 商业政策可改变公司内部运营规则。官方约束与商业决策分层，不把 Draft 当已经部署。
