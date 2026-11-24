# Cross-Platform Main Image Standard — Mercari Shops + Rakuten

**Status:** Draft / Sponsor Review · **Date:** 2026-11-24 JST · **Owner:** Listing & Creative
**Scope:** the first product image used as the **main image** on Mercari Shops and Rakuten Ichiba. One master asset must be publishable on both platforms.
**Companion docs:** [Rakuten-style rendering and R2 delivery](../rakuten/style-image.md) · [Giga image selection policy](../mercari/images/giga-image-selection-policy.md)

---

## 1. Decision: the AND of both platform rules

**BUS-IMG-001 — Precedence.** When Mercari Shops and Rakuten requirements differ, the **stricter requirement applies**. A master main image MUST satisfy the AND of both platforms. A master that satisfies only one platform is not a valid master.

Consequences:

- Mercari-specific allowances (text anywhere, photo backgrounds, promotional overlays) do not relax the Rakuten rules.
- Rakuten-specific allowances (photo backgrounds, text up to 20%) do not relax the Mercari overlay-safety rules.
- One master hash is used for both channels. Channel-specific re-rendering, re-cropping or re-texting of the main image is NOT the default and requires an approved exception (BUS-IMG-011).
- Secondary images are out of scope; they may use photo backgrounds and longer text.

**Evidence status of this contract:** Mercari image rules and Rakuten 20% / no-border / background / GIF rules are **VERIFIED** against official sources. Rakuten file-size and penalty-point details remain **PARTIAL** (third-party or internal observation). See §9.

---

## 2. Requirement matrix (AND)

| # | Requirement | Mercari Shops | Rakuten (first image / SKU image) | AND — our standard |
|---|---|---|---|---|
| 1 | Aspect ratio | Square recommended | Square recommended | **1:1** |
| 2 | Minimum size | Not specified | ≥700×700 recommended | **1500×1500** (min 700×700) |
| 3 | File size | ≤8 MB per image | ≤2 MB target (internal, PARTIAL) | **≤2 MB target; >2 MB blocked; 8 MB absolute ceiling** |
| 4 | Format | JPG / JPEG / PNG | JPEG / PNG (GIF converted) | **JPEG for upload; PNG retained as edit source** |
| 5 | Animation | Not addressed | Animated GIF prohibited | **No GIF; no animation** |
| 6 | Text area | No fixed limit | **≤20%** of image area | **≤12% target; ≤20% hard limit** |
| 7 | Border | Not prohibited | **No border**, including L-shape, band, shadow-as-border | **No border / band / frame** |
| 8 | Background | Bright, simple | **Solid white or photographic** | **Solid #FFFFFF** for the main image |
| 9 | Overlay safety | Avoid bottom-left (price) and top-left (SOLD) | Not specified | **Keep 270×270 top-left and 300×310 bottom-left free of text** |
| 10 | Product visibility | Product large in frame | Product clear; no misleading size/colour | **65–75% of frame; no misleading scale** |
| 11 | Multiple variants | Not specified | Group photo allowed; SKU image per variant | **Family allowed only if the sold variant is identifiable; otherwise show only the sold variant** |
| 12 | Promotional text | Allowed but expires | Counts toward 20%; discouraged | **Prohibited in the main image** |
| 13 | IP / trademark | Rights required; no manufacturer images without permission; no "〇〇風" | Rights required; no infringement | **Usage rights for both channels; no "〇〇風"** |
| 14 | Channel delivery | External URL or upload | R-Cabinet only | **One master hash; R2 for Mercari, R-Cabinet for Rakuten** |

The matrix is the contract. Where a rule below uses MUST / MUST NOT, it is normative.

---

## 3. Normative rules

### BUS-IMG-002 — Canvas and format

- MUST be 1:1, 1500×1500 px, JPEG for upload.
- MUST be at least 700×700 px; smaller images MUST NOT be published.
- File size MUST be ≤2 MB for the upload derivative. A file >2 MB MUST be blocked until the Rakuten limit is re-verified or the file is recompressed. The absolute platform ceiling is 8 MB (Mercari).
- PNG MAY be retained as the editable archive; it MUST NOT be the upload format unless a platform-specific need is approved.
- Animated GIF MUST NOT be used.

### BUS-IMG-003 — Text budget and safe zones

- Total text, logo and typographic elements MUST cover ≤20% of the image area; the operating target is ≤12%.
- The following zones MUST remain free of text and logos:
  - top-left 270×270 px (Mercari SOLD overlay);
  - bottom-left 300×310 px (Mercari price overlay).
