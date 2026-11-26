# Assembly Copy Policy & Decision Log

**Scope**: Mercari Shops assembly / completed-product claims
**Issue**: [#524](https://github.com/retailpulses/inbox/issues/524)
**Authority**: this file (`retailpulses/.github/business/assembly.md`); moved from `retailpulses/inbox/.github/business/assembly.md` on 2026-11-26. No rule change in the move.
**Last updated**: 2026-11-24

## 1. Purpose

Customer-facing copy must not promise “no assembly / 完成品” unless the supplier manual or supplier evidence confirms it. When assembly is confirmed, the copy must say so in plain language, with an effort grade only when the manual supports the time, people, or tools.

## 2. Evidence hierarchy

```text
1. Supplier manual / assembly instruction in GigaB2B fileUrls (PDF/JPG)
2. Explicit supplier text: characteristics / description
3. Customer-supplied manual (SKU-specific, note as customer-reported)
4. Packaging geometry / product type — triage only, never sole proof
5. Marketplace keywords — triage only, never proof
```

Absence of an assembly statement is **not** proof of “完成品”. It is `UNVERIFIED`.

### 2.1 Claim rules (enriched 2026-11-25)

1. **Suitcases / carry-on luggage** (`スーツケース`, `キャリーケース`, `キャリーバッグ`): assembly is not required by product type. A no-assembly claim is allowed without a manual.
2. **Original supplier title explicitly says no assembly** (`組立不要`, `組み立て不要`, `組立て不要`, `完成品`): trust the title; no manual required.
3. **Otherwise**: a no-assembly claim requires a PDF/JPG manual that confirms it.
4. **No manual and no explicit no-assembly title**: the no-assembly claim is **forbidden**. Remove it. Do not replace it with “needs assembly” unless a manual says so.


## 3. Effort grades

| Grade | Meaning | Evidence required |
|---|---|---|
| `NONE` | 完成品 / 組立不要 | manual or supplier text explicitly says so |
| `LIGHT` | 簡易組立 | manual: no tools, ≤15 min, 1 person |
| `STANDARD` | 標準組立 | manual: tools and/or 15–60 min, 1–2 people |
| `HEAVY` | 本格組立 | manual: 2+ people, or ≥60 min, or anchoring/installation |
| `GENERIC` | 組立必要（詳細不明） | manual confirms assembly but no usable time/people/tool detail |
| `COMPRESSED` | 圧縮梱包・復元 | compression packaging; 10 min shake, 72 h restore, L-bracket |

Do not infer a grade from product type or packaging.

## 4. Japanese templates

### LIGHT
```text
【組立について】
本商品は組立が必要です。
工具を使わず、{約N分}で組み立てられます。
組立手順は同梱の説明書をご確認ください。
```

### STANDARD
```text
【組立について】
本商品は組立が必要です。
{工具}を使用し、{約N分}で組み立てられます。
組立手順は同梱の説明書をご確認ください。
```

### HEAVY
```text
【組立について】
本商品は組立が必要です。
大人{N}人での組立を推奨します。{工具}を使用し、作業時間は{約N分}です。
組立手順は同梱の説明書をご確認ください。
```

### GENERIC
```text
【組立について】
本商品は組立が必要です。作業時間・必要な工具・組立手順は、同梱の説明書をご確認ください。
```

Rules:
- No “簡単” / “大変” unless the manual uses it.
- No invented people, time, or tools.
- If a detail is missing, omit that sentence rather than guess.
- Replace/remove the false absolute claim; do not leave both claims.

## 5. Decision log

| Date | SKU | Listing(s) | Grade | Evidence | Action |
|---|---|---|---|---|---|
| 2026-11-24 | N504P191530A | 2JMePfFMTgnFTtsHVkVFgu | HEAVY | PDF 9p: 「2人で組み立てることをおススメします」 | false claim removed; assembly note added; readback OK |
| 2026-11-24 | N504S191528A | soKuFHR8GzM7bQYEeiQo7S | HEAVY | PDF 27p: 「2人で組み立てることをおススメします」 | false claim removed; assembly note added; readback OK |
| 2026-11-24 | N509P304378A | ge58Rz4NdqeJFmM8GGo87M | STANDARD | PDF 21p: 取扱・組立説明書 / 組立方法 | false claim removed; assembly note added; readback OK |
| 2026-11-24 | N509P214551A | 6 listings (Shop1–3) | GENERIC | PDF 11p: 組立方法 / お客様組立 | false claim removed; graded note added; readback OK |
| 2026-11-24 | MS187952BAA | 3 listings (Shop1–3) | GENERIC | JPG: 手すりの取付方法（ネジ固定） | false claim removed; graded note added; readback OK |
| 2026-11-24 | WF326429AAA | 3 listings (Shop1–3) | HEAVY | PDF: 取扱・組立説明書 / 組立方法 | false claim removed; graded note added; readback OK |
| 2026-11-24 | N512P276868B | 3 listings (Shop1–3) | HEAVY | PDF: 組立2人以上 / 組立説明書 | false claim removed; graded note added; readback OK |
| 2026-11-24 | Batch (13 SKUs) | 34 listings (Shop1–3) | 16 GENERIC / 12 STANDARD / 6 HEAVY | PDF/JPG manuals | all repaired with readback OK |
| 2026-11-24 | Batch (12 SKUs) | 23 listings (Shop1–4) | 19 GENERIC / 13 STANDARD / 25 HEAVY (cumulative 57) | PDF/JPG manuals | all repaired with readback OK; live recheck clean |
| 2026-11-25 | N508P316352B/D, N508P183957A | 3 listings (Shop4) | GENERIC | Manual: backrest bracket attachment | false title/description claim removed; readback OK |
| 2026-11-25 | N508P479081A/B/C, N508P479083A/B/C | 12 listings (Shop1/4) | COMPRESSED | Manual: 10 min shake, 72 h restore, L-bracket | title/claim corrected; restore note added; readback OK |
| 2026-11-25 | N508P439374B | 2 listings (Shop2–3) | NONE | Manual: operation/folding only, no assembly steps | no change |
| 2026-11-25 | N508P185100A/B | 5 listings (Shop2–3) | NONE | Copy already says 組立品; manual is assembly instructions | no change |

## 6. Current coverage

- Explicit “no assembly” suspects: **541 listings / 227 SKUs**.
- GigaB2B manual available: **184 listings / 86 SKUs** (104 PDF, 2 JPG).
- Manual verdicts: **38 SKUs NEEDS_ASSEMBLY**, 5 PARTIAL_SETUP, 2 NO_ASSEMBLY, 41 NO_EVIDENCE.
- Of the 38 NEEDS SKUs, **67 candidate listings** after excluding 12 compressed-sofa/decompression cases. **72 repaired and 27 claims removed = 99 listing actions** (45 SKUs, Shops 1–4); 7 reclassified as correct/no-change (2 wheelchairs — manual is operation/folding only; 5 cat cages — copy already says 組立品). Compressed sofas now use the `COMPRESSED` template (10 min shake, 72 h restore, L-bracket). All 57 readbacks passed and a live recheck found zero remaining 「組み立て不要/組立不要」 claims in title or description.
- Grades: **18 HEAVY / 10 STANDARD / 10 GENERIC**.
- No manual: 141 SKUs. Supplier text alone: **88 explicitly 組立不要/完成品**, 44 silent, 8 contradictory, 1 says assembly required. The 53 no-manual SKUs were resolved by the 2026-11-25 enriched rules: **30 supplier-title no-assembly (81 listings) trusted**, **12 suitcases (14 listings) allowed**, **11 other (27 listings) had the no-assembly claim removed**. No manual request remains mandatory under the current rule set; outcomes: `work/issue-524/manual_request_outcomes.csv`.

## 7. Open items

- Complete PDF verification for the 86 file-bearing SKUs.
- Apply graded templates only to confirmed `NEEDS_ASSEMBLY` listings.
- For no-manual SKUs, request manuals through the Giga message center.
- Copy Builder provenance guard **deployed** 2026-11-25 00:26 JST to the copy-builder UI runtime (`127.0.0.1:8765`, PID 55006); real-fact canary returns an empty assembly section. Runtime is a hotfix copy and must be reconciled on the next runtime refresh; exact diff preserved at `operations/catalog/patches/2026-11-25-copy-builder-provenance-guard.patch`.

## 8. Change log

| Date | Change |
|---|---|
| 2026-11-24 | Initial policy, grades, templates, pilot decisions |
| 2026-11-25 | 72 listings repaired; 27 no-manual listings had forbidden claims removed; duplicate lines cleaned; Copy Builder guard merged (`994594f`) and deployed |
