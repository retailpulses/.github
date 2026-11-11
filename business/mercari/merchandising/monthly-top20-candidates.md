# Mercari monthly Top-20 bestseller discovery — all four shops + consolidated

As of 2026-11-11. All available historical completed Mercari marketplace sales through **2026-10-31 JST** (November 2026 incomplete). Four shops mapped from `platform_accounts` and aggregated using `sales_orders.source_store_id` to avoid dropping rows with missing `platform_account_id`. No artificial year restriction. Shop1 starts May 2024, Shop2 Jan 2025, Shop3 Dec 2025, Shop4 Feb 2026 in the observed qualifying order history. Shop3 contributes to demand intelligence only, **not** company revenue/P&L.

**Ranking:** map item_code to canonical SPU1 using product_variants/product_spus, combine variants, exclude **25 cross-store evergreen Hero candidate SPU1s** (≥20 units, ≥8 distinct year-months), reject fee/adjustment and nonpositive sale lines, require **≥3 units per SPU1 per calendar month across available years**. Take top 10 by gross item revenue, fill remaining slots with *distinct* top unit-ranked products. Include both ranks. Do not invent candidates to reach 20. Revenue is gross proxy (price × quantity), not reconciled net sales. Representative item_code is highest-revenue variant, **not** a confirmed live listing.

**Newsletter:** candidate pool is up to 20 SPU1s per shop-month, but each newsletter may promote **up to 10 live eligible listings**. Shop-specific listing, stock, current price, Effective TCOGS/margin, quota and approval checks are mandatory. This is historical bestseller candidate intelligence, **not yet validated seasonality lift**. Multi-year month coverage varies and must be normalized for actual seasonality conclusions. See [methodology](seasonality-method.md), [Hero exclusions](hero-products.md), [newsletter governance](../newsletter.md).

## Shop1 — all available years

### 1月 — 5 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N509P291413` | `N509P291413E` | 4 | 40,056 | 1 | 1 | 1 |
| 2 | Revenue | `WF320580` | `WF320580WAA` | 3 | 35,400 | 2 | 2 | 1 |
| 3 | Revenue | `N515P170407` | `N515P170407N` | 3 | 26,133 | 3 | 3 | 1 |
| 4 | Revenue | `N507P264589` | `N507P264589B` | 3 | 10,030 | 4 | 4 | 1 |
| 5 | Revenue | `N512P232188` | `N512P232188G` | 3 | 7,938 | 5 | 5 | 1 |

### 2月 — 4 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `PP315133` | `PP315133AAA` | 3 | 42,345 | 1 | 2 | 1 |
| 2 | Revenue | `N509P320510` | `N509P320510A` | 3 | 23,866 | 2 | 3 | 1 |
| 3 | Revenue | `N510P293034G` | `N510P293034G` | 4 | 23,712 | 3 | 1 | 1 |
| 4 | Revenue | `N509P336421` | `N509P336421B` | 3 | 7,065 | 4 | 4 | 1 |

### 3月 — 3 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N504P398914` | `N504P398914C` | 3 | 38,502 | 1 | 1 | 1 |
| 2 | Revenue | `N504P398915` | `N504P398915Z` | 3 | 37,530 | 2 | 2 | 1 |
| 3 | Revenue | `N507P264589` | `N507P264589A` | 3 | 5,100 | 3 | 3 | 1 |

### 4月 — 1 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P339216` | `N506P339216A` | 4 | 65,756 | 1 | 1 | 1 |

### 5月 — 1 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P360600` | `N506P360600A` | 3 | 43,702 | 1 | 1 | 1 |

### 6月 — 0 candidates

No products meeting the ≥3-unit evidence floor.

### 7月 — 2 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P503228D` | `N506P503228D` | 3 | 50,202 | 1 | 1 | 1 |
| 2 | Revenue | `MS306394` | `MS306394AAA` | 3 | 32,400 | 2 | 2 | 1 |

### 8月 — 2 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `WF326429` | `WF326429BAA` | 3 | 99,791 | 1 | 2 | 2 |
| 2 | Revenue | `WF295662` | `WF295662DAA` | 6 | 58,980 | 2 | 1 | 1 |

### 9月 — 6 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `ES324482` | `ES324482AAA` | 7 | 133,210 | 1 | 1 | 1 |
| 2 | Revenue | `WF324486` | `WF324486BAA` | 3 | 51,040 | 2 | 3 | 1 |
| 3 | Revenue | `PH313803CAA` | `PH313803CAA` | 3 | 34,290 | 3 | 4 | 1 |
| 4 | Revenue | `WF297842AAA` | `WF297842AAA` | 3 | 22,950 | 4 | 5 | 1 |
| 5 | Revenue | `WF292337` | `WF292337AAA` | 3 | 17,850 | 5 | 6 | 1 |
| 6 | Revenue | `HOKKAIDO0611426` | `HOKKAIDO0611426` | 5 | 5,000 | 6 | 2 | 1 |

### 10月 — 6 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P359769` | `N506P359769C` | 3 | 81,668 | 1 | 2 | 2 |
| 2 | Revenue | `N506P339216` | `N506P339216D` | 3 | 47,820 | 2 | 3 | 1 |
| 3 | Revenue | `TX289429` | `TX289429BAA` | 4 | 43,311 | 3 | 1 | 1 |
| 4 | Revenue | `WF297842AAA` | `WF297842AAA` | 3 | 27,690 | 4 | 4 | 1 |
| 5 | Revenue | `N504P415034` | `N504P415034T` | 3 | 15,300 | 5 | 5 | 1 |
| 6 | Revenue | `N510P371973` | `N510P371973W` | 3 | 13,380 | 6 | 6 | 1 |

### 11月 — 6 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `WF326433` | `WF326433AAA` | 3 | 111,577 | 1 | 2 | 1 |
| 2 | Revenue | `ES324482` | `ES324482AAA` | 5 | 93,315 | 2 | 1 | 1 |
| 3 | Revenue | `N511P336633` | `N511P336633W` | 3 | 28,480 | 3 | 3 | 1 |
| 4 | Revenue | `TH197100` | `TH197100AAA` | 3 | 23,780 | 4 | 4 | 1 |
| 5 | Revenue | `N512P232188` | `N512P232188G` | 3 | 10,610 | 5 | 5 | 1 |
| 6 | Revenue | `N511P221569` | `N511P221569W` | 3 | 9,120 | 6 | 6 | 1 |

