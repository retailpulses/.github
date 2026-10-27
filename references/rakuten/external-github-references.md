# REF-RAKUTEN-OSS — External GitHub Reference Register

Status: REFERENCE ONLY / NO ADOPTION DECISION · 2026-10-27 · [Issue #53](https://github.com/retailpulses/.github/issues/53)

这是早期 Rakuten Promotion/SEO/RMS 开发中提及的外部开源候选，**不是 Retailpulses 已部署能力**。区分确实与 RMS 商家 API 有关的实现、独立 MCP 托管层、泛用 Promotion/SEO 架构参考，以及消费者 Rakuten Web Service 项目。

| Repository / reference | Purpose | Assessment / usage boundary |
|---|---|---|
| [moneyan9/rakuten-rms-mcp](https://github.com/moneyan9/rakuten-rms-mcp) | RMS merchant API MCP；公开说明涵盖 ItemAPI、InventoryAPI、CouponAPI、Inquiry、Orders | **CRITICAL ERP CODEBASE REFERENCE / Priority A**：完整 TypeScript RMS API Client（`createApis()`）与 MCP stdio 工具；候选 Fork/Copy & Adapt/Direct Import；本地 POC 已执行，**不等于生产认证** |
| [moneyan9/rakuten-rms-mcp-remote](https://github.com/moneyan9/rakuten-rms-mcp-remote) | 上述 MCP 的 HTTP/OAuth remote host；README 明确核心逻辑依赖前项 | **Priority B**：架构参考；当前不部署远程 MCP / Gateway |
| [shopload/rms-claude](https://github.com/shopload/rms-claude) | 早期开发曾列入 RMS/AI 工具候选 | **UNVERIFIED**：本轮尚未独立核实仓库内容、许可证和维护状态 |
| [mrslbt/rakuten-mcp](https://github.com/mrslbt/rakuten-mcp) | Rakuten public Web Service MCP，主要 Ichiba/Books/Travel 等公开搜索 API | **NOT RMS**：仅用于说明 API 体系边界，不可复用其 RMS 商家契约 |
| OfferKit / OpenSEO / Sylius Promotion / Open Incentives | 此前 Promotion/SEO 讨论中的通用规则、营销活动与 SEO 产品参考 | **CONCEPT ONLY**：名称来自既往评审；精确仓库 URL/许可证/代码质量未复核，暂不提供推测链接 |

## 采用策略

1. 先读 Owner 的实际代码：[commerce-lab RMS tools](https://github.com/retailpulses/commerce-lab/tree/main/services/rakuten/tools/rms)、[commerce-ops Orders](https://github.com/retailpulses/commerce-ops/tree/main/apps/orders)、[store-ops Rakuten](https://github.com/retailpulses/store-ops/tree/main/apps/rakuten)。
2. 将第三方代码当作 **contract discovery / test pattern / workflow model** 候选；逐一确认 API 版本、license、测试、维护和写入风险。
3. 仅在 #38 Baseline-first 实验表明现有代码确有缺口时比较 Copy & Adapt、Vendoring、Direct Import、Shared Contract、Shared Package。**不因 MCP 项目存在而新建 Gateway**。
4. RMS 官方字段以 RMS 官方资料为准；第三方实现与官方差异必须标注。外部项目与现有内部系统均未在本次执行测试。


## Critical Asset Assessment — moneyan9/rakuten-rms-mcp（2026-10-27）

- **资产定位**：Rakuten Merchant RMS WEB SERVICE 的完整外部代码基线候选，**不要求 MCP 才能复用**。代码提供 `src/lib.ts` 的 `createApis()`，可将 API Client 与 MCP transport 分离。MIT License，fork/vendoring 时保留许可证及版权声明。
- **Source**：[moneyan9/rakuten-rms-mcp](https://github.com/moneyan9/rakuten-rms-mcp)；Mac mini 隔离 clone：`/Users/agent/work/rakuten-rms-mcp-erp-poc`；本地 POC 报告：`reports/POC_REPORT_2026-10-27.md`（尚未提交，非持久证据 URL）。
- **POC evidence**：[store-ops #209](https://github.com/retailpulses/store-ops/issues/209#issuecomment-6442846490)；[.github #53](https://github.com/retailpulses/.github/issues/53#issuecomment-6442848164)。Mac mini typecheck/build PASS，4 files/10 tests PASS，MCP stdio handshake/tool discovery 58 tools/health PASS；Coupon/Item/Inventory/Orders/Inquiry **本轮 live BLOCKED**。此前单独的 store-ops PR #210 Coupon search live canary PASS，不能当作本项目 live PASS。
- **Critical baseline gaps（mock 已验证）**：GET/POST 等对 429/5xx 共用自动重试，POST 503 后重复发送；错误包含 raw response body；缺少 MCP read-only allowlist、write idempotency、timeout/response-size/QPS 约束、字段级 PII redaction、统一 schema/分页完整性与 audit trail。npm audit 共 6 项漏洞（4 high/2 moderate），生产依赖 high 2。**当前 ERP production backbone：NO-GO；隔离只读实验：CONDITIONAL GO**。
- **业务覆盖边界**：代码涵盖 Coupon/ThanksCoupon、Item、Inventory、Orders、Inquiry；未找到 Super SALE/Marathon/ポイント変倍专属活动报名、资格、状态 API，仍需 RMS 官方商家文档和实际 UI 核实，不能宣称平台没有 API。
- **消费策略**：优先以完整 Fork/Clone 做隔离评估，比较直接 `createApis()`、Vendoring、Copy & Adapt 与现有 commerce-lab/commerce-ops/store-ops 实现；**不要**因该资产而部署新的 MCP Gateway、Shared Package 或将 POC PR #210 合并到产品目录。
- **下一步 Gate**：核对 credential metadata 冲突；确认官方 API 契约；补读写分离、重试/脱敏/分页 contract tests；在隔离范围做只读 live canary；再决定正式 owner、仓库位置和产品集成。
