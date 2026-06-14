# Repository Workflow Matrix

**Status:** Reference
**Version:** 1.0.0
**Last updated:** 2026-06-14

---

## 1. Repository Inventory

| Repository | Status | App Type | Deployment Target | Default Branch |
|-----------|--------|----------|-------------------|----------------|
| **workers** | Active | CF Workers monorepo (6 workers) | Cloudflare Workers | main |
| **CatalogSync** | Active | CF Worker + VPS relay | CF Workers + ConoHa VPS | main |
| **boutique-listing** | Active | CF Worker + VPS relay | CF Workers + ConoHa VPS | main |
| **OrderMgmt** | Active | CF Worker + VPS relay | CF Workers + ConoHa VPS | main |
| **mercariops** | Active | Python tools + CF Worker (reporting) | CF Workers (reporting) | main |
| **ticket handling** | Active | CF Worker + VPS proxy | CF Workers + ConoHa VPS | main |
| **amazonops** | Active | Python CLI tools | N/A (local only) | main |
| **rakutenops** | Active | Python CLI tools | N/A (local only) | main |
| **inquiry-automation** | Parked | Python pipeline | Pending (not deployed) | main |
| **inbox** | Active | Node.js launchd service | macOS (local only) | main |
| **pushmsg2phone** | Active | Shell hooks | macOS (local only) | main |
| **rp_excel_tool** | Active | Python aiohttp | ConoHa VPS | main |
| **inquiry-handler** | Inactive | Docs only | N/A | main |
| **war-room** | Inactive | POC | N/A | main |
| **archon** | External | Upstream fork | Docker / npm | main |

---

## 2. CI/CD Workflow Matrix

| Repository | PR CI | Integration Model | Staging | Production Trigger | Production Source | Smoke Test | Main Gaps |
|-----------|-------|-------------------|---------|-------------------|-------------------|------------|-----------|
| **workers** | None ⟶ **ADDED** | PR validation → main | dev env | workflow_dispatch (manual) | main only | ✓ per-worker | Missing PR CI |
| **CatalogSync** | None ⟶ **ADDED** | PR validation → main | dev env | workflow_dispatch (manual) | main only | Added | Missing PR CI, concurrency, smoke |
| **boutique-listing** | Validate embedded in deploy | PR validation → main | dev env (auto on push) | workflow_dispatch (manual) | main only | ✓ Worker + Relay | Missing separate PR CI |
| **OrderMgmt** | Test embedded in deploy | PR validation → main | No dev env | workflow_dispatch (manual) | main only | ✓ Worker + Relay | Missing separate PR CI |
| **mercariops** | Python tool only | PR validation → main | dev env (auto on push) | push/release/workflow_dispatch | main (no guard) | **Missing** | No smoke, no branch guard, no concurrency |
| **ticket handling** | ✓ pr-check.yml | PR validation → main | staging env | **push to main auto-deploys production** | main | ✓ production only | **CRITICAL: auto-deploy to production on push** |
| **amazonops** | None | N/A (tool only) | N/A | N/A | N/A | N/A | No CI at all |
| **rakutenops** | None | N/A (tool only) | N/A | N/A | N/A | N/A | No CI at all |
| **inquiry-automation** | None | N/A (parked) | N/A | N/A | N/A | N/A | Not deployed |
| **inbox** | None | N/A (local service) | N/A | N/A | N/A | N/A | N/A |
| **pushmsg2phone** | None | N/A (local hooks) | N/A | N/A | N/A | N/A | N/A |
| **rp_excel_tool** | None | N/A (manual VPS) | N/A | Manual VPS | N/A | None | No CI |

---

## 3. Exception Register

| Repository | Exception | Justification |
|-----------|----------|---------------|
| **boutique-listing** | Push to main auto-deploys to dev | Internal tool with no customer impact; dev environment is isolated; production requires manual dispatch |
| **OrderMgmt** | No dev environment | Would double-process orders if dev env existed; testing via local CLI and unit tests |
| **mercariops (reporting)** | Push trigger still present | Legacy; being addressed in this audit |
| **ticket handling** | Push to main deploys production | Legacy; being addressed in this audit. Production deploys must be manual |
| **amazonops, rakutenops** | No CI at all | CLI tools run locally by operator; no deployable service |
| **rp_excel_tool** | No CI | Manual VPS deployment; no GitHub Actions integration |
| **archon** | Not Retailpulses-owned | Upstream fork (coleam00/Archon); not subject to Retailpulses governance |

---

## 4. Integration Model Assignment

| Repository | Integration Model |
|-----------|------------------|
| **workers** | Low-risk: PR validation → sequential merge to main |
| **CatalogSync** | Low-risk (single service): PR validation → merge to main |
| **boutique-listing** | Low-risk: PR validation → merge to main → dev auto-deploy → manual production |
| **OrderMgmt** | High-risk: PR validation → manual production with approval. Order pipeline affects customers. |
| **mercariops** | Low-risk: PR validation → merge to main |
| **ticket handling** | High-risk: PR validation → staging → manual production. Customer messaging is affected. |

---

*Update this document when repository status or workflow configuration changes.*
