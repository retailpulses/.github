# BUS-TRV-001 — Suitcase carry-on eligibility (Draft)

Status: **Draft / Sponsor Review**  
Domain: Travel goods / customer-facing product claims  
Business owner: Retailpulses ecommerce operations (individual owner TBD)  
Origin: [inbox #42](https://github.com/retailpulses/inbox/issues/42)  
Consumers: Product Center / canonical product, Mercari Shops, Rakuten, Amazon JP, listing copy, customer inquiry / purchase assistant.

## Business question
For each suitcase SKU / physical variant, can the seller accurately state whether it meets the carry-on baggage dimensional and weight conditions for a specified airline, flight, and fare?

## Canonical meaning
**Carry-on eligibility is a conditional assessment, not an intrinsic SKU boolean.** The dimensions of the packed/transport-ready suitcase are product facts; carrier/flight/fare policies are external, versioned facts; eligibility is derived from both.

Avoid unqualified claims such as `機内持ち込み可能` based only on a generic domestic/international classification. Domestic and international are useful customer-facing scenarios, **not** sufficient determinants of eligibility.

## Inputs and authority
| Fact | Grain / source of truth |
|---|---|
| Exterior width, height, depth in cm, including wheels, handles and protrusions | Canonical product variant, verified supplier measurement |
| Empty weight and optional packed weight | Variant facts; packed weight is customer-dependent |
| Airline, flight type / aircraft restrictions, cabin class, fare, number of items, weight allowance | Dated official carrier policy or verified airport/authority reference |
| Effective policy date and source URL | External reference record |
| Derived result | Deterministic evaluation at a specified policy version and context |

Do not use package/carton dimensions, capacity (L), nominal S/M/L labels, or fabricated sentinel measurements as exterior baggage dimensions.

## Evaluation contract (proposed)
1. Require verified exterior dimensions and policy context; if missing or contradictory return `UNKNOWN`.
2. Compare **each** permitted side and total linear dimensions where the carrier specifies them; consider orientation only if policy permits.
3. Compare empty weight only as a lower-bound screen: a compliant empty weight does **not** establish compliance for a packed bag.
4. Respect additional conditions such as number of items, aircraft size, and fare/cabin restrictions.
5. Output `MEETS_DIMENSION_LIMITS`, `EXCEEDS_DIMENSION_LIMITS`, or `UNKNOWN` for the dimensional assessment, separate from overall `ELIGIBLE / NOT_ELIGIBLE / CONDITIONAL / UNKNOWN`.
6. Store rule source, effective date, assessment timestamp, variant ID and explanation. Re-evaluate on dimension or policy change.

## Customer-facing Japanese wording (draft)
- Verified for specified carrier/context: 「外寸（キャスター・持ち手を含む）は約W×H×D cmです。［航空会社・条件］の公表サイズ基準に適合します。ただし、重量・便・運賃等の条件は別途ご確認ください。」
- Unknown context: 「機内持ち込み可否は航空会社・便・運賃等により異なります。外寸は約W×H×D cm（キャスター・持ち手を含む）です。ご利用便の規定をご確認ください。」
- Never present a blanket international-flight guarantee.

## Governance / rollout
- **Draft only**: no airline-specific numeric limits have been verified for this record; do not publish an eligibility badge or auto-answer based on it yet.
- External official airline policy evidence belongs in `/.github/references/` or the owning policy data source; this BUS record defines semantics, not a second policy database.
- Implementing systems own schemas, calculations, tests, UI and publishing; cite `BUS-TRV-001` rather than copying rules.
- Pilot: audit representative suitcase SKUs (including Shop4), compare verified physical dimensions, run domestic/international carrier scenarios, review customer copy, then request sponsor approval.
- Open questions: initial carrier coverage, aircraft/route exceptions, verified dimension coverage, packed-weight handling, policy refresh cadence, and accountable business owner.

## Evidence and related work
- [inbox #42 — carry-on size for suitcase](https://github.com/retailpulses/inbox/issues/42) — original business request.
- [inbox #202 — Canonical Product](https://github.com/retailpulses/inbox/issues/202) — product facts ownership.
- [inbox #304 — SEO & Keyword Intelligence](https://github.com/retailpulses/inbox/issues/304) — consumer of validated claims.
- [Cross-shop listing defect registry](https://github.com/retailpulses/inbox/blob/main/operations/catalog/cross-shop-listing-defect-registry.md) — precedent for guarding against fabricated size facts.
