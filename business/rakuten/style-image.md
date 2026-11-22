# Rakuten-Style Main Image — Platform Rules, Our Preference, R2 Delivery

状态：**Draft / Sponsor Review** · Owner：Business / Listing · 日期：2026-11-22
证据状态：Rakuten 主图规则 **VERIFIED**（官方 RMS Service Square コラム，2025-12-26 更新）；尺寸/容量/违规点数细节 **PARTIAL**（第三方整理，需 RMS 登录后复核）；R2 现状 **VERIFIED**（读代码库实际实现）。

## Scope

Mercari Shops 的商品主图采用 **Rakuten 风格**（楽天市場の第1商品画像に近い構図・情報量）。本文档定义三件事：

1. 约束这张图的 Rakuten 官方主图规则；
2. 我们自己的设计偏好（已锁定）；
3. 生成图的 Cloudflare R2 存储与公开 URL 生成方式。

**不在本文档范围：** Rakuten 上架文案、R-Cabinet 上传流程、Mercari CSV 的其他字段。主图渲染实现见 `rakuten-style-poc/`（本地 POC，待迁入产品仓库）。

---

## 1. Rakuten main image rules

**适用范围（官方）：** 第1商品画像（商品页第一张、搜索结果缩略图）与 **SKU画像**。
**不适用：** 第2张以后的商品画像、商品说明文/販売説明文里的图片。

### 1.1 四条硬规则（官方）

| # | 规则 | 说明 | 我们的处理 |
|---|---|---|---|
| 1 | **テキスト要素占有率 ≤ 20%** | 文字、Logo、商品名、规格、促销文案、价格/积分都计入；不是"不能有字"，而是不能超过 1/5 面积 | 渲染后实测 `text_ratio`，当前 9.5% |
| 2 | **枠線なし** | 四边围框、L 字、带状装饰、以阴影冒充边框都算违规 | 全图无边框元素 |
| 3 | **背景は単色白 or 写真背景のみ** | 纯白（#FFFFFF）或实拍照片背景；渐变/图案/人工合成背景不合规 | 纯白画布（#FFFFFF） |
| 4 | **アニメーションGIF 不可** | 动态 GIF 不能用于 guideline 对象图 | 只出 PNG / JPG |

> 官方判定是三段的：**◎ OK / △ 要改善 / × 違反**。第三方整理称文字占比 20–31% 落在 △、>31% 为 ×，需以 RMS 实际判定为准（PARTIAL）。

### 1.2 尺寸、格式、数量（PARTIAL — 需 RMS 复核）

| 项 | 常见要求 | 我们的产出 |
|---|---|---|
| 推荐尺寸 | 正方形 **700×700 以上**；实务 700–1000px | 1500×1500 源图 + 1000×1000 上传图 |
| 最大尺寸 | 3840×3840 | 1500 ✓ |
| 文件容量 | ≤ 2MB | PNG ≈ 620KB / JPG ≈ 88KB ✓ |
| 格式 | JPG / GIF（PNG 会被转换） | 上传用 JPG |
| 数量 | 1 商品 ≤ 20 张 | 主图 1 张 |

**违规代价（PARTIAL）：** 违反一次按商品计 **違反点数 5 点**（与该商品违规图片张数无关），累积影响曝光、搜索排序、RPP 广告资格。

### 1.3 对我们设计的直接影响

- 第1张图能承载的信息很少：**商品类型 + 尺寸 + 3 个属性**已经是上限，第 4 条卖点应放到第 2 张以后的图，而不是继续挤主图。
- 促销信息（送料無料、ポイント、セール）既占 20% 配额、又会在活动结束后让图过期，**不适合放进主图**。
- 纯白背景是唯一能同时满足 Rakuten 规则与 Mercari 主图习惯的背景选择。

---

## 2. Our preference (locked 2026-11-22)

经三轮评审后锁定，作为该类目主图的默认版式。

### 2.1 内容规则

| 规则 | 决定 | 原因 |
|---|---|---|
| **必须表明商品类型** | 商品类型作为第一视觉层级（当前 96px 大标题「コレクションケース」） | 缩略图尺寸下也要能判断"这是什么" |
| **必须有尺寸** | 底部一行 **高さ / 幅 / 奥行** | 家具类购前第一疑问是"放不放得下"；比形容词有效 |
| **3 个核心卖点** | 左侧纵排、**52px**、带项目符号 | 比原先底部胶囊标签（34px）可读性高，且填满左侧留白 |
| **禁止促销/优惠信息** | 送料無料、ポイント、クーポン、セール、割引、価格、円 等一律不出现 | 主图是商品资产不是促销素材；活动变化会让图过期；并占用 20% 配额 |
| **卖点必须是产品属性** | 4段 / 全面ガラス / 棚板高さ調整 | 可长期成立、无需随活动更新 |
| **不写完整商品名** | 只写类型 + 一句利益点 | 完整标题交给 Mercari 标题字段，避免主图文字膨胀 |

