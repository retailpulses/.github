# REF-RAKUTEN-DATA — Business Dictionary and Mapping

Status: PARTIALLY VERIFIED / Mapping lineage UNKNOWN · 2026-10-27 · [Issue #53](https://github.com/retailpulses/.github/issues/53)

| Term ID | Definition and grain | Potential source / target evidence | Gap |
|---|---|---|---|
| RKT-001 Shop | Rakuten merchant shop identity, distinct from Seller and channel | [Orders pipeline](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/rakuten-order-pipeline.md) | ID/DB join UNKNOWN |
| RKT-002 Item / SKU | RMS item identity and variation SKU, not automatically Giga Item Code | [RMS item collector](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/tools/rms/collect_item_snapshot.py) | Exact API→DB key mapping UNKNOWN |
| RKT-003 Listing | Published marketplace item state vs local draft | [boutique listing](https://github.com/retailpulses/boutique-listing/blob/main/src/platforms/rakuten/models.js) | Publication/readback mapping UNKNOWN |
| RKT-004 Price / inventory | Rakuten selling price and sellable quantity, not Giga procurement cost | [CatalogSync](https://github.com/retailpulses/CatalogSync/blob/main/lib/catalogsync/rakuten.py) | Live JSON→writer→DB not verified |
| RKT-005 Promotion Archetype | Business implementation class (coupon, points, campaign, etc.), not one API endpoint | [promotion POC](https://github.com/retailpulses/store-ops/blob/main/docs/poc/2026-10-13-rakuten-promotion.md) | API/UI/CSV per type requires verification |
| RKT-006 Promotion Calendar Event | Event window and eligibility, distinct from issued coupon | [calendar](https://github.com/retailpulses/inbox/blob/main/promotion/calendar/2026/rakuten.md) | Source/activation status UNKNOWN |
| RKT-007 Order / shipment | Order identity, confirmation and tracking state | [commerce-ops](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/rakuten-order-pipeline.md) | External↔Supabase lifecycle joins UNKNOWN |
| RKT-008 R-Messe Inquiry | Message/thread state separate from order/ticket | [Tickets POC](https://github.com/retailpulses/commerce-ops/blob/main/apps/tickets/docs/poc/rakuten-rmesse-api-read-poc.md) | API→ticket mapping UNKNOWN |
| RKT-009 SEO / item content | Product title/description/keyword fields; source-of-truth and publishing separate | [store-ops](https://github.com/retailpulses/store-ops/tree/main/apps/rakuten) | Field contract UNKNOWN |

**Mapping record format:** `term_id | source_system | API/CSV/UI version | source_path | adapter/transform | target_system | schema.table.column | join_key | null_policy | time | owner | evidence | status`.

No schema renames, no new mapping service. Mark VERIFIED only with sanitized source response + adapter/writer + DB row + consumer evidence. Existing documentation and code are **not** runtime verification. [RMS API Reference](rms-api.md) / [Inventory](capability-inventory.md).
