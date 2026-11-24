# Rakuten-Style Main Image — Rules, Design, R2 Delivery

状态：**Draft / Sponsor Review** · Owner：Business / Listing · 日期：2026-11-22
证据状态：Rakuten 主图规则 **VERIFIED**（官方 RMS Service Square コラム，2025-12-26 更新）；尺寸/容量/违规点数细节 **PARTIAL**（第三方整理，需 RMS 登录后复核）；R2 → Mercari 链路 **VERIFIED**（2026-11-22 实测）。

> **Canonical cross-platform rule:** the main-image contract is the [Cross-Platform Main Image Standard — Mercari Shops + Rakuten](../listing/main-image-standard.md) (BUS-IMG-001–012). This document is the Rakuten-style rendering and R2 delivery guide; where the two differ, the standard wins and this document MUST be updated. Current alignment: 1500×1500, text ≤20% (target 9.5%), no border, solid #FFFFFF background, no promotional text in the main image.

## Scope

Mercari Shops 的商品主图采用 **Rakuten 风格**（楽天市場の第1商品画像に近い構図・情報量）。本文档定义：

1. 约束这张图的 Rakuten 官方规则；
2. 我们的最终设计规格；
3. 生成图的 Cloudflare R2 存储与公开 URL 生成方式。

**不在本文档范围：** Rakuten 上架文案、R-Cabinet 上传流程、Mercari CSV 的其他字段。

---

## 1. Rakuten main image rules

**适用范围（官方）：** 第1商品画像（商品页第一张、搜索结果缩略图）与 **SKU画像**。
**不适用：** 第2张以后的商品画像、商品说明文/販売説明文里的图片。

### 1.1 四条硬规则（官方）

| # | 规则 | 说明 | 我们的处理 |
|---|---|---|---|
| 1 | **テキスト要素占有率 ≤ 20%** | 文字、Logo、商品名、规格、促销文案、价格/积分都计入；不是"不能有字"，而是不能超过 1/5 面积 | 渲染后实测 `text_ratio`，当前 9.5% |
| 2 | **枠線なし** | 四边围框、L 字、带状装饰、以阴影冒充边框都算违规 | 全图无边框、无装饰条 |
| 3 | **背景は単色白 or 写真背景のみ** | 纯白（#FFFFFF）或实拍照片背景；渐变/图案/人工合成背景不合规 | 纯白画布（#FFFFFF） |
| 4 | **アニメーションGIF 不可** | 动态 GIF 不能用于 guideline 对象图 | 只出 PNG / JPG |

> 官方判定分三段：**◎ OK / △ 要改善 / × 違反**。第三方整理称文字占比 20–31% 落在 △、>31% 为 ×，需以 RMS 实际判定为准（PARTIAL）。

### 1.2 尺寸、格式、数量（PARTIAL — 需 RMS 复核）

| 项 | 要求 | 我们的产出 |
|---|---|---|
| 推荐尺寸 | 正方形 **700×700 以上**；实务 700–1000px | **1500×1500** |
| 最大尺寸 | 3840×3840 | 1500 ✓ |
| 存储预算 | R-Cabinet **1.5GB 总容量 / 307.4MB 可用**（2026-11-24 RMS）；只放 Rakuten 主图 + SKU 图 | 533 商品 × 2 张 × 150KB ≈ 160MB（52%）；8 槽图放 R2，不入 R-Cabinet |
| 文件容量 | R-Cabinet 单文件上限 2MB；内部目标 **≤150KB**、硬上限 **200KB** | JPG ≈90–180KB @ q75–80；PNG 仅归档 |
| 格式 | JPG / GIF（PNG 会被转换） | JPG 上传，PNG 归档 |
| 数量 | 1 商品 ≤ 20 张 | 主图 1 张 |

**违规代价（PARTIAL）：** 违反一次按商品计 **違反点数 5 点**（与该商品违规图片张数无关），累积影响曝光、搜索排序、RPP 广告资格。

### 1.3 对设计的直接影响

- 第1张图能承载的信息有限：**商品类型 + 尺寸 + 3 个属性**已是上限，第 4 条卖点放到第 2 张以后的图。
- 促销信息（送料無料、ポイント、セール）既占 20% 配额、又会在活动结束后让图过期，不进入主图。
- 纯白背景是唯一同时满足 Rakuten 规则与 Mercari 主图习惯的背景选择。

