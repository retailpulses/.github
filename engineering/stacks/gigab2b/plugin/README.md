# @local/dsh-gigab2b

A DeepSeek Harness host plugin for **GigaB2B Open API 2.0**. It exposes signed,
read-oriented tools for inventory, price, product list, product details, order
status and tracking, plus a deliberately gated dropship write.

Open API 1.0 (`api.gigacloudlogistics.com`, OAuth/Bearer) is retired. This plugin
refuses that host and only signs the 2.0 `client-id` / `timestamp` / `nonce` /
`sign` scheme.

## Tools

| Tool | Endpoint | Behavior |
| --- | --- | --- |
| `giga_status` | — | Base URL, credential sources, write gate, endpoint/rate table. `probe: true` performs one read-only signed request. |
| `giga_inventory` | `inventory/quantity/v2` | Up to 200 SKUs. Seller available/promo quantity, buyer/margin/future quantities, next arrival. |
| `giga_price` | `product/price/v1` | Up to 200 SKUs. Price, exclusive/discounted price, promotion window, purchase limit, shipping fees, seller metrics. |
| `giga_products` | `product/skus/v1` | Paginated list. Requires `startTime`+`endTime` or `lastUpdatedAfter`; `pageSize` 100–1000; `limit` trims the records returned. |
| `giga_product_detail` | `product/detailInfo/v1` | Up to 200 SKUs **or** product names. Dimensions/material/colour; `includeContent` adds description, characteristics, images. |
| `giga_order_status` | `order/status/v1` | Up to 100 order numbers. Returns supplier data as-is. |
| `giga_tracking` | `order/track-no/v1` | Up to 100 order numbers. Read-only shipping/tracking data. |
| `giga_dropship_sync` | `order/dropShip-sync/v1` | Write. Disabled by default; requires `allowWrites: true` **and** per-call `confirm: true`. |

Normalized responses keep the supplier field names in `snake_case` and add
`found: false` entries for requested SKUs the supplier did not return. Set
`includeRaw: true` on inventory/price/detail to inspect the untouched envelope.

## Setup

### 1. Credentials

Obtain a GigaB2B **Open API 2.0** Client ID and Client Secret. Run the helper so
the secret never enters the chat or shell history:

```bash
cd /Users/agent/Documents/deepseek-harness/default-workspace/gigab2b
node scripts/giga-auth.mjs
```

It prompts for the Client ID (visible) and Client Secret (hidden), writes
`credentials/giga.json` with mode `0600`, then verifies with one read-only
product-list request. Other modes:

```bash
node scripts/giga-auth.mjs --from-env     # GIGA_CLIENT_ID / GIGA_CLIENT_SECRET
node scripts/giga-auth.mjs --show         # masked status, no request
node scripts/giga-auth.mjs --no-verify    # save only
```

Resolution order per field: plugin config → `GIGA_CLIENT_ID` /
`GIGA_CLIENT_SECRET` → `credentials/giga.json`.

### 2. Base URL

Defaults to production `https://openapi.gigab2b.com`. Set
`environment: sandbox` or `baseUrl: https://openapi-sandbox.gigab2b.com` for the
sandbox. Any other host is rejected.

### 3. Use it

Ask the agent for e.g. "check Giga inventory for N515P546649B", "what is the Giga
price for these SKUs", or "list Giga products updated since yesterday". Start
with `giga_status` when something fails.

## Configuration

| Key | Default | Meaning |
| --- | --- | --- |
| `environment` | `production` | `production` or `sandbox`. Ignored when `baseUrl` is set. |
| `baseUrl` | — | Explicit 2.0 host; must be the production or sandbox host. |
| `clientId` / `clientSecret` | — | Inline credentials; prefer env or the credentials file. |
| `credentialsFile` | `./credentials/giga.json` | Credentials JSON location. |
| `timeoutMs` | `30000` | Per-request timeout (max 120000). |
| `maxRetries` | `2` | Retries for read calls on 429/5xx/transport errors (0–4). Writes never retry. |
| `allowWrites` | `false` | Enables `giga_dropship_sync`; `confirm: true` is still required per call. |

## Safety model

- **Writes are off by default.** The dropship endpoint is non-idempotent and its
  exact contract is not officially verified, so it is never retried and never
  used for connectivity probes.
- **Rate limits are enforced client-side** per endpoint: 10 requests / 10 s for
  inventory, price and product list; 20 requests / 10 s for details, order
  status, tracking and dropship.
- **Batching caps:** 200 SKUs per read call, 100 order numbers per order call.
- **Retired host guard:** `api.gigacloudlogistics.com` is refused with an
  explicit error instead of silently falling back to Open API 1.0.
- **Secrets stay local.** The credentials file is git-ignored and `0600`; no
  tool returns the secret. `giga_status` reports only the credential *source*.

## Time filters

Product-list windows accept `YYYY-MM-DD HH:mm:ss` or ISO-8601. ISO values are
converted to UTC+8, the supplier platform's wall clock; the plugin does not
guess another zone. `pageSize` must be at least 100 — the supplier rejects
smaller values with `B20002 "The pageSize format is incorrect."`.

## Verification status

Verified locally on 2026-11-20 against production with the shared Open API 2.0
credentials:

- Live inventory, price and product detail for SKU `N515P546649B` returned
  `success: true`.
- Live product list returned 167 products for a 2026-11-01…2026-11-20 window;
  `pageSize` 100/200/500/1000 accepted, 10/20/50 rejected.
- Order status and tracking returned expected business errors (`B10004`,
  `B40004`) for a non-existent order number; no order was created or modified.
- `node test/run.mjs`: 25 offline checks passed (signature vector, host guard,
  batching, normalization, rate limiter, tool registration and write gates).

**Not verified:** live successful order status/tracking payload shapes, the
dropship request schema, and any write. Treat those as unproven.

## Development

```bash
node test/run.mjs
```

No network calls are made by the test suite.
