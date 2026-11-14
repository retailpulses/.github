# Product Warranty Policy — Household and Commercial Use

**Status:** Draft / Sponsor Review  
**Owner:** Business / Ecommerce Operations  
**Recorded:** 2026-11-14 JST  
**Scope:** Company-provided product warranty for applicable products sold through company-operated marketplaces (Mercari Shops, etc.), subject to product-specific terms and confirmation of applicable law.  
**Source:** Management-directed customer-facing Japanese warranty wording, 2026-11-14.

## Policy decision

For products to which this standard seller-provided warranty applies, distinguish the warranty duration by **actual usage**, not simply whether a buyer pays through a business account.

| Usage | Seller-provided warranty period |
|---|---|
| Ordinary household / personal use (一般家庭でのご使用) | **1 year from the product's arrival date** |
| Business / commercial / institutional use (業務用・商業施設等でのご使用) | **6 months from the product's arrival date** |

The shorter commercial-use period is intended for business or facility operation, including workplaces, shops and other institutional settings. **Do not automatically classify an order as commercial solely from a company name, hospital delivery address or corporate-looking buyer record.** Where the actual usage is unclear, verify the intended use case before making a warranty decision.

## Standard warranty conditions

1. Warranty claims are limited to **one warranty service request per product within the applicable warranty period** (subject to mandatory legal rights and any specifically approved product exception). Do not imply that merely asking a question consumes the claim entitlement; count an actual warranty service claim according to the approved claims process.
2. Exclusions: consumable parts (such as cushions, legs and fabric), ordinary wear and age-related deterioration, and damage attributable to buyer misuse or negligence.
3. Return freight for exercising this seller warranty is covered by the company **only if a product defect is confirmed**. Communicate shipping arrangements before asking a buyer to return goods.
4. The warranty period begins on the **actual product arrival date**, not order placement, payment or shipment date.
5. The seller warranty does **not** eliminate, restrict or replace any non-waivable statutory rights or responsibilities under applicable Japanese law. Escalate any disputed statutory claim rather than citing the six-month or one-year term as an absolute bar.
6. Where the manufacturer or a product-specific offer has an independently applicable warranty, do not silently replace those conditions with this default. Confirm the governing terms before publication and claims handling.

## Approved-for-review Japanese listing / customer copy

> **保証期間：**
> - **一般家庭でのご使用：** 商品到着日より1年間の製品保証
> - **業務用・商業施設等でのご使用：** 商品到着日より6ヶ月間の製品保証
>
> ※保証期間中の保証対応は、1商品につき1回までとなります。
>
> ※クッション・脚部・布地などの消耗品、経年劣化、通常使用による摩耗、お客様の過失による破損は保証対象外となります。
>
> ※保証ご利用時の返送送料につきましては、商品の不具合が確認された場合のみ当社が負担いたします。
>
> ※保証期間は、商品の使用目的および使用環境に応じて適用されます。
>
> ※本保証は、法令に基づくお客様の権利を制限するものではありません。

## Operating implementation

- **Listings:** Apply to selected products that actually carry this warranty; do not assume every product automatically has the same one-year/half-year coverage. Check description character limits and any existing warranty promises before editing live listings.
- **Support:** Record product/order identifier, arrival date, usage type and evidence, claimed failure, warranty handling history, return-shipping decision and outcome in the operational system. Avoid storing customer personal data in this GitHub document.
- **Claims:** Assess a reported defect and applicable legal/product-specific terms first. Confirm whether a warranty service was already used; avoid rejecting valid statutory remedies solely because the commercial seller-warranty period has ended.
- **Versioning:** The revised six-month commercial term should be applied prospectively where disclosed and valid; **do not retroactively reduce warranty commitments for earlier purchases or existing published promises**.
- **Business-facing copy:** Keep the commercial warranty term visible where items are marketed to offices, restaurants, nursing facilities or other professional users. Avoid conflicting blanket “1-year warranty” advertising elsewhere on the listing.

## Review / release gate

- [ ] Business owner confirms whether the policy is all products or an approved subset, and clarifies what constitutes a counted warranty claim.
- [ ] Legal/Backoffice verifies the exclusions and freight wording in light of applicable consumer and sales law.
- [ ] Merchant operator checks existing product-specific/manufacturer warranty terms and marketplace requirements.
- [ ] Only then update selected Shop4 and other listings using the approved wording; no automatic live changes are authorized by this document.

**Governance:** This is a proposed company-level product warranty policy, not a description of marketplace-mandated terms or a substitute for legal review.
