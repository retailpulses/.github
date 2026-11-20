# 基础设计：gigab2b

> 索引：[Engineering Stack Registry](../README.md) ／ 栈记录：[README.md](README.md) ／ 实现：[plugin/](plugin/)

状态：Pilot（2026-11-20）  
范围：DeepSeek Harness 的 GigaB2B Open API 2.0 访问插件。读取为主，写入显式关闭。

## 1. 目标

1. 让 Agent 在会话中直接查询 GigaB2B 的商品目录、库存、价格、商品详情与订单只读信息，不必临时拼 curl 或启动 CatalogSync。
2. 复用 CatalogSync 已验证的 Open API 2.0 签名与字段解释，保持同一套契约语言。
3. 写能力默认不可用；开启后仍需逐次确认，且永不自动重试。
4. 失败可区分：传输/超时、HTTP 非 2xx、`success=false` 业务错误、字段缺失，而不是统一成 "API failed"。
5. 不引入新的 SDK、Gateway、共享数据库或第二套同步管线。

## 2. 非目标

- 不替代 CatalogSync 的 Supabase 同步、dead-letter 恢复或调度。
- 不支持 Open API 1.0，也不提供 1.0 → 2.0 的自动回退。
- 不提供任意 API path 的通用代理；只暴露已文档化的 7 个端点。
- 不在未验证的情况下定义 `dropShip-sync` 的订单 schema 或幂等策略。
- 不把供应商响应字段直接当作 Standard Price 等业务定义。

## 3. 架构

```
Agent tool call
  └─ execute*()                       参数校验、批上限、时间格式
       └─ postEndpoint()              凭据解析 → 限流 → 签名 → fetch → 信封判定
            ├─ resolveCredentials()   config → env → credentials/giga.json
            ├─ SlidingWindowLimiter   按端点 10/10s 或 20/10s
            ├─ buildHeaders()         client-id / timestamp / nonce / sign
            └─ normalizer             仅保留约定字段；raw 需显式开启
```

每个工具只负责参数语义与结果整形；传输、认证、限流、错误分类集中在 `postEndpoint()`，避免各工具行为漂移。

## 4. 接口契约

### 4.1 Host

| 环境 | Base URL |
|---|---|
| Production | `https://openapi.gigab2b.com` |
| Sandbox | `https://openapi-sandbox.gigab2b.com` |

host 白名单校验；`api.gigacloudlogistics.com` 明确拒绝。路径必须为空，防止把 base URL 当成可拼接任意路径的代理。

### 4.2 请求头与签名

```text
Content-Type: application/json
client-id:   <CLIENT_ID>
timestamp:   <13 位 epoch 毫秒>
nonce:       <10 位随机数>
sign:        Base64( hexLower( HMAC-SHA256(
               key  = CLIENT_ID & "&" & CLIENT_SECRET & "&" & NONCE,
               data = CLIENT_ID & "&" & API_PATH & "&" & TIMESTAMP & "&" & NONCE
             ) ) )
```

签名对象是 **API path**，不是完整 URL。供应商参考实现先输出小写 hex，再对 hex 文本做 Base64；直接返回 hex 不是合法 `sign`。固定的测试向量见 `plugin/test/run.mjs`。

### 4.3 端点与预算

| 能力 | Path | 限流 | 批量 |
|---|---|---|---|
| Inventory | `/b2b-overseas-api/v1/buyer/inventory/quantity/v2` | 10 req/10s | ≤200 SKU |
| Price | `/b2b-overseas-api/v1/buyer/product/price/v1` | 10 req/10s | ≤200 SKU |
| Product list | `/b2b-overseas-api/v1/buyer/product/skus/v1` | 10 req/10s | `pageSize` 100–1000 |
| Product detail | `/b2b-overseas-api/v1/buyer/product/detailInfo/v1` | 20 req/10s | ≤200 SKU 或名称 |
| Order status | `/b2b-overseas-api/v1/buyer/order/status/v1` | 20 req/10s | ≤100 订单号 |
| Tracking | `/b2b-overseas-api/v1/buyer/order/track-no/v1` | 20 req/10s | ≤100 订单号 |
| Dropship sync | `/b2b-overseas-api/v1/buyer/order/dropShip-sync/v1` | 20 req/10s | 单订单；默认禁用 |

`pageSize < 100` 会被供应商以 `B20002` 拒绝，这一下限来自实测而非文档。

### 4.4 信封

成功：`success: true`，`data` 为数组（库存/价格/详情）或 `{ pageInfo, records }`（列表）。  
失败：HTTP 可能仍是 200，但 `success: false`，附 `code`、`msg`、`subMsg`、`requestId`。业务失败不重试。

