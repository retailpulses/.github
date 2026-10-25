# Architecture Review Guide — Risk-proportional

Status: Pilot P0
Owner: retailpulses/.github
Sources: [Ten Architecture Questions](https://github.com/retailpulses/inbox/blob/main/system%20design/questions/README.md), [Review Agent Plan](https://github.com/retailpulses/inbox/blob/main/system%20design/playbooks/review-agent-plan.md), [Engineering Principles](ENGINEERING_PRINCIPLES.md).

## When to use
对跨系统集成、重大设计/迁移、外部写操作、生产运行或权限变更进行完整评审。小修复只回答相关风险项，不强制十项全填。先理解用户价值和系统变化，再读代码。

## Review sequence
1. **Intent**：用 1–3 句话复述业务结果、范围与非目标。
2. **Architecture delta**：哪些组件/职责改变，哪些刻意不变？
3. **Concrete workflow**：跟踪一个真实场景：trigger → input → behavior → state → side effect → observable result。
4. **Authority and ownership**：逐一回答下表的适用问题，标注 Verified / Assumed / Unknown 和证据。
5. **Acceptance & recovery**：将关键行为、失败、重复执行和运行验证转换成可观测验收标准。
6. **Implementation review**：最后检查代码、迁移和部署计划是否与目标一致。

## Ten architecture questions
| # | Question | Expected evidence / design artifact |
|---|---|---|
| 1 | Who owns it? | Component/domain owner、唯一写入者、边界 |
| 2 | What is the truth? | Desired / canonical / observed 的区分，source of truth，freshness |
| 3 | Who may change it? | Identity、scope、capability、trust boundary |
| 4 | How does it change? | State transitions、guards、invariants |
| 5 | How does information move? | Input/output、data flow、API/queue/worker、契约 |
| 6 | What if it happens twice? | Idempotency key、重复调用、ambiguous write |
| 7 | What if systems disagree? | Reconciliation、readback、conflict ownership |
| 8 | What if it fails? | Failure domain、blast radius、retry/rollback/recovery |
| 9 | How do we know? | Test vs deployed SHA vs actual runtime evidence |
| 10 | How do we change it safely? | Rollout、migration、cutover、rollback、old-path retirement |

## POC, stack and deployment review
- **POC**：明确 hypothesis、最小实验、通过/失败条件、限制和是否改变 Design；不得把 POC 代码默认升级为生产架构。
- **Technology selection**：优先调查现有内部能力、成熟开源/原生平台；记录维护成本、集成风险、可逆性、依赖锁定及为何不选更简单方案。重大不可逆取舍写 ADR。
- **Deployment**：列出 target topology、运行节点/托管平台、进程/worker/job、触发方式、Secrets 边界、健康检查、日志、备份与恢复。与 Current State 的已部署事实分开。
- **External contracts**：核查 [Foundational Reference Registry](../references/README.md) 的实际版本/范围，不以链接存在代替 API 验证。

## Review output (brief)
- Outcome / architecture delta / impacted owners
- Critical assumptions and their verification evidence
- Main risks, failure/recovery, rollout and rollback
- Acceptance criteria with runtime readback where applicable
- Unresolved sponsor **business** decisions (not API-fact verification delegation)

不要因为评审清单而扩大无关改动；没有适用风险的项目可以写 N/A。
