# Cloudflare Workers Paid — Retirement Decision

**Status:** Accepted — migration in progress (plan not yet retired)
**Version:** 1.0.0
**Last updated:** 2026-11-22
**Owner:** Jim Yang
**Related:** [`cloudflare-dependency-policy.md`](./cloudflare-dependency-policy.md), [`runtime-strategy.md`](./runtime-strategy.md)

---

## 1. Decision

Retire the account-level **Workers Paid** subscription and replace the remaining useful workload with
VPS runtimes, per the existing direction in `AGENTS.md` §2 and `runtime-strategy.md`.

The subscription is the only recurring Cloudflare spend on this account:

| Subscription | Price | Renews |
|---|---|---|
| **Workers Paid** | **$5.00/mo + usage** ($5.50/mo incl. 10% JST) | 2026-11-25 |
| R2 Paid | $0.00 base, usage-based | 2026-11-25 |
| Teams Free Base (Zero Trust) | $0.00 | 2026-11-25 |

Zone plan for `homesbliss.net` is **Free**. Invoice history Feb–Oct 2026 is 9 × $5.50, all Paid. The single
one-off invoice (2026-06-01, $13.05) is the first-year `homesbliss.net` registration at Cloudflare
Registrar, renewing ~2027-06. Billable usage in the current period is **$0.00**.

**Not in scope / do not cancel:** R2 Paid has no base fee and holds ~400 MB of product imagery across 7
buckets. `rp-order-mgmt-relay` tunnel and the Domain Registrar subscription are also unaffected — Tunnels
and Registrar are free of Workers Paid.

## 2. Driving premise

- `boutique-listing-production` (`listing.homesbliss.net`) is de-facto unused as a listing UI. Its 7-day
  traffic is 1.97K invocations of which ~1.98K are 4xx asset noise; real upstream API traffic is ~196
  Baserow subrequests per week.
- The real operational pipelines already run on VPS: `catalogsync.timer`, `giga-mercari-pipeline.timer`,
  `order-mgmt-orchestrator.timer`, `order-health-recovery.timer`.
- Cloudflare is therefore carrying a legacy shell surface rather than the production workload.

**Caveat:** `listing.homesbliss.net` is still referenced as a Mercari publish gateway by
`commerce-lab-stock-planning-import/apps/mercari/local_offer/canonical_copy_ui.py`
(`POST /api/mercari/single-listing`). That call site must be repointed before the route is removed.

## 3. Inventory (verified 2026-11-22, account `3c508be87424420345cce942487c298f`)

- **45** Worker scripts, **8** Pages projects.
- **27 cron entries across 12 workers.**
- 4 Durable Objects namespaces (SQLite-backed), 68.89K requests/month.
- 1 tunnel: `rp-order-mgmt-relay` (healthy, 8 apps).

Top CPU consumers (avg CPU per invocation; Workers **Free** hard cap is **10 ms**):

| Worker | CPU | Req | Note |
|---|---|---|---|
| `boutique-listing-production` | 177.9 ms | 34 | retired by this plan |
| `investment-clawbot` / `-prod` | 77.6 ms | – / 106 | |
| `rp-mail-integration` | 52.3 ms | 149 | cron `*/10` |
| `ticketing-rakuten-ingestion` | 16 ms | 742 | cron `*/2` |
| `inquiry-dashboard` (Pages) | 14 ms | – | |
| `rp-order-mgmt` | 14 ms | 1.3K | **12 crons**; overlaps VPS `order-mgmt-orchestrator` |
| `inquiry-handler` | 11 ms | 452 | 2 crons; owns `JobStateDO` |

## 4. Blockers

Verified against the live Workers plan comparison table.

| Constraint | Workers Free | Current account | Verdict |
|---|---|---|---|
| **Cron Triggers per account** | **5** | **27** | **BLOCKER — ~22 schedules would stop** |
| CPU time per invocation | 10 ms | 7 workers exceed | **BLOCKER** |
| Requests | 100,000 / day | ~124K / month | OK |
| Subrequests per request | 50 | unaudited | Audit heavy Workers |
| Number of Workers | 100 | 45 + 8 | OK |
| Durable Objects | 100,000 req/day | 68.89K / month | OK |
| Queues | 10,000 ops/day | minimal | OK |
| Workers Builds | 3,000 min/mo | 0 used | OK (6,000 → 3,000) |