**强制实现：** 渲染器内置 `assert_no_offer_text()`，任何标题/副标题/标签/尺寸文案命中促销词即抛错、不出图。这条是代码约束，不是操作纪律。

### 2.2 版式与量化指标

| 指标 | 目标 | 当前 |
|---|---|---|
| 产品占画面 | 65–75% | **66%** |
| 文字占比 | ≤ 20%（Rakuten 上限） | **9.5%** |
| 画布 | 1:1 正方形 | 1500×1500 / 1000×1000 |
| 背景 | #FFFFFF 纯白 | 是 |
| 边框 | 无 | 无 |

当前推荐版式（C4）：

```
┌──────────────────────────────┐
│ コレクションケース        (96px) │
│ フィギュアも食器も、美しく飾れる。│
│                              │
│ ▪ 4段            [商品图]      │
│ ▪ 全面ガラス      66%         │
│ ▪ 棚板高さ調整                 │
│                              │
│  高さ 164cm ｜ 幅 80.5cm ｜ 奥行 36.5cm │
└──────────────────────────────┘
```

### 2.3 底图选择

- 优先：**白底 3/4 视角、带陈列**的供应商图（有纵深、能看出用途）。
- 避免：白底正面空柜（白色玻璃柜 + 白底会丢失轮廓）。
- 合成：供应商白底与纯白画布做正片叠底，**不抠图**、无硬边矩形。

---

## 3. Cloudflare R2 — storage and public URL generation

### 3.1 现状（VERIFIED from code）

| 项 | 实际值 | 来源 |
|---|---|---|
| Bucket | `resize-product-images`（runner 默认写法 `Resize Product Images`，脚本内 normalize） | `Techstack/scripts/Mercari/mercari_csv_listing/prepare_oversize_images_for_mercari.py` |
| 上传方式 | `wrangler r2 object put {bucket}/{key} --file <tmp> --remote` | 同上 `upload_via_wrangler()` |
| Object key | `{item_code}/{item_code}_{slot:02d}.jpg`，可加 `--r2-prefix` | 同上，L457 |
| 公开 URL | `{R2_PUBLIC_BASE_URL}/{urlquote(key)}` | 同上 `build_public_url()` |
| 当前公开域名 | `https://pub-606bcd6c031442e4959f73b5435fefd1.r2.dev` | `Techstack/scripts/n8n_runner_api/README.md` |
| 配置注入 | runner API 环境变量 `R2_PUBLIC_BASE_URL`，缺失即 400 | `Techstack/tools/n8n/runner-api/app.py` |
| 防误配 | 拒绝把 `*.r2.cloudflarestorage.com`（S3 API 端点）当作公开 base | `validate_public_base_url()` |

现有用途：把 **>10MB 的超大供应商图**压到 1500px 长边、转 progressive JPEG、传 R2，再把 Baserow `912520` 的图片字段改写为 R2 URL，供 Mercari CSV 直接引用（Mercari 接受可直接访问的图片 URL）。

### 3.2 用于生成的主图（建议实现）

主图渲染器当前**不做上传**（离线、确定性、无网络调用），上传应是独立步骤：

```
render → validate（文字占比 / 促销词 / 尺寸）→ upload R2 → 记录 manifest → CSV
```

建议 key 规范（与现有 `{item_code}/...` 兼容，但加入版本与内容哈希）：

```
main-image/{item_code}/{item_code}_{variant}_{sha256[:8]}.jpg
# 例：main-image/n515s537400w/n515s537400w_c4_9f3a1c2d.jpg
```

理由：

- **内容哈希**：R2/自定义域会缓存对象；同名覆盖会拿到旧图，带哈希相当于 immutable，避免缓存穿透。
- **variant**：同一 SKU 可能有多版（C4/C3），便于 A/B 与回滚。
- **item_code 前缀**：与现有超图重传的 key 结构一致，便于按 SKU 批量清理。

manifest 每行至少记录：`item_code`、`variant`、`r2_key`、`public_url`、`bytes`、`sha256`、`renderer_version`、`created_at`。manifest 是下游 CSV 的唯一输入，不靠文件名反推。

### 3.3 关键限制与风险