---

## 2. Design spec

### 2.1 内容规则

| 规则 | 决定 | 原因 |
|---|---|---|
| **商品类型为第一层级** | 类型做 96px 主标题（例：「コレクションケース」） | 缩略图尺寸下也能判断"这是什么" |
| **必须有尺寸** | 底部一行 **高さ / 幅 / 奥行** | 家具类购前第一疑问是"放不放得下" |
| **3 个核心卖点** | 左侧纵排、52px、带项目符号 | 可读性优先；填充左侧留白 |
| **卖点必须是产品属性** | 例：4段 / 全面ガラス / 棚板高さ調整 | 长期成立，不随活动过期 |
| **禁止促销/优惠信息** | 送料無料、ポイント、クーポン、セール、割引、価格、円 等一律不出现 | 主图是商品资产不是促销素材；且占用 20% 配额 |
| **不加顶部装饰线/短横条** | 标题直接从版面上沿起排 | 避免被判定为「帯状要素」的灰色地带 |
| **不写完整商品名** | 只写类型 + 一句利益点 | 完整标题交给 Mercari 标题字段 |

**强制实现：** 渲染器内置 `assert_no_offer_text()`；任何标题、副标题、标签、尺寸文案命中促销词即抛错、不出图。

### 2.2 版式与量化指标

| 指标 | 目标 | 当前 |
|---|---|---|
| 产品占画面 | 65–75% | **66%** |
| 文字占比 | ≤ 20% | **9.5%** |
| 画布 | 1:1 正方形 | **1500×1500** |
| 背景 | #FFFFFF 纯白 | 是 |
| 边框 / 装饰条 | 无 | 无 |

版式：

```
┌──────────────────────────────────────┐
│ コレクションケース            (96px)   │
│ フィギュアも食器も、美しく飾れる。      │
│                                      │
│ ▪ 4段                 [商品图]        │
│ ▪ 全面ガラス           66%           │
│ ▪ 棚板高さ調整                        │
│                                      │
│  高さ 164cm ｜ 幅 80.5cm ｜ 奥行 36.5cm │
└──────────────────────────────────────┘
```

### 2.3 底图选择

- 优先：**白底 3/4 视角、带陈列**的供应商图（有纵深、能看出用途）。
- 避免：白底正面空柜（白色玻璃柜 + 白底会丢失轮廓）。
- 合成：供应商白底与纯白画布做正片叠底，**不抠图**、无硬边矩形。

---

## 3. R2 delivery

### 3.1 配置

| 项 | 值 |
|---|---|
| Bucket | `resize-product-images` |
| 公开域名 | `https://img.homesbliss.net`（自定义域绑定该 bucket，SSL 已签发） |
| 上传方式 | `wrangler r2 object put {bucket}/{key} --file <file> --remote --content-type image/jpeg` |
| 公网 URL | `https://img.homesbliss.net/{key}` |
| 缓存 | `cache-control: max-age=14400` |

**域名约束：** 只有 **`homesbliss.net`** 在 Cloudflare 托管；`retailpulses.com` 由 Wix 管理，不能用于 R2 custom domain。生产图片域名只能取 homesbliss.net 子域。

### 3.2 Object key

```
main-image/{item_code}/{item_code}_{variant}_{sha256[:8]}.jpg
# 例：main-image/n515s537400w/n515s537400w_c4_18e1aed2.jpg
```

- **内容哈希**：同名覆盖会遭遇 CDN 缓存；哈希 key 等价 immutable，回滚与 A/B 都安全。
- **variant**：同一 SKU 可有多个版式（C4/C3 等），便于对比与回退。
- **item_code 前缀**：与现有超图重传的 key 结构一致，便于按 SKU 批量清理。

manifest 每行至少记录：`item_code`、`variant`、`r2_key`、`public_url`、`bytes`、`sha256`、`renderer_version`、`created_at`。manifest 是下游 CSV 的唯一输入。

### 3.3 关键约束

