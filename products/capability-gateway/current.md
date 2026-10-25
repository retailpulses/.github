# Capability Gateway — Current State

**截至 2026-10-25**：产品开发 **Frozen**；Mac mini 运行时停用状态 **未验证**。不得把“产品 Frozen”误写成“进程已停止”。

## 1. 已确认（GitHub main）

- Source: [commerce-lab/packages/rp-capability](https://github.com/retailpulses/commerce-lab/tree/main/packages/rp-capability)，含 gateway、config、scripts、docs、tests。
- `gateway/server.py`：MCP stdio POC，`list_workspaces` 返回单个 POC root，不是完整 Registry。
- `gateway/capability.py`：`engineering.verify` 受限执行；还存在 `timesale` 子命令，不能假定无业务调用。
- [RUNTIME_375.md](https://github.com/retailpulses/commerce-lab/blob/main/packages/rp-capability/docs/RUNTIME_375.md)：CLI 安装、release/current/previous、状态、GitHub Actions 约定。
- [CAPABILITY_LIFECYCLE.md](https://github.com/retailpulses/commerce-lab/blob/main/packages/rp-capability/docs/CAPABILITY_LIFECYCLE.md)：历史生命周期 SOP；冻结后仅作参考。

## 2. 尚未核实（需 Mac mini 证据）

| 对象 | 状态 | 证据要求 |
|---|---|---|
| 当前安装的 release SHA / config fingerprint | Unknown | `rp-capability version` / `readback` |
| Codex MCP 注册和实际工具可见性 | Unknown | 脱敏配置 + fresh session |
| launchd、cron、后台进程 | Unknown | 本机只读清单 |
| GitHub Actions / CI 消费者 | 未完成全量审计 | 工作流与调用证据 |
| Time Sale / 其他 Provider 的生产调用 | Unknown | 代码引用 + 运行日志 |
| Gateway 停用是否影响业务 | Unknown | 停用前后 smoke |

## 3. Freeze 状态矩阵

| 维度 | 状态 |
|---|---|
| 产品新增功能 | **Frozen — effective immediately** |
| 新 Local Agent 强制接入 | **Prohibited** |
| 源码迁移 / 删除 | **Not planned** |
| 本机 MCP/CLI/服务 | **Audit pending; do not blindly stop** |
| 业务 Provider / Scheduler | **Preserve until verified** |
| 历史 Release / Audit | **Preserve** |

## 4. Safe Disable Runbook

1. 收集所有配置、调用者、日志、进程及当前/上一个 release SHA（脱敏）。
2. 分类：unused / legacy-required / unknown；unknown 不允许停用。
3. 对 unused 的 Codex MCP 注册和 Gateway 专属触发器做最小、可逆停用；先备份配置。
4. 重新启动 Codex，确认无需 Gateway 能执行 git status、读取 Issue/PR、定位正确 Checkout。
5. 对 legacy-required 业务调用做不写入生产的健康检查，确认无回归。
6. 写回真实执行证据、修改位置、回滚命令和剩余依赖。出现回归立即恢复原配置；不删除 State/Audit。

## 5. Agent Documentation Cleanup

- 审计全局及仓库级 `AGENTS.md`、Codex 配置、`MEMORY.md` 中 Gateway 强制路由和旧 Workspace 约定。
- 保留历史知识，明确标注 Historical / Superseded；当前 Agent 原则为 Direct-First。
- 不将 Gateway 文档批量复制到 Agent 启动上下文。

## 6. Sprint Acceptance

[.github#31](https://github.com/retailpulses/.github/issues/31)：M0/M1/M3/M4 需 Mac mini 实际证据。文档已创建不代表 Sprint 完成。任何保留的生产依赖都要在此列出 owner、原因及退出条件。
