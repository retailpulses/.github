# Social insurance — canonical payroll and statutory premium policy

## Canonical social insurance and labor insurance calculation (FY2026; 2026-11-19)

**Scope:** リテルパルス合同会社, Tokyo 協会けんぽ, general business. This is the rate-based reconstruction rule for payroll register, payslips, employee/employer split and freee journals; do not simply copy old Grid CSV or payslip values. Confirm actual insurer, coverage, ages, standard remuneration, notices and enrollment status before final booking.

### Rates and effective dates (insurance month unless specified)

| Insurance month | Tokyo health insurance total | Nursing-care insurance total (age 40–64 only) | Pension total | Child-rearing support contribution total | Employer-only child-rearing contribution |
|---|---:|---:|---:|---:|---:|
| 2025-10 through 2026-02 | 9.91% | 1.59% | 18.30% | 0% | 0.36% |
| 2026-03 | 9.85% | 1.62% | 18.30% | 0% | 0.36% |
| 2026-04 through 2026-09 | 9.85% | 1.62% | 18.30% | 0.23% | 0.36% |

Health, nursing care (if eligible), pension and 0.23% support levy are split employer/insured 50:50, with official premium-table yen rounding. The **0.36% 子ども・子育て拠出金 is employer-only**, and is **different from** the new 0.23% 子ども・子育て支援金. Standard monthly remuneration, not take-home pay or necessarily gross salary, is the base. Premiums usually billed the following month; the period-of-insurance month controls the rate. Nursing care requires age 40–64 status; do not assume it from a payslip. Follow official individual premium tables and rounding, not naïve floating-point arithmetic.

**Employment insurance (general business; based on payroll payment date):** 2025-10-01–2026-03-31 employee 0.55%, employer 0.90% (total 1.45%); 2026-04-01–2026-09-30 employee 0.50%, employer 0.85% (total 1.35%). Compute on applicable wages, not standard monthly remuneration. The representative is not enrolled in employment insurance (employee master `False`), so 0% for representative. Employee master marks the employee enrolled (`True`); verify against enrollment evidence. Workers' compensation insurance is separate, employer-only, rate depends on registered industry; do not substitute employment-insurance rates.

### Reconstruction and source-of-truth precedence
1. Create monthly person-level payroll register with gross remuneration, insurance-period month, effective standard remuneration and eligibility, health, nursing-care, pension, child support, employment insurance, withholding tax, resident tax, computed net, actual payment and reconciliation delta. Known fixed gross: representative ¥400,000 monthly, employee ¥220,000 monthly from 2026-02. Existing employee master lists standard remuneration representative ¥410,000, employee ¥220,000, **but validate against formal 標準報酬月額 notices**.
2. Independently calculate each individual insurance component using official effective-period rate table, age/coverage and yen rounding. For social insurance, reconcile **monthly insurer billed total = all employee shares + all employer shares + employer-only 0.36% levy + notices/rounding/adjustments**. Do not confuse social insurance premium with employment/labor insurance annual declaration.
3. Use official 納入告知書／保険料額表 and coverage notices as authoritative for billed premiums and eligibility; bank/cash evidence as authoritative for payment; payroll Grid and DOCX as **derived, potentially inconsistent** sources. Preserve discrepancies and resolve them by independent calculation; do not silently prefer either.
4. Journal: gross wages/役員報酬 recognized once; employee withheld insurance to 預り金, employer shares and employer-only levies to 法定福利費; payment of combined insurer bill clears 預り金 and liability, using 普通預金 for corporate payments and 役員借入金 for representative personal payments. All FY2026 wages and insurance payments are management-confirmed paid; never automatically label them unpaid. Timing differences may still create normal accrual at fiscal year-end, based on insurance month and actual settlement.
5. Reconstruct missing 2026-06–09 director and 2026-07–09 employee payslips/payroll register from confirmed salary, insurance tables, source withholding data and actual bank payments; flag estimated source tax/rounding rather than invent final values. Resolve actual-net versus computed-net differences in a separate payroll adjustment ledger.
6. For FY2026 all these salary and statutory social insurance postings are generally outside consumption tax scope (対象外／不課税); do not apply 10% input credit to statutory premiums or salary.

**Observed inconsistencies requiring recomputation:** April 2026 representative Grid health ¥23,513 vs individual DOCX ¥20,428; April employee Grid ¥12,870 vs DOCX ¥10,835; May employee Grid ¥12,870 vs DOCX ¥11,088. Do not attribute these health-insurance differences to employment insurance: they are distinct columns. Standard remuneration ¥410,000 and ¥220,000 yield indicative non-nursing health shares ¥20,315.75 and ¥10,835 respectively at 9.85% / 2 before official rounding; both persons' nursing-care insurance participation is management-confirmed; the old payslip discrepancies must be recalculated including nursing-care contributions. May 2026 0.23% support levy, if applicable, adds ¥471.50 / ¥253.00 employee-side respectively, separately from health. These are calculated candidates, **not verified payroll deductions**.

