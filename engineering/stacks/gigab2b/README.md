# 栈记录：gigab2b — GigaB2B Open API 2.0 访问

> 索引：[Engineering Stack Registry](../README.md) ／ 设计：[design.md](design.md) ／ 实现：[plugin/](plugin/) ／ 插件用法：[plugin/README.md](plugin/README.md)

## 概览

| 项 | 值 |
|---|---|
| 状态 | Pilot（2026-11-20 本机实测通过） |
| 形态 | DeepSeek Harness Host 插件，向 Agent 暴露 8 个工具 |
| 目标实例 | GigaB2B Open API 2.0；生产网关 `https://openapi.gigab2b.com`，沙箱 `https://openapi-sandbox.gigab2b.com` |
| 入口 | `giga_status`、`giga_inventory`、`giga_price`、`giga_products`、`giga_product_detail`、`giga_order_status`、`giga_tracking`、`giga_dropship_sync` |
| 运行前提 | GigaB2B **Open API 2.0** Client ID / Client Secret；出网至 `openapi.gigab2b.com` |
| 是否生产 | 读取面向生产目录、价格与订单；订单写入默认关闭，需显式开启并逐次确认 |
| 替代关系 | 不替代 CatalogSync 的同步管线；为 Agent 提供同一契约下的即时查询能力 |

本栈只实现 **Open API 2.0**。Open API 1.0（`api.gigacloudlogistics.com`、OAuth/Bearer）已退役，插件拒绝该 host，也不做静默回退。所有新接入必须使用 2.0，参见 [REF-GIGA-OPENAPI-2](../../../references/giga/open-api-2.0.md)。

## 为什么必须用 2.0

CatalogSync 的生产历史显示，1.0 端点已返回：

```text
401 — GIGA Open API 1.0 has been discontinued. Please use GIGA Open API 2.0
```

2.0 与 1.0 的差异不是版本号，而是整组契约：

| 维度 | Open API 1.0（退役） | Open API 2.0（本栈） |
|---|---|---|
| Host | `api.gigacloudlogistics.com` | `openapi.gigab2b.com` |
| 认证 | OAuth token + `Authorization: Bearer` | `client-id` / `timestamp` / `nonce` / `sign` |
| 签名 | 无 | HMAC-SHA256，签 **API path**，hex 后 Base64 |
| 端点族 | `/api-b2b-v1/...` | `/b2b-overseas-api/v1/buyer/...` |
| 批上限 | 历史实现不一 | 库存/价格/详情 ≤200 SKU；订单 ≤100 单号 |
| 时间窗 | — | `queryTimeType` + `startTime` / `endTime`，或 `lastUpdatedAfter` |

## 能力总览

| 工具 | 端点 | 读/写 | 作用 | 关键约束 |
|---|---|---|---|---|
| `giga_status` | — | 只读 | 展示 host、凭据来源、写入开关、端点与限流；可发一次探测请求 | 不返回 secret |
| `giga_inventory` | `inventory/quantity/v2` | 只读 | 可售、促销、buyer/margin/future 库存与到货区间 | ≤200 SKU；10 req/10s |
| `giga_price` | `product/price/v1` | 只读 | 价格、专属价、促销价、促销期、限购、运费、卖家指标 | ≤200 SKU；10 req/10s |
| `giga_products` | `product/skus/v1` | 只读 | 分页拉取商品目录 | 必须带时间过滤；`pageSize` 100–1000；10 req/10s |
| `giga_product_detail` | `product/detailInfo/v1` | 只读 | 尺寸、重量、材质、颜色、描述、图片 | ≤200 SKU 或名称；20 req/10s |
| `giga_order_status` | `order/status/v1` | 只读 | 查询订单状态 | ≤100 单号；20 req/10s |
| `giga_tracking` | `order/track-no/v1` | 只读 | 查询物流/追踪号 | ≤100 单号；20 req/10s |
| `giga_dropship_sync` | `order/dropShip-sync/v1` | **写** | 创建/同步代发订单 | 默认禁用；`allowWrites: true` + `confirm: true`；不重试 |

## 工具参考

工具由 Agent 在会话中调用；下面给出参数与返回示例（已脱敏，数值为 2026-11-20 实测快照）。

### 1. `giga_status`

诊断入口。不传参数时只读本地配置，不发网络请求。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `probe` | boolean | 否 | `true` 时发一次只读签名请求验证认证 |
| `sku` | string | 否 | 配合 `probe`，用库存端点探测指定 SKU；缺省则用商品列表探测 |

