# Canonical Product & Marketplace Identity (Draft)
状态：Sponsor Review · 日期：2026-10-29

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

## Sources
- [Mercari API Reference](https://api.mercari-shops.com/docs/index.html)
- [Mercari Variants](https://support.mercari-shops.com/hc/ja/articles/900006408263-%E7%A8%AE%E9%A1%9E%E3%81%A8%E5%9C%A8%E5%BA%AB%E3%81%A8%E3%81%AF)
- [Mercari Product Group](https://support.mercari-shops.com/hc/ja/articles/39467798476569-%E5%95%86%E5%93%81%E3%82%B0%E3%83%BC%E3%83%97%E7%AE%A1%E7%90%86%E6%A9%9F%E8%83%BD)
- [Mercari Group CSV](https://support.mercari-shops.com/hc/ja/articles/42646579459993-%E5%95%86%E5%93%81%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E3%81%AE%E4%B8%80%E6%8B%AC%E7%99%BB%E9%8C%B2-%E6%9B%B4%E6%96%B0)
- [Rakuten RMS reference index](../references/rakuten/rms-api.md)
