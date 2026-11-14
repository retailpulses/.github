# B2B Business Discovery — Order and Inquiry Evidence Baseline (Draft, 2026-11-14)

**Status:** Research Draft / not approved as business policy · **Evidence:** PARTIAL · **Owner:** Business Development + Commerce Operations · **Intent:** assess a distinct B2B go-to-market model from existing Japanese ecommerce demand. This is **not** a decision to launch a new legal entity, channel, CRM, prices, or production workflows.

## Executive findings

- Queried **live hosted Supabase** project `gqeyfhshxdiyhugvmbuk` (Retailpulses Project), read-only, on 2026-11-14. Source systems: `public.sales_orders` and `public.inquiries`. These are raw operational signals, **not** confirmed merchant/organization identities or an audited financial dataset.
- Order baseline: **6,052 order rows**, **6,027 Mercari** and **25 Rakuten**, covering observed purchase dates **2024-05-26 to 2026-11-13** in Mercari. Rows with `purchase_date is not null` and `line_origin is distinct from 'component'`; one order may have multiple rows.
- Keyword-screened *potential commercial delivery* signals appear in **141 rows** (140 Mercari, 1 Rakuten) = **2.33%** of observed rows. Includes false positives (e.g. “ビル” in residential building names); **do not interpret as 141 validated businesses or B2B transactions**.
- Independently, **206 of 3,414** non-deleted inquiry records have `bulk_purchase` in `inquiry_type` (~6.0%), largely tagged in 2026; this is *lead interest*, not converted orders. Only **5 inquiries record units >= 5**, **3 record units >= 10**; the absence of quantities on other inquiries is not proof that they requested one unit.
- Product title keyword analysis within the **141** heuristic order rows: **58 furniture**, **40 storage**, **7 kitchen**, **2 bedding**, **1 outdoor structure**, **33 other**. Groups are a first-match **title keyword heuristic**, not canonical merchandising taxonomy or evidence of buyer industry.
- Cross-shop repeated names exist: among **5,147 distinct nonblank recipient-or-buyer name strings** (Mercari), **309** appear on >=2 orders; **38** on >=3; **5** on >=5; **57** span >=2 shops; max **6** orders per same exact string. **Names are not stable buyer IDs**: these figures cannot determine unique customers or legitimate repeat rates; commercial status is unverified. Do not copy recipient names to this document.
- A recent **Shop4 10-set dining furniture commercial delivery inquiry** (`WF295444BAA`) demonstrates buyer interest in pallet/unpalletized truck quote and consolidated shipping, but at snapshot date had **not become a verified order**. See [BUS-LOG-001](../suppliers/giga/bulk-commercial-delivery.md) and the underlying Giga/Inquiry evidence.

## Source coverage and data caveats

| Channel/store | Lines | Distinct order IDs | First observed | Last observed | Heuristic commercial delivery rows |
|---|---:|---:|---|---|---:|
| Mercari Shop1 (`WMyisFmhbGWyVAPEwsfirn`) | 1,739 | 1,739 | 2024-05-26 | 2026-11-13 | 53 |
| Mercari Shop4 (`2JMLHBxjiFHDr55jMwA7fs`) | 1,713 | 1,712 | 2026-02-25 | 2026-11-13 | 34 |
| Mercari Shop2 (`ZaMyGWzp6hUdgDh5E9ADob`) | 1,542 | 1,540 | 2025-01-20 | 2026-11-13 | 29 |
| Mercari Shop3 (`2JGrmZqojnBMfdWrtP2xk3`) | 1,033 | 1,033 | 2025-12-03 | 2026-11-12 | 24 |
| Rakuten (`Rakuten`) | 25 | 25 | 2026-06-07 | 2026-10-10 | 1 |

**Corporate accounting boundary:** Shop1/2/4 and Rakuten belong to the company's self-operated sales segment; Shop3 is other-entity sales / service-managed operations and **must not be counted as Retailpulses merchandise revenue**. It can inform anonymous cross-platform demand, if permitted, but segment profitability cannot attribute Shop3 gross sales to our company. No Amazon other-entity sales included. These baselines are operational row counts, not booked sales.

