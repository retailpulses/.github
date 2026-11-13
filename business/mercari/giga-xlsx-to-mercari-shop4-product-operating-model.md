# Giga XLSX → Mercari Shops CREATE — Shop4 Product Operating Model

**Owner of company/business policy:** `/.github/business/mercari`  
**Owner of product execution:** `retailpulses/store-ops` [Feature #312](https://github.com/retailpulses/store-ops/issues/312) / [design PR #313](https://github.com/retailpulses/store-ops/pull/313)  
**Canonical full PRODUCT critical path:** [Store-Ops P0–P5 delivery-critical-path.md](https://github.com/retailpulses/store-ops/blob/design/giga-mercari-standalone-20261113/docs/products/giga-mercari-listing-web/delivery-critical-path.md)  
**Status:** 2026-11-13 JST · design scope only, no delivery approval or production release.

## Business outcome / throughput

Restore **repeatable Shop4 new-product publication** from Giga ProductsInfo XLSX through an independent operator Web app and reviewed Mercari Shops **CREATE CSV**. Measure actual accepted Seller imports and sustainable item throughput. A generated CSV is not a successful listing. Prioritize a **real verified end-to-end pilot**, then an operator-reproducible Web UX and coverage expansion, not an attempt to solve every Giga taxonomy/Canonical source issue first.

```
Giga XLSX
  -> app upload, item-code/variant and seller-product grouping
  -> company-approved category mapping + image delivery + grounded Japanese copy
  -> evidenced Shop4 price/stock and Seller absence
  -> official CSV preflight; valid-ready rows only + explicit excluded-row manifest
  -> manual Seller import -> import receipt/readback -> repeatable operator workflow
```

## Business release gates and ownership (consumer contract)

| Gate | Business signoff / source | Scope |
|---|---|---|
| Current Seller CSV template, shop and shipping settings | Mercari business / Seller | Exact downloaded CREATE header/encoding + approved Shop4 defaults and required conditional fields |
| Category ID approval | `business/mercari/taxonomy` | Verified official 7,625-ID master; approve just the **pilot category/subtype rules** and explicit family-scoped fallback. Never NPL Category Resolver or universally arbitrary ID |
| Image acceptance | Image delivery owner / standalone export adapter | Public stable authenticated-free direct image URLs, supported format, size validated; never use expiring Giga signed URLs in CSV |
| Copy and commerce | Mercari business / supplier facts | Accurate Japanese title/description, traced supplier facts, seller pricing policy/TCOGS and truthfully sourced integer stock; no hallucinated features, price, or 0 for unknown stock |
| Duplicate CREATE protection | Shop4 Seller evidence | Verified Seller absence; `UNKNOWN_OUTCOME` remains blocked; canonical absence is not Seller absence |
| Pilot real import and repeatability | Shop4 operator + Store-Ops Product Owner | Nonempty approved CREATE CSV when real eligible rows exist, controlled manual Seller import, actual accepted result, idempotent safe retry; then repeat via standalone Web |

**Existing Shop4 settings:** `商品ステータス=2`, `商品の状態=1`, `発送元の地域=jp13`, `発送までの日数=2`, `配送料の負担=1`, `配送方法=1` per [company Mercari CSV/Shop4 policy](listing-csv-and-batch-publication.md), subject to actual Seller configuration verification. Do not misread shop defaults as a source for unknown SKU-specific commercial facts.

## Business exceptions versus overall product gates

- [Giga DQ Issue #110](https://github.com/retailpulses/.github/issues/110): 30 Canonical Product IDs / 89 Variants span contradictory Giga source categories. This is a **subordinate data-quality investigation**, not the PRODUCT critical path. Isolate only affected unresolved SKU rows; do not automatically inherit Product category, assume Giga SPU1, or use fallback to obscure incorrect category.
- 155 missing source-category observations, the 39-Giga-category registry gap and stale October source observations require source repair outside the first pilot. Do not make remediation of the entire supplier catalogue a prerequisite.
- Broad mapping of 111 observed supplier categories and resolving all 978 regex-overlap cases is **coverage scale work**, not required to approve the first narrow pilot mapping. Mapping used for an actual CREATE row must still be approved and source-consistent.
- Existing NPL #306 intake, #307 image/stock/title repair, #311 resolver, and /.github #90 domain consolidation remain separate; **not** standalone app dependencies.
- Do not build a new Canonical Product, Listing or Images SSOT, or create direct Seller publication from this feature.

**Business Definition of Done:** Operator independently processes a real Giga XLSX in the standalone Web UI, sees and corrects evidenced item exceptions, exports official-valid ready-only Shop4 CSV with a full manifest, manually uploads, and attaches an actual Seller import result. Evidence includes original file/source hashes, dictionary/template versions, image URLs, stock/price sources, Shop4 policy revision, Seller duplicate check and outcomes.

For implementation milestones, block reasons, pilot evidence, and next actions see the single [Store-Ops Product Critical Path](https://github.com/retailpulses/store-ops/blob/design/giga-mercari-standalone-20261113/docs/products/giga-mercari-listing-web/delivery-critical-path.md). **No production change is authorized by this business document.**