### 12月 — 9 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N512P360687` | `N512P360687W` | 7 | 175,270 | 1 | 1 | 1 |
| 2 | Revenue | `WF319897` | `WF319897CAA` | 3 | 136,912 | 2 | 6 | 2 |
| 3 | Revenue | `WF326429` | `WF326429AAA` | 4 | 131,180 | 3 | 4 | 1 |
| 4 | Revenue | `N508P194679` | `N508P194679A` | 7 | 125,457 | 4 | 2 | 2 |
| 5 | Revenue | `WF326433` | `WF326433BAA` | 3 | 98,876 | 5 | 7 | 2 |
| 6 | Revenue | `WF309175` | `WF309175AAA` | 3 | 51,784 | 6 | 8 | 1 |
| 7 | Revenue | `TX289429` | `TX289429BAA` | 3 | 29,703 | 7 | 9 | 2 |
| 8 | Revenue | `N509P210958A` | `N509P210958A` | 5 | 24,225 | 8 | 3 | 1 |
| 9 | Revenue | `N512P232188` | `N512P232188G` | 4 | 10,785 | 9 | 5 | 1 |

## Shop2 — all available years

### 1月 — 6 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P255944` | `N506P255944A` | 4 | 88,109 | 1 | 3 | 1 |
| 2 | Revenue | `N512P304773` | `N512P304773W` | 5 | 33,334 | 2 | 2 | 1 |
| 3 | Revenue | `N512P295133B` | `N512P295133B` | 3 | 29,995 | 3 | 4 | 1 |
| 4 | Revenue | `N515P252400` | `N515P252400W` | 3 | 28,942 | 4 | 5 | 1 |
| 5 | Revenue | `N510P254487P` | `N510P254487P` | 6 | 25,134 | 5 | 1 | 1 |
| 6 | Revenue | `N0000000000` | `N0000000000` | 3 | 20,500 | 6 | 6 | 1 |

### 2月 — 4 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N510P16798` | `N510P167986` | 4 | 35,796 | 1 | 3 | 2 |
| 2 | Revenue | `N510P293034G` | `N510P293034G` | 5 | 29,034 | 2 | 1 | 1 |
| 3 | Revenue | `N515P266079` | `N515P266079S` | 5 | 20,220 | 3 | 2 | 1 |
| 4 | Revenue | `N512P304772` | `N512P304772W` | 3 | 19,736 | 4 | 4 | 1 |

### 3月 — 7 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N504P384911` | `N504P384911A` | 4 | 55,880 | 1 | 2 | 1 |
| 2 | Revenue | `N509P304376` | `N509P304376A` | 3 | 51,528 | 2 | 5 | 1 |
| 3 | Revenue | `N508P320628` | `N508P320628A` | 4 | 33,128 | 3 | 3 | 1 |
| 4 | Revenue | `N509P276931` | `N509P276931C` | 5 | 24,276 | 4 | 1 | 1 |
| 5 | Revenue | `WF291562` | `WF291562CAA` | 4 | 23,640 | 5 | 4 | 1 |
| 6 | Revenue | `N509P317043` | `N509P317043A` | 3 | 22,601 | 6 | 6 | 1 |
| 7 | Revenue | `PP315895` | `PP315895NAA` | 3 | 17,139 | 7 | 7 | 1 |

### 4月 — 4 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `PP315895` | `PP315895AAA` | 3 | 17,522 | 1 | 1 | 1 |
| 2 | Revenue | `N508P394171` | `N508P394171C` | 3 | 17,071 | 2 | 2 | 1 |
| 3 | Revenue | `N504P180006` | `N504P180006W` | 3 | 15,066 | 3 | 3 | 1 |
| 4 | Revenue | `N0000000000` | `N0000000000` | 3 | 1,800 | 4 | 4 | 1 |

### 5月 — 0 candidates

No products meeting the ≥3-unit evidence floor.

### 6月 — 1 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N509P176640` | `N509P176640K` | 3 | 68,495 | 1 | 1 | 2 |

### 7月 — 0 candidates

No products meeting the ≥3-unit evidence floor.

### 8月 — 2 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N508P308768` | `N508P308768G` | 4 | 50,820 | 1 | 1 | 1 |
| 2 | Revenue | `WF296359` | `WF296359BAA` | 3 | 38,259 | 2 | 2 | 1 |

### 9月 — 6 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `WF303355` | `WF303355AAA` | 5 | 97,760 | 1 | 1 | 1 |
| 2 | Revenue | `N508P291699` | `N508P291699K` | 3 | 31,530 | 2 | 3 | 1 |
| 3 | Revenue | `MX317937` | `MX317937AAA` | 3 | 23,820 | 3 | 4 | 1 |
| 4 | Revenue | `N504P335428` | `N504P335428W` | 3 | 23,650 | 4 | 5 | 1 |
| 5 | Revenue | `PP309928` | `PP309928GAA` | 4 | 20,502 | 5 | 2 | 2 |
| 6 | Revenue | `hokkaido900` | `hokkaido900` | 3 | 2,880 | 6 | 6 | 1 |

### 10月 — 6 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `TX295749` | `TX295749CAA` | 4 | 32,756 | 1 | 1 | 1 |
| 2 | Revenue | `N515P416432` | `N515P416432C` | 3 | 31,960 | 2 | 4 | 1 |
| 3 | Revenue | `W6360P546830` | `W6360P546830` | 4 | 22,400 | 3 | 2 | 1 |
| 4 | Revenue | `N510P293821` | `N510P293821W` | 4 | 15,627 | 4 | 3 | 1 |
| 5 | Revenue | `TX299555` | `TX299555AAA` | 3 | 14,631 | 5 | 5 | 1 |
| 6 | Revenue | `N510P371976` | `N510P371976W` | 3 | 12,890 | 6 | 6 | 1 |

### 11月 — 2 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N512P295132` | `N512P295132W` | 4 | 52,212 | 1 | 1 | 1 |
| 2 | Revenue | `N512P295132B` | `N512P295132B` | 3 | 28,900 | 2 | 2 | 1 |

### 12月 — 10 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N510P254487O` | `N510P254487O` | 13 | 59,090 | 1 | 1 | 1 |
| 2 | Revenue | `N509P209661` | `N509P209661A` | 4 | 48,809 | 2 | 2 | 1 |
| 3 | Revenue | `N515P196885` | `N515P196885W` | 4 | 47,022 | 3 | 3 | 1 |
| 4 | Revenue | `N512P342210` | `N512P342210B` | 3 | 33,600 | 4 | 7 | 1 |
| 5 | Revenue | `N512P337889` | `N512P337889B` | 4 | 32,512 | 5 | 4 | 1 |
| 6 | Revenue | `N508P299231` | `N508P299231B` | 3 | 31,073 | 6 | 8 | 1 |
| 7 | Revenue | `N515P252389` | `N515P252389W` | 4 | 23,720 | 7 | 5 | 1 |
| 8 | Revenue | `MS322500` | `MS322500AAA` | 3 | 18,940 | 8 | 9 | 1 |
| 9 | Revenue | `N510P293821` | `N510P293821B` | 4 | 18,564 | 9 | 6 | 1 |
| 10 | Revenue | `N510P254487P` | `N510P254487P` | 3 | 13,194 | 10 | 10 | 1 |

## Shop3 — all available years