返回要点：

```json
{
  "configured": true,
  "base_url": "https://openapi.gigab2b.com",
  "environment": "production",
  "write_enabled": false,
  "credentials": {
    "client_id_source": "file",
    "client_secret_source": "file",
    "credentials_file": ".../gigab2b/credentials/giga.json",
    "credentials_file_exists": true
  },
  "probe": { "ok": true, "endpoint": "inventory/quantity/v2", "sku": "N515P546649B", "code": "200" }
}
```

凭据缺失时返回 `configured: false` 和 `setup.steps`，不中断对话。

### 2. `giga_inventory`

| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `skus` | string[] | 是 | 1–200 个 SKU；自动去重、去空白 |
| `includeRaw` | boolean | 否 | 附带原始信封，默认 `false` |

```json
{
  "skus": ["N515P546649B", "DOES-NOT-EXIST-999"]
}
```

返回（节选）：

```json
{
  "api": "inventory/quantity/v2",
  "requested": 2,
  "count": 2,
  "records": [
    {
      "sku": "N515P546649B", "found": true,
      "qty_available": 99, "promo_qty": 50,
      "buyer_available": 0, "margin_qty": 0, "future_qty": 0,
      "currency": "JPY",
      "next_arrival_qty": 0, "next_arrival_begin": null
    },
    { "sku": "DOES-NOT-EXIST-999", "found": false, "qty_available": null }
  ]
}
```

`found` 表示**该 SKU 有可用数据**。供应商对未知 SKU 可能回显全空占位行，这种情况记 `found: false`；请求了但未返回的 SKU 也会补 `found: false`。

### 3. `giga_price`

| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `skus` | string[] | 是 | 1–200 个 SKU |
| `includeRaw` | boolean | 否 | 附带原始信封，默认 `false` |

返回（节选）：

```json
{
  "api": "product/price/v1",
  "records": [{
    "sku": "N515P546649B", "found": true, "currency": "JPY",
    "unit_price": 20000, "price": 20000,
    "exclusive_price": null, "discounted_price": 13000,
    "promotion_from": "2026-11-16 20:00:00",
    "promotion_to": "2026-12-17 05:59:59",
    "purchase_limit": 50,
    "shipping_fee": 1705,
    "sku_available": true,
    "seller": { "store": "WQ", "code": "N515", "return_approval_rate": "High" }
  }],
  "price_note": "unit_price is the supplier-observed price ?? exclusivePrice fallback, not a settled Standard Price definition."
}
```

`unit_price = price ?? exclusivePrice` 是**回退表达式**，不得当作稳定的 Standard Price 定义。

### 4. `giga_products`

商品列表强制要求时间过滤，两种模式互斥。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `page` | integer | 否 | 从 1 开始，默认 1 |
| `pageSize` | integer | 否 | 100–1000，默认 100；供应商拒绝更小值 |
| `limit` | integer | 否 | 1–1000，仅裁剪返回记录，不改变供应商分页 |
| `sort` | integer | 否 | 供应商排序键，默认 4（CatalogSync 使用值） |
| `queryTimeType` | integer | 否 | 时间窗模式，默认 2；仅用于窗口模式 |
| `startTime` | string | 窗口模式必填 | `YYYY-MM-DD HH:mm:ss` 或 ISO-8601 |
| `endTime` | string | 窗口模式必填 | 同上 |
| `lastUpdatedAfter` | string | 增量模式必填 | 只返回此后更新的商品 |

```json
{
  "startTime": "2026-11-10 00:00:00",
  "endTime": "2026-11-12 23:59:59",
  "pageSize": 100,
  "limit": 3
}
```

返回：

```json
{
  "page_info": { "page": 1, "totalPage": 2, "pageSize": 100, "totalNum": 165 },
  "count": 100,
  "returned": 3,
  "truncated": true,
  "records": [
    {
      "sku": "N515P546649B",
      "product_name": "コレクションケース …",
      "update_time": "2026-11-11 01:58:11",
      "first_arrival_date": "2026-11-13",
      "added_time": "2026-11-11 16:34:36"
    }
  ]
}
```

空窗口返回 `page_info: null`、`records: []`、`empty: true` —— 这是供应商行为，不是解析失败。

### 5. `giga_product_detail`

| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `skus` | string[] | 二选一 | 1–200 个 SKU |
| `productNames` | string[] | 二选一 | 1–200 个商品名；与 `skus` 互斥 |
| `includeContent` | boolean | 否 | 返回 `description`、`characteristics`、`image_urls`，默认 `false` |
| `includeRaw` | boolean | 否 | 附带原始信封，默认 `false` |

默认返回紧凑字段（尺寸、重量、材质、颜色），避免 200 条长描述淹没上下文：

```json
{
  "records": [{
    "sku": "N515P546649B",
    "mpn": "N515P546649B",
    "product_name": "コレクションケース …",
    "weight_kg": 36.1, "length_cm": 94, "width_cm": 56, "height_cm": 18,
    "main_material": "Metal & Wood", "main_color": "Black"
  }]
}
```

### 6. `giga_order_status` / `giga_tracking`

| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `orderNo` | string[] | 是 | 1–100 个 GigaB2B 订单号 |

成功响应形状尚未采集，两个工具都按供应商 `data` 原样返回。业务错误会以工具错误形式呈现：

```text
GigaB2B Order status rejected the request — HTTP 200 code=B10004 There is no such orderNo on b2b platform requestId=…
GigaB2B Order tracking rejected the request — HTTP 200 code=B40004 orderNo cannot be found on GIGAB2B. requestId=…
```

### 7. `giga_dropship_sync`

| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `order` | object | 是 | 供应商 schema 的订单对象，原样提交 |
| `confirm` | boolean | 是 | 必须为 `true`，表示确认这是有意的写操作 |

三重保护：

1. 插件配置 `allowWrites: true`（默认 `false`）；
2. 每次调用显式 `confirm: true`；
3. 超时/5xx/传输失败**不重试**，并在错误上标记 `outcomeUncertain`。

不要用它做连通性测试；其官方请求 schema 与幂等语义仍未验证。

## 字段映射

### 库存

| 供应商字段 | 输出字段 | 说明 |
|---|---|---|
| `sellerInventoryInfo.sellerAvailableInventory` | `qty_available` | 卖家可售 |
| `sellerInventoryInfo.discountAvailableInventory` | `promo_qty` | 促销可用 |
| `buyerInventoryInfo.totalBuyerAvailableInventory` | `buyer_available` | buyer 可售 |
| `buyerInventoryInfo.totalMarginInventory` | `margin_qty` | margin 库存 |
| `buyerInventoryInfo.totalFutureInventory` | `future_qty` | 未来/在途 |
| `buyerInventoryInfo.totalSharedInventory` | `shared_qty` | 共享库存 |
| `buyerInventoryInfo.totalSystemLockedInventory` | `system_locked_qty` | 系统锁定 |
| `buyerInventoryInfo.totalBuyerLockedInventory` | `buyer_locked_qty` | buyer 锁定 |
| `buyerInventoryInfo.currency` | `currency` | 币种 |
| `nextArrivalInventory.nextArrivalQtyMin/Max` | `next_arrival_qty_min/max` | 到货数量区间 |
| `nextArrivalInventory.nextArrivalBegin/End` | `next_arrival_begin/end` | 到货日期区间 |

### 价格

| 供应商字段 | 输出字段 | 说明 |
|---|---|---|
| `price` | `price` | 标准报价 |
| `exclusivePrice` | `exclusive_price` | 专属价 |
| `discountedPrice` | `discounted_price` | 促销价 |
| `unit_price`（派生） | `unit_price` | `price ?? exclusivePrice`，仅回退 |
| `promotionFrom` / `promotionTo` | `promotion_from` / `promotion_to` | 保留供应商原始字符串 |
| `purchaseLimit` | `purchase_limit` | 限购 |
| `shippingFee` / `remoteShippingFee` | `shipping_fee` / `remote_shipping_fee` | 运费 |
| `shippingFeeRange` | `shipping_fee_range` | 运费区间 |
| `skuAvailable` | `sku_available` | 可售标记 |
| `sellerInfo.*` | `seller.*` | 店铺、类型、gigaIndex、退货/响应指标 |

## 组成与数据流

