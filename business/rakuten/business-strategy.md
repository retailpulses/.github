# Rakuten Business Strategy — Homebliss

> Owner: Retailpulses / E-commerce Business · Status: Approved direction, execution evidence pending · Updated: 2026-11-14 JST
> Scope: 楽天市場「ホムブリス」 (homebliss). This is the business strategy, not the RMS technical contract or promotion runbook.

## 1. Decision and business thesis

**Decision:** Continue operating Rakuten into the second contract year. Do not plan an exit merely because of plan fee changes. The first-year ¥100,000 sales requirement has **already been met** (business-owner confirmation, 2026-11-14). This assertion should be reconciled to RMS sales/contract evidence before being used in an external eligibility filing; do not infer that it proves all renewal terms are satisfied.

**Thesis:** Grow Homebliss through (1) low-friction, high-quality catalog expansion using CSV and existing integrations, and (2) disciplined, measurable participation in Rakuten promotion mechanisms. Scale profitable revenue, not gross listing count or promotional spend alone.

The shop began operations in 2026-04. Current RMS plan: **がんばれ！プラン** (observed 2026-11-14). Confirm contract renewal date, second-year fee schedule and any action/notice requirements directly from the current RMS contract before acting; this strategy is not a legal interpretation of the contract.

## 2. Key bet 1 — CSV-enabled listing scale

**Business assumption to verify:** CSV bulk listing becomes free/available for our account from **January 2026** (owner-stated strategy assumption; confirm exact start date, entitlement, limits and whether this is CSV upload, option fee waiver or another change in the Rakuten contract/RMS). As of this document's date January 2026 is in the past: do not represent the feature as a future launch. Check the account's present CSV entitlement.

Use CSV-first batch listing/update where supported, complemented by existing RMS APIs for bounded readback and ongoing inventory operations. Avoid building a new listing stack before assessing current assets.

- Expand the sellable assortment based on category demand, unit economics, source-data quality, inventory reliability and operational throughput.
- Batch pipeline: source product/variant facts -> Rakuten-specific title/copy, image/variation/SEO mapping -> SKU/manage-number and duplicate checks -> price/inventory/prohibited-claim checks -> CSV validation/preview -> bounded upload -> RMS readback and discrepancy reconciliation.
- Never equate a successful generated CSV with published, purchasable listings.
- Prioritize improvements to existing catalog quality before indiscriminate expansion; avoid duplicate listings sharing the same physical stock without sound inventory mapping.
- Measure active/purchasable SKU growth, publish pass rate, per-listing contribution, traffic, conversion, inventory exceptions and operator time per batch. Quantitative growth targets remain open until a current baseline is verified.

## 3. Key bet 2 — Promotion as a repeatable growth engine

Promotion is a **portfolio of tested mechanisms**, not blanket discounting. Distinguish **event** (Super SALE, お買い物マラソン), **mechanism** (points, coupons, Super DEAL, RPP, SALEサーチ), and **campaign instance** (our approved participation and assets).

- Maintain a rolling calendar of deadlines and eligible opportunities, informed by RMS announcements and the existing historical email archive.
- For each proposed campaign: hypothesis, nominated SKUs, contribution economics (including platform/points/DEAL fees, coupon overlaps and supply costs), inventory gate, submission deadline, approval, asset/published readback, and post-campaign sales/traffic/conversion review.
- Start with narrow tests and reinvest only where incremental contribution is credible. Do not buy nominal GMV with negative contribution.
- Example opportunity: RMS announcement 2026-11-04 offers a trial subsidy of **10% of DEAL points cost** for up to two eligible selling products per month across Nov-Dec 2026, with Nov 30 check deadline; it is **not** a 10% GMV subsidy, and DEAL's separately stated 10% listing fee remains. Participation is optional and requires separate application and product approval.
- Existing promotion POC already emphasizes read-only RMS inspection, overlap/margin gates, actual banner publication verification, and campaign outcomes.

## 4. Operating prerequisites and risks

