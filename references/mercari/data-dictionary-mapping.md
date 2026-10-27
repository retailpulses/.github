# REF-MERCARI-DATA — Business Dictionary and Field Mapping

Status: PARTIALLY VERIFIED / Live-to-DB lineage UNKNOWN · 2026-10-27 · [Issue #53](https://github.com/retailpulses/.github/issues/53)

| Term ID | Definition / grain | Code/contract evidence | Unverified mapping |
|---|---|---|---|
| MRC-001 Shop | Mercari Shops Shop1–4 account; separate from Seller ASUKA/HEYA/TBO | [Orders shop state](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/src/lib/mercari-shop-state.mjs) | shop ID ↔ local/Supabase keys |
| MRC-002 SPU1 / Variant / Item Code | SPU1 groups variants; Variant-level shared copy/image; Item Code external SKU | [store-ops Mercari](https://github.com/retailpulses/store-ops/tree/main/apps/mercari) | Variant ↔ Giga SKU ↔ Listing join |
| MRC-003 Listing / Product ID | Shop-specific published listing, distinct from canonical Variant | [identity projection migration](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/supabase/migrations/20261004110000_project_mercari_product_id_from_external_identity.sql) | GraphQL ID → DB product identity |
| MRC-004 Copy / image state | Variant shared content vs shop-specific template/published snapshot | [NPL owner](https://github.com/retailpulses/store-ops/tree/main/apps/mercari) | version/published snapshot and field names |
| MRC-005 Publication state | READY / PUBLISHED / BLOCKED semantics must come from product design, not approval flag | [NPL owner](https://github.com/retailpulses/store-ops/tree/main/apps/mercari) | per-shop published readback |
| MRC-006 Inquiry | Thread/message/status; needs_reply is internal operator state | [Inquiry mappers](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/worker/src/mercari/mappers.ts) | API payload → Supabase → local SQLite |
| MRC-007 Order / shipping | Marketplace order vs shipment vs Giga fulfillment | [Orders event contract](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/docs/webhook/mercari-event-contract.md) | external order IDs, tracking, lifecycle |
| MRC-008 Time Sale | Campaign CSV generation/upload vs seller-observed ACTIVE state | [CSV uploader](https://github.com/retailpulses/retailpulses-tool-services/blob/main/packages/mercari/upload-csv/upload-mercari-csv/upload_mercari_csv_to_shops.py) | CSV columns → shop-side campaign state |
| MRC-009 Buyer shipping facts | Listing-dependent shipping rules; cannot infer from Inquiry schema | [Inquiry Reference](inquiry-api.md) | Listing facts → direct reply policy |

**Evidence rule:** raw API/webhook field + adapter + writer + SQLite/Supabase schema + product consumer must be checked before VERIFIED. API, relay, browser and CSV mappings must retain source-channel metadata. No schema renaming, no new shared database, no executable mapping engine. [Inventory](capability-inventory.md) / [Inquiry API](inquiry-api.md).
