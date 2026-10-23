# Mac mini Runtime Inventory — Observed Snapshot

**与 YAML 的关系：** `runtime-inventory.yaml` 是唯一的 Runtime Registry（15 项）；本文件是同一批 Runtime 的只读现场快照。此前第一张表只列出其中 **5 项监听端口的服务**，所以出现 5 vs 15 的表面差异，并非两套清单。SQLite 数据资产另外计数，不作为 Runtime 进程。
**Host:** rp-macmini-01  
**Observed:** 2026-10-22 14:35 JST (initial discovery)  
**Method:** Read-only shell inspection via authorized Mac mini connection  
**Coverage:** Partial; not a certification of all active jobs or their health.

## Runtime observations — 15 registered entries

以下记录对应 YAML 的 15 个 Runtime ID。PID 为采样时刻的临时值，不代表当前仍在运行。

| Runtime ID | 观察状态 | PID（采样时） |
| --- | --- | --- |
| `storeops-portal` | Running; TCP 8765 | 90417 |
| `mercari-operations-ui` | Running; TCP 8795 | 81073 |
| `rakuten-operations-ui` | Running; TCP 8794 | 5042 |
| `portal-auth-proxy` | Running; TCP 8790 | 5041 |
| `inquiry-sqlite-viewer` | Running; TCP 8001 | 27193 |
| `mercari-copy-scheduler` | Loaded; last success unknown | — |
| `local-database-sync` | Loaded; last success unknown | — |
| `canonical-data-daily` | Loaded; last success unknown | — |
| `canonical-data-reconcile` | Loaded; last success unknown | — |
| `stock-monitor-daily` | Loaded; last success unknown | — |
| `rakuten-login-watch` | Loaded; launchctl status 2, needs diagnosis | — |
| `timesale-staging-pull` | Cron configured; last success unknown | — |
| `machine-snapshot` | Cron configured; last success unknown | — |
| `github-actions-runner-01` | Running | not independently verified |
| `github-actions-runner-02` | Running | not independently verified |

## Confirmed listening processes

| Service | PID | Address | Evidence |
| --- | ---: | --- | --- |
| StoreOPS Portal | 90417 | 127.0.0.1:8765 | Python mount_portal.py |
| Mercari Operations UI | 81073 | 127.0.0.1:8795 | Python apps.mercari.ui.console |
| Rakuten Operations UI | 5042 | 127.0.0.1:8794 | Python apps.rakuten.ui.server |
| Portal Auth Proxy | 5041 | 127.0.0.1:8790 | Python portal_auth_proxy.py |
| SQLite Viewer | 27193 | 127.0.0.1:8001 | Python sqlite_viewer.py |

Two GitHub Actions runner services were observed as running.

## Local database assets — separate from the 15 runtimes

| Asset ID | Type | Configured path | Verification |
| --- | --- | --- | --- |
| `mercari-ops-sqlite` | SQLite file | `/Users/agent/Library/Application Support/store-ops/mercari.sqlite3` | Observed in Mercari UI arguments; file and backup not checked |
| `rakuten-ops-sqlite` | SQLite file | `/Users/agent/Library/Application Support/store-ops/rakuten.sqlite3` | Observed in Rakuten UI arguments; file and backup not checked |

**Database inventory coverage:** one local PostgreSQL/Supabase instance is recorded below. Other PostgreSQL instances, SQLite/DuckDB assets, backup and restore arrangements remain partially inventoried. The Local Database Sync LaunchAgent is a sync job, **not** the database itself.

## Scheduler evidence

- User crontab: Time Sale staging pull every minute from `/Users/agent/work/repos/commerce-ops/apps/timesale/local_offer/pull_staged_batches.py`; operational necessity and recent success **not verified**.
- User crontab: machine snapshot at 02:17 daily.
- Loaded LaunchAgents include Mercari Copy Scheduler, Local Database Sync, Canonical Data Daily, Canonical Data Reconcile, Stock Monitor Daily, Rakuten Login Watch, and multiple UI services.
- Rakuten Login Watch reported launchctl status 2; root cause **not yet diagnosed**.
- LaunchAgent loaded state alone does not attest last execution success.

## Important checkout/runtime dependency

Port 8765 runs `/Users/agent/work/store-ops-listing-runtime/apps/mercari/new-products-to-listing/mount_portal.py`, with arguments referencing:
- `/Users/agent/work/store-ops-customer-agent-runtime`
- `/Users/agent/work/commerce-lab-ui-runtime`
- `/Users/agent/work/commerce-lab-listing-runtime`

These cross-checkout references need explicit Git HEAD and dependency verification. No assumption that all directories track the same main or commit.

## Follow-up verification gaps

1. Read actual LaunchAgent/LaunchDaemon plist definitions and reconcile execution paths and scheduling intervals.
2. Capture each referenced checkout's repository URL, branch, HEAD SHA, dirty status, and divergence from origin/main.
3. Verify last successful run from logs or durable job evidence; distinguish loaded, running, scheduled, failed and disabled.
4. Identify other production jobs absent from the initial process/launchctl/cron sample, including other user/system schedulers.
5. Review the Time Sale staging cron against the completed Time Sale sprint before any cleanup.
6. Keep runtime configuration values and credentials out of GitHub.

