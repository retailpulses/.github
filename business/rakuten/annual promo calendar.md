# Rakuten Annual Promotion Calendar（年度促销经营日历）

- Status: Reference / planning baseline（非自动执行规则）
- Updated: 2026-11-14 JST
- Scope: リテルパルス合同会社运营的楽天市場店「ホムブリス」
- Time zone: Asia/Tokyo
- Owner: Rakuten shop operations
- Purpose: 用于年度备货、上新、活动报名、优惠机制、素材和预算的排期；不是已报名或已上线的活动清单。

## 1. Source of truth and evidence hierarchy

1. **RMS campaign detail / 申込履歴 / official shop notifications**: actual shop eligibility, event windows, application deadlines and registered status. Registration history does not prove banners or coupons are published.
2. **Rakuten official campaign pages**: publicly confirmed event mechanics and dates. Platform-wide consumer promotion does not imply shop participation.
3. **Company evidence**: [2026 Rakuten promotion mail archive](https://github.com/retailpulses/inbox/blob/main/promotion/calendar/2026/rakuten.md), [Sep 2026 Super SALE guide](https://github.com/retailpulses/inbox/blob/main/promotion/platforms/rakuten/events/2026-09-super-sale.md), [StoreOps RMS POC](https://github.com/retailpulses/store-ops/blob/main/docs/poc/2026-10-13-rakuten-promotion.md).
4. **Historical patterns / third-party calendars**: planning assumptions only, never confirmation. Rakuten does not guarantee the entire future-year schedule in advance.

Source separation: this file is a **business-level annual strategy and repeating planning calendar**. Detailed source-mail evidence and individual event/campaign records remain under [inbox/promotion](https://github.com/retailpulses/inbox/tree/main/promotion). Do not create a second SSOT for exact registrations, coupon payloads or execution logs.

## 2. Annual event rhythm (planning, not advance commitment)

| Month | Primary platform event families | Business planning priority | Event-date certainty |
| --- | --- | --- | --- |
| January | 初売り / 新春 campaign; お買い物マラソン | Medium: new-year demand, clearance | Specific future dates need official/RMS confirmation |
| February | お買い物マラソン | Medium: category-level testing | Occurrences vary |
| March | **楽天スーパーSALE**; possible later マラソン | **P0: quarterly anchor** | 2026 Super SALE occurred Mar 4 20:00–Mar 11 01:59; future year unconfirmed |
| April | お買い物マラソン, potentially multiple rounds | Medium: post-sale replenishment | Occurrences vary |
| May | お買い物マラソン; 超ポイントバック祭 when announced | Medium: selective offers | Not guaranteed as an annual fixed date |
| June | **楽天スーパーSALE**; possible later マラソン | **P0: quarterly anchor** | 2026 Super SALE occurred Jun 4 20:00–Jun 11 01:59 |
| July | お買い物マラソン; seasonal/fashion-specific events | Medium | Occurrences vary; category scope must be checked |
| August | お買い物マラソン | Medium: prepare September | 2026 Aug 19 communication already mentioned Oct waves |
| September | **楽天スーパーSALE**; possible later マラソン | **P0: quarterly anchor** | 2026 Super SALE confirmed Sep 4 20:00–Sep 11 01:59 |
| October | お買い物マラソン, ジャンル祭 and event-specific points | High: multiple promotional windows | 2026 Oct 4 20:00–Oct 9 01:59 identified in RMS observation; other rounds require evidence |
| November | **楽天ブラックフライデー**; マラソン / other point events when announced | **P0: year-end acquisition** | **2026 Black Friday officially confirmed Nov 19 20:00–Nov 25 01:59** |
| December | **楽天スーパーSALE**; **楽天大感謝祭** if announced | **P0: year-end peak** | Dec Super SALE historically early month; 2026 exact date not treated as confirmed from official RMS |

Typical Super SALE cadence is March / June / September / December, historically 4th 20:00 to 11th 01:59. **A recurring pattern is not an official advance schedule.** お買い物マラソン occurs frequently (sometimes multiple times per month), with no fixed monthly date or assumed participation. ブラックフライデー is usually in late November; 大感謝祭 is typically a late-December opportunity, pending official publication.

### 2026 checked anchors (JST)

- 2026-03-04 20:00–03-11 01:59: Super SALE (historical event).
- 2026-06-04 20:00–06-11 01:59: Super SALE (historical event).
- 2026-09-04 20:00–09-11 01:59: Super SALE; shop-specific preparation guide records 08-28 10:00–09-04 19:59 as the pre-period.
- 2026-10-14 20:00–10-17 09:59: shop RMS campaign ID **3291832**, 5x point; registered, but banner publishing not verified in POC.
- 2026-10-24: RMS 申込履歴 shows another 5x campaign ID **3293026**; exact eligibility and detailed period not verified by the POC.
- **2026-11-19 20:00–11-25 01:59: Black Friday** (Rakuten official public page; entry 11-12 10:00–11-25 01:59). Shop registration / merchant subsidy and any storefront assets are **not verified**.
- 2026-12: Super SALE and 大感謝祭 are advance **planning watch items**, not shop-confirmed entries as of this revision.

## 3. Year-round recurring opportunity signals

| Signal | Pattern | Planning action / caveat |
| --- | --- | --- |
| **5と0のつく日** | 5, 10, 15, 20, 25, 30 of each valid month (no February 30) | Consider store coupon/points *only* when net economics justify it; customer campaign has separate eligibility and Rakuten Card rules |
| **ワンダフルデー** | Monthly 1st | Check relevance before additional shop-funded incentives |
| **ご愛顧感謝デー** | Monthly 18th | Eligibility is customer/member dependent; no automatic store discount |
| **勝ったら倍** | Conditional on sports results | Not a predictable fixed-date promotion; monitor when relevant |
| **楽天学割 / Super DEAL / 最強翌日配送** | Campaign-specific | Check product eligibility, funded share, periods and enrollment/asset requirements |
| **RMS point campaigns / genre festivals** | Announced by RMS/ECC, variable | Maintain campaign ID, application deadline and registration state separately |

**Event != mechanism != shop campaign instance.** An event (Super SALE) may involve several independently approved mechanisms: 店舗別・商品別ポイント変倍, coupons, Super DEAL, SALEサーチ, price reductions, RPP, paid slots, banners, R-SNS/LINE. The presence of a platform event never automatically authorizes any mechanism.

## 4. Operating rhythm / lead times (internal planning defaults)

| Relative timing | Action | Evidence / gate |
| --- | --- | --- |
| Monthly / rolling 45 days | Review RMS campaign opportunities, ECC mail and official announcements; update the occurrence list | Capture event ID, source, confidence, dates, application deadline, shop eligibility |
| T-30 to T-21 for P0 | Select SKU/category and inventory replenishment plan; reserve operator bandwidth | Baseline sales, expected contribution margin, stock lead time |
| T-21 to T-14 | Select opportunities, prepare application and SALEサーチ candidate products | RMS-specific rules / deadline; avoid assuming every event accepts applications |
| T-14 to T-7 | Draft point/coupon/price/ads budget and banner/creative plan | Calculate combined cost including marketplace fees and stacked incentives; check inventory |
| T-7 to T-3 | Confirm registration results, product eligibility, approved creatives, delivery promises | Approved campaign, source snapshot, no duplicate/overlap |
| T-3 to T-1 | Final go/no-go and publish plan; verify public-facing wording | Explicit approval for price, coupon, ads, customer-facing changes |
| Launch to end | Verify RMS state **and public storefront**; monitor sell-through and cost | A banner widget/editor state is not proof of published campaign |
| T+1 to T+7 | Remove expired creative, reconcile results and document learning | Sales, gross profit/contribution, promotional cost, CVR, returns, stock |

These are **internal suggested lead times**, not Rakuten-imposed deadlines; an RMS-specific deadline always overrides them.

## 5. Commercial and automation guardrails

1. **Separate platform-funded points and store-funded subsidies**: never classify consumer-facing “maximum points multiplier” as company cost without confirmed subsidy split.
2. **Calculate incremental contribution** using real product sale price, cost including supplier shipping (TCOGS), marketplace fees, store-funded points/coupons, additional ad spend and applicable logistics. Record assumptions; do not copy Mercari's shop-specific discount caps as Rakuten rules.
3. **Coupon overlap**: inspect existing RMS coupons and point campaigns; do not double-subsidize the same basket unless explicitly justified.
4. **Data freshness and listing eligibility**: verify SKU sellable stock, delivery SLA, campaign application and SALEサーチ approval before changing prices.
5. **No implied platform execution**: a calendar event, generated coupon draft, RMS application, registered campaign, distributed banner and storefront-published banner are different states.
6. **API automation** may draft/check events, but publication and financial commitments require approved scope and readback. Follow [coupon-template review](https://github.com/retailpulses/RPagentOS/blob/main/docs/development/rakuten-calendar-coupon-templates-review.md); it is a proposal, not blanket execution approval.

## 6. Minimal occurrence record (store outside this annual document)

`event_key | occurrence_id / RMS campaign_id | shop | event window JST | confidence (confirmed/observed/expected) | source_url | last_checked_at | application deadline | applied/registered | mechanisms | budget approval | banner received | published/live_verified | outcome_review`

Record separate source timestamps for RMS, marketing mail, and storefront readback. Do not turn an email announcement into a registered status.

## 7. Recommended annual budget allocation policy (not approved amounts)

- **P0**: reserve preparation capacity first for Mar/Jun/Sep/Dec Super SALE and Nov Black Friday; confirm Dec 大感謝祭 before final allocation.
- **P1**: October and other suitable high-traffic marathon waves, especially when profitable SKU groups are ready.
- **P2**: routine marathon rounds, 5と0の日 and conditional point events, preferably low-overhead or platform-funded when possible.
- Evaluate spending per event using incremental contribution and inventory throughput; no fixed percentage allocation or discount commitment is established here.

## 8. Sources checked

**Internal canonical evidence**
- https://github.com/retailpulses/inbox/blob/main/promotion/README.md
- https://github.com/retailpulses/inbox/blob/main/promotion/calendar/2026/rakuten.md
- https://github.com/retailpulses/inbox/blob/main/promotion/platforms/rakuten/events/2026-09-super-sale.md
- https://github.com/retailpulses/store-ops/blob/main/docs/poc/2026-10-13-rakuten-promotion.md
- https://github.com/retailpulses/RPagentOS/blob/main/docs/development/rakuten-calendar-coupon-templates-review.md

**Public / official**
- Official Black Friday event terms: https://event.rakuten.co.jp/campaign/point-up/blackfriday/
- Rakuten official Super SALE explanation and historic cadence: https://event.rakuten.co.jp/family/story/article/2021/rakuten-supersale-strategy/
- Official 5と0の日: https://event.rakuten.co.jp/card/pointday/
- Historical and provisional event-date cross-check (third party; not authority): https://the-sale.jp/rakuten-sale-schedule/

## 9. Maintenance

- At beginning of each month: owner validates coming 45 days against RMS (including 申込履歴), official announcements and ECC mail; dates migrate from *expected* to *confirmed* only with an exact source.
- At each major P0 event: create/update an event-specific record in `inbox/promotion`; do not overload this annual strategy with execution logs.
- At year-end: review results and update the next year's cadence, preserving historical uncertainty and source links.