### 1月 — 3 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N504P384907` | `N504P384907A` | 4 | 29,880 | 1 | 1 | 1 |
| 2 | Revenue | `N506P270388` | `N506P270388B` | 3 | 23,520 | 2 | 3 | 1 |
| 3 | Revenue | `N515P332844` | `N515P332844B` | 4 | 22,268 | 3 | 2 | 1 |

### 2月 — 2 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N511P329013` | `N511P329013N` | 3 | 32,802 | 1 | 1 | 1 |
| 2 | Revenue | `N512P295133N` | `N512P295133N` | 3 | 27,912 | 2 | 2 | 1 |

### 3月 — 11 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P339216` | `N506P339216D` | 6 | 102,202 | 1 | 2 | 1 |
| 2 | Revenue | `N509SA303811` | `N509SA303811A` | 3 | 88,925 | 2 | 6 | 1 |
| 3 | Revenue | `N512P401975` | `N512P401975W` | 6 | 79,866 | 3 | 3 | 1 |
| 4 | Revenue | `N509SA329186` | `N509SA329186A` | 3 | 79,572 | 4 | 7 | 1 |
| 5 | Revenue | `N512P356532` | `N512P356532B` | 3 | 58,074 | 5 | 8 | 1 |
| 6 | Revenue | `WF320579` | `WF320579WAA` | 7 | 57,332 | 6 | 1 | 1 |
| 7 | Revenue | `W1082P373` | `W1082P373514` | 4 | 42,444 | 7 | 5 | 1 |
| 8 | Revenue | `N511P335775` | `N511P335775N` | 3 | 30,152 | 8 | 9 | 1 |
| 9 | Revenue | `N510P419601` | `N510P419601Z` | 5 | 29,923 | 9 | 4 | 1 |
| 10 | Revenue | `N511P335797` | `N511P335797N` | 3 | 24,396 | 10 | 10 | 1 |
| 11 | Quantity fill | `WF295683` | `WF295683CAA` | 3 | 14,201 | 11 | 11 | 1 |

### 4月 — 2 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P339216` | `N506P339216B` | 10 | 167,445 | 1 | 1 | 1 |
| 2 | Revenue | `W770P366` | `W770P366224` | 3 | 19,014 | 2 | 2 | 1 |

### 5月 — 2 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N509P332040` | `N509P332040D` | 3 | 73,942 | 1 | 2 | 1 |
| 2 | Revenue | `N506P339216` | `N506P339216B` | 4 | 66,233 | 2 | 1 | 1 |

### 6月 — 1 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N510P254505` | `N510P254505D` | 3 | 17,040 | 1 | 1 | 1 |

### 7月 — 5 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P503228D` | `N506P503228D` | 5 | 83,670 | 1 | 1 | 1 |
| 2 | Revenue | `N504P384909` | `N504P384909A` | 4 | 48,313 | 2 | 2 | 1 |
| 3 | Revenue | `N504P384911` | `N504P384911A` | 3 | 46,552 | 3 | 4 | 1 |
| 4 | Revenue | `N504P384907` | `N504P384907A` | 4 | 34,464 | 4 | 3 | 1 |
| 5 | Revenue | `N509P446031` | `N509P446031A` | 3 | 12,225 | 5 | 5 | 1 |

### 8月 — 1 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P503228C` | `N506P503228C` | 3 | 51,578 | 1 | 1 | 1 |

### 9月 — 4 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N504P384907` | `N504P384907A` | 6 | 57,750 | 1 | 1 | 1 |
| 2 | Revenue | `WF321176` | `WF321176BAA` | 3 | 25,995 | 2 | 2 | 1 |
| 3 | Revenue | `N508P320628` | `N508P320628D` | 3 | 25,825 | 3 | 3 | 1 |
| 4 | Revenue | `WF295684` | `WF295684CAA` | 3 | 12,000 | 4 | 4 | 1 |

### 10月 — 1 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N508P320628` | `N508P320628D` | 3 | 24,840 | 1 | 1 | 1 |

### 11月 — 0 candidates

No products meeting the ≥3-unit evidence floor.

### 12月 — 2 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N511P329013` | `N511P329013N` | 5 | 57,550 | 1 | 1 | 1 |
| 2 | Revenue | `SETN506P29541` | `SETN506P295412BB` | 4 | 41,768 | 2 | 2 | 1 |

## Shop4 — all available years

### 1月 — 0 candidates

No products meeting the ≥3-unit evidence floor.

### 2月 — 0 candidates

No products meeting the ≥3-unit evidence floor.

### 3月 — 5 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N515P401190` | `N515P401190B` | 21 | 359,320 | 1 | 1 | 1 |
| 2 | Revenue | `N506P339216` | `N506P339216A` | 3 | 49,794 | 2 | 2 | 1 |
| 3 | Revenue | `N508P397567` | `N508P397567A` | 3 | 38,468 | 3 | 3 | 1 |
| 4 | Revenue | `WF320579` | `WF320579WAA` | 3 | 24,852 | 4 | 4 | 1 |
| 5 | Revenue | `N510P343720` | `N510P343720B` | 3 | 15,859 | 5 | 5 | 1 |

### 4月 — 11 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `W1266S00` | `W1266S00005` | 3 | 163,793 | 1 | 8 | 1 |
| 2 | Revenue | `N515P401190` | `N515P401190B` | 9 | 160,920 | 2 | 1 | 1 |
| 3 | Revenue | `N509P379986` | `N509P379986A` | 5 | 74,273 | 3 | 2 | 1 |
| 4 | Revenue | `N508P426353` | `N508P426353A` | 5 | 53,376 | 4 | 3 | 1 |
| 5 | Revenue | `WF320579` | `WF320579WAA` | 4 | 31,769 | 5 | 5 | 1 |
| 6 | Revenue | `N506P331616` | `N506P331616B` | 4 | 26,720 | 6 | 6 | 1 |
| 7 | Revenue | `N508P383787` | `N508P383787A` | 3 | 25,832 | 7 | 9 | 1 |
| 8 | Revenue | `WF295683` | `WF295683DAA` | 5 | 23,657 | 8 | 4 | 1 |
| 9 | Revenue | `WF312693` | `WF312693CAA` | 3 | 23,374 | 9 | 10 | 1 |
| 10 | Revenue | `N512P403841` | `N512P403841C` | 3 | 20,184 | 10 | 11 | 1 |
| 11 | Quantity fill | `N510P343720` | `N510P343720C` | 4 | 19,286 | 11 | 7 | 1 |