Cron inventory to relocate or consolidate to ≤5:

| Worker | Crons |
|---|---|
| `rp-order-mgmt` | 12 |
| `inquiry-automation-worker` | 3 |
| `inquiry-handler` | 2 |
| `ticketing-mercari-ingestion` | 2 |
| `boutique-listing-dev`, `boutique-listing-production`, `investment-clawbot`, `investment-clawbot-prod`, `mercari-ticket-reports`, `rp-mail-integration`, `ticketing-amazon-ingestion`, `ticketing-rakuten-ingestion` | 1 each |

`rp-order-mgmt` alone holds 12 of the 27, and the VPS already runs `order-mgmt-orchestrator.timer` and
`order-health-recovery.timer`. **Confirm whether the Worker crons are duplicates before porting them** —
do not preserve a double-writer.

## 5. Target runtimes

Per `AGENTS.md` §2 and `runtime-strategy.md`, not everything goes to the same host:

| Workload | Target |
|---|---|
| Japan-IP-bound marketplace relays (Mercari publish gateway, relays) | **ConoHa VPS Japan** (`160.251.141.110`) |
| Background jobs, internal admin services, dashboards, batch | **Tencent Cloud Singapore** (`43.163.84.239`) |
| Image/object storage | keep **R2** ($0 base, S3-compatible) — no migration needed for this cost decision |
| Cron/scheduling | `systemd` timers on the owning VPS |
| Edge TLS / tunnel ingress | keep **cloudflared** (free, independent of Workers Paid) |

Note: the 2026-06-09 portability review for `boutique-listing` proposed Tencent Singapore for the app
runtime and ConoHa for the relay. That split is retained.

## 6. Phased plan

**Phase 0 — Freeze & inventory (done).**
Billing, subscriptions, cron, DO, CPU and Pages inventory captured in §1–§4.

**Phase 1 — Retire the dead surface (low risk).**
1. Repoint `canonical_copy_ui.py`'s `BOUTIQUE_LISTING_BASE_URL`, or confirm the tool is retired.
2. Remove the `listing.homesbliss.net` route and the `0 18 * * *` cron from
   `boutique-listing/wrangler.toml`, deploy, confirm the hostname is decommissioned.
3. Delete `boutique-listing-production` and `boutique-listing-dev` scripts.
4. Delete Workers with no routes and no traffic (the `*-staging` ticketing and learning set).

**Phase 2 — Consolidate crons onto VPS (the real work).**
Move each remaining cron to a `systemd` timer on the owning VPS (pattern proven by `catalogsync.timer` and
`giga-mercari-pipeline.timer`). Deduplicate `rp-order-mgmt`'s 12 crons against `order-mgmt-orchestrator`
first. Target: **≤5 Cloudflare crons** retained.

**Phase 3 — Eliminate the CPU >10 ms Workers.**
Reduce per-invocation CPU below 10 ms or move to VPS. `inquiry-handler` also owns `JobStateDO`; decide
whether its state moves to Supabase/Postgres or stays on Durable Objects (free at this volume, so staying
is acceptable).

**Phase 4 — Downgrade.**
Downgrade via `Plans → Workers plans → Free`; confirm the next invoice is $0; then verify the plan shows
Free, no more than 5 cron entries remain, and no Worker error spike in the following 24h.

## 7. Rollback

Re-upgrading to Workers Paid is self-service and immediate; the $5 base fee resumes on the next cycle. A
downgrade destroys no Worker code — only limits change. Retained risk is runtime failure, not data loss,
provided R2 and the Registrar subscription stay active.

## 8. Open items

- [ ] Confirm `canonical_copy_ui.py` is retired, or repoint its publish gateway.
- [ ] Audit `rp-order-mgmt` 12 crons vs VPS `order-mgmt-orchestrator` for double-writers.
- [ ] Measure subrequests/request on `inquiry-automation-worker` and `mercari-ticket-reports`.
- [ ] Decide the final home for `boutique-listing` (Tencent Singapore per the 2026-06-09 review).

---

*This record follows the org's Cloudflare dependency policy. Update §4–§6 as phases complete.*
