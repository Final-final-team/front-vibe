# Review 컴포넌트 설계 페이지

## 1. 문서 목적

이 문서는 review 도메인 기능을 React 기반 프론트에 구현할 때 필요한 컴포넌트 구조, 책임, props, 상태 관리, API 연결 규칙을 정의한다.

기준:
- 백엔드 DTO와 가능한 한 1:1 매핑
- 공통 UI와 도메인 UI의 책임 분리
- 서버 상태와 로컬 상태 분리
- 기존 `front-vibe` 스타일과 컴포넌트 패턴 우선 유지
- 현재 확인된 프론트 구조는 `Vite + React 19 + TypeScript + Tailwind` 단일 SPA다.

## 2. 아키텍처 원칙

- 기존 repo 구조가 확인되면 그 구조를 우선 유지한다.
- 현재 repo가 CSR 중심 SPA이므로 서버 상태는 `TanStack Query` 기준으로 설계한다.
- 폼 드래프트, 모달 오픈 상태, 파일 업로드 진행 상태는 feature 로컬 상태로 관리한다.
- 리뷰 도메인 드래프트를 전역 스토어에 두지 않는다.
- 변경 액션 후에는 관련 query를 무효화하거나 상세 데이터를 재조회한다.

## 3. 데이터 타입 설계

## 3.1 ReviewSummary

```ts
type ReviewSummary = {
  reviewId: number;
  taskId: number;
  roundNo: number;
  status: "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED";
  lockVersion: number;
  submittedAt: string | null;
  decidedAt: string | null;
};
```

## 3.2 ReviewDetail

```ts
type ReviewDetail = {
  reviewId: number;
  taskId: number;
  roundNo: number;
  status: "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED";
  content: string;
  rejectionReason: string | null;
  submittedBy: number;
  decidedBy: number | null;
  cancelledBy: number | null;
  lockVersion: number;
  submittedAt: string | null;
  decidedAt: string | null;
  cancelledAt: string | null;
  references: ReferenceInfo[];
  additionalReviewers: AdditionalReviewerInfo[];
  attachments: AttachmentInfo[];
  comments: CommentInfo[];
};
```

## 3.3 세부 타입

```ts
type ReferenceInfo = {
  userId: number;
  addedBy: number;
  createdAt: string;
};

type AdditionalReviewerInfo = {
  userId: number;
  assignedBy: number;
  createdAt: string;
};

type AttachmentInfo = {
  attachmentId: number;
  objectKey: string;
  originalName: string;
  contentType: string | null;
  sizeBytes: number;
  sortOrder: number;
  createdAt: string;
};

type CommentInfo = {
  commentId: number;
  authorId: number;
  content: string;
  edited: boolean;
  editedAt: string | null;
  createdAt: string;
  deletedAt: string | null;
};

type ReviewHistoryItem = {
  historyId: number;
  actionType: string;
  targetType: string;
  targetId: number;
  actorId: number;
  reason: string | null;
  metadataJson: string | null;
  occurredAt: string;
};
```

## 4. 컴포넌트 목록

## 4.1 공통 컴포넌트

| 컴포넌트 | 책임 |
| --- | --- |
| `Button` | 공통 액션 버튼 |
| `Input` | 사용자 선택, 검색 입력 |
| `Textarea` | 본문/사유/코멘트 입력 |
| `Badge` | 상태 배지 |
| `Modal` | 확인, 반려, 삭제, 취소 확인 |
| `Drawer` | 모바일 보조 패널 |
| `Toast` | 성공/실패 피드백 |
| `EmptyState` | 빈 상태 |
| `Skeleton` | 로딩 상태 |
| `FileItem` | 파일 행 렌더링 |
| `AvatarChip` | 사용자 표시 |
| `ConfirmDialog` | 파괴적 액션 확인 |

## 4.2 도메인 컴포넌트

| 컴포넌트 | 책임 |
| --- | --- |
| `ReviewStatusBadge` | 리뷰 상태 시각화 |
| `ReviewActionBar` | 승인/반려/취소/수정 등 액션 제어 |
| `ReviewContentPanel` | 본문 및 반려 사유 표시 |
| `ReviewMetaPanel` | 라운드, 제출자, 시각, 상태 메타 정보 |
| `ReviewReferenceList` | 참조자 조회/추가/삭제 |
| `ReviewAdditionalReviewerList` | 추가 검토자 조회/추가/삭제 |
| `ReviewAttachmentManager` | 첨부 presign, 업로드, 확정, 삭제 |
| `ReviewCommentThread` | 코멘트 목록 및 작성/수정/삭제 |
| `ReviewHistoryTimeline` | 이력 타임라인 |
| `ReviewSubmitForm` | 제출/재상신 폼 |
| `ReviewRejectDialog` | 반려 사유 입력 모달 |

## 5. 계층 구조

```text
ReviewRoutePage
  -> ReviewPageContainer
    -> ReviewHeader
    -> ReviewActionBar
    -> ReviewContentPanel
    -> ReviewMetaPanel
    -> ReviewReferenceList
    -> ReviewAdditionalReviewerList
    -> ReviewAttachmentManager
    -> ReviewCommentThread
    -> ReviewHistoryTimeline
```

