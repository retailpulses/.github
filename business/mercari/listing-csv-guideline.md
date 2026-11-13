# Mercari Shops — Listing CSV Guideline

**Status:** Draft / Sponsor Review  
**Owner:** Mercari Store Operations  
**Scope:** All Mercari Shops operated by the company; shop-agnostic CREATE CSV preparation and validation  
**Last source review:** 2026-11-11 JST (revalidate against the current platform templates before execution)

## Purpose and boundaries

This guideline defines common Mercari Shops **CSV bulk listing** business semantics, platform constraints, validation gates, evidence, and operator responsibilities. It applies regardless of destination shop. A particular shop is an **execution parameter**, not a hardcoded assumption in this document.

This is **not** a complete executable CSV schema, deployment authorization, or product TRD. Actual column names/order, masters, encoding, seller permissions, and seller-side configuration must be validated against the current official template and the selected shop. Product-specific implementation belongs in its own design pack. Marketplace identity follows [BUS-MKT](../marketplace-model.md); price/cost semantics follow [BUS-PRC](../pricing-contract.md).

Distinguish clearly:

- **Platform requirements:** Mercari-specified schema, enums, required fields and upload restrictions.
- **Company-wide operating rules:** common validation, safe export and evidence practices.
- **Company-wide CSV defaults:** the approved standard values below apply to **every company Mercari Shop**, unless a product-specific condition, platform restriction, or explicitly approved batch override requires a different value.
- **Shop/batch configuration:** target shop identity, actual Seller eligibility, valid shipping IDs and product-specific pricing must still be resolved at runtime; these do not change the company-wide standard defaults.

## Canonical sources and evidence status

