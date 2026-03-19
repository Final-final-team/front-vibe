import { expect, test } from 'playwright/test';

test('project hub renders with hero and workspace cards', async ({ page }) => {
  await page.goto('/projects');

  const tutorialDismiss = page.getByRole('button', { name: '다시 보지 않기' });
  if (await tutorialDismiss.isVisible().catch(() => false)) {
    await tutorialDismiss.click();
  }

  await expect(page.getByRole('heading', { name: '오늘 해야 할 프로젝트를 바로 선택하세요' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '지금 들어갈 프로젝트' })).toBeVisible();
  await expect(page.getByRole('button', { name: '지금 바로 시작' })).toBeVisible();
  await expect(page.getByRole('button', { name: '업무 시작' }).first()).toBeVisible();
});
