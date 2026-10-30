# Engineering Foundational References

Status: **Pilot** · Owner: Engineering · Updated: 2026-10-30

跨仓库、跨产品共用的外部 API / 平台契约的发现入口。**这里的 Reference 是经来源标注的内部整理资料，不取代供应商官方文档。** 实现代码、内部 API schema 和运行证据保留在各自 Owner 仓库。

| ID | Reference | 状态 | 证据与主要消费者 |
|---|---|---|---|
| REF-GIGA-OPENAPI-2 | [GigaB2B Open API 2.0](giga/open-api-2.0.md) | 2.0 required; contract partly verified | CatalogSync, commerce-lab, store-ops |
| REF-GIGA-CAPABILITY | [GigaB2B Canonical Capability Registry](giga/capability-inventory.md) | 仅推荐经过比较的优选能力；历史/候选在PR，未覆盖能力明确；非Runtime认证 | Giga内容预处理；commerce-lab / NPL；[共享业务规则](../business/giga-content-preprocessing.md) |
| REF-GIGA-DATA | [GigaB2B Business Dictionary & Field Mapping](giga/data-dictionary-mapping.md) | Partially verified; live API ↔ DB lineage open | Monthly P&L, Orders, NPL, catalog consumers |
| REF-MERCARI-INQUIRY | [Mercari Shops Inquiry](mercari/inquiry-api.md) | Partial / evidence-linked | commerce-ops Inquiry, Customer Operations |
| REF-RAKUTEN-RMS | [Rakuten RMS API](rakuten/rms-api.md) | Mixed; by capability | commerce-ops, commerce-lab, CatalogSync, RPagentOS |

| REF-WECOM-CAPABILITY | [WeCom Shared Capability Registry](wecom/capability-registry.md) | Reference / POC pending; external customer group API not yet tested | Seller Coordination, Orders, Inquiry, IT Ops |

## 管理规则

1. 每份 Reference 标注来源、版本、核实范围、日期、Owner、消费者和未知事实。**文档中出现字段 ≠ 已在生产核实该字段的语义。**
2. Product Design 只引用 Reference ID 和影响产品行为的事实；具体字段契约在 TRD / 上游 schema。跨产品资料不在 App 目录重复维护。
3. Source documentation / observed API response / code implementation / deployed runtime 是四种不同证据，不互相替代。
4. 发现上游变更、响应冲突或新功能依赖时触发重新核实；Blocking Fact 未核实则 Design Approval 前必须解决或明确安全降级。
5. 不得存储 Secret、Token、Cookie、完整敏感响应或包含个人数据的原始样本；使用脱敏 fixtures 与环境变量占位符。
6. 原仓库历史设计、事故、SOP 可以保留作证据，但应注明历史状态并指向这里；不要未经验证删除历史。

## 迁移审计

初次仓库扫描：2026-10-24；GigaB2B 扩展代码扫描：2026-10-27。GitHub code search 是索引检索，不保证覆盖未索引仓库、未提交文件或本地资料；本次未完成 Mac mini、VPS 或 Cloudflare 现场只读验证。详见各 Reference 的来源与待核实清单。