### 5月 — 14 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N515P401190` | `N515P401190B` | 8 | 140,040 | 1 | 1 | 1 |
| 2 | Revenue | `N508P397567` | `N508P397567A` | 7 | 89,694 | 2 | 2 | 1 |
| 3 | Revenue | `N509P209661` | `N509P209661A` | 4 | 65,360 | 3 | 6 | 1 |
| 4 | Revenue | `N506P333838` | `N506P333838A` | 4 | 57,660 | 4 | 7 | 1 |
| 5 | Revenue | `N509P350413` | `N509P350413B` | 3 | 52,776 | 5 | 11 | 1 |
| 6 | Revenue | `N509P379986` | `N509P379986A` | 4 | 52,532 | 6 | 8 | 1 |
| 7 | Revenue | `N508P308768` | `N508P308768A` | 4 | 52,215 | 7 | 9 | 1 |
| 8 | Revenue | `WF320579` | `WF320579WAA` | 6 | 48,165 | 8 | 3 | 1 |
| 9 | Revenue | `N510P343720` | `N510P343720L` | 6 | 28,742 | 9 | 4 | 1 |
| 10 | Revenue | `N509P326448` | `N509P326448A` | 6 | 17,208 | 10 | 5 | 1 |
| 11 | Quantity fill | `N510P263860` | `N510P263860P` | 4 | 8,204 | 14 | 10 | 1 |
| 12 | Quantity fill | `N510P371980` | `N510P371980P` | 3 | 16,617 | 11 | 12 | 1 |
| 13 | Quantity fill | `N510P343719` | `N510P343719C` | 3 | 15,300 | 12 | 13 | 1 |
| 14 | Quantity fill | `WF295683` | `WF295683AAA` | 3 | 13,962 | 13 | 14 | 1 |

### 6月 — 11 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N515P401190` | `N515P401190B` | 4 | 69,729 | 1 | 2 | 1 |
| 2 | Revenue | `WF295683` | `WF295683DAA` | 10 | 47,458 | 2 | 1 | 1 |
| 3 | Revenue | `N509P373002` | `N509P373002A` | 4 | 33,271 | 3 | 3 | 1 |
| 4 | Revenue | `WF292338` | `WF292338AAA` | 3 | 31,453 | 4 | 5 | 1 |
| 5 | Revenue | `TX287474` | `TX287474YAA` | 3 | 30,826 | 5 | 6 | 1 |
| 6 | Revenue | `N509P360123` | `N509P360123A` | 3 | 27,654 | 6 | 7 | 1 |
| 7 | Revenue | `WF320579` | `WF320579WAA` | 3 | 23,583 | 7 | 8 | 1 |
| 8 | Revenue | `N510P469767` | `N510P469767Z` | 4 | 21,553 | 8 | 4 | 1 |
| 9 | Revenue | `N512P403841` | `N512P403841F` | 3 | 21,170 | 9 | 9 | 1 |
| 10 | Revenue | `N508P383786` | `N508P383786B` | 3 | 20,342 | 10 | 10 | 1 |
| 11 | Quantity fill | `N510P371980` | `N510P371980B` | 3 | 11,359 | 11 | 11 | 1 |

### 7月 — 8 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `WF315212` | `WF315212BAA` | 5 | 95,726 | 1 | 3 | 1 |
| 2 | Revenue | `N515P401190` | `N515P401190W` | 5 | 83,611 | 2 | 4 | 1 |
| 3 | Revenue | `N504P398915` | `N504P398915B` | 6 | 78,096 | 3 | 2 | 1 |
| 4 | Revenue | `N510P343720` | `N510P343720N` | 10 | 47,145 | 4 | 1 | 1 |
| 5 | Revenue | `WF320579` | `WF320579WAA` | 3 | 25,450 | 5 | 6 | 1 |
| 6 | Revenue | `N510P293820` | `N510P293820W` | 4 | 19,825 | 6 | 5 | 1 |
| 7 | Revenue | `N510P343719` | `N510P343719L` | 3 | 15,975 | 7 | 7 | 1 |
| 8 | Revenue | `N509P446031` | `N509P446031A` | 3 | 10,227 | 8 | 8 | 1 |

### 8月 — 8 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N508P397567` | `N508P397567A` | 6 | 75,443 | 1 | 1 | 1 |
| 2 | Revenue | `WF315212` | `WF315212BAA` | 3 | 57,848 | 2 | 5 | 1 |
| 3 | Revenue | `WF195239` | `WF195239FAA` | 3 | 57,294 | 3 | 6 | 1 |
| 4 | Revenue | `N504P398915` | `N504P398915C` | 3 | 41,362 | 4 | 7 | 1 |
| 5 | Revenue | `N510P465593` | `N510P465593L` | 6 | 40,194 | 5 | 2 | 1 |
| 6 | Revenue | `N509P472253` | `N509P472253A` | 4 | 32,379 | 6 | 3 | 1 |
| 7 | Revenue | `WF295683` | `WF295683FAA` | 4 | 19,320 | 7 | 4 | 1 |
| 8 | Revenue | `N504P312648` | `N504P312648A` | 3 | 12,384 | 8 | 8 | 1 |

### 9月 — 4 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N508P397567` | `N508P397567A` | 4 | 48,972 | 1 | 2 | 1 |
| 2 | Revenue | `N506P408474` | `N506P408474C` | 3 | 40,917 | 2 | 3 | 1 |
| 3 | Revenue | `N510P371976` | `N510P371976B` | 8 | 30,008 | 3 | 1 | 1 |
| 4 | Revenue | `N510P465593` | `N510P465593L` | 3 | 18,100 | 4 | 4 | 1 |

### 10月 — 4 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N515P401190` | `N515P401190B` | 6 | 105,492 | 1 | 2 | 1 |
| 2 | Revenue | `N510P371976` | `N510P371976B` | 27 | 102,898 | 2 | 1 | 1 |
| 3 | Revenue | `N504P398915` | `N504P398915Z` | 3 | 40,558 | 3 | 3 | 1 |
| 4 | Revenue | `N00000002` | `N00000002` | 3 | 2,700 | 4 | 4 | 1 |

### 11月 — 0 candidates

No products meeting the ≥3-unit evidence floor.

### 12月 — 0 candidates

No products meeting the ≥3-unit evidence floor.

## All shops consolidated — all available years