1. **`r2.dev` 不是生产域名。** Cloudflare 官方明确：`r2.dev` 仅用于非生产、**有限流**；要用缓存、WAF、Bot Management 必须挂**自定义域名**；也不支持 CNAME 到 `r2.dev`。 → 现在这个 `pub-606b...r2.dev` 适合 POC 和内部验证，**不适合作为 Mercari 店铺长期图片源**，量产前应切到自定义域（如 `img.retailpulses.com`）。
2. **R2 ≠ R-Cabinet。** Rakuten 的商品图在 CSV 里是 **R-Cabinet 路径**，说明文内图片也只能用 R-Cabinet；R2 的公网 URL 不能直接填进 Rakuten 商品画像字段。R2 服务的是 **Mercari CSV（外部 URL）** 和内部资产归档。若同一张图要上 Rakuten，仍需单独上传 R-Cabinet。
3. **图片是店铺资产，不是页面资产。** 一旦 CSV 引用 R2 URL，删对象等于商品图挂掉。需要生命周期策略：至少保留"当前上架 SKU 在用的对象"，删除前先查 manifest/listing。
4. **Mercari 侧限制是 8MB/张、≤20 张**（见 [Giga Image Selection Policy](https://github.com/retailpulses/.github/blob/main/business/mercari/images/giga-image-selection-policy.md)）。1000×1000 JPG 约 88KB，远低于上限。

### 3.4 建议的生产配置（待决策）

| 决策 | 建议 |
|---|---|
| 公开域名 | 自定义域 `img.retailpulses.com` 绑 R2，启用 Cache Everything + 长 TTL（内容哈希已保证不被覆盖） |
| 上传图规格 | 1000×1000 JPG q90（Mercari CSV 用）；1500 PNG 仅作归档，不必公开 |
| key 前缀 | `main-image/`，与 `resize-product-images` 现有超图路径区分 |
| 上传触发 | 独立 CLI/runner job，幂等：同 hash 已存在则跳过 |
| 回滚 | manifest 保留历史 hash，CSV 重发旧 key 即可 |
| 保留期 | 在架 SKU 永久；下架后 90 天 |

---

## 4. Operating procedure (target state)

1. 选底图（白底 3/4、无供应商文字）。
2. 配置产品级参数（类型、卖点、尺寸、徽章）。
3. 渲染 + 校验：`text_ratio ≤ 0.20`、无促销词、1000/1500 尺寸正确。
4. 上传 R2（key 含内容哈希），写 manifest。
5. Mercari CSV 的 `商品画像名` 使用 manifest 里的 public URL。
6. 上传后回读验证 URL 可访问、字节数匹配。

---

## 5. Evidence

| Claim | Source | Status |
|---|---|---|
| 20% 文字 / 无边框 / 白底或照片背景 / 禁动态 GIF；适用第1图与 SKU 图 | [RMS Service Square「商品画像登録ガイドライン」徹底対応](https://service.rms.rakuten.co.jp/column/detail/26)（官方，2025-12-26 更新） | VERIFIED |
| 700×700 以上推奨、正方形 | 同上 | VERIFIED |
| 20–31% = △、>31% = ×；违规 5 点 | 第三方整理（e-hub、sobani 等） | PARTIAL — 需 RMS 判定工具复核 |
| 2MB / 3840×3840 / 20 张 / JPG-GIF | 第三方整理 | PARTIAL — 属 RMS 上传规格，需登录复核 |
| R2 bucket / key / wrangler 上传 / 公开 URL 生成 | 代码库 `Techstack`（见 §3.1 路径） | VERIFIED |
| `r2.dev` 仅非生产、有限流、需自定义域才有缓存/WAF | [Cloudflare R2 Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)（2026-11-12 更新） | VERIFIED |
| Mercari 8MB/张、≤20 张、CSV 可用外部 URL | [Giga Image Selection Policy](https://github.com/retailpulses/.github/blob/main/business/mercari/images/giga-image-selection-policy.md) + Mercari 官方帮助 | VERIFIED |

---

## 6. Open decisions

1. **生产图片域名**：切 `img.retailpulses.com`（需 Cloudflare zone + R2 custom domain）还是继续用 `r2.dev` 跑 POC？
2. **是否保留 1500 PNG 归档**：只公开 1000 JPG 可省存储，但失去高分辨率源。
3. **哪些图进 R-Cabinet**：如果同一主图未来要上 Rakuten，是否现在就把 R2 对象同步一份到 R-Cabinet？
4. **违规点数复核**：量产前用 RMS「画像判定」工具实测 3–5 张，确认 20% 计算口径与我们 `text_ratio` 一致。
5. **POC 代码归属**：`rakuten-style-poc/` 迁入 `store-ops` 还是 `rakutenops`（见 POC README）。
