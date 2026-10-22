# Mac mini Runtime Inventory — Observed Snapshot

**Host:** rp-macmini-01  
**Observed:** 2026-10-22 14:35 JST (initial discovery)  
**Method:** Read-only shell inspection via authorized Mac mini connection  
**Coverage:** Partial; not a certification of all active jobs or their health.

## Confirmed listening processes

| Service | PID | Address | Evidence |
| --- | ---: | --- | --- |
| StoreOPS Portal | 90417 | 127.0.0.1:8765 | Python mount_portal.py |
| Mercari Operations UI | 81073 | 127.0.0.1:8795 | Python apps.mercari.ui.console |
| Rakuten Operations UI | 5042 | 127.0.0.1:8794 | Python apps.rakuten.ui.server |
| Portal Auth Proxy | 5041 | 127.0.0.1:8790 | Python portal_auth_proxy.py |
| SQLite Viewer | 27193 | 127.0.0.1:8001 | Python sqlite_viewer.py |

Two GitHub Actions runner services were observed as running.

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
