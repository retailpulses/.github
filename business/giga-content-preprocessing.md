# Giga Product Content Preprocessing — Canonical Business Rules
状态：**Draft / Sponsor Review** · 版本：0.1 · 日期：2026-10-30
业务 Owner：Product Content / Canonical Product Owners（角色，个人待确认）
适用消费者：Canonical Copy / Reset、NPL、Product Center，以及其他消费 Giga 商品内容的产品。

本文件作为 Giga 文案事实与图片预处理的共享业务规则草案，harvest 已有 Reset / Canonical Images 的有效能力、已确认产品决定及近期缺口。**不是 Giga 官方字段字典，也不宣称全部规则已经实施。** 代码、函数、脚本、测试、核实 SHA 与实现缺口唯一登记在 [GigaB2B Capability Registry](../references/giga/capability-inventory.md#giga-content-preprocessing-assets)。外部字段映射见 [REF-GIGA-DATA](../references/giga/data-dictionary-mapping.md)，API 版本见 [REF-GIGA-OPENAPI-2](../references/giga/open-api-2.0.md)。

## 1. 权威、粒度与范围

- 本文定义跨产品的“事实如何保全、归一、去重和形成可用图片”的业务不变量；产品 Design/TRD 引用稳定 BUS ID，补充各自生成、UI、队列、模板及发布细节，不再复制可独立修改的共享规则。
- Giga 是采购平台/内容来源，不是 Retailpulses Seller。身份粒度沿用 [BUS-PROD-001–004](marketplace-model.md)：SPU1、Variant、Marketplace Listing 分开；产品级通用事实不能无依据变成每个 Variant 的精确事实。
- 原始来源、规范化事实、买家文案、图片原资产和交付衍生资产分别保留。预处理不代表业务审批、模型评分或发布授权。
- 文字风格、SEO排序/预算、FABG创作策略、模型/provider、shop boilerplate及审查UI仍由产品设计维护。本次纳入的是这些产品共享的事实预处理，不把整个文案产品迁入组织Registry。
- 文档批准、旧代码存在、某项测试通过和消费者Runtime已满足规则是不同事实；各资产状态见registry，各次执行证据归Issue/PR/CI。

## 2. 文案事实预处理

### BUS-GIGA-COPY-001

**原文、身份与来源必须保全。** 原始标题、description/HTML、features、specification字段及结构化事实分别保留；规范化结果不覆盖原始值。每个派生项可回溯来源字段、记录/版本、Item Code/Variant、观测时间及适用范围；缺少来源或范围明确标未知，不能补造。

Giga完整原标题不能被identity标签替代或因“身份已代表”而从来源上下文丢弃。源标题是参考事实，消费者生成标题是另一角色；当前/候选属于生成内容的版本。产品可控制哪些词进入买家标题，但必须保留原文供对照，不自动拼入或fallback为发布标题。

### BUS-GIGA-COPY-002

**清洗排版，不清掉商品信息。** HTML解析须保留表格键值、段落及列表边界，解码实体、规范空白和项目符号，去掉可辨识的页面布局编号。清洗输出与原文分开；不能直接用通用正则删掉所有数字、括号、英文或冒号。

例如“Feature 01：収納棚付き”可清成“収納棚付き”，但“1cm”“1200g”“2段”“306°”不能作为编号删掉。HTML表格与正文中同一规格可以归一，不能将HTML存在当成它比Variant结构字段更权威的理由。

### BUS-GIGA-COPY-003

**先恢复完整内容，再按语义分区。** 从有效结构字段、HTML表格、正文和嵌入features中的规格恢复信息，区分卖点/叙述、确定性规格、assembly、caution。事实应进入正确分区，不能因为已经写在另一个字段就整块排除包含其他信息的map/HTML。

如“色：Black、幅：80cm、耐荷重：20kg”中的颜色重复，只合并颜色，保留80cm和20kg。原始features与description-derived features要按具体信息覆盖判断，不以“数组项数较多”单独证明更完整。卖点数量、摘要长度等创作偏好不能反过来静默裁剪共享预处理事实。

### BUS-GIGA-COPY-004

**按语义和值去重，保留全部证据。** 同语义属性经受控归一后同值，只形成一个显示项并关联所有支持来源；同标签不等于同语义，数字相同也不等于同事实。color / main_color / Main Color / 色 / カラー可按明确映射归入颜色，但包装色、主色、配件色须先核实范围。

Natural与ナチュラル在同Variant、同颜色语义下可合并。材质、产品尺寸、包装尺寸、净重/毛重等不能只按值合并。不同值先适用已核实的来源/Variant权威契约；无法裁决时保留具体冲突及来源，不擅取最新/HTML/shop1，也不在买家正文同时断言互斥结果。

去重发生在可追溯的事实规划层，输出/coverage与合并后的语义一致；不能只删最终一行而把被合并来源伪报丢失，或用两个source_id证明重复行有业务价值。

### BUS-GIGA-COPY-005

**日文化采用受维护的明确映射。** 事实的原语言/值保留，显示标签和值在独立层处理；先复用成熟Reset词表，不以新prompt替代确定性词映射。已验证参考行为包括：

| 来源 | 日文规范化示例 | 说明 |
| --- | --- | --- |
| Natural | ナチュラル | 同一颜色语义内归一 |
| Indoor | 屋内用 | 保留使用范围，不扩成防水/户外能力 |
| Product Style | スタイル | 属性标签映射 |
| Classic,Cute | クラシック,かわいい | 逐值保留，两词不能丢成一个 |

Location标签的日文化是旧基线真实缺项，**本Draft提议显示为“使用場所”**，不是声称旧Reset已实现。多值可规范分隔符，但不改变含义、数量和相对顺序。品牌、型号、SKU等合法英文不一律翻译；未知属性/术语不得自由生成事实译文，可保留来源并给出明确待映射诊断，消费者决定是否从自动正文省略，不能静默抹掉源信息。

### BUS-GIGA-COPY-006

**数值、单位、方向和适用范围共同决定含义。** 明确单位才可确定性换算；例如800mm=80cm，但80mm≠80cm，1200g=1.2kg。不得从字段数值相似推断单位，也不得把包装尺寸当本体尺寸、SPU通用规格当精确Variant规格。

有可信轴向依据时可标宽/深/高；缺可靠方向依据时用来源顺序的无方向“サイズ：236 × 119 × 190 cm”，前提是三值及cm都有来源支持。不得按数值大小重排，不得因内部width/length字段名便断言方向；单位未知不补cm。原题与结构字段矛盾须保留证据并诊断，不能选一个方向假装一致。相关事实追溯：[commerce-lab#267](https://github.com/retailpulses/commerce-lab/issues/267)。

### BUS-GIGA-COPY-007

**已知错误规则必须精确，内容路由不得冒充删除。** 活跃策略若明确认定完整尺寸组合[1,1,1]为占位错误，只按完整条件处理并记录规则/原因；不能删除任意合法1cm。保留条件、否定、范围及限定词，不能把“微调”变成“任意调节”。

价格、库存、运费、店铺承诺和促销不混入共享产品事实正文；它们仍有各自数据/商业/模板Owner，并非源事实无效。Warranty等是否呈现按已有产品策略处理，不在本共享规则发明全平台一律禁止。覆盖/语言/一致性诊断用于解释和修正，不变成额外人工审核、评分或统一拒绝候选的门槛。

### BUS-GIGA-COPY-008

**确定性准备与创作分工，继承行为而不只继承名字。** 模型可按产品策略组织表达，不能承担本应可重复的字段解析、受控译词、单位换算及精确去重。语义检查不要求生成措辞逐字等同旧结果，但应证明上述事实没有因provider/架构变更丢失。

消费者升级用同一输入对照来源、合并项、分区和重要词/数值；KEEP/ADAPT/DROP及其依据记在现有TRD/PR。记录源实现和策略版本、实际消费项及剩余差异。不得把配置中出现LOCALIZE_DEDUP或Reset-compatible标签当作行为证明；没有消费的配置明确标注。重建产生新候选，保留人工当前标题/description、图片、历史发布快照；本规则不授权自动采用或更新线上Listing。

## 3. Canonical Images 预处理与交付

### BUS-GIGA-IMG-001

**原图获取、登记与平台交付是不同结果。** 来源需关联精确Variant/Item Code，保存URL/来源顺序、内容hash、真实格式、像素和完整字节量。已有有效资产/图集先复用；Canonical manifest缺图时由Canonical owner通过已登记Open API 2.0能力回源，消费产品不各自重建下载/主库。

原图可以采用external_reference；“登记到Canonical”不等于已上传自有存储、生成了新URL或压缩完成。临时下载文件不是持久交付资产，URL可读或返回200也不证明可发布。

### BUS-GIGA-IMG-002

**以内容身份去重，以证据约束适用性。** 相同内容hash可复用资产并保留各来源观察/绑定；相似图、同URL或同文件名不能直接证明字节相同。保留来源邻接关系和稳定初始顺序；不把所有来源URL数量与去重后的资产数量强行对齐。

SPU通用图只有明确适用证据才可供某Variant使用，不能按名称相近自动绑定。Operator选图/排除/排序是业务决定，保存应记录该决定，不要求第二位Reviewer或另一轮Canonical业务审批。

### BUS-GIGA-IMG-003

**补元数据不得改变来源基线或人工决定。** 已有资产缺宽高/bytes/格式时，可以按原资产/hash/来源核实并幂等补齐；不覆盖有效metadata，不替换绑定/内容，不创建假“新图”或重置选择。

修复任务的URL列表可能只是子集或不同顺序，不能代替创建图集的完整来源manifest。关联“最新请求”不等于关联“来源创建请求”。来源没变时，metadata repair不能触发假source_changed；真实资产新增/删除/替换须给具体差异并保留人工意图。参照[store-ops#253](https://github.com/retailpulses/store-ops/issues/253)。

### BUS-GIGA-IMG-004

**区分原图可用、选图已保存与平台交付可用。** 原图metadata完整、active、Variant绑定有效和人工accepted，不自动等价平台字节/格式要求满足。消费者分别读取这些事实，不以同一个ready/accepted布尔值覆盖所有含义；本文件不规定新增全局状态机。

平台profile记录目标平台/API、规则来源/验证时间、格式/像素/字节约束及处理版本。外部要求归官方资料与references；不是Giga供应商规则，也不是固定给所有平台同一个上限。历史NPL大图要求与案例见[store-ops#254](https://github.com/retailpulses/store-ops/issues/254)及产品NPL-17，执行差异见registry。

### BUS-GIGA-IMG-005

**不合平台条件的原图应形成可追溯衍生交付图。** 保留原资产/hash，转换产物记录original→derived关系、处理profile/版本、实际bytes/格式/像素、内容与Variant绑定、稳定可读取的交付URL。压缩/缩放不能未经选择裁掉图片、调换顺序、改变颜色/文字事实或替换成另一个Variant。

使用Owner已有受控处理/持久存储能力；Cloudflare R2等是实现选择，不是新的存储品牌gate。只有来源原图已满足该平台profile时才可直接外部引用；不能把public_url缺失一律fallback成不合条件的原URL。没有转换/上传/readback证据，不得标交付完成。本Draft不声称现有source_sort已实现衍生交付。

### BUS-GIGA-IMG-006

**检查实际提交图片，并保持可恢复性。** 发布预检使用选中交付资产及其完整字节量；Range返回Content-Length=1024只说明这段响应长度，文件总长度要看Content-Range总数、经核实metadata或受限完整读取。未知不补0、不假称验证通过；错误指出具体资产/位置及条件。

候选原图可多于平台单次发布上限，约束作用于实际selected/payload，不能因有38个排序位置就把14张选择判成超限。选图顺序与连续发布位置、Variant绑定及交付引用在保存/刷新/预览/快照中一致；重复/中断只补未完成登记，不删除历史错误、不覆盖发布快照。无真实来源变化不要求重选/重复批准；生成交付图本身不授权发布。

## 4. 跨产品验收示例

这些是共享规则示例；实现测试属于Owner repo及其既有Test Catalog，不新增组织运行门槛。

| 输入 / 事件 | 必须保留或得到的结果 | 关联 |
| --- | --- | --- |
| color=Natural、main_color=ナチュラル，同Variant同颜色 | 一个颜色显示项、两来源可追溯 | COPY-004/005 |
| 规格map颜色重复，另有宽80cm/耐荷重20kg | 只合并重复颜色，保留两个数值规格 | COPY-003/004 |
| 产品宽1cm，高80cm，长40cm | 不因1cm单值匹配组合占位规则 | COPY-006/007 |
| 三边顺序236/119/190、单位cm、无可信轴向 | 无方向尺寸；不猜宽深高 | COPY-006 |
| Location=Indoor；Product Style=Classic,Cute | 已知值日文化、两种风格保留；新标签映射明确版本 | COPY-005 |
| 完整原题与简短identity并存 | 原题仍可追溯，预处理不以identity取代全文 | COPY-001/008 |
| 43个原URL→38个内容资产→仅修复38URL | 完整来源基线不变；14张选图不因38项排序被拒 | IMG-002/003/006 |
| 同hash资产缺尺寸→补齐 | set、绑定、人工顺序不被重置；重复修复幂等 | IMG-001/003 |
| JPEG签名正确但完整图12,597,886字节，不满足目标profile | 不因首1KB可读就通过；生成合格衍生图，原图保留 | IMG-004/005/006 |
| 交付图生成后出现新候选或人工再排序 | 历史发布快照不变；未来明确选择才使用新组合 | COPY-008、IMG-006 |

## 5. 实施状态、Owner与引用方式

- 共享业务定义归本文；经过比较的推荐复用入口、适用范围与未覆盖能力见 [REF-GIGA-CAPABILITY](../references/giga/capability-inventory.md#giga-content-preprocessing-assets)。本文不另维护可变的部署/任务计数。Registry只保留优选能力；历史实现与比较过程在变更PR，不能把发现清单视为canonical。
- 消费产品在现有Design说明应用哪些BUS规则；TRD给适配、调用与一致性细节；Test Catalog用上述业务输入形成正确结果断言；Current State据实际源码/Runtime列未实现项。引用不等于已经迁入，不能仅写“使用Reset”。
- 原Reset配置/source SHA可作为harvest基线，不将旧local-model/Gateway、已撤回评分/ACCEPTED gate或旧scheduler复活为新依赖。旧译词/去重也不是对所有领域都完美，未知与有意差异需明确。
- 定位/执行实现前先读registry里的Owner代码；本PR不创建shared package、复制运行代码、迁移DB、生成模型候选、触发图片修复或写Seller。

## 6. 来源与待审项

来源：[组织RCA #66](https://github.com/retailpulses/.github/issues/66)、[NPL harvest #203](https://github.com/retailpulses/store-ops/issues/203)、[标题 #243](https://github.com/retailpulses/store-ops/issues/243)、[#252](https://github.com/retailpulses/store-ops/issues/252)、[#253](https://github.com/retailpulses/store-ops/issues/253)、[#254](https://github.com/retailpulses/store-ops/issues/254)、[调查PR #255](https://github.com/retailpulses/store-ops/pull/255)。固定源模块/版本在registry列出，不在这里复制源代码和整套译词表。

**待评审**：本组规则的跨产品canonical地位与业务Owner；Location→使用場所的新标签；未知词自动正文呈现的产品策略；消费者落实/历史候选修复范围。尺寸方向规则为已确认方向，本文harvest不重新要求Sponsor决定。各平台profile精确边界、衍生交付实现及存储环境仍由相应Owner核实；文档评审不能被写成已上线。
