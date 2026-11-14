# Mercari Shops — Presale Management Business Rules

**Status:** Canonical business policy harvest; implementation/runtime status separately verified  
**Owner:** Mercari Store Operations  
**Scope:** All four Mercari Shops; Shop4 first for controlled rollout  
**Reviewed:** 2026-11-14 JST  
**Authority:** Business policy belongs here; CatalogSync implementation and Commerce Ops release evidence remain in their owning repositories.

## Purpose and distinction

Presale (予約販売) means a listing is offered without presently fulfillable stock but with a credible inbound stock estimate. It is **not** ordinary in-stock merchandise, and the supplier's estimated arrival is **not** a promised shipment or delivery date.

Three layers must not be conflated:
1. **Approved customer communication policy** — Sponsor-approved in [commerce-ops#430](https://github.com/retailpulses/commerce-ops/issues/430) (2026-10-11).
2. **Inventory projection and implementation** — CatalogSync logic, with its own deployment/verification obligations.
3. **Operational maximum 30-day presale horizon** — existing Mercari operations rule being harvested here; implementation enforcement across all writers **requires verification**. The >30-day threshold is a business risk control, not a claim about a universal Mercari platform limit.

## Business rule register

| ID | Rule | Operational acceptance |
|---|---|---|
| **BUS-MER-PRE-001** | A listing is treated as **in stock** when currently fulfillable supplier quantity **or owned quantity** is positive. Stock wins over a manual presale override. | Remove all presale prefixes and return to normal dispatch settings when fulfillment stock becomes available; an active protection date cannot retain a false presale message. |
| **BUS-MER-PRE-002** | For products without fulfillable stock, eligibility for presale requires a credible, non-stale future inbound estimate. A missing/invalid estimate must never become a fabricated precise arrival promise. | Missing, invalid, reversed or expired ranges are explicitly flagged; customer wording, if shown, uses 「入荷時期確認中」 rather than a made-up date. Such data is not sufficient by itself to authorize a new presale offer. |
| **BUS-MER-PRE-003** | **30-day operating horizon:** when the supplier's **later bound** `next_arrival_end` is more than 30 calendar days after today (JST), **do not initiate or continue presale**; switch off presale offer / presale quantity, assess existing orders separately. For exactly day 30 the threshold does not itself exclude the item. | Apply the same cutoff consistently across listing selection, quantity publishing and daily refresh; report disqualified listings and pending orders. This is internal cancellation-risk policy, not an asserted platform-imposed universal deadline. Implementation coverage: Verification Required. |
| **BUS-MER-PRE-004** | Represent restock timing to buyers as **a single estimated month and 旬** (上旬/中旬/下旬), **never an exact supplier date**. Use Giga's **later endpoint only**, with **no +7-day or other arbitrary buffer**. | End day 1–10 = 上旬; 11–20 = 中旬; 21–month-end = 下旬; across years show the year. Examples: `10/08–10/17` → 「10月中旬頃入荷予定」; `12/27–01/12` → 「翌年1月中旬頃入荷予定」 (actual year numeral in rendered copy). |
| **BUS-MER-PRE-005** | Manual arrival estimate uses **year-month + early/mid/late**; it overrides Giga only while explicitly protected **and** no fulfillable stock exists. `presale_info_protect_until` is an **exact YYYY-MM-DD date**. | Neither UI nor API may invent representative day values for manual periods. The override is source-labelled and audited; once protection expires, revert to Giga-derived estimate. |
| **BUS-MER-PRE-006** | Japanese customer-facing copy must contain **頃** and **予定** and must not promise guaranteed shipment/delivery on the estimated supplier arrival period. | Preferred title prefix `「11月下旬頃入荷予定」`; if year differs, `「2027年1月中旬頃入荷予定」`. Preserve unrelated title text, enforce Mercari title length ≤130, and avoid duplicate prefixes. |
| **BUS-MER-PRE-007** | The existing presale publish quantity is **5** for eligible future-restock products; it is part of one common quantity derivation, not a Shop4-specific special case. | `target_qty = max(owned_qty, supplier_marketplace_qty, presale_qty)`; supplier cap: Shops 1–3 = 2, Shop4 = unlimited. Presale quantity becomes **0** when ineligible under PRE-002/003, subject to actual stock. Never allow presale to conceal available owned stock. |
| **BUS-MER-PRE-008** | Display shipping lead time consistently with actually fulfillable stock and the selected platform dispatch category. Existing CatalogSync implementation maps in-stock/no effective restock to **1–2 days**, within seven days to **4–7 days**, and eight or more days to **8–14 days**. | Treat this mapping as **observed implementation / review required for business approval**, not a guarantee that an eight-plus-day inbound item can be fulfilled within 14 days. In particular, the 30-day presale rule does not by itself make an 8–14-day dispatch promise safe. |
| **BUS-MER-PRE-009** | Upon physical restock or any transition to fulfillable stock, **immediately clear** stale presale title metadata, manual/protection state where appropriate, and restore normal lead time. | Reconciliation must cover already-expired titles and all historical prefix formats, not just the current one. Marketplace readback verifies title and shipping independently. |
| **BUS-MER-PRE-010** | Marketplace transitions are retried safely and must not report success until verified. | Durable sync-needed state or equivalent, exact SKU/listing identity, bounded retry, quarantine on unknown/ambiguous mappings, separate per-shop readback. A green deployment or merged PR is not proof that all four shops were updated. |
| **BUS-MER-PRE-011** | Operators see **English** labels and period choices in both Orders Portal and Product Update Tool; customers see Japanese copy. | Operator fields: `Manual Estimated Restock Period`, `Month`, `Early month / Mid month / Late month`, `Protection Until`. Both UIs share the canonical owner read/write API and cross-readback. |
| **BUS-MER-PRE-012** | Existing customer orders require separate service and cancellation-risk handling when promised supply becomes unlikely or exceeds the allowed horizon. | Disabling a presale listing must not silently cancel, fulfill, or alter existing orders; escalate impacted orders to the order/customer-service workflow. |

## Decision procedure (JST calendar date)

1. Resolve the exact item code and the target shop/listing identity; never infer from title alone.
2. Read current supplier available quantity, owned quantity, and Giga original `next_arrival_begin/end`; preserve provenance, freshness and validation reason.
3. If any **fulfillable** supplier or owned stock exists, use in-stock behavior: no presale title; normal dispatch; publish real stock per the shared per-shop quantity formula.
4. Otherwise, validate the supplier range (`begin <= end`; end not in the past); derive the customer period from the **end**. Check the internal **>30 days** exclusion using end date. Manual protected period controls customer wording only under approved precedence; a manual override must not silently evade the eligibility horizon.
5. If ineligible or risk threshold exceeded, do **not** publish artificial presale quantity or an unsupported arrival assurance; review existing active listings and outstanding orders.
6. If eligible, use presale quantity 5, the estimated month/旬 title prefix, and a dispatch policy that does not understate realistic fulfillment time. Record desired-vs-live changes and read back marketplace state.

**Boundary:** The rule above uses existing fulfillable stock, not simply a positive `presale_qty`, as the definition of `in_stock`. Keep actual and projected inventory separate.

## Legacy behavior to retire / do not propagate

- Old exact-day prefixes: `「M/DD再入荷予定」`, `「M月D日再入荷予定」`, and related older punctuation/format variants. These remain **cleanup inputs**, not current customer-copy output.
- Historical Baserow `Restock date` formula and old VPS/Baserow writer documentation are not present-day canonical ownership contracts. Owner-managed effective date/period projection must be used by consumers; do not create a competing writer.
- An older protection model and exact `manual_presale_arrival_date` are migration/read-compatibility input only. Do not write fabricated dates into the legacy column.
- Historic multi-variant listing edge cases are technical compatibility, not approval to change the current **one SKU per Mercari listing** creation strategy in [listing-csv-guideline.md](listing-csv-guideline.md).

## Evidence and provenance

**Approved business policy**
- [commerce-ops#430](https://github.com/retailpulses/commerce-ops/issues/430): later-bound month/旬, no buffer, protected manual override, customer wording, English operator UI, release gates.
- [commerce-ops#115](https://github.com/retailpulses/commerce-ops/issues/115) and [CatalogSync#223](https://github.com/retailpulses/CatalogSync/issues/223): presale quantity 5 and per-shop supplier caps.

**Implementation evidence, not proof of active runtime**
- [CatalogSync presale_period.py](https://github.com/retailpulses/CatalogSync/blob/main/lib/catalogsync/presale_period.py): exact end-bound selection, month/旬 formatting, manual precedence.
- [CatalogSync mercari_inventory_policy.py](https://github.com/retailpulses/CatalogSync/blob/main/lib/catalogsync/mercari_inventory_policy.py): shared quantity formula and per-shop cap.
- [CatalogSync mercari_reconcile_core.py](https://github.com/retailpulses/CatalogSync/blob/main/scripts/mercari/mercari_reconcile_core.py): current title prefix stripping / reconciliation.
- [CatalogSync TRD](https://github.com/retailpulses/CatalogSync/blob/main/docs/TRD.md): #430 rollout status expressly requires independent runtime verification.
- [CatalogSync legacy architecture](https://github.com/retailpulses/CatalogSync/blob/main/docs/legacy/architecture/presale-restock-date-system.md): prior exact-day/shipping and durable-flag lifecycle, **historical only**.
- [CatalogSync#189](https://github.com/retailpulses/CatalogSync/issues/189): stale June presale prefix observed on a September sale — incident evidence for PRE-009.
- [CatalogSync#184](https://github.com/retailpulses/CatalogSync/issues/184): effective-restock projection and source-timestamp/read permission gaps.

## Open verification / action ownership

| Item | Owner | Completion evidence |
|---|---|---|
| Confirm **>30 day** policy is enforced in every current listing/quantity writer and existing-presale cleanup, without silently affecting open orders. | CatalogSync engineering + Mercari Ops | Code/tests plus representative Shop4-first dry-run and four-shop readback. |
| Reconcile dispatch-time category with customer expectations for an 8–30 day inbound estimate; avoid false 8–14-day shipping assurance. | Mercari Ops policy owner | Approved dispatch rule and representative marketplace test. |
| Confirm correct exclusive owner of presale title publishing and absence of legacy competing VPS cron. | CatalogSync engineering | Current deployed SHA, job identity, actual title readback. |
| Verify manual period/protection cross-portal contract and real-stock return prefix cleanup. | Commerce Ops + CatalogSync | [commerce-ops#430](https://github.com/retailpulses/commerce-ops/issues/430) and [inbox#428](https://github.com/retailpulses/inbox/issues/428) acceptance evidence. |
| Establish monitoring of stale prefixes, >30-day presale candidates, changed Giga ranges and orders at cancellation risk. | Mercari Ops | Daily exception output and named operator disposition. |

Do not promote inferred deployment state to **Done** merely from these source files. 