- Text MUST be limited to: product type, one key specification, dimensions, and at most three verified attributes.
- Text MUST be legible at 300×300 px (thumbnail test).
- Text MUST NOT include price, points, coupons, sale/shipping promotions, or urgency claims.

### BUS-IMG-004 — Background and border

- Main-image background MUST be solid #FFFFFF.
- A photographic background is permitted only for secondary images; it MUST NOT be used for the master main image unless BUS-IMG-011 is approved.
- There MUST be no border, frame, L-shape, band, decorative strip, or shadow that reads as a border.
- The product MAY cast a natural shadow; the shadow MUST NOT form a frame.

### BUS-IMG-005 — Product visibility and size accuracy

- The product MUST occupy 65–75% of the frame.
- The product MUST be shown at a 3/4 or front angle that makes its type and form clear.
- Dimensions shown MUST be the **assembled product dimensions**, not package or carton dimensions.
- The image MUST NOT imply a size, capacity or included item that the listing does not sell.

### BUS-IMG-006 — Variant and family representation

- If the listing sells a specific variant, the main image MUST make that variant identifiable (colour, size or configuration).
- If the main image shows the family, the sold variant MUST be visually distinguished; otherwise the image MUST show only the sold variant.
- Colour names and swatches MUST match the physical product; no invented colours.
- Family representation SHOULD follow one of the four patterns: lineup, size ladder, colour chips, split frame. The pattern MUST match the variant axis:
  - size variants → lineup or size ladder;
  - colour-only variants → colour chips or split frame;
  - configuration variants → two labelled insets.
- SKU images (Rakuten) MUST be provided per variant when the listing carries multiple SKUs.

### BUS-IMG-007 — Prohibited content

The main image MUST NOT contain:

- price, points, coupons, "送料無料", "セール", "割引", "円", or other promotional text;
- internal item codes, `元SKU`, `原W`, legacy codes, or barcodes;
- package/carton dimensions presented as product size;
- placeholders such as `Not Applicable`, `TODO`, `XXX`;
- watermarks, supplier stamps, or third-party logos without permission;
- comparative claims or "No.1" claims without substantiation.

### BUS-IMG-008 — IP and usage rights

- The image MUST have usage rights covering both Mercari Shops and Rakuten, including cropping and text overlay.
- Manufacturer website images, other marketplaces' images, and third-party SNS images MUST NOT be used without written permission.
- Expressions such as "〇〇風", "〇〇タイプ", or "〇〇のような" MUST NOT be used in the image or its text.
- Rights evidence MUST be recorded in the image manifest (source, licence, scope, expiry if any).

### BUS-IMG-009 — Channel delivery and naming

- One master asset per SPU1 (or per variant when the variant delta requires it), identified by content hash.
- Mercari delivery: public URL from R2 (`img.homesbliss.net`), object key `main-image/{item_code}/{item_code}_{variant}_{sha256[:8]}.jpg`.
- Rakuten delivery: the same master uploaded to R-Cabinet; R2 URLs MUST NOT be placed in Rakuten image fields.
- The manifest MUST record: `item_code`, `variant`, `r2_key`, `public_url`, `bytes`, `sha256`, `renderer_version`, `created_at`, `rights_evidence`.
- Re-rendering for a channel MUST NOT change the master hash without a new approval.

### BUS-IMG-010 — QA and publication gate

Before publication, every main image MUST pass:

1. 1500×1500, 1:1, JPEG, ≤2 MB.
2. Solid #FFFFFF background.
3. No border / band / frame.
4. Text ≤20% (target ≤12%).
5. Top-left and bottom-left safe zones clear.
6. No promotional text.
7. No internal codes or placeholders.
8. Assembled dimensions present and correct.
9. Variant delta identifiable; family highlight correct.
10. Thumbnail legibility at 300×300.
11. Rights evidence recorded.
12. Same master across Mercari shops for the same SPU1/variant.

Scoring: compliance 40, information 30, readability 20, consistency 10. A score below 80 MUST NOT enter a publication batch.

### BUS-IMG-011 — Exceptions

- An exception is allowed only when a platform rule makes the AND impossible, or when a category-specific official rule requires a different treatment.
- Each exception MUST record: platform, category/item scope, rule that conflicts, alternative asset, approver, date, expiry.
- An exception MUST NOT create a second master for the same item without an explicit scope and rollback.
- Photo-background main images, promotional overlays, and channel-specific text are exceptions by default; none is approved by this document.

### BUS-IMG-012 — Ownership and change control

