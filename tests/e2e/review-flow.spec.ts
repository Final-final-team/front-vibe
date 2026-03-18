import { expect, test } from 'playwright/test';

test('task detail opens review composer modal and submits review in mock mode', async ({ page }) => {
  await page.goto('/projects/10/tasks');

  await page.getByRole('button', { name: /역할 변경 승인 정책 정리.*검토 보기 상신/ }).click();
  const taskDetailDialog = page.getByRole('dialog', { name: '역할 변경 승인 정책 정리' });
  await expect(taskDetailDialog.getByRole('button', { name: '검토 상신하기', exact: true })).toBeVisible();

  await taskDetailDialog.getByRole('button', { name: '검토 상신하기', exact: true }).click();
  const composerDialog = page.getByRole('dialog', { name: '검토 상신하기' });
  await expect(composerDialog.getByText('업무 상세를 벗어나지 않고 바로 검토 라운드를 생성합니다.')).toBeVisible();

  await composerDialog
    .getByPlaceholder('예: 이번 라운드에서는 업무 상태 변경 로직과 상신 버튼 UX를 중점으로 확인해 주세요.')
    .fill('E2E mock review submission');
  await composerDialog.getByRole('button', { name: '상신하기' }).click();

  await expect(composerDialog).toBeHidden();
  await expect(taskDetailDialog.getByText('1차 검토')).toBeVisible();
});

test('review detail lets submitter add additional reviewer from project members', async ({ page }) => {
  await page.goto('/reviews/3001');

  const reviewerSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: '추가 검토자' }),
  });

  await expect(reviewerSection.getByRole('heading', { name: '추가 검토자' })).toBeVisible();
  await reviewerSection.getByRole('combobox', { name: '추가 검토자 지정' }).click();
  await page.getByRole('option', { name: /이서진/ }).click();
  await reviewerSection.getByRole('button', { name: '추가 검토자 할당' }).click();

  await expect(reviewerSection.getByText('이서진 · PMO')).toBeVisible();
});
