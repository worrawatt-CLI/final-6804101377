# Final Exam — Software Testing with Playwright (SauceDemo)
- **ผู้ส่ง:** `ชื่อ-นามสกุล` รหัสนักศึกษา `6804101377` *(แก้ไขเป็นข้อมูลจริง)*
- **ระบบที่ทดสอบ:** https://www.saucedemo.com/
- **เครื่องมือ:** Playwright Test 1.64 + TypeScript (Chromium)
- **Repository:** `final-<รหัสนักศึกษา>`

## โครงสร้างโปรเจกต์

```text
final-exam/
├── README.md
├── package.json / package-lock.json
├── playwright.config.ts          # HTML + JSON reporter ตามโจทย์
├── tsconfig.json
├── tests/
│   ├── unit/        UT-01.spec.ts, UT-02.spec.ts
│   ├── integration/ IT-01.spec.ts, IT-02.spec.ts
│   └── system/      ST-01.spec.ts, ST-02.spec.ts
├── scripts/
│   ├── run-all.mjs        # รันเทสต์แล้วสร้าง summary เสมอ (แม้มี Failed)
│   └── make-summary.mjs   # สร้าง reports/test-summary.md จาก reports/results.json
├── setup-windows.ps1 / setup-windows.bat / setup.sh   # ติดตั้งอัตโนมัติ
├── playwright-report/     # HTML Report (สร้างหลังรัน)
└── reports/               # results.json + test-summary.md (สร้างหลังรัน)
```

## วิธีติดตั้งและรัน (Windows 11)

`setup-windows.bat` 

## รายการ Test (8 Test Cases / 6 ข้อ)

| ข้อ | ไฟล์ | ชื่อ Test |
|---|---|---|
| 1 | tests/unit/UT-01.spec.ts | UT-01.1: empty username and password |
| 1 | tests/unit/UT-01.spec.ts | UT-01.2: missing password |
| 1 | tests/unit/UT-01.spec.ts | UT-01.3: invalid login details |
| 2 | tests/unit/UT-02.spec.ts | UT-02: product button state Add to cart -> Remove -> Add to cart |
| 3 | tests/integration/IT-01.spec.ts | IT-01: top-down REAL Login -> browser-level Inventory STUB |
| 4 | tests/integration/IT-02.spec.ts | IT-02: DRIVER login state -> REAL Inventory and Cart |
| 5 | tests/system/ST-01.spec.ts | ST-01: complete purchase of two products |
| 6 | tests/system/ST-02.spec.ts | ST-02: checkout validation and recovery |

## IT-01: Top-Down Integration Testing ด้วย Stub — ส่วนไหน Real / ส่วนไหน Stub

| ส่วน | ประเภท | รายละเอียด |
|---|---|---|
| หน้า Login ของ SauceDemo (ฟอร์ม, ปุ่ม, การตรวจ Username/Password) | **REAL** | เปิด `https://www.saucedemo.com/` จริง กรอก `standard_user` / `secret_sauce` แล้วกด Login |
| การ Redirect ไป `inventory.html` หลัง Login | **REAL** | ตรวจด้วย `expect(page).toHaveURL(/inventory\.html$/)` และหัวข้อ `Products` |
| หน้า Inventory ที่ใช้ตรวจผล | **STUB** | แทนที่ DOM ทั้งหน้าด้วย `page.setContent(INVENTORY_STUB_HTML)` |
| ข้อความ `Mock Inventory Ready` และสินค้า `Mock Backpack`, `Mock Bike Light` | **STUB** | ข้อมูลคงที่ (hard-coded) ที่ Stub คืนให้ ไม่ได้มาจาก Server |

แนวคิด Top-Down: เริ่มรวมระบบจากโมดูลชั้นบน (Login) ซึ่งเป็นของจริง แล้วใช้ **Stub** แทนโมดูลชั้นล่าง (Inventory) ที่ "ยังไม่พร้อม" เพื่อยืนยันว่าเมื่อ Login สำเร็จ ระบบส่งต่อไปยังส่วน Inventory ได้ และส่วนที่ถูกเรียกแสดงผลตามสัญญา (ข้อความ + 2 รายการสินค้า)
> หมายเหตุ: Stub นี้เป็นการจำลองระดับ DOM ใน Browser หลัง Login จริง ไม่ได้แทน Internal Module ของ SauceDemo โดยตรง

## IT-02: Bottom-Up Integration Testing ด้วย Driver — บทบาทของ Driver และส่วนที่ Real

| ส่วน | ประเภท | รายละเอียด |
|---|---|---|
| `driverOpenInventory(context)` | **DRIVER** | ใช้ `BrowserContext.addCookies()` ตั้ง Cookie `session-username=standard_user` บนโดเมน `www.saucedemo.com` แล้วเปิด `https://www.saucedemo.com/inventory.html` โดยตรง **ไม่ผ่าน Login Form** |
| หน้า Inventory (สินค้า 6 รายการ, ปุ่ม Add to cart) | **REAL** | หน้าเว็บจริงของ SauceDemo |
| Cart Badge และหน้า Shopping Cart | **REAL** | เพิ่ม Backpack + Bike Light จริง ตรวจ Badge = 2 และรายการใน `cart.html` |

แนวคิด Bottom-Up: ทดสอบโมดูลชั้นล่าง (Inventory → Cart) ซึ่งเป็นของจริงก่อน โดยใช้ **Driver** ทำหน้าที่แทนโมดูลชั้นบน (Login) ที่ยังไม่ถูกนำมารวม — Driver "เรียกใช้" โมดูลล่างพร้อมเตรียมสถานะที่ต้องการ (session cookie) และเมื่อจบการทดสอบจะปิด `BrowserContext` ที่สร้างเองใน `finally`

## หมายเหตุเชิงวิชาการ

บทที่ 1 เป็นการทดสอบ UI แบบ Black-box ผ่าน Browser จึงเป็น UI Component / Functional Testing ไม่ใช่ Unit Testing ของฟังก์ชันภายในโดยตรง เพราะไม่สามารถเข้าถึง Source Code ภายในของ SauceDemo

## รายงานผล

- HTML Report: `playwright-report/index.html` → เปิดด้วย `npx playwright show-report`
- JSON Report: `reports/results.json`
- สรุปผล: `reports/test-summary.md` `npm run summary`
