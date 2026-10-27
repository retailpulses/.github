# VPS Runtime Inventory — Observed Snapshot

**Host:** `vm-b54d4b85-fa` (`160.251.141.110`)
**Observed:** 2026-10-26 11:57 JST (UTC+09:00)
**Registry:** [`runtime-inventory.yaml`](runtime-inventory.yaml)
**Method:** Read-only SSH as `root` using the verified operator key; systemd, timers, crontab schedules, process working directories, listening sockets, UFW rules, Nginx route directives, release symlinks, and available Git metadata were inspected.
**Coverage:** Host runtime and scheduler inventory. This does not certify application/business health, data correctness, or Cloudflare configuration.

## Host and collection summary

| Property | Observation |
| --- | --- |
| OS / architecture | Ubuntu 24.04.3 LTS / x86_64 |
| Virtualization | KVM |
| Timezone | Asia/Tokyo; NTP synchronization reported enabled |
| Provider, owner, production role | UNKNOWN |
| systemd services | 37 running at collection time; five failed units (one named application unit and four transient `run-*` units) |
| Application timers | Eight active timers; listed below |
| Cron accounts | Root crontab present; root was the only crontab file found |
| Docker / Podman / PM2 / Supervisor | Not installed or available on PATH |
| UFW | Active; IPv4 and IPv6 rules allow TCP 22, 80, 443, 8443, 9876, 9443 and UDP 8443 |

No environment values, secrets, journal contents, customer/order records, or external database data were read. Four transient failed `run-*` unit command lines are intentionally omitted. A systemd `Result=success` and exit status `0` below represent only process exit evidence, not business acceptance.

## Runtime observations

Statuses and last one-shot exits below were read around the observation time. PIDs and timer deadlines are omitted because they are transient.

| Runtime ID | Observed state | Last successful one-shot |
| --- | --- | --- |
| `nginx` | Active; binds TCP 80, 443, 8080 | UNKNOWN |
| `sshd` | Active; binds TCP 22 on IPv4 and IPv6 | UNKNOWN |
| `fail2ban` | Active; jail state not inspected | UNKNOWN |
| `tailscaled` | Active; peer/routes not inspected | UNKNOWN |
| `ntpsec` | Active; UDP 123 bound on host interfaces | UNKNOWN |
| `cron-daemon` | Active | UNKNOWN |
| `catalogsync-root-cron` | Eight root cron lines configured; last execution results not inspected | UNKNOWN |
| `acme-renewal-cron` | Configured at 05:49, 11:49, 17:49, 23:49 daily | UNKNOWN |
| `cloudflared-rp` | Active; tunnel ingress not inspected | UNKNOWN |
| `mercari-relay-tunnel` | Active; destination not inspected | UNKNOWN |
| `rp-order-mgmt-tunnel` | Active; destination not inspected | UNKNOWN |
| `boutique-listing-relay` | Active; loopback TCP 8789 | UNKNOWN |
| `giga-catalog-sync-relay` | Active; loopback TCP 8788 | UNKNOWN |
| `mercari-proxy` | Active; loopback TCP 9000 | UNKNOWN |
| `ops-portal-gateway` | Active; loopback TCP 8090 | UNKNOWN |
| `portal-acceptance-relay` | Active; loopback TCP 3010 | UNKNOWN |
| `rp-order-mgmt-api` | Active; wildcard TCP 8790 | UNKNOWN |
| `rp-order-mgmt-relay` | Active; loopback TCP 8787 | UNKNOWN |
| `rp-timesale` | Active; loopback TCP 9001 | UNKNOWN |
| `ticket-share-viewer` | Active; loopback TCP 3000 | UNKNOWN |
| `rp-network` | Active; wildcard TCP 9443 and UDP 8443 | UNKNOWN |
| `catalogsync-runner` | Timer active; latest service exit status 0 | 2026-10-26 11:56:48 JST |
| `giga-mercari-pipeline` | Timer active; latest service exit status 0 | 2026-10-26 11:03:26 JST |
| `catalogsync-shop4-health` | Timer active; latest service exit status 0 | 2026-10-26 11:55:16 JST |
| `catalogsync-amazon-health` | Timer active; latest service exit status 0 | 2026-10-26 11:57:05 JST |
| `order-health-recovery` | Timer active; latest service exit status 0 | 2026-10-26 11:53:23 JST |
| `order-mgmt-orchestrator` | Timer active; service failed with exit status 1 | UNKNOWN; latest failed run ended 11:02:18 JST |
| `order-mgmt-sales-brief` | Timer active; latest service exit status 0 | 2026-10-26 11:00:24 JST |
| `vps-health-watch` | Timer active; latest service exit status 0 | 2026-10-26 09:00:16 JST |

## Schedulers and jobs

### Root crontab

The crontab has eight configured lines. Six recurring scripts run every ten minutes: Mercari Shop1, Shop2, Shop3, and Shop4 Supabase full scripts, plus Amazon and Rakuten `run_live` scripts. A Mercari `run_auto_open` script is scheduled at minute 7 from 08:00 through 20:00 daily. ACME renewal runs at minute 49 during hours 05, 11, 17, and 23. Script result logs and successful completion evidence were not inspected.

### Active application systemd timers