1. **Shop status/compliance:** On 2026-11-14 RMS showed `改装中`; resolve the root cause and confirm store reopening eligibility before scaling campaigns. Track regulatory/compliance case in [inbox #443](https://github.com/retailpulses/inbox/issues/443); do not assume the reason for remodeling mode without case evidence.
2. **Catalog quality:** Existing listing imagery/copy issues and Catalog 2.0 backlog should be part of the scale gate, not deferred indefinitely.
3. **Inventory:** Duplicate seller SKU/manage-number relationships have previously caused missed sync and oversell. Batch creation must not bypass inventory controls.
4. **Promotion economics:** Distinguish platform fees, optional advertising/point subsidies, and product contribution; do not double-count fees or rely on unverified subsidy eligibility.
5. **Contract:** Confirm renewal window, annual/plan fee changes, CSV fee schedule, and any mandatory threshold from primary contract material.
6. **Execution safety:** Production RMS writes and paid campaigns require deliberate narrow approval and readback. Strategy approval does not authorize promotions or mass publication.

## 5. Execution priorities and evidence gates

| Priority | Work | Completion evidence |
| --- | --- | --- |
| P0 | Resolve RMS 改装中 / regulatory status | RMS status and storefront independently verified; open case disposition |
| P0 | Read current contract/CSV entitlement | RMS contract, billing and CSV option readback; annual cost and renewal action recorded |
| P1 | Inventory current listing/export/quality stack | Ownership, actual deployed capability, gaps, duplicate risk and readback documented |
| P1 | Establish listing throughput baseline and first bounded batch | CSV and live RMS counts, quality gate, discrepancy log, observed contribution |
| P1 | Establish promotion test cadence | Campaign brief, per-SKU economics, submission and published evidence, postmortem |
| P2 | Scale successful catalog categories and repeatable promotion mechanisms | Incremental contribution, conversion and operational load trend |

## 6. Existing GitHub assets to harvest (references, not duplication)

### Business and promotion sources
- [inbox/promotion/README.md](https://github.com/retailpulses/inbox/blob/main/promotion/README.md): existing canonical promotion domain, taxonomy, lifecycle, economics and campaign artifacts. **Reuse as promotion SSOT.**
- [inbox/promotion/calendar/2026/rakuten.md](https://github.com/retailpulses/inbox/blob/main/promotion/calendar/2026/rakuten.md): historic 105-message calendar evidence. **Use as historical signal, not presumed future dates.**
- [store-ops Rakuten promotion POC](https://github.com/retailpulses/store-ops/blob/main/docs/poc/2026-10-13-rakuten-promotion.md) and [#209](https://github.com/retailpulses/store-ops/issues/209): calendar/readback/queue observations. **Harvest validated operating gates to implementation docs.**
- [inbox #34](https://github.com/retailpulses/inbox/issues/34): older keyword/paid-ad experiment. **Review outcome before treating as validated acquisition playbook.**

### Listing, integration and safety
- [inbox #170](https://github.com/retailpulses/inbox/issues/170) and [#179](https://github.com/retailpulses/inbox/issues/179): existing Rakuten catalog quality upgrade and execution backlog. **Continue/measure; do not reset completion tracking.**
- [inbox #64](https://github.com/retailpulses/inbox/issues/64): images and listing quality debt; [#205](https://github.com/retailpulses/inbox/issues/205): Rakuten-specific copy/listing adapter design.
- [store-ops listing CSV provider](https://github.com/retailpulses/store-ops/blob/main/packages/listing_review/providers/rakuten_catalog_csv.py): actual RMS-download-backed read-only CSV provider, **not evidence of bulk-upload implementation**.
- [boutique-listing Rakuten adapter](https://github.com/retailpulses/boutique-listing/blob/main/src/platforms/rakuten/index.js): explicitly labels CSV draft export as not implemented in retrieved code; **verify HEAD/deployment before assigning implementation**.
- [RPagentOS Rakuten import](https://github.com/retailpulses/RPagentOS/blob/main/src/packages/listing-import/import-rakuten.ts): existing import logic; distinguish internal data import from RMS upload.
- [CatalogSync #233](https://github.com/retailpulses/CatalogSync/issues/233) and [RPagentOS #137](https://github.com/retailpulses/RPagentOS/issues/137): duplicate listing/SKU identity and oversell risk. **Treat as safety gate.**
- [.github Rakuten RMS reference](https://github.com/retailpulses/.github/blob/main/references/rakuten/rms-api.md): foundational API reference index; **do not duplicate API dictionary here**.
- [store-ops #191](https://github.com/retailpulses/store-ops/issues/191): canonical Rakuten integration/promotion discovery.

## 7. Rakuten GOLD — promotion content infrastructure (research, not a third growth bet)

**Recommendation (2026-11-14):** Use Rakuten GOLD selectively as a no-license-fee HTML/asset hosting option for campaign landing pages and product/category navigation content. It is an *enabler of Key Bet 2 (promotion)* and, secondarily, Key Bet 1 (listing discovery), **not** a standalone investment thesis or justification for an elaborate custom storefront.

### What is currently feasible vs retired

| Area | 2026 assessment | Business implication |
| --- | --- | --- |
| GOLD hosting | Free optional RMS hosting for HTML and related files; public references indicate initial 100 MB, expandable in increments to a 1 GB limit (verify our account entitlement) | Low recurring hosting cost; operator/developer maintenance still costs time |
| Campaign/category/feature landing pages | GOLD remains usable for pages other than store top; subject to Rakuten marketplace rules and mobile rendering | Candidate for curated sale collections, seasonal home/living themes, and themed category navigation |
| Store top page (smartphone and PC) | Legacy GOLD store-top capability ended; smartphone transitioned earlier and PC was unified to RMS new store-top by late 2025 | **Do not build the store homepage on GOLD.** Use RMS 新店舗トップページ and link to suitable internal feature pages |
| Product detail, SKUs, inventory, prices | Remain owned by RMS catalog and existing integrations; GOLD does not replace normal product publishing or commerce APIs | No second product/inventory source of truth |
| Scripted widgets/external services | Vary by placement, security rules and current RMS policies | Do not assume unrestricted JS, iframe, cross-domain calls or third-party pixels |

**Sources / verification date (2026-11-14):**
- [2026 GOLD functionality and end of top-page support](https://www.5springs.co.jp/blog/rakutengold/) (specialist account; validate any consequential restriction against logged-in RMS help).
- [New RMS store top implementation context](https://www.5springs.co.jp/blog/%E3%80%90%E6%A5%BD%E5%A4%A9%E3%80%91%E6%96%B0%E5%BA%97%E8%88%97%E3%83%88%E3%83%83%E3%83%97%E3%83%9A%E3%83%BC%E3%82%B8%E3%81%A7%E5%9B%9E%E9%81%8A%E7%8E%87%E3%82%92%E9%AB%98%E3%82%81%E3%82%8B%E6%A7%8B/) (2026-01-06).
- [RMS Service Square page-production provider](https://service.rms.rakuten.co.jp/product/0061-0001/1) (Rakuten-hosted provider FAQ distinguishes RMS top page from GOLD-hosted scripts/assets).
- [2026-11-01 GOLD cost/capacity summary](https://markenote.jp/article/2849) (secondary source; account-specific contractual conditions prevail).

### Suggested operating model

1. **RMS is the transactional storefront / SSOT.** Continue managing product pages, variants, price, images where relevant, stock, and the new responsive top page through RMS and existing product integrations. Use GOLD only to present navigational/marketing content and link back to approved Rakuten product/category URLs; do not redirect shoppers outside Rakuten.
2. **One reusable campaign-page template**, not a bespoke website or page builder: hero banner, date/eligibility text, curated category blocks, product tiles with valid Rakuten links, compliance footer. Make the layout mobile-first, fast-loading, accessible, and readable without unsupported embeds.
3. **Data ownership:** campaign selection, offer economics, approved copy, asset version, active window, and status remain with the promotion workflow in `inbox/promotion/`. Product availability and price must be sourced from live RMS/catalog readback. If static prices are displayed, define publication and withdrawal checks to prevent stale/misleading claims.
4. **Publishing safety:** draft -> internal preview -> legal/offer/stock check -> explicit operator approval -> publish/upload -> browser validation on mobile and desktop -> campaign-end withdrawal/expiry. Keep prior version/rollback path. FTP credentials must remain in secrets management, never GitHub Markdown.
5. **Reuse existing assets:** link campaign scheduling and banner evidence from [commerce-lab Rakuten daily routine](https://github.com/retailpulses/commerce-lab/blob/main/services/rakuten/docs/RAKUTEN_DAILY_ROUTINE.md), [store-ops Rakuten promotion POC](https://github.com/retailpulses/store-ops/blob/main/docs/poc/2026-10-13-rakuten-promotion.md), and the [promotion SSOT](https://github.com/retailpulses/inbox/blob/main/promotion/README.md). The daily-routine evidence notes banners must match the actual configured points multiplier and must be removed after the promotion.

### Priority and experiment

- **P0 prerequisite:** Resolve current `改装中`/compliance blocker before live public campaign pages.
- **P1 validation:** In RMS confirm GOLD is enabled or can be requested, account storage/quota and upload method, current allowed content placement, no off-platform links, and what can be embedded in current RMS new top page. Verify public URL, image behavior, mobile rendering and analytics availability without production changes.
- **P1 trial:** Build **one** seasonal or sale feature page, with a small curated set of in-stock, positive-contribution products. Link it from an approved RMS module/banner during a single campaign. Use approved copy; no assumed discount, point multiplier or inventory guarantee.
- **Success criteria:** Published page and links render correctly on mobile/PC; no stale offer after end date; operator update/rollback is feasible; attributed visits/clickthrough and downstream orders/contribution can be measured sufficiently to compare with the same promotion without the page.
- **Kill/pause criterion:** If page creation requires recurring manual updates without measurable incremental contribution, revert to RMS-native banners/product modules. Listing quality and campaign economics rank above decorative complexity.
- **Deferred:** Rich custom homepages, fully automated GOLD deployment, broad dynamic product feeds, third-party page-builder subscriptions, and customer-facing custom shop software.

**Key distinction:** GOLD is free hosting, **not free development, guaranteed ranking improvement, or an alternative to RMS API/CSV.** Do not implement any new automation until the first manual/template trial demonstrates value.

## 8. Open questions (not decisions)

- Confirm the precise second-year renewal terms and any explicit action required in RMS.
- Confirm January 2026 CSV entitlement and fee waiver from account-specific primary evidence; availability alone does not guarantee practical batch-publish capability.
- Verify shop status and compliance case outcome; verify current active catalog counts and monthly P&L baseline before setting numerical targets.
- Decide initial promotion investment budget and experiment-level minimum contribution rule after actual fee reconciliation.

**Ownership boundary:** This strategy is canonical under `.github/business/rakuten/`. Campaign schedules/results stay in `inbox/promotion/`; engineering delivery and runtime evidence stay in their owner repositories. Harvest by links and tightly scoped decisions, not copying entire operational histories.
