# Retailpulses 治理 Canonical Backlog

本文件是 `retailpulses/.github` 治理整合及相关待办的统一审阅入口。返回[仓库 README](README.md)。

更新：2026-10-22（JST）。维护原则：本文件集中记录问题、目标、阶段、验收及待决策项；后续实施 Issue/PR 回链本条目，不再另建重复主计划。

**当前状态：PROPOSED / 待用户审阅。本文落入 main 仅代表计划已可供审阅，不代表整合已批准、实施或完成。** 现行治理权威仍按两个仓库当前 README 执行，未切换到新的目标架构。

## Backlog 索引

| ID | 事项 | 状态 | 依赖 |
| --- | --- | --- | --- |
| GOV-B01 | 将 rp-governance-kit 渐进整合到 .github | PROPOSED / 待审阅 | 用户审阅本计划 |
| GOV-B02 | 统一 README 模板与机器校验 | BACKLOG / 待定实施 | GOV-B01 确定权威位置及版本入口；可先形成提案，不要求等待全量迁移完成 |

## GOV-B01 — 治理仓库整合计划

### 1. 问题与目标

当前 `.github` 承担组织默认文件与指南，`rp-governance-kit` 承担治理规范、安装器、命令、检查和可复用 Workflow。职责划分已经写入两边 README，但同一内部治理目的分散成两个维护入口，增加检索、Agent 采用、规范一致性和跨仓库修改成本。

**建议目标：** `retailpulses/.github` 成为唯一活跃维护的中央治理仓库，同时保留 GitHub 原生默认文件及组织首页职责。逻辑边界用目录和文档表达，不再依赖两个活跃仓库。旧仓库最终保留历史与兼容用途，是否归档由明确退出条件决定。

**成功标准：** 使用者知道一个权威入口；新仓库/App 可以从统一模板开始；现有检查、安装和发布消费者能够继续工作，没有因迁移而绕过或失去保护。

### 2. 审计基线与证据范围

本次为 GitHub 默认分支代码/文档审计，不是生产执行验收。

