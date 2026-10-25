# <Product / System> — Architecture

Status: Draft / Sponsor Review / Approved / Superseded
Owner:
Product Design: <link to DESIGN.md>
Current State: <link or Not yet available>
Related TRD / ADR / Foundational References:

> 按风险裁剪本模板。早期小型产品可将以下内容作为 DESIGN.md 的简短 Architecture 章节；复杂度或复用需要时再提升为独立文件。目标设计不等于当前部署事实。

## 1. Goals, scope and constraints
- Supported product workflows / Requirement IDs:
- Non-goals:
- Operational constraints (cost, capacity, security, maintenance):
- Key assumptions / unknown technical facts:

## 2. Architecture and ownership
- Component diagram / data flow:
- Component responsibilities and boundaries:
- Canonical data owner vs desired state vs observed external state:
- Read/write authority, projections and synchronization:

## 3. Technology stack and decisions
| Layer | Candidate / chosen stack | Why / alternatives | Status & evidence | ADR |
|---|---|---|---|---|
| Frontend | | | Proposed / Verified | |
| Backend | | | | |
| Database | | | | |
| Integration / Queue | | | | |

Use existing internal capabilities or mature solutions before inventing new infrastructure. Record only consequential trade-offs as ADRs.

## 4. Target deployment topology (To-Be)
| Component | Target environment/host | Process / trigger | Access & secrets boundary | Operations owner |
|---|---|---|---|---|
| | | | | |

- Environments, network boundaries, auth and credential access:
- Worker / job / service lifecycle and supervision:
- Backup, restore, rollout and rollback:
- Expected operating cost and capacity:

## 5. Integration and technical contracts
- External API / internal service references (IDs + verified scope):
- Data contract and failure semantics:
- Freshness / time validity and reconciliation:

## 6. Reliability, security and observability
- State machine and invariants:
- Idempotency and ambiguous side effects:
- Failure domains, recovery and rollback:
- Health checks, logs, metrics, runtime readback:

## 7. Verification and design maturity
| Critical fact or requirement | Status (Assumed / Verified / Unknown) | Evidence / date / environment | Next action |
|---|---|---|---|
| | | | |

- POC evidence (hypothesis → result → limitations → design impact):
- Blocking facts before baseline approval:
- Current implementation/deployment evidence: <link; do not infer from code>
- ADRs / unresolved product decisions:

## 8. References
- [Engineering Principles](../ENGINEERING_PRINCIPLES.md)
- [Architecture Review Guide](../ARCHITECTURE_REVIEW_GUIDE.md)
- [Documentation Standard](../DOCUMENTATION_STANDARD.md)
