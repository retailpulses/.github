# Mercari-based B2B Business Plan — Initial Operating Model

**Status:** Draft / Sponsor Review  
**Owner:** Business Development / Mercari Operations  
**Scope:** Company-operated Mercari Shops, starting with Shop4 for discovery. Shop3 data may inform demand research but belongs to another entity for merchandise revenue recognition.  
**As of:** 2026-11-14 JST  
**Related:** [B2B customer opportunity research](../research/b2b-customer-opportunity-20261114.md) · [Giga bulk commercial delivery case studies](../suppliers/giga/bulk-commercial-delivery.md) · [Buyer receipt and invoice request SOP](buyer-receipt-invoice-sop.md) (in separate proposed PR)

## 1. Business objective and customer value proposition

Validate a **distinct business-customer sales service** using existing Mercari Shops inventory, purchase and inquiry workflows—not a new company or separate software product at this stage.

**Customer promise (subject to quote and feasibility):**

> **Business and institutional purchasing support:** We welcome bulk furniture, storage and facility-equipment inquiries. Depending on SKU, destination, quantity and supplier conditions, we can evaluate consolidated truck freight, business delivery coordination, special purchase documentation, and tailored estimates. Services and lead time are confirmed **case by case**, not guaranteed.

Initial potential customers: restaurants, offices, small businesses, nursing/care and healthcare facilities, child-development facilities, schools, hospitality and commercial spaces. Sector relevance is a hypothesis; see the order research for evidence limitations.

## 2. Evidence-led market starting point

2026-11-14 Supabase research: 6,052 observed order lines, **141 weak OR business-name/address candidates** (not validated business buyers), **2 own-company recipient records** to exclude, and 206 bulk-tagged inquiries not reconciled to payment. Shopping keywords among candidates prominently feature furniture (58) and storage (40). An actual Shop4 ten-set dining furniture truck quotation illustrated **¥18,920 standard supplier freight vs ¥6,300 truck/loading quote**, **¥12,620 / 66.7% quoted savings** before unresolved packing and settlement charges. Supplier preparation was estimated at 1–3 business days; truck booking and actual delivery timing remained unknown.

**Interpretation:** commercial demand exists as an observable lead hypothesis, not a proved B2B revenue segment. The product here is **procurement coordination**: quote transparency, one-address shipping, business paperwork triage and realistic schedule—not an unqualified price discount or guaranteed delivery.

## 3. Service menu and boundary

| Service | Default | Special business service (case by case) | Non-promise / guardrail |
|---|---|---|---|
| Multiple units / quotation | Public Mercari listing and ordinary purchase | Check price, stock, quantity and supplier availability; prepare tailored estimate or dedicated Mercari listing when approved | Do not promise bulk discount or split orders without confirmation |
| Truck / consolidated delivery | Ordinary shipment method | Compare standard parcel vs bulk truck price including loading, palletization, packing, door delivery and final reconciliation | Truck savings and lead time are **quotes**, not universal rules or fixed SLA |
| Specified delivery / receiving conditions | Existing listing and fulfillment policy | Assess receiving hours, loading/unloading, building access and estimated shipment stages | Supplier truck booking may be indeterminate |
| **Ordinary commercial documentation (領収書, non-qualified 請求書)** | Mercari purchase email, order details and payment-method statement | **Willing to assess and, upon approval, issue a separate ordinary non-qualified document** for an unusual legitimate business requirement | **Not automatic or guaranteed**; must reconcile amounts and obtain Backoffice/Management sign-off |
| **適格請求書 (qualified tax invoice)** | **Unavailable** | **Cannot offer while company is unregistered**; provide accurate explanation, discuss whether non-qualified proof would be useful | Company-confirmed fact: **リテルパルス合同会社 is not yet registered as an 適格請求書発行事業者** (as of this plan). No T number, no qualified-invoice claims |
| Account relationship / follow-up | Mercari Inquiry | Operator can retain a legitimate business relationship and support repeat orders in authorized workflows | No scraping contacts or unsupported off-platform payment/marketing |

