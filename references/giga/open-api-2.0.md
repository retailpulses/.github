# REF-GIGA-OPENAPI-2 — GigaB2B Open API 2.0

Status: **Required generation / partially verified** · Owner: Engineering · Reviewed: 2026-10-27

## Canonical decision

**所有新 GigaB2B API 接入必须使用 Open API 2.0。Open API 1.0 已退役，不得作为 fallback。** 历史 OAuth/Bearer 示例仅供追溯，不能证明当前生产可用。详见 [retirement issue](https://github.com/retailpulses/gigacatlogsync/issues/24)。

## Contract and endpoints

供应商文档整理来源为 [CatalogSync Open API 2.0 Quick Reference](https://github.com/retailpulses/CatalogSync/blob/main/docs/Gigab2b%20API%20guide/GIGA_OPEN_API_2_0_QUICK_REFERENCE.md)（2026-09-16，基于供应商 PDF）；以下路径是**文档/代码可核对，非本次 live canary 结果**。

- Production host: `https://openapi.gigab2b.com`; sandbox: `https://openapi-sandbox.gigab2b.com`
- Headers: `client-id`, `timestamp`（毫秒）, `nonce`（10 位）, `sign`, `Content-Type: application/json`
- Signature: HMAC-SHA256 with signed **API path** (not whole URL); [implementation](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/lib/giga-openapi-v2.mjs) uses Base64 encoding of lowercase HMAC hex text. Never store Secret here.
- Common envelope per referenced supplier PDF summary: `success`, `code`, `data`, `requestId`, `msg`, `subMsg`, `recommend`; live shape and error meanings remain unverified here.

| Capability | Method and API path | Documented request/rate | Known consumer |
|---|---|---|---|
| Inventory | POST `/b2b-overseas-api/v1/buyer/inventory/quantity/v2` | `skus[]`, max 200; 10 req / 10s | CatalogSync, Canonical Lab |
| Product price | POST `/b2b-overseas-api/v1/buyer/product/price/v1` | `skus[]`, max 200; 10 req / 10s | CatalogSync, Canonical Lab |
| Product list | POST `/b2b-overseas-api/v1/buyer/product/skus/v1` | Pagination `page`, `totalPage`, `pageSize`, `totalNum`; 10 req / 10s | Canonical Lab |
| Product details | POST `/b2b-overseas-api/v1/buyer/product/detailInfo/v1` | `skus[]` or productNames, max 200; 20 req / 10s | Canonical Lab, tool-services |
| Order status | POST `/b2b-overseas-api/v1/buyer/order/status/v1` | `orderNo[]`; 20 req / 10s | Consumer runtime not verified |
| Tracking | POST `/b2b-overseas-api/v1/buyer/order/track-no/v1` | Order references; 20 req / 10s | commerce-ops Orders |
| Dropship sync | POST `/b2b-overseas-api/v1/buyer/order/dropShip-sync/v1` | **Write endpoint; exact request/limits official validation pending** | [commerce-ops client](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/src/lib/giga-client.mjs) |

### Price and inventory response mapping (code observed)

[CatalogSync adapter](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/lib/giga-client.mjs) reads `item.price`, `item.exclusivePrice`, `item.discountedPrice` and promotion time keys for price responses; inventory reads `sellerInventoryInfo.sellerAvailableInventory` and `discountAvailableInventory`. These are **adapter-observed raw-field references**, not a fully validated live supplier schema. `unit_price = item.price ?? item.exclusivePrice` is a fallback expression and must **not** be mistaken for a stable Standard Price definition. DB mapping details live in [REF-GIGA-DATA](data-dictionary-mapping.md).

## Sources, access, and verification

- Supplier documentation: PDF titles `Open API 2.0 Developer Documentation.pdf`, `Product Price Query.pdf`; repository [Quick Reference](https://github.com/retailpulses/CatalogSync/blob/main/docs/Gigab2b%20API%20guide/GIGA_OPEN_API_2_0_QUICK_REFERENCE.md). Original provider URLs, schema/revision date and full error code table are **UNKNOWN**.
- [Open API signer and batch contract](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/lib/giga-openapi-v2.mjs); [isolated test](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/tests/openapi-v2.test.mjs); [read-only canary script](https://github.com/retailpulses/CatalogSync/blob/main/scripts/gigab2b/canary-openapi-v2.mjs). Current execution **NOT RUN** in this review.
- [Access Code & Runtime Inventory](capability-inventory.md); [Data Dictionary & Mapping](data-dictionary-mapping.md); [Credential Registry](../../infrastructure/credentials/README.md); [Issue #53](https://github.com/retailpulses/.github/issues/53).
- **Runtime verification still needed:** per consumer deployment SHA and actual runtime, accepted current credential permissions, sanitized read-only canary, price response fields including null behavior, writer→DB evidence, order write permission without performing write during discovery.
