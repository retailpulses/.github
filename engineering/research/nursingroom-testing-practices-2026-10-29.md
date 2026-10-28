# Nursingroom 测试实践研究与可复用经验（Reference）

> 类型：外部项目工程实践研究 / Informative Reference（**非组织规范、非实施批准**）  
> 状态：Reference · 研究日期：2026-10-29 · Owner：Engineering  
> 来源仓库：[topgunren/nursingroom](https://github.com/topgunren/nursingroom)（调查时默认分支 `main`）  
> 适用对象：Retailpulses 工程测试治理、Operator Portal、跨系统 Workflow 测试  
> 现有权威：[Documentation Standard §16](../DOCUMENTATION_STANDARD.md#16-test-catalog--agent-driven-acceptance-pilot)、[Operator UX Test Catalog](../PORTAL_UX_TEST_CATALOG.md)  
> 证据等级：**E0 源码/文档审查**。此次未运行 Nursingroom 测试、未验证其 CI 或部署运行状态；历史测试报告不是 2026-10-29 的通过证明。

## 1. 研究问题与结论

问题：Nursingroom 在业务 E2E、可重复 Seed、Agent/人工测试交接、证据管理和测试资产治理方面，有什么值得 Harvest 到 Retailpulses 的做法？

**结论：优先 Harvest 四项契约，不迁移整套框架。**

1. **Golden Business Journey**：以可观察的业务结果与跨层状态传播为验收单位，不把“UI 点击成功”“HTTP 200”当作最终完成。
2. **Deterministic Seed Ownership**：全局业务场景 Seed 有显式 Profile、准备入口和独立 Verifier；Unit/API tests 保持 test-local fixture；Golden Spec 不隐式重置/写入 DB。
3. **Scenario Manifest + Evidence**：用稳定场景 ID、角色、数据范围、预期业务状态及执行证据，将人工、Agent、CI 关联至同一测试意图。
4. **Test Asset Lifecycle**：区分 active、candidate-golden、reference、retire；历史 Agent 截图/脚本未重新验证前不得自动晋升 Golden。

现有 Retailpulses 规范已经规定 Test ID、Requirement ID、证据、E0–E4、业务任务端到端验证及按风险选择测试。Harvest 应**补充现有契约的落地案例**，不创建平行测试规范、强制通用 Playwright 平台或额外审批。

## 2. 来源证据、观察和复用判定

| 主题 | 来源 | 观察（E0） | 复用判断 |
|---|---|---|---|
| Golden E2E | [golden README](https://github.com/topgunren/nursingroom/blob/main/frontend/e2e-golden/README.md) | 人工完成 Journey，记录 manual steps / acceptance，再转成 Playwright Spec；质量检查约束 Spec 与 Evidence 配对 | **P0：复用准入/追溯理念**；避免强制所有用例人工录制 |
| UI-first 与跨层断言 | [manual → golden 借鉴及反例](https://github.com/topgunren/nursingroom/blob/main/docs/plans/2026-05-21-e2e-manual-borrowings.md) | 指出直接 API POST 绕过真实 UI 表单会漏掉 UI→API 映射缺陷；长 Journey 如果只执行不检查下游状态仍有盲区 | **P0：实际 UI 操作 + 必要 readback/invariant** |
| Seed 所有权 | [seed-policy](https://github.com/topgunren/nursingroom/blob/main/docs/testing/seed-policy.md)、[seed-inventory](https://github.com/topgunren/nursingroom/blob/main/docs/testing/seed-inventory.md) | `seed_golden.sh --profile`、独立 `verify_golden_seed.sh`；区分 bootstrap、业务 Seed、test-local fixtures、deprecated 与 hidden-seed-risk | **P0：复用边界**，不照搬 phase0..8 大型 Seed 链 |
| 场景契约 | [Scenario JSON Schema](https://github.com/topgunren/nursingroom/blob/main/frontend/e2e-crud/manifests/scenario-manifest.schema.json)、[Artifact Helper](https://github.com/topgunren/nursingroom/blob/main/frontend/e2e-crud/helpers/artifacts.ts) | `scenario_id`、`category`、`setup_mode`、`account_role`、`facility_id`、`entity_refs`、`deep_links`、`expected_state`；Helper 将 JSON 附件绑定到 Playwright 测试 | **P0：轻量 Schema/记录约定**，字段按产品换成 tenant/shop/workspace |
| 资产生命周期 | [test-inventory](https://github.com/topgunren/nursingroom/blob/main/docs/testing/test-inventory.md) | 旧 E2E 分为 keep-active、candidate-golden、reference、retire；不批量修复历史 Spec | **P1：复用**；以已有 Test Catalog 为索引 |
| 数据并行隔离 | [Worker DB preparation](https://github.com/topgunren/nursingroom/blob/main/scripts/baseline/prepare_xdist_worker_dbs.sh)、[历史报告](https://github.com/topgunren/nursingroom/blob/main/docs/process-logs/2026-05-12-baseline-path-d-final-report.md) | Worker 使用独立 DB 降低 shared-state race；报告记录当时的测试结果 | **P2：仅遇到并行共享状态问题时借鉴**，历史结果不可当当前 CI 结果 |
| 多角色场景 | [多角色 Smoke](https://github.com/topgunren/nursingroom/blob/main/frontend/e2e/auth-multi-role-smoke.spec.ts)、[tester handbook](https://github.com/topgunren/nursingroom/blob/main/docs/plans/2026-05-19-l1-multi-role-tester-handbook.html) | 不同身份/设施范围的入口、权限及人工测试说明 | **P1：按需借鉴角色/租户矩阵** |
| 测试入口缺陷 | [root package.json](https://github.com/topgunren/nursingroom/blob/main/package.json) | 根级 `npm test` 为 “no test specified” 占位，而实际测试入口分布在 Makefile/子目录 | **反例：我们的仓库必须暴露真实可运行入口** |

## 3. 不应复制的设计

- **不以几十步 serial 测试作为默认结构**：前置失败造成级联失败、难定位；以 4–6 个关键状态转移与必要 checkpoint 组成 Journey，其他断言独立覆盖。不要将来源文档建议的具体行数、分钟数当作组织门槛。
- **不以 API 直接写入取代 UI 真实保存测试**：API Contract Test 可单独存在，但不能宣称覆盖 UI-driven Acceptance。
- **不以截图/DOM 存在替代业务成功**：截图属于视觉证据，完整业务完成需相应持久化/Job/外部回读；遵守现有 E0–E4 定义。
- **不把旧 Seed/隐藏 setup hook 迁入 Golden**：Seed 的预置与验证独立于执行阶段；外部真实生产写入须额外授权。
- **不为所有仓库强制新目录/工具**：按工程标准的比例原则，只在持续、高风险 Workflow 中形成明确 Catalog 和自动化资产。
- **不把历史报告中的 PASS 视为当前测试状态**：来源 CI/运行环境未经本次实测。

## 4. 面向 Retailpulses 的最小 Harvest 契约（建议，尚未批准）

### 4.1 Golden Journey 最小字段

`Test ID`、`Requirement/Workflow ID`、`operator_role`、`data_scope`、`starting_state`、`action`、`expected_UI_state`、`expected_persisted_state`、`downstream/readback`、`failure_recovery`、`evidence_level`、`execution_status`。仅记录适用字段；Design 决定业务正确性，Test Catalog 只规定验证方法。

**示例试点：** Commerce OPS 的 Inquiry Closed Won → Order Association。
- 正向：真实 Operator UI 关联订单 → 保存 → 刷新回读 → 确认 Inquiry 与 Order 关系持久化且状态正确。
- 异常：订单不存在/不匹配时正确拒绝并保留输入；重试不重复创建关系。
- 验收：UI 交互证据 + DB/接口可读状态；不可因 Mock PASS 宣称真实生产闭环通过。

### 4.2 Seed Profile 与边界

小规模试点可使用 `minimal` / `operator` / `integration` 三种示意 Profile（名称待产品 Owner 确定）；执行前进行显式 seed + verify；执行阶段不进行隐藏 reset 或跨场景预置；teardown 可回收自己创建的数据，但必须限定在隔离环境。真实 Seller、Giga、Rakuten、生产订单与发信全部排除在无授权测试写入之外。

### 4.3 Scenario 与 Evidence

只在 Agent/CI/人工反复交接导致信息丢失时引入 Schema；建议字段包含 `scenario_id`、`workflow_id`、`role`、`data_profile`、`expected_state`、`write_policy`、`evidence_link`。优先引用现有 CI artifact/PR/Issue，不把每次执行报告复制为长期 Markdown。每次运行至少注明环境、Commit SHA、时间、PASS/FAIL/NOT RUN/BLOCKED 和可查证依据。

### 4.4 Test Asset Lifecycle

建议在现有产品 Test Catalog 中维护状态：`Active` / `Candidate Golden` / `Reference` / `Retired`。从历史脚本晋升须重新运行符合当前业务 Design 的验收；若测试已失效，保留 traceability 后退休，不批量维护废弃测试。

## 5. 与现有标准关系

- [Documentation Standard §16](../DOCUMENTATION_STANDARD.md#16-test-catalog--agent-driven-acceptance-pilot)：测试资产权威/职责/位置与执行记录。
- [Operator UX Test Catalog](../PORTAL_UX_TEST_CATALOG.md)：现有 Agent UX 验收流程、E0–E4、真实 UI/Backend/Seller readback、PASS/FAIL/NOT RUN/BLOCKED。
- [Documentation Standard](../DOCUMENTATION_STANDARD.md)：产品 Design 是业务预期权威；本 Reference 不定义新业务要求。

若后续通过试点证明确有稳定共性，才在上述原文局部补丁并经既有 Issue/PR 审查；本研究文档自身**不改变**任何规范。

## 6. 未核实事项与试点验收

- **未核实**：Nursingroom 2026-10-29 的 CI 通过率、测试总数、实际 Playwright 运行效果及其生产可靠性。
- **未核实**：Retailpulses 目标仓库是否已有等效 Seed/Scenario/Evidence 机制；实施前先做现状对照，避免重复建设。
- **建议试点验收**：一个已批准的 P0 Journey，至少覆盖成功路径与高风险异常/重试；可重复 Seed（或现有等效 Fixture）；真实 UI 操作；持久化及必要 downstream readback；可在 PR 中追溯版本和证据；对生产无新增未授权写入。
- **下一步 Owner**：Engineering 根据产品当前 Design、测试基线决定是否创建小型试点 Issue；与中央规范的改动需独立审查，不把本 Reference 直接当成组织实施命令。
