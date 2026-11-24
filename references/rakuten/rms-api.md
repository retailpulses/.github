# REF-RAKUTEN-RMS — Rakuten RMS API Reference Index

Status: **Partially verified per capability; live read POC 2026-11-20** · Owner: Rakuten Integration · Reviewed: 2026-11-20

这是跨仓库的 Rakuten API 发现入口，**不是已验证的完整官方 API Dictionary**。部分官方 RMS 文档需要登录商家后台；第三方 SDK 不等于官方权威来源。

内部实现入口：[`engineering/stacks/rms-api/`](../../engineering/stacks/rms-api/README.md)。

| Capability | Known API family / evidence | Verification boundary |
|---|---|---|
| Orders / fulfillment | `/es/2.0/order/searchOrder/`, `/es/2.0/order/getOrder/`, `confirmOrder`, `updateOrderShipping`, `cancelOrder`; [commerce-ops order pipeline](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/rakuten-order-pipeline.md), [RMS unknowns](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/rms-api-unknowns.md) | 本店 `searchOrder` 已 live 200（0 单窗口）；`getOrder` 成功响应、确认/发货/取消未验证 |
| Inquiry / R-Messe | `/es/1.0/inquirymng-api/inquiries`, `/es/1.0/inquirymng-api/inquiry/{inquiryNumber}`; [zero-write POC](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/docs/poc/rakuten-rmesse-api-read-poc.md) | 2026-08-23 read POC passed；不证明 write/send |
| Catalog / Items | `GET /es/2.0/items/search`; detail/bulk-get/PATCH；[read-only collector](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_item_snapshot.py), [boutique listing](https://github.com/retailpulses/boutique-listing/blob/main/src/platforms/rakuten/index.js) | Search live 200（533 商品）；detail、bulk-get、PATCH 本店 401 `GA0001`；字段与写权限须按 app 订阅核实 |
| Inventory / Price | `GET /es/2.1/inventories/variant-lists/...`, `POST /es/2.1/inventories/bulk-get`, `POST /es/2.1/inventories/bulk-upsert`; [CatalogSync Rakuten TRD](https://github.com/retailpulses/CatalogSync/blob/main/docs/TRD_rakuten_price_qty_sync_v1.0.0.md) | 读取 live 200（12 变体 + 真实数量）；写未验证；QPS 与 ABSOLUTE 语义以官方/实测为准 |
| Cabinet / Images | [capacity collector](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/read_cabinet_capacity.py), [cabinet inventory](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_cabinet_inventory.py) | 权限、容量、删除/回收站行为须核实 |
| Coupons / Promotions | `/es/1.0/coupon/issue`; [POC report](https://github.com/retailpulses/RPagentOS/blob/main/poc/rakuten-coupon-api/POC_REPORT.md), [README](https://github.com/retailpulses/RPagentOS/blob/main/poc/rakuten-coupon-api/README.md) | POC 不自动授权真实发行；issue/update/patch 限制待官方复核 |

## 商品 / SKU 层级（2026-11-20 实测）

| 对象 | 层级 | 证据 |
|---|---|---|
| `purchasablePeriod` | 商品级 | Item API item 根字段；variant 无期间字段 |
| `standardPrice` / `referencePrice` | SKU 级 | `variants.{variantId}` |
| イベント商品申請 | 商品级 | 申請 CSV 只填商品管理番号 |
| 单一变体参加 | 允许 | `cabnt-n515p416432` 已受理；仅 `n515p416432w` 为 17,280 / ref 28,800，其他变体原价 |

结论：一个商品可以只让一个 SKU 打折；期间覆盖整个商品；申請以商品为单位。

## 通用认证和安全

已见多处使用 RMS ESA 认证：`Authorization: ESA base64(serviceSecret:licenseKey)`。不同 API 的权限、IP 限制、有效性必须逐一验证。2026-11-20 实测：同一套凭据可读 Item search、Order search、Inventory 2.1，但 Item detail 与 PATCH 返回 401；空 PATCH 无变更。不得提交真实 secret/license key、Cookie、授权响应或含顾客信息的 raw payload。

## 待调查

- 在已登录 RMS 后，按 Orders / Items / Cabinet / Inquiry / Coupon 分别建立官方文档版本、字段表和错误码证据；不可仅凭 SDK 推断。
- 对比各消费者实际使用的 API 版本和权限，识别过期 TRD 与历史 POC。
- Item API 2.0 write 权限开通条件、IP allowlist 与 `purchasablePeriod`/`referencePrice` 的完整 patch 语义。
- MacBook 本地文档尚未扫描：Desktop Commander 返回本月使用额度已满，不能声称已完成。

消费者应使用 `REF-RAKUTEN-RMS` 作为统一入口，具体实现/测试保留在原仓库；Agent 即时访问使用 [`rms-api`](../../engineering/stacks/rms-api/README.md) 插件。