```text
TaskReviewListPage
  -> TaskReviewListContainer
    -> ReviewSummaryList
      -> ReviewSummaryCard
```

## 6. 컴포넌트별 props 구조

## 6.1 ReviewStatusBadge

```ts
type ReviewStatusBadgeProps = {
  status: ReviewDetail["status"];
};
```

## 6.2 ReviewActionBar

```ts
type ReviewActionBarProps = {
  reviewId: number;
  lockVersion: number;
  status: ReviewDetail["status"];
  canEdit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
};
```

## 6.3 ReviewContentPanel

```ts
type ReviewContentPanelProps = {
  content: string;
  rejectionReason: string | null;
  isReadOnly: boolean;
};
```

## 6.4 ReviewReferenceList

```ts
type ReviewReferenceListProps = {
  items: ReferenceInfo[];
  canManage: boolean;
  onAdd: (userId: number) => void;
  onRemove: (userId: number) => void;
};
```

## 6.5 ReviewAdditionalReviewerList

```ts
type ReviewAdditionalReviewerListProps = {
  items: AdditionalReviewerInfo[];
  canManage: boolean;
  onAdd: (userId: number) => void;
  onRemove: (userId: number) => void;
};
```

## 6.6 ReviewAttachmentManager

```ts
type ReviewAttachmentManagerProps = {
  reviewId: number;
  lockVersion: number;
  items: AttachmentInfo[];
  canManage: boolean;
  onRefresh: () => void;
};
```

## 6.7 ReviewCommentThread

```ts
type ReviewCommentThreadProps = {
  reviewId: number;
  status: ReviewDetail["status"];
  currentUserId: number;
  items: CommentInfo[];
  canCreate: boolean;
  canUpdate: (comment: CommentInfo) => boolean;
  canDelete: (comment: CommentInfo) => boolean;
};
```

## 6.8 ReviewHistoryTimeline

```ts
type ReviewHistoryTimelineProps = {
  items: ReviewHistoryItem[];
  isLoading?: boolean;
};
```

## 6.9 ReviewSubmitForm

```ts
type ReviewSubmitFormProps = {
  taskId: number;
  mode: "submit" | "resubmit";
  defaultContent?: string;
  defaultReferenceUserIds?: number[];
  onSubmitSuccess?: (reviewId: number) => void;
};
```

## 7. 상태 관리 전략

## 7.1 서버 상태

- `useTaskReviews(taskId)`
- `useReviewDetail(reviewId)`
- `useReviewHistories(reviewId)`

뮤테이션:
- `useSubmitReview`
- `useUpdateReview`
- `useApproveReview`
- `useRejectReview`
- `useCancelReview`
- `useAddReference`
- `useRemoveReference`
- `useAddAdditionalReviewer`
- `useRemoveAdditionalReviewer`
- `useCreateAttachmentPresign`
- `useConfirmAttachment`
- `useDeleteAttachment`
- `useCreateComment`
- `useUpdateComment`
- `useDeleteComment`

## 7.2 로컬 상태

- 제출 폼 입력값
- 반려 사유 모달 오픈 상태
- 취소 확인 모달 상태
- 파일 업로드 진행률
- 사용자 선택 드롭다운 상태
- 낙관적 락 충돌 안내 모달

## 7.3 파생 상태

- `isSubmitted`
- `isApproved`
- `isRejected`
- `isCancelled`
- `isReadOnly`
- `canEdit`
- `canApprove`
- `canReject`
- `canCancel`
- `canManageReferences`
- `canManageAttachments`
- `canManageAdditionalReviewers`
- `canCreateComment`

이 파생 상태는 사용자 정보와 review 상태를 조합해 계산한다.

## 8. 서비스 레이어 규칙

## 8.1 API 규칙

- 공통 응답은 `ApiResponse<T>` 기준으로 파싱한다.
- 변경 API는 `If-Match` 헤더에 `lockVersion`을 넣는다.
- 사용자 헤더 주입 방식은 실제 프론트 인증 구현 확인 후 맞춘다.

## 8.2 에러 처리 규칙

- `VALIDATION_ERROR`: 필드 단위 에러 맵핑
- `*_FORBIDDEN`: 권한 부족 토스트 또는 인라인 설명
- `*_NOT_ALLOWED`: 상태 충돌 안내
- `REVIEW_VERSION_CONFLICT`: 최신 상세 재조회 후 충돌 모달
- `*_NOT_FOUND`: Not Found 화면 또는 섹션 오류

## 9. 구현 순서 제안

1. 현재 Vite React 구조에 review 도메인용 폴더 구조 추가
2. 공통 API 클라이언트와 review 타입 정의
3. review query hooks 정의
4. review list / detail 페이지 연결
5. submit / edit / decision 액션 연결
6. reference / additional reviewer / attachment / comment 연결
7. history timeline 연결
8. 반응형과 디자인 시스템 정합성 보정

## 10. 구현 전 확인 필요 항목

- 공통 `Modal`, `Toast`, `Button`, `Form` 컴포넌트 유무
- 파일 업로드 공통 유틸 유무
- 사용자 검색 또는 사용자 선택 API 유무
- 인증 컨텍스트와 사용자 권한 주입 구조
