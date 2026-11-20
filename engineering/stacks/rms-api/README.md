# 栈记录：rms-api — Rakuten RMS WEB SERVICE 访问

> 索引：[Engineering Stack Registry](../README.md) ／ 设计：[design.md](design.md) ／ 实现：[plugin/](plugin/) ／ 插件用法：[plugin/README.md](plugin/README.md)

## 概览

| 项 | 值 |
|---|---|
| 状态 | Pilot（2026-11-20 本机实测；Item API 写入受 app 权限限制） |
| 形态 | DeepSeek Harness Host 插件，向 Agent 暴露 12 个工具 |
| 目标 | 楽天市場 RMS WEB SERVICE（`https://api.rms.rakuten.co.jp`） |
| 店铺 | ホムブリス / shop ID 440058（验证实例） |
| 入口 | `rms_status`、`rms_orders_search`、`rms_order_detail`、`rms_order_confirm`、`rms_order_shipping`、`rms_order_cancel`、`rms_items_search`、`rms_item_detail`、`rms_item_price`、`rms_inventory`、`rms_inventory_range`、`rms_inventory_update` |
| 认证 | ESA：`Authorization: ESA base64(serviceSecret:licenseKey)` |
| 运行前提 | RMS WEB SERVICE 的 serviceSecret / licenseKey；出网至 `api.rms.rakuten.co.jp` |
| 写入 | 默认关闭；`allowWrites: true` + 逐次 `confirm: true` |
| 替代关系 | 不替代订单/库存的既有同步管线；为 Agent 提供同一契约下的即时查询与受控写入 |

本栈解决的是「Agent 如何安全地读写 RMS」：读路径已用真实店铺验证；写路径只完成契约审查和门禁实现，尚未在生产数据上执行。商品 API 的 detail/write 当前返回 401，这是 app 权限边界，不是插件解析问题。

## 为什么需要这个栈

RMS 的 API 不是单一 REST 契约：

- 订单、商品、库存分属不同 API 族和版本；认证统一为 ESA，但权限按 app/API 分别授予。
- 订单搜索是 POST，但语义为只读；商品列表是 GET；库存 2.1 同时有 GET 和 POST bulk 端点。
- 错误可能以 HTTP 4xx 返回，也可能以 `MessageModelList` / `errors[]` 返回。
- 商品价格与二重価格是 **SKU 级**，而 `purchasablePeriod` 是 **商品级**；两者的写入模型不同。
- 店铺 app 可能只开通部分 API：本店可读 Item search、Order search、Inventory 2.1，但 Item detail/PATCH 返回 401。

把这些差异留在一个具名插件里，比让每个 Agent 会话临时拼 curl 更可审计、可限流、可失败关闭。

## 能力总览

| 工具 | 端点 | 读/写 | 关键约束 |
|---|---|---|---|
| `rms_status` | — | 只读 | 凭据来源、写入开关、端点表；`probe: true` 发一次 Item search |
| `rms_orders_search` | `POST /es/2.0/order/searchOrder/` | 只读 | ≤31 天窗口；返回订单号 |
| `rms_order_detail` | `POST /es/2.0/order/getOrder/` | 只读 | 1–100 单；version 默认 7 |
| `rms_order_confirm` | `POST /es/2.0/order/confirmOrder/` | **写** | 1–100 单；`confirm: true` |
| `rms_order_shipping` | `POST /es/2.0/order/updateOrderShipping/` | **写** | 需要 `basketId`；逐行 `shippingId/companyId/number` |
| `rms_order_cancel` | `POST /es/2.0/order/cancelOrder/` | **写** | 可走 after-shipping 端点；reason 0–7 |
| `rms_items_search` | `GET /es/2.0/items/search` | 只读 | 精确 `itemNumber` 已验证；offset/limit |
| `rms_item_detail` | Item search by `itemNumber` + page scan | 只读 | detail GET 401，因此用 search 兜底 |
| `rms_item_price` | `PATCH /es/2.0/items/manage-numbers/{mn}` | **写** | 当前 401；需 Item API 2.0 写权限 |
| `rms_inventory` | variant-lists + `POST /es/2.1/inventories/bulk-get` | 只读 | 单商品全变体，或 ≤100 对 |
| `rms_inventory_range` | `GET /es/2.1/inventories/bulk-get/range` | 只读 | 返回全量匹配，输出上限 1000 |
| `rms_inventory_update` | `POST /es/2.1/inventories/bulk-upsert` | **写** | ≤100 条；`ABSOLUTE` 默认；`confirm: true` |

## 已验证事实（2026-11-20）

| 检查 | 结果 |
|---|---|
| ESA 认证 | `rms_status` probe：HTTP 200，`authenticated: true` |
| Item search | HTTP 200，`numFound: 533` |
| Inventory variant list | HTTP 200，`suitc-pp315895` 12 个变体 |
| Inventory bulk-get | HTTP 200，真实数量 |
| Order search | HTTP 200，RMS INFO 响应（测试窗口 0 单） |
| Item detail GET | HTTP 401 / `GA0001 Un-Authorised` |
| Item PATCH 空 body | HTTP 401 / `GA0001 Un-Authorised`；无变更 |
| Offline tests | 13/13 通过 |