```text
Agent
  └─ DSH Host 插件（inject: tools，plugin/index.js）
       ├─ 凭据解析：config → GIGA_CLIENT_ID/GIGA_CLIENT_SECRET → credentials/giga.json（0600）
       ├─ 签名：HMAC-SHA256(client-id&secret&nonce, client-id&path&timestamp&nonce)
       │         → lowercase hex → Base64 → sign header
       ├─ 限流：按端点滑动窗口（10 或 20 req/10s）
       ├─ 重试：读请求 429/5xx/传输失败最多 maxRetries 次；写请求 0 次
       └─ POST https://openapi.gigab2b.com
            ├─ /b2b-overseas-api/v1/buyer/inventory/quantity/v2   （数组）
            ├─ /b2b-overseas-api/v1/buyer/product/price/v1        （数组）
            ├─ /b2b-overseas-api/v1/buyer/product/skus/v1         （{pageInfo, records}）
            ├─ /b2b-overseas-api/v1/buyer/product/detailInfo/v1   （数组）
            ├─ /b2b-overseas-api/v1/buyer/order/status/v1         （原样透传）
            ├─ /b2b-overseas-api/v1/buyer/order/track-no/v1       （原样透传）
            └─ /b2b-overseas-api/v1/buyer/order/dropShip-sync/v1  （默认关闭）
```

签名对象是 **API path**，不是完整 URL。供应商参考实现先输出小写 hex，再对 hex 文本做 Base64；直接使用 hex 会导致验签失败。固定测试向量见 [`plugin/test/run.mjs`](plugin/test/run.mjs)。

## 安装

### 1. 前置条件

- Node.js 运行环境（DSH 自带即可）；
- GigaB2B **Open API 2.0** Client ID / Client Secret；
- 出网至 `https://openapi.gigab2b.com`。

### 2. 安装插件

插件既可直接使用本仓库的 vendored 副本，也可复制到 workspace 后安装。以 vendored 副本为例（把 `/path/to/.github` 换成实际 checkout）：

```text
plugin_manager install_bundle
  target=link:/path/to/.github/engineering/stacks/gigab2b/plugin
```

等价手工步骤：在 `~/.dsh/profiles/<profile>/package.json` 增加

```json
{
  "dependencies": {
    "@local/dsh-gigab2b": "link:/path/to/.github/engineering/stacks/gigab2b/plugin"
  },
  "dsh": { "profile": { "bundles": ["@local/dsh-gigab2b"] } }
}
```

然后在该 profile 目录执行 `pnpm install`，重启/重载 DSH。当前 Mac mini pilot 的 workspace 路径为 `/Users/agent/Documents/deepseek-harness/default-workspace/gigab2b`，仅作为参考，不是共享路径。

### 3. 写入凭据

```bash
cd <插件目录>        # 例如 /path/to/.github/engineering/stacks/gigab2b/plugin
node scripts/giga-auth.mjs
```

交互式输入 Client ID（可见）与 Client Secret（隐藏），写入 `credentials/giga.json`（`0600`），随后自动做一次只读商品列表验证。

其他方式：

```bash
node scripts/giga-auth.mjs --from-env     # 读取 GIGA_CLIENT_ID / GIGA_CLIENT_SECRET
node scripts/giga-auth.mjs --show         # 脱敏查看当前状态，不发请求
node scripts/giga-auth.mjs --no-verify    # 只保存
```

优先级：插件 config → 环境变量 → `credentials/giga.json`。

### 4. 验证

```text
giga_status { "probe": true, "sku": "N515P546649B" }
```

期望 `configured: true`、`write_enabled: false`、`probe.ok: true`。

## 配置

`plugin/cordis.patch.yml` 的默认配置：

```yaml
- insert:
    - id: gigab2b
      name: '@local/dsh-gigab2b'
      config:
        environment: production
        allowWrites: false
        maxRetries: 2
        timeoutMs: 30000
```

| 键 | 默认 | 说明 |
|---|---|---|
| `environment` | `production` | `production` 或 `sandbox`；设置 `baseUrl` 时忽略 |
| `baseUrl` | — | 显式 host，只允许生产/沙箱两个地址 |
| `clientId` / `clientSecret` | — | 内联凭据；建议改用环境变量或凭据文件 |
| `credentialsFile` | `./credentials/giga.json` | 凭据文件路径 |
| `timeoutMs` | `30000` | 单请求超时，最大 120000 |
| `maxRetries` | `2` | 读请求重试次数（0–4）；写请求从不重试 |
| `allowWrites` | `false` | 开启写工具；仍需每次 `confirm: true` |

## 错误与排障

