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

## 7. Open questions (not decisions)

- Confirm the precise second-year renewal terms and any explicit action required in RMS.
- Confirm January 2026 CSV entitlement and fee waiver from account-specific primary evidence; availability alone does not guarantee practical batch-publish capability.
- Verify shop status and compliance case outcome; verify current active catalog counts and monthly P&L baseline before setting numerical targets.
- Decide initial promotion investment budget and experiment-level minimum contribution rule after actual fee reconciliation.

**Ownership boundary:** This strategy is canonical under `.github/business/rakuten/`. Campaign schedules/results stay in `inbox/promotion/`; engineering delivery and runtime evidence stay in their owner repositories. Harvest by links and tightly scoped decisions, not copying entire operational histories.
