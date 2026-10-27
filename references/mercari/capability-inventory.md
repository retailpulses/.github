# REF-MERCARI-CAPABILITY — Mercari Shops Access Inventory

Status: CODE DISCOVERED / Runtime UNKNOWN · Reviewed: 2026-10-27 · [Issue #53](https://github.com/retailpulses/.github/issues/53)

Mercari Shops API、内部 Relay、Browser Automation、CSV 操作是不同技术通道；不能将内部 GraphQL、网页操作或 CSV 上传描述为官方公开 API。各项代码 Owner 保留执行与测试责任。

| Capability / channel | Owner evidence | Contract / risk | Status |
|---|---|---|---|
| Inquiry API / webhook / relay | [commerce-ops Inquiry worker](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/worker/src/mercari/relay.ts), [mappers](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/worker/src/mercari/mappers.ts) | Inquiry message, webhook, local persistence | CODE DISCOVERED; live/runtime UNKNOWN |
| Order lifecycle / API + relay | [commerce-ops Orders](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/src/lib/mercari-relay.mjs), [event contract](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/webhook/mercari-event-contract.md) | Order pull, state, shipping close; write effects | CODE DISCOVERED; runtime UNKNOWN |
| Listing query/update | [commerce-ops scripts](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/scripts/mercari_shop_product_query.mjs), [update](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/scripts/mercari_shop_product_update.mjs) | Product mutation requires approval and idempotency evidence | CODE DISCOVERED |
| Listing publish / image | [CatalogSync relay publisher](https://github.com/retailpulses/CatalogSync/blob/main/relay/mercari-listing-publisher.mjs), [image publisher](https://github.com/retailpulses/CatalogSync/blob/main/relay/mercari-main-image-publisher.mjs) | Legacy vs current NPL publication ownership unresolved | HISTORICAL CODE; runtime UNKNOWN |
| New Products to Listing | [store-ops Mercari](https://github.com/retailpulses/store-ops/tree/main/apps/mercari) | Variant-centric shared copy/image, per-shop publication | PRODUCT CODE; live state requires runtime verification |
| Customer Operations Agent | [store-ops Agent](https://github.com/retailpulses/store-ops/tree/main/apps/mercari/customer-operations-agent) | Inquiry first response vs needs_reply, no assumed write auth | CODE DISCOVERED |
| Time Sale CSV / browser | [store-ops Mercari](https://github.com/retailpulses/store-ops/tree/main/apps/mercari), [CSV uploader](https://github.com/retailpulses/retailpulses-tool-services/blob/main/packages/mercari/upload-csv/upload-mercari-csv/upload_mercari_csv_to_shops.py) | 16-column CSV rule and UI upload are **not** official API | CODE/DOC; current runtime UNKNOWN |
| Internal GraphQL exploration | [inbox findings](https://github.com/retailpulses/inbox/blob/main/knowledge/system-design/mercari-seller-internal-graphql-findings.md) | Reverse-engineered internal behavior is not public contract | HISTORICAL RESEARCH |
| Listing import | [RPagentOS backfill](https://github.com/retailpulses/RPagentOS/blob/main/scripts/backfill_mercari_listings_from_api.py) | Backfill and current sync owner need distinction | CODE DISCOVERED |

**API contract:** [Inquiry Reference](inquiry-api.md). **Credentials:** [central registry](../../infrastructure/credentials/README.md). No token, cookie, PII, raw customer messages or seller session values in Registry.

**Runtime gates:** inspect actual Mac mini / VPS / Worker SHA, job scheduler, Shop1–4 identity, readback and error/retry/duplicate handling. Isolated read-only validation first; publication, inquiry send, order close and CSV upload are external writes and require Owner-approved separate acceptance. Tests NOT RUN here.
