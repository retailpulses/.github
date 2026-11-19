# Backoffice document register and monthly retention standard

Status: Draft canonical checklist | Owner: リテルパルス合同会社 backoffice | Updated: 2026-11-18

## Scope and rules
This register covers company-wide personnel, payroll, withholding tax, social insurance, corporate administration and non-commerce accounting evidence. Commerce transaction source data remains under its existing canonical operating/accounting policies. This is a **required-document checklist**, not a claim that historical documents exist or were filed.

- Organize by **calendar month (YYYY-MM)** and person where relevant; also index by fiscal year. Preserve original PDFs/CSVs and submission/receipt evidence. Never recreate a historical filing as if it had been submitted.
- Google Drive is the evidence archive; GitHub holds this policy/checklist and issues, not personal payroll files. Restrict access to sensitive employee and tax records.
- For each item record: period, employee/entity, document type, source, Drive URL, filing/payment date, status (available / not applicable / missing / needs verification), reviewer, and notes. Keep an immutable original and distinguish derived working papers.
- Personal-bank-paid business expenses or payroll must have a business-only supporting voucher and director/employee reimbursement or payable entry; no need to archive unrelated personal banking transactions.
- Retention: apply the **longest applicable statutory retention period** across tax, labor, social insurance and corporate law; do not assume a universal period. Set a formal disposal schedule separately.

## Monthly document list (repeat for each YYYY-MM)

| Category | Japanese document / evidence | Source / owner | Frequency / condition |
|---|---|---|---|
| Payroll | 賃金台帳 (individual gross pay, deductions, net, hours/days as applicable) | Internal payroll register | Every payroll month, each employee |
| Payroll | 給与明細・役員報酬明細 and approved compensation basis | Internal | Each payment; director compensation resolution on change |
| Tax | 給与所得に対する源泉徴収簿 (per person, per calendar year, monthly entries) | Internal / payroll software | Update monthly, finalize at year-end |
| Tax | 給与所得・退職所得等の所得税徴収高計算書 (submitted copy), e-Tax receipt or paid 納付書 | e-Tax / tax filing archive | For applicable filing/payment period; semiannual if 納期の特例 applies |
| Tax | 源泉所得税計算・納付照合表 | Internal plus bank receipt | Monthly accrual/reconciliation; actual payment per filing schedule |
| Attendance | 出勤簿 / タイムカード / work-hour and attendance-day records | Internal HR | Employees as applicable; may be integrated into 賃金台帳 if all required fields present |
| Social insurance | 健康保険・厚生年金保険料納入告知書, 領収済額通知書, payment evidence | 日本年金機構 / bank | Monthly; reconcile employee + employer shares |
| Social insurance | 標準報酬月額・被保険者 roster and payroll deductions reconciliation | Internal + pension notices | Monthly control; formal notices upon change |
| Employment | 雇用契約書 / 労働条件通知書, hire/leave and enrollment filings | Internal + filing acknowledgments | Event-driven; index in event month |
| Labor insurance | 雇用保険 premiums / worker deductions and related filings | Internal + ハローワーク | Monthly reconciliation if applicable; annual declaration separately |
| Office | 賃貸借契約書, 家賃請求書・領収書, utility / communication invoices | Landlord / vendors | Invoice and payment evidence each month |
| General expenses | Supplier invoices, receipts, corporate-card statements, expense claims | Vendors / internal | Monthly, non-commerce expenses only |
| Bank | Company bank statement, reconciliation and cash ledger | Bank / internal | Monthly; personal payments recorded via business-only evidence |
| Accounting | Non-commerce 仕訳 CSV, import report, journal, GL reconciliation | Internal / freee | Monthly; link to original evidence |
| Revenue | Consulting / operations contracts, invoices, collection proof, FX calculation | Client / bank / internal | When applicable; personal receipt on behalf of company separately documented |
| Governance | Resolutions, corporate registry changes, capital transfers, filing receipts | Internal / 法務局 / bank | Event-driven, linked to month |

## Calendar-month index / filing cadence

| Month | Regular work and additional evidence |
|---|---|
| January | Monthly register; statutory payroll reports (給与支払報告書), 法定調書 / 支払調書 as applicable, 源泉所得税 second-half payment if 納期の特例 |
| February | Monthly register; check annual payroll/tax filing acknowledgments |
| March | Monthly register; payroll and personnel changes |
| April | Monthly register; annual employment/compensation changes, if any |
| May | Monthly register; confirm annual labor insurance preparations |
| June | Monthly register; 労働保険年度更新 declaration/payment as applicable; 算定基礎届 preparation |
| July | Monthly register; 算定基礎届 submission/receipt; first-half 源泉所得税 payment if 納期の特例; labor insurance renewal deadline per official notice |
| August | Monthly register; verify pension calculation result and pending changes |
| September | Monthly register; new 標準報酬月額 effective from September where applicable; fiscal-year close if September year-end |
| October | Monthly register; annual financial close, tax return and payment workflow per actual fiscal year |
| November | Monthly register; 年末調整 preparations and dependent declarations; reconcile pension-office inspection materials |
| December | Monthly register; 年末調整 calculations, withholding certificates (源泉徴収票), annual payroll reconciliation |

