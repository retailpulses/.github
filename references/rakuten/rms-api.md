# REF-RAKUTEN-RMS — Rakuten RMS API Reference Index

Status: **Partially verified per capability** · Owner: Rakuten Integration · Reviewed: 2026-10-24

这是跨仓库的 Rakuten API 发现入口，**不是已验证的完整官方 API Dictionary**。部分官方 RMS 文档需要登录商家后台；第三方 SDK 不等于官方权威来源。

| Capability | Known API family / evidence | Verification boundary |
|---|---|---|
| Orders / fulfillment | [commerce-ops order pipeline](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/rakuten-order-pipeline.md), [RMS unknowns](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/rms-api-unknowns.md) | 当前权限、字段及状态变更须核实 |
| Inquiry / R-Messe | `/es/1.0/inquirymng-api/inquiries`, `/es/1.0/inquirymng-api/inquiry/{inquiryNumber}`; [zero-write POC](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/docs/poc/rakuten-rmesse-api-read-poc.md) | 2026-08-23 read POC passed；不证明 write/send |
| Catalog / Items | `/es/2.0/items/search`; [read-only collector](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_item_snapshot.py), [boutique listing](https://github.com/retailpulses/boutique-listing/blob/main/src/platforms/rakuten/index.js) | 字段及 patch 限制依赖登录官方文档核实 |
| Inventory / Price | [CatalogSync Rakuten TRD](https://github.com/retailpulses/CatalogSync/blob/main/docs/TRD_rakuten_price_qty_sync_v1.0.0.md), [sync script](https://github.com/retailpulses/CatalogSync/blob/main/scripts/rakuten/sync_rakuten_inventory.py) | Runtime 与官方 contract 分开记录 |
| Cabinet / Images | [capacity collector](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/read_cabinet_capacity.py), [cabinet inventory](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_cabinet_inventory.py) | 权限、容量、删除/回收站行为须核实 |
| Coupons / Promotions | `/es/1.0/coupon/issue`; [POC report](https://github.com/retailpulses/RPagentOS/blob/main/poc/rakuten-coupon-api/POC_REPORT.md), [README](https://github.com/retailpulses/RPagentOS/blob/main/poc/rakuten-coupon-api/README.md) | POC 不自动授权真实发行；issue/update/patch 限制待官方复核 |

## 通用认证和安全

已见多处使用 RMS ESA 认证：`Authorization: ESA base64(serviceSecret:licenseKey)`。不同 API 的权限、IP 限制、有效性必须逐一验证。不得提交真实 secret/license key、Cookie、授权响应或含顾客信息的 raw payload。

## 待调查

- 在已登录 RMS 后，按 Orders / Items / Cabinet / Inquiry / Coupon 分别建立官方文档版本、字段表和错误码证据；不可仅凭 SDK 推断。
- 对比各消费者实际使用的 API 版本和权限，识别过期 TRD 与历史 POC。
- MacBook 本地文档尚未扫描：Desktop Commander 返回本月使用额度已满，不能声称已完成。

消费者应使用 `REF-RAKUTEN-RMS` 作为统一入口，具体实现/测试保留在原仓库。
