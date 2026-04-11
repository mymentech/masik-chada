import { expect, test } from '@playwright/test';

test.describe('mobile donations route', () => {
  test('renders donations screen on a mobile viewport for authenticated users', async ({ context, page }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token');
    });

    await page.goto('/donations');

    await expect(page).toHaveURL(/\/donations$/);
    await expect(page.getByRole('heading', { name: 'দান সংগ্রহ' })).toBeVisible();
    await expect(page.getByText('মোবাইল-ফার্স্ট দ্রুত কালেকশন ফ্লো এখানে তৈরি হবে।')).toBeVisible();
  });
});
