# Mac mini Runtime Inventory — Observed Snapshot
**与 YAML 的关系：** `runtime-inventory.yaml` 是唯一的 Runtime Registry（15 项）；本文件是同一批 Runtime 的只读现场快照。此前第一张表只列出其中 **5 项监听端口的服务**，所以出现 5 vs 15 的表面差异，并非两套清单。SQLite 数据资产另外计数，不作为 Runtime 进程。
**Host:** rp-macmini-01  
**Observed:** 2026-10-22 14:35 JST (initial discovery)  
**Method:** Read-only shell inspection via authorized Mac mini connection  
**Coverage:** Partial; not a certification of all active jobs or their health.

## Runtime observations — 15 registered entries\n\n以下记录对应 YAML 的 15 个 Runtime ID。PID 为采样时刻的临时值，不代表当前仍在运行。\n\n| Runtime ID | 观察状态 | PID（采样时） |\n| --- | --- | --- |\n| `storeops-portal` | Running; TCP 8765 | 90417 |\n| `mercari-operations-ui` | Running; TCP 8795 | 81073 |\n| `rakuten-operations-ui` | Running; TCP 8794 | 5042 |\n| `portal-auth-proxy` | Running; TCP 8790 | 5041 |\n| `inquiry-sqlite-viewer` | Running; TCP 8001 | 27193 |\n| `mercari-copy-scheduler` | Loaded; last success unknown | — |\n| `local-database-sync` | Loaded; last success unknown | — |\n| `canonical-data-daily` | Loaded; last success unknown | — |\n| `canonical-data-reconcile` | Loaded; last success unknown | — |\n| `stock-monitor-daily` | Loaded; last success unknown | — |\n| `rakuten-login-watch` | Loaded; launchctl status 2, needs diagnosis | — |\n| `timesale-staging-pull` | Cron configured; last success unknown | — |\n| `machine-snapshot` | Cron configured; last success unknown | — |\n| `github-actions-runner-01` | Running | not independently verified |\n| `github-actions-runner-02` | Running | not independently verified |\n\n## Confirmed listening processes

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

**Not yet inventoried:** local PostgreSQL/Supabase instances and databases, other SQLite/DuckDB files, data volumes and backup policies. The Local Database Sync LaunchAgent is a sync job, **not** the database itself.

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
