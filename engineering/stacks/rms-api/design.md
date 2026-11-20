# 基础设计：rms-api

> 索引：[Engineering Stack Registry](../README.md) ／ 栈记录：[README.md](README.md) ／ 实现：[plugin/](plugin/)

状态：Pilot（2026-11-20）  
范围：DeepSeek Harness 的 Rakuten RMS WEB SERVICE 访问插件。读取为主，写入显式关闭；Item API 写入受 app 权限限制。

## 1. 目标

1. 让 Agent 在会话中直接查询 RMS 的订单、商品和库存，不必临时拼 curl 或依赖浏览器。
2. 用同一套 ESA 认证、限流、错误分类和批上限覆盖所有端点，避免各工具行为漂移。
3. 写能力默认不可用；开启后仍需逐次 `confirm`，且永不自动重试。
4. 明确区分「商品级」与「SKU 级」字段，避免把单一变体的价格设置误当成整商品设置。
5. 对未开通的 API 权限明确失败（401/403），不静默降级、不猜测成功。

## 2. 非目标

- 不替代既有订单同步、库存同步或 CatalogSync 管线。
- 不提供任意 RMS path 的通用代理。
- 不在未验证的情况下声明订单写入、商品写入或库存写入已可用。
- 不存储 Cookie、OAuth token 或顾客个人数据。
- 不把 `rms_item_price` 当成完整的 SALE 设置工具；它只改 standard price，不设置期间或 reference price。

## 3. 架构

```text
Agent tool call
  └─ execute*()                       参数校验、批上限、JST 日期
       └─ rmsRequest()                凭据解析 → 限流 → fetch → JSON → 错误分类
            ├─ resolveSettings()      config → env → credentials/rms.json
            ├─ buildAuthHeader()      ESA base64(serviceSecret:licenseKey)
            ├─ throttle()             按端点族串行，默认 750 ms
            └─ normalize / error      HTTP + MessageModelList + errors[]
```

每个工具只负责参数语义与结果整形；认证、传输、限流、错误分类集中在 `rmsRequest()`。

## 4. 接口契约

### 4.1 Host 与认证

| 项 | 值 |
|---|---|
| Base URL | `https://api.rms.rakuten.co.jp` |
| Host 白名单 | 仅上述 host；拒绝其他 base URL |
| Authorization | `ESA ` + Base64(`serviceSecret:licenseKey`) |
| Content-Type | `application/json; charset=utf-8`（有 body 时） |

凭据顺序：插件 config → `RAKUTEN_SERVICE_SECRET` / `RAKUTEN_LICENSE_KEY` → `credentials/rms.json`。文件 `0600`，目录 `0700`，git 忽略。

### 4.2 端点

| 能力 | Method | Path | 读/写 | 上限 |
|---|---|---|---|---|
| 订单搜索 | POST | `/es/2.0/order/searchOrder/` | 读 | 31 天窗口；1000/页 |
| 订单详情 | POST | `/es/2.0/order/getOrder/` | 读 | 100 单 |
| 订单确认 | POST | `/es/2.0/order/confirmOrder/` | 写 | 100 单 |
| 发货登记 | POST | `/es/2.0/order/updateOrderShipping/` | 写 | 单订单 |
| 取消 | POST | `/es/2.0/order/cancelOrder/` | 写 | 单订单 |
| 取消（发货后） | POST | `/es/2.0/order/cancelOrderAfterShipping/` | 写 | 单订单 |
| 商品搜索 | GET | `/es/2.0/items/search` | 读 | 100/调用 |
| 商品价格 | PATCH | `/es/2.0/items/manage-numbers/{mn}` | 写 | 单变体 |
| 变体列表 | GET | `/es/2.1/inventories/variant-lists/manage-numbers/{mn}` | 读 | 单商品 |
| 库存读取 | POST | `/es/2.1/inventories/bulk-get` | 读 | 100/批 |
| 库存范围 | GET | `/es/2.1/inventories/bulk-get/range` | 读 | 输出 1000 |
| 库存写入 | POST | `/es/2.1/inventories/bulk-upsert` | 写 | 100/批 |

### 4.3 商品与 SKU 模型

```json
{
  "manageNumber": "cabnt-n515p416432",
  "purchasablePeriod": {
    "start": "2026-12-03T20:00:00+09:00",
    "end": "2026-12-11T01:59:59+09:00"
  },
  "variants": {
    "n515p416432w": {
      "standardPrice": "17280",
      "referencePrice": {
        "displayType": "REFERENCE_PRICE",
        "type": 1,
        "value": "28800"
      }
    },
    "n515p416432c": {
      "standardPrice": "28800",
      "referencePrice": { "displayType": "SHOP_SETTING" }
    }
  }
}
```