**No runtime configuration or process was changed during this inventory.**


## 2026-10-23 13:06 JST — Time Sale Sprint #115 deployment verification

**Scope:** targeted live deployment inspection on `rp-macmini-01`; this supplements the original 2026-10-22 partial 15-runtime inventory, not a full rescan of every entry.

- **StoreOPS Portal / `storeops-portal`**: TCP `127.0.0.1:8765` running, observed PID `38653` after restart; launch label `com.retailpulses.mercari-local-ui`.
- **Actual launch chain:** `/Users/agent/Library/Application Support/Retailpulses/mercari-local-ui-launch.py` → `/Users/agent/work/store-ops-listing-runtime/apps/mercari/new-products-to-listing/mount_portal.py` → `/Users/agent/work/commerce-lab-ui-runtime/apps/mercari/local_offer/mercari_local_ui.py` → `timesale_builder_ui.py` → canonical `apps.mercari.timesale.portal`.
- **Time Sale pinned runtime:** `/Users/agent/work/store-ops-timesale-runtime`, detached Git SHA `9008a69dbdf6607109a2cfa2ed0256ab6cb24be1` (StoreOps PR #119 merged). Launcher sets `STOREOPS_ROOT` to this path; the thin shim resolves the canonical Time Sale module from it. This is a separate Time Sale code checkout, **not a second HTTP service/scheduler**.
- **Deployment-specific UI wiring:** existing Commerce Lab UI runtime shim now calls `portal.get(query)` rather than `portal.page()`, and the 8765 route forwards the URL query, enabling Shop-scoped historical campaign restoration. These are local runtime edits in the existing dirty Commerce Lab UI checkout; they **must be canonicalized into GitHub** rather than lost on a future runtime refresh.
- **Python environment:** Portal uses `/Users/agent/work/commerce-lab/services/canonical-lab/.venv/bin/python`; installed `openpyxl==3.1.5` plus `et-xmlfile==2.0.0` for the newly deployed Time Sale module. The dependency needs to be captured in the canonical runtime dependency manifest.
- **Smoke evidence:** `/`, `/mercari/timesale?shop=shop1`, `?shop=shop2`, `?shop=shop3`, `?shop=shop4`, `/mercari/new-listings`, `/inquiry-review` returned HTTP 200. Shop1 and Shop4 pages rendered `Latest Generated Campaign` and `Download CSV` with correct existing job IDs; Shop1 `mercari-upload.csv` download returned HTTP 200 and SHA-256 `9186e9b999e26977219ee0fe476339dbd274e9c0a9ee82830f88127a74982f9e`, matching the SQLite-linked file validation.
- **Safety:** no Seller upload/API write, no new cron or new listener, no SQLite schema migration. Original `store-ops-runtime` checkout was not moved; shared New Listings and Inquiry pages stayed reachable.
- **Remaining acceptance:** native browser file-selection/cancel interaction not yet attested; historical Shop2 artifacts missing (no download advertised). Full operator workflow and runtime retirement not yet certified.
- **Residual legacy runtime:** `timesale-staging-pull` still exists in user crontab, invoking a missing `pull_staged_batches.py` every minute; prior filtered-crontab write hung despite backup. `com.retailpulses.timesale-local` system LaunchDaemon remains loaded but not running; it references old Commerce Ops Local Offer and shared Supabase startup. Do not remove it without dependency confirmation. Track both in StoreOps #117.
- **Integration references:** StoreOps [PR #119](https://github.com/retailpulses/store-ops/pull/119), [Sprint #115](https://github.com/retailpulses/store-ops/issues/115), [retirement #117](https://github.com/retailpulses/store-ops/issues/117).

**Registry follow-up:** The 15 original runtime IDs remain unchanged. `storeops-portal` is still one service, but the YAML should eventually record the Time Sale module checkout and `STOREOPS_ROOT` as a dependency rather than create a duplicate runtime ID.


## 2026-10-23 — Local PostgreSQL instance observation

**Asset ID:** `canonical-lab-local-postgres` (see `runtime-inventory.yaml`)

| Infrastructure property | Observed on Mac mini |
| --- | --- |
| Host | `rp-macmini-01` |
| Runtime | Docker container `supabase_db_local-supabase-smoke` |
| Database engine | PostgreSQL supplied by local Supabase |
| Logical database | `postgres` |
| Endpoint | Host port `54322` mapped to container port `5432` |
| Persistence | Docker named volume `supabase_db_local-supabase-smoke` mounted at `/var/lib/postgresql/data` |
| Logical schemas | `canonical_product`, `canonical_history`, `canonical_images` |
| Source workspace | `/Users/agent/work/commerce-lab/services/canonical-lab` |
| Backup / restore | UNKNOWN — not inspected |
| Dependent application/runtime inventory | UNKNOWN — not reconciled |

**Observation method:** read-only Docker container, mount, port and PostgreSQL schema inspection. The container was running at observation time; this does **not** certify application readiness, data freshness, backup coverage, or recovery capability. No configuration was changed.

**Next infrastructure inventory gaps:** confirm the instance's lifecycle/startup ownership, persistent volume backup and restore process, and dependent runtime/service relationships. Keep application-specific product counts, prices and field-level data checks in the owning product documentation, not this registry.
