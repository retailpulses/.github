# BUS-TRV-002 — Suitcase checked-baggage dimensional standards (Draft)

Status: **Draft / Sponsor Review** · Verified source snapshot: 2026-11-04  
Domain: Travel goods · Owner: Retailpulses ecommerce operations (individual TBD)  
Related: [BUS-TRV-001 carry-on](suitcase-carry-on-eligibility.md)

## Deterministic business rules

These evaluate **published size standards**, not guaranteed acceptance, free baggage entitlement, or checked-baggage purchase.

| Rule ID | Carrier / scope | Deterministic size check | Source |
|---|---|---|---|
| CHECKED-ANA-INT-158 | ANA international, standard checked baggage size allowance | Exterior length + width + height <= 158 cm | [ANA official checked baggage](https://www.ana.co.jp/en/kh/travel-information/baggage-information/checked-baggage/) |
| CHECKED-JAL-DOM-50-60-120 | JAL domestic, published ordinary checked baggage size | Sorted exterior sides descending <= 120, 60, 50 cm respectively | [JAL official domestic checked baggage](https://www.jal.co.jp/jp/ja/dom/baggage/checked/) |

**Important:** `CHECKED-158` is a reusable *measurement predicate* (`sum <= 158`), not a global domestic/international airline eligibility rule. JAL domestic uses three individual side maxima; do not substitute a 158 cm sum check. ANA domestic and JAL international must be independently sourced before adding carrier-specific rows.

## Canonical input and evaluation

- Input: verified *external* suitcase dimensions in centimeters including wheels, handles and protrusions; measured configuration (expanded / not expanded); SKU/variant ID.
- Reject package dimensions, nominal sizes (S/M/L), capacity liters and sentinel values.
- `PASS`: all conditions of the selected rule met, inclusive of boundary.
- `FAIL`: at least one applicable condition exceeded.
- `UNKNOWN`: missing or conflicting dimensions, expansion state that affects the outcome, or unverified applicable policy.
- Record `rule_id`, carrier, domestic/international scope, official source URL, effective/checked date, measured dimensions, evaluation result and reason.
- Weight, fare allowance, number of checked pieces, operating carrier, aircraft restrictions, special items and possible extra fees are **separate assessments**.

## Deterministic examples

| Exterior dimensions | Sum | ANA international 158 | JAL domestic 50×60×120 |
|---|---:|---|---|
| 75 × 50 × 30 cm | 155 cm | PASS | PASS |
| 80 × 50 × 30 cm | 160 cm | FAIL | PASS |
| 121 × 20 × 15 cm | 156 cm | PASS | FAIL |
| 78 × 51 × 29 cm | 158 cm | PASS | PASS |

## Japanese customer-facing claim policy

**Allowed when verified:** 「【受託手荷物サイズ目安】外寸（キャスター・持ち手を含む）の3辺合計は約XXXcmで、ANA国際線の公表サイズ基準（158cm以内）に適合します。重量・個数・運賃・運航会社等の条件は別途ご確認ください。」

**Not allowed:** 「国内線・国際線の預け入れ可能サイズ内（三辺合計158cm以内）」 as an unconditional statement applying to all carriers.

A generic statement of *physical measurement* is permitted: 「外寸3辺合計158cm以内」 only when actual verified dimensions support it. Do not transform this into a blanket checked-baggage acceptance guarantee.

## Consumers / next validation

Product Center, Mercari Shops (Shop4 first), Rakuten, Amazon JP, Listing Copy, Inquiry and Purchase Assistant. Validate dimensions on real SKU samples and official ANA domestic/JAL international rules before expanding airline coverage. No production publishing authorized by this draft.
