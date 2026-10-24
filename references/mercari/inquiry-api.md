# REF-MERCARI-INQUIRY — Mercari Shops Inquiry API

Status: **Partially verified; dictionary incomplete** · Owner: Mercari Integration / Inquiry · Reviewed: 2026-10-24

## Scope

跨产品引用的 Mercari Shops Inquiry / message / status / target / webhook 参考入口；不把内部 Supabase projection 或产品 Design 误称为官方 API Dictionary。

## 已记录的契约边界

- Production GraphQL endpoint: `https://api.mercari-shops.com/v1/graphql`；sandbox endpoint 与 schema/授权能力需分别核实。
- Inquiry API 是售前 inquiry/message/status/target 的平台事实来源；内部 Supabase 是业务投影，不能以旧缓存代替要求 fresh read 的场景。
- 已有设计采用 webhook 作为 change trigger，随后通过 API 回读完整事实；涉及 `INQUIRY_MESSAGE_CREATED`, `INQUIRY_RESOLVED`, `INQUIRY_MESSAGE_ADMIN_DELETED`。
- Outbound reply/send 的实际授权、幂等性、回读及 runtime 状态，应按服务 Owner 的契约和部署证据核实；不要将 Draft Runner 视为生产发信授权。

## 证据

- [Inquiry API-first ADR](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/docs/adr/001-mercari-inquiry-api-first.md)
- [Inquiry architecture](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/docs/01_ARCHITECTURE.md)
- [Inquiry Current State](https://github.com/retailpulses/commerce-ops/blob/main/apps/inquiry/docs/00_CURRENT_STATE.md)
- [Mercari sandbox query client](https://github.com/retailpulses/commerce-ops/blob/main/apps/orders/src/lib/mercari-sandbox-api.mjs)
- [Customer Operations design](https://github.com/retailpulses/store-ops/tree/main/apps/mercari/customer-operations-agent)

## Blocking verification candidates

1. 取得并登记实际使用版本的 **官方 Inquiry API Dictionary / schema**（包括字段、分页、权限、错误、发送限制）；当前这份 Reference 只是跨仓库索引，不冒充完整 Dictionary。
2. Inquiry thread As-of readback、send/readback 的可用性及边界。
3. Listing/Shipping API 的地区运费粒度属于 **独立待核实技术事实**，不可由 Inquiry schema 推断。

消费者引用 `REF-MERCARI-INQUIRY`；技术契约应链接具体字段/证据，不凭推断写成 Verified。
