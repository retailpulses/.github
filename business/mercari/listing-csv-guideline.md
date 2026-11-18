# Mercari Shops — Listing CSV Guideline

**Status:** Draft / Sponsor Review  
**Owner:** Mercari Store Operations  
**Scope:** All Mercari Shops operated by the company; shop-agnostic CREATE CSV preparation and validation  
**Last source review:** 2026-11-16 JST for UPDATE CSV guidance and error handling; CREATE template/master evidence last reviewed 2026-11-11 JST (revalidate current platform templates before execution)

## Product group management

Product groups use a separate Seller CSV workflow. See [Product group management reference](product-group-management.md) for create, update, unlink and whole-group deletion, and [Shop4 initialization strategy](https://docs.google.com/document/d/1H_x9TSHexYcFmsDYfkqbejhjrE7dMHJ3r2IL1WLI5Hc/edit?usp=drivesdk) for SPU1-first grouping and repair of unsuitable existing groups. Ordinary product UPDATE CSV group fields do not perform these operations.

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

Official [CSV sample](https://guide.mercari-shops-static.com/product_import_template_sample.csv) and [Excel sample](https://guide.mercari-shops-static.com/product_import_template_sample_excel.xlsx) are available as links. **Historical evidence limitation:** the 2026-11-11 review did not verify the original CSV bytes, full header, column order or encoding. The platform page's field listing is **not** an authoritative header fixture. Download and fingerprint the current template and relevant masters before every newly established integration or when versions may have changed.

## Canonical business rules (BUS-MER-001–008, 011–012)

| ID | Rule | Acceptance / control |
|---|---|---|
| **BUS-MER-001** | CREATE CSV adds new Mercari products; UPDATE CSV is a separate operation. One CSV row represents one platform product, with up to 10 SKU variants; max 10,000 products per upload and only the first 1,000 previewed when over 1,000. PC Seller Web is used. | Keep CREATE/UPDATE/publishing actions separate. Do not automatically equate internal SPU/product/variant entities with a Mercari product row. |
| **BUS-MER-002** | Resolve the **actual target shop** at export time. An internal variant or item code is not a Mercari Product ID. | Verify selected Seller identity, existing listings, previously submitted batches, and unknown outcomes before preparing CREATE. Lack of a local mapping is not proof of nonexistence. |
| **BUS-MER-003** | Required and conditionally required columns come from the current official **CREATE** template; do not infer CSV schema from GraphQL/API payloads. | Pin source URL, retrieved time, SHA-256, raw header, encoding and relevant master versions. Check CSV quoting, row alignment and encoding; fail closed on schema mismatch. |
| **BUS-MER-004** | `商品名` required, at most 130 characters; `商品説明` optional, at most 3,000; `販売価格` required, ¥300–¥9,999,999, common to all SKUs in one product; `カテゴリID` required for publishable registration and must use the current category master ID. | Validate final rendered copy, price, approved category mapping and any batch-specific copy policy. Do not substitute category labels or legacy numeric category values. Other publishing channel limits may differ. |
| **BUS-MER-005** | Up to 20 images per product; `商品画像名` accepts an uploaded filename or a platform-accessible URL. jpg/jpeg/png, per-image limit 8 MB; local bulk image upload total at most 1 GB (as reviewed). Missing images may permit draft handling but not completed publication. | Preserve approved image order; verify type, size, naming/upload evidence and URL accessibility. Never export local/private image paths. |
| **BUS-MER-006** | `SKU1_在庫数` required. `SKU1_同時購入可能数` is labeled required but guidance also describes blank as unset; applicable range 1–9,999. Item management code is optional, ≤50 ASCII letters/digits/`-`/`_`; JAN optional ≤14. Up to SKU1–SKU10; optional brand uses master ID. | Validate each SKU field and actual stock; do not invent inventory or silently default unknown values. Treat the simultaneous-purchase ambiguity as template/Seller validation, not grounds to fabricate 1. |
| **BUS-MER-007** | Official condition, delivery method, ship-from region, dispatch lead time, visibility, shipping payer and conditional fields use platform codes, not API enums. Buyer-paid shipping requires `送料ID` from the selected shop's configuration. | Apply the **company-wide defaults** below to every shop, then validate eligibility and conditional fields for the target shop. Record any authorized exception explicitly. |
| **BUS-MER-008** | Missing images or category can result in a draft-only outcome; it does not represent a completed public listing. Platform upload history retains CSV files for only 7 days (as reviewed). | Separate `CSV_READY`, `DRAFT_ONLY`, `BLOCKED`, `UNKNOWN_OUTCOME`, and `PUBLISHED`. Persist export and import evidence; mark `PUBLISHED` only after reconciliation. |
| **BUS-MER-011** | UPDATE is a patch: a product-level change needs `商品ID` plus the changed product field(s); a SKU-level change also needs the exact target `SKUi_ID` plus changed SKU field(s). Some update families have additional required fields. | Start from a fresh seller-side product export, preserve its full header and order, and change only intended fields and required dependencies. Validate the operation-specific field set below; do not treat CREATE requirements as UPDATE requirements. |
| **BUS-MER-012** | Mercari category ID validity and product-category relevance are separate checks. A `カテゴリID` existing in the official master does not prove that it matches the individual product. | For CREATE or an intentional category change, validate the ID against a pinned official master and validate the product-type match using verified product facts and an approved versioned mapping. Do not auto-accept broad `その他` mappings or unresolved/conflicting source categories. A copy/price UPDATE that does not change category must preserve the exported category value and is not, by itself, a category reassignment. |

## Customer-facing copy policy (BUS-MER-009–010)

**Owner-confirmed company rule (2026-11-16):** Apply these rules to every company-operated Mercari Shop, including Shop4.

| ID | Rule | Acceptance / control |
|---|---|---|
| **BUS-MER-009** | Customer-facing copy in `商品名` and `商品説明` must be written in Japanese. English-language sales copy, supplier copy, and English descriptive phrases are prohibited. | Translate or rewrite into natural Japanese. Translate generic color, material, and feature words (for example, `White`, `Black`, `Metal`, `Solid Wood`, `OFF`) where appropriate. Keep Latin-script terms only when they are necessary, factual product identifiers or standardized technical terms (for example, USB, ISOFIX, R129); this exception does not permit English sentences or marketing wording. |
| **BUS-MER-010** | Internal Item Code and SKU values must never appear in `商品名` or `商品説明`, including legacy codes and codes prefixed with explanatory text. | Keep them only in structured internal/product-management fields. Scan copy against current and historical code sources; review code-shaped tokens (for example, `WF194269AAA`) manually so a code is not missed when it differs from the current row's management-code value. |

### Copywriting and review guidance

- Lead the title with the Japanese product category/name, then the most useful differentiators such as size, material, included components, use case, and color/variant. Keep it readable and within the platform's 130-character limit; do not repeat near-synonyms merely to fill the limit.
- Use the description to explain the actual product, its dimensions/materials, practical use, included items, and verified limitations. Prefer concise, product-specific bullets over supplier boilerplate or repeated claims.
- Avoid generic hype such as `大人気`, `数量限定`, `全新品` or absolute safety/quality claims unless the claim is accurate, relevant, and supported. Do not use title space for unsubstantiated popularity or scarcity.
- Write promotions and shipping conditions in Japanese, and include them only when current, accurate, and applicable to that listing. Avoid copy that could be read as a guarantee where eligibility or exceptions apply.
- Remove unresolved placeholders such as `Not Applicable`; fill a value from an authoritative product source or omit the unsupported detail.
- As a pre-export gate, inspect the final rendered title and description for English-language text, internal codes, placeholders, repetition, unsupported claims, and consistency with the structured product fields. A clean CSV schema does not establish copy approval.

These are company copy standards, separate from Mercari's technical field limits. The maximum title/description lengths and current template requirements remain governed by BUS-MER-004 and the active official CREATE/UPDATE template.

## Official field reference (not an exact header fixture)

| Field | Rule |
|---|---|
| `商品画像名` through `商品画像名_20` | Up to 20 image filenames or accessible URLs; image required for completed publication |
| `商品名` | Required; ≤130 characters |
| `商品説明` | Optional; ≤3,000 characters |
| `SKU1_種類` | Optional variant name |
| `SKU1_在庫数` | Required, even when no `種類` is given; use actual stock |
| `SKU1_同時購入可能数` | Official requirement/blank-value ambiguity; validate against template and Seller |
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

## UPDATE CSV — minimum fields for batch changes (BUS-MER-011)

**Official source review:** 2026-11-16 JST. Sources: [Mercari Shops: 商品を一括変更する際のCSVファイルの作り方](https://support.mercari-shops.com/hc/ja/articles/60017371839513), [商品データを一括変更するCSVを読み込むとエラーが表示される](https://support.mercari-shops.com/hc/ja/articles/12829713386521), [CSVで商品を一括変更すると最新状態ではないと表示された](https://support.mercari-shops.com/hc/ja/articles/12263165452185).

### Logical minimum by change type

| Change | Minimum data fields required by the official guide |
|---|---|
| Any product-level field (for example title only) | `商品ID` + the changed product field(s). Example title-only patch: `商品ID`, `商品名`. |
| Any one SKU field | `商品ID` + the exact target SKU ID column (`SKU1_ID` … `SKU10_ID`) + changed SKU field(s). Do not target a variant by row position alone. |
| SKU stock quantity | `商品ID` + target `SKUi_ID` + `SKUi_現在の在庫数` + `SKUi_増減フラグ` + `SKUi_在庫増減数`. Flag `1` adds and `2` subtracts; adjustment amount is a positive integer. |
| SKU type, JAN, or item-management code | `商品ID` + target `SKUi_ID` + the changed SKU field. |
| Product image replacement | `商品ID` + the matching `商品画像更新フラグ_n` + `商品画像名_n`. Flag `2` means changed; use only a previously uploaded filename or accessible URL. Images 2–20 support flag `3` for deletion; image 1 is required and cannot be deleted. |
| Shipping payer / shipping fee setting | `商品ID` + `配送料の負担` + `送料ID`. When the buyer pays shipping, the target shop's valid `送料ID` is required; when the seller pays, the guide says it is unnecessary. |
| Reservation schedule | `商品ID` + `発売日` + `予約受付開始日` + `予約受付終了日` + `キャンセル期限` + `お届け予定`. The dates may be locked by the product's current reservation period. |

The table describes the **logical minimum values**, not permission to invent a smaller CSV schema. Use the latest seller-exported UPDATE file as the physical template: retain its complete header and exact column order; do not delete columns or add columns. Preserve read-only identifiers and snapshot values exactly as exported. Populate the target fields and required dependencies only. Mercari says unchanged values need not be entered, while its error guide warns against deleting or adding columns; therefore the safest contract is full official header + only intentional field changes, with the seller export as the baseline.

### Batch update controls

1. Export the target products from the selected shop immediately before editing. Preserve the downloaded file as the source snapshot and record its date, shop, filters, and SHA-256.
2. Keep one product per row. For a SKU-level edit, preserve the exact `商品ID` and matching `SKUi_ID`; never substitute the internal Item Code/SKU for Mercari's platform identifiers.
3. Do not change snapshot IDs, current stock values (except the documented stock adjustment inputs), registration timestamps, hash, or other read-only fields. Do not change any unrelated product field as a side effect of regeneration.
4. Validate only changed fields plus their documented dependencies. Title ≤130 characters, description ≤3,000; use current enum/master values. Reject half-width spaces in non-title/description fields, malformed numeric values, extra rows, blank rows, added/deleted/reordered columns, and unuploaded image names.
5. Price updates are blocked while a Timesale is active or scheduled. Reservation fields can also become uneditable after their relevant dates.
6. Preview the upload; reconcile each row against the intended diff. Mercari warns that seller-side changes made after export can produce a stale-data warning. If data is stale, stop and re-export/reconcile; proceed with the stale CSV only when an operator explicitly intends to overwrite the newer values.
7. Retain the source export, edited CSV, diff, upload result, and reconciliation evidence. Seller CSV history is shown for 7 days according to the current guide; archive evidence outside the seller UI.

### Batch size discrepancy — unresolved platform fact

The UPDATE guide says download and upload can handle up to **10,000 products**, with only the first **1,000** shown in preview. Mercari's CSV error troubleshooting page separately lists uploading **1,000 or more** products as an error. These official pages conflict. Until the actual Seller UI behavior is confirmed against the current template, keep the operating batch below 1,000 products (maximum 999) and treat larger batches as blocked pending a documented live-UI verification. Do not present the 10,000 limit as a verified safe operating batch size.

## Category ID validity and product relevance (BUS-MER-012)

A category check has two separate gates:

1. **Master validity:** the exact Mercari `カテゴリID` exists in the pinned official Category Master version used for the run, with the expected full category path and current eligibility.
2. **Product relevance:** the category path matches the specific product type supported by verified item facts, under an approved versioned company mapping or documented product-level decision.

Passing the first gate does not pass the second. Do not infer a Giga→Mercari mapping from ID existence, listing title similarity alone, catalog_id, a broad supplier category, or a prior listing's category. The current taxonomy mapping-policy reference is [Giga → Mercari Category Dictionary and Fallback Contract](https://github.com/retailpulses/.github/blob/docs/mercari-catalog-taxonomy-20261113/business/mercari/taxonomy/category-mapping-policy.md); that source is marked **DESIGN REVIEW** and states that no Giga mapping rules have been approved. Its candidate IDs and candidate mappings are not approved production assignments.

Use item-specific evidence when source category observations conflict. Keep raw supplier category fields separate from derived subtype and Mercari category decisions. A known or suspected conflict must remain a row-level review/block state until a unique relevant mapping is supported; do not hide it behind a global fallback. The generic `その他` leaf is not a default mapping. A category change requires a documented mapping/version decision. For a product UPDATE that does not target `カテゴリID`, preserve the seller-exported value and do not rewrite it as an incidental side effect.

Minimum review evidence for a category-changing CREATE/UPDATE: target Shop; product ID / source item key; source category observation(s); verified product type/facts; pinned master SHA and full Mercari category path; exact mapping rule/version or reviewer decision; and the result/exception status. If the master is stale, the ID is absent, or relevance remains ambiguous, stop that row's category change and refresh/resolve the source before export.

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


## Shop4 category-only UPDATE CSV: staged execution contract (2026-11-16)

**Source of truth and separation.** The canonical taxonomy candidate policy is [category-mapping-policy.md](taxonomy/category-mapping-policy.md) and the versioned Giga-to-Mercari candidate table is [giga-to-mercari-category-map-v1.csv](taxonomy/giga-to-mercari-category-map-v1.csv). The item-level review snapshot is [shop4-item-code-to-mercari-category-id-draft-20261116.csv](taxonomy/shop4-item-code-to-mercari-category-id-draft-20261116.csv). The snapshot is **not an approved category registry**: it stores candidate decisions and unresolved items, and must not be interpreted as automatic publishing authority. An approved item-code registry may be promoted only after explicit item-level validation and review, retaining version, reviewer, evidence, source Giga category, Mercari master snapshot and decision date.

**Identity / combo cardinality.** Join Shop4 `SKU*_商品管理コード` to Giga `Item Code` exactly. Aggregate **all** Giga rows for a code (combo product can have multiple component rows); preserve component `Sub-item Code` and conflicting Giga category evidence. Do not choose the first row, strip suffixes without evidence, merge different item codes, or propagate one component's category across an unrelated bundle. A Mercari Listing can have multiple SKU item codes. A category change is a **listing-level** decision. **Simplified Combo rule (approved 2026-11-16):** classify the *whole listing* by its primary marketed product type, not by each component's Giga category. Multiple Giga rows or different component categories do **not** automatically trigger a conflict or manual review. Use title/description and canonical candidates to choose one Mercari leaf ID for the listing. Only escalate when the primary product type is genuinely ambiguous, source identity cannot be linked, or no valid candidate fits. Preserve component evidence for traceability; do not force every component into the same Giga category.

**Resolver and approval.** Run code-only 1-to-1 selection first. Validate category master ID/path and product-family fit, especially scoped `その他`; Giga 10832 remains blocked from deterministic selection. For 1-to-N, allow the agent only the Giga code's canonical candidate set, require actual title/specification evidence, and abstain when ambiguous. Distinguish `DETERMINISTIC_CANDIDATE`, `AGENT_DRAFT`, `REVIEW_REQUIRED`, `APPROVED`, `REJECTED`, `NO_CHANGE`. A draft candidate or existing ID match is not approval. Record reviewer and evidence for each approved decision.

**Minimal UPDATE CSV is not the full product export.** Follow **BUS-MER-011** and the current Mercari Shops UPDATE template, not CREATE fields. For a category-only product-level update, the logical minimum is `商品ID` + `カテゴリID`; verify the current seller-side UPDATE template's **actual header, encoding, field dependencies and upload behavior** before generating an uploadable file. Preserve the exact Seller-exported product identity; never use Giga Item Code as `商品ID`. Do not include `SKUi_ID` unless an actual SKU-level change is intended or the official template requires it. Do not alter copy, price, stock, visibility, shipping, SKU structure, images or any other field.

**Two outputs, never conflate:**
1. **Review manifest** (all Shop4 listings): `商品ID`, current ID/path, proposed ID/path, Giga Item Code(s), source Giga code(s), candidate-set provenance, resolver stage, confidence, rationale, conflict state, reviewer, approval, `export_eligible`, `block_reason`. Preserve unresolved and unchanged rows.
2. **Upload-ready UPDATE CSV**: *only* reviewed, approved, changed, validated and eligible listings, using the verified official UPDATE template and exact product IDs. No unapproved candidate may enter this CSV. A zero-row export is correct when approvals or template evidence are absent.

**Preflight:** snapshot original CSV, Giga XLSX, mapping/master SHAs and current Seller UPDATE template; verify one row per distinct Mercari `商品ID`, approved `カテゴリID` is a valid master leaf and canonical candidate, each listing's SKU set is compatible, current value differs, no unresolved combo conflicts, all required columns present, exact UTF-8/encoding as official template, and no unrelated field differences. Produce dry-run diff, blocked-row report, rollback baseline, upload batch checksum, operator/reviewer, and reconciliation plan. Do not upload until explicitly authorized. After Seller import, reconcile product IDs and actual category values; preserve error CSV and import evidence, and never infer success from upload acceptance alone.

**Shop4 first-run sources:** Shop4 export [2026-11-16 CSV](https://drive.google.com/file/d/1YScThDIlJD_kbbMTGLjopjkkAC4Qb2ma/view); Giga [2026-11-15 XLSX](https://docs.google.com/spreadsheets/d/14W6XqePlDcJkjWpi9NJWSfxy2rpV-jCR/edit); [read-only review folder](https://drive.google.com/drive/folders/13dwjXZQuxz_MYPpRo49P9b0ifD4GHxEW). Implementation tracking: [#133](https://github.com/retailpulses/.github/issues/133), [#134](https://github.com/retailpulses/.github/issues/134).


## Mercari description formatting standard (BUS-MER-013)

**Owner-confirmed rule (2026-11-17):** Apply this rendering standard to customer-facing `商品説明` for all company-operated Mercari Shops. It is a plain-text platform field; do not assume Markdown syntax is rendered.

- **Plain text only:** Do not use Markdown heading markers (`#`), bold markers (`**`), Markdown tables, code fences, or other markup syntax. Such syntax may appear literally to buyers instead of formatting the copy.
- **Section spacing:** Insert exactly one blank line between major sections.
- **Within a section:** Do not insert blank lines between the section heading and its content, between consecutive sentences, or between bullets/items. Keep the section compact and continuous.
- **No decorative whitespace:** Do not add leading blank lines, trailing blank lines, multiple consecutive blank lines, or blank lines merely to make individual bullets look spacious.
- **Readable plain-text labels:** Use concise Japanese section labels and simple symbols such as `■`, `【】`, `①`, and `・` where useful. These are literal characters, not Markdown.
- **Preserve factual content:** Formatting changes must not add unverified specifications, included-item counts, warranty terms, shipping promises, or performance claims. Confirm uncertain facts or omit them.
- **Keep sections purposeful:** Typical sections are product introduction, key features, product specifications, shipping, and purchase notes. Include only sections relevant to the listing.

**Acceptance check:** Inspect the final description as rendered on the public Mercari listing page. It must contain no literal Markdown syntax, exactly one blank line between major sections, and no extra blank lines within a section. The source text and the rendered listing should be visually checked; a CSV/schema validation alone is insufficient.

**Canonical compact example:**

```text
【商品名・商品タイプ】
商品の概要を簡潔に説明します。
購入判断に必要な特徴を続けて説明します。

■ おすすめポイント
① 特徴の見出し
特徴の説明。
② 特徴の見出し
特徴の説明。

■ 商品仕様
・カラー：ナチュラル
・素材：木製＋スチール
・サイズ：幅・奥行・高さ

■ 発送について
・発送目安：1～2営業日
※地域別の追加送料など、適用する条件のみ記載
```

The example is structural only. Populate every value from verified listing data. The standard governs visible spacing: one blank line between sections, none within sections.


## SKU 種類 naming and completeness (BUS-MER-014)

**Owner-confirmed company rule (2026-11-18):** For every SKU that actually exists in a listing, `SKUi_種類` must contain an accurate, non-empty Japanese option name when creating that SKU or intentionally editing its type. This is a company operating standard; the platform may technically accept an empty value.

- Describe the actual distinguishing specification: color, size, capacity, included quantity or type. Do not use marketing claims, promotions, popularity/scarcity language, warranties, internal Item Codes or arbitrary variant letters.
- Follow the current official field limit (the reviewed UPDATE guide specifies 16 characters); confirm the active template before export. Do not truncate a required distinction or invent a specification to fill a blank.
- Align the wording with the product group's `商品省略名` wherever both represent the same option. One listing may contain multiple SKUs: its group short name can describe a listing-level choice while each SKU type describes a finer option. Do not force all SKU names to the same value or copy an inaccurate existing type into the group short name.
- Existing empty or inaccurate type names are a separate cleanup queue. The Shop4 product-group pilot does not require a complete SKU-type rewrite. Leave unrelated existing SKU fields untouched in a group-only batch, and track observed exceptions for subsequent work.
- Unused `SKU2`–`SKU10` slots remain empty. Do not create phantom SKUs or fill all ten type columns merely to satisfy this standard.
- A normal product UPDATE that does not edit SKU type must preserve current SKU data and use the operation-specific patch semantics. An omitted type field in an unrelated patch is not a request to clear it.

Source: [Official product UPDATE CSV guide](https://support.mercari-shops.com/hc/ja/articles/60017371839513). Shop4 pilot-specific short-name length and grouping decisions remain in its [Drive plan](https://docs.google.com/document/d/1H_x9TSHexYcFmsDYfkqbejhjrE7dMHJ3r2IL1WLI5Hc/edit); promote only validated reusable grouping rules after the pilot.


## Customer-facing color names use katakana by default (BUS-MER-015)

**Owner-confirmed company rule (2026-11-18):** Use conventional Japanese katakana as the default for customer-facing color names across all company Mercari Shops. This covers `SKUi_種類`, product-group `商品i_省略名`, and color expressions intentionally authored in `商品名` / `商品説明`.

| Source / abbreviated value | Default display |
|---|---|
| White / 白 | ホワイト |
| Black / 黒 | ブラック |
| Gray / Grey | グレー |
| Light Gray / Light Grey / 薄グレー | ライトグレー |
| Dark Gray / Dark Grey / 濃グレー | ダークグレー |
| Beige | ベージュ |
| Brown | ブラウン |
| Dark Brown / 濃茶 | ダークブラウン |
| Light Brown / 薄茶 | ライトブラウン |
| Natural | ナチュラル |

- Apply the same spelling to group short names and accurate SKU type values whenever they describe the same color. Preserve genuine shade differences and meaningful combinations; do not collapse light/dark/blue-gray into generic gray.
- Do not shorten `ホワイト` to `白`, `ブラック` to `黒`, or `ライトグレー` to `薄グレー` merely to meet a display-length target. Shorten redundant non-color text, simplify the selection axis or split the group while preserving the actual choice.
- Katakana is the default naming convention, not permission to invent a color. Preserve verified official/special color names, material/finish or transparent descriptors where a mechanical transliteration would change the meaning; document the source when an exception is needed.
- Keep names factual and free of marketing terms. Validate the complete field against its active platform limit and the applicable pilot readability target.
- Keep raw supplier/export observations unchanged. Update only the explicitly targeted display fields; a color-rule update does not authorize a blanket rewrite of live listings or existing SKU data.