1. **`r2.dev` 不是生产域名。** Cloudflare 官方明确：`r2.dev` 仅用于非生产、有限流；缓存/WAF/Bot Management 必须挂自定义域。生产统一使用 `img.homesbliss.net`。
2. **R2 ≠ R-Cabinet。** Rakuten 商品图在 CSV 里是 **R-Cabinet 路径**，说明文图片也只能用 R-Cabinet；R2 公网 URL 不能填进 Rakuten 商品画像字段。R2 服务 **Mercari CSV（外部 URL）** 与内部资产归档。
3. **Mercari 会转存外链图片。** `updateProduct` 接受 R2 URL 后，Mercari 把图片抓取到 `assets.mercari-shops-static.com` 并替换整个 `imageUrls` 列表。因此 R2 承担**摄取源 + 归档**，外链只需在更新那一刻可达；重发/回滚仍依赖 R2 对象存在。
4. **Mercari 侧限制：8MB/张、≤20 张**（见 [Giga Image Selection Policy](https://github.com/retailpulses/.github/blob/main/business/mercari/images/giga-image-selection-policy.md)）。1500 JPG ≈ 198KB，余量充足。

### 3.4 生命周期

| 项 | 规则 |
|---|---|
| 上传触发 | 独立 CLI/runner job，幂等：同 hash 已存在则跳过 |
| 回滚 | 保留历史 hash 对象；重发旧 key 即可 |
| 保留期 | 在架 SKU 永久；下架后 90 天 |

### 3.5 Verified

| 项 | 结果 |
|---|---|
| 自定义域 | `img.homesbliss.net` → `resize-product-images`；`HTTP/2 200` |
| 对象完整性 | 本地与公网下载 sha256 一致；`content-type: image/jpeg` |
| Mercari 写入 | `updateProduct` 返回无 errors；14 张图，首张为生成图 |
| 字段副作用 | name / price / status / description 均未变 |

---

## 4. Operating procedure

1. 选底图（白底 3/4、无供应商文字）。
2. 配置产品级参数（类型、卖点、尺寸）。
3. 渲染 + 校验：`text_ratio ≤ 0.20`、无促销词、1500×1500、JPG ≤200KB（目标 ≤150KB）。
4. 上传 R2（key 含内容哈希），写 manifest。
5. Mercari 侧更新 `imageUrls`，或 CSV 引用 manifest 里的 public URL。
6. 回读验证：URL 200、sha 一致；Mercari 确认首图为新图、其他字段未变。

---

## 5. Evidence

| Claim | Source | Status |
|---|---|---|
| 20% 文字 / 无边框 / 白底或照片背景 / 禁动态 GIF；适用第1图与 SKU 图 | [RMS Service Square「商品画像登録ガイドライン」徹底対応](https://service.rms.rakuten.co.jp/column/detail/26)（官方，2025-12-26 更新） | VERIFIED |
| 700×700 以上推奨、正方形 | 同上 | VERIFIED |
| 20–31% = △、>31% = ×；违规 5 点 | 第三方整理（e-hub、sobani 等） | PARTIAL — 需 RMS 判定工具复核 |
| 2MB / 3840×3840 / 20 张 / JPG-GIF | 第三方整理 | PARTIAL — 属 RMS 上传规格，需登录复核 |
| R2 bucket / key / wrangler 上传 / 公开 URL 生成 | 代码库 `Techstack` | VERIFIED |
| `r2.dev` 仅非生产、有限流；自定义域才有缓存/WAF | [Cloudflare R2 Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)（2026-11-12 更新） | VERIFIED |
| Mercari 8MB/张、≤20 张、CSV 可用外部 URL | [Giga Image Selection Policy](https://github.com/retailpulses/.github/blob/main/business/mercari/images/giga-image-selection-policy.md) + Mercari 官方帮助 | VERIFIED |
| Mercari 转存外链图片并替换 assets URL | 2026-11-22 API 实测 | VERIFIED |

---

## 6. Open items

1. **PNG 是否长期归档**：JPG 已满足上传；PNG 保留可作再编辑源，需确定存放位置（R2 或 Git LFS/artifact）。
2. **RMS 判定口径复核**：量产前用 RMS「画像判定」工具实测 3–5 张，确认 20% 计算口径与 `text_ratio` 一致。
3. **代码归属**：`rakuten-style-poc/` 迁入 `store-ops` 还是 `rakutenops`。
