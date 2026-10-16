import { test, expect } from '@playwright/test';

const INVENTORY_STUB_HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Inventory Stub</title>
  </head>
  <body>
    <h1 data-test="stub-status">Mock Inventory Ready</h1>
    <ul data-test="stub-inventory-list">
      <li class="inventory_item" data-test="stub-item">
        <span class="inventory_item_name">Mock Backpack</span>
      </li>
      <li class="inventory_item" data-test="stub-item">
        <span class="inventory_item_name">Mock Bike Light</span>
      </li>
    </ul>
  </body>
</html>
`;

test('IT-01: top-down REAL Login -> browser-level Inventory STUB', {
  annotation: {
    type: 'description',
    description: 'ทดสอบ Login จริงร่วมกับ Inventory Stub ที่จำลองด้วย page.setContent()'
  }
}, async ({ page }) => {
  await test.step('Login ผ่านหน้าเว็บไซต์จริง', async () => {
    // Login และตรวจสอบ URL inventory.html
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('.title')).toHaveText('Products');
  });
  await test.step('สร้าง Inventory Stub', async () => {
    // ใช้ page.setContent() แสดง Mock Inventory Ready และสินค้าจำลอง 2 รายการ
    await page.setContent(INVENTORY_STUB_HTML);
    await expect(page.locator('[data-test="stub-inventory-list"]')).toBeVisible();
  });
  await test.step('ตรวจสอบผลจาก Stub', async () => {
    // ตรวจสอบข้อความ จำนวน และชื่อสินค้าจำลอง
    await expect(page.locator('[data-test="stub-status"]')).toHaveText('Mock Inventory Ready');
    await expect(page.getByText('Mock Inventory Ready')).toBeVisible();
    const items = page.locator('[data-test="stub-item"]');
    await expect(items).toHaveCount(2);
    await expect(items.locator('.inventory_item_name')).toHaveText(['Mock Backpack', 'Mock Bike Light']);
  });
});