| Timer | Observed schedule | Target service |
| --- | --- | --- |
| `catalogsync.timer` | 2 minutes after boot; repeat 10 minutes after service becomes inactive | `catalogsync.service` |
| `catalogsync-shop4-health.timer` | Every 5 minutes at minute 0 | `catalogsync-shop4-health.service` |
| `catalogsync-amazon-health.timer` | Every 5 minutes at minute 2 | `catalogsync-amazon-health.service` |
| `giga-mercari-pipeline.timer` | 5 minutes after boot; hourly 08:00–20:00 Asia/Tokyo | `giga-mercari-pipeline.service` |
| `order-health-recovery.timer` | Every 5 minutes at minute 3 | `order-health-recovery.service` |
| `order-mgmt-orchestrator.timer` | Hourly at minute 1 | `order-mgmt-orchestrator.service` |
| `order-mgmt-sales-brief.timer` | 08:00, 11:00, 14:00, 17:00, 20:00, 22:00 | `order-mgmt-sales-brief.service` |
| `vps-health-watch.timer` | Daily at 09:00 Asia/Tokyo | `vps-health-watch.service` |

The latest observed `order-mgmt-orchestrator.service` run failed at 11:02:18 JST with exit code 1; its timer remained active. The failure cause was not investigated and no retry, restart, or scheduler change was performed.

### Disabled application timers

`catalogsync-health.timer` and these `pipeline-*` timers were installed but disabled: `pipeline-auto-approve-orders`, `pipeline-build-giga-shipments`, `pipeline-build-rakuten-shipments`, `pipeline-close-rakuten-orders`, `pipeline-close-shop-orders`, `pipeline-confirm-rakuten-orders`, `pipeline-pull-giga-tracking`, `pipeline-pull-rakuten-orders`, `pipeline-pull-shop-orders`, `pipeline-push-orders`, `pipeline-push-rakuten-orders`, `pipeline-reconcile-cancellations`, `pipeline-reconcile-end-to-end`, `pipeline-send-payment-reminders`, `pipeline-sync-mercari-messages`, and `pipeline-sync-rakuten-tracking`. No disabled unit was started or changed.

Standard Ubuntu maintenance timers (APT, Certbot, dpkg backup, filesystem scrub/trim, fwupd, logrotate, man-db, sysstat, and related units) were also active; they are host maintenance, not separate product runtimes in the registry.

## Ingress, listeners, and routing

| Listener / route | Observation |
| --- | --- |
| TCP 22 | OpenSSH, wildcard IPv4 and IPv6; UFW allows it |
| TCP 80 / 443 | Nginx; UFW allows both |
| TCP 8080 | Nginx wildcard listener; no explicit UFW allow rule observed |
| TCP 8790 | OrderMgmt API wildcard listener; Nginx uses it for `/api/` and `/order/api/`; no explicit UFW allow rule observed |
| TCP 8787, 8788, 8789, 9000, 9001, 3000, 3010, 8090 | Application listeners bound to loopback |
| TCP 9443 / UDP 8443 | `sing-box` wildcard listeners; UFW allows both protocols |
| TCP 8443 / TCP 9876 | UFW allows them, but no listener was observed |
| TCP 20241 / 20242 / 20244 | Loopback listeners owned by the three `cloudflared` processes; tunnel ingress destinations were not inspected |

Nginx configuration directives showed:

- `order.homesbliss.net`: portal static root at `/opt/order-mgmt/current/portal/dist`; `/api/` and `/order/api/` proxy to `127.0.0.1:8790`.
- `seller-share.homesbliss.net`: HTTP redirects to HTTPS; HTTPS proxies to `ticket_share_viewer` at `127.0.0.1:3000`.
- Default HTTP server proxies to `rp_timesale_port80` at `127.0.0.1:9001`.
- `/ops-portal-acceptance/healthz`, `/accept`, and `/check` proxy to `portal_acceptance_relay` at `127.0.0.1:3010`.
- The `mercari-relay` TLS virtual host proxies to `127.0.0.1:8443`, but no TCP listener on port 8443 was observed. UFW also allows TCP 8443 without an observed listener. These are inventory discrepancies only; they were not changed or tested with a request.

## Source and release reconciliation

- `/opt/catalogsync/current` resolves to release `a8e59f024f8c-20261021115222`. The prefix resolves to commit `a8e59f024f8ccbfe9fd962f45f5e564ae1dbcff4` in `retailpulses/CatalogSync`.
- The active `rp-order-mgmt-relay.service` runs from `/opt/OrderMgmt`, whose configured origin is `retailpulses/OrderMgmt`; that checkout was clean, detached at `e7be3c3d9c5372166e53b40c375efe640762e652`. The separate `/opt/order-mgmt-relay/current` symlink was not the active service working directory.
- Other active release directories expose release identifiers, but they are not Git checkouts and the identifiers did not resolve to commits in the inspected source checkout. Their repository and deployed commit remain `UNKNOWN`.

## Outstanding verification

- Provider/account ownership, formal production classification, service owners, and source repositories for most release bundles.
- Cloudflare Tunnel identities/ingress, external API and database endpoints, service dependencies, backups/restores, and application-level health/data correctness.
- Root cron last-success evidence, disabled timer ownership, failure cause for the OrderMgmt orchestrator, and identity/purpose of four transient failed `run-*` units.
- No runtime was deployed, restarted, repaired, stopped, enabled, disabled, cleaned up, or reconfigured during this observation.