**Official references:**
- Tokyo FY2025 rates: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/rate_prefectures/r07/
- Tokyo FY2026 rates and effective months: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/rate_prefectures/r08/
- Tokyo official FY2026 yen table: https://www.kyoukaikenpo.or.jp/assets/R8_13tokyo.pdf
- New support levy: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/003/index.html
- Pension and employer-only levy: https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20121017.files/santei.guide.book.pdf
- Employment insurance FY2025/2026: https://jsite.mhlw.go.jp/kanagawa-roudoukyoku/hourei_seido_tetsuzuki/roudou_hoken/hourei_seido/2024_00008.html
- Rounding: https://www.nenkin.go.jp/service/kounen/hokenryo/nofu/20121026.html

**FY2026 evidence:** Google Drive FY2026 Payroll folder `1zl-Bja2G5wXBF7ZSr1mdhq6h_0Rhtltt`, Social Insurance folder `1Fi3Frx2efvds-SdTQpuDnEUZ2WPdbAPu`. Keep individual employee evidence in restricted Drive, not GitHub.

## FY2026 bank-reconciled social insurance schedule

Both insured persons **have 介護保険** (confirmed by management). Representative is not covered by employment insurance; employee is. Standard monthly remuneration: representative ¥410,000 throughout FY2026, employee ¥220,000 from 2026-02. Social-insurance month is not bank payment month.

| Insurance month | Employee/personal share | Employer share (including 0.36% levy) | Total | Corporate bank evidence |
|---|---:|---:|---:|---|
| 2025-10 | 61,090 | 62,566 | 123,656 | Paid personally, management-confirmed; source amount inferred |
| 2025-11 | 61,090 | 62,566 | 123,656 | Paid personally, management-confirmed; source amount inferred |
| 2025-12 | 61,090 | 62,566 | 123,656 | Paid personally, management-confirmed; source amount inferred |
| 2026-01 | 61,090 | 62,566 | 123,656 | 2026-02-26 ¥123,656 |
| 2026-02 | 93,870 | 96,138 | 190,008 | 2026-03-26 ¥190,008 |
| 2026-03 | 93,776 | 96,043 | 189,819 | 2026-04-29 ¥189,819; ¥1 rounding split provisional |
| 2026-04 | 94,500 | 96,768 | 191,268 | 2026-05-27 ¥191,268 |
| 2026-05 | 94,500 | 96,768 | 191,268 | 2026-06-24 ¥191,268 |
| 2026-06 | 94,500 | 96,768 | 191,268 | 2026-07-24 ¥191,268 |
| 2026-07 | 94,500 | 96,768 | 191,268 | 2026-08-26 ¥191,268 |
| 2026-08 | 94,500 | 96,768 | 191,268 | 2026-09-24 ¥191,268 |
| 2026-09 | 94,500 | 96,768 | 191,268 | 2026-10 payment outside FY2026 bank statement |
| **FY2026** | **999,006** | **1,023,053** | **2,022,059** | **2026-01–08 bank debits match ¥1,459,823** |

Amounts for 2025-10–12 and 2026-09 are rate-based, not bank-verified; the FY2026 schedule is an accounting reconstruction, not a declaration that every month's payment slip was inspected. Individual rounding and pay-slip withholding need later payroll reconstruction; do not block FY2026 closing on cosmetic payroll slip completion. **Accounting must still book the correct aggregate statutory employer expense and settlement in FY2026.** The 2026-09 insurance-month liability may remain at 2026-09-30 until October payment; this is ordinary accrual, not an assertion that management failed to pay it.

## Deferred payroll repair (after accounting close)

Regenerate person-month wage ledgers and payslips from statutory insurance schedule, official monthly premium tables, applicable employment insurance rates, withholding tax tables, and bank/cash payroll settlement. Compare the old `export - 給与明細 - Grid.csv` with each DOCX/PDF; flag health vs nursing-care vs support levy separately; compute actual-minus-net adjustments and produce corrected source-tax ledger. Preserve originals and derived files separately in restricted Drive. This task is tracked in [FY2026 post-close payroll repair Issue #491](https://github.com/retailpulses/inbox/issues/491) and must not alter FY2026 recognized salary or statutory employer costs without a documented correction entry.