| Source | Purpose |
|---|---|
| [Official CREATE CSV guide](https://support.mercari-shops.com/hc/ja/articles/8859698858649) | Column semantics, mandatory/conditional fields, limits, samples, masters |
| [Official image batch upload guide](https://support.mercari-shops.com/hc/ja/articles/10202904748057) | Image file and URL requirements |
| [Official CSV error guide](https://support.mercari-shops.com/hc/ja/articles/10206678157721) | Headers, encoding and import errors |
| [Official category import troubleshooting](https://support.mercari-shops.com/hc/ja/articles/10205928980889) | Category master ID and exact case |
| [Official bulk publication troubleshooting](https://support.mercari-shops.com/hc/ja/articles/10245492721433) | Image/category prerequisites for publication |
| [Official UPDATE CSV guide](https://support.mercari-shops.com/hc/ja/articles/60017371839513) | Separate UPDATE semantics; do not reuse CREATE assumptions |

**Product #312 fixed CREATE CSV evidence (Sponsor decision 2026-11-13):** user-supplied `product_import_template_sample.csv` is the sole versioned CSV contract for this product: 88 columns in original order, UTF-8 BOM, CRLF; SHA-256 `66be37da22f320151af00bd40b05d64d74118c91be70b1b36952c2427d910829`. Preserved at ChatGPT Library `/Retailpulses/Giga-Mercari-POC/product_import_template_sample_20261113.csv`. This is an accepted product input; do not require another template or remote byte comparison as a development gate. Separate products can maintain their own templates.

**Correction (2026-11-13):** The earlier draft text about `SKU1_同時購入可能数` being required was unsupported by the Sponsor-selected 88-column CREATE CSV template. That field is **absent** from the product fixture and is not a required output for #312. The old sentence was a draft assertion, not an approved company rule. The template itself is the controlling contract for this product.

**Scope:** This guideline covers shared platform semantics and operating defaults; sections referring to Seller identity, upload checks and reconciliation do **not** add product functions to the independent offline #312 exporter. The product remains shop-agnostic (no Shop selector, Seller lookup/receipt/publishing or Canonical integration).

## Canonical business rules (BUS-MER-001–008)

| ID | Rule | Acceptance / control |
|---|---|---|
| **BUS-MER-001** | CREATE CSV adds new Mercari products; UPDATE CSV is a separate operation. One CSV row represents one platform product, with up to 10 SKU variants; max 10,000 products per upload and only the first 1,000 previewed when over 1,000. PC Seller Web is used. | Keep CREATE/UPDATE/publishing actions separate. Do not automatically equate internal SPU/product/variant entities with a Mercari product row. |
| **BUS-MER-002** | For workflows that actually interact with a Seller tenant, establish the correct destination and protect against accidental duplicate publication. An internal item code is not a Mercari Product ID. | The **offline, shop-agnostic #312 CSV generator does not query Seller or store upload outcomes**; the operator controls the downstream import. Other seller-integrated workflows may require duplicate checks and reconciliation. |
| **BUS-MER-003** | Required and conditionally required columns come from the current official **CREATE** template; do not infer CSV schema from GraphQL/API payloads. | Pin source URL, retrieved time, SHA-256, raw header, encoding and relevant master versions. Check CSV quoting, row alignment and encoding; fail closed on schema mismatch. |
| **BUS-MER-004** | `商品名` required, at most 130 characters; `商品説明` optional, at most 3,000; `販売価格` required, ¥300–¥9,999,999, common to all SKUs in one product; `カテゴリID` required for publishable registration and must use the current category master ID. | Validate final rendered copy, price, approved category mapping and any batch-specific copy policy. Do not substitute category labels or legacy numeric category values. Other publishing channel limits may differ. |
| **BUS-MER-005** | Up to 20 images per product; `商品画像名` accepts an uploaded filename or a platform-accessible URL. jpg/jpeg/png, per-image limit 8 MB; local bulk image upload total at most 1 GB (as reviewed). Missing images may permit draft handling but not completed publication. | Preserve approved image order; verify type, size, naming/upload evidence and URL accessibility. Never export local/private image paths. |
| **BUS-MER-006** | `SKU1_在庫数` required. Item management code is optional, ≤50 ASCII letters/digits/`-`/`_`; JAN optional ≤14. Up to SKU1–SKU10; optional brand uses master ID. | Validate each SKU field and actual stock; do not invent inventory or silently default unknown values. Treat the simultaneous-purchase ambiguity as template/Seller validation, not grounds to fabricate 1. |
| **BUS-MER-007** | Official condition, delivery method, ship-from region, dispatch lead time, visibility, shipping payer and conditional fields use platform codes, not API enums. Buyer-paid shipping requires `送料ID` from the selected shop's configuration. | Apply the **company-wide defaults** below to every shop, then validate eligibility and conditional fields for the target shop. Record any authorized exception explicitly. |
| **BUS-MER-008** | Missing images or category can result in a draft-only outcome; it does not represent completed publication. Platform upload history retains CSV files for only 7 days (as reviewed). | For **offline #312**, distinguish complete CSV candidates from missing-field rows and persist run/export evidence; do **not** track `UNKNOWN_OUTCOME` or `PUBLISHED`. Seller-integrated workflows may track those states separately. |

## Official field reference (not an exact header fixture)

| Field | Rule |
|---|---|
| `商品画像名` through `商品画像名_20` | Up to 20 image filenames or accessible URLs; image required for completed publication |
| `商品名` | Required; ≤130 characters |
| `商品説明` | Optional; ≤3,000 characters |
| `SKU1_種類` | Optional variant name |
| `SKU1_在庫数` | Required, even when no `種類` is given; use actual stock |
| `SKU1_商品管理コード` | Optional; ≤50 allowed ASCII characters |
| `SKU1_JANコード` | Optional; ≤14 characters under platform rules |
| `SKU1_catalog_id` | Optional; official Catalog Master identifier |
| `SKU2`–`SKU10` columns | Use only when the platform product has multiple types; all share the same selling price |
| `ブランドID` | Optional; current brand master identifier, not brand name |
| `販売価格` | Required; ¥300–¥9,999,999 |
| `カテゴリID` | Required for completed publication; string ID from current category master |
| `商品の状態` | Required; 1–6 |
| `配送方法` | Required; 1–6, subject to seller eligibility |
| `発送元の地域` | Required; official prefecture code (e.g., Tokyo `jp13`) |
| `発送までの日数` | Required; official numeric code 1–5 |
| `商品ステータス` | Required; 1 non-public, 2 public |
| `配送料の負担` | Required; 1 seller-paid, 2 buyer-paid |
| `送料ID` | Required for buyer-paid shipping; selected shop's shipping fee configuration ID, not a yen amount |
| `保証付き整備品`, `メルカリBiz配送_クール区分`, `販売チャネル` | Conditional on product/program/shop/delivery eligibility; no fabricated defaults |
| `発売日`, `予約受付開始日`, `予約受付終了日`, `キャンセル期限`, `お届け予定` | Conditional on reservation product; derive only from an approved reservation offer |

The current official template may include additional fields. The actual CSV header, required/conditional fields and ID masters always override this human-readable reference when the platform changes.

### Platform code reference (as reviewed 2026-11-11)

- `商品の状態`: `1` 新品、未使用; `2` 未使用に近い; `3` 目立った傷や汚れなし; `4` やや傷や汚れあり; `5` 傷や汚れあり; `6` 全体的に状態が悪い.
- `配送方法`: `1` 未定（出品者手配）; `2` クール便; `3` らくらくメルカリ便; `4` クールメルカリ便（冷蔵）; `5` クールメルカリ便（冷凍）; `6` メルカリBiz配送. Eligibility and active configuration must be checked per shop.
- `発送までの日数`: `1` 1–2日; `2` 2–3日; `3` 4–7日; `4` 90日以内; `5` 8–14日.
- `配送料の負担`: `1` 送料込み（出品者負担）; `2` 送料別（購入者負担）.
- `商品ステータス`: `1` 非公開; `2` 公開. **Company-wide default: `2` (公開)**, unless an explicitly approved batch exception calls for non-public registration.
- `発送元の地域`: use current prefecture master code, not display name.

For Biz cold-chain, m department and reservation-specific enumerations, consult the applicable current official template and eligibility rules. Windows guidance historically recommends Shift-JIS and other platforms UTF-8; verify that the selected Seller import accepts the actual encoded file.

## Company-wide default CREATE CSV policy (all shops)

The values below originated from the existing operational listing CSV policy and are **approved for all company-operated Mercari Shops**, not merely one shop. They are company choices, not mandatory Mercari platform defaults.

| CSV field | Company-wide default | Meaning / handling |
|---|---|---|
| `商品ステータス` | `2` | 公開; export only fully validated publish-ready rows |
| `商品の状態` | `1` | 新品、未使用; do not misrepresent a product that is not new |
| `配送方法` | `1` | 未定（出品者手配）; check that the destination Seller supports this method |
| `発送元の地域` | `jp13` | 東京; verify fulfillment origin for products shipped elsewhere |
| `発送までの日数` | `2` | 2–3日; override when the actual fulfillment promise is different |
| `配送料の負担` | `1` | 送料込み（出品者負担）; sale price must follow the approved shipping-inclusive pricing policy |

Apply these defaults consistently across shops. Only override a value for a documented product fact, a current Seller/platform restriction, or an explicitly approved shop/batch policy exception. Record the effective values and exception reason in the run manifest; do not silently substitute one shop's configurations for another. Pricing, inventory, categories and images remain product- or shop-resolved facts, not universal defaults.

## Shop-agnostic batch preparation and export

1. **Select target:** Explicitly record shop identity, operator, date, CREATE intent and approved batch scope. Resolve seller permissions, available delivery options and shipping IDs in that shop.
2. **Load source data:** Reuse existing authoritative product/copy/image/variant/price/stock/category data and any approved edits. Record source versions. Do not silently regenerate or overwrite reviewed content.
3. **Pin template and masters:** Retrieve actual CREATE CSV sample plus required category/brand/catalog masters, save original versions and hash; generate from the real header.
4. **Apply shared policy and resolve exceptions:** Use the company-wide CREATE defaults above for publication state, condition, dispatch origin, lead time, delivery method and shipping payer; verify real product facts and target Seller eligibility, documenting justified overrides. Resolve pricing, product grouping and conditional fields from authoritative inputs.
5. **Validate candidates:** Check duplicate listings and previous imports; title/description, accurate stock, price range, category master, image limit/accessibility, SKU characters, conditional fields and CSV encoding.
6. **Export ready rows only:** The operator-uploadable CREATE CSV contains only `CSV_READY` entries. Missing image, category, price, stock or other mandatory condition means **exclude from final upload CSV** and record in manifest/gaps. `DRAFT_ONLY` may be supplied as a **separate, clearly labeled draft artifact** only when intentionally requested; never mix it into a publish-ready file.
7. **Review and upload:** Operator validates destination shop and final preview before initiating import. CSV generation alone does not authorize platform publication.
8. **Reconcile:** Record seller result per row, published listing ID or precise failure, plus unresolved/unknown outcomes. Do not retry unknown submissions as CREATE without duplicate investigation.

**Suggested outputs:** `<shop-key>_create_listings_YYYYMMDD.csv`, `manifest.csv`, `gaps.csv`, and `run-evidence/` with template/master fingerprints, source snapshot, validation results and import reconciliation. File naming may be overridden by an implementation-specific contract; the semantic separation is mandatory.

### Minimum manifest fields

`run_id`, `shop_identity`, `source_item_code`, `source_variant_id`, `csv_row`, `status`, `reason_codes`, `template_sha256`, `source_snapshot`, `export_sha256`, `seller_import_reference`, `listing_id`, `reconciled_at` (as applicable). Treat identity and reference fields as opaque values; do not invent them. A run should retain enough evidence to reproduce and audit its input/output decisions.

### Error and readiness states

| State | Meaning | Permitted action |
|---|---|---|
| `CSV_READY` | All required fields and target-shop checks pass; no known duplicate/unknown submission | Include in reviewed CREATE CSV |
| `DRAFT_ONLY` | Platform may accept an incomplete draft, but publication prerequisites fail | Exclude from upload-ready CSV; optional separate draft-only artifact |
| `BLOCKED` | Missing/invalid stock, price, schema, category, image, permissions, or other essential input | Exclude; record precise failure reason |
| `UNKNOWN_OUTCOME` | Prior upload or platform outcome unconfirmed, or duplicate check inconclusive | Exclude from CREATE pending reconciliation |
| `PUBLISHED` | Seller platform confirms actual listing after import | Mark only after seller-side reconciliation, never at export |

## Governance and implementation separation

- This is a **shared business guideline**, not an instruction to build an exporter, database, UI, migration, API publication pathway, or shop-specific workflow.
- Existing applications or one-off agents may implement this contract using approved read-only sources and offline export. Implementation requirements, sprint ownership and deployment evidence stay in their respective repository issues/design packs; do not embed a single shop's sprint as the canonical process.
- Changes to platform facts require fresh evidence and revision of the affected BUS-MER rule. Changes to operating defaults require explicit business approval and a clear scope (company-wide, shop or batch).
- The approved company-wide CSV defaults in this guideline apply to **all shops**. Historical shop-specific exceptions and batch decisions remain in their own issue/run record and do not override the shared policy for other runs.