| 现象 | 原因 | 处理 |
|---|---|---|
| `credentials are missing` | 三个来源都没有凭据 | 运行 `node scripts/giga-auth.mjs` 或设置环境变量 |
| HTTP 401 / 验签失败 | 用了 1.0 凭据或错误 host | 换用 Open API 2.0 凭据；确认 host 为 `openapi.gigab2b.com` |
| `B20002 The pageSize format is incorrect` | `pageSize` < 100 | 使用 100–1000 |
| `B10004 There is no such orderNo` | 订单号不存在 | 核对订单号；不是认证问题 |
| `B40004 orderNo cannot be found` | 物流查询无此订单 | 同上 |
| `B50004 SKU unavailable on GIGAB2B` | 单 SKU 请求未知 SKU | 核对 SKU；混合批次可用占位行 + `found: false` 观察 |
| `outcomeUncertain: true` | 传输中断/超时，供应商可能已处理 | 写操作先查询订单状态，不要盲目重试 |
| 429 / 5xx | 限流或供应商故障 | 读请求自动退避重试；持续失败时降低批量 |

客户端限流不等于供应商授权：不要用并发绕过限流。

## 安全与数据边界

- **默认只读**：`allowWrites: false`，写工具直接拒绝。
- **写操作双重门禁**：`allowWrites: true` 且每次 `confirm: true`；失败不重试。
- **批量上限**：200 SKU / 100 订单号；列表 `pageSize` 100–1000。
- **host 白名单**：仅生产/沙箱两个 host；拒绝退役的 1.0 host。
- **凭据不外泄**：文件 `0600`、git 忽略；工具只报告来源与路径，不打印值。
- **原始响应按需**：`includeRaw` / `includeContent` 默认关闭，降低误用与大响应风险。
- **不越权定义业务语义**：`unit_price` 明确标注为回退表达式；订单成功形状未验证时原样透传。

## 验证记录

2026-11-20 在本机 DSH desktop profile 验证：

| 项 | 结果 |
|---|---|
| 安装 | `plugin_manager install_bundle` 以 `link:` 安装成功，8 个工具注册并可在会话内调用 |
| 认证 | `giga_status` probe 通过（库存与商品列表两种探测） |
| 库存 | SKU `N515P546649B`：可售 99、促销 50、buyer 0、margin 0、JPY，`success: true` |
| 价格 | 同 SKU：`price=20000`、`discountedPrice=13000`、`purchaseLimit=50`、`shippingFee=1705`、JPY |
| 详情 | 同 SKU：36.1 kg、94×56×18 cm、Metal & Wood / Black |
| 列表 | 2026-11-10…12：`totalNum=165`、`totalPage=2`；`pageSize` 100/200/500/1000 可用，10/20/50 被 `B20002` 拒绝 |
| 订单 | 不存在的单号返回 `B10004` / `B40004`；未创建或修改订单 |
| 凭据 | `credentials/giga.json` 权限实测 `0600` |
| 测试 | `node test/run.mjs` 25/25 通过（签名向量、host 防护、批量上限、规范化、限流、工具注册、写入门禁） |

未执行任何订单写入。

## 限制与未验证

- 订单状态/物流的**成功**响应形状未采集，两个工具原样返回 `data`。
- `dropShip-sync` 的官方请求 schema、幂等键与超时语义未验证，写入保持关闭。
- `pageSize ≥ 100` 是实测约束，供应商文档未给出该下限。
- 时间过滤按供应商平台墙钟（UTC+8）解释；ISO 输入会转换为固定 +08:00，不做时区猜测。
- 限流值来自供应商文档与 CatalogSync 参考实现，未做压力验证。
- 未验证多账号/多环境凭据隔离；当前按单套生产凭据设计。

## 开发与测试

```bash
cd engineering/stacks/gigab2b/plugin
node test/run.mjs
```

测试不访问网络。新增端点或字段时：

1. 先在 `plugin/index.js` 的 `ENDPOINTS` 增加路径与限流；
2. 用 `includeRaw` 采集一次真实响应，脱敏后写入测试 fixture；
3. 只规范化下游需要的字段，原始响应默认不暴露；
4. 若涉及写入，默认关闭并补一条“未确认即拒绝”的测试。

## 相关

- [GigaB2B Open API 2.0 参考](../../../references/giga/open-api-2.0.md)
- [GigaB2B Access Code & Runtime Inventory](../../../references/giga/capability-inventory.md)
- [CatalogSync Open API 2.0 Quick Reference](https://github.com/retailpulses/CatalogSync/blob/main/docs/Gigab2b%20API%20guide/GIGA_OPEN_API_2_0_QUICK_REFERENCE.md)
- [CatalogSync signer](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/lib/giga-openapi-v2.mjs)
- [CatalogSync client adapter](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/lib/giga-client.mjs)