| 对象 | 核查基线 | 发现 |
| --- | --- | --- |
| [.github](https://github.com/retailpulses/.github/tree/e684e20ddc3dceaf54011af04079e4e956de74ca) | `e684e20ddc3dceaf54011af04079e4e956de74ca`，30 个 blob 文件 | 默认 Issue/PR、SECURITY、AGENTS、组织 profile、指南、5 个 Draft 可复用 Workflow |
| [rp-governance-kit](https://github.com/retailpulses/rp-governance-kit/tree/308dc9f4cc71dca6cfa47e54a362dc6048de9d93) | `308dc9f4cc71dca6cfa47e54a362dc6048de9d93`，68 个 blob 文件 | 治理政策、YAML 注册表、模板、8 个 bin 入口、检查脚本、测试、5 个 Workflow |
| 同路径冲突 | 两棵完整 Git tree 对比 | 仅 `README.md` 与 `.gitignore` 同路径重合；语义重复远多于文件名冲突 |
| 下游引用样本 | 组织代码搜索，复核 CatalogSync / inbox 的 Workflow 命中 | 同时存在旧仓库 SHA 固定引用、`@main`、政策文档链接和安装痕迹 |

已核查关键证据：

- [安装器](https://github.com/retailpulses/rp-governance-kit/blob/308dc9f4cc71dca6cfa47e54a362dc6048de9d93/bin/rp-governance-install)：`KIT_REPO`、已安装检查与生成的 wrapper/文档入口依赖旧仓库；安装流程会写下游分支并开 PR，不能当只读盘点运行。
- [数据库治理 Workflow](https://github.com/retailpulses/rp-governance-kit/blob/308dc9f4cc71dca6cfa47e54a362dc6048de9d93/.github/workflows/database-governance-checks.yml)：内部再次 checkout 旧仓库。只改消费者的 `uses:` 不足以完成迁移。
- [VPS 发布 Workflow](https://github.com/retailpulses/rp-governance-kit/blob/308dc9f4cc71dca6cfa47e54a362dc6048de9d93/.github/workflows/vps-immutable-release.yml)：内部调用旧仓库 `post-deploy-governance.yml@main`。
- [.github Workflow 索引](.github/workflows/README.md)：5 个现有 Workflow 标记为 Draft；不能因接收迁入文件就把整个目录描述成 Stable。
- [采用清单](https://github.com/retailpulses/rp-governance-kit/blob/308dc9f4cc71dca6cfa47e54a362dc6048de9d93/docs/ACTIVE_REPOSITORY_ADOPTION_INVENTORY.md)：最后核验为 2026-08-31，含旧仓库名及 `.github`“仅组织元数据”的例外，不能当作当前完整消费者清单。

已见消费者包括 CatalogSync、commerce-ops、inbox、RPagentOS 等；这不是完整迁移名单。实施前必须枚举当前活跃仓库、默认分支、开放 PR、Workflow 引用、安装脚本和本地使用者，记录具体 ref、作用及验证方式。代码搜索受索引和结果上限影响，不能以“没搜到”证明没有消费者。未检查 GitHub Actions 设置、凭据权限、当前 runner 在线状态、实际触发历史或本地工具部署。

### 2.1 关键业务仓库依赖核查（2026-10-22 补充）

**范围：** 固定默认分支快照下的完整目录、全部根级 Workflow、治理声明、命中的当前政策入口、工具副本及相关治理脚本。另读取 CatalogSync 实际引用的旧 kit 历史 Workflow，而非用 kit 最新 main 代替。结果为代码级核查；未运行 CI、部署、数据库操作，未核验组织 Actions 设置和归档后的平台调用行为。

| 仓库 | 核查 commit | Workflow 结论 |
| --- | --- | --- |
| [commerce-ops](https://github.com/retailpulses/commerce-ops/tree/42e397088c681c3dacd395456f5a1dde7089ad4c) | `42e397088c681c3dacd395456f5a1dde7089ad4c` | 19 个根级 Workflow 均读取；未发现直接 `uses: retailpulses/rp-governance-kit/...`，不等于该仓库没有治理依赖 |
| [CatalogSync](https://github.com/retailpulses/CatalogSync/tree/a8e59f024f8ccbfe9fd962f45f5e564ae1dbcff4) | `a8e59f024f8ccbfe9fd962f45f5e564ae1dbcff4` | 10 个根级 Workflow 均读取；4 个直接调用旧 kit；其中 post-deploy 仅声明 `workflow_call`，未在该快照其他根级 Workflow 中发现其调用方，实际使用需查运行/外部消费者 |

#### CatalogSync：CI / 发布依赖清单

以下路径均位于 [CatalogSync/.github/workflows](https://github.com/retailpulses/CatalogSync/tree/a8e59f024f8ccbfe9fd962f45f5e564ae1dbcff4/.github/workflows)。

| 消费文件 | 旧 kit 目标 / ref | 迁移需要保护的接口 |
| --- | --- | --- |
| `governance-checks.yml` | `governance-checks.yml@f2696cf447ee52903938e580d299e4073093586c` | main PR 检查；固定历史行为、job/check 名称与 runner 需求 |
| `database-governance.yml` | `database-governance-checks.yml@6be2977b370975c117cce9ed1d1fb437518072d2` | DB 路径过滤、BLOCKING / PRODUCTION_GATE / ADVISORY 三类检查；不能迁移时降为仅提醒 |
| `post-deploy-governance.yml` | `post-deploy-governance.yml@12056e83066536fff6804209f049f6de4b107081` | environment、target、smoke 输入及 comment/artifact 行为；实际调用方待核实 |
| `deploy-vps.yml` | `vps-immutable-release.yml@main` | 手动 deploy/rollback、exact merged release SHA gate、production environment、adapter 接口、SSH secret 名称及并发保护 |

**传递依赖与版本风险：**

- 实际固定版本的 [database-governance-checks.yml](https://github.com/retailpulses/rp-governance-kit/blob/6be2977b370975c117cce9ed1d1fb437518072d2/.github/workflows/database-governance-checks.yml) 内部 checkout `retailpulses/rp-governance-kit`，ref 使用 `${{ github.workflow_sha }}`。迁移必须证明解析到正确的新仓库实现 commit，并校验脚本来源；只修改顶层 `uses:` 不够。
- `deploy-vps.yml@main` 的中央 VPS Workflow 进一步调用旧仓库 `post-deploy-governance.yml@main`。先固定经验证的来源版本及嵌套链，再迁移，避免中央 main 同时变化导致无法比较。
- CatalogSync 固定的历史 post-deploy Workflow 使用 ubuntu-latest；此前审计到的 kit main 版本使用 self-hosted 标签。不得直接用最新版本替代旧固定版本并宣称是“只换地址”，应明确兼容迁移与版本升级的差异。
- 历史 post-deploy 实现执行消费者根目录的 `bin/rp-deploy-closeout` 和 `bin/rp-repo-housekeeping`；缺失工具时可能 warning 后退出成功。因此 Workflow 绿灯不足以证明 closeout 和 artifact 已产生，需读回实际输出。
- CatalogSync 保留 7 个根级 `bin/rp-*` 工具；`.github/governance-ref.txt` 与 `governance/local.yaml` 均指向 `12056e83066536fff6804209f049f6de4b107081`，但两个检查 Workflow 固定不同 SHA，VPS 又为 main。**不存在一个可统一替换的“当前 kit 版本”。**
- `governance/local.yaml` 的 database/architecture owner、`AGENTS.md`、`CLAUDE.md`、`docs/16_*`、`docs/17_*`、`docs/18_*`、架构及部署说明需要同步新的政策位置。保留本地 `architecture` 配置、capability registry、invalidating surfaces、只读/最小权限限制，不用中央模板覆盖。
- 原生产发布的 adapter、SSH secret 名称、environment、权限和 runner 可用性均需验证；本核查未触发发布或查看 secret 值。

#### commerce-ops：App 级声明、工具与治理流程

| 依赖面 | 当前事实 | 整合 / 退役要求 |
| --- | --- | --- |
| 根级 CI / 发布 | 当前 19 个 Workflow 没有直接引用 kit；`phase0a-governance.yml` 调用本地 `scripts/ci/phase0a-pr-governance.py`，该脚本为 WARN 模式 | 保留本地治理及生产迁移/发布 gate；不能因为不存在 kit Workflow 就标记为“全部迁移完成”，也不应在仓库合并时额外安装一套强制检查 |
| App 级治理声明 | `apps/{orders,tickets,inquiry,ops-portal}/governance/local.yaml` 均引用旧 kit；orders version 为 `cd336f9ba787c985e175a2f7952a044342eed0fa`，另外三者为 `12056e83066536fff6804209f049f6de4b107081` | 四个 App 分别迁移并记录 ref 映射；orders 的 owned domain / workloads 和各 App 的限制必须保留 |
| 数据库政策入口 | 四个 App 的 `docs/16_DATABASE_GOVERNANCE.md` 均链接旧 kit `4eb1c7229ddee7b1cf2d813c6adbc86302615287` 的政策及中央 YAML 注册表；版本不同于 local.yaml | 区分“文档指针版本”和“安装/声明版本”；逐一映射，不凭 governance_version 批量升级所有政策 |
| 本地工具 | 四个 App 各有 7 个 `bin/rp-*` 副本，共 28 个路径；`rp-issue-work` / `rp-issue-audit` 包含旧安装器/ownership 指引 | 工具源码留在本地可运行；后续安装/升级使用新发布入口，路径与工作目录必须按 App 测试 |
| 目录假设 | closeout/housekeeping 副本按根级 `bin/`、`.github/` 或仓库 Workflow 名查找；现 monorepo 的工具实际位于 `apps/*/bin/` | 先验证真实调用 cwd 与参数；不得在同语义导入中顺便移动全部工具，也不能把探测不到治理文件判定为未治理 |
| 生产迁移及发布 | 业务 Workflow 使用本地脚本、release SHA、production environment 和 App 路径 | 不替换为 CatalogSync 的发布模型；保持既有 audit/apply 分离、精确版本与现有外部写入边界 |
| 中央 companion 工作 | Inquiry Phase / SYNC inventory 仍要求在 kit 更新 ownership/capabilities/access/workloads，并记录已有中央与本地 schedule/status 差异 | 权威切换时把未完成 companion 工作交接至 .github，保留原 Issue/PR 证据；搬仓库不等于这些业务差异已经修复或生产激活 |

四个 App 的治理指针和工具是 monorepo 中保留的独立路径，迁移时不得按旧 OrderMgmt/ticket-handling/inquiry-automation/ops-portal 独立仓库结构重新安装。历史审批 PR/Issue 链接保留旧地址作为证据，不机械改写成 .github 的相同编号。中央 YAML 中如仍存在旧业务仓库身份，只记录待 reconciliation；纯仓库整合不能隐式扩大权限、改 owner 或激活 workload。

#### 纳入 P3–P5 的必要 gate

1. **试点后先迁移低风险检查。** CatalogSync 普通治理/DB 检查各自建立 ref 映射，验证应通过/应失败 fixture、过滤范围、脚本来源及 check 名；新旧差异需要说明，不能静默升级。
2. **commerce-ops 单独处理 App 级采用。** 四套 local.yaml、政策入口及工具分别记录更新结果，保留现有本地 WARN/生产 gate。核心业务 App 不是全组织批量 installer 的试验目标。
3. **CatalogSync 发布链最后切换。** 完成 top-level + nested Workflow + internal checkout 全链映射，验证本地 adapter、environment、secret 名称、权限与 runner；先做无生产写入的 rehearsal，实际 release 验证需另获相应授权。
4. **区分退役和删除。** 当前不具备删除旧 kit 的条件。4 个 CatalogSync Workflow 是旧仓库可用性的明确消费者；归档是否影响 Actions 的调用/可用性须在实施阶段验证，不能靠链接能打开代替。
5. **归档前每个活跃依赖必须有处置。** 已迁移到新固定版本，或明确批准继续保留旧不可变 ref 且验证其可读/可调用；不能留下未解释的旧 `@main` 运行依赖。historical Issue/PR 链接不是应清除的“残留”。
6. **不夸大审计结果。** 没有直接 Workflow 引用不证明生产执行对旧 kit 绝无依赖。本轮为代码级结果；runner 本地安装副本、组织 Actions allowlist/required checks、开放 PR 使用的旧 ref、真实 run、release provenance 仍需 P0/P5 readback。

### 3. 目标内容归属及冲突处理

| 内容 | 建议目标 | 处理要求 |
| --- | --- | --- |
| 组织默认 Issue/PR、SECURITY、profile | 保留 `.github` 现有原生位置 | 首次导入不改默认行为，保留组织首页 |
| 治理政策与 YAML 目录 | 迁入 `docs/`，尽量保持 kit 原相对路径 | 保留 domain/workload ID 与语义；迁移不得被当作政策升级 |
| 安装器、命令、脚本、测试 | `bin/`、`scripts/`、`tests/` | 保留命令名与接口，修正 repository/ref 参数及内部依赖 |
| 可复用 Workflow | `.github/workflows/` | 原文件名优先，分别标注迁入来源、验证程度和消费者 |
| README / App / 架构 / 本地声明模板 | `templates/` | 沿用现有治理模板，README 扩展见 GOV-B02 |
| 根 README | 统一入口与目录导航 | 权威声明仅在正式切换阶段更新；历史正文保留于 Git |
| `.gitignore` | 合并保护规则 | 不覆盖任何现有忽略项 |
| 双方 PR 模板 | 原生 fallback 与安装模板逐项核对 | 两个位置可保留，但同一要求由一个模板源维护；避免首次导入改变所有下游 PR 表单 |
| 双方 Agent / Runtime / Frontend / Deploy 指南 | 逐主题判定权威与历史状态 | 旧 Draft/Reference 指南不能覆盖现行 kit 政策；保留有用内容，通过引用消除重复 |

GitHub 默认社区文件、README 模板和 Workflow 是不同机制：Issue/PR fallback 保持原生路径；README 通过模板生成与校验采用；可复用 Workflow 仍需要消费者显式调用。Agent 文件的跨仓库读取应由工具/本地指令明确接入，不能把 `AGENTS.md` 描述为 GitHub 对所有 Agent 自动强制执行的能力。

### 4. 分阶段执行

| 阶段 | 最小交付 | 退出 / 验收 |
| --- | --- | --- |
| P0 — 冻结基线与消费者清单 | 重新核查两个 HEAD、活跃消费者、开放变更、ref/版本与 runner/权限需求；确定文件映射及冲突清单 | 每类政策、工具、Workflow 有归属；消费者含准确路径/ref，不使用过时采用数作为验收 |
| P1 — 同语义导入 | 将 kit 必要文件及测试导入 .github；记录源 commit、目标 commit 与路径映射；保护已有默认文件 | 文件/行为 diff 已审阅；`bash tests/run.sh`、脚本语法、YAML、相对链接通过；旧入口继续工作 |
| P2 — 修复内部引用并验证新发布入口 | 修改安装器、模板、Workflow 内部 checkout/嵌套调用及测试中的旧仓库假设；确定版本命名，发布可固定引用的 commit/tag | 不存在新入口暗中调用旧 main 的遗漏；具备安装 dry-run/幂等/保护本地事实验证；在无生产写入的测试消费者中验证新 Workflow |
| P3 — 单一试点消费者 | 建议先用 store-ops 或隔离测试仓库验证只读/非部署检查；实际选择以 P0 依赖为准 | 新旧结果在相同输入下一致；应通过与应失败用例均验证；有 Actions run 证据与可用的引用回退方案 |
| P4 — 分批消费者迁移与权威切换 | 先普通检查/文档引用，再处理涉及发布的消费者；每仓库单独 diff 与验收；同步两边 README/AGENTS/采用指南 | 已迁移清单有 merge SHA、目标 ref、验证证据；唯一规范写入入口明确；旧政策文件仅保留兼容/历史说明 |
| P5 — 兼容收尾与可选归档 | 残留扫描、未迁移消费者处置、版本映射、旧仓库状态说明和恢复演练 | 没有未解释的活跃消费者；旧固定引用仍能访问；归档不破坏 Actions/checkout/嵌套引用；全部条件满足后才提出归档 |

P4 权威切换必须有明确生效 commit/日期并同步入口。P1/P2 的暂存内容应标明待切换，避免出现两个都自称现行权威且继续独立演进的来源。若兼容消费者仍需旧实现，只维护必要兼容修复并留出同步记录；不建立永久双向镜像系统。

**版本 / 历史约束：**

- GitHub 仓库地址不变更、不删除；建议新提交导入并记录来源，旧仓库保留完整历史。没有必要把 Git 历史物理合并作为首个阻塞。
- 旧仓库 commit SHA 不能直接用于新仓库；必须建立 `旧 repo/ref → 新 repo/ref` 的验证映射。
- 不移动或重写旧 tag，不做 `@main` 的盲目全局替换。新消费者使用经过验证的固定 SHA 或不可变发布 tag。
- URL 重定向不能代替对 `uses:`、`actions/checkout`、嵌套 Workflow 和 installer 的验证。
- 发布 Workflow 的验证与普通 lint 分开；不通过实际生产部署来“顺便测试迁移”。

### 5. 兼容、回退与边界

- 消费者切换前保存原 Workflow/声明及精确 ref；失败时通过明确的 revert PR 恢复旧引用。
- 新入口先在隔离环境验证；旧入口保留，迁移不应阻断既有检查或发布。
- 中央与本地声明保持现有边界：不覆盖本地架构事实、业务规则、例外或更严格限制。
- 治理基线继续遵守 GitHub Free 可运行原则；付费 ruleset/保护仅作附加防线。检查返回失败不自动等同于平台已强制阻止合并。
- 两仓库目前均公开；迁入前仍检查公开适宜性，不迁入密钥、客户数据或新的敏感运行资料。
- 重新评估 `.github` 的“仅元数据”治理例外：接收脚本和 Workflow 后，不再沿用该理由豁免其自身测试和工作区纪律。
- 本 Backlog 不授权执行生产部署、数据库变更、凭据变更、修改业务调度器、归档/删除仓库或全组织批量安装。实施另行按审阅结论及相应变更权限推进。

### 6. 最终完成标准

- [ ] .github 中规范、模板、命令与 Workflow 可从一个入口找到，中央治理只有一个活跃维护源。
- [ ] 原 kit 测试和迁移新增验证通过；GitHub 原生 fallback、组织 profile 和既有安全文件正常。
- [ ] 新旧政策没有无意语义差异；Draft/Reference/验证状态清楚。
- [ ] 新安装、已有安装升级、重复安装均验证；本地事实文档未被覆盖。
- [ ] 活跃消费者清单全部有明确结果：已迁移 / 有理由保留旧固定版本 / 已停用；例外可追踪。
- [ ] Actions 访问、runner、inputs、secrets、permissions、concurrency 和嵌套调用的实际兼容性已验证。
- [ ] 回退路径和 ref 映射可用；旧历史仍可访问，归档安全性有证据。
- [ ] CatalogSync 的 4 个 Workflow 及传递依赖、commerce-ops 的 4 套 App 治理声明/政策入口/工具，均按 §2.1 完成迁移或获准兼容处置。
- [ ] Canonical README、Agent 指令及 adoption 文档完成权威切换，主计划状态与事实一致。

### 7. 用户审阅决策

以下是建议选项，尚未批准。可直接在本节批注。

| 决策 | 推荐选项 | 替代选项 | 用户意见 |
| --- | --- | --- | --- |
| D01 最终维护位置 | .github 为唯一活跃治理仓库；旧 kit 仅历史/兼容 | 继续双仓库，仅统一导航 | 待审阅 |
| D02 导入方式 | 新提交导入必要内容，记录源 SHA/映射，保留旧库完整历史 | 使用 subtree 等方式导入完整历史；增加迁移复杂度 | 待审阅 |
| D03 旧库退出 | 满足 P5 条件后再决定归档，保留所有既有 ref | 长期保留公开、非活跃维护的兼容仓库 | 待审阅 |

## GOV-B02 — README 模板与机器校验

来源：本轮用户关于 README 内容统一、模板采用及 machine-level control 的讨论。此项与整合相关，但不能把新增校验行为混入 P1 的同语义搬迁。

**目标：** 形成“中央规范/模板 → 创建仓库/App 时采用 → 本地与 CI 校验”的接续。规范用简体中文，必要技术名词保留原文。

**范围：**

- 仓库、App、Package/子模块三类轻量模板；README 写用途、当前能力/限制、使用入口、最小运行/验证及权威文档导航。
- 详细设计/架构、Runbook、执行证据、Backlog 保留各自权威位置，README 只摘要与链接。
- 扩展现有 `governance/local.yaml` 声明组件与文档路径；字段 schema、版本、校验脚本和创建入口一并定义，避免另建重复注册系统。
- 复用中央安装器及 Governance Checks；本地与 Actions 调用相同校验实现。
- 新增/改动 App 严格检查存在性、必要结构、未替换占位符和本地链接；既有遗留内容先提醒，避免全仓库历史债务阻塞小改动。
- 新 App 识别结合仓库实际目录约定及组件声明；遗漏声明也能被发现，不能只检查已登记项目。
- 内容准确性、过长/日志式内容等语义问题先给 Review 建议，不靠标题存在就宣称内容合格。
- 不依赖 GitHub Team；区分检查失败、Agent/合并工具执行约束和平台级 required-check 的实际保障。

**验收：** store-ops 试点能发现“新增 App 无 README / 无声明”、缺少必要内容、坏链接及残留占位符；正确样本通过；模板不会覆盖已有 README；给出准确修复信息；运行成本与误报可接受后再扩展。状态仍为 BACKLOG，未创建模板、校验器或新 Workflow。

## 维护记录

- 2026-10-22：完成两个默认分支的目录、关键入口及下游样本核查；建立 GOV-B01 整合提案与 GOV-B02 后续项。仅计划记录，不计作整合进展。

- 2026-10-22：补充 commerce-ops / CatalogSync 固定快照审计、29 个 Workflow 的直接依赖检查、历史 Workflow 传递依赖和 App 级采用矩阵，新增关键业务消费者的退役 gate。未改动业务仓库或执行任何发布。