### 1月 — 20 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P255944` | `N506P255944A` | 4 | 88,109 | 1 | 5 | 1 |
| 2 | Revenue | `N512P401909` | `N512P401909B` | 5 | 54,233 | 2 | 2 | 1 |
| 3 | Revenue | `WF320580` | `WF320580WAA` | 4 | 47,630 | 3 | 6 | 1 |
| 4 | Revenue | `N509P291413` | `N509P291413E` | 4 | 40,056 | 4 | 7 | 1 |
| 5 | Revenue | `N515P252400` | `N515P252400W` | 4 | 38,423 | 5 | 8 | 1 |
| 6 | Revenue | `N504P384907` | `N504P384907A` | 5 | 37,380 | 6 | 3 | 1 |
| 7 | Revenue | `N512P276868` | `N512P276868A` | 3 | 35,891 | 7 | 11 | 1 |
| 8 | Revenue | `N512P304773` | `N512P304773W` | 5 | 33,334 | 8 | 4 | 1 |
| 9 | Revenue | `N511P335797` | `N511P335797N` | 4 | 32,022 | 9 | 9 | 1 |
| 10 | Revenue | `N512P342210` | `N512P342210B` | 3 | 31,920 | 10 | 12 | 1 |
| 11 | Quantity fill | `N510P254487P` | `N510P254487P` | 7 | 29,190 | 13 | 1 | 1 |
| 12 | Quantity fill | `N515P332844` | `N515P332844B` | 4 | 22,268 | 17 | 10 | 1 |
| 13 | Quantity fill | `N512P295133B` | `N512P295133B` | 3 | 29,995 | 11 | 13 | 1 |
| 14 | Quantity fill | `N512P295133W` | `N512P295133W` | 3 | 29,895 | 12 | 14 | 1 |
| 15 | Quantity fill | `MS283416` | `MS283416AAA` | 3 | 27,765 | 14 | 15 | 1 |
| 16 | Quantity fill | `N515P170407` | `N515P170407N` | 3 | 26,133 | 15 | 16 | 1 |
| 17 | Quantity fill | `N506P270388` | `N506P270388B` | 3 | 23,520 | 16 | 17 | 1 |
| 18 | Quantity fill | `N0000000000` | `N0000000000` | 3 | 20,500 | 18 | 18 | 1 |
| 19 | Quantity fill | `N510P293034G` | `N510P293034G` | 3 | 18,723 | 19 | 19 | 1 |
| 20 | Quantity fill | `N509P276931` | `N509P276931A` | 3 | 17,043 | 20 | 20 | 1 |

### 2月 — 14 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N511P329013` | `N511P329013N` | 5 | 53,486 | 1 | 3 | 1 |
| 2 | Revenue | `N510P293034G` | `N510P293034G` | 9 | 52,746 | 2 | 1 | 1 |
| 3 | Revenue | `WF320580` | `WF320580WAA` | 4 | 47,448 | 3 | 5 | 1 |
| 4 | Revenue | `PP315133` | `PP315133AAA` | 3 | 42,345 | 4 | 8 | 1 |
| 5 | Revenue | `N510P16798` | `N510P167986` | 4 | 35,796 | 5 | 6 | 2 |
| 6 | Revenue | `N512P401975` | `N512P401975G` | 3 | 34,695 | 6 | 9 | 1 |
| 7 | Revenue | `N512P295133N` | `N512P295133N` | 3 | 27,912 | 7 | 10 | 1 |
| 8 | Revenue | `N512P304772` | `N512P304772W` | 4 | 26,937 | 8 | 7 | 1 |
| 9 | Revenue | `N509P292994` | `N509P292994A` | 5 | 23,868 | 9 | 4 | 1 |
| 10 | Revenue | `N509P320510` | `N509P320510A` | 3 | 23,866 | 10 | 11 | 1 |
| 11 | Quantity fill | `N515P266079` | `N515P266079S` | 6 | 23,230 | 11 | 2 | 1 |
| 12 | Quantity fill | `N504P384907` | `N504P384907A` | 3 | 22,800 | 12 | 12 | 1 |
| 13 | Quantity fill | `N509P326102` | `N509P326102B` | 3 | 12,570 | 13 | 13 | 1 |
| 14 | Quantity fill | `N509P336421` | `N509P336421B` | 3 | 7,065 | 14 | 14 | 1 |

### 3月 — 20 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N515P401190` | `N515P401190B` | 22 | 380,570 | 1 | 1 | 1 |
| 2 | Revenue | `N506P339216` | `N506P339216A` | 10 | 168,963 | 2 | 3 | 1 |
| 3 | Revenue | `N511S407763` | `N511S407763G` | 3 | 115,245 | 3 | 17 | 1 |
| 4 | Revenue | `N512P401975` | `N512P401975N` | 8 | 107,244 | 4 | 4 | 1 |
| 5 | Revenue | `WF320579` | `WF320579WAA` | 12 | 98,600 | 5 | 2 | 1 |
| 6 | Revenue | `N509SA303811` | `N509SA303811A` | 3 | 88,925 | 6 | 18 | 1 |
| 7 | Revenue | `N509SA329186` | `N509SA329186A` | 3 | 79,572 | 7 | 19 | 1 |
| 8 | Revenue | `N512P356532` | `N512P356532B` | 4 | 75,897 | 8 | 12 | 1 |
| 9 | Revenue | `N504P384911` | `N504P384911A` | 5 | 69,480 | 9 | 8 | 1 |
| 10 | Revenue | `MS283514` | `MS283514AAA` | 3 | 63,707 | 10 | 20 | 1 |
| 11 | Quantity fill | `N510P419601` | `N510P419601Z` | 7 | 41,954 | 16 | 5 | 1 |
| 12 | Quantity fill | `N509P317043` | `N509P317043A` | 6 | 43,649 | 15 | 6 | 1 |
| 13 | Quantity fill | `WF291562` | `WF291562CAA` | 6 | 34,758 | 20 | 7 | 1 |
| 14 | Quantity fill | `W1082P373` | `W1082P373514` | 5 | 52,524 | 12 | 9 | 1 |
| 15 | Quantity fill | `N510P343720` | `N510P343720C` | 5 | 28,169 | 26 | 10 | 1 |
| 16 | Quantity fill | `N509P276931` | `N509P276931C` | 5 | 24,276 | 31 | 11 | 1 |
| 17 | Quantity fill | `N508P320628` | `N508P320628A` | 4 | 33,128 | 21 | 13 | 1 |
| 18 | Quantity fill | `N509P292994` | `N509P292994A` | 4 | 19,165 | 32 | 14 | 1 |
| 19 | Quantity fill | `WF295683` | `WF295683CAA` | 4 | 18,401 | 33 | 15 | 1 |
| 20 | Quantity fill | `N507P264589` | `N507P264589A` | 4 | 7,323 | 38 | 16 | 1 |