- Owner: Listing & Creative. Consumers: Mercari CSV/API exporters, Rakuten CSV/RMS workflows, Canonical Images.
- Platform facts in this standard MUST be re-verified when the official guidance changes; record the source URL and verification date.
- Changes to the text budget, safe zones, background or family rules require a reviewed PR and an impact note for both channels.
- `business/rakuten/style-image.md` is the rendering/delivery guide for this standard; it MUST NOT define a conflicting main-image rule.
- `business/mercari/images/giga-image-selection-policy.md` covers source selection and size filtering; composition follows this standard.

---

## 4. Layout reference (1500×1500)

| Zone | Coordinates (px) | Content | Type size |
|---|---|---|---|
| Title | 80–620, 300–430 | Product type + primary specification | 96 |
| Subtitle | 80–620, 440–520 | One differentiator | 52 |
| Three attributes | 80–560, 560–1060 | Three verified attributes | 40 |
| Product | 640–1450, 220–1180 | 3/4 view, 65–75% | — |
| Dimensions | 80–920, 1290–1390 | W × D × H cm | 38 |
| Family (optional) | 980–1450, 1240–1420 | Size ladder / colour chips | 20–28 |

Safe zones: top-left 0–270 × 0–270; bottom-left 0–300 × 1190–1500.

This layout is a reference, not a fixed template. A different layout is allowed only if all normative rules in §3 still pass.

---

## 5. Family representation

| Pattern | Use when | Requirement |
|---|---|---|
| Lineup | 2–3 size variants | All items share angle and scale; current variant highlighted |
| Size ladder | Many sizes, limited space | Bar heights proportional to real dimensions; current highlighted |
| Colour chips | Colour-only variants | Swatches close to physical colour; current ringed |
| Split frame | Two colours | Clear boundary; no implication that both are shipped |

If a family cannot be shown without ambiguity, the main image MUST show only the sold variant and the family moves to image 2 or later.

---

## 6. Channel delivery

| Channel | Field | Delivery | Constraint |
|---|---|---|---|
| Mercari Shops | `商品画像名_1` | R2 public URL or uploaded file | ≤8 MB, ≤20 images; URL fetched and re-hosted by Mercari |
| Rakuten | 第1商品画像 | R-Cabinet path | R2 URL not accepted; same master file uploaded |

The master file is identical. Only the delivery path differs.

---

## 7. Evidence and source register

| Claim | Source | Status |
|---|---|---|
| 1:1 recommended; bright, simple background; avoid bottom-left/top-left overlays | [メルカリShops「選ばれる商品ページを作ろう」](https://jp-news.mercari.com/mercari-shops/info/51494) (2026-05-08) | VERIFIED (official) |
| Specific title; title keyword weight > description; no irrelevant keywords; no delete/relist | [メルカリ検索表示ガイド](https://help.jp.mercari.com/guide/articles/1864/) / [官方解读](https://jp-news.mercari.com/info/40006) | VERIFIED (official) |
| No manufacturer images without permission; no "〇〇風" | [メルカリ 商品名・商品画像ルール](https://jp-news.mercari.com/info/49410) (2026-04-01) | VERIFIED (official) |
| Text ≤20%, no border, white or photo background, no animated GIF; square ≥700×700 | [楽天 RMS 商品画像登録ガイドライン](https://service.rms.rakuten.co.jp/column/detail/26) (2025-12-26) | VERIFIED (official) |
| Rakuten 2 MB limit; 20–31% = △, >31% = ×; 5 penalty points per product | Third-party summaries / internal observation | PARTIAL — re-verify in RMS |
| R2 custom domain `img.homesbliss.net`; Mercari re-hosts external images | Internal R2 and API tests | VERIFIED (internal) |
| Mercari 8 MB/image, ≤20 images | Mercari official help via internal image policy | VERIFIED |

---

## 8. Open items

1. Re-verify the Rakuten 2 MB file-size limit and the penalty-point calculation in RMS before blocking production files solely on the 2 MB target.
2. Confirm the text-area measurement method (our renderer vs RMS judgement tool) on 3–5 real images.
3. Confirm supplier image licences cover derivative works and both channels.
4. Confirm whether Rakuten requires a distinct SKU image for every SKU; if so, the manifest must include a per-SKU image field.
5. Decide whether a photo-background main image is ever allowed for a specific category; today it is not.

---

## 9. Change log

| Date | Change | Owner |
|---|---|---|
| 2026-11-24 | Initial cross-platform AND standard; BUS-IMG-001–012 | Listing & Creative |
