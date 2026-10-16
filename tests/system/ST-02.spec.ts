import { test, expect } from '@playwright/test';

test('ST-02: checkout validation and recovery', {
  annotation: {
    type: 'description',
    description: 'ตรวจสอบ Checkout Validation และการแก้ไขข้อมูลจนสั่งซื้อสำเร็จ'
  }
}, async ({ page }) => {
  const firstName = page.locator('[data-test="firstName"]');
  const lastName = page.locator('[data-test="lastName"]');
  const postalCode = page.locator('[data-test="postalCode"]');
  const continueButton = page.locator('[data-test="continue"]');
  const error = page.locator('[data-test="error"]');

  await test.step('Login เพิ่มสินค้า และเปิด Checkout', async () => {
    // เตรียมขั้นตอน Checkout ด้วยระบบจริง
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const backpack = page.locator('.inventory_item').filter({
      has: page.locator('.inventory_item_name', { hasText: /^Sauce Labs Backpack$/ }),
    });
    await backpack.getByRole('button', { name: 'Add to cart' }).click();
    await expect(backpack.locator('button')).toHaveText('Remove');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.cart_item .inventory_item_name')).toHaveText('Sauce Labs Backpack');

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(page.locator('.title')).toHaveText('Checkout: Your Information');
  });
  await test.step('ตรวจสอบ First Name is required', async () => {
    // ส่งฟอร์มว่างและตรวจสอบ Error
    await expect(firstName).toHaveValue('');
    await expect(lastName).toHaveValue('');
    await expect(postalCode).toHaveValue('');
    await continueButton.click();
    await expect(error).toBeVisible();
    await expect(error).toContainText('First Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });
  await test.step('ตรวจสอบ Last Name is required', async () => {
    // กรอก First Name และตรวจสอบ Error
    await firstName.fill('John');
    await continueButton.click();
    await expect(error).toBeVisible();
    await expect(error).toContainText('Last Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });
  await test.step('ตรวจสอบ Postal Code is required', async () => {
    // กรอก Last Name และตรวจสอบ Error
    await lastName.fill('Doe');
    await continueButton.click();
    await expect(error).toBeVisible();
    await expect(error).toContainText('Postal Code is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });
  await test.step('แก้ไขข้อมูลและสั่งซื้อสำเร็จ', async () => {
    // กรอก Postal Code, ตรวจสอบ Overview, กด Finish และตรวจสอบข้อความสำเร็จ
    await postalCode.fill('50000');
    await expect(firstName).toHaveValue('John');
    await expect(lastName).toHaveValue('Doe');
    await expect(postalCode).toHaveValue('50000');
    await continueButton.click();

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('.title')).toHaveText('Checkout: Overview');
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.cart_item .inventory_item_name')).toHaveText('Sauce Labs Backpack');

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });
});
