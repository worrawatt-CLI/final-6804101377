import { test, expect, type BrowserContext, type Page } from '@playwright/test';

const INVENTORY_URL = 'https://www.saucedemo.com/inventory.html';

async function driverOpenInventory(context: BrowserContext): Promise<Page> {
  await context.addCookies([
    {
      name: 'session-username',
      value: 'standard_user',
      domain: 'www.saucedemo.com',
      path: '/',
    },
  ]);
  const page = await context.newPage();
  await page.goto(INVENTORY_URL);
  return page;
}

test('IT-02: DRIVER login state -> REAL Inventory and Cart', {
  annotation: {
    type: 'description',
    description: 'ใช้ Driver เตรียมสถานะ Login เพื่อทดสอบ Inventory และ Cart จริง'
  }
}, async ({ browser }) => {
  const context = await browser.newContext();
  let page!: Page;

  try {
    await test.step('สร้าง Driver และเปิด Inventory', async () => {
      // สร้าง BrowserContext และใช้ driverOpenInventory() ตั้งค่า Cookie
      page = await driverOpenInventory(context);
      const cookies = await context.cookies('https://www.saucedemo.com');
      expect(cookies).toContainEqual(
        expect.objectContaining({ name: 'session-username', value: 'standard_user' }),
      );
      await expect(page).toHaveURL(INVENTORY_URL);
      await expect(page.locator('.title')).toHaveText('Products');
    });
    await test.step('ตรวจสอบ Inventory จริง', async () => {
      // ตรวจสอบสินค้า 6 รายการ
      await expect(page.locator('.inventory_item')).toHaveCount(6);
      await expect(page.locator('.inventory_item_name')).toHaveCount(6);
    });
    await test.step('เพิ่มสินค้า 2 รายการ', async () => {
      // เพิ่ม Backpack และ Bike Light แล้วตรวจสอบ Cart Badge = 2
      const backpack = page.locator('.inventory_item').filter({
        has: page.locator('.inventory_item_name', { hasText: /^Sauce Labs Backpack$/ }),
      });
      const bikeLight = page.locator('.inventory_item').filter({
        has: page.locator('.inventory_item_name', { hasText: /^Sauce Labs Bike Light$/ }),
      });

      await backpack.getByRole('button', { name: 'Add to cart' }).click();
      await expect(backpack.locator('button')).toHaveText('Remove');
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

      await bikeLight.getByRole('button', { name: 'Add to cart' }).click();
      await expect(bikeLight.locator('button')).toHaveText('Remove');
      await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
    });
    await test.step('ตรวจสอบสินค้าใน Cart', async () => {
      // เปิด Cart และตรวจสอบชื่อสินค้าทั้งสองรายการ
      await page.locator('.shopping_cart_link').click();
      await expect(page).toHaveURL(/\/cart\.html$/);
      await expect(page.locator('.title')).toHaveText('Your Cart');
      await expect(page.locator('.cart_item')).toHaveCount(2);
      // ตรวจชื่อสินค้าแบบไม่ขึ้นกับลำดับการแสดงผล
      const cartNames = page.locator('.cart_item .inventory_item_name');
      await expect(cartNames.filter({ hasText: /^Sauce Labs Backpack$/ })).toHaveCount(1);
      await expect(cartNames.filter({ hasText: /^Sauce Labs Bike Light$/ })).toHaveCount(1);
    });
  } finally {
    // ปิด BrowserContext ที่สร้างเองเมื่อสิ้นสุดการทดสอบ
    await context.close();
  }
});
