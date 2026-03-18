# Review API Mapping

## Covered Endpoints
- `GET /api/v1/tasks/{taskId}/reviews`
  - client: [`src/features/review/api.ts`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/review/api.ts)
  - entry screens:
    - [`src/pages/TaskReviewsPage.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/TaskReviewsPage.tsx)
    - [`src/pages/TaskListPage.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/TaskListPage.tsx)
- `GET /api/v1/reviews/{reviewId}`
  - screens:
    - [`src/pages/ReviewDetailPage.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/ReviewDetailPage.tsx)
    - [`src/features/review/components/ReviewDetailModal.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/review/components/ReviewDetailModal.tsx)
- `POST /api/v1/tasks/{taskId}/reviews`
  - screens:
    - [`src/features/review/components/ReviewComposerModal.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/review/components/ReviewComposerModal.tsx)
    - [`src/pages/ReviewEditorPage.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/ReviewEditorPage.tsx)
- `PATCH /api/v1/reviews/{reviewId}`
  - screen:
    - [`src/pages/ReviewEditorPage.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/ReviewEditorPage.tsx)
- `POST /api/v1/reviews/{reviewId}/approve`
- `POST /api/v1/reviews/{reviewId}/reject`
- `POST /api/v1/reviews/{reviewId}/cancel`
  - screen:
    - [`src/pages/ReviewDetailPage.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/ReviewDetailPage.tsx)
- `POST /api/v1/reviews/{reviewId}/references`
- `DELETE /api/v1/reviews/{reviewId}/references/{userId}`
- `POST /api/v1/reviews/{reviewId}/additional-reviewers`
- `DELETE /api/v1/reviews/{reviewId}/additional-reviewers/{userId}`
  - screen:
    - [`src/features/review/components/ReviewSidebarLists.tsx`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/review/components/ReviewSidebarLists.tsx)

## Current UX Notes
- 참조자와 추가 검토자는 API는 이미 연결돼 있었지만, 기존에는 review detail 화면 안쪽에서 숫자 ID 입력으로만 노출됐다.
- 현재는 project member 기반 선택 UI를 우선 제공하고, 직접 ID 입력은 보조 경로로 유지한다.

## E2E Commands
- mock smoke
  - `npm run test:e2e`
- real backend smoke
  - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5300 npm run test:e2e:real`
