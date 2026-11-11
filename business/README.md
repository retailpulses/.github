# Canonical Business Definitions & Knowledge Registry
状态：**Draft / Sponsor Review** · Owner：Retailpulses Business / Product Owners（待确认） · 日期：2026-11-11

本目录是跨产品业务定义与可复用经营知识的统一发现入口。区分 **Definitions / Contracts**（稳定语义、计算契约）与 **Knowledge / Intelligence**（有来源、日期、适用范围和方法的业务事实及分析）。`Draft` 不代表已批准、已部署或已通过运行验证。详细规则见 [GOVERNANCE.md](GOVERNANCE.md)。

## Canonical definitions
| ID / Domain | Canonical draft | 边界与消费者 |
|---|---|---|
| BUS-PROD-001–004 | [Product & Marketplace Model](marketplace-model.md) | SPU / Family / Variant / Listing；Product Center、NPL |
| BUS-PRC-001–004 | [Pricing Contract](pricing-contract.md) | TCOGS、佣金、Margin、Floor；Product Center、Promotion、Orders |
| BUS-LOG-001 | [Giga 企业地址批量配送](suppliers/giga/bulk-commercial-delivery.md) | 供应商物流；Approved / Evidence PARTIAL |
| BUS-MKT-001–005 | [Product & Marketplace Model](marketplace-model.md) | Shop / Listing / Category / Product Group |
| BUS-MER-001–008 | [Mercari Shops Listing CSV & Batch Publication](mercari/listing-csv-and-batch-publication.md) | Listing CSV / Shop4 NPL batch exporter；Draft |
| BUS-MER-NL-001–012 | [Mercari Shops Newsletter](mercari/newsletter.md) | Newsletter 规则；官方业务规则 VERIFIED，集成 PARTIAL |

## Canonical business knowledge
| Domain | Knowledge topic | Status |
|---|---|---|
| Mercari | Sales seasonality and monthly bestsellers | Proposed; source `public.sales_orders`; current entrypoint/methodology to be added after reproducible analysis review |

Knowledge entries need not have BUS IDs. Distinguish observed facts, hypotheses, approved insights and decisions. Preserve source provenance, store scope, dates, method and review cadence. Do not duplicate raw order history or customer data.

| Mercari | [All-time best sellers & evergreen Hero candidates](mercari/merchandising/hero-products.md) | PARTIAL; cross-store revenue + continuity, Hero exclusion list |\n| Mercari | [Monthly seasonality intelligence](mercari/merchandising/seasonality-intelligence.md) | PARTIAL; revenue-ranked category observations, not validated seasonality |\n| Mercari | [Seasonality analysis method](mercari/merchandising/seasonality-method.md) | DRAFT; reproducibility and validation contract |\n\n## Authority boundaries
- Business definitions: reviewed shared semantics and calculations; product-specific Design/TRD links here.
- Business knowledge: curated, time-bound conclusions; operational source systems remain authoritative for raw data.
- External facts: [Foundational References](../references/README.md) and official documentation.
- Executable contracts, implementation, migrations and runtime evidence: owning product repositories.
- Changes to meaning or formulas require impact review; knowledge updates require traceable evidence and explicit status.

## Pilot acceptance
1. Product Center / Mercari NPL can reference the correct BUS definition without duplicating formulas.
2. Giga standard price, fulfillment cost and Effective TCOGS are not conflated.
3. Business knowledge can be discovered and refreshed without creating scattered monthly reports or a second source of truth.
4. Sponsor Review does not change production prices, APIs, databases, or existing approval statuses.
