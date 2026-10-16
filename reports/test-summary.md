# Test Summary — Playwright Final Exam (SauceDemo)

- วันที่รัน: 2026-10-16T06:44:23.777Z
- Playwright version: 1.64.1
- ระยะเวลารวม: 40.0 วินาที
- จำนวน Test ทั้งหมด: 8
- Passed: 8 | Failed: 0 | Skipped: 0

> ไฟล์นี้สร้างอัตโนมัติจาก `reports/results.json` ของการรันจริง ไม่ได้แก้ไขผลด้วยมือ

| # | ไฟล์ | Test | Browser | ผลลัพธ์ | เวลา (ms) |
|---:|---|---|---|---|---:|
| 1 | integration/IT-01.spec.ts | IT-01: top-down REAL Login -> browser-level Inventory STUB | chromium | ✅ Passed | 14332 |
| 2 | integration/IT-02.spec.ts | IT-02: DRIVER login state -> REAL Inventory and Cart | chromium | ✅ Passed | 1751 |
| 3 | system/ST-01.spec.ts | ST-01: complete purchase of two products | chromium | ✅ Passed | 2379 |
| 4 | system/ST-02.spec.ts | ST-02: checkout validation and recovery | chromium | ✅ Passed | 2986 |
| 5 | unit/UT-01.spec.ts | UT-01.1: empty username and password | chromium | ✅ Passed | 2577 |
| 6 | unit/UT-01.spec.ts | UT-01.2: missing password | chromium | ✅ Passed | 2759 |
| 7 | unit/UT-01.spec.ts | UT-01.3: invalid login details | chromium | ✅ Passed | 3931 |
| 8 | unit/UT-02.spec.ts | UT-02: product button state Add to cart -> Remove -> Add to cart | chromium | ✅ Passed | 5532 |

## ข้อผิดพลาดที่พบ

ไม่พบข้อผิดพลาด — ทุก Test Case ผ่าน (Passed)

## วิธีเปิดดูรายงาน

- HTML Report: `npx playwright show-report` (โฟลเดอร์ `playwright-report/`)
- JSON Report: `reports/results.json`