**Tax/legal distinction:** Mercari does not have a buyer receipt/qualified-invoice issuance function, but permits sellers to prepare their own ordinary receipts. A **nonregistered seller may issue an ordinary non-qualified invoice/receipt**, but **may not issue or present a document as a qualified tax invoice**. Sources: [Mercari buyer help](https://help.jp.mercari.com/guide/articles/1271/), [Mercari seller receipt help](https://support.mercari-shops.com/hc/ja/articles/900006451423), [NTA No.6498](https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6498.htm), [NTA Q&A on nonregistered invoices](https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/pdf/qa/26-2.pdf). **Company registration status is management-provided, not independently verified by this study.** Verify again if registration changes.

## 4. Target offer and copy policy

**Shop/profile brief (Japanese; proposed, not deployed):**

> 【法人・事業者様のまとめ買い歓迎】
> 飲食店・オフィス・介護施設・各種事業所などのまとめ買いもご相談ください。商品・数量・配送先に応じて、トラック便などによる一括配送や、購入書類に関する特別なご要望も個別に確認いたします。
> ※対応可否・送料・納期は事前のお見積もりによります。適格請求書（インボイス）は発行できません。

**For selected listings, optional short boilerplate (Japanese; proposed, not deployed):**

> 【法人様・まとめ買いのご相談】
> 複数点のご注文や事業所への一括配送をご検討の場合は、商品・数量・お届け先の都道府県・市区町村を添えて購入前にお問い合わせください。トラック便のお見積もりや、特別な購入書類のご要望も内容に応じて確認いたします。
> ※ご希望に添えない場合がございます。適格請求書（インボイス）の発行には対応しておりません。

**Do not advertise:** a guaranteed cheap truck option, guaranteed SLA, unconditional 会社名領収書発行, or invoice-registration status that is not true. Distinguish the company's **willingness to discuss** documentation from automatic issuance.

## 5. Operating workflow

1. **Inquiry qualification:** confirm SKU/item code, items per set and required sets, intended business venue (only when volunteered/necessary), delivery prefecture/city, intended arrival date, business receiving constraints and buyer's special documentation needs.
2. **Commercial quote:** check live listing and supplier stock; calculate product pricing, supplier shipping quote, packing/loading/pallet fees, platform commission and contribution; consider any per-order discount only if approved.
3. **Document expectation check before buyer pays:** explain Mercari default purchase/payment evidence and disclose **not registered for 適格請求書** if buyer requests a qualified invoice. If buyer needs a **separate non-qualified ordinary document**, obtain internal review and authorization first; communicate what can actually be provided.
4. **Buyer confirmation:** record a bounded quote and expiry; if necessary create a dedicated approved Mercari listing, without bypassing platform payments.
5. **Fulfillment:** after buyer pays, reconfirm Giga shipping conditions and booking time (historical truck quotes do not stay valid automatically), coordinate supplier shipment and collect settlement evidence.
6. **Closure and customer follow-up:** verify delivery and final actual freight; record documented exception decisions and completion, and resolve inquiries in the operational SSOT. Maintain privacy and any applicable communication consent.

## 6. MVP economics and operating KPIs

- **Demand funnel:** qualified business inquiry, estimate sent, quote accepted, paid order, fulfilled order, repeat verified business buyer.
- **Unit economics:** merchandise revenue attributable to our legal entity (Shop1/2/4, and Rakuten if applicable), purchasing cost, Giga final shipping/handling, marketplace fee, incremental contribution; Shop3 sales separately marked as other-entity demand evidence.
- **Freight value:** standard parcel quote vs consolidated quote; **actual** supplier freight vs initial parcel option after settlement; buyer shipping charge is not supplier shipping cost.
- **Execution quality:** inquiry-to-quote, payment-to-supplier-order, warehouse preparation, truck booking, dispatch and delivery lead times; documentation exceptions granted/declined.
- **Controls:** avoid claiming all 141 likely candidates are confirmed buyers; buyer industry from a delivery location alone is not verified payer identity. No customer-level data in GitHub.

## 7. Decision gates and open questions

**MVP:** manual inquiry, approved quote, conditional truck shipping, platform-first proof of purchase with special non-qualified document review, documented delivery closure. Build no new CRM/platform or deploy any pricing/config changes merely for this plan.

**Before scale:** validate a paid B2B cohort, true purchaser entities (not just institution delivery addresses), contribution margins and fulfillment SLA. Quantify documentation request frequency and extra service cost; reconsider invoice-registration strategy as a separate management/tax decision only if demand and compliance implications warrant it.

**Open questions / owners:**
- **Backoffice:** confirm tax registration status periodically and determine ordinary receipt/non-qualified document format, retention and approval controls.
- **Mercari Operations:** confirm whether platform interactions, listing copy and special document delivery stay within current marketplace policies.
- **Procurement/Giga:** establish realistic quotation validity, loading requirements and transport stages per case.
- **Business Development:** evaluate nursing/healthcare versus office/restaurant niches from verified purchaser evidence, not facility address alone.

**Not an approval to issue documents yet:** a special request can be entertained now, but a separate ordinary document is delivered only after a verified, authorized workflow is in place.
