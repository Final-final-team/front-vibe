import { expect, test } from 'playwright/test';

test('project hub renders with hero and workspace cards', async ({ page }) => {
  await page.goto('/projects');

  await expect(page.getByText('프로젝트를 고르고 바로 업무와 검토 흐름으로 들어가는 메인 허브')).toBeVisible();
  await expect(page.getByText('Workspace Collection')).toBeVisible();
  await expect(page.getByRole('button', { name: '업무 보드 바로 열기' })).toBeVisible();
  await expect(page.getByRole('button', { name: '업무 보드 열기' }).first()).toBeVisible();
});
