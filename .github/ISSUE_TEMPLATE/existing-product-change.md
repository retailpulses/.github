---
name: Existing Product Change / Sprint
about: 既有产品 New Feature、Change Request 或重要 UI Patch 的设计基线与 Agent 交接
title: "[Sprint] <Product> — <Feature / Change Request>"
labels: []
assignees: []
---

<!-- 本模板是任务入口，不是第二份 Product Design。简单 Patch 可删去 N/A 项；不要把探索性建议写成 Approved。 -->

## 1. Operator Outcome / Objective
- 目标用户与要解决的问题：
- 可观察的业务完成定义：
- Source CR / Sponsor Decision：

## 2. Scope & Requirements
**In Scope**：
- 

**Out of Scope**：
- 

| Requirement ID | Current (As-Is) | Target (To-Be) | Acceptance |
| --- | --- | --- | --- |
| <ID> | | | |

## 3. Authoritative Design Baseline
- Product Design（章节 / Requirement IDs）：
- Design baseline commit SHA：
- Architecture（适用时）：
- TRD / API / Data Contracts（适用时）：
- Current State / Runtime evidence：
- Test Catalog / Test IDs：
- UI Wireframe / Prototype（适用时；链接、Reviewed SHA、状态）：
- Organization Standards：[Documentation Standard](https://github.com/retailpulses/.github/blob/main/engineering/DOCUMENTATION_STANDARD.md)；[Operator UX](https://github.com/retailpulses/.github/blob/main/engineering/PORTAL_UX_WORKFLOW_GUIDELINE.md)

## 4. UI Change Contract (if applicable)
- Impacted screens / flows：
- Existing → Target UI Diff（保留 / 新增 / 删除 / 重排）：
- Initial/default state, actions, transitions：
- Loading / Empty / Error / Success / Recovery：
- Target viewport/device and main operator workspace：
- Mock/Fixture/Debug separation from production Operator UI：
- Approved prototype deviations / Open questions：

## 5. Dependencies, Constraints & Open Decisions
- Existing reusable code / capabilities / tests：
- External data/API/runtime dependencies：
- Necessary safety gates and explicit write authorization：
- Blocking unknowns / Sponsor decisions：
- Non-goals and prohibited scope expansion：

## 6. Agent Development Brief
请以**本 Issue 为本次实施范围**，以 §3 的 Canonical Design Pack（锁定的路径、Requirement IDs 和 SHA）及已批准 UI Prototype 为设计权威。先读取 repo README/AGENTS、Current State 和相关代码/测试，完成 As-Is vs To-Be Gap 与复用评估，再提交最小实施计划并开发。不得把历史 Issue、Analysis、未批准原型或当前代码直接视为已批准产品行为。发现产品决策冲突先反馈，不得擅自改变业务规则；技术事实由 Agent 主动验证。

## 7. Verification & Evidence
- Requirement ID → Test ID：
- Unit / Integration / Contract（按适用性）：
- Browser Functional + Visual + Operator Workflow（按适用性）：
- Prototype conformance / viewport / screenshot / interaction evidence：
- Runtime / external readback（需要时）：
- Result：PASS / FAIL / NOT RUN / BLOCKED（附链接，不能虚报）

## 8. Delivery & Closeout
- Implementation PR / commit SHA：
- Updated canonical Design / Architecture / TRD / Test Catalog（或 N/A 理由）：
- Actual code vs approved design/prototype deviations：
- Merged / Deployed / Runtime Verified / Business Verified（分别列证据或 UNKNOWN）：
- Outstanding issues / owner / follow-up：

<!-- 小型低风险 Patch 可以在同一 PR 更新设计与代码；复杂 UI/跨系统功能推荐先确认 Design Baseline。无强制独立审批阶段。 -->