### 4月 — 20 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P339216` | `N506P339216B` | 16 | 266,942 | 1 | 1 | 1 |
| 2 | Revenue | `W1266S00` | `W1266S00005` | 4 | 212,072 | 2 | 8 | 1 |
| 3 | Revenue | `N515P401190` | `N515P401190B` | 9 | 160,920 | 3 | 2 | 1 |
| 4 | Revenue | `WF318822` | `WF318822AAA` | 3 | 93,945 | 4 | 14 | 1 |
| 5 | Revenue | `N504P384911` | `N504P384911A` | 5 | 74,793 | 5 | 5 | 1 |
| 6 | Revenue | `N509P379986` | `N509P379986A` | 5 | 74,273 | 6 | 6 | 1 |
| 7 | Revenue | `WF320579` | `WF320579WAA` | 8 | 65,425 | 7 | 4 | 1 |
| 8 | Revenue | `N508P426353` | `N508P426353A` | 5 | 53,376 | 8 | 7 | 1 |
| 9 | Revenue | `MS308087` | `MS308087AAA` | 3 | 52,829 | 9 | 15 | 1 |
| 10 | Revenue | `WF295683` | `WF295683DAA` | 9 | 43,280 | 10 | 3 | 1 |
| 11 | Quantity fill | `N509P399518` | `N509P399518A` | 4 | 32,108 | 13 | 9 | 1 |
| 12 | Quantity fill | `N506P331616` | `N506P331616B` | 4 | 26,720 | 16 | 10 | 1 |
| 13 | Quantity fill | `W770P366` | `W770P366224` | 4 | 25,980 | 17 | 11 | 1 |
| 14 | Quantity fill | `PP315895` | `PP315895AAA` | 4 | 23,260 | 21 | 12 | 1 |
| 15 | Quantity fill | `N510P343720` | `N510P343720C` | 4 | 19,286 | 23 | 13 | 1 |
| 16 | Quantity fill | `MS304812` | `MS304812BAA` | 3 | 38,636 | 11 | 16 | 1 |
| 17 | Quantity fill | `WF320580` | `WF320580WAA` | 3 | 34,911 | 12 | 17 | 1 |
| 18 | Quantity fill | `TX287474` | `TX287474YAA` | 3 | 31,970 | 14 | 18 | 1 |
| 19 | Quantity fill | `MS283416` | `MS283416AAA` | 3 | 27,938 | 15 | 19 | 1 |
| 20 | Quantity fill | `N508P383787` | `N508P383787A` | 3 | 25,832 | 18 | 20 | 1 |

### 5月 — 20 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N515P401190` | `N515P401190B` | 8 | 140,040 | 1 | 2 | 1 |
| 2 | Revenue | `N508P397567` | `N508P397567A` | 8 | 105,684 | 2 | 3 | 1 |
| 3 | Revenue | `N509P332040` | `N509P332040D` | 3 | 73,942 | 3 | 17 | 1 |
| 4 | Revenue | `N509P350413` | `N509P350413B` | 4 | 71,111 | 4 | 10 | 1 |
| 5 | Revenue | `N506P333838` | `N506P333838A` | 5 | 70,910 | 5 | 6 | 1 |
| 6 | Revenue | `N506P339216` | `N506P339216B` | 4 | 66,233 | 6 | 11 | 1 |
| 7 | Revenue | `N509P270781` | `N509P270781A` | 3 | 66,179 | 7 | 18 | 1 |
| 8 | Revenue | `N509P379986` | `N509P379986A` | 5 | 66,066 | 8 | 7 | 1 |
| 9 | Revenue | `N509P209661` | `N509P209661A` | 4 | 65,360 | 9 | 12 | 1 |
| 10 | Revenue | `WF320579` | `WF320579WAA` | 8 | 63,687 | 10 | 4 | 1 |
| 11 | Quantity fill | `N509P326448` | `N509P326448A` | 9 | 26,655 | 16 | 1 | 1 |
| 12 | Quantity fill | `N510P343720` | `N510P343720L` | 6 | 28,742 | 15 | 5 | 1 |
| 13 | Quantity fill | `WF306752` | `WF306752TAA` | 5 | 33,533 | 14 | 8 | 1 |
| 14 | Quantity fill | `N510P371980` | `N510P371980P` | 5 | 24,448 | 18 | 9 | 1 |
| 15 | Quantity fill | `N508P308768` | `N508P308768A` | 4 | 52,215 | 11 | 13 | 1 |
| 16 | Quantity fill | `WF295683` | `WF295683AAA` | 4 | 18,528 | 19 | 14 | 1 |
| 17 | Quantity fill | `N510P254503` | `N510P254503O` | 4 | 17,083 | 21 | 15 | 1 |
| 18 | Quantity fill | `N510P263860` | `N510P263860P` | 4 | 8,204 | 26 | 16 | 1 |
| 19 | Quantity fill | `N506P360600` | `N506P360600A` | 3 | 43,702 | 12 | 19 | 1 |
| 20 | Quantity fill | `N504P384911` | `N504P384911A` | 3 | 43,061 | 13 | 20 | 1 |

### 6月 — 17 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N509P176640` | `N509P176640K` | 4 | 92,645 | 1 | 2 | 2 |
| 2 | Revenue | `WF324486` | `WF324486BAA` | 4 | 69,757 | 2 | 3 | 1 |
| 3 | Revenue | `N515P401190` | `N515P401190B` | 4 | 69,729 | 3 | 4 | 1 |
| 4 | Revenue | `WF295683` | `WF295683DAA` | 10 | 47,458 | 4 | 1 | 1 |
| 5 | Revenue | `TX287474` | `TX287474YAA` | 4 | 40,083 | 5 | 5 | 1 |
| 6 | Revenue | `N509P373002` | `N509P373002A` | 4 | 33,271 | 6 | 6 | 1 |
| 7 | Revenue | `WF320579` | `WF320579WAA` | 4 | 31,791 | 7 | 7 | 1 |
| 8 | Revenue | `WF292338` | `WF292338AAA` | 3 | 31,453 | 8 | 10 | 1 |
| 9 | Revenue | `TX295751` | `TX295751AAA` | 3 | 30,300 | 9 | 11 | 2 |
| 10 | Revenue | `N509P360123` | `N509P360123A` | 3 | 27,654 | 10 | 12 | 1 |
| 11 | Quantity fill | `N510P254505` | `N510P254505D` | 4 | 21,938 | 11 | 8 | 1 |
| 12 | Quantity fill | `N510P469767` | `N510P469767Z` | 4 | 21,553 | 12 | 9 | 1 |
| 13 | Quantity fill | `N512P403841` | `N512P403841F` | 3 | 21,170 | 13 | 13 | 1 |
| 14 | Quantity fill | `N512P403839` | `N512P403839C` | 3 | 20,804 | 14 | 14 | 1 |
| 15 | Quantity fill | `N508P383786` | `N508P383786B` | 3 | 20,342 | 15 | 15 | 1 |
| 16 | Quantity fill | `PP316713` | `PP316713BAA` | 3 | 19,288 | 16 | 16 | 2 |
| 17 | Quantity fill | `N510P371980` | `N510P371980B` | 3 | 11,359 | 17 | 17 | 1 |

