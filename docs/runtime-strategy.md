# Runtime Strategy

**Status:** Reference
**Version:** 1.0.0
**Last updated:** 2026-06-09

---

## 1. Purpose

This document defines the supported runtime families for Retailpulses services, when to use each, and when NOT to use each. It is a reference for architecture decisions, not a strict enforcement document.

---

## 2. Runtime Families

### 2.1 Cloudflare Worker

**What:** Serverless edge functions running on Cloudflare's global network.

| Aspect | Details |
|--------|---------|
| **When to use** | Edge relay/proxy, lightweight API, simple transforms, TLS termination, geo-distributed endpoints |
| **When NOT to use** | Long-running tasks (>30s CPU), heavy compute, complex stateful applications, services that need filesystem access |
| **Deployment model** | `wrangler deploy` via GitHub Actions (`workflow_dispatch`). Push to main for dev, manual approval for prod. |
| **State/storage** | KV (cache), D1 (SQL), R2 (objects). Prefer R2 (portable S3 API). Isolate behind adapters. |
| **Migration risk** | Low for relay Workers. High for full app Workers with KV/D1/Cron coupling. |
| **Validation/smoke test** | HTTP health check on workers.dev or custom domain. Retry 5x with 5s backoff. Accept 200/401/403 as alive. |
| **Current usage** | `workers` repo, `CatalogSync`, `boutique-listing`, Techstack relays |

### 2.2 VPS Node Service

**What:** Node.js services running on a VPS, managed via systemd, exposed via Cloudflare Tunnel or direct port.

| Aspect | Details |
|--------|---------|
| **When to use** | Stateful services, long-running processes, services needing filesystem or local DB, complex business logic |
| **When NOT to use** | Simple edge transforms (use Worker), static content (use Pages/CDN), short-lived tasks (use script) |
| **Deployment model** | SSH to VPS → git checkout → npm ci → systemctl restart → health check. GitHub Actions `workflow_dispatch`. |
| **State/storage** | Local filesystem, local SQLite, or remote DB. Full OS access. |
| **Migration risk** | Low — VPS is the most portable runtime. Any cloud VM or bare metal works. |
| **Validation/smoke test** | `curl http://127.0.0.1:<port>/health` → expect 200. `systemctl is-active <unit>` → expect "active". |
| **Current usage** | OrderMgmt, CatalogSync relay target, Giga sync backend |

### 2.3 Python Cron / Agent Runtime

**What:** Python scripts run on schedule (cron, systemd timer, n8n trigger) or on-demand by agents.

| Aspect | Details |
|--------|---------|
| **When to use** | Data processing, CSV generation, batch operations, Baserow sync, reporting, marketplace exports |
| **When NOT to use** | HTTP APIs (use Worker or VPS Node), real-time services, user-facing web apps |
| **Deployment model** | Script sync to execution environment. Run via cron, systemd timer, n8n, or manual CLI. |
| **State/storage** | Baserow (primary), local filesystem for temp files, output CSVs to R2 or local disk. |
| **Migration risk** | Very low — Python scripts are the most portable runtime. |
| **Validation/smoke test** | `python -m compileall .` for syntax. `python script.py --dry-run` for logic. |
| **Current usage** | Techstack tools, inquiry-automation, mercariops, rakutenops, amazonops |

### 2.4 Static Frontend

**What:** HTML/CSS/JS served from a CDN or static file server.

| Aspect | Details |
|--------|---------|
| **When to use** | Admin dashboards, internal tools, status pages, documentation sites |
| **When NOT to use** | Server-rendered pages (use VPS Node), authenticated APIs (use Worker or VPS) |
| **Deployment model** | CF Pages, `rsync` to VPS, S3/R2 + CDN, or GitHub Pages. |
| **State/storage** | None (static). API calls to Workers or VPS for data. |
| **Migration risk** | Very low — static files are universally hostable. |
| **Validation/smoke test** | `curl <url>` → expect 200. Lighthouse check for performance. |
| **Current usage** | `workers-dashboard`, `homepage` |

### 2.5 GitHub Actions Only

**What:** Logic that runs entirely within GitHub Actions workflows, no external runtime.

