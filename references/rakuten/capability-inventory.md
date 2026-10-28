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

**External GitHub references:** [RMS MCP and earlier Promotion/SEO OSS candidates](external-github-references.md).\n\n**Credentials:** [central registry](../../infrastructure/credentials/README.md); RMS ESA `serviceSecret`/`licenseKey` and browser sessions have different lifecycle. No credentials stored. Official version/field and error details: [RMS Reference](rms-api.md). Current deployment SHA, scheduler, credentials permissions, tests and live response remain UNKNOWN.

**Follow-up:** verify 2–3 read-only consumer paths (item snapshot, order status, promotion/coupon metadata), link source→adapter→DB→consumer and capture owner-approved sanitized evidence. No live promotion issuance or order mutation during discovery.

## Promotion-first 增量资产（来自 Rakuten 产品 Delta Scan，2026-10-27）

下表补充原 Inventory 未显式列出的可复用资产，**不是新建生产 Shared Service 的提案**。详情与 POC 见 [store-ops Rakuten references](https://github.com/retailpulses/store-ops/blob/docs/rakuten-reference-baseline-191/apps/rakuten/docs/references.md)。

| Capability | Owner / evidence | Actual boundary | Baseline / next gate |
| --- | --- | --- | --- |
| Historical official-promotion discovery | [inbox Rakuten 2026 calendar](https://github.com/retailpulses/inbox/blob/main/promotion/calendar/2026/rakuten.md) | 105 archived Zoho messages: Super SALE 44, お買い物マラソン 39, other 22; **message count ≠ event count** | DOCUMENT REVIEWED; inspect raw message IDs and deduplicate; not future official calendar |
| Versioned calendar-driven Coupon templates | [RPagentOS coupon template review](https://github.com/retailpulses/RPagentOS/blob/main/docs/development/rakuten-calendar-coupon-templates-review.md) | `eventKey`, occurrence, templateVersion, deterministic idempotency; historical proposed CouponAPI lifecycle | DESIGN REFERENCE; live contract/permissions UNVERIFIED |
| Browser-only Coupon Planner | [RPagentOS Promotion Planner MVP](https://github.com/retailpulses/RPagentOS/blob/main/docs/development/promotion-planner-mvp.md) | `/promotions`, localStorage draft, no Supabase writes or marketplace calls per design doc | HISTORICAL DOC; not canonical production persistence |
| Local canonical Action Queue | [store-ops action_queue.py](https://github.com/retailpulses/store-ops/blob/main/apps/rakuten/agent/action_queue.py) | SQLite `canonical_actions` and `canonical_action_events`; due, not_before, human gate, evidence and action keys | CODE REVIEWED; migration, runtime, recovery and current tests UNKNOWN |
| Historical RMS UI & test evidence | [store-ops F0 capability matrix](https://github.com/retailpulses/store-ops/blob/main/docs/poc/CAPABILITY_MATRIX_2026-10-13.md) | RMS UI read-only history; isolated Playwright profile unauthenticated at last documented check; 10 recovery tests historically passed | HISTORICAL; **not** current authenticated runtime proof |
| Zoho read-only message source | [commerce-ops Zoho Mail Client](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/web/worker/src/clients/zoho-mail.ts), [credential registry discussion](https://github.com/retailpulses/.github/issues/52#issuecomment-6435430807) | Search, message body, attachments, OAuth; auth parsing includes **Amazon-specific** domain rule, cannot use unchanged for Rakuten | CODE REVIEWED; read-only scope/credential metadata/runtime UNKNOWN |
| Mock promotion candidate generator | [RPagentOS candidate job](https://github.com/retailpulses/RPagentOS/blob/main/src/jobs/generate-promotion-candidates.ts) | Mercari-default, per-listing 5% `timesale_test` mock | NOT RECOMMENDED for Rakuten event-first, default-all-products Promotion |

**Shared semantic boundaries**：`PromotionArchetype`（内部分类）≠ `OfficialCampaign/Event`（官方身份）≠ `EventOccurrence`（日历窗口）≠ `ShopParticipation`（报名/资格）≠ `ExecutionAction`（操作任务）≠ `ObservedPlatformState`（RMS 回读）。Coupon draft/issued status 与活动报名状态分离；邮件仅为 source evidence，不是 RMS 生效证明。官方活动 ID、邮件 message ID、内部 event key 和 action key 不得互相替代。

**重要缺口**：Campaign signup、ポイント変倍、スーパーSALE 的官方 RMS API / UI 操作契约、写权限与 readback 尚无已验证矩阵；CouponAPI POC 不代表其他促销 API 可用。RMS ItemAPI 2.0 的 CSV Bulk Upload 月费约 ¥10,000 是 **Listing foundation 的独立商业/访问约束（用户提供，费用和 entitlement 待官方核实）**，不能推导 Promotion API 需要同一付费权限。Listing 发布应复用 store-ops New Products to Listing 的设计边界，不作为 Promotion P0 前置条件。

**Owner POC**：在 [store-ops Rakuten POC Plan](https://github.com/retailpulses/store-ops/blob/docs/rakuten-reference-baseline-191/apps/rakuten/docs/poc-plan.md) 核实 source→event→action→readback、Coupon contract 与 SEO read-only 链路。运行时、凭据、测试未在 Registry 编辑中验证。
