# Mercari Shops Newsletter / メールマガジン — Canonical Business Facts

Status: **External platform facts VERIFIED (official guides checked 2026-11-11); integration coverage PARTIAL; internal policy DRAFT**  
Owner: Retailpulses Marketplace Operations  
Scope: Mercari Shops newsletter campaigns; store-specific eligibility, content, scheduling, and integration boundary. This is a business fact registry, **not** an implementation specification or approval to automate sending.

## Stable business definitions

| ID | Definition / invariant | Evidence status |
|---|---|---|
| BUS-MER-NL-001 | Newsletter (メルマガ) is a shop-originated promotional **email** to customers subscribed to that shop's newsletter. It is **not** an in-app 「あなたへのお知らせ」 push/notification. Treat subscriptions as shop-scoped; do not assume buyers or shop followers are automatically eligible. | VERIFIED — official conditions |
| BUS-MER-NL-002 | Per-shop delivery limit: **up to 4 sends per calendar month**, reset on the **1st** of each month. Do not infer shared quota across multiple shops without verification. | VERIFIED for published rule; multi-shop aggregation UNKNOWN |
| BUS-MER-NL-003 | Delivery is scheduled, not immediate. Allowed delivery times **08:00–22:00**, **30-minute slots**, no more than **2 weeks ahead** of configuration. UI example: configured during 14:46–14:59, earliest available 15:30. | VERIFIED — official conditions |
| BUS-MER-NL-004 | Sender disclosure is mandatory: business/operator name, address and email registered at shop approval are included in newsletter pursuant to 特定電子メール法, **even when shop operator details are hidden on the shop information page**. Review registered information before scheduling. | VERIFIED — official conditions |
| BUS-MER-NL-005 | Allowed purpose: promoting purchases at the shop (e.g. new products and sale products). Newsletter content must comply with Mercari Shops prohibited-conduct rules. No off-platform solicitation or independent email list capture by misusing buyer information. | VERIFIED — official content guide / privacy rules |
| BUS-MER-NL-006 | Email subject max **60 characters**; heading max **40 characters**, exactly one heading at a fixed location; body max **2,000 characters**, plain text (no HTML, Markdown, bold/color formatting). | VERIFIED — official how-to |
| BUS-MER-NL-007 | Optional header image recommended **600 × 320 px** (recommendation, not asserted hard validation). | VERIFIED — official how-to |
| BUS-MER-NL-008 | Up to **10 attached products**, placed at end of newsletter in selected order, with no layout repositioning; **draft products cannot be selected**. | VERIFIED — official how-to |
| BUS-MER-NL-009 | Editor provides preview. Operator flow: shop management > メルマガ > 新規作成 > input > 配信設定に進む > optional test from detail/list > schedule delivery from detail/list. | VERIFIED — official how-to |
| BUS-MER-NL-010 | Test send is **optional**; incomplete content blocks test; test email goes to the executing account's registered email (shop owner: shop login email), **not an arbitrary address**. | VERIFIED — official how-to |
| BUS-MER-NL-011 | Newsletter must be modeled separately from transactional buyer messages, shop notices, restock alerts and other marketplace notification functions; differing audience, trigger and consent. | VERIFIED distinction / internal design interpretation |
| BUS-MER-NL-012 | Seller Console implements newsletter list/create/update/preview/scheduling/product attachment, and observed internal GraphQL operation names include `ShopNewsLetters`, `ShopNewsLettersPage`, `CreateNewsLetterPage`, `CreateNewsLetter`, `UpdateNewsLetter`. **Observation is not permission for third-party API access**. | VERIFIED as previous internal technical observation (2026-09-20), not current live API certification |

## Canonical workflow and operational control

1. Pick and verify the **shop identity** and operator permission; never silently substitute a default shop.
2. Confirm in-shop promotional purpose, accurate offer and linked products, subscription-based audience, and compliant copy.
3. Check remaining monthly send budget, future allowed 30-minute slot, and the registered operator disclosure fields.
4. Build subject, fixed heading, plain-text body, optional 600×320 header, and up to ten published products in desired sequence.
5. Review preview; use test email where appropriate; independently validate links/pricing/stock prior to scheduling.
6. **Scheduling or sending is externally visible**: require the applicable operator authorization. After UI action, read back campaign ID/status/time; record evidence. Never report sent merely because scheduling was requested.
7. Re-check subsequent changes, cancellations, schedule modification support, quotas consumed by tests vs actual sends, target audience count and delivery statistics in Seller UI before implementing assumptions: not confirmed by the cited official pages.

## Integration and compliance boundary

- Prefer officially documented **Mercari Shops Open API** when the relevant functionality is actually supported. **Newsletter write/read coverage in the public API is UNVERIFIED**; do not infer it from Seller Console.
- Official Seller UI with authorized operator action is the supported fallback.
- Seller Console internal `https://mercari-shops.com/graphql` was observed during discovery; **do not** use undocumented mutations for production newsletter scheduling, updates or sends without a separate Mercari policy/authorization review.
- Do not extract, persist or replay seller cookies/session credentials into backend services; internal schema and availability are unstable.
- Do not collect subscriber email addresses from customer data for an external mail marketing list; adhere to platform privacy and unsolicited-contact prohibitions.
- Each campaign must bind explicit `shopId`, campaign identity and delivery time; multi-shop rollout must not use a fixed shop fallback.

## Source of truth and evidence

**Mercari official (current business rules):**
- [Newsletter conditions — 配信対象、回数、時間、予約、事業者開示](https://support.mercari-shops.com/hc/ja/articles/18039410882457)
- [How to send — fields, preview, test, schedule](https://support.mercari-shops.com/hc/ja/articles/18040742913305)
- [Permitted newsletter content](https://support.mercari-shops.com/hc/ja/articles/18039701195929)
- [Prohibited misuse of personal information](https://support.mercari-shops.com/hc/ja/articles/900004852826)

**Internal code and research evidence:**
- [Seller internal GraphQL findings (2026-09-20)](https://github.com/retailpulses/inbox/blob/main/knowledge/system-design/mercari-seller-internal-graphql-findings.md) — observed newsletter operations/fields and architecture/policy caveat.
- [Mercari Navigator bookmarklet (2026-09-20)](https://github.com/retailpulses/inbox/blob/main/tools/mercari-navigator-bookmarklet.md) — existing read-only operator helper explicitly prohibits extending to Newsletter mutations without review.
- GitHub organization code search on 2026-11-11 for `newsletter`, `newsletters`, `メルマガ`, `メールマガジン` returned these two matching **documentation/tool-description files**. No executable newsletter sender implementation was established by this search. Search coverage should not be described as exhaustive (default-branch indexing/access may be incomplete).

## Open questions (do not treat as business facts)

- Is newsletter covered by a documented version of Mercari Open API, with express authorization and scopes?
- What is the precise persisted campaign status machine (draft / scheduled / sent / failed / canceled), schedule-edit/cancel deadline and retry behavior?
- Do test sends affect the four-per-month quota? Does canceling/rescheduling restore budget?
- Is the 4-send rule always per shop for a multi-shop legal entity, and can all shops access the feature?
- Are there attachment restrictions beyond unpublished/draft products, header image file/size/type constraints, exact timezone semantics, and content review/approval mechanics?
- What audience counts, send results, unsubscribes and delivery/open/click metrics are available in the UI or official API?

## Consumers

Store Ops promotion scheduling, Shop4 marketing operations, Commerce Lab campaign drafting, future Newsletter operator assistant. This registry provides shared business semantics only; implementation TRD, tests and runtime proof belong in their product repositories.
