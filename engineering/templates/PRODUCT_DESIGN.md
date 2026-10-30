# <Product> — Product Design

Status: Draft | Sponsor Review | Approved | Superseded
Design Owner: <repo / domain>
Scope: <product boundary>
Related Architecture: <link>
Current State: <link>
Governance: https://github.com/retailpulses/.github/blob/main/engineering/DOCUMENTATION_STANDARD.md

## 1. Product Overview
### Users and problems
### Product goals / success criteria
### In scope / non-goals

## 2. Capability Map
| Capability | Purpose | Requirement IDs | Dependencies |
| --- | --- | --- | --- |

## 3. End-to-End Workflows
Describe operator/user journey, system response, exceptions and recovery. Keep product behavior readable without code inspection.

## 4. Product Requirements
### <STABLE-ID> — <Capability / behavior>
- User value:
- Expected behavior:
- Business rules:
- Edge cases / non-goals:
- Acceptance intent (observable business outcome):
- Test Case IDs / Test Catalog link (when applicable):
- Technical contract / ADR references:

## 5. Shared Business Rules
Only cross-cutting rules; reference detailed technical formulas/contracts rather than copying them.

## 6. Decisions and Open Questions
| ID | Decision / question | Status | Authority / evidence |
| --- | --- | --- | --- |

## 7. Dependencies and References
Links to authoritative Architecture, TRD, Current State, ADR, and governing Issues.

> This is a starting template, not a mandatory chapter-count checklist. Do not append Sprint logs or POC diaries to the living Design.


## Optional early-stage POC / Architecture summary

仅在早期探索确有必要时添加，不要求每个产品填写：
- Open hypothesis and smallest useful POC (link to Issue / experiment evidence):
- Result, limitations and product-design impact:
- Critical technical assumptions / blocking facts:
- High-level component and target deployment constraints (details in Architecture if promoted):
- Selected stack / significant ADR / Current State links:

UI Sketch 默认直接放在相关 Workflow 或 UI/UX 章节；只有复杂时拆至从属文件，DESIGN 仍保留关键概览和链接。不要把 POC 通过等同生产已部署。

## Optional UI design pilot — Wireframe → Interactive Prototype

For a new or materially redesigned core MVP UI, use the two-stage Pilot in [Documentation Standard §13.1](../DOCUMENTATION_STANDARD.md#131-two-stage-ui-design-pilot-2026-10-30):

- **Stage A / Wireframe:** screen map, hierarchy, navigation, main actions and default selection; link Workflow / Requirement IDs. Editable Markdown / Mermaid / HTML is preferred to image-only review.
- **Stage B / Interactive Prototype:** browser-runnable primary flow, initial/default state, navigation, key loading/empty/error/success states and recovery; synthetic data and mocked actions clearly labeled.
- **Sponsor review baseline:** prototype link/path, how to run, target viewport/device, reviewed commit SHA, status and unresolved design questions.
- **Agent handoff:** screen → initial state → action → transition → exceptions → observable acceptance; implementation PR records browser-based conformance PASS / FAIL / NOT RUN and deviations.

This is a proportional pilot, not a universal extra document or approval gate. Keep the Product Design authoritative for behavior and promote detailed prototype files to `docs/ui/` only as needed.