## 5. 规范化约定

| 供应商字段 | 输出字段 | 说明 |
|---|---|---|
| `sellerInventoryInfo.sellerAvailableInventory` | `qty_available` | 可售库存 |
| `sellerInventoryInfo.discountAvailableInventory` | `promo_qty` | 促销库存 |
| `buyerInventoryInfo.totalBuyerAvailableInventory` | `buyer_available` | buyer 可售 |
| `buyerInventoryInfo.totalMarginInventory` | `margin_qty` | margin 库存 |
| `buyerInventoryInfo.totalFutureInventory` | `future_qty` | 在途/未来 |
| `nextArrivalInventory.*` | `next_arrival_qty/begin/end` | 同时生成展示字段 |
| `price` / `exclusivePrice` / `discountedPrice` | 同名 snake_case | `unit_price = price ?? exclusivePrice`，仅为回退表达式 |
| `promotionFrom` / `promotionTo` | `promotion_from` / `promotion_to` | 保留供应商原始字符串 |
| `sellerInfo.*` | `seller.*` | 店铺、类型、gigaIndex、退货/响应指标 |

- `found` 表示**该 SKU 有可用数据**，不是"供应商返回了记录"。供应商对未知 SKU 可能回显全空占位行，这种情况记 `found: false`。
- 请求了但未返回的 SKU 补 `{ sku, found: false }`，保持请求顺序。
- 详情默认不返回 `description`、`characteristics`、`imageUrls`；`includeContent: true` 才附带，避免 200 条长文本淹没上下文。
- `includeRaw` 仅用于契约核对，不作为常规输出。

## 6. 错误模型

| 场景 | 行为 |
|---|---|
| 连接失败 / 超时 | 抛 `GigaApiError`，`outcomeUncertain: true`；读请求可重试，写请求不重试 |
| 非 JSON 响应 | 抛错并截断前 300 字符；5xx/429 时读请求重试 |
| HTTP 非 2xx | 按状态与信封组装错误；读请求仅对 429/5xx 重试 |
| `success: false` | 业务错误，带 `code` / `msg` / `subMsg` / `requestId`；不重试 |
| 4xx 认证/权限 | 不重试，提示核对 2.0 凭据与 host |

重试采用指数退避（1s、2s、4s），上限由 `maxRetries` 控制（默认 2）。写端点 `attempts = 1`。

## 7. 安全模型

- **凭据优先级**：插件 config → `GIGA_CLIENT_ID` / `GIGA_CLIENT_SECRET` → `credentials/giga.json`。文件目录 `0700`、文件 `0600`、git 忽略。
- **不输出 secret**：`giga_status` 只报告每个字段的来源（config/env/file/missing）与文件路径。
- **写入双层门禁**：`allowWrites: true` + 每次 `confirm: true`；缺一即拒绝。
- **批量与限流**：在客户端先于网络执行，减少 429 与供应商侧压力。
- **host 白名单**：只允许生产/沙箱两个 host，避免凭据被发往任意地址。
- **失败不猜测**：订单成功响应形状未验证，按原样返回，不做字段推断。

## 8. 关键取舍

| 取舍 | 选择 | 理由 |
|---|---|---|
| 新服务 vs 插件 | DSH Host 插件 | 参考结论要求不新建 SDK/Gateway；Agent 直接消费现有契约 |
| 通用代理 vs 具名工具 | 具名工具 | 限制攻击面、参数校验与输出规范可控 |
| 自动重试写入 | 不重试 | 代发订单非幂等，超时可能已被供应商接受 |
| 原始响应 | 默认关闭 | 字段未完全验证，避免下游误用与上下文膨胀 |
| 时间解释 | 固定 UTC+8 | 供应商墙钟；不做时区猜测，ISO 输入显式换算 |
| 列表默认 | `pageSize=100`，可选 `limit` | 供应商下限 100；`limit` 控制会话输出体积 |

## 9. 验证与后续

已验证（2026-11-20）：8 工具注册；库存/价格/详情/列表/状态探测的 live 只读调用；订单错误码；25 项离线测试；凭据文件 `0600`。

后续工作：

1. 用真实订单采集 `order/status/v1` 与 `track-no/v1` 的成功样本，再决定是否规范化。
2. 与供应商确认 `dropShip-sync` 官方 schema、幂等键与超时语义后，才考虑开启写入。
3. 对限流做受控压力验证，确认 10/20 req/10s 的实际边界。
4. 如需商品名搜索，评估是否增加 `productNames` 列表能力，而不是通用代理。