### 7月 — 20 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N506P503228D` | `N506P503228D` | 9 | 150,722 | 1 | 2 | 1 |
| 2 | Revenue | `WF315212` | `WF315212AAA` | 7 | 134,656 | 2 | 3 | 3 |
| 3 | Revenue | `N515P401190` | `N515P401190W` | 5 | 83,611 | 3 | 7 | 1 |
| 4 | Revenue | `MX292711` | `MX292711GAA` | 4 | 79,593 | 4 | 8 | 2 |
| 5 | Revenue | `N504P398915` | `N504P398915B` | 6 | 78,096 | 5 | 4 | 1 |
| 6 | Revenue | `N504P384907` | `N504P384907A` | 6 | 51,696 | 6 | 5 | 1 |
| 7 | Revenue | `N504P384909` | `N504P384909A` | 4 | 48,313 | 7 | 9 | 1 |
| 8 | Revenue | `N510P343720` | `N510P343720N` | 10 | 47,145 | 8 | 1 | 1 |
| 9 | Revenue | `N504P384911` | `N504P384911A` | 3 | 46,552 | 9 | 12 | 1 |
| 10 | Revenue | `N512P475772` | `N512P475772B` | 3 | 41,443 | 10 | 13 | 1 |
| 11 | Quantity fill | `N509P446031` | `N509P446031A` | 6 | 22,452 | 16 | 6 | 1 |
| 12 | Quantity fill | `N510P293821` | `N510P293821P` | 4 | 23,436 | 15 | 10 | 1 |
| 13 | Quantity fill | `N510P293820` | `N510P293820W` | 4 | 19,825 | 18 | 11 | 1 |
| 14 | Quantity fill | `MS306394` | `MS306394AAA` | 3 | 32,400 | 11 | 14 | 1 |
| 15 | Quantity fill | `N508P16786` | `N508P167865` | 3 | 28,600 | 12 | 15 | 2 |
| 16 | Quantity fill | `TX287473` | `TX287473BAA` | 3 | 26,770 | 13 | 16 | 2 |
| 17 | Quantity fill | `WF320579` | `WF320579WAA` | 3 | 25,450 | 14 | 17 | 1 |
| 18 | Quantity fill | `N506P270388` | `N506P270388E` | 3 | 21,487 | 17 | 18 | 1 |
| 19 | Quantity fill | `PP315895` | `PP315895PAA` | 3 | 17,812 | 19 | 19 | 2 |
| 20 | Quantity fill | `N510P343719` | `N510P343719L` | 3 | 15,975 | 20 | 20 | 1 |

### 8月 — 15 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `WF326429` | `WF326429BAA` | 3 | 99,791 | 1 | 9 | 2 |
| 2 | Revenue | `WF315212` | `WF315212BAA` | 4 | 76,787 | 2 | 5 | 1 |
| 3 | Revenue | `N508P397567` | `N508P397567A` | 6 | 75,443 | 3 | 1 | 1 |
| 4 | Revenue | `WF296359` | `WF296359BAA` | 5 | 63,851 | 4 | 4 | 1 |
| 5 | Revenue | `WF295662` | `WF295662DAA` | 6 | 58,980 | 5 | 2 | 1 |
| 6 | Revenue | `WF195239` | `WF195239FAA` | 3 | 57,294 | 6 | 10 | 1 |
| 7 | Revenue | `N506P503228C` | `N506P503228C` | 3 | 51,578 | 7 | 11 | 1 |
| 8 | Revenue | `N508P308768` | `N508P308768G` | 4 | 50,820 | 8 | 6 | 1 |
| 9 | Revenue | `N504P398915` | `N504P398915C` | 3 | 41,362 | 9 | 12 | 1 |
| 10 | Revenue | `N510P465593` | `N510P465593L` | 6 | 40,194 | 10 | 3 | 1 |
| 11 | Quantity fill | `N509P472253` | `N509P472253A` | 4 | 32,379 | 12 | 7 | 1 |
| 12 | Quantity fill | `WF295683` | `WF295683FAA` | 4 | 19,320 | 13 | 8 | 1 |
| 13 | Quantity fill | `N515P252375` | `N515P252375B` | 3 | 35,904 | 11 | 13 | 2 |
| 14 | Quantity fill | `N510P419601` | `N510P419601P` | 3 | 15,605 | 14 | 14 | 1 |
| 15 | Quantity fill | `N504P312648` | `N504P312648A` | 3 | 12,384 | 15 | 15 | 1 |

### 9月 — 20 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `ES324482` | `ES324482AAA` | 7 | 133,210 | 1 | 2 | 1 |
| 2 | Revenue | `WF303355` | `WF303355AAA` | 5 | 97,760 | 2 | 4 | 1 |
| 3 | Revenue | `N504P384907` | `N504P384907A` | 7 | 67,698 | 3 | 3 | 1 |
| 4 | Revenue | `WF195239` | `WF195239GAA` | 3 | 56,138 | 4 | 13 | 1 |
| 5 | Revenue | `N506P408474` | `N506P408474C` | 4 | 55,697 | 5 | 6 | 1 |
| 6 | Revenue | `WF324486` | `WF324486BAA` | 3 | 51,040 | 6 | 14 | 1 |
| 7 | Revenue | `N508P397567` | `N508P397567A` | 4 | 48,972 | 7 | 7 | 1 |
| 8 | Revenue | `N510P299560` | `N510P299560C` | 4 | 36,731 | 8 | 8 | 2 |
| 9 | Revenue | `N504P384909` | `N504P384909A` | 3 | 36,702 | 9 | 15 | 1 |
| 10 | Revenue | `N508P320628` | `N508P320628D` | 4 | 35,770 | 10 | 9 | 1 |
| 11 | Quantity fill | `N510P371976` | `N510P371976B` | 9 | 34,201 | 12 | 1 | 1 |
| 12 | Quantity fill | `HOKKAIDO0611426` | `HOKKAIDO0611426` | 5 | 5,000 | 32 | 5 | 1 |
| 13 | Quantity fill | `WF292337` | `WF292337BAA` | 4 | 24,560 | 20 | 10 | 1 |
| 14 | Quantity fill | `WF294081` | `WF294081AAA` | 4 | 23,308 | 24 | 11 | 2 |
| 15 | Quantity fill | `PP309928` | `PP309928GAA` | 4 | 20,502 | 26 | 12 | 2 |
| 16 | Quantity fill | `PH313803CAA` | `PH313803CAA` | 3 | 34,290 | 11 | 16 | 1 |
| 17 | Quantity fill | `N515P537393W` | `N515P537393W` | 3 | 33,774 | 13 | 17 | 1 |
| 18 | Quantity fill | `N508P291699` | `N508P291699K` | 3 | 31,530 | 14 | 18 | 1 |
| 19 | Quantity fill | `WF316026` | `WF316026AAA` | 3 | 31,430 | 15 | 19 | 3 |
| 20 | Quantity fill | `W1082P373` | `W1082P373514` | 3 | 31,321 | 16 | 20 | 1 |

