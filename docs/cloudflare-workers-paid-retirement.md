# Cloudflare Workers Paid — Retirement Decision

**Status:** Accepted — Phase 1 complete (2026-11-22), Phase 2 pending (plan not yet retired)
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

- **33** Worker scripts (was 45 before Phase 1), **8** Pages projects.
- **25 cron entries across 10 workers** (was 27 across 12).
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
| **Cron Triggers per account** | **5** | **25** | **BLOCKER — ~20 schedules would stop** |
| CPU time per invocation | 10 ms | 7 workers exceed | **BLOCKER** |
| Requests | 100,000 / day | ~124K / month | OK |
| Subrequests per request | 50 | unaudited | Audit heavy Workers |
| Number of Workers | 100 | 33 + 8 | OK |
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
| `investment-clawbot`, `investment-clawbot-prod`, `mercari-ticket-reports`, `rp-mail-integration`, `ticketing-amazon-ingestion`, `ticketing-rakuten-ingestion` | 1 each |

`rp-order-mgmt` alone holds 12 of the 27, and the VPS already runs `order-mgmt-orchestrator.timer` and
`order-health-recovery.timer`. **Confirm whether the Worker crons are duplicates before porting them** —
do not preserve a double-writer.

## 4a. Phase 2 blocker — none of the CPU-heavy Workers is idle (verified 2026-11-22)

A first read of the dashboard suggests these are cron shell activity (invocation count ≈ cron cadence).
The subrequest breakdown disproves that: every one of them performs real outbound writes every day.

| Worker | Invocations / 24h | Subrequests / 24h | What the cron actually does |
|---|---|---|---|
| `rp-order-mgmt` | 1,290 | 40,820 | 49K to `*.supabase.co` (2xx), 11K to `worker-order.homesbliss.net` — **live order pipeline** |
| `ticketing-rakuten-ingestion` | 722 | 10,880 | 7K Supabase (2xx), 3K `rp-relay.homesbliss.net` — ticket ingestion |
| `inquiry-handler` | 440 | 3,380 | Baserow reads/writes — inquiry handling |
| `rp-mail-integration` | 144 | 10,080 | 9K `mail.zoho.com` (2xx) — mail sync |
| `investment-clawbot-prod` | 103 | 5,130 | RSS feeds + 4K `dashscope-intl.aliyuncs.com` (4xx) |

**Do not delete these to free cron slots.** They must be migrated or consolidated.

### The `rp-order-mgmt` double-writer

`rp-order-mgmt` is the single largest cron consumer (12 expressions, ~51 fires/hour) and it runs
`push_orders_to_giga`, `pull_giga_tracking` and `close_shop_orders` — the **same three steps** the ConoHa VPS
`order-mgmt-orchestrator.timer` runs hourly in `orchestrator_live` mode (release `bd0d1dc2`, writing
`sales_orders` / `giga_shipment_projections` in Supabase).

`OrderMgmt/src/lib/pipeline-schedule.mjs` already declares the intended end state:

> `TRANSITIONAL: per-platform cron map. Will be consolidated in Phase B (channel-stage timers).`
> `Systemd timers become authoritative in Phase 3.`

That Phase 3 has **no planning document** in the repo yet, and the VPS orchestrator's last hourly run failed
at `close_shop_orders` (`ok: false` → service exit 1). So the correct order of work is:

1. Make the systemd timers cover the required cadence (the Worker currently runs every 10 minutes; the VPS
   timer is hourly — parity gap).
2. Fix the failing `close_shop_orders` step.
3. Prove parity, then remove the Worker cron map and let systemd own the schedule.

Only then can `rp-order-mgmt`'s 12 cron expressions be retired, and only then does the Free plan's 5-cron
budget become reachable.

The cutover is specified in
[`OrderMgmt/docs/plans/systemd-authoritative-order-pipeline-cutover.md`](https://github.com/retailpulses/OrderMgmt/blob/main/docs/plans/systemd-authoritative-order-pipeline-cutover.md):
phase parity matrix and the blocking gaps (cadence, Rakuten flags, message ingestion, payment reminders),
plus a sequence that never leaves the pipeline with zero runners.

Verified scheduler ownership: `order_scheduler_ownership` names `vps_order_orchestrator` for all six Mercari
workloads (`legacy_scheduler_disabled=true`), and `pipeline_run_log` shows those steps only ever run with
`trigger_type='systemd'`. The Worker is **already fenced out** of the Mercari order pipeline — this is not a
double-writer, and `rp-order-mgmt`'s Mercari crons are no-ops. The Worker still actively runs the Rakuten
set, `sync_mercari_messages` and `send_payment_reminders`.

Note on `close_shop_orders`: its step has reported `ok=false` on every run for 14+ days, but business
closing is healthy (333 `mercari_close_order` CONFIRMED in 30 days). It is a false-negative success signal,
not an outage.

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

**Phase 1 — Retire the dead surface (DONE 2026-11-22).**
1. Deleted `boutique-listing-production` and `boutique-listing-dev`; `listing.homesbliss.net` no longer resolves.
2. Deleted 10 routeless, zero-traffic scripts: `giga-products-sync-dev`, `giga-youge-sync-staging`,
   `learning-plan-app-dev`, `mercari-ticket-reports-staging`, and the six `ticketing-*-staging` scripts.
   Result: 45 → 33 Worker scripts, 27 → 25 cron entries.
3. Removed the `0 18 * * *` cron and the `listing.homesbliss.net` custom-domain route from
   `boutique-listing/wrangler.toml` (`867bbf2`) so a later deploy cannot resurrect them.
4. `canonical_copy_ui.py` left untouched: 30 days of zone HTTP analytics show **zero** calls to
   `/api/mercari/single-listing`, so repointing it is deferred until the tool is actually used again.

**Phase 1 evidence.** Zone `homesbliss.net` (Free plan) HTTP analytics for `listing.homesbliss.net`,
30 days to 2026-11-22: 860 requests, all 404 probes for `/.env.staging`, `/.git/logs/HEAD`,
`/.kube/config`, `/service-account-key.json` and similar — zero business paths. The publish endpoint was
still live and enforcing auth (`POST /api/mercari/single-listing` → 401 Unauthorized), so the zeroes are
real absence of use, not a dead endpoint.

**Restore path if the gateway is suddenly needed.** The feature is not on `main`: it lives on
`origin/feat/single-listing-publish-api` (+123 lines in `src/index.js`, issue #91, closed 2026-10-06 and
deployed to production 2026-10-07 via API). The deployed bundle is preserved at
`~/retailpulses/cf-worker-backups/boutique-listing-production-20261007-5ef9e449.js` and can be redeployed
with `wrangler deploy <bundle> --name boutique-listing-production`.

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
