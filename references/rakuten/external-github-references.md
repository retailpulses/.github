# REF-RAKUTEN-OSS — External GitHub Reference Register

Status: REFERENCE ONLY / NO ADOPTION DECISION · 2026-10-27 · [Issue #53](https://github.com/retailpulses/.github/issues/53)

这是早期 Rakuten Promotion/SEO/RMS 开发中提及的外部开源候选，**不是 Retailpulses 已部署能力**。区分确实与 RMS 商家 API 有关的实现、独立 MCP 托管层、泛用 Promotion/SEO 架构参考，以及消费者 Rakuten Web Service 项目。

| Repository / reference | Purpose | Assessment / usage boundary |
|---|---|---|
| [moneyan9/rakuten-rms-mcp](https://github.com/moneyan9/rakuten-rms-mcp) | RMS merchant API MCP；公开说明涵盖 ItemAPI、InventoryAPI、CouponAPI、Inquiry、Orders | **Priority A**：对照 endpoint、认证、错误处理和测试；不可直接作为官方字段权威或生产依赖 |
| [moneyan9/rakuten-rms-mcp-remote](https://github.com/moneyan9/rakuten-rms-mcp-remote) | 上述 MCP 的 HTTP/OAuth remote host；README 明确核心逻辑依赖前项 | **Priority B**：架构参考；当前不部署远程 MCP / Gateway |
| [shopload/rms-claude](https://github.com/shopload/rms-claude) | 早期开发曾列入 RMS/AI 工具候选 | **UNVERIFIED**：本轮尚未独立核实仓库内容、许可证和维护状态 |
| [mrslbt/rakuten-mcp](https://github.com/mrslbt/rakuten-mcp) | Rakuten public Web Service MCP，主要 Ichiba/Books/Travel 等公开搜索 API | **NOT RMS**：仅用于说明 API 体系边界，不可复用其 RMS 商家契约 |
| OfferKit / OpenSEO / Sylius Promotion / Open Incentives | 此前 Promotion/SEO 讨论中的通用规则、营销活动与 SEO 产品参考 | **CONCEPT ONLY**：名称来自既往评审；精确仓库 URL/许可证/代码质量未复核，暂不提供推测链接 |

## 采用策略

1. 先读 Owner 的实际代码：[commerce-lab RMS tools](https://github.com/retailpulses/commerce-lab/tree/main/services/rakuten/tools/rms)、[commerce-ops Orders](https://github.com/retailpulses/commerce-ops/tree/main/apps/orders)、[store-ops Rakuten](https://github.com/retailpulses/store-ops/tree/main/apps/rakuten)。
2. 将第三方代码当作 **contract discovery / test pattern / workflow model** 候选；逐一确认 API 版本、license、测试、维护和写入风险。
3. 仅在 #38 Baseline-first 实验表明现有代码确有缺口时比较 Copy & Adapt、Vendoring、Direct Import、Shared Contract、Shared Package。**不因 MCP 项目存在而新建 Gateway**。
4. RMS 官方字段以 RMS 官方资料为准；第三方实现与官方差异必须标注。外部项目与现有内部系统均未在本次执行测试。
