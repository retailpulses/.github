# Mercari Catalog Master and Category Master — source registry and harvesting policy

**Status:** Sponsor Review / Draft · 2026-11-13 JST. **Business authority:** `/.github/business/mercari`. No product code or marketplace changes authorized.

## Critical distinction

The user-supplied **`catalog_master.csv` is the Mercari *product catalog* reference**, NOT the marketplace's **商品カテゴリマスタ** for CSV `カテゴリID`. `catalog_id` (13-character catalog product identifier) may be used as optional `SKU1_catalog_id` only after exact product matching; **never** as `カテゴリID`. The uploaded `category` field contains labels, not category IDs.

Official Mercari CREATE CSV guide separately links:
- Catalog Master: https://guide.mercari-shops-static.com/catalog_master.csv
- Category Master (Mac): https://guide.mercari-shops-static.com/category_master_updated.csv
- Guide: https://support.mercari-shops.com/hc/ja/articles/8859698858649

The official document confirms the distinction and calls for exact `カテゴリID` from the Category Master. Download links are references only: the uploaded Category Master bytes have now been structurally verified (details below), but independent official live-byte equivalence is pending. Do not promote it to a validated taxonomy snapshot without obtaining the actual bytes.

## User-supplied Catalog Master snapshot (read-only inspection)

- Local source filename: `catalog_master.csv`; format: UTF-8 CSV with header `catalog_id,category,brand,model_name,product_name,color,storage,network,jancode`.
- Bytes SHA-256: `7443ae48d7ebbe7297c810e2cf8eccf8142a42333dbf531c7e007cc24bf1d6f6`.
- 7,646 rows; 7,646 unique and non-empty catalog IDs; 15 distinct category labels; 53 distinct non-empty brand labels; 4,941 nonempty JANCODES.
- Category distribution: smartphone 3,524; Apple Watch 1,221; iPad 865; MacBook 458; Windows notebook 318; remaining categories are camera/tablet/lens/video.
- **Coverage limitation:** overwhelmingly electronics; no evidenced mapping to Giga furniture, pet or garden products. Do not use this catalog to populate their Mercari category ID.
- Source is user-provided claimed official download. Filename and matching published official link do not by themselves prove original bytes match latest upstream revision. Track `provenance=user_upload`, `source_url`, acquisition timestamp if known, `verified_against_official_bytes=false`.

## Proposed durable repository layout

```
business/mercari/
  masters/
    README.md                           # Snapshot provenance, refresh, versioning, license/size
    catalog/                            # Official product catalog reference snapshots
      <YYYYMMDD>-<sha8>/catalog_master.csv
      <YYYYMMDD>-<sha8>/manifest.json
    categories/                         # Separate official 商品カテゴリ ID master
      <YYYYMMDD>-<sha8>/category_master.csv
      <YYYYMMDD>-<sha8>/manifest.json
  taxonomy/
    category-mapping-policy.md          # Decision contract (in this review PR)
    giga-category-map.v1.csv            # Approved deterministic mapping, only after validated Master
    fallback-category-policy.v1.csv     # Approved category-family fallback only
    mapping-evidence.csv                # Sample-based validation and approval provenance
```

Paths are **proposed**; no original 1.3MB binary/CSV has been checked into this PR. Before checking in raw catalogs, inspect source terms, security, update frequency and repository size. Prefer immutable raw snapshot with exact source URL/SHA and commit only approved compact derived indexes if file license/repo cost prohibits raw copy. Never edit a vendor raw file in place. Raw snapshot and derived dictionaries must be separately versioned.

## Verified Category Master supplied 2026-11-13 JST (supersedes earlier missing-source status)

**Actual uploaded file:** `category_master_updated_sjis.csv`; **actual encoding is UTF-8** (despite `sjis` in filename; decode under cp932 is not correct). Read-only inspection of the exact bytes:

- SHA-256: `30f1c9dc3ee2f2133fe568e28213a392b54e7a5254f72bc2f552f6321895e4ac`
- File bytes: `1,052,296`; header exactly: `カテゴリID,カテゴリ名,カテゴリ名（フル）`
- **7,625 data rows**, 7,625 unique category IDs and **7,625 unique full category paths**; no blank fields; every row has exactly three columns.
- 22 top-level categories, including 家具・インテリア (348), ペット用品 (316), DIY・工具 (400), 車・バイク・自転車 (551), フラワー・ガーデニング (158).
- Hierarchy depths: 2 (23), 3 (1,682), 4 (3,922), 5 (1,850), 6 (148); paths separated by ` > `.
- IDs are case-sensitive alphanumeric strings of lengths 20–22; **do not cast to number** or normalize their case.
- Distinct from uploaded `catalog_master.csv` (7,646 product catalog IDs).
- Provenance: **user-provided official Category Master download, source claimed official**. Validation of internal schema and data uniqueness is complete; independent byte-for-byte comparison to live Mercari download is **not yet complete**. The exact raw file is held in conversation upload, not yet committed into GitHub. Store this SHA as snapshot identifier until immutable raw artifact is published.

**Useful independently read examples**:
- `fv7NAWJqfaqqh7GsP7q2dN` — 家具・インテリア > ソファ・ソファベッド > ソファベッド
- `br6qGALYUhkjvTNDkgBzqK` — 車・バイク・自転車 > 車 > 工具 > ジャッキ > フロアジャッキ
- `2ToirC84G3j2fnUezS8Mh` — ペット用品 > 猫用品 > キャットタワー > 据え置き型キャットタワー
- `UcGCFjG5rAdrqMM88NdkN9` — 家具・インテリア > ベッド・マットレス > ベッドフレーム > シングル

**Next source-governance action:** commit/attach immutable original raw bytes and a JSON manifest under `masters/categories/20261113-30f1c9dc/`, then publish approved Giga mappings keyed to that SHA. The new app can use a versioned local read-only snapshot after release; it must not invent IDs when its snapshot is absent.

## Harvest workflow and acceptance

1. Obtain official **Category Master** download from Seller/official link and exact current **Catalog Master** bytes; record URL, date JST, SHA-256, encoding, complete header, row count, unique IDs, duplicate conflicts, category paths, leaf/non-leaf indicator if supplied, and source/version notes. Fail closed if schema is unexpected.
2. Compare the supplied `catalog_master.csv` hash to official downloaded bytes; if not equal, keep both provenance records, do not claim official-current equality. Product Catalog and Category Master each get distinct type and schema.
3. Normalize CSV to a deterministic, UTF-8, sorted derived index WITHOUT changing official identifiers (case and exact bytes matter). Catalog reference index may key by `catalog_id`, product name, JAN, model for exact match only; Category index must key by actual official `カテゴリID` and path.
4. Run uniqueness, category ID exact string matching, parent/leaf eligibility when known, validity/retirement diffs and 20–50 representative Giga category tests. Store a concise audit with source row evidence; no guessed IDs.
5. Propose one-time Giga → official Category ID mapping and fallback coverage for Shop4, run a dry-run confusion/ambiguity report, approve and tag dictionary version; update business rule index/link.
6. Future refresh: compare upstream SHA/diffs, flag removed/changed IDs, invalidate stale mappings rather than silently resolving to something else; app uses pinned version and checks current Master before CSV export.

## Tool leveraging

- **Catalog Master** optional exact-product enrichment only: JAN/model/brand/product name matching for consumer electronics; never free-text fuzzy attach into `SKU1_catalog_id`, and never Category ID source.
- **Category Master** is authoritative ID validation source for `カテゴリID`.
- **Giga → Mercari mapping dictionary** is Retailpulses-owned business knowledge and **the new standalone #312 application's category decision source**, independent of NPL resolver.
- App reads a versioned, read-only published dictionary from `/.github/business/mercari/taxonomy`, pins mapping/master versions per batch, and records match rule, input facts, reason, selected category ID and fallback flag.

See `taxonomy/category-mapping-policy.md` and standalone app design [store-ops #312](https://github.com/retailpulses/store-ops/issues/312).
