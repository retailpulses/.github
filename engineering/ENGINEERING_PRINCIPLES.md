# Retailpulses Engineering Principles

 > Status: **Organization-level P0 adoption (pilot); original draft preserved**  
> Scope: internal software, automation, data/runtime changes, and agent-assisted development across Retailpulses repositories.

These principles define **how we prefer to design and evolve systems**, not a rigid implementation standard. They should guide architecture discussions, Issues, implementation plans, PR review, migrations, and agent handovers.

The principles are intentionally derived from real Retailpulses development experience and should evolve when repeated evidence proves a better approach.

---

## 1. Reuse mature solutions before reinventing the wheel

**Default:** Before designing a new framework, runtime, scheduler, monitoring system, workflow engine, UI primitive, integration layer, or generic utility, first investigate whether a mature existing implementation can solve most of the problem.

Prefer, in order:

1. an existing capability already used inside Retailpulses;
2. a mature open-source project/library with active maintenance;
3. a well-supported platform/native capability;
4. a small internal implementation only when the above do not fit.

Reuse does **not** mean copying blindly. Evaluate at minimum:

- architectural fit;
- project activity and maintenance quality;
- license;
- security posture;
- operational complexity;
- dependency/vendor lock-in;
- ability to extend or replace later.

**Reason:** Our scarce resource is not lines of code. It is engineering attention, operational complexity, and the ability to maintain systems reliably over time.

---

## 2. Start from the user story and operational outcome, not the technology

A development task should first answer:

- Who is the user/operator/system actor?
- What are they trying to accomplish?
- What evidence proves the outcome succeeded?
- What happens when it fails?

Technology choices come after the workflow and success condition are understood.

Avoid creating infrastructure because a technology is interesting or theoretically reusable.

---

## 3. Clarify ownership and source of truth before adding behavior

Before writing a new cross-domain feature, establish:

- which domain owns the business semantics;
- which system owns canonical state;
- which systems may mutate that state;
- which systems only consume projections/read models;
- how disagreements are reconciled.

Do not solve unclear ownership by introducing another shared database, orchestration layer, or duplicated state.

---

## 4. Prefer deterministic mechanisms before agent judgment

If a rule can be reliably expressed through schema, constraints, code, validation, policy, or a state machine, prefer that over an LLM decision.

Use agents where interpretation, synthesis, exploration, or ambiguous judgment creates real value.

A preferred pattern is:

```text
structured input
→ deterministic normalization / validation
→ agent judgment where necessary
→ deterministic verification / readback
→ bounded repair
→ human escalation for ambiguity or high-risk actions
```

Agents should operate inside explicit constraints rather than compensate for missing system design.

---

## 5. Treat production evidence as the definition of "working"

Code merged, CI green, migration generated, or deployment completed does not prove a capability is operating correctly.

For important runtime behavior, require appropriate production/staging evidence such as:

- health/readiness signal;
- actual execution evidence;
- intended-vs-observed readback;
- freshness timestamp;
- business-level smoke test;
- failure/alert evidence where appropriate.

The maturity progression is:

```text
implemented → deployed → observed running → verified outcome
```

Do not collapse these states into "done".

---

## 6. Protect existing production behavior during replacement and migration

When replacing or consolidating a working production system, the default objective is:

> improve the architecture without putting the existing business operation at unnecessary risk.

Prefer techniques such as:

- parallel implementation;
- shadow/read-only execution;
- compatibility adapters;
- controlled backfill;
- explicit cutover criteria;
- canary execution;
- rollback path;
- retirement only after replacement evidence exists.

A monorepo merge, repository migration, or architectural cleanup is not itself permission to change production behavior.

---

## 7. Use POCs to answer uncertainty, not to create miniature production systems

A POC should test the smallest important unknown:

- Does the external API expose what we need?
- Can the runtime meet the required latency/capacity?
- Can this open-source tool integrate with our architecture?
- Can intended state be reliably read back and verified?

Define the question and success/failure criteria before building the POC.

Do not prematurely add production-grade abstractions, dashboards, generalized configuration, or multi-environment deployment to a POC unless those are the uncertainty being tested.

---

## 8. Keep architecture proportional to current risk and scale

Do not over-engineer for hypothetical future scale. Also do not optimize only for today's happy path when known growth or operational risk makes that irresponsible.

Prefer the **simplest architecture that preserves a credible evolution path**.

Examples:

- introduce staging where a production mistake has meaningful business/data impact;
- avoid staging for trivial low-risk utilities if local verification is enough;
- avoid generalized event buses, workflow engines, or agent frameworks until multiple real use cases justify them;
- design interfaces and ownership boundaries so later extraction remains possible.

---

## 9. Operational constraints are architecture constraints

Architecture must account for real operating limits, including:

- API quotas and rate limits;
- GitHub Actions minutes;
- VPS CPU/memory/disk;
- external service cost;
- model/token cost;
- scheduler/job capacity;
- network dependency;
- human review capacity.

A technically elegant design that routinely exceeds operational constraints is not a successful architecture.

Prefer moving recurring runtime work to infrastructure designed for runtime work rather than abusing CI/CD as a production scheduler.

