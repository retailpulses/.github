# WeCom Shared Capability Registry

- **ID**: REF-WECOM-CAPABILITY
- **Owner**: Engineering / `retailpulses/.github` (发现与契约索引；执行代码仍归产品仓库)
- **Status**: Reference / POC pending；**不代表已验证可用**
- **Updated**: 2026-10-28
- **平台**: 企业微信（WeCom）

## 业务对象与能力边界

| Capability | 适用范围 | 当前证据/状态 | 主要消费者 |
|---|---|---|---|
| External Customer Group Messaging | 员工账号向含外部供应商的客户群发送消息；**官方客户群群发 API 优先** | POC 待执行；群精确寻址、员工确认、频率与可见身份待核实 | Seller Coordination / commerce-ops #318 |
| Group Robot Webhook Notification | 允许添加群机器人的群、运维与业务告警；不等于外部客户群 | 多仓库有 webhook 调用代码；运行和外部群适用性未证实 | Orders, Inquiry, Tickets, CatalogSync, VPS health |
| CLI / Workspace Integration | CLI 消息、文档、文件等；与客户群发送不同能力 | inbox #468 Mac mini 安装及只读 POC 待验证 | Restock Sorter 等 |
| AI Bot SDK | 机器人会话、主动发送、WebSocket | Sponsor 已确认 AI Bot **不能加入现有外部供应商客户群**；不作为本次发送方案 | 未来可选 |

## 官方参考与开源参考
- [企业微信开发者中心](https://developer.work.weixin.qq.com/)：客户联系、客户群、客户群群发的当前接口契约以官方为准。
- 候选官方接口：`externalcontact/add_msg_template`（**待核对实际群选择能力及人工确认步骤**）。
- [WecomTeam/wecom-cli](https://github.com/WecomTeam/wecom-cli)：官方团队 CLI；不推定其 AI Bot 消息能力覆盖外部客户群。
- [WecomTeam/wecom-unified](https://github.com/WecomTeam/wecom-unified)：Agent Skill；消息发送依赖近期可访问会话。
- [WecomTeam/RobotSample](https://github.com/WecomTeam/RobotSample)：Webhook 机器人示例；不代表外部客户群可用。
- [WecomTeam/aibot-node-sdk](https://github.com/WecomTeam/aibot-node-sdk) / [wecom-aibot-python-sdk](https://github.com/WecomTeam/wecom-aibot-python-sdk)：AI Bot SDK，非本次 POC 路线。

## 已知内部代码参考（未作当前运行核验）
- [commerce-ops Orders webhook sender](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/workers/mercari-reporting/src/wecom.js)
- [commerce-ops Inquiry webhook client](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/apps/worker/src/clients/wecom.ts)
- [inbox #468](https://github.com/retailpulses/inbox/issues/468)：CLI read-only baseline
- [.github #60](https://github.com/retailpulses/.github/issues/60)：外部客户群员工账号发送 `test` POC
- [.github #38](https://github.com/retailpulses/.github/issues/38)：组织级 Capability Discovery

## 共享契约与消费策略
- **发送**与**读取回复/附件**分别验证，不混为一谈。
- 群路由以 Seller ID → 已核实的群映射为目标；不能假设客户群群发 API 具备单群定向能力。
- 发送状态区分任务创建、员工确认、群内可见、对方已读；仅记录可实际观测状态。
- 不建立新 Gateway 或 Shared Package；优先在消费方使用官方 API 的最小 Adapter，证据成熟后再考虑共享。
- Credential 仅在运行环境管理；Registry 不存 Token、Webhook Key、聊天记录、客户信息。

## 未解决事实
1. 员工身份与企业应用权限能否调用客户群群发 API？
2. 能否**精准选择一个指定外部客户群**，且不会影响其他群？
3. 员工是否必须在客户端确认发送？
4. 对同一群的频率/额度限制，以及消息是否实际显示为该员工发送？
5. 后续 5–8 群的稳定映射和诊断机制是否满足业务需求？

验证与更新以 [.github #60](https://github.com/retailpulses/.github/issues/60) 为准。
