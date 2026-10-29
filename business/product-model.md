# Product Identity & Hierarchy（Draft）
状态：Sponsor Review · 定义归属：跨产品 Product Domain · 日期：2026-10-29

| ID | 术语 | 提议的业务定义与粒度 | 待核实 |
|---|---|---|---|
| BUS-PROD-001 | SPU1 | 主产品聚合身份；Hero SPU1 的运营覆盖应包括其所有 Variant 和所有关联 Listing，不得只选择代表 SKU | 实际主键、历史别名、跨仓库关系 |
| BUS-PROD-002 | Product Family | 高于或横跨产品身份的业务分组概念；**不得默认与 SPU1 同义** | Family 的正式定义、成员关系、归属 Owner 尚未确认 |
| BUS-PROD-003 | Variant | 可独立承载 Item Code、规格和 Commercial Facts 的 SKU 级产品身份；一个 SPU1 可关联多个 Variant | Item Code 唯一性、Giga SKU 映射、生命周期 |
| BUS-PROD-004 | Marketplace Listing | 在特定 Shop / Marketplace 下的销售实体，关联 Variant；Listing ID 不能替代 Variant ID | 一 Variant 多 Listing 的约束、跨店映射、历史复用 |

**Identity ≠ display text**：标题、类目、价格、库存等 Listing 属性变化不应静默改变 Variant/SPU1 身份。**Family ≠ SPU1**：未确认层级前，不引入强制 Family 外键或批量迁移。

消费者：[Product Center / commerce-lab](https://github.com/retailpulses/commerce-lab)、[StoreOps NPL](https://github.com/retailpulses/store-ops/tree/main/apps/mercari/new-products-to-listing)。外部 Item Code 语义参见 [Giga Dictionary](../references/giga/data-dictionary-mapping.md)。

验收意图：SPU1/Variant/Listing 查询和聚合无歧义；Hero 覆盖全变体/全店；Family 未核实保持 Draft，不以推测建模。
