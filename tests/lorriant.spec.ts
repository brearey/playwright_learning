import { expect, test } from '@playwright/test';

test('starts resend timer after requesting code by email', async ({ page }) => {
  let emailRequestBody = '';

  await page.route('**/uvezus/email', async (route, request) => {
    emailRequestBody = request.postData() ?? '';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto('https://lorriant.ru/');

  const emailInput = page.getByRole('textbox', { name: 'Введите вашу почту:' });
  const getCodeButton = page.getByRole('button', { name: 'Получить код' });
  const resendTimer = page.getByText(/Отправить код повторно через \d+ сек\./);

  await expect(getCodeButton).toBeDisabled();

  await emailInput.fill('brearey4@gmail.com');
  await expect(getCodeButton).toBeEnabled();

  await getCodeButton.click();

  await expect(getCodeButton).toBeDisabled();
  await expect(resendTimer).toHaveText(/Отправить код повторно через [1-5]\d сек\./);
  expect(emailRequestBody).toContain('brearey4@gmail.com');
});
