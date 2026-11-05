# Canonical Product & Marketplace Model (Draft)
状态：Sponsor Review · 日期：2026-10-30

## Retailpulses internal product identity
| ID | Term | Definition / Boundary |
|---|---|---|
| BUS-PROD-001 | SPU1 | Retailpulses 主产品聚合身份；Hero SPU1 的运营范围包含其所有 Variant 及对应 Listing；不自动等同于任何平台商品组 |
| BUS-PROD-002 | Product Family | 跨产品分组概念，正式业务定义与 Family/SPU1 关系仍待 Sponsor 确认；不得按名称推断 |
| BUS-PROD-003 | Variant | 内部 SKU 级产品身份，关联 Item Code、规格、成本与共享内容；一个 SPU1 可含多个 Variant |
| BUS-PROD-004 | Marketplace Listing | Marketplace + Shop 下的商品实体，可关联内部 Variant；标题/价格/类目不是身份主键 |

## Marketplace-native identities
| ID | Term | Official / evidence-based semantics |
|---|---|---|
| BUS-MKT-001 | Shop / Offer | Shop 为平台店铺；Offer 为销售条件/观察；Offer 与 Listing 的对应关系依适配器契约，不默认 1:1 |
| BUS-MKT-002 | Mercari Category ID | 平台定义的 Category ID；内部管理来源、映射、适用版本和核实时间，不能将其当作 Product Family |
| BUS-MKT-003 | Mercari Product / 種類 (Variant) | 官方一个商品可以设置多种「種類」，CSV 将其标为 SKU；每种可含名称、数量、JAN/管理码等。官方说明一个商品最多 10 种（以当前指南为准）。[Mercari guide](https://support.mercari-shops.com/hc/ja/articles/900006408263-%E7%A8%AE%E9%A1%9E%E3%81%A8%E5%9C%A8%E5%BA%AB%E3%81%A8%E3%81%AF) |
| BUS-MKT-004 | Mercari 商品グループ | 同一 Shop 内关联多个独立商品，供买家在同一页面切换；官方目前法人店铺可用，最多 10 件，须满足指定分类约束。**不是** Product Variant，也不自动等于 SPU1 或内部 Product Family。[Official guide](https://support.mercari-shops.com/hc/ja/articles/39467798476569-%E5%95%86%E5%93%81%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E7%AE%A1%E7%90%86%E6%A9%9F%E8%83%BD) |
| BUS-MKT-005 | Rakuten Item / SKU | 店铺商品层级与 SKU 层级必须分别建模。现有 StoreOps Rakuten CSV 观察字段包括 `商品管理番号（商品URL）`、`商品番号`、`SKU管理番号`，但其完整官方约束仍待 RMS 官方文档/API Schema 核实，不声称等价于内部 SPU1/Variant。[Code evidence](https://github.com/retailpulses/store-ops/blob/main/tests/test_listing_review_observation.py) |

## Identity mapping rules
- `internal SPU1 → Variant → platform Shop/Product/Variant/Group` 是有证据的映射，不是直接重命名。Mercari 商品的「種類」与商品グループ属于不同层级。
- Mercari Product Group 的管理 ID、Category ID 和组内商品 ID 分别保存；同类目约束及商品数量上限按官方最新规则核验。
- Rakuten Item / Child SKU 在可验证 RMS 官方资料前标 **PARTIALLY VERIFIED**；CSV 字段存在不等于官方语义和 Cardinality 已验证。
- 类目与商品标题的更改不改变内部身份；发布前验证平台类目和具体目标。

<a id="product-content-rules"></a>
## 共享商品属性与媒体

适用Canonical Copy、NPL、Product Center及Giga商品内容消费者；保留BUS-GIGA ID作为稳定引用。以下为共享规则草案，文档登记不代表运行时已实现。

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

**商品媒体归产品域，Listing仅记录发布位置；SPU共用图片保持一份资产，Variant通过适用关系引用。** 同一原图可以复用于多个Variant，但必须有通用图或对应Variant的适用依据；SPU同族或名称相近不能证明颜色/规格相符。Operator选图、排除和顺序代表商品展示决定；技术修复或生成交付图不得自行改变这些决定，不引入第二轮业务审批。

### BUS-GIGA-IMG-005 — 大图形成可用交付图，保留原图

**Sponsor于2026-10-30明确：超过10MB的图片必须压缩，上传Cloudflare R2并生成新URL；交付图默认尺寸为1600×1600。** 这是当前内部交付策略，不冒称Giga或全部平台的官方限制。目标平台有更严格约束时还须满足对应要求；不把这条理解为已上线。

原图保留，压缩产物仍对应同一商品/Variant，不能改变颜色、文字事实或擅自裁掉商品信息。发布使用处理后的交付URL；不能因来源已经登记到Canonical就继续提交超限原URL。图片选择与顺序保持Operator决定。

“10MB”执行时的精确字节定义、非正方形的保比例排版、较小原图是否放大、输出格式与压缩质量属于Owner TRD参数，须明确后验证；不得在实现中默默拉伸/裁切。R2 bucket、URL访问及处理脚本属于实现契约，不在business维护部署清单。实现缺口继续由[Store OPS #254](https://github.com/retailpulses/store-ops/issues/254)跟踪。

发布衍生图默认1600×1600；原始/master资产保留原始分辨率，不强制缩成发布尺寸。有效的Giga外部来源可继续引用，不要求将全部来源图立即镜像到R2；超过10MB的处理仍遵循上述交付政策。

### 标题表达与商品事实

源标题是事实参考，不是生成标题的措辞约束。SEO关键词、词序、表达预算和A/B实验可以随产品策略演进，但不能改变属性事实或Variant适用性；标题变更不改变商品身份。产品生成、候选采用与发布流程由产品Design维护。

优选代码入口见[GigaB2B Capability Registry](../references/giga/capability-registry.md#giga-content-preprocessing-assets)。本文定义共享语义，不以代码或设计参考替代正文规则；实现与部署状态由Owner记录。

## Sources
- [Mercari API Reference](https://api.mercari-shops.com/docs/index.html)
- [Mercari Variants](https://support.mercari-shops.com/hc/ja/articles/900006408263-%E7%A8%AE%E9%A1%9E%E3%81%A8%E5%9C%A8%E5%BA%AB%E3%81%A8%E3%81%AF)
- [Mercari Product Group](https://support.mercari-shops.com/hc/ja/articles/39467798476569-%E5%95%86%E5%93%81%E3%82%B0%E3%83%BC%E3%83%97%E7%AE%A1%E7%90%86%E6%A9%9F%E8%83%BD)
- [Mercari Group CSV](https://support.mercari-shops.com/hc/ja/articles/42646579459993-%E5%95%86%E5%93%81%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E3%81%AE%E4%B8%80%E6%8B%AC%E7%99%BB%E9%8C%B2-%E6%9B%B4%E6%96%B0)
- [Rakuten RMS reference index](../references/rakuten/rms-api.md)