**未验证**：`getOrder` 成功响应、订单确认/发货/取消、库存写入、商品价格写入。没有安全测试对象前，不得把这些写成已验证。

## SKU 级与商品级

这是本期 SALE 操作最容易踩错的边界：

| 对象 | 层级 | 证据 |
|---|---|---|
| `purchasablePeriod` | 商品级 | Item API item 根字段；variant 没有期间字段 |
| `standardPrice` / `referencePrice` | SKU 级 | `variants.{variantId}` |
| イベント商品申請 | 商品级 | 申請 CSV 只填商品管理番号 |
| 单一变体参加 | 允许 | `cabnt-n515p416432` 已受理；仅 `n515p416432w` 为 17,280 / ref 28,800，其他变体原价 |

因此：**一个商品可以只让一个 SKU 打折，但期间设置覆盖整个商品，申請也以商品为单位。**

## 数据与凭据边界

- 凭据：`serviceSecret` / `licenseKey` 仅存于 `plugin/credentials/rms.json`，目录 `0700`、文件 `0600`、git 忽略；也可用 `RAKUTEN_SERVICE_SECRET` / `RAKUTEN_LICENSE_KEY`。
- 不记录：Cookie、OAuth token、商品原始响应中的顾客数据、完整 secret。
- 输出：`rms_status` 只报告来源（config/env/file）与文件路径；错误文本会脱敏 secret 与派生 ESA token。
- 网络：host 锁定 `https://api.rms.rakuten.co.jp`；不接受任意 base URL。
- 限流：客户端 750 ms 间隔；订单/商品/库存批量上限 100–1000 按端点。

## 使用

### 安装

从本仓库路径安装（不要从临时工作副本安装）：

```bash
pnpm --dir <dsh-profile> add link:<repo-root>/engineering/stacks/rms-api/plugin
```

将 `@local/dsh-rms-api` 加入 profile 的 bundles。bundle patch 默认 `allowWrites: false`。

### 配置凭据

```bash
cd engineering/stacks/rms-api/plugin
node scripts/rms-auth.mjs
```

隐藏输入，写入 `credentials/rms.json`（0600）。也可用 `--from-env` 或 `--from-file`。

### 使用

- “查最近 7 天待确认的 RMS 订单”
- “拉这几个订单的完整明细”
- “查 `suitc-pp315895` 的变体和库存”
- “把 RMS 库存改成绝对数量”（需开启写入）

写入前必须同时满足 `allowWrites: true` 与 `confirm: true`。

## 权限边界与开启 Item API 写入

当前 app 能读 Item search，但不能读 Item detail 或 PATCH。要支持「期间 + 二重価格」全 API 化：

1. 在 RMS WEB SERVICE 的 app 权限中开通 **Item API 2.0（商品 API）read/write**。
2. 如启用 IP 限制，把调用方出口 IP 加入允许列表。
3. 先用 no-op / 同值 PATCH 验证，再做单商品 pilot。
4. 写入体使用 item 级 `purchasablePeriod` + variant 级 `standardPrice` / `referencePrice`。

在权限开通前，插件不能通过 API 设置期间或二重価格；只能读，或走 RMS UI / 已登录会话自动化。

## 安全模型

- **双层写门禁**：配置开关 + 每次确认；缺一拒绝。
- **写不重试**：超时可能已被 RMS 接受；先读回再决定。
- **无通用代理**：只暴露具名 `/es/` 端点。
- **批上限**：订单 100、商品 100、库存 100；客户端限流。
- **失败关闭**：未知 host、缺凭据、401/403、校验失败均直接报错，不静默降级。
- **不提交凭据**：`.gitignore` 排除 `credentials/`；仓库内不出现真实 key。

## 排障

| 现象 | 处理 |
|---|---|
| `GA0001 Un-Authorised`（item detail/PATCH） | app 未开通 Item API 2.0 detail/write；不是 key 错误 |
| `GA0001`（所有端点） | 核对 serviceSecret/licenseKey、店铺与 app 绑定 |
| 订单搜索 31 天错误 | 缩小 `start` / `end` |
| 找不到商品 | 用精确 `itemNumber`，或增大 `scanPages` |
| `Writing is disabled` | 设置 `allowWrites: true` 并重启 profile |
| `Pass confirm: true` | 每次写入显式确认 |
| 429 | 等待；读请求会退避重试，写请求不自动重试 |

## 相关文档

- [插件 README](plugin/README.md) — 工具参数、配置、安装、验证记录
- [基础设计](design.md) — 架构、契约、错误模型、关键取舍
- [REF-RAKUTEN-RMS](../../../references/rakuten/rms-api.md) — 跨仓库 Rakuten API 发现入口
- [Engineering Stack Registry](../README.md)