- `purchasablePeriod` 只在商品根层；变体没有期间字段。
- `standardPrice` 与 `referencePrice` 在变体层；可以只设置一个变体。
- イベント商品申請 以商品管理番号为单位，因此「一个商品、一个打折 SKU」是合法组合。

### 4.4 已验证的权限边界

2026-11-20 实测：

```text
GET  /es/2.0/items/search?offset=0&searchType=1       → 200
GET  /es/2.0/items/manage-numbers/{mn}                → 401 GA0001
PATCH /es/2.0/items/manage-numbers/suitc-pp315895 {}  → 401 GA0001
```

同一套凭据可以读 Item search、Order search、Inventory 2.1。Item detail/write 需要 app 的 Item API 2.0 权限；空 PATCH 没有产生变更。

### 4.5 销售期间 + 二重価格的完整 PATCH 契约

在权限开通后，单商品全量设置应使用：

```http
PATCH /es/2.0/items/manage-numbers/{manageNumber}
Content-Type: application/json

{
  "purchasablePeriod": {
    "start": "2026-12-03T20:00:00+09:00",
    "end": "2026-12-11T01:59:59+09:00"
  },
  "variants": {
    "{variantId}": {
      "standardPrice": "8080",
      "referencePrice": {
        "displayType": "REFERENCE_PRICE",
        "type": 1,
        "value": "10100"
      }
    }
  }
}
```

注意：

- 时间是 ISO-8601，必须 `+09:00`（`+0900` 会被 RMS 拒绝）。
- `referencePrice.type=1` 为「当店通常価格」。
- 只提交需要变更的变体；PATCH 是部分更新语义。
- 权限开通后先做同值 / 空 body 验证，再做单商品 pilot，最后批量。

## 5. 错误模型

| 场景 | 行为 |
|---|---|
| 连接失败 / 超时 | 抛错；读请求可重试，写请求 `retryable: false` |
| 非 JSON | 截断原文，`raw` 包装或报错 |
| HTTP 4xx | 解析 `errors[]` / `MessageModelList`；401/403 不重试 |
| HTTP 200 + `MessageModelList` ERROR | 视为业务错误，不返回成功 |
| 429 / 5xx | 读请求指数退避；写请求不重试 |
| 401 | 提示核对 ESA 凭据与 API 订阅/权限 |

错误文本会脱敏 serviceSecret、licenseKey 及其派生 ESA token。

## 6. 安全模型

- **写双层门禁**：`allowWrites: true` + 每次 `confirm: true`。
- **写不重试**：超时可能已被服务端接受，必须读回确认。
- **Host 锁定**：只允许 `api.rms.rakuten.co.jp`。
- **具名端点**：不支持任意 path；减少凭据被发往非预期端点的风险。
- **批上限与限流**：订单/商品/库存 100，客户端 750 ms。
- **凭据本地化**：`credentials/` 不提交；`rms_status` 不返回值。
- **最小输出**：商品搜索默认不返回长描述；仅必要时 `includeRaw`。

## 7. 关键取舍

| 取舍 | 选择 | 理由 |
|---|---|---|
| 新服务 vs 插件 | DSH Host 插件 | 不引入新 Gateway/SDK；Agent 直接消费 RMS 契约 |
| 通用代理 vs 具名工具 | 具名工具 | 限制攻击面，参数校验与输出规范可控 |
| 商品 detail 401 | 用 search + 精确 `itemNumber` 兜底 | 在无 detail 权限时仍能读商品 |
| 写默认关闭 | `allowWrites: false` | 价格、订单、库存均属生产敏感操作 |
| 期间/价格粒度 | 期间商品级、价格 SKU 级 | 遵循 RMS 字段模型，不虚构变体级期间 |
| 401 处理 | 直接失败并提示权限 | 不猜测、不降级为 UI 静默操作 |

## 8. 验证与后续

已验证：ESA 认证、Item search、Inventory 2.1 读取、Order search、13 项离线测试、凭据文件 0600、Item detail/PATCH 的 401 边界。

后续工作：

1. 开通 Item API 2.0 write 权限后，先做同值 PATCH pilot，再实现 `purchasablePeriod + referencePrice` 的一体化工具。
2. 用安全订单验证 `getOrder`、`confirmOrder`、`updateOrderShipping` 的成功响应。
3. 用测试 SKU 验证 `inventory/bulk-upsert` 的绝对/相对模式。
4. 对 429/5xx 做受控压力验证，确认实际限流边界。
5. 把「期间商品级、二重価格 SKU 级、申請商品级」写进 Agent 操作提示，避免误判。
