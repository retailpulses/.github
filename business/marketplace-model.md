# Marketplace Identity & Category References（Draft）
状态：Sponsor Review · 日期：2026-10-29

| ID | Term | 定义及边界 |
|---|---|---|
| BUS-MKT-001 | Shop / Listing / Offer | Marketplace 是销售平台；Shop 是平台内运营店铺；Listing 是 Shop 下的销售实体；Offer 表示定价/销售条件时须明确与 Listing 的 1:1 或 1:N 关系，不得假设等价 |
| BUS-MKT-002 | Mercari Category ID | **Mercari 平台定义的分类标识**，属于外部平台契约；Retailpulses 内部仅定义 categoryId 的引用、映射、适用时点、有效性检查和变更追踪，不拥有官方分类树 |

### Category ID 规则
- 保存 Marketplace、Category ID、官方名称/层级（如已核实）、来源/API 版本、观测时间、映射到内部产品的关系及验证状态。
- Listing Category 不等于 Product Family/SPU1 类别；分类更新不改变 Canonical Product Identity。
- 发布前应按平台当前契约验证；未知/过期分类标 UNKNOWN，不凭标题或历史分类自动声称有效。
- 官方分类树/API 路径及运行核验尚未在本 Draft 中完成；应链接 [Mercari References](../references/README.md) 和 Marketplace Adapter 的具体证据，而不是复制未经证实的分类 ID 列表。

消费者：Product Center、Mercari NPL、Canonical Copy、Marketplace Offer。验收：能从 Listing 追溯 Category 来源和验证状态，不把平台分类当作内部身份。
