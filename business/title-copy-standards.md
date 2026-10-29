# Canonical Product Title Copy — Business Standards（Pilot）
状态：**Draft / Sponsor Review** · 2026-10-29 · Domain: Product Content · Owner: Product / Merchandising（待确认）
范围：日本电商商品标题的共享业务质量契约。不是模型 Prompt、平台字段 schema 或可直接部署的 Validator；各平台具体字数/禁词限制由官方来源与产品 Adapter 验证。

## 1. 业务目标与判定顺序
标题应帮助买家**准确识别商品、确认购买关键属性、匹配真实搜索意图**。质量优先级：事实准确 > 商品身份完整 > 关键差异化属性 > 搜索相关性 > 可读性 > 文案修饰。不能为凑关键词牺牲事实、品类或可读性。

| ID | Business standard | 验收意图 |
|---|---|---|
| BUS-COPY-001 | Identity First | 首先保留明确的商品类型及有依据的子类型（例如 物置 vs 収納庫），不得泛化成过宽品类 |
| BUS-COPY-002 | Decision-critical Fact Coverage | 按该品类的买家决策重要性优先保留尺寸、材质、容量、结构、功能、颜色/型号等已核实事实；不得因为压缩标题丢失高价值特征 |
| BUS-COPY-003 | Fact Provenance & Non-invention | 每项关键主张必须可回溯 Canonical Facts / 原始资料 / 人工确认；不能凭语言模型、行业常识或关键词推断未证实功能 |
| BUS-COPY-004 | Safe Dimension Semantics | 未有证据证明 Width/Depth/Height 对应关系时，仅以 `236×119×190 cm` 等**无轴标签**形式表达；禁止自行交换或赋予 幅/奥行/高さ 标签 |
| BUS-COPY-005 | Search Relevance & Readability | 使用真实商品类型、常见日本语搜索表达及相关属性，避免重复堆词、无关品牌/类别、冗余符号和机器直译 |
| BUS-COPY-006 | Claim Safety & Lifecycle | 未证实的安全、防水、承重、材质、保修等主张不得发布；候选、人工编辑、已发布版本分别留存并能比较 Diff |

## 2. 专业标题信息架构（按品类调整）
推荐信息顺序：**商品核心身份 → 规格/类型 → 关键尺寸或容量 → 差异化结构/功能 → 材质/颜色/使用场景（有证据且空间允许）**。不是固定模板或强制每项都出现；可根据真实搜索需求与平台长度优化。
- 示例（仅展示无轴尺寸格式，不是产品事实认证）：`屋外収納庫 スチール製 236×119×190cm 引き戸 換気口付き`。
- 「防水」「防錆」「安全」「高耐荷重」等是需要证据的产品主张，不能因源标题出现就自动认定已验证；对于相互矛盾的源资料需 Review。
- 关键词应是**买家可能使用、且确实描述该商品**的表达；不能以泛词数量衡量标题质量。Mercari 官方指出商品名中的相关关键词影响搜索发现，无关关键词罗列可能被判为 Spam：[Mercari Search Guide](https://support.mercari-shops.com/hc/ja/articles/39200857875481-%E5%87%BA%E5%93%81%E5%95%86%E5%93%81%E3%82%92%E6%A4%9C%E7%B4%A2%E7%B5%90%E6%9E%9C%E3%81%AB%E3%81%9F%E3%81%8F%E3%81%95%E3%82%93%E8%A1%A8%E7%A4%BA%E3%81%95%E3%81%9B%E3%81%9F%E3%81%84)。

## 3. GitHub Harvest：当前实现和设计证据
- [Commerce Lab V4 Copy Builder](https://github.com/retailpulses/commerce-lab/blob/main/apps/mercari/local_offer/copy_builder_v4.py)：从 Product Identity、Title Components、Features 和可追溯 Fact Pack 生成；可见最多六条 Feature 输入、营销修饰语过滤。**代码存在 ≠ 当前统一业务标准已批准**。
- [Fact Preparation](https://github.com/retailpulses/commerce-lab/blob/main/apps/mercari/local_offer/copy_fact_preparation.py)：功能/结构/尺寸/材质等特征分类与优先级、标题噪声过滤、Canonical Identity 提取；词表/Regex 是实现启发式，不应提升为唯一业务语义权威。
- [StoreOps NPL Design](https://github.com/retailpulses/store-ops/blob/main/apps/mercari/new-products-to-listing/docs/design.md)：一个 Variant 一份共享 Meta Copy；Shop 差异由 Boilerplate 组装；人工编辑/候选分版本，明确发布目标和版本；**Published 是运营事实，不等于 Approved**。
- [Commerce Lab Canonical Copy UI](https://github.com/retailpulses/commerce-lab/blob/main/apps/mercari/local_offer/canonical_copy_ui.py)：存在 Review/Publish 流程；当前 Runtime 状态未核实。
- [Mercari official search guidance](https://support.mercari-shops.com/hc/ja/articles/39200857875481-%E5%87%BA%E5%93%81%E5%95%86%E5%93%81%E3%82%92%E6%A4%9C%E7%B4%A2%E7%B5%90%E6%9E%9C%E3%81%AB%E3%81%9F%E3%81%8F%E3%81%95%E3%82%93%E8%A1%A8%E7%A4%BA%E3%81%95%E3%81%9B%E3%81%9F%E3%81%84)：相关关键词、正确分类和避免无关关键词堆砌。

## 4. 典型系统性缺口与修补方向
1. **Title Fact Gap**：对比原始标题、Canonical Fact Pack、生成标题和已发布标题，标注保留/遗漏/新造的决策性事实；不能仅比较字符串相似度。
2. **Dimension Axis Inference**：即使数字相同，若没有明确来源也不能自动标注宽/深/高；当源之间冲突，回退为无轴格式并记录待确认来源。
3. **Semantic Drift**：不把具体产品类型泛化为「ラック」「テーブル」等无辨识度类别；更具体类型必须有事实支撑。
4. **Hard Rules vs Soft Preferences**：虚构事实、身份错误、尺寸轴误配为必须修复；关键词顺序、修饰语和风格为建议项，不新增不必要的评分发布门槛。
5. **Version & Publication**：Variant Meta Copy 的当前版、候选版、人工修改和各店已发布快照独立记录；生成新候选不得自动覆盖线上版本。

## 5. 推荐验收用例（定义，非测试已通过）
- 原题包含引き戸/換気口，生成标题在长度允许时优先保留买家决策特征；若删减必须有可解释的优先级。
- 源只有 `236×119×190`，不得生成未经证实的 `幅119×奥行236×高さ190`；可生成 `236×119×190cm`。
- 标题包含 `防水` 但 Fact Pack 未证实，不能将其提升为 Canonical Claim。
- 同 Variant 四店的事实与关键卖点一致，Boilerplate 不改变产品事实；店铺发布状态独立。
- 事实变更后可追踪受影响候选和已发布 Listing；不得自动重发。

## 6. Ownership & next step
本文件为**跨产品 Business Standard**。产品 Owner 仍需在 Design/TRD 中定义字段长度、平台校验、模型 Prompt、审查 UI、自动化测试和发布授权。建议 Product Center / Canonical Copy / NPL 三方以 BUS-COPY ID 复用并进行差异审计。当前未执行模型回放、真实样本质量评测或线上发布。
