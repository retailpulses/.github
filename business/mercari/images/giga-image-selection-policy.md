# Giga Images → Mercari Listing: Source URL and Image Selection Policy

**Scope:** Shop4 standalone Giga XLSX → Mercari Shops CREATE Web app ([Store-Ops #312](https://github.com/retailpulses/store-ops/issues/312)).  
**Status:** Sponsor-directed operating policy proposal, 2026-11-13. Image source reuse and filtering first; no Canonical Images writes, no new public URL/CDN as MVP.  
**Detailed feature design:** [Image Preparation & Selection](https://github.com/retailpulses/store-ops/blob/design/giga-mercari-standalone-20261113/docs/products/giga-mercari-listing-web/image-preparation-and-selection.md).

## Business rule

Giga original image URL and order are **supplier source evidence**; the standalone app owns a **derived per-listing image selection**, not a duplicate Canonical Images master. This mirrors the Giga category business rule: source facts are kept unchanged, while approved selection/exclusion/order decisions are versioned and exportable for later Canonical owner review.

1. **Keep Giga URLs unchanged for Mercari CREATE CSV.** The company prioritizes listing throughput and accepts supplier image URLs as the first path. No mandatory URL rewriting, mirroring, downloading-and-rehosting, source image replacement, Canonical Image job or CDN build in the pilot.
2. **Automatically omit oversized images from the listing batch.** The sponsor's primary root-cause hypothesis is large (>10MB) lifestyle/scene images. However **the actual Mercari official limit is 8MB per image**, so apply conservative internal `bytes < 8,000,000` for READY CSV. A >10MB image is necessarily excluded; 8–10MB is also excluded. The omission affects **this listing image selection only**, never Giga source content or Canonical assets. Keep original URL and exclusion evidence.
3. **Retain useful images and an identifiable cover.** Per Mercari product, <=20 selected images in effective order; no selected image -> cannot be READY. Do not automatically assume every large scene photo is useless beyond the objective byte-limit rule.
4. **Optional ranking:** product operator can choose lead image and reorder remaining selected images (source order default); possible later Agent suggestions for hero/angle/spec/dimensions/lifestyle are advisory and never override accepted manual order.
5. **Audit and handoff:** For each supplier image, keep source index, original URL, measured bytes/method where known, selection/rejection reason, accepted effective rank/cover and operator/time/version, source item code and optional verified Canonical Variant association. Store per-batch Image Selection Manifest in the app's artifacts, **not** in this company rules directory. Future Canonical Images/Product ingestion consumes these as proposals through owner-controlled review; never write accepted Canonical facts directly from this app.
6. **Partial-success behavior:** Exclude individually invalid/oversized images; valid remaining images allow the item to continue. A zero-image product is blocked/excluded with a reason. Accepted Mercari import result remains the final operational check, and fetch failures among below-limit images are preserved for targeted follow-up.

## Facts vs assumptions

**Official, verified** [Mercari Shops image bulk-registration guide](https://support.mercari-shops.com/hc/ja/articles/10202904748057) and [CREATE CSV guide](https://support.mercari-shops.com/hc/ja/articles/8859698858649): JPG/JPEG/PNG; per-image **8MB**, up to 20 images per product; `商品画像名` fields may use directly accessible image URLs. These are platform rules, not a proposed internal image CDN requirement.

**Prior real failure** ([Store-Ops #307](https://github.com/retailpulses/store-ops/issues/307)): 14 of 19 images-related failed Shop4 import rows. Subsequent source inspection: **12 of the 14** had at least one image above an internal **8MiB** target, while **two failed rows had no image above 8MiB**. Therefore oversized images are a high-value and likely major contributor but **not the sole demonstrated mechanism**. The sponsor's decision is to make oversize removal the MVP intervention, not to spend the first release rebuilding URLs.

**Operational contingency, not MVP dependency:** If a selected below-limit Giga URL is rejected by Mercari, record exact affected SKU/URL/result, isolate that row and investigate. Only if meaningful repeated below-limit fetch failures persist should a distinct optional Canonical-owned image derivative or a one-off compliant replacement be evaluated, with separate scope approval.

## Data and responsibility

| Layer | Owns | Does not own |
| --- | --- | --- |
| Giga supplier | Image source URLs, source image order and original bytes | Our accepted listing image ranking |
| Standalone Web app | Batch-scoped inclusion/exclusion, cover/order, safe-size preflight, CSV field order, image selection manifest | Permanent canonical asset IDs, original Giga image mutation, canonical image delivery |
| `/.github/business/mercari` | Image selection/exclusion rules, Mercari platform limit, operator review policy | Per-SKU mutable image picks or stored raw image blobs |
| Canonical Images / Product | Accepted asset identity, canonical accepted image order, authoritative product facts | Implicit acceptance of app's suggestions without lineage/approval |
| Mercari Seller | Accepted listing image assets after successful import | Guarantee that every Giga URL is reachable before import |

### Near-term product integration

- Product critical path [P0–P5](https://github.com/retailpulses/store-ops/blob/design/giga-mercari-standalone-20261113/docs/products/giga-mercari-listing-web/delivery-critical-path.md): replace the old **P1-B rehosting/normalization gate** with **P1-B source URL + size filtering**. Operator optional image sorting is a **minimum Web P4** feature; optional Agent ranking and Canonical import adapters are **P5**.
- No changes to legacy NPL Canonical Images worker ownership in #307: different source/consumer contract. Do not silently rewrite NPL's approved architecture.
- Require reviewable fixtures for exact 8MB boundary, no image, 20+ images, accepted manual order and a real Seller import receipt.