**Quantity quality warning:** among Mercari's 6,027 lines, **382 are quantity=0**, **5,634 quantity=1**, only **11 quantity>1**; Rakuten 25 lines are 24 quantity=1, one >1. No Mercari order line has quantity>=5 in this snapshot. Accordingly neither `sum(quantity)` nor quantity-based B2B size segmentation is reliable without validating source semantics, cancellations and line/splitting policies. **Canceled status** also exists (535 Mercari lines and 13 Rakuten lines matched `order_status ilike '%cancel%'`); no conversion/revenue rate is inferred from gross row counts.

**Coverage and missingness:** `buyer_name` is present in 5,279 of 6,027 Mercari rows; `shipping_name` present in 5,518, with varying completeness across stores. Rakuten buyer_name was empty in all 25 observed rows, while shipping_name was present. This affects candidate screening and repeat matching. Match by name is neither GDPR/APPI-grade entity resolution nor proof of identity.

## Method: lead evidence tiers (not final classification)

- **Tier A — verified commercial transaction (NONE established by this analysis):** explicitly verified organizational purchaser, delivery requirement, paid order, with canonical order evidence and permitted data use.
- **Tier B — strong commercial lead:** active inquiry explicitly requesting business quantities/commercial delivery, address/institution context corroborated; still unconverted or unverified. Example: Shop4 10-set dining inquiry; purchase remains pending.
- **Tier C — weak heuristic lead:** order ship/billing name contains organizational/institution marker OR shipping address text contains business-type marker. Potential false positives; do not identify/approach a private buyer on this evidence alone.
- **Tier D — repeat-purchase candidate:** same normalized name string appears in multiple orders or shops; NOT evidence of business use and may conflate different people/locations. Need a privacy-reviewed account/entity match and transaction validation.

The first-pass row filter included Japanese organizational terms `株式会社`, `有限会社`, `合同会社`, `法人`, `病院`, `医院`, `クリニック`, `介護`, `学校`, `保育園`, `ホテル`, `旅館`, `店舗`, `事務所`, `商店`, `工務店`, `建設`, `センター`, and address terms such as `ビル`, `倉庫`, `工場`, `施設`. **An address containing ビル may be residential**. The filter is intentionally broad and is not validated precision/recall. Source code in the analysis transcript; not persisted as an executable production rule.

### Order-row signal breakdown

| Store | Candidate rows | Candidate rows / all observed rows |
|---|---:|---:|
| Shop1 | 53 | 3.05% |
| Shop4 | 34 | 1.98% |
| Shop2 | 29 | 1.88% |
| Shop3 | 24 | 2.32% |
| Rakuten | 1 | 4.0% (sample too small) |
| **All** | **141** | **2.33%** |

A separate named-field screen identified **44 Mercari rows** with commercial/institutional keywords in shipping/billing name and **100** with address-text keywords, with overlapping rows yielding **140 union matches**. These are candidate records, not unique companies.

### Inquiry funnel signal, not conversion

From `inquiries` (non-deleted):
- 3,414 total; 2,445 dated 2026; 206 classified `bulk_purchase`.
- 2026 Shop4: 1,011 inquiries, **114** bulk-tagged; Shop2: 533 / 42; Shop1: 439 / 26; Shop3: 462 / 23. One additional bulk-tagged row has null inquiry_date.
- Inquiries pre-2026 have zero observed bulk tags; **classification availability/process changes may explain the difference**. Do not interpret 2026 as sudden growth without an audit of tagging coverage.
- `inquiry_order_links` and actual order outcomes were **not yet reconciled**; the 206 are not leads won, paid orders or pipeline revenue.

## Initial business opportunity hypothesis

