# Canonical Business Definitions Registry（Pilot）
状态：**Draft / Sponsor Review** · Owner：Retailpulses Business / Product Owners（待确认） · 日期：2026-10-30

本目录为跨产品业务语义和计算契约的统一发现与评审入口。**Draft 不代表已批准、已部署或已通过运行验证。** 不建立运行时数据库、第二套业务规则引擎或独立审批平台。

| ID / Domain | Canonical draft | 边界与消费者 |
|---|---|---|
| BUS-PROD-001–004 | [Product & Marketplace Model](marketplace-model.md) | SPU1 / Product Family / Variant / Listing；Mercari/Rakuten platform identity；Product Center、NPL |
| BUS-PRC-001–004 | [Pricing Contract](pricing-contract.md) | Standard/Effective TCOGS、佣金、Margin、Floor；Product Center、Promotion、Orders |
| BUS-GIGA-COPY-001–008 / BUS-GIGA-IMG-001–006 | [Giga Content Preprocessing](giga-content-preprocessing.md) | 文案事实保全/解析/去重/日文化/单位与方向；Canonical原图/元数据/衍生交付；[实现资产](../references/giga/capability-inventory.md#giga-content-preprocessing-assets) |
| BUS-MKT-001–005 | [Product & Marketplace Model](marketplace-model.md) | Shop / Listing / Category / Mercari Product Group / Rakuten Item-SKU |


## 范围边界
- Title Copy 的创作风格、SEO排序/预算、Prompt、审查UI和发布工作流仍由产品Design维护。本Registry本轮新增跨产品Giga内容预处理Draft：来源保全、规范化事实、日文映射/去重/单位方向和Canonical图片交付不变量；不把产品完整设计移到组织目录。
- 上述Giga共享业务规则定义在business；代码/脚本、Owner、测试及核实版本定义在[REF-GIGA-CAPABILITY](../references/giga/capability-inventory.md#giga-content-preprocessing-assets)，两处互相引用，不维护两套规则。

## 权威边界
- **内部业务定义**：本目录记录跨仓库共识、适用范围、版本和未决事项；业务 Owner 审核后方可标 Approved。
- **外部平台事实**：[Foundational References](../references/README.md) 索引官方来源、API/字段和验证证据；Mercari Category ID 的合法值由 Mercari 定义。
- **可执行契约**：实际 schema、计算实现、数据迁移、测试和运行证据保留在 Owner 产品仓库；本目录不声称已经实施。
- **产品设计**：产品 Design/TRD 引用稳定 BUS ID，并描述产品特有行为；不要复制可独立编辑的平行定义。
- **现有资产**：[Pricing Review](https://github.com/retailpulses/inbox/issues/379)、[Commerce Lab pricing audit](https://github.com/retailpulses/commerce-lab/blob/main/docs/pricing-margin-review-2026-10-07.md)、[Giga dictionary](../references/giga/data-dictionary-mapping.md) 是现有证据；本 Draft 不自动替换这些资产的已生效权威。

## 最小记录约定
稳定 ID；术语/定义；粒度和身份；适用范围；Owner；来源及验证状态；消费者；不变量/边界条件；兼容性/迁移影响。语义破坏性变更通过 PR 标记影响的消费者与测试，不回收 ID。简单术语合并写在领域文件，不强制一字段一文件。

## 试点验收
1. Product Center / Mercari NPL 能从 BUS ID 找到正确业务定义。
2. Giga 标准价、履约费与 Effective TCOGS 不混用；未核实的字段映射标 UNKNOWN。
3. 产品文档不重复维护公式；实现/运行状态不因 Registry 存在而被误报。
4. Sponsor Review 完成前不改变生产价格、API 或数据库。