### 10月 — 20 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N510P371976` | `N510P371976B` | 31 | 119,498 | 1 | 1 | 1 |
| 2 | Revenue | `N515P401190` | `N515P401190B` | 6 | 105,492 | 2 | 2 | 1 |
| 3 | Revenue | `N509SA304384` | `N509SA304384A` | 3 | 86,172 | 3 | 16 | 2 |
| 4 | Revenue | `N506P359769` | `N506P359769C` | 3 | 81,668 | 4 | 17 | 2 |
| 5 | Revenue | `N506P339216` | `N506P339216D` | 5 | 78,580 | 5 | 4 | 1 |
| 6 | Revenue | `N515S537400B` | `N515S537400B` | 3 | 78,382 | 6 | 18 | 1 |
| 7 | Revenue | `WF195238` | `WF195238GAA` | 4 | 62,806 | 7 | 7 | 2 |
| 8 | Revenue | `N504P398914` | `N504P398914C` | 4 | 57,245 | 8 | 8 | 1 |
| 9 | Revenue | `TX289429` | `TX289429BAA` | 5 | 53,355 | 9 | 5 | 2 |
| 10 | Revenue | `N508P320628` | `N508P320628D` | 6 | 48,596 | 10 | 3 | 2 |
| 11 | Quantity fill | `N510P293821` | `N510P293821P` | 5 | 21,277 | 26 | 6 | 1 |
| 12 | Quantity fill | `N515P416432` | `N515P416432C` | 4 | 42,560 | 12 | 9 | 1 |
| 13 | Quantity fill | `TX295749` | `TX295749CAA` | 4 | 32,756 | 17 | 10 | 1 |
| 14 | Quantity fill | `N511P412962` | `N511P412962N` | 4 | 28,223 | 19 | 11 | 1 |
| 15 | Quantity fill | `WF295660` | `WF295660EAA` | 4 | 26,226 | 21 | 12 | 2 |
| 16 | Quantity fill | `SETN506P2954` | `SETN506P295412B` | 4 | 23,122 | 23 | 13 | 2 |
| 17 | Quantity fill | `W6360P546830` | `W6360P546830` | 4 | 22,400 | 24 | 14 | 1 |
| 18 | Quantity fill | `N504P415034` | `N504P415034T` | 4 | 19,892 | 28 | 15 | 1 |
| 19 | Quantity fill | `N506P408474` | `N506P408474C` | 3 | 44,096 | 11 | 19 | 1 |
| 20 | Quantity fill | `N504P398915` | `N504P398915Z` | 3 | 40,558 | 13 | 20 | 1 |

### 11月 — 15 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `WF326433` | `WF326433AAA` | 3 | 111,577 | 1 | 7 | 1 |
| 2 | Revenue | `N512P360687` | `N512P360687W` | 4 | 98,765 | 2 | 4 | 1 |
| 3 | Revenue | `ES324482` | `ES324482AAA` | 5 | 93,315 | 3 | 1 | 1 |
| 4 | Revenue | `WF310742` | `WF310742AAA` | 3 | 79,446 | 4 | 8 | 1 |
| 5 | Revenue | `N506P339216` | `N506P339216B` | 4 | 69,060 | 5 | 5 | 1 |
| 6 | Revenue | `N512P295132` | `N512P295132W` | 5 | 61,883 | 6 | 2 | 1 |
| 7 | Revenue | `N511P336633` | `N511P336633W` | 5 | 45,640 | 7 | 3 | 1 |
| 8 | Revenue | `N512P313079` | `N512P313079W` | 3 | 38,991 | 8 | 9 | 1 |
| 9 | Revenue | `N512P295132B` | `N512P295132B` | 4 | 38,820 | 9 | 6 | 1 |
| 10 | Revenue | `N515P196885` | `N515P196885W` | 3 | 36,341 | 10 | 10 | 1 |
| 11 | Quantity fill | `PP293333` | `PP293333CAA` | 3 | 27,880 | 11 | 11 | 2 |
| 12 | Quantity fill | `MX317937` | `MX317937AAA` | 3 | 25,550 | 12 | 12 | 1 |
| 13 | Quantity fill | `TH197100` | `TH197100AAA` | 3 | 23,780 | 13 | 13 | 1 |
| 14 | Quantity fill | `N512P232188` | `N512P232188G` | 3 | 10,610 | 14 | 14 | 1 |
| 15 | Quantity fill | `N511P221569` | `N511P221569W` | 3 | 9,120 | 15 | 15 | 1 |

### 12月 — 20 candidates

| Slot | Basis | SPU1 | item_code | Units | Gross revenue ¥ | Revenue rank | Unit rank | Years |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | Revenue | `N512P360687` | `N512P360687W` | 7 | 175,270 | 1 | 3 | 1 |
| 2 | Revenue | `WF319897` | `WF319897CAA` | 3 | 136,912 | 2 | 21 | 2 |
| 3 | Revenue | `WF326429` | `WF326429AAA` | 4 | 131,180 | 3 | 11 | 1 |
| 4 | Revenue | `WF326433` | `WF326433BAA` | 4 | 130,866 | 4 | 12 | 2 |
| 5 | Revenue | `N508P194679` | `N508P194679A` | 7 | 125,457 | 5 | 4 | 2 |
| 6 | Revenue | `N515P196885` | `N515P196885W` | 8 | 98,782 | 6 | 2 | 1 |
| 7 | Revenue | `WF309175` | `WF309175BAA` | 4 | 69,754 | 7 | 13 | 1 |
| 8 | Revenue | `N511P329013` | `N511P329013N` | 6 | 68,484 | 8 | 6 | 1 |
| 9 | Revenue | `N509P176640` | `N509P176640K` | 3 | 62,996 | 9 | 22 | 2 |
| 10 | Revenue | `N509P209661` | `N509P209661A` | 5 | 61,549 | 10 | 8 | 1 |
| 11 | Quantity fill | `N510P254487O` | `N510P254487O` | 13 | 59,090 | 11 | 1 | 1 |
| 12 | Quantity fill | `N512P232188` | `N512P232188G` | 7 | 18,383 | 31 | 5 | 1 |
| 13 | Quantity fill | `N512P337889` | `N512P337889A` | 6 | 49,672 | 13 | 7 | 1 |
| 14 | Quantity fill | `W1082P234463` | `W1082P234463` | 5 | 32,770 | 19 | 9 | 1 |
| 15 | Quantity fill | `N509P210958A` | `N509P210958A` | 5 | 24,225 | 25 | 10 | 1 |
| 16 | Quantity fill | `WF296995` | `WF296995AAA` | 4 | 45,840 | 14 | 14 | 1 |
| 17 | Quantity fill | `SETN506P29541` | `SETN506P295412BB` | 4 | 41,768 | 15 | 15 | 1 |
| 18 | Quantity fill | `TX289429` | `TX289429BAA` | 4 | 40,003 | 16 | 16 | 2 |
| 19 | Quantity fill | `MS322500` | `MS322500AAA` | 4 | 25,466 | 24 | 17 | 1 |
| 20 | Quantity fill | `N515P252389` | `N515P252389W` | 4 | 23,720 | 26 | 18 | 1 |

## Limitations

- Three units is a pragmatic minimum, not statistical significance. One-year month sales cannot establish recurring seasonality.
- All-store demand is a discovery pool, not a substitute for a specific shop's live catalog or a company revenue statement.
- Do not schedule newsletters or promotions without verifying actual shop listings, inventory and margin.
