import { test, expect } from '@playwright/test';

test('ST-01: complete purchase of two products', {
  annotation: {
    type: 'description',
    description: 'ทดสอบการซื้อ Backpack และ Bike Light ตั้งแต่ Login จนสั่งซื้อสำเร็จ'
  }
}, async ({ page }) => {
  const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

  // หา inventory_item ของสินค้าจากชื่อแบบตรงตัว
  const productCard = (name: string) =>
    page.locator('.inventory_item').filter({
      has: page.locator('.inventory_item_name', { hasText: new RegExp(`^${name}$`) }),
    });

  // ตรวจว่ารายการสินค้าในหน้าปัจจุบันมีสินค้าครบทั้งสองรายการ (ไม่ขึ้นกับลำดับ)
  const expectItemsListed = async () => {
    const names = page.locator('.cart_item .inventory_item_name');
    await expect(page.locator('.cart_item')).toHaveCount(PRODUCTS.length);
    for (const name of PRODUCTS) {
      await expect(names.filter({ hasText: new RegExp(`^${name}$`) })).toHaveCount(1);
    }
  };

  await test.step('Login และตรวจสอบ Inventory', async () => {
    // Login จริงผ่าน SauceDemo
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('.title')).toHaveText('Products');
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });
  await test.step('เพิ่มสินค้าสองรายการ', async () => {
    // เพิ่ม Backpack และ Bike Light ตรวจสอบ Badge = 2
    for (const name of PRODUCTS) {
      const card = productCard(name);
      await card.getByRole('button', { name: 'Add to cart' }).click();
      await expect(card.locator('button')).toHaveText('Remove');
    }
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });
  await test.step('ตรวจสอบ Cart', async () => {
    // ตรวจสอบชื่อสินค้าทั้งสองรายการ
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.locator('.title')).toHaveText('Your Cart');
    await expectItemsListed();
  });
  await test.step('กรอก Checkout Information', async () => {
    // กรอกข้อมูลลูกค้าและกด Continue
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(page.locator('.title')).toHaveText('Checkout: Your Information');
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('50000');
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('John');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('Doe');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('50000');
    await page.locator('[data-test="continue"]').click();
  });
  await test.step('ตรวจสอบ Overview และสั่งซื้อ', async () => {
    // ตรวจสอบรายการสินค้าแล้วกด Finish
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('.title')).toHaveText('Checkout: Overview');
    await expectItemsListed();
    await page.locator('[data-test="finish"]').click();
  });
  await test.step('ตรวจสอบ Order Complete', async () => {
    // ตรวจสอบข้อความ Thank you for your order!
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });
});
