# REF-RAKUTEN-CAPABILITY — RMS / R-Messe Access Inventory

Status: CODE DISCOVERED / Runtime UNKNOWN · Reviewed: 2026-10-27 · [Issue #53](https://github.com/retailpulses/.github/issues/53)

本页区分官方 API、RMS UI、SFTP/CSV、历史 POC。仓库 Owner 是代码归属，不等于当前生产执行 Owner。测试未在本次审计运行。

| Capability / channel | Owner repository and evidence | Contract / execution boundary | Verification |
|---|---|---|---|
| Item snapshot, RMS API | [commerce-lab collector](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_item_snapshot.py) | Read-only item collection, /es/2.0/items/search | CODE DISCOVERED; Runtime UNKNOWN |
| Cabinet / images, RMS API | [commerce-lab cabinet tools](https://github.com/retailpulses/commerce-lab/tree/main/services/rakuten/tools/rms) | Capacity, inventory, trashbox | CODE DISCOVERED; permissions UNKNOWN |
| Orders, RMS API / relay | [commerce-ops Orders](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/rakuten-order-pipeline.md) | Confirmation, tracking, close; external writes | CODE/DOC; runtime and write permissions UNKNOWN |
| R-Messe inquiry, API | [commerce-ops Tickets read POC](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/docs/poc/rakuten-rmesse-api-read-poc.md) | Historical read-only POC; send not established | HISTORICAL POC |
| Inventory / price sync | [CatalogSync adapter](https://github.com/retailpulses/CatalogSync/blob/main/lib/catalogsync/rakuten.py) | SKU inventory/price mapping and downstream sync | CODE DISCOVERED; runtime UNKNOWN |
| Coupon API | [RPagentOS coupon POC](https://github.com/retailpulses/RPagentOS/blob/main/poc/rakuten-coupon-api/POC_REPORT.md) | Coupon issue API; must verify write permissions | HISTORICAL POC |
| Promotion/SEO operator work | [store-ops Rakuten](https://github.com/retailpulses/store-ops/tree/main/apps/rakuten) | Promotion archetypes, action queue, UI/session; **not automatically RMS API** | CODE DISCOVERED; runtime UNKNOWN |
| Promotion calendar | [inbox calendar](https://github.com/retailpulses/inbox/blob/main/promotion/calendar/2026/rakuten.md) | Business calendar/reference, not executable API | REFERENCE |
| SFTP / CSV | [commerce-lab SFTP](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/docs/SFTP-RETRIEVAL.md) | File ingestion, not REST API | DOCUMENTED |
| Listing historical integration | [boutique-listing client](https://github.com/retailpulses/boutique-listing/blob/main/src/platforms/rakuten/client.js) | Legacy/POC status requires Owner verification | CODE DISCOVERED |

**Credentials:** [central registry](../../infrastructure/credentials/README.md); RMS ESA `serviceSecret`/`licenseKey` and browser sessions have different lifecycle. No credentials stored. Official version/field and error details: [RMS Reference](rms-api.md). Current deployment SHA, scheduler, credentials permissions, tests and live response remain UNKNOWN.

**Follow-up:** verify 2–3 read-only consumer paths (item snapshot, order status, promotion/coupon metadata), link source→adapter→DB→consumer and capture owner-approved sanitized evidence. No live promotion issuance or order mutation during discovery.
