# Capability Gateway — Product Design (Frozen)

> 状态：**Frozen**（2026-10-25 产品决策）。本文件是历史产品设计及停用决策记录，不代表本机 Runtime 已停用。

## 1. Product Overview

原目标：通过统一 Gateway 提供机器执行、Workspace 路由、Capability Contract、审计、版本发布和回滚。当前结论：作为 Local Codex Agent 的强制入口没有足够收益，增加发现、注册、调用及诊断摩擦。**不再建设通用 Agent Gateway。**

## 2. Capability Map

| ID | 能力 | 当前设计/实现事实 | 冻结决定 |
|---|---|---|---|
| CG-001 | MCP Machine Gateway | `gateway/server.py` 的 stdio POC；machine_status、list_workspaces、git_status、exec 等 | 不再扩展；取消 Agent 默认依赖 |
| CG-002 | Workspace Discovery | POC 仅返回配置 root 的单个 `poc` workspace | 不开发通用发现服务；工作区权威信息由 .github Registry 维护 |
| CG-003 | Governed engineering.verify | `gateway/capability.py` 限定 Mac mini/commerce-lab/make verify | 保留历史实现；调用方审计后决定是否停用 |
| CG-004 | Release / Rollback | `scripts/install-runtime.py` 的原子 release 链接及回滚 | 可复用模式，不要求中央 Gateway |
| CG-005 | Audit / Contract | JSONL、Schema、版本与策略记录 | 可复用模式，优先归入实际业务 Runner |
| CG-006 | Provider adapters | `capability.py` 含 timesale 命令入口；运行时依赖尚未核实 | 保护生产，逐项审计 |

## 3. Workflows

**WF-01 Local Engineering（目标）**：Codex → 本机 Terminal/Git/已授权 GitHub 工具 → 真实 Checkout/测试/PR。Gateway 不得是前置条件。

**WF-02 Legacy Invocation（过渡）**：现有调用者 → 已部署 rp-capability → 对应受限 Provider。只有在真实依赖审计后才允许取消调用。

**WF-03 Freeze/Recovery**：确认调用者和进程 → 保存配置/Release SHA → 禁用已确认无依赖入口 → 新 Session 与业务 smoke → 出现回归则恢复配置并验证。

## 4. Requirements and Non-goals

- CG-FR-001：Local Agent 默认 Direct-First，不能因 Gateway 不可用阻塞正常开发。
- CG-FR-002：冻结新 Capability、通用 Discovery、MCP Tunnel 和 Agent Bootstrap 集成开发。
- CG-FR-003：保留源码、历史设计、Release 和审计，不迁移到 .github。
- CG-FR-004：禁止在未核实依赖前停用 Time Sale/CI/共享 Scheduler。
- CG-FR-005：`AGENTS.md` 只放简短当前原则；`MEMORY.md` 历史内容不作为强制工具路由。

**Non-goals**：重新实现 Gateway、重构业务 Runner、删除历史代码、重建 Registry、改变生产授权边界。

## 5. Ownership / Source of Truth

- 产品状态与决策：`retailpulses/.github/products/capability-gateway/`。
- 源码与原始运行文档：[`commerce-lab/packages/rp-capability`](https://github.com/retailpulses/commerce-lab/tree/main/packages/rp-capability)。
- 本机部署事实：以 Mac mini 实际检查为准，记录在 [current.md](current.md)。
- 执行追踪：[Freeze Sprint #31](https://github.com/retailpulses/.github/issues/31)。

## 6. Reconsideration Criteria

仅在有明确跨客户端业务需求、Direct-First 无法满足、收益和运维成本有可验证数据、具备独立 owner 与回滚路径时，才提出新的产品决策。Frozen 不等于删除或承诺恢复。