Deadlines vary with weekends, company fiscal year, filing elections, and specific notices; verify official deadlines before execution. For a September fiscal year-end, corporate tax and local tax generally fall due two months after year-end unless an extension applies.

## Pension-office inspection package (葛飾年金事務所, request observed 2026-11-18)
The photographed **郵送書類チェックリスト** asks for copies covering **2024-11 through the present**, not FY2026 alone:
1. 報酬・雇用に関する調査票 — complete the agency's form.
2. 給与所得・退職所得等の所得税徴収高計算書（写） — **actual submitted/paid** filings; obtain from e-Tax records or retained 納付書.
3. 給与所得に対する源泉徴収簿 — internally maintained person-year withholding ledger.
4. 賃金台帳 — person-level payroll ledger; preferably annual or fiscal-year per person.
5. 出勤簿（またはタイムカード） — unnecessary as separate copy only if 賃金台帳 already prints each month's work hours and attendance days, per checklist.

The photographed checklist does **not** show the actual deadline or full investigation notice. Confirm from the enclosed letter; do not invent one. Preserve the envelope and agency correspondence. Identify historical gaps by month, without treating missing documents as proof of noncompliance.

## FY2026-specific cross-references
- Fiscal year: 2025-10 through 2026-09. Representative compensation reference ¥400,000/month; employee compensation reference ¥180,000/month starting 2026-02. These are planning inputs, **not verified actual payroll**.
- Social-insurance payments were made partly from company and partly from personal accounts; reconcile both and avoid double posting. 
- Capital increase to ¥30,000,000 before 2026-09-30: retain contribution transfers, capital-resolution documents, registry application, updated 登記事項証明書 and registration-tax evidence. February five director deposits totaling ¥25,001,100 require matching to the legal transaction, not automatic income recognition.
- Consulting fees contracted by company but received into personal account: retain contracts, invoice, remittance and director payable/receivable settlement evidence; assess tax treatment separately.
- Canonical accounting workflow: source evidence → monthly non-commerce draft 仕訳 CSV → review → freee import → reconciliation; preserve import results.
- Do not mix Shop3 sales into company revenue; follow the existing accounting scope policy for commerce activities.

## Open verification register
- Actual 2024-11 onward payroll/withholding filing completeness: **unverified**.
- Whether 源泉所得税の納期の特例 was approved: **unverified**.
- Actual pension-office inspection deadline and scope: **not visible in photographed checklist**.
- Per-month source evidence availability and legal retention settings: **unverified**.

## Monthly close acceptance criteria
All applicable rows have evidence links or explicit missing/N/A status; payroll gross-to-net reconciles; withheld tax and insurance reconcile to filings and payments; company vs personal payments are distinguished; journal imports reconcile; reviewer/date recorded. Never mark a missing filing as complete solely because a reconstructed worksheet exists.

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

**Observed inconsistencies requiring recomputation:** April 2026 representative Grid health ¥23,513 vs individual DOCX ¥20,428; April employee Grid ¥12,870 vs DOCX ¥10,835; May employee Grid ¥12,870 vs DOCX ¥11,088. Do not attribute these health-insurance differences to employment insurance: they are distinct columns. Standard remuneration ¥410,000 and ¥220,000 yield indicative non-nursing health shares ¥20,315.75 and ¥10,835 respectively at 9.85% / 2 before official rounding; nursing-care applicability or different remuneration/coverage must be independently verified. May 2026 0.23% support levy, if applicable, adds ¥471.50 / ¥253.00 employee-side respectively, separately from health. These are calculated candidates, **not verified payroll deductions**.

**Official references:**
- Tokyo FY2025 rates: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/rate_prefectures/r07/
- Tokyo FY2026 rates and effective months: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/rate_prefectures/r08/
- Tokyo official FY2026 yen table: https://www.kyoukaikenpo.or.jp/assets/R8_13tokyo.pdf
- New support levy: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/003/index.html
- Pension and employer-only levy: https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20121017.files/santei.guide.book.pdf
- Employment insurance FY2025/2026: https://jsite.mhlw.go.jp/kanagawa-roudoukyoku/hourei_seido_tetsuzuki/roudou_hoken/hourei_seido/2024_00008.html
- Rounding: https://www.nenkin.go.jp/service/kounen/hokenryo/nofu/20121026.html

**FY2026 evidence:** Google Drive FY2026 Payroll folder `1zl-Bja2G5wXBF7ZSr1mdhq6h_0Rhtltt`, Social Insurance folder `1Fi3Frx2efvds-SdTQpuDnEUZ2WPdbAPu`. Keep individual employee evidence in restricted Drive, not GitHub.
