# Retailpulses Internal Product MVP Engineering Principles

> Version: v0.3 | Status: **Reference Guideline (non-binding)** | Date: 2026-10-22
>
> Scope: 内部产品、Portal、Agent、Runner、自动化系统。此文档不修改 CI、Rulesets、审批或现有 Sprint Definition of Done。

## 1. 目标
**MVP = Minimum Functional Scope + Robust Engineering Foundation.**
Build only what is requested. Build it simply. Build it robustly. Keep it observable and ready to evolve.
MVP 不等于 Prototype；减少功能范围，不牺牲必要的工程完整性。

## 2. 核心原则
- **P01 Simple by Default**：选择满足已授权需求的最简单可靠实现。优先复用现有组件、数据库、Scheduler 和部署机制。评估总运行复杂度，而不只看代码量。
- **P02 Robust by Default**：核心行为可预测、失败可恢复、问题可诊断、结果可验证。可靠性强度与真实运营风险成比例。
- **P03 Evolvable Architecture**：为横向（店铺、平台、数据源）和纵向（业务能力、数据规模、自动化深度）扩展保留清晰边界；**Design for extension; implement for today**。不得为可能的未来需求提前实现功能。
- **P04 Observable by Design**：运行状态、最近执行结果、失败阶段与原因可查；禁止静默失败。优先利用现有日志、持久化和 Portal，不默认引入监控平台。

## 3. 产品授权与 Agent 自主权
**No Unrequested Features**：不得擅自新增用户可见功能、业务动作、自动化、审批、人为阻塞或扩大业务规则适用范围。
**Design Autonomy**：Agent 默认可自主决定必要的模块划分、内部数据结构、日志、错误处理、测试、持久化和不改变外部行为的重构。
**Major Architecture Exceptions**：新的长期运行服务/基础设施、Canonical Data Ownership 改变、并行生产 Scheduler、重大不可逆迁移、安全或生产写入边界变化、对其他生产 Runtime 的重大影响，必须单独授权。
**Implementation Autonomy, Not Product Scope Autonomy.**

## 4. Invariants
| ID | 约束 |
|---|---|
| INV-01 | No Unrequested Features |
| INV-02 | Design Autonomy within approved scope |
| INV-03 | Simplicity First; justify extra complexity |
| INV-04 | Robust by Default |
| INV-05 | Observable by Design |
| INV-06 | Evolvable, not prematurely generalized |
| INV-07 | Single Source of Truth for key business state |
| INV-08 | No Silent Failure |
| INV-09 | Safe Retry for repeatable side-effect operations |
| INV-10 | Verifiable Completion with evidence |

冲突时先保证已授权业务正确性及必要运行安全，再选择复杂度最低的可行方案。

## 5. Mandatory Engineering Baseline
**Mandatory 指工程目标，不强制具体技术栈或组件；不适用的项目说明理由。**
1. **Reliability**：核心路径有明确成功/失败结果，避免不一致的部分成功。
2. **Persistence & Data Integrity**：需跨运行保留的状态持久化；明确权威数据来源和必要约束；不强制每个 MVP 新建数据库。
3. **Observability & Diagnosability**：关键执行有日志/记录，后台任务可查询最近执行时间、状态、结果和失败阶段。
4. **Recoverability**：必要状态可恢复；有副作用的可重试操作采取适当幂等保护；不安全的重试必须明确处理方式。
5. **Testability**：核心路径和高风险失败路径具有与风险相称的自动化验证。
6. **Maintainability**：职责、配置、入口和必要恢复说明可识别。
7. **Security — Concrete Minimum Controls**：仅适用第 6 节 S01–S04 的具体要求；不得从抽象安全目标推导出额外系统或审批。

## 6. Security — Concrete Minimum Controls

以下四项是小规模内部 MVP 的具体安全底线；满足要求即可，不强制采用统一安全平台。

- **S01 凭证不泄露**：真实密钥不得提交 Git、嵌入浏览器/前端构建产物或写入日志。可复用现有环境变量、被 Git 忽略的本地 `.env`、Cloudflare/GitHub Secrets；不强制引入 Vault 或 Credential Gateway。
- **S02 生产副作用入口有认证边界**：从公网可访问、且可修改生产业务状态、发布 Listing、发送消息或执行财务动作的入口，必须有可验证的认证/授权边界。允许复用现有 Token、Session、网络访问限制或受信代理；不默认要求 SSO、RBAC 或人工审批。
- **S03 高权限凭证不越界**：Service Role 等高权限后端凭证不得暴露给浏览器或不可信客户端。既有可信后端运行环境可按当前授权使用凭证；进一步细分权限须由具体风险驱动，不默认要求创建多套身份。
- **S04 禁止安全名义下的未授权扩建**：新增 SSO、RBAC、Vault、Credential Gateway、审批工作流、轮换平台或安全扫描平台，须有具体风险依据或明确产品/架构授权；不能仅凭笼统 Security Best Practices 自动加入 MVP。

**最高约束：No NFR shall authorize unrequested infrastructure, workflow, or product functionality.**

## 7. Conditional NFR
按真实场景评估 Performance、High Availability、Advanced Scalability、Detailed Audit Trail、Backup & Disaster Recovery、Advanced Monitoring、Concurrency Control；不得自动变成全体 MVP 的基础设施要求。

## 8. Architecture & Operations
- **Reuse Before Build**：Existing Capability → Small Extension → New Component → New Infrastructure。
- **Logical Separation Before Physical Separation**：逻辑边界不要求独立服务/仓库。
- **Avoid Premature Generalization**：无已确认需求，不建设通用 Framework。
- **Minimize Operational Complexity**：计入部署、进程、同步链路、Scheduler、配置和恢复成本。
- **Prefer Reversible Decisions**：优先低迁移成本的技术选择。
- **No Fake Human Gates**：技术失败和诊断不足不应默认转换成人工审批。

## 9. Reference MVP Review Checklist
- [ ] 功能范围已授权
- [ ] 无不必要的新组件/架构复杂度
- [ ] 核心成功、失败路径可预测
- [ ] 必要状态可靠持久化
- [ ] 执行与失败状态可诊断
- [ ] 关键失败可安全恢复
- [ ] 扩展边界清晰，无过早实现
- [ ] S01–S04 适用安全边界满足（不增加未经授权的安全系统）
- [ ] 完成声明有测试与运行证据

## 10. Governance
本规范是 **Reference Guideline — Non-binding**。可在 MVP TRD、Architecture Review、Agent 任务和 Sprint 讨论中引用，但**不自动新增审批、CI Gate、Ruleset 或阻塞性 Acceptance Gate**。未来若要升级为强制规范，需另行明确授权。
