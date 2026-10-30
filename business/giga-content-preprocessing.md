# Giga 商品内容规则 — Canonical Business Rules
状态：**Draft / Sponsor Review** · 版本：0.2 · 日期：2026-10-30
业务Owner：Product Content / Canonical Product Owners（个人待确认）
消费者：Canonical Copy、NPL、Product Center及其他Giga内容消费者。

本文只定义跨产品需要统一的商品属性语义与图片交付要求。字段来源见[Giga字段映射](../references/giga/data-dictionary-mapping.md)，优选代码入口见[GigaB2B Capability Registry](../references/giga/capability-registry.md#giga-content-preprocessing-assets)。规则已记录不代表运行时已实现。

## 属性含义与显示规则

### BUS-GIGA-COPY-004 — 同一商品属性只表达一次

在同一Variant、同一属性范围内，color / main_color / Main Color / 色 / カラー经明确映射可表达同一个主色；Natural与ナチュラル表示相同值时只显示一项。**主色、包装色、配件色不是同一个属性**，不能因为都叫“颜色”而合并。

同一规格重复出现在结构字段和正文时只合并该规格，不能连同同一段中的其他规格一起丢弃。来源出现互斥值时，按已有字段权威契约裁决；没有权威依据则标明具体冲突，不能擅定“最新记录”或“HTML优先”，也不能向买家同时断言两个互斥值。支持事实的来源仍须可追溯。

### BUS-GIGA-COPY-005 — 日文属性保持原意

面向日本买家的属性显示采用一致的日文含义。已核实示例：Natural→ナチュラル、Indoor→屋内用、Product Style→スタイル、Classic,Cute→クラシック,かわいい。Indoor不能扩成防水或户外能力，多值不能丢成一个值；品牌/型号/SKU保留其合法名称。

本Draft提议Location标签为“使用場所”，待业务评审；未知词不能凭空补造事实译文。完整词表与转换代码由能力Owner维护，不在本文再建平行词库。

### BUS-GIGA-COPY-006 — 商品尺寸与包装尺寸分开，轴向不得猜测

尺寸包含数值、单位、对象和轴向；产品本体与包装、净重与毛重、SPU通用值与精确Variant值不能混用。800mm=80cm，但80mm不等于80cm；单位未知不能补cm。

宽/深/高需要可信轴向依据，不能仅按内部字段名或数值大小推断。三值236/119/190且单位cm有来源、轴向未知时，按来源顺序表达“サイズ：236 × 119 × 190 cm”，不擅自重排或补宽深高。来源矛盾按具体事实保留和诊断。依据：[Lab #267](https://github.com/retailpulses/commerce-lab/issues/267)。

## 图片适用与交付规则

### BUS-GIGA-IMG-002 — 图片适用性以Variant为准

同一原图可以复用于多个Variant，但必须有通用图或对应Variant的适用依据；SPU同族或名称相近不能证明颜色/规格相符。Operator选图、排除和顺序代表商品展示决定；技术修复或生成交付图不得自行改变这些决定，不引入第二轮业务审批。

### BUS-GIGA-IMG-005 — 大图形成可用交付图，保留原图

**Sponsor于2026-10-30明确：超过10MB的图片必须压缩，上传Cloudflare R2并生成新URL；交付图默认尺寸为1600×1600。** 这是当前内部交付策略，不冒称Giga或全部平台的官方限制。目标平台有更严格约束时还须满足对应要求；不把这条理解为已上线。

原图保留，压缩产物仍对应同一商品/Variant，不能改变颜色、文字事实或擅自裁掉商品信息。发布使用处理后的交付URL；不能因来源已经登记到Canonical就继续提交超限原URL。图片选择与顺序保持Operator决定。

“10MB”执行时的精确字节定义、非正方形的保比例排版、较小原图是否放大、输出格式与压缩质量属于Owner TRD参数，须明确后验证；不得在实现中默默拉伸/裁切。R2 bucket、URL访问及处理脚本属于实现契约，不在business维护部署清单。实现缺口继续由[Store OPS #254](https://github.com/retailpulses/store-ops/issues/254)跟踪。

## 标题、SEO与文档边界

标题生成与审查沿用[NPL Design：共享标题](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/new-products-to-listing/docs/design.md#npl-title-copy)，不新增第二份Title Copy标准。旧Reset作为harvest证据见[既有handover](https://github.com/retailpulses/commerce-lab/blob/dd4cdad2d28300433cae488431ca2fa874de4400/docs/mercari/reset-copy-builder-handover-2026-10-08.md)，不自动恢复旧运行方式或门槛。

**源标题是事实参考，不是生成标题的措辞约束。** SEO关键词、词序、表达预算和A/B实验可以按产品策略演进；不能因“保留原题”而冻结标题，也不能在优化中改变属性事实或Variant适用性。实验、候选采用与发布行为由产品Design/TRD维护。

HTML解析、内容hash、Range/完整bytes检查、metadata repair请求关联、幂等与同输入差分测试属于Owner技术契约；不设BUS ID。相关调查和原14条拆分去向见[PR #67](https://github.com/retailpulses/.github/pull/67)，修复跟踪[#252](https://github.com/retailpulses/store-ops/issues/252)、[#253](https://github.com/retailpulses/store-ops/issues/253)、[#254](https://github.com/retailpulses/store-ops/issues/254)。不把故障复盘写成永久业务定义。
