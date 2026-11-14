# TikTok Traffic Strategy for Mercari

**Status:** Business strategy — POC proposed; platform capabilities and results unverified  
**Owner:** Ecommerce / merchandising  
**Updated:** 2026-11-14  
**Source:** [TikTok Content Growth Strategy — Draft (2026-09-18)](https://github.com/retailpulses/inbox/blob/main/system%20design/artifacts/tiktok-content-growth-strategy-draft.md)

## 1. Business objective

Use TikTok organic short-form content as a low-cost product-discovery and qualified-traffic channel for existing Mercari Shops listings. Conversion stays on Mercari. **Shop4 is the first preferred destination for the experiment**, subject to live listing availability, product fit, and correct routing. Do not build a separate TikTok Shop operation for this POC.

Success question: can repeatable content produce measurable outbound product interest at acceptable production cost? Follower growth is secondary. This is a proposed experiment, not an established traffic source.

## 2. Operating model

Canonical product facts and images → product-specific content hypothesis → low-cost creative → fact/compliance review → TikTok publication → tracked destination link (where supported) → live Mercari listing → click/performance review.

Organize creative around product and hypothesis, not around Shop4 identity. Keep other Mercari shops and Rakuten/Amazon destinations possible later; do not silently redirect to a different item. Resolve each destination to the correct live, in-stock listing and maintain a fallback when unavailable.

**Content tiers**
- **T0 (default):** existing product photos + verified specs; Japanese hook, crop/pan/sequence, overlays, CTA and multiple variants. Target high automation; ~90% is an aspiration, not a proven result.
- **T1 (selective):** operator captures short vertical real-product footage (dimensions, operation, capacity, use, components); automated editing. Working assumption: 10–15 minutes of capture per practical SKU, to validate.
- **T2 (exception):** costly shoots for sheds, loft beds or other large products only after sales/margin and T0/T1 evidence justify delivery, setup and labor. Capture reusable footage.

Hypotheses: problem/solution, size-fit, capacity, demo, comparison, FAQ, use case, before/after, value and buying guide. For each SKU test multiple hooks rather than producing a single generic advertisement.

## 3. Mercari-specific go-to-market

- Start from existing hero products and live Shop4 listings, not arbitrary trending products. Select a mix of suitcase, compact home/storage product and a larger storage product if suitable.
- Map every content ID to the exact Mercari listing and product/SKU identity. Mercari listing policy is **one SKU per listing**; do not imply multiple variants are selectable within one listing.
- Copy and video claims must be grounded in canonical product data. Price, stock, warranty, dimensions, shipping and promotional statements must be checked against the live destination before publication.
- Japanese CTA should emphasize the demonstrated benefit and direct the user to the verified listing through a platform-permitted linking mechanism. Do not claim that clickable per-video product links are supported until tested.
- Shop4 priority is a routing preference, not a reason to publish unavailable inventory or use misleading links.

## 4. Attribution and measurement

Proposed routing pattern (not yet confirmed deployed): `TikTok → go.homesbliss.net/p/<content-or-product-id> → Mercari listing`. **Domain and router are proposed from the source draft, not verified live.**

Store content ID, product ID, SKU, hypothesis, tier, creative version, TikTok publication ID, source, destination shop/listing URL, timestamp, clicks and production cost. Keep social publication and performance records separate from canonical Product.

**Observed:** impressions/views, watch/engagement metrics where available, outbound clicks and destination clicks where instrumented.  
**Inferred only:** SKU traffic uplift, sales uplift, halo effects. Mercari orders must not be represented as deterministically attributed to TikTok without an actual compatible attribution mechanism.

Use per-creative click-through and qualified click volume as the initial decision metrics; evaluate production effort alongside results. Set numerical thresholds after baseline observation, not by inventing a target conversion rate.

## 5. Publishing, compliance and controls

Initial workflow: generate → validate product claims → check promotional disclosure, commercial music rights and applicable AI labels → human approve → upload/draft → confirm link setup → publish → collect performance.

TikTok Content Posting API availability does **not** establish access to programmatic product-level external links. Verify Japanese Business Account eligibility, organic-post link placement, manual UI flow, API scopes and approval requirements before investing in a router or automated publisher. TikTok Shop off-platform restrictions should not be conflated with organic Business Account policies; confirm applicable current rules.

Do not autonomously publish unreviewed promotional content or assert unsupported features such as `静音` without evidence.

## 6. Controlled POC and gates

1. **Feasibility:** verify account status, Japanese linking capabilities and actual Mercari landing behavior on mobile; record screenshots and permitted workflow. **Blocker:** unverified product-level external-link support.
2. **Product selection:** choose ~3 representative products with live Shop4 listings where possible; verify current images, stock, price, contribution economics and factual claims.
3. **Creative batch:** make ~3 T0 hypothesis variants per product (~9 total), using existing images and canonical facts only.
4. **Controlled publication:** publish only after compliance/human approval; log actual destination and content IDs.
5. **Measure:** capture views, engagement, link clicks, destination availability, effort/cost and any observable sales context. Mark attribution limitations.
6. **Decision:** stop/redesign weak hypotheses cheaply; iterate strong T0 hooks; commission T1 only for demonstrated potential; T2 requires separate economics approval.

**No commitment yet:** new Content Engine, tracking service, TikTok API integration, AI-video pipeline, paid advertising or TikTok Shop. Implement only the smallest capability necessary to test the funnel.

## 7. Open questions and owners

| Item | Owner | Unblock evidence |
| --- | --- | --- |
| TikTok Business Account setup and Japan organic linking eligibility | Ecommerce operator | Account UI/policy check and test link |
| Direct link vs profile link vs intermediary route | Ecommerce + engineering | Successful mobile end-to-end test |
| Shop4 candidate listings and profitability | Merchandising | Live listing URLs, canonical facts, margin check |
| Publishing API and link-management support | Engineering | Verified permission/scope and test |
| Mercari traffic/order attribution | Analytics | Available metric definitions and source quality |
| Creative publishing and compliance review | Ecommerce operator | Approved batch log and evidence |

## 8. Source and decision provenance

**Harvested from:** [inbox TikTok strategy draft](https://github.com/retailpulses/inbox/blob/main/system%20design/artifacts/tiktok-content-growth-strategy-draft.md): discovery-not-store, T0/T1/T2, image-first, product-truth gate, content hypothesis model, routing proposal, attribution caveats, human review and POC.

**Mercari-specific adaptations in this document:** Shop4-first experiment, exact live-listing routing, one-SKU-per-listing policy, hero-product candidate prioritization and minimal deployment gate. These are strategic operating recommendations, not claims of implemented capability.

Keep the original draft as historical design/POC evidence; use this document as the business-level strategy and update it with verified POC outcomes.
