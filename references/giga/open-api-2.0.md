# REF-GIGA-OPENAPI-2 — GigaB2B Open API 2.0

Status: **Required API generation / partially runtime-verified** · Owner: Engineering · Reviewed: 2026-10-24

## Canonical decision

**所有新的 GigaB2B API 接入必须使用 Open API 2.0。Open API 1.0 已退役，不得作为可用 fallback。** 历史 OAuth/Bearer 示例只用于审计和迁移追溯。CatalogSync 记录了旧接口返回 `401 — GIGA Open API 1.0 has been discontinued` 的证据。不同应用是否已全部完成 2.0 部署，需按运行环境分别核实。

## 2.0 契约（来自供应商文档整理，非逐字段 runtime 验证）

- Production: `https://openapi.gigab2b.com`; sandbox: `https://openapi-sandbox.gigab2b.com`。
- Headers: `client-id`, `timestamp`, `nonce`, `sign`, `Content-Type: application/json`。
- Signature: HMAC-SHA256；签名输入使用 **API path** 而不是完整 URL。具体签名算法及有效期以供应商原文和当前测试为准。
- Inventory: `POST /b2b-overseas-api/v1/buyer/inventory/quantity/v2`（最多 200 SKUs；文档速率 10 requests / 10s）。
- Price: `POST /b2b-overseas-api/v1/buyer/product/price/v1`（最多 200 SKUs；文档速率 10 requests / 10s）。
- Product list: `POST /b2b-overseas-api/v1/buyer/product/skus/v1`。
- Product details: `POST /b2b-overseas-api/v1/buyer/product/detailInfo/v1`。
- Order status: `POST /b2b-overseas-api/v1/buyer/order/status/v1`。
- Tracking: `POST /b2b-overseas-api/v1/buyer/order/track-no/v1`。

## 证据与消费者

- [原有 2.0 Reference（混有 CatalogSync 迁移计划）](https://github.com/retailpulses/CatalogSync/blob/main/docs/Gigab2b%20API%20guide/GIGA_OPEN_API_2_0_QUICK_REFERENCE.md)，2026-09-16，基于供应商 PDF。
- [Giga 2.0 client](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/lib/giga-openapi-v2.mjs)、[canary](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/canary-openapi-v2.mjs)。
- [跨仓库 CatalogSync Contract](https://github.com/retailpulses/commerce-lab/blob/main/services/canonical-lab/CATALOGSYNC_CONTRACT.md)。
- [CatalogSync issue #210](https://github.com/retailpulses/CatalogSync/issues/210)：旧接口退役事故与恢复背景。

## 待核实事实

- 各生产消费者是否已完全迁移至 2.0，特别是历史 Worker / cron / relay。
- 当前凭据对 2.0 的授权范围及 read-only canary 成功记录。
- 2.0 response 到内部标准字段的映射；尤其促销价格、库存、remote shipping fees 等新增/变化字段。

**禁止**将旧版 SOP 中的真实凭据、旧 endpoint 或其历史成功样本作为当前有效的 2.0 运行证明。
