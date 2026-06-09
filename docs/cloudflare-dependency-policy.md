# Cloudflare Dependency Policy

**Status:** Advisory
**Version:** 1.0.0
**Last updated:** 2026-06-09

---

## 1. Principle

**Cloudflare is an implementation option, not the product architecture.**

Retailpulses may use Cloudflare services where they provide clear value. But Cloudflare must not become the default assumption, the only supported runtime, or a hard dependency that blocks migration to alternative infrastructure.

---

## 2. Allowed Cloudflare Services

These Cloudflare services are approved for use, subject to the isolation rules below:

| Service | Allowed? | Notes |
|---------|----------|-------|
| Cloudflare Workers (edge compute) | ✅ | Allowed. Prefer simple relay/proxy patterns over full application logic. |
| Cloudflare Workers (full app runtime) | ⚠️ Conditional | Allowed only when justified. See Section 4. |
| Cloudflare KV | ⚠️ Conditional | Allowed for caching. Not for primary data storage. |
| Cloudflare D1 | ⚠️ Conditional | Allowed. Prefer portable SQL patterns. Document migration path. |
| Cloudflare R2 | ✅ | Allowed. Object storage with S3-compatible API — portable. |
| Cloudflare Worker Cron | ⚠️ Conditional | Allowed. Prefer cron-compatible design (see Section 6). |
| Cloudflare Pages | ✅ | Allowed for static frontends. Easily migrated to VPS/Netlify/etc. |
| Cloudflare Tunnel (cloudflared) | ✅ | Allowed. Connects CF edge to VPS — VPS remains the runtime. |
| Cloudflare Universal SSL | ✅ | Default for CF-proxied domains. No action needed. |
| Cloudflare Access / Zero Trust | ✅ | Allowed for admin dashboards. Portable auth model. |

---

## 3. Rules

### 3.1 Business Logic Isolation

Business logic should not be tightly coupled to Worker runtime APIs.

**Good (portable):**
```typescript
// Business logic in a pure function — testable, portable
function calculateShipping(weight: number, zone: string): number {
  // ... pure logic ...
}

// Worker handler is a thin adapter
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { weight, zone } = await request.json();
    const price = calculateShipping(weight, zone);
    return Response.json({ price });
  }
}
```

**Bad (coupled):**
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Business logic inlined in Worker handler
    // KV dependency woven through logic
    const cached = await env.SHIPPING_RATES.get(zone);
    // ... 200 lines of intertwined logic and Worker API calls ...
  }
}
```

### 3.2 Adapter Pattern

Cloudflare-specific services should be isolated behind adapters where practical.

```typescript
// Portable interface
interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
}

// Cloudflare KV adapter
class KVStore implements CacheStore { /* uses env.MY_KV */ }