| Aspect | Details |
|--------|---------|
| **When to use** | Scheduled backups, CI checks, automated PRs, data validation, org-wide automation |
| **When NOT to use** | User-facing services, anything needing >6h runtime, frequent (<5min) schedules |
| **Deployment model** | Push workflow to `.github/workflows/`. No external deployment needed. |
| **State/storage** | GitHub repo files, artifacts, cache. No persistent DB. |
| **Migration risk** | Medium — tightly coupled to GitHub Actions. Migration means rewriting CI logic. |
| **Validation/smoke test** | Manual `workflow_dispatch` trigger. Check run logs. |
| **Current usage** | Cloudflare Workers backup (planned), PR check workflows |

---

## 3. Decision Matrix

When choosing a runtime for a new service:

```
┌──────────────────────────────────────────────────────────────┐
│ Is it an HTTP API or webhook receiver?                        │
│  ├─ Yes → Is it simple edge logic (<50ms CPU)?                │
│  │         ├─ Yes → Cloudflare Worker                         │
│  │         └─ No  → VPS Node service                          │
│  └─ No  → Is it a scheduled batch job?                        │
│            ├─ Yes → Is it <6h and GitHub-native?              │
│            │         ├─ Yes → GitHub Actions                   │
│            │         └─ No  → Python cron or VPS Node         │
│            └─ No  → Is it a data processing script?           │
│                      ├─ Yes → Python cron                     │
│                      └─ No  → Is it a static UI?              │
│                                ├─ Yes → Static frontend        │
│                                └─ No  → Re-evaluate requirements│
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Runtime Anti-Patterns

| Anti-Pattern | Why It's Bad | Better Approach |
|--------------|--------------|-----------------|
| Worker doing 30s+ CPU work | Workers have CPU time limits | VPS Node or Python |
| Worker using KV as primary DB | KV is eventually consistent, not a DB | D1 with adapter, or Baserow |
| Python script exposed as HTTP API | Python HTTP servers need management | VPS Node or Worker relay to script |
| GitHub Actions as cron for every 5min | Rate limits, cost | VPS cron or Worker Cron |
| VPS Node for static content | Wastes VPS resources | Static frontend (Pages/CDN) |
| Mixing Worker deploy and VPS deploy in one workflow | Confusing triggers, hard to rollback | Separate workflows per target |

---

## 5. Current Runtime Inventory

| Service | Runtime | Where | Assessment |
|---------|---------|-------|------------|
| Giga Catalog Sync | VPS Node + Worker relay | Techstack workers + VPS | ✅ Clean pattern — logic on VPS, relay on Worker |
| RP Order Mgmt | VPS Node + Worker relay | Techstack workers + VPS | ✅ Clean pattern |
| Attendance Book | Cloudflare Worker | workers repo | ⚠️ Full Worker app — document justification |
| Baserow WeCom Notifier | Cloudflare Worker | workers repo | ⚠️ Full Worker app — document justification |
| Color Variation | Cloudflare Worker | workers repo | ⚠️ Full Worker app — document justification |
| Coupon Manager | Cloudflare Worker | workers repo | ⚠️ Full Worker app — document justification |
| Workers Dashboard | Cloudflare Worker | workers repo | ⚠️ Full Worker app — document justification |
| Mail Integration | Cloudflare Worker | workers repo | ⚠️ Full Worker app — document justification |
| CatalogSync v2 | Cloudflare Worker + Cron | CatalogSync repo | ⚠️ Full Worker app + Cron — document justification |
| Boutique Listing | Cloudflare Worker + D1 | boutique-listing | ⚠️ Full Worker app + D1 — document D1 migration path |
| Inquiry Automation | Python + Baserow | inquiry-automation | ✅ Clean portable pattern |
| Mercari tools | Python scripts | Techstack + mercariops | ✅ Clean portable pattern |
| Rakuten tools | Python scripts | Techstack + rakutenops | ✅ Clean portable pattern |
| Amazon tools | Python scripts | Techstack + amazonops | ✅ Clean portable pattern |

---

*Update this document when adding a new runtime or changing a service's runtime model.*
