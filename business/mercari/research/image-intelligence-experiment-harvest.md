# 商品图片智能选择与排序：既有实验 Harvest（研究记录）

- **分类：** Canonical Research / Business Knowledge，**不是 Canonical Business Rule、已批准产品设计或实现授权**
- **状态：** Research / Evidence Inventory；部分历史 POC 已验证，产品化及当前运行状态未验证
- **As of：** 2026-11-13 JST
- **适用语境：** Giga 商品图片、Mercari Listing（Shop4 优先）；可供 Canonical Images / Product Center 与独立 Giga XLSX → Mercari CSV Web 应用参考
- **主记录：** 本文梳理历史证据、可复用代码及未解决问题，不复制或修改既有业务规则
- **相关产品：** [Store-Ops #312](https://github.com/retailpulses/store-ops/issues/312)、[Commerce Catalog & Listing #90](https://github.com/retailpulses/.github/issues/90)、[Canonical Images Epic #218](https://github.com/retailpulses/inbox/issues/218)、[Narrative Builder #313](https://github.com/retailpulses/inbox/issues/313)

## 1. 研究问题与结论

研究问题：在“图片尺寸过滤、图片选择、主图决定、图片排序”中，我们已有多少可复用的实验成果？**不依赖 LLM 时能做到哪里，哪些任务才需要 Vision/LLM？**

**已确认：** GitHub 中存在实际 OCR/视觉分析/图片语义角色/主图候选/叙事排序/编号排序实验与可执行代码。不能把这项能力定义为从零开发。

**证据限制：** 历史报告证明受控样本上的行为，而非今天 Mac mini 的最新生产运行、主分支完整能力或 Mercari Seller CSV 导入成功。特别是编号感知 M1 修复位于未证实合入主线的独立分支，而当前 `commerce-lab` 的 `source_sort` 仍以来源图、确定性去重、原始顺序及人工选择为主。

**待讨论的研究倾向（不是决策）：** 保持单独的 no-LLM 可用基线；是否把 Vision 建议作为默认排序、采用/审核门槛是什么、如何将 selection manifest 提升到 Canonical Images，都需要后续真实样本验证与产品决策。不得把这段研究自动升级成强制公司规则。

## 2. 已知实验结果（Evidence Inventory）

| 能力 | 真实证据与测量 | 不能由此推出的结论 |
|---|---|---|
| 尺寸图检测 | [inbox #27](https://github.com/retailpulses/inbox/issues/27)：8 张展示柜图片，OCR/表格结构/文字密度三信号加权；被人工确认的尺寸图得分 **0.559**，次高 **0.263** | 单商品正确并不代表跨类目检测准确率 |
| 多图 Narrative Builder | [5-Listing POC](https://github.com/retailpulses/inbox/blob/main/system%20design/artifacts/canonical-images-narrative-builder-poc-20261002.md)：5 个 Listing，89 图；预处理 **13.09 秒**；15/89 无需 Vision；清洁运行 **74/74** 有效结构化 Vision 观察；全程本地计算约 **20 分钟** | 74/74 是结构化输出成功，不是语义 100% 准确；实际发现模型材质臆测、遗漏排序位置和事实冲突 |
| 本地 Vision 模型对照 | [Narrative Builder v1](https://github.com/retailpulses/inbox/blob/main/system%20design/artifacts/canonical-images-narrative-builder-v1.md)：Q4/Q8 18 张共同图片精确角色一致 **16/18**，Q4 中位约 **6.5 秒/图**，Q8 约 **10 秒/图** | 样本小；不证明需要 Vision 的所有图片都可靠，也不证明 Q8 对任意任务都无价值 |
| 主图和角色覆盖选择 | [build_top1_proposal.py](https://github.com/retailpulses/commerce-lab/blob/main/apps/mercari/image_workflows/build_top1_proposal.py)：HERO、DIMENSION、FEATURE、USAGE、DETAIL/MATERIAL 的优先保留与 20 图上限处理；[inbox #313](https://github.com/retailpulses/inbox/issues/313) 记录 27 候选→20 选入、7 排除的受控 canary | 主要是特定商品/批次脚本，不能直接视为通用生产引擎 |
| 编号与叙事排序 | [Numbering Sequencing POC](https://github.com/retailpulses/commerce-lab/blob/main/docs/mercari/poc/numbering-sequencing-poc-report.md)：乒乓球 Point 1–4 与宠物笼 POINT/DETAIL/INNOVATION 的局部编号；先保连续编号，再施加图片数限制 | 编号层级有歧义时不能简单数字升序 |
| 编号 M1 修正 | [inbox #313 M1 checkpoint](https://github.com/retailpulses/inbox/issues/313#issuecomment-5977999990)：允许一张图含多个编号（例如 02/03），12/12 单元测试通过；[实验分支源码](https://github.com/retailpulses/commerce-ops/blob/issue313-numbering-m1/apps/timesale/local_offer/numbering_sequence_planner.py) | **未验证合入正常 Canonical Images preparation path**；不能把 shadow proposal 当 accepted Image Set |
| 已有 Image Set 操作 | [inbox #313 operator workflow](https://github.com/retailpulses/inbox/issues/313#issuecomment-5967937205)：本地 Image Sets 页面、请求记录、拖拽排序、排除/恢复与保存；[当前 UI 源码](https://github.com/retailpulses/commerce-lab/blob/main/apps/mercari/local_offer/image_sets_ui.py) | 历史本地 smoke 不等于今天运行可用或与独立 Listing App 已集成 |
| 已有尺寸/图片预处理工具 | [prepare_oversize_images_for_mercari.py](https://github.com/retailpulses/retailpulses-tool-services/blob/main/packages/mercari/prepare-images/prepare-oversize-images/prepare_oversize_images_for_mercari.py) | 历史脚本关联旧 Baserow/R2 流程，不应直接引入新 App 依赖 |

历史实验还记录两类必须保留的反例：① 当模型看到“当前图片序号”时，把图上的 Point 1 误判成位置 5，故**图中文字编号提取不可使用原排序作为识别提示**；② 当一个图片含编号 02、03 时，原算法误判 03 缺失，故**一张图可以映射多个编号，但在最终顺序中仍只能出现一次**。相关记录见 [#313 handoff](https://github.com/retailpulses/inbox/issues/313#issuecomment-5975470812) 与 [M1 checkpoint](https://github.com/retailpulses/inbox/issues/313#issuecomment-5977999990)。

## 3. 不使用 LLM：能力边界矩阵（研究判断，非产品规则）

“无 LLM”包括传统图片元数据/哈希处理、确定性图像算法和 OCR 引擎（如 Apple Vision 文本识别、Tesseract）。**OCR 本身不等于 LLM**；但若使用深度学习 OCR 或专用 CV 模型，其计算仍不等于纯规则处理。以下需区分“有确定性结果”和“统计信号/启发式猜测”。

| 子任务 | 不使用 LLM 能否做 | 实现方式 / 注意事项 |
|---|---|---|
| 读取 URL、HTTP 状态、实测字节、MIME、宽高、图片损坏 | **是，确定性** | HEAD 可初筛，必要时 GET/读取完整有效载荷；不可仅凭文件扩展名/HEAD 证明可用性；外部 URL 的可达性与 Mercari 远端可取仍不同 |
| 单图大小筛选、剔除超标图、保留清单 | **是，确定性** | 对当前候选的实际字节比较阈值；“排除本次 Listing 选择”不等于删除 Giga 或 Canonical 原图 |
| 图片 20 张限制、连续序号、重复 ID、图片数为零、CSV 顺序生成 | **是，确定性** | 记录 before/after 序号，保证唯一、非空、上限；保留操作者修改 |
| 完全相同图去重 | **是，确定性** | 下载并计算 SHA-256；URL 相同不代表文件内容永远不变；保留源位置/来源 |
| 近似重复图识别 | **可以生成候选，不能保证语义等同** | pHash/dHash、相似度阈值；裁剪、标注、局部规格变化可能引起误删，必须区分建议与硬规则 |
| 图片清晰度/亮度/长宽比/留白/文字密度 | **可度量；阈值是启发式** | Laplacian/梯度、像素统计等；低分不自动等于图片没有业务价值 |
| 文本提取（OCR）、尺寸关键词和数字单位探测 | **可以** | 识别「サイズ」「幅」「奥行」「cm」等，再与源规格交叉核对；OCR 易漏识别、错字、混淆数量与尺寸 |
| 图片中显式 POINT 1/2/3/4、STEP 等排序 | **部分可以** | OCR+正则+位置/组关系；清晰且单层的跨图连续编号可在严格约束下自动排序；多层父子编号、内嵌多编号、漏号、OCR 错号不能仅靠数字排序保证 |
| 主图候选选择 | **有限、启发式** | 优先源声明主图、首图、较清晰产品整体图或已有人工记录；没有可靠源标注时无法确定“买家最想点哪张” |
| 区分纯场景图、尺寸图、功能图、产品整体图 | **部分可以** | 尺寸/文字图可通过 OCR/布局强信号发现；纯视觉场景/用途/材质等语义分类不稳定 |
| 主观“信息量”及卖点价值排序 | **不能稳定完成** | 文本密度不等于商业价值，文字较少可能是优质主图；需要真实用户/运营评价或视觉语义模型 |
| 图文不一致、SKU 颜色/材质/零件错误 | **有限** | 结构化文本可做精确字符串/数值对照；视觉颜色受光照影响，材质与商品归属无法靠规则可靠确定 |
| 连贯购买叙事、跨图片语义关系、编号层级分组 | **只能做受限模板与显式规则** | 已知正确角色可按固定模板排；未知角色、隐含层级、同一功能连续介绍需要更丰富的语义证据 |
| Mercari 实际上传结果 | **本地程序不能证明** | 完整 URL/字节/规格预检只是必要前置；Seller 导入结果和回读是另一项外部事实 |

**能力分界：** no-LLM 最强项是**可用性保障、技术排除、去重、数字/文字显式证据、严格顺序完整性**；其瓶颈是 **商品主图优劣、视觉角色、图文事实一致性、信息价值、复杂叙事与编号上下文**。通过专用 CV 模型可以改善部分瓶颈，但“无需 LLM”本身不意味着“零 AI”或“零维护”。

## 4. Shop4 相关现状：不要与研究结论混为业务规则

- [store-ops #312](https://github.com/retailpulses/store-ops/issues/312) 独立 Giga XLSX→Mercari CSV 应用的当前设计方向：原始 Giga URL、按图片字节/兼容性筛选、允许人工调整封面与顺序、Image Selection Manifest，默认不要求 Canonical Images 工作者或重新托管。**这是另一个产品现有方向，不因本研究自动修改**。
- [Store-Ops #307](https://github.com/retailpulses/store-ops/issues/307) 的历史 Shop4 样本：19 行中 14 行图片获取失败；调查显示其中有超限图片，也有低于阈值仍失败的行。因此“超大图片是重要因素”比“所有失败都因大于 10 MB”更符合证据。
- [现有 Mercari CSV 规则](../listing-csv-and-batch-publication.md) 的官方依据记载单图 **8 MB**、单商品最多 **20 图**；独立 app 设计使用更保守的内部字节阈值。**保留官方限制、内部安全阈值和用户最初 >10MB 根因假设三者区分**，不可互相替代。
- 执行上可研究两条平行路径：No-LLM 输出“可用且保留已知顺序”的 CSV 候选；可用的 Vision/AI 再提供“更好主图/排序”的版本化建议。任何自动采用、人工覆写优先级、以及 Canonical Promotion 机制均**尚待产品决定**。

## 5. Harvest 建议与可验证的下一步（均为提议）

1. **代码收敛：** 审核 `commerce-ops/issue313-numbering-m1`、`commerce-lab/image_workflows` 与 `source_sort` 的可移植纯算法及测试；记录哪些已进 main、哪些仍为 shadow/单 SKU 脚本。不要直接复制整套旧 runtime。
2. **固定回归集：** 乒乓球 `N509P458055A`、宠物笼 `TX531558AAA`、电动沙发 `N508P402344E`、阁楼床 `S512P187643A`；增加实际 Shop4 失败的超限图/低于阈值仍导入失败图作为分离的 delivery 测试集。
3. **跑 no-LLM 与 Vision 对照：** 统一输入、图片池、人工 gold order；比较技术故障过滤、角色识别、编号恢复、漏图、错误主图、人工修正次数、单 Listing 时间/算力、Seller 接受率。不能只比较 OCR/模型 JSON 解析成功。
4. **决定产品边界：** 再讨论 AI 建议是否默认执行、无模型可用时回退源序还是保留先前人工序、何种冲突转人工、是否需要给 Canonical Images 提交 Promotion Proposal。
5. **不新增平行 SSOT：** source metadata、历史/模型证据在现有 owner；每批 Listing Image Selection Manifest 保留来源 ID、原 URL/序号、实际检测结果、选/排原因、最终序号、规则/模型版本、操作者覆写与批次身份；长期 Canonical 接收需有独立所有者验收。

## 6. 未决问题

- 既有 Narrative Builder、M1 编号排序算法在**当前部署**的 Canonical preparation 路径是否被调用？以代码调用图和实时 replay 验证。
- 无 LLM 的 OCR/正则检测，在当前多类目 Shop4 真实图片上，尺寸/主图/编号的 precision、recall 和错误自动改序率各是多少？
- 是否足以仅用来源主图声明 + OCR + 明确编号完成本次目标？复杂排序对 Shop4 销售转化提升是否可测？
- URL 8MB 以下仍失败的真实原因是 CDN 可达性、鉴权/有效期、编码/格式还是其他平台行为？
- 自动排序结论是否进入 Listing Web 的默认选择、仅建议，或先 shadow？这需要独立产品审查，不由研究文档决定。

## 7. 来源索引

- [inbox #218 — Canonical Product Images Epic](https://github.com/retailpulses/inbox/issues/218)
- [inbox #313 — Narrative Builder 研究及后续实验](https://github.com/retailpulses/inbox/issues/313)
- [inbox Canonical Images Narrative Builder v1 Design](https://github.com/retailpulses/inbox/blob/main/system%20design/artifacts/canonical-images-narrative-builder-v1.md)
- [inbox 5-Listing POC](https://github.com/retailpulses/inbox/blob/main/system%20design/artifacts/canonical-images-narrative-builder-poc-20261002.md)
- [commerce-lab Numbering Sequencing POC](https://github.com/retailpulses/commerce-lab/blob/main/docs/mercari/poc/numbering-sequencing-poc-report.md)
- [commerce-ops isolated M1 planner](https://github.com/retailpulses/commerce-ops/blob/issue313-numbering-m1/apps/timesale/local_offer/numbering_sequence_planner.py)
- [commerce-lab image_set_prepare_worker](https://github.com/retailpulses/commerce-lab/blob/main/apps/mercari/local_offer/image_set_prepare_worker.py)
- [store-ops #307 Shop4 images failure evidence](https://github.com/retailpulses/store-ops/issues/307)
- [store-ops #312 independent Giga Listing Web](https://github.com/retailpulses/store-ops/issues/312)
