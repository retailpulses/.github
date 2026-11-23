# ADR-003: Single-source marketplace ingestion with domain-owned projections

**Status:** Accepted (2026-11-23)
**Accepted by:** Jim Yang
**Date:** 2026-11-22
**Governance version:** v1.5.0
**Issue:** [commerce-ops#499](https://github.com/retailpulses/commerce-ops/pull/499) (Phase `cloudflare-retirement-mercari-single-ingestion`, stage S6)

## Context

Three systems independently poll the same marketplaces:

| System | Surface | Observed volume (2026-11-22) |
|---|---|---|
| `rp-order-mgmt` | Mercari order messages via relay | 1,298 `mercari_messages_fetched` in 3h |
| `ticketing-mercari-ingestion` | Mercari → Supabase tickets + relay | 24h: 7K Supabase, 3K `rp-relay` |
| `inquiry-automation-worker` | Mercari → Supabase inquiries | ~96 ingestions/day across 4 shops |

Each keeps its own cursor and its own classification. Nothing deduplicates the platform read. Consequences
already observed:

- **Lost messages.** A poller that skips a window loses the message permanently; there is no replay path.
- **Split truth.** Each domain re-derives product matching and order linkage from the same raw payload, and the
  implementations have drifted (a retired prototype wrote `Received → Followed-up` for the wrong state, which is
  exactly the kind of defect independent re-derivation produces).
- **Quota and rate-limit surface is tripled** against a provider that meters by shop.
- **Localisation of failure is poor**: a message that fails classification in one domain is invisible in the
  other two.

Constraints that shape the decision:

- Supabase is the canonical operational store; Baserow is retired for inquiries and tickets
  (`docs/BASEROW_RETIREMENT.md`).
- The ConoHa VPS is the target runtime; Cloudflare Workers become HTTP/UI surface only.
- Domain semantics differ materially (pre-sale question vs post-sale issue vs order lifecycle) and must not be
  merged into one table.

## Decision

**The ingestion layer owns the raw platform message store and the per-platform cursor. Each domain owns its own
projection and classification from that store.**

Concretely:

1. One writer per platform. The ingestion layer fetches from the marketplace, writes a raw row, and advances the
   cursor — nothing else fetches that platform's message stream.
2. A raw row is immutable evidence. Its natural key is the provider identifier
   (`(platform, source_store_id, provider_message_id)`), with a dedupe constraint, so re-fetching the same window
   is idempotent.
3. Domains project. `orders`, `tickets` and `inquiries` each read raw rows they have not yet projected and write
   their own tables with their own state machines. Projection is idempotent and replayable per domain.
4. Replay is a first-class operation: reprocessing a time range means re-running a projection, not re-polling the
   marketplace.

### Schema sketch

```sql
-- Raw evidence. Written only by the ingestion layer.
create table public.platform_messages (
  id                 bigserial primary key,
  platform           text        not null,              -- 'mercari' | 'rakuten' | ...
  source_store_id    text        not null,
  provider_message_id text       not null,              -- marketplace identifier
  direction          text        not null,              -- 'inbound' | 'outbound'
  order_ref          text,                              -- provider order/transaction id when present
  topic              text,                              -- e.g. INQUIRY_MESSAGE_CREATED
  body               text,
  attachments        jsonb       not null default '[]'::jsonb,
  raw                jsonb       not null,              -- full provider payload, never rewritten
  received_at        timestamptz not null,
  ingested_at        timestamptz not null default now(),
  unique (platform, source_store_id, provider_message_id)
);

create index platform_messages_pending_orders
  on public.platform_messages (platform, received_at)
  where order_ref is not null;

-- One cursor per platform/shop. Advanced only after the raw write commits.
create table public.platform_ingestion_cursors (
  platform        text        not null,
  source_store_id text        not null,
  cursor_value    text,
  last_success_at timestamptz,
  updated_at      timestamptz not null default now(),
  primary key (platform, source_store_id)
);

-- Per-domain progress over the raw store, so a projection can be replayed independently.
create table public.projection_checkpoints (
  domain           text        not null,                -- 'orders' | 'tickets' | 'inquiries'
  platform         text        not null,
  last_message_id  bigint      not null default 0,
  updated_at       timestamptz not null default now(),
  primary key (domain, platform)
);
```

### Migration sequence

1. Land the raw store and cursor alongside the existing pollers; keep the pollers running.
2. Move `orders` to project from the raw store (its `sync_mercari_messages` phase already owns order linkage).
3. Move `tickets`, then `inquiries`. Each domain switch is independently reversible by re-enabling its own poller.
4. Delete the redundant pollers and their Cloudflare crons.

## Consequences

**Positive**

- One quota/rate-limit surface per provider; one cursor to reason about.
- Replay becomes possible: a classification bug is a projection re-run, not permanently lost data.
- Domains keep their own semantics and tables, so no big-bang schema merge.
- Cross-domain visibility: a message unprojected by one domain is visible as a gap.

**Negative / costs**

- New tables and a new writer must be maintained; the ingestion layer becomes a component with its own health
  surface.
- Projection lag becomes a first-class metric (a domain can now be behind the raw store).
- Requires touching all three consumers, so the change spans `apps/orders`, `apps/tickets` and `apps/inquiry`.
- The provider sends different granularities (message vs transaction vs status); the raw store must record which
  one a row is, not flatten them.

**Rejected alternatives**

- *Each domain keeps its own projection but reads the platform once through a shared client call.* This does not
  remove the duplicate fetch — it only hides it behind a shared helper.
- *One unified message table consumed by all domains with shared classification.* Larger blast radius, and it
  forces pre-sale and post-sale semantics into one model.

## Compliance with existing governance

- Supabase stays canonical; no new vendor dependency is introduced.
- Baserow is not referenced.
- Scheduling ownership continues to follow `order_scheduler_ownership` and the
  `cloudflare_worker → disabled/quiesced → vps_order_orchestrator` transition rule.
- The Cloudflare dependency policy is unaffected: the outcome removes Worker crons rather than adding them.
