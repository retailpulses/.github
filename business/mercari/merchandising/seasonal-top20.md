# Seasonal Top Sellers — unified four-shop Mercari market demand

**Snapshot:** 2026-11-11; complete sales through 2026-10-31 JST. **One aggregated market-demand pool** from Shop1+Shop2+Shop3+Shop4, never separate shop bestseller rankings. Include all available years (historical observations begin 2024). Shop3 contributes to demand evidence, not company P&L.

**Seasons:** Japan meteorological spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb. The 2026 autumn observation is **incomplete** (November 2026 excluded); winter spans calendar years. Completed Mercari marketplace sales only; exclude fee/adjustment lines and nonpositive quantity/revenue. Map item_code → product_variants → product_spus, group at SPU1, fallback raw item_code where unresolved. **Rank by units**, tie-break gross sales revenue, require ≥3 seasonally aggregated units, return top 20 per season. Representative item_code is the highest-revenue historical variant, not a live listing ID.

**Important:** This report shows **seasonal-period top sellers**, not verified **seasonal lift**. Evergreen Hero products are **included**, because the question is what sells most in each season; separate [Hero exclusion](hero-products.md) applies when selecting non-Hero promotional candidates. Unequal store launch dates, assortment, stock, promotion and listing exposure distort season comparisons. `years` is observed distinct calendar years in that season, not normalized exposure. Revenue = sum(product_price × quantity), historical gross proxy, not audited net revenue. Validate listing availability, current stock, price and margins before any newsletter action.

## 春季（3–5 月）

| Rank | SPU1 | Representative item_code | Units | Gross revenue ¥ | Observed years |
|---:|---|---|---:|---:|---:|
| 1 | `N515P401190` | `N515P401190B` | 39 | 681,530 | 1 |
| 2 | `N506P339216` | `N506P339216B` | 30 | 502,138 | 1 |
| 3 | `WF320579` | `WF320579WAA` | 28 | 227,712 | 1 |
| 4 | `N515P401211` | `N515P401211W` | 25 | 661,926 | 1 |
| 5 | `N510P240763` | `N510P240763C` | 21 | 75,807 | 1 |
| 6 | `N508P301428` | `N508P301428B` | 20 | 870,264 | 1 |
| 7 | `N509P305801` | `N509P305801A` | 18 | 99,724 | 1 |
| 8 | `N509P277758` | `N509P277758B` | 17 | 353,696 | 1 |
| 9 | `WF295683` | `WF295683DAA` | 17 | 80,209 | 1 |
| 10 | `N510P343720` | `N510P343720C` | 15 | 76,197 | 1 |
| 11 | `SI291166` | `SI291166BCA` | 15 | 32,976 | 1 |
| 12 | `W770P257` | `W770P257104` | 14 | 103,590 | 1 |
| 13 | `N504P384911` | `N504P384911A` | 13 | 187,334 | 1 |
| 14 | `N509P379986` | `N509P379986A` | 12 | 172,367 | 1 |
| 15 | `N508P397567` | `N508P397567A` | 12 | 156,712 | 1 |
| 16 | `N504P284384` | `N504P284384Z` | 12 | 146,290 | 1 |
| 17 | `PP307878` | `PP307878AAA` | 12 | 73,000 | 1 |
| 18 | `N509P326448` | `N509P326448A` | 11 | 33,574 | 1 |
| 19 | `N510P419601` | `N510P419601D` | 10 | 59,552 | 1 |
| 20 | `N506P333838` | `N506P333838A` | 9 | 130,847 | 1 |

## 夏季（6–8 月）

| Rank | SPU1 | Representative item_code | Units | Gross revenue ¥ | Observed years |
|---:|---|---|---:|---:|---:|
| 1 | `N515P401211` | `N515P401211W` | 24 | 709,492 | 1 |
| 2 | `N509P305801` | `N509P305801A` | 19 | 105,252 | 2 |
| 3 | `WF295683` | `WF295683DAA` | 15 | 71,548 | 1 |
| 4 | `WF296965` | `WF296965EAA` | 12 | 86,017 | 1 |
| 5 | `MS187952` | `MS187952AAA` | 12 | 67,058 | 2 |
| 6 | `WF315212` | `WF315212AAA` | 11 | 211,443 | 3 |
| 7 | `N509P305802` | `N509P305802A` | 11 | 133,704 | 2 |
| 8 | `N510P343720` | `N510P343720N` | 11 | 51,786 | 1 |
| 9 | `N510P240763` | `N510P240763D` | 11 | 43,402 | 1 |
| 10 | `N509P277758` | `N509P277758B` | 10 | 210,610 | 1 |
| 11 | `N506P503228D` | `N506P503228D` | 10 | 168,742 | 1 |
| 12 | `N509P305804` | `N509P305804A` | 10 | 98,610 | 2 |
| 13 | `PP195800` | `PP195800DAA` | 10 | 86,915 | 2 |
| 14 | `PP298910` | `PP298910JAA` | 10 | 56,764 | 2 |
| 15 | `N515P401190` | `N515P401190B` | 9 | 153,340 | 1 |
| 16 | `N504P398915` | `N504P398915C` | 9 | 119,458 | 1 |
| 17 | `TX305052` | `TX305052AAA` | 9 | 97,628 | 3 |
| 18 | `N504P384907` | `N504P384907A` | 9 | 80,412 | 1 |
| 19 | `N508P397567` | `N508P397567B` | 8 | 92,788 | 1 |
| 20 | `N510P465593` | `N510P465593L` | 8 | 55,594 | 1 |

