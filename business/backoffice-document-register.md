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
- Fiscal year: 2025-10 through 2026-09. Confirmed gross compensation: representative ¥400,000/month throughout FY2026; employee ¥220,000/month from 2026-02 (not the obsolete ¥180,000 planning figure). Google Drive `01_Payroll Records/export - 給与明細 - Grid.csv` and monthly payslips are supporting evidence. Both persons have 源泉所得税 withholding; 住民税 deduction is ¥0. Reconcile exact monthly payroll withholding and the difference, where any, between `差引支給額 (Net)` and `実支給額 (Payout)` before final posting; do not treat rounding/settlement differences as tax without evidence.
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

Social insurance policy moved to [`social insurance.md`](./social%20insurance.md).
