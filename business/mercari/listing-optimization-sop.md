# Mercari Shops — Listing Optimization SOP

**Status:** Draft / Sponsor Review  
**Owner:** Mercari Store Operations  
**Scope:** All company-operated Mercari Shops; existing listing optimization, especially priority/hero products  
**Established:** 2026-11-14 JST  
**Case study:** WF324486 (internal product family), [Mercari listing](https://jp.mercari.com/shops/product/2JMfgpDsDTZ7zf7uu9zs77), [canonical Drive folder](https://drive.google.com/drive/folders/1HJ8_-ucn1q_H8AN9cUg70067mlzzXwBu)

## 1. Purpose and boundaries

Improve qualified demand conversion and buyer comprehension while controlling returns and misinformation. Optimize from observed product and buyer evidence, not speculative copy or generic competitor claims.

This SOP covers research, baseline preservation, copy and image review, QA, publication evidence, and post-change assessment. It does **not** authorize changes to prices, stock, timesales, shipping, warranties, listing status, or platform configuration.

Follow [listing-csv-guideline.md](listing-csv-guideline.md) for CSV schema, platform constraints and internal SKU management fields. This SOP is shop-agnostic; target shop is an execution parameter.

## 2. Non-negotiable: no internal SKU in customer-facing copy

- **NEVER** include internal SKU, item management code, supplier item code, database key, internal ticket/order ID, or private operational identifiers in the customer-facing title, description, image overlay, FAQ, or marketing message.
- Internal identifiers **are permitted** in internal Drive folder names, baseline manifests, work logs, internal version names and dedicated platform management fields such as `SKU1_商品管理コード` where the existing CSV guideline permits them. These fields must not be concatenated into `商品名` or `商品説明`.
- A genuine consumer-facing manufacturer model number may be published **only when verified as such**, and must not be treated as an internal SKU merely because it looks like a code.
- QA must scan the **rendered output** (not only templates) for internal identifiers, including image text and variant copy. Any leak is a **publication blocker**.
- Case correction: remove `商品管理コード：WF324486BAA` from the proposed/current consumer description; do not replace it with another internal code.

## 3. Priority-product canonical folder policy — Google Drive

Create a persistent, canonical folder for each selected key product **before** the first substantial optimization. This is mandatory for priority/hero products, high-demand listings, repeated optimization candidates, and products with shared-variant imagery or material buyer-comprehension risk. Routine minor edits need not trigger new folders unless selected for managed optimization.

**Canonical location:** `Retailpulses/mercari/<internal-product-family-code>/` (existing case: `Retailpulses/mercari/WF324486/`). Use the existing folder when present. One product family folder may cover multiple shops/listings/variants; distinguish each listing in the manifest. Do not create a duplicate folder per revision or per shop without a justified product identity boundary.

Recommended structure (create subfolders on demand, not as empty scaffolding):

```text
Retailpulses/mercari/<internal-product-family-code>/
  README-or-manifest                # internal IDs, product family, shop, listing URLs, variant mapping, owner, dates
  baseline/
    YYYY-MM-DD_<shop>_<listing-id>_title-description
    YYYY-MM-DD_<shop>_<listing-id>_images/
      01_<original-name> ... NN_<original-name>
    YYYY-MM-DD_<shop>_<listing-id>_attributes-pricing-evidence
  proposed/
    YYYY-MM-DD_<shop>_<listing-id>_copy-v1
    YYYY-MM-DD_<shop>_<listing-id>_image-plan-v1
  published/
    YYYY-MM-DD_<shop>_<listing-id>_verified-copy-and-image-order
  performance/
    YYYY-MM-DD_<shop>_<listing-id>_before-after
```

**Baseline fidelity:** archive original image **bytes**, not merely image filenames, screenshots, search results or re-generated substitutes. Record original order, names, image count, retrieval date, source URLs, image hashes when possible, and any unavailable assets. Preserve original copy verbatim. Label incomplete baselines `INCOMPLETE`; never claim image backup is complete based on a filename list. Avoid overwriting baseline artifacts. Where multiple variants share images, preserve the shared set once and record its applicability and exclusions.

**System ownership:** GitHub `/.github/business/mercari/` is canonical for business rules and SOP revisions; Google Drive product folder is canonical for product-level source assets, before/after copy, and evidence. The live Mercari Seller listing remains source of truth for what is actually published. Cross-link all three; do not assume a proposed Drive document is published.

## 4. Workflow

1. **Select and scope:** record shop, listing URL/ID, product family, actual offered variant, optimization hypothesis, owner and excluded changes. Prioritize demand signals (views, likes, orders, questions, returns), but likes/views is not conversion.
2. **Create/find canonical folder:** search existing Drive folder first; create only when missing; record exact folder URL in work record. Ensure appropriate access without changing sharing permissions casually.
3. **Capture baseline before editing:** exact title and description, listing properties, offered variant, image binaries/order, shipping/price/time-sale snapshot, date and source. Confirm files are readable. Mark missing evidence and proceed only when risk permits.
4. **Inspect OUR images first:** review each actual image for depicted variant, included/excluded parts, dimensions, legibility, claims, repetitions and order. Never pretend filename inspection equals visual review.
5. **Verify product facts:** use actual listing, supplier specification and operational records; identify conflicting dimensions, warranty or shipping claims. Do not import competitor dimensions as product facts.
6. **Research competition:** comparable Mercari products first, then Rakuten/Amazon when helpful. Compare total buyer cost, features, copy, main image and credible evidence. Record sources and date.
7. **Choose smallest effective change:** prioritize text-only fixes for a clear buyer-comprehension issue before expensive image redesign. Distinguish hypothesis from established issue.
8. **Write optimized title and complete description:** front-load product category, verified differentiators and critical variant configuration; explain actual inclusions/exclusions early. Avoid keyword stuffing, unverified waterproof/load claims, and internal identifiers. Preserve approved commercial terms.
9. **Pre-publish QA:** verify title/description/image consistency; offered variant, actual parts, dimensions, shipping, warranty and total price; check policy and prohibited internal IDs; ensure no unapproved settings changed. Block on unverified material claims.
10. **Publish and verify:** obtain operator authorization where required; capture actual published text, image order, timestamp and listing URL. Store in `published/`; do not mark published from a draft alone.
11. **Measure and iterate:** compare consistent windows for views, likes, orders, sales, questions, cancellation/return reasons, pricing and promotions. Note confounders (time sale, stock, seasonality); avoid causal claims from likes alone. Store findings in `performance/`.

## 5. Shared-image variant rule (WF324486 learning)

A product family may deliberately reuse the same imagery across shelf-equipped and shelf-free variants. Shared images **are not automatically defective**. However, when pictured optional components are **not included**, the description must prominently explain the exact purchasable configuration before general promotional text. For the shelf-free listing, say clearly that shelves and shelf supports are not included, and that there is no floor panel. Never include the internal SKU in this disclosure. If the images make the buyer unable to distinguish variants even with copy, escalate for image correction.

Example Japanese customer-safe opening:

> 【重要：本商品は「棚なし・床板なし」タイプです】  
> 掲載画像は「棚付きタイプ」と「棚なしタイプ」の共通画像を使用しています。  
> 一部の画像に棚板・可動棚が写っていますが、本商品に棚板・棚受け部品は付属しません。

## 6. QA acceptance gates

| Gate | Pass condition | Failure |
|---|---|---|
| Identity privacy | No internal SKU, supplier code or management ID in any consumer-facing text or image | BLOCK |
| Variant accuracy | Included/excluded parts and selected offer explicit | BLOCK |
| Product claims | Dimensions, materials, waterproof/load claims backed by product evidence | BLOCK material claim or omit |
| Commercial policies | Shipping, warranty, timesale and price unchanged unless separately approved | BLOCK |
| Baseline | Exact text and available original images archived with order; gaps explicitly marked | INCOMPLETE / risk review |
| Publication | Actual live listing re-read and matched to approved copy | NOT VERIFIED |
| Performance | Observation windows, confounders and metrics recorded | FOLLOW-UP |

## 7. Case state and next actions (2026-11-14)

- Google Drive product family folder: [WF324486](https://drive.google.com/drive/folders/1HJ8_-ucn1q_H8AN9cUg70067mlzzXwBu).
- Current text snapshot and proposed copy were stored in that folder. User reported the optimized copy has been published; publication readback and exact live copy verification have **not** been completed here.
- **Outstanding:** 14 original listing image binaries have **not** been backed up; only their names/order were captured. Baseline status remains **INCOMPLETE** until original images are acquired and verified in Drive.
- **Correction:** a previous proposed draft included `商品管理コード：WF324486BAA` in customer copy. This violates this SOP. Remove it from consumer-facing text, and confirm the live listing contains no internal code.
- Measure results after an appropriate observation window, controlling for active timesale and inventory.

## 8. Definition of done

Optimization is done only when: baseline status and gaps are documented; actual product/variant facts are checked; proposed copy and image plan pass QA; live published state is verified; the canonical product folder contains the relevant artifacts and cross-links; and a performance review owner/window is recorded. Draft creation alone is not completion.
