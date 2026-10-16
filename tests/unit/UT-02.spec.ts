import { test, expect } from '@playwright/test';

test('UT-02: product button state Add to cart -> Remove -> Add to cart', {
  annotation: {
    type: 'description',
    description: 'ตรวจสอบสถานะปุ่ม Add to cart และ Remove รวมถึง Cart Badge'
  }
}, async ({ page }) => {
  // การ์ดสินค้า Sauce Labs Backpack (ค้นหาจากชื่อสินค้าแบบตรงตัว)
  const backpackItem = page.locator('.inventory_item').filter({
    has: page.locator('.inventory_item_name', { hasText: /^Sauce Labs Backpack$/ }),
  });
  const backpackButton = backpackItem.locator('button');
  const cartBadge = page.locator('.shopping_cart_badge');

  await test.step('Login เข้าสู่ระบบ', async () => {
    // Login และตรวจสอบหน้า Inventory
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('.title')).toHaveText('Products');
    await expect(page.locator('.inventory_list')).toBeVisible();
  });
  await test.step('ตรวจสอบปุ่มก่อนเพิ่มสินค้า', async () => {
    // ตรวจสอบปุ่ม Add to cart ของ Backpack
    await expect(backpackItem).toHaveCount(1);
    await expect(backpackButton).toHaveText('Add to cart');
    await expect(backpackButton).toBeEnabled();
    await expect(cartBadge).toHaveCount(0);
  });
  await test.step('เพิ่มสินค้าเข้า Cart', async () => {
    // เพิ่มสินค้าและตรวจสอบปุ่ม Remove และ Cart Badge = 1
    await backpackButton.click();
    await expect(backpackButton).toHaveText('Remove');
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText('1');
  });
  await test.step('ลบสินค้าออกจาก Cart', async () => {
    // ลบสินค้า ตรวจสอบปุ่ม Add to cart และ Cart Badge หายไป
    await backpackButton.click();
    await expect(backpackButton).toHaveText('Add to cart');
    await expect(cartBadge).toHaveCount(0);
  });
});