**Hypothesis:** launch a lightweight B2B *sales operating model* for Japan-based small business establishments procuring multiple furniture/storage/fixture units, especially restaurants, offices, hospitality and care facilities. Buyer desires consolidated delivery, transparent quote, order lead time and reliable arrival more than automatic unit discounts. **Do not equate name/address keyword groups with actual industries.**

**Initial MVP before building a separate software product:**
1. A documented *manual* B2B qualification and quotation playbook: company/establishment type (only if self-declared or public business evidence), use-case, SKU, quantity, warehouse stock, postcode/business unloading constraints, required arrival date, and invoice requirements.
2. Quote both standard-parcel and truck options against **current supplier quote**, with explicit packaging/loading/pallet fees; record `shipping_savings_quoted` and source time, versus **actual** net shipping after supplier settlement. Keep shipping cost and customer shipping charge separate.
3. Confirm supplier prep, booking and transit separately. Do not promise five business days where Giga only commits 1–3 working days warehouse preparation and cannot quote dispatch.
4. Start with Shop4 operational inquiries, then broaden discovery across all company-owned shops; Shop3 only as separately governed demand evidence. Do not make a new shop/legal entity or build a CRM until validated lead volume and contribution economics justify it.
5. Offer a dedicated product page only after stock, terms, listing amount, and freight revalidation. Avoid unapproved price/permission changes.

**Primary KPIs to validate before investment:**
- verified commercial buyers and distinct qualified inquiries per month (not row keywords);
- inquiry-to-paid-order conversion and cycle time;
- order lines/units per paid B2B deal and repeat paid purchase by validated business entity;
- incremental **contribution margin after supplier freight, marketplace fee and handling** (not topline gross sales);
- quoted vs settled shipping savings vs ordinary parcel;
- request-to-quote, order-to-dispatch, dispatch-to-delivery and full order-to-delivery lead times, with missed delivery dates.

## Critical path / next investigations

1. **Data definition and safety:** read the canonical order entity and status definitions. Validate whether `sales_orders` contains split lines, canceled/zero quantity placeholders; separate paid, delivered, refunded and canceled before estimating demand/revenue. Confirm covered stores / fiscal cutoffs.
2. **Entity resolution within authorized systems only:** join order / inquiry evidence using deterministic platform IDs first; normalize exact organization names only with human review. Avoid fuzzy merging solely by recipient name, common buildings or postal address. Store prospect PII in protected operational SSOT, **not GitHub**.
3. **Lead audit:** manually assess a stratified privacy-safe sample of the 141 candidate lines and 206 bulk-tagged inquiries; measure confirmed organizational purchase, false-positive rate and unmet demand. Use consent/appropriate channels for any subsequent outreach.
4. **Commercial economics:** fetch supplier Giga shipment costs / actual settled freight and marketplace fees at order level; distinguish quote from margin. Incorporate truck-delivery lead-time opportunity and failure modes from BUS-LOG-001.
5. **Business decision gate:** only after at least one verified B2B cohort and contribution analysis, choose dedicated B2B offering/landing page, pricing program and operating ownership. No invented TAM, forecast, conversion rate or launch ROI.

## Source and reproducibility

Read-only queries run against hosted Supabase `public.sales_orders`, `public.inquiries` on 2026-11-14. Primary filter: `purchase_date IS NOT NULL AND line_origin IS DISTINCT FROM 'component'`. Count by `sales_channel,source_store_id`, `COUNT(DISTINCT order_id)`; textual candidate marker regex against `shipping_name`, `billing_name`, `shipping_address_1/2`; inquiry tags via `'bulk_purchase'=ANY(inquiry_type)`; repeat profile grouped by exact coalesced shipping/buyer name text (statistics only). The query snapshot did not validate production ETL completeness, platform ownership, duplicate identity nor order semantics. No raw PII or order exports are committed.

**Revalidation triggers:** order model changes, tag classifier changes, reconciliation of bulk inquiries to orders, and actual B2B order/shipping settlements. **Next owner:** Business Development with Order Management data steward for quality assessment.
