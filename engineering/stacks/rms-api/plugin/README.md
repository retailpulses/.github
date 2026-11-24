# @local/dsh-rms-api

Internal DeepSeek Harness capability for **Rakuten RMS WEB SERVICE**. The plugin
exposes RMS order, item and Inventory API 2.1 operations to an agent, with reads
enabled and production writes behind a two-level gate.

This package is vendored under `engineering/stacks/rms-api/plugin/` in the
organization `.github` repository. Install it from that path, not from a separate
working copy, so the capability record and the code stay together. Credentials
stay inside the plugin directory and are git-ignored.

**Status:** Pilot — live read paths verified 2026-11-20; Item API writes are
currently blocked by app permissions (see [API permission boundary](#api-permission-boundary)).

## Capability at a glance

| Area | Read | Write | Status |
| --- | --- | --- | --- |
| Orders | search, detail | confirm, shipping, cancel | Search verified live; writes not exercised |
| Items | search, lookup by manageNumber | variant standard price | Search verified live; detail/write **401** for this app |
| Inventory 2.1 | variants, bulk-get, quantity range | bulk quantity upsert | Read verified live; write not exercised |
| Status | config, credential source, read-only probe | — | Verified live |

### RMS sale model (important)

- `purchasablePeriod` is **product-level**. All variants share the same sale
  window.
- `standardPrice` and `referencePrice` are **variant-level**. One variant can be
  on sale while the other variants stay at normal price.
- The サーチ event application is **product-level**. A product with only one
  discounted variant can still be accepted. Verified example:
  `cabnt-n515p416432` has only `n515p416432w` at 17,280 / reference 28,800 while
  `c` and `b` remain at normal price.

**Timing warning:** RMS has no separate future sale-price field. `standardPrice`
is the current price, so writing the SALE price in November makes it visible on
the storefront immediately. With a future `purchasablePeriod`, the page shows the
sale price and 「販売期間前です」, and the item is not purchasable until the period
starts. Verified on 2026-11-20: `cabnt-n515p416432` displayed 17,280 yen with a
28,800 reference and a 2026-12-03 20:00 start; all 60 accepted products shared
that same period. Do not treat `standardPrice` as a scheduled price.

## Tools

| Tool | Method / endpoint | Behavior |
| --- | --- | --- |
| `rms_status` | — | Base URL, credential sources, write gate, limits and endpoint table. `probe: true` makes one read-only Item API call. |
| `rms_orders_search` | `POST /es/2.0/order/searchOrder/` | Order numbers by date and progress. Max 31 days per search; defaults to the last 7 days JST. |
| `rms_order_detail` | `POST /es/2.0/order/getOrder/` | Full order JSON for 1–100 orders, schema version 7 by default. |
| `rms_order_confirm` | `POST /es/2.0/order/confirmOrder/` | **Write.** Confirm orders (注文確認). |
| `rms_order_shipping` | `POST /es/2.0/order/updateOrderShipping/` | **Write.** Register carrier and tracking numbers. Needs `basketId`. |
| `rms_order_cancel` | `POST /es/2.0/order/cancelOrder/` | **Write.** Cancel before shipping, or after shipping with `afterShipping: true`. |
| `rms_items_search` | `GET /es/2.0/items/search` | Compact items with manageNumber, title, genre, prices and variants. Exact `itemNumber` filter. |
| `rms_item_detail` | Item search by exact `itemNumber`, then page scan | One item by manageNumber. |
| `rms_item_price` | `PATCH /es/2.0/items/manage-numbers/{mn}` | **Write.** Set one variant's standard price. Currently returns 401. |
| `rms_inventory` | `GET /es/2.1/inventories/variant-lists/...` + `POST /es/2.1/inventories/bulk-get` | All variants for a manageNumber, selected variantIds, or up to 100 explicit pairs. |
| `rms_inventory_range` | `GET /es/2.1/inventories/bulk-get/range` | Variants in a quantity range, capped and marked when truncated. |
| `rms_inventory_update` | `POST /es/2.1/inventories/bulk-upsert` | **Write.** Up to 100 quantity updates, `ABSOLUTE` by default. |

All reads are capped or chunked: 100 orders, 100 items, 100 inventory rows. The
client self-throttles to 750 ms between RMS calls by default.

## API permission boundary

The current store app can **read** Item API search, order search and Inventory
2.1, but cannot use Item API detail or write. Verified on 2026-11-20:

```text
GET  /es/2.0/items/search?offset=0&searchType=1       → 200, numFound 533
GET  /es/2.0/items/manage-numbers/{mn}                → 401 GA0001 Un-Authorised
PATCH /es/2.0/items/manage-numbers/suitc-pp315895 {}  → 401 GA0001 Un-Authorised
```

The no-op PATCH made no change. Item API 2.0 itself supports the sale write:

```json
{
  "purchasablePeriod": {
    "start": "2026-12-03T20:00:00+09:00",
    "end": "2026-12-11T01:59:59+09:00"
  },
  "variants": {
    "n515p416432w": {
      "standardPrice": "17280",
      "referencePrice": {
        "displayType": "REFERENCE_PRICE",
        "type": 1,
        "value": "28800"
      }
    }
  }
}
```

Before this can run, the RMS WEB SERVICE app must be granted **Item API 2.0
read/write** permission (and any required IP allowlist). Then verify with a
no-op or same-value PATCH before the first real write. Until then, only UI or
logged-in-session automation can change sale periods or reference prices.

`rms_item_price` is therefore intentionally left in place but is not usable with
the current app permission. It does not set the period or the reference price.

## Setup

### 1. Install the bundle

From this repository, install the local bundle into the DSH profile:

```bash
pnpm --dir <dsh-profile> add link:<repo-root>/engineering/stacks/rms-api/plugin
```

Or use the DSH plugin manager with the same path. Add
`@local/dsh-rms-api` to the profile's bundles list. The bundle patch inserts the
`rms-api` row with `allowWrites: false`.

### 2. Store credentials

RMS WEB SERVICE issues a **serviceSecret** for the registered app and a
**licenseKey** for the shop. Store them locally so they never enter chat:

```bash
cd engineering/stacks/rms-api/plugin
node scripts/rms-auth.mjs
```

The prompts are hidden and the file is written with mode `0600` to
`credentials/rms.json` (git-ignored). Other modes:

```bash
node scripts/rms-auth.mjs --from-env           # RAKUTEN_SERVICE_SECRET / RAKUTEN_LICENSE_KEY
node scripts/rms-auth.mjs --from-file=<path>   # read the two keys from an env file
node scripts/rms-auth.mjs --show               # masked status, no request
node scripts/rms-auth.mjs --no-verify          # save only
```

Resolution order per field: plugin config → environment → `credentials/rms.json`.
The plugin never returns either secret; `rms_status` reports only the **source**
(`config`, `env`, or `file`).

### 3. Verify

Ask the agent for `rms_status` with `probe: true`. It makes one read-only Item
API request and returns `authenticated: true` on success.

### 4. Enable writes

The bundle patch defaults to:

```yaml
config:
  allowWrites: false
```

Set `allowWrites: true` in the profile's `rms-api` row (or the bundle patch
before installing) and restart the profile. Every write call still requires
`confirm: true`.

## Configuration

| Key | Default | Meaning |
| --- | --- | --- |
| `serviceSecret` / `licenseKey` | — | Inline credentials; prefer env or the credentials file. |
| `credentialsFile` | `./credentials/rms.json` | Credentials JSON location. |
| `allowWrites` | `false` | Enables the five write tools; `confirm: true` is still required per call. |
| `timeoutMs` | `30000` | Per-request timeout, 1000–120000. |
| `maxRetries` | `2` | Retries read calls on 429/5xx/transport errors (0–4). Writes never retry. |
| `minIntervalMs` | `750` | Minimum spacing between RMS calls. |
| `maxOrders` / `maxItems` / `maxVariants` | `100` / `20` / `100` | Default batch sizes. |

The base URL is locked to `https://api.rms.rakuten.co.jp`; alternate hosts are
rejected.

## Tools in detail

### `rms_orders_search`

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `start` | string | no | `YYYY-MM-DD` or ISO-8601; defaults to 7 days ago JST |
| `end` | string | no | `YYYY-MM-DD` or ISO-8601; defaults to today JST |
| `dateType` | integer | no | 1 = order date (default), 2/3 per RMS |
| `progress` | integer[] | no | 100/200/300/400/500/600/700/800/900 |
| `limit` | integer | no | 1–1000 order numbers; default 100 |

RMS rejects windows longer than 31 days for this endpoint.

### `rms_order_detail`

`orderNumbers` accepts 1–100 RMS order numbers. `version` defaults to `7`.

### Order writes

- `rms_order_confirm`: `orderNumbers[]`, `confirm`.
- `rms_order_shipping`: `orderNumber`, `basketId`, `shippingList[]`
  (`shippingId`, `shippingCompanyId`, `shippingNumber`), `confirm`.
- `rms_order_cancel`: `orderNumber`, optional `cancelReason` 0–7,
  optional `afterShipping`, `confirm`.

### `rms_items_search`

| Parameter | Type | Notes |
| --- | --- | --- |
| `itemNumber` | string | Exact RMS item number; verified filter |
| `genreId` / `shopStatus` | string | Optional filters |
| `searchType` | integer | 1–5; default 1 |
| `offset` | integer | 0-based |
| `limit` | integer | 1–100; default 20 |

The response is compact; the full product description is intentionally omitted.

### `rms_item_detail`

Looks up by exact `itemNumber` first, then scans up to `scanPages` search pages
(default 10). This exists because the detail endpoint returns 401 for this app.

### `rms_inventory`

Pass one of:

- `manageNumber` — fetch the variant list, then all variants;
- `manageNumber` + `variantIds[]` — narrow the request;
- `variants[]` of `{ manageNumber, variantId }` — up to 100 explicit pairs.

### `rms_inventory_range`

`minQuantity`, `maxQuantity`, `limit` (1–1000; default 100). The endpoint returns
the full matching set, so the response reports `truncated` when capped.

### Inventory write

`rms_inventory_update` takes `updates[]` with `manageNumber`, `variantId`,
`quantity` and optional `mode` (`ABSOLUTE` default, `RELATIVE`). Zero is a valid
absolute quantity. Maximum 100 updates, `confirm: true` required.

## Safety model

- **Writes are off by default** and require both `allowWrites: true` and a
  per-call `confirm: true`.
- **Write requests are never retried.** A timeout may mean RMS accepted the
  change; verify in RMS before retrying.
- **Secrets stay local.** The credentials file is `0600` and git-ignored; error
  text is redacted, including the derived ESA token.
- **No generic passthrough.** Only the reviewed `/es/` endpoints above are
  reachable.
- **Batch caps** prevent accidental thousand-row writes.
- **No credential values in output.** Status reports source and path only.

## Verification record

Verified live on **2026-11-20** against shop 440058:

| Check | Result |
| --- | --- |
| `rms_status` probe | `authenticated: true` |
| Item search | HTTP 200, `numFound: 533` |
| Inventory variant list | HTTP 200, 12 variants |
| Inventory bulk-get | HTTP 200, real quantities |
| Order search | HTTP 200, valid RMS INFO response |
| Item detail GET | HTTP 401 / GA0001 |
| Item PATCH no-op | HTTP 401 / GA0001 |
| Offline suite | 13/13 passed |

**Not verified / not exercised:** live order detail, order confirm, shipping,
cancellation, inventory writes, item price writes. Do not describe those as
verified until they have a safe test target and evidence.

## Troubleshooting

| Symptom | Cause / action |
| --- | --- |
| `GA0001 Un-Authorised` on item detail/PATCH | App lacks Item API 2.0 detail/write permission. Enable it in RMS WEB SERVICE. |
| `GA0001` on every call | Wrong serviceSecret/licenseKey, or the app is not valid for this shop. |
| `RMS order search accepts at most 31 days` | Narrow `start`/`end`; RMS limits the window. |
| `No item ... found` | `manageNumber` is outside the first `scanPages`; increase `scanPages` or filter by exact `itemNumber`. |
| `Writing is disabled` | Set `allowWrites: true` and restart the profile. |
| `Pass confirm: true` | Every write needs an explicit per-call confirmation. |
| 429 | RMS rate limit; wait and retry reads. Writes are not retried automatically. |

## Layout

```text
engineering/stacks/rms-api/
├── README.md                 # stack record
├── design.md                 # architecture and contracts
└── plugin/
    ├── README.md             # this file
    ├── index.js              # host plugin and tool registrations
    ├── cordis.patch.yml      # bundle patch: allowWrites false
    ├── package.json
    ├── locale/{en,zh}.json
    ├── icon.svg
    ├── scripts/rms-auth.mjs  # hidden-input credential helper
    ├── test/run.mjs          # offline tests
    └── credentials/          # runtime only, git-ignored
```

## Development

```bash
cd engineering/stacks/rms-api/plugin
node test/run.mjs
```

The suite is offline. It covers the ESA header, JST date normalization, the
31-day order window, item compaction, credential precedence, write gates,
validation, redaction and tool registration.