---

## 10. Design every important runtime for failure, recovery, and observability

For recurring jobs, workers, integrations, and background processes, define before production:

- what success means;
- what failure looks like;
- whether retry is safe;
- idempotency/deduplication behavior;
- timeout/termination behavior;
- recovery path;
- escalation/alert threshold;
- how an operator can determine whether it is healthy.

A runtime that silently stops is an architectural defect, not merely an operations inconvenience.

---

## 11. Prefer small, reversible changes — except when a bounded greenfield replacement is safer

Incremental changes are normally preferred because they reduce blast radius and make failures easier to diagnose.

However, do not preserve a fundamentally wrong architecture through endless patches solely because "incremental" sounds safer.

Consider a bounded greenfield replacement when:

- ownership boundaries are fundamentally wrong;
- legacy assumptions dominate the implementation;
- migration complexity exceeds replacement complexity;
- the old system can remain operational while the replacement is independently verified.

The decision is not **rewrite vs no rewrite**. It is **which path gives the best combination of correctness, migration safety, maintainability, and total effort**.

---

## 12. Make dependencies and vendor lock-in deliberate

Using Cloudflare, Supabase, GitHub Actions, hosted APIs, or other managed services is acceptable when they reduce total complexity.

But important business capability should not become accidentally inseparable from a vendor-specific primitive without a reason.

For significant dependencies, understand:

- what capability the vendor provides;
- what data/state is vendor-specific;
- what interface we own;
- what migration path exists if cost, limits, or strategy change.

Do not build portability layers speculatively everywhere; add them where dependency risk is material.

---

## 13. Verification should be independent from the action where practical

For consequential operations, prefer verifying the resulting state rather than trusting the command response alone.

Examples:

```text
send/update command
→ read actual state from authoritative source
→ compare intended vs observed
→ accept / repair / escalate
```

This principle applies to marketplace updates, migrations, deployments, data synchronization, agent actions, and operational workflows.

---

## 14. Documentation should emerge from real cases and graduate when reusable

Do not create large theoretical standards before they are needed.

Preferred knowledge flow:

```text
real issue
→ decision / lesson
→ repeated evidence
→ reusable concept or playbook
→ canonical organization principle
```

When the same lesson appears across repositories, promote it out of individual Issue comments into `knowledge/system-design/`.

Canonical documentation should explain both **the principle** and **the conditions under which it applies**.

---

## 15. Development agents need explicit scope, authority, evidence, and handover

An agent task should make clear:

- objective;
- repository/system boundary;
- allowed writes/actions;
- production authority;
- required verification;
- stop conditions / hard blocks;
- what evidence must be left for the next agent/operator.

Prefer agents that can independently complete a bounded task and leave durable evidence over agents that merely produce long recommendations.

For risky changes, separate implementation authority from independent review/verification where practical.

---

## 16. Remove superseded paths after a verified cutover

Parallel systems are useful during migration but harmful when left indefinitely.

After the replacement is proven:

- identify the obsolete runtime/code/configuration;
- confirm no active dependency remains;
- archive or remove it;
- remove obsolete schedules/secrets/deployment paths;
- update canonical documentation.

Temporary compatibility should have an explicit retirement condition.

---

# Default development loop

These principles imply a preferred default sequence:

```text
1. User story / business outcome
2. Inspect existing system and ownership
3. Search internal + mature external solutions
4. Identify uncertainty / risk
5. POC only where uncertainty warrants it
6. Define architecture + operating constraints
7. Implement the smallest coherent change
8. Verify in the appropriate environment
9. Read back actual runtime/business state
10. Cut over deliberately
11. Observe
12. Retire superseded paths
13. Promote reusable lessons into canonical knowledge
```

This is a default, not bureaucracy. Low-risk changes may compress several steps. High-risk migrations may require each step explicitly.

---

# Review checklist

Before approving a significant design or implementation, ask:

1. Are we rebuilding something mature that already exists?
2. Is the user/business outcome explicit?
3. Is domain ownership and source of truth clear?
4. Which parts should be deterministic rather than agent-driven?
5. What operational constraints shape the design?
6. What happens when it fails or runs twice?
7. How will we know it is actually running correctly?
8. Can the change be introduced without disrupting current production behavior?
9. Is the complexity proportional to the real risk and scale?
10. What becomes obsolete after this change, and when will it be removed?

---

# Evolution rule

This document is intentionally versioned as a draft. Add or change a principle when there is meaningful evidence from real Retailpulses work.

Do not add principles merely because they sound like generic software-engineering best practice. A canonical principle should materially improve how we make recurring decisions.

---

## Provenance and authority

本组织级版本提升自 [inbox 原始 Development Principles](https://github.com/retailpulses/inbox/blob/main/system%20design/development-principles.md)，保留原有 16 条原则和默认开发循环。此处作为组织级原则入口；原始文件继续保留研究演进与历史来源，后续规范修订以本文件为准。原则是风险相称的默认判断，不是所有 PR 的机械审批清单。详见 [P0 Issue #22](https://github.com/retailpulses/.github/issues/22)。