// In-memory adapter (for testing or non-CF environments)
class MemoryStore implements CacheStore { /* uses Map */ }
```

### 3.3 Preferred Architecture Pattern

When building new services or refactoring existing ones, prefer this layered pattern:

```
┌─────────────────────────────────────────────┐
│  Business Logic                              │
│  Pure functions. No runtime API deps.         │
│  Testable without Workers / VPS / cron.      │
│  Written in portable Node or Python.         │
├─────────────────────────────────────────────┤
│  Runtime Adapter                             │
│  Thin wrapper: Worker fetch / VPS HTTP /     │
│  cron entrypoint / GitHub Action.            │
│  Only this layer knows the runtime.          │
├─────────────────────────────────────────────┤
│  State Adapter                               │
│  Interface → Baserow / SQLite / D1 / KV.     │
│  Swap implementation, not business logic.    │
├─────────────────────────────────────────────┤
│  Deployment Adapter                          │
│  GitHub Actions per target.                  │
│  Worker deploy / VPS deploy / script sync.   │
└─────────────────────────────────────────────┘
```

**Key principle:** Only the adapter layers know about Cloudflare, VPS, or any specific infrastructure. Business logic stays portable.

### 3.4 Dependency Documentation

New dependencies on KV, D1, R2, Worker Cron, Pages, or Tunnel must be documented:

- In the PR description (Cloudflare Dependency Impact section)
- In the repo's deployment docs
- With a migration path noted

### 3.5 No Vendor Lock-In by Default

Before adding a Cloudflare-specific dependency, ask:

1. Can this be done with a portable alternative?
2. If not, can the Cloudflare-specific part be isolated behind an adapter?
3. If not, what is the migration cost if we need to leave Cloudflare?
4. Is the migration cost acceptable for the value gained?

---

## 4. Worker as Full App Runtime — Justification Required

When a Cloudflare Worker is the actual application runtime (not just a relay/proxy), document:

- **Why:** Why does this need to run on Workers specifically?
- **Isolation:** Is the business logic separable from Worker APIs?
- **Alternative:** Could this run on VPS Node? What would change?
- **Cron:** If using Worker Cron, could it be a scheduled HTTP call instead?
- **State:** If using KV/D1, is it behind an adapter?
- **Migration:** Estimated effort to move off Cloudflare: [Trivial / Moderate / Hard / Very Hard]

Example repos needing this justification:
- `retailpulses/workers` — multiple Workers as app runtime
- `retailpulses/CatalogSync` — Worker as app runtime + Worker Cron

Example repos NOT needing justification:
- `retailpulses/Techstack` — Workers are thin TLS relays; logic is on VPS

---

## 5. R2 Specific Guidance

R2 is the most portable Cloudflare service (S3-compatible API). R2 dependency is low-risk.

- Prefer R2 over Workers KV for file/object storage.
- Use S3-compatible API calls where possible (not Worker binding API).
- If migrating off R2, any S3-compatible store (AWS S3, MinIO, Backblaze B2) can replace it.

---

## 6. Cron / Scheduled Jobs

Scheduled jobs should prefer cron-compatible design:

1. **Preferred:** HTTP endpoint on VPS + external cron (systemd timer, GitHub Actions schedule, n8n).
2. **Acceptable:** Cloudflare Worker Cron — but document the equivalent HTTP endpoint so it can be triggered externally if needed.
3. **Avoid:** Cron logic that only works inside Worker runtime and cannot be triggered from outside.

**Pattern:**
```typescript
// Worker Cron handler delegates to the same logic as the HTTP handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleScheduledTask(env);
  },
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    await handleScheduledTask(env);
  }
};
```

---

## 7. Deployment Workflow Separation

Deployment workflows must distinguish between:

| Deploy Type | Workflow | Trigger |
|-------------|----------|---------|
| Cloudflare Worker deploy | `deploy-*.yml` with wrangler | `workflow_dispatch` or push to main |
| VPS service deploy | `deploy-*.yml` with SSH | `workflow_dispatch` or push to main |
| Python cron deploy | Script sync + crontab update | Manual or scheduled |
| Static frontend deploy | CF Pages / rsync / S3 sync | Push to main or `workflow_dispatch` |

Never mix Worker deploy and VPS deploy in one workflow. Each deployment target should be explicit.

---

## 8. Review Process

The Cloudflare dependency review starts as **advisory, not blocking**:

1. PR author fills out the Cloudflare Dependency Impact section.
2. Reviewer checks: is the dependency justified? Is it isolated? Is migration documented?
3. If concerns: discuss in PR. Do not block merge on Cloudflare policy alone (yet).
4. After a trial period (3-6 months), revisit whether this should become a blocking review.

---

## 9. Current State

As of 2026-06-09:

| Repo | CF Coupling | Risk | Action Needed |
|------|-------------|------|---------------|
| `workers` | High (Workers as compute) | Medium | Document per-worker justification. No immediate change. |
| `CatalogSync` | High (Worker + Cron) | Medium | Document justification. Consider exposing scheduled task as HTTP endpoint. |
| `boutique-listing` | Medium (D1) | Low | Document D1 migration path. |
| `Techstack` | Low (relay Workers) | Low | Clean pattern. No action needed. |
| `retailpulses-tool-services` | Low (R2 MCP) | Low | R2 is portable. No action needed. |
| All others | None | None | No action needed. |

---

*This policy is a living document. Update it as the org's infrastructure evolves.*