## 秋季（9–11 月）

| Rank | SPU1 | Representative item_code | Units | Gross revenue ¥ | Observed years |
|---:|---|---|---:|---:|---:|
| 1 | `N510P371976` | `N510P371976B` | 40 | 153,699 | 1 |
| 2 | `PP298908` | `PP298908CAA` | 16 | 79,471 | 3 |
| 3 | `PP195800` | `PP195800CAA` | 13 | 103,733 | 3 |
| 4 | `ES324482` | `ES324482AAA` | 12 | 226,525 | 1 |
| 5 | `N508P301428` | `N508P301428A` | 11 | 435,370 | 1 |
| 6 | `N508P320628` | `N508P320628D` | 11 | 93,346 | 2 |
| 7 | `N506P315202` | `N506P315202C` | 11 | 86,297 | 1 |
| 8 | `PP309544` | `PP309544GAA` | 11 | 49,097 | 2 |
| 9 | `N510P240763` | `N510P240763O` | 11 | 40,887 | 1 |
| 10 | `N509P16553` | `N509P165537` | 10 | 266,911 | 3 |
| 11 | `WF194353` | `WF194353AAA` | 10 | 79,744 | 2 |
| 12 | `N506P339216` | `N506P339216B` | 9 | 147,640 | 1 |
| 13 | `N511P336633` | `N511P336633W` | 9 | 82,707 | 2 |
| 14 | `N506P315200` | `N506P315200D` | 8 | 57,542 | 2 |
| 15 | `PP298910` | `PP298910QAA` | 8 | 45,738 | 2 |
| 16 | `N509P305801` | `N509P305801A` | 8 | 44,082 | 2 |
| 17 | `N510P293821` | `N510P293821P` | 8 | 34,387 | 2 |
| 18 | `N506P408474` | `N506P408474C` | 7 | 99,793 | 1 |
| 19 | `TX305052` | `TX305052CAA` | 7 | 76,264 | 2 |
| 20 | `N504P384907` | `N504P384907A` | 7 | 67,698 | 1 |

## 冬季（12–2 月）

| Rank | SPU1 | Representative item_code | Units | Gross revenue ¥ | Observed years |
|---:|---|---|---:|---:|---:|
| 1 | `N509P277758` | `N509P277758A` | 23 | 478,894 | 2 |
| 2 | `WF296965` | `WF296965DAA` | 18 | 94,104 | 2 |
| 3 | `N511P329013` | `N511P329013N` | 13 | 144,414 | 2 |
| 4 | `N510P293034G` | `N510P293034G` | 13 | 79,179 | 2 |
| 5 | `N510P254487O` | `N510P254487O` | 13 | 59,090 | 1 |
| 6 | `WF320581` | `WF320581BAA` | 12 | 103,091 | 2 |
| 7 | `N509P305801` | `N509P305801A` | 12 | 67,081 | 2 |
| 8 | `PP298910` | `PP298910AAA` | 12 | 66,979 | 2 |
| 9 | `N510P254487P` | `N510P254487P` | 10 | 42,384 | 2 |
| 10 | `N512P232188` | `N512P232188G` | 10 | 26,321 | 2 |
| 11 | `N508P301428` | `N508P301428B` | 9 | 398,078 | 2 |
| 12 | `N512P360687` | `N512P360687W` | 9 | 231,835 | 2 |
| 13 | `N508P194679` | `N508P194679A` | 9 | 162,649 | 2 |
| 14 | `N515P196885` | `N515P196885W` | 8 | 98,782 | 1 |
| 15 | `WF320580` | `WF320580WAA` | 8 | 95,078 | 1 |
| 16 | `N512P342210` | `N512P342210B` | 8 | 86,800 | 2 |
| 17 | `N512P295133W` | `N512P295133W` | 8 | 79,613 | 2 |
| 18 | `N504P384907` | `N504P384907A` | 8 | 60,180 | 1 |
| 19 | `TX289429` | `TX289429BAA` | 7 | 70,953 | 3 |
| 20 | `SETN506P29541` | `SETN506P295412BB` | 7 | 68,768 | 2 |

## Interpretation and downstream usage

- **Seasonal Top Sellers:** raw historical quantity leaders in each season, with no claim of a causal seasonal preference.
- **Seasonal Lift (not yet computed):** compare each SPU1's season share with market-wide season share after correcting for active listing days, inventory and promotions; require comparable periods before labeling a true seasonal winner.
- **Newsletter:** use the ranked products as discovery only; choose no more than 10 *actual eligible live listings* for a given shop after campaign validation.

Related: [monthly Top 20](monthly-top20-candidates.md), [methodology](seasonality-method.md), [seasonality intelligence](seasonality-intelligence.md).
