# Review 화면설계 페이지

## 1. 문서 목적

이 문서는 백엔드 `review` 도메인 기능을 프론트 화면으로 1:1 매핑하기 위한 화면설계 기준서다.

- 백엔드 기준 경로: `/mnt/c/Users/alswl/Desktop/fianl`
- API 명세 기준: `/mnt/c/Users/alswl/Desktop/fianl/DOCS/review/review-action-api-spec.md`
- 프론트 스택 기준: `Vite + React 19 + TypeScript + Tailwind`
- 디자인 원칙:
  - 기존 `front-vibe`의 레이아웃, 컬러, 타이포그래피, 여백, 폼 스타일을 최대한 유지한다.
  - 현재 확인된 디자인 언어는 `white background + gray border + blue primary CTA + dense board/table layout + rounded modal` 조합이다.
  - 기능 추가를 위해 필요한 상태 배지, 액션 바, 모달, 히스토리 타임라인만 최소 확장한다.

## 2. 정보 구조도

### 2.1 화면 목록

1. `Task Review List`
2. `Review Detail`
3. `Review Submit / Resubmit`
4. `Review Edit`
5. `Review Decision`
6. `Reference Management`
7. `Additional Reviewer Management`
8. `Attachment Upload / Confirm / Delete`
9. `Comment Thread`
10. `History Timeline`

### 2.2 사용자 이동 구조

```text
Task Detail
  -> Review List by Task
    -> Review Detail
      -> Review Edit
      -> Approve
      -> Reject
      -> Cancel
      -> Reference Management
      -> Additional Reviewer Management
      -> Attachment Management
      -> Comment Thread
      -> History Timeline

Task Detail (IN_PROGRESS)
  -> Review Submit / Resubmit
```

## 3. 상태 전이와 화면 노출 규칙

### 3.1 업무 상태와 리뷰 상태 관계

- `TaskStatus.IN_PROGRESS`
  - 검토 상신 가능
  - 반려 또는 취소 이후 재상신 진입 가능
- `TaskStatus.IN_REVIEW`
  - 제출된 리뷰 상세 진입
  - 승인/반려/취소 및 부가 액션 가능
- `TaskStatus.COMPLETED`
  - 승인 완료된 리뷰 읽기 전용 조회

### 3.2 리뷰 상태별 UI 정책

| Review Status | 화면 정책 | 허용 액션 |
| --- | --- | --- |
| `SUBMITTED` | 편집 가능 상태 | 본문 수정, 승인, 반려, 취소, 참조자 관리, 추가 검토자 관리, 첨부 관리, 코멘트 작성/수정/삭제 |
| `APPROVED` | 읽기 전용 상태 | 코멘트 작성만 허용 |
| `REJECTED` | 읽기 전용 상태 | 반려 사유 확인, 재상신 유도 |
| `CANCELLED` | 읽기 전용 상태 | 재상신 유도 |

### 3.3 권한 정책

- 기본 원칙: 권한이 없거나 상태가 맞지 않는 액션은 선제 차단한다.
- 차단 방식:
  - 중요 CTA는 숨김 또는 비활성화
  - 비활성화 시 이유 텍스트 또는 툴팁 제공
  - 서버는 최종 진실이므로 실패 응답도 별도 안내

## 4. 화면별 설계

## 4.1 Task Review List

### 목적

업무 단위의 리뷰 이력과 현재 진행 라운드를 요약해 보여준다.

### 핵심 UI

- 리뷰 라운드 목록
- 상태 배지
- 제출일
- 처리일
- 상세 진입 버튼
- 현재 업무 상태에 따른 `검토 상신` 또는 `재상신` CTA

### 호출 API

- `GET /api/v1/tasks/{taskId}/reviews`

### 빈 상태

- 리뷰가 없으면 `아직 검토 이력이 없습니다`와 함께 상신 CTA 노출

## 4.2 Review Detail

### 목적

리뷰 본문, 상태, 반려 사유, 첨부, 참조자, 추가 검토자, 코멘트, 이력을 한 화면에서 확인하고 필요한 액션을 수행한다.

### 데스크톱 레이아웃

- 좌측:
  - 상태 배지
  - 라운드 정보
  - 본문
  - 첨부
  - 코멘트 스레드
- 우측:
  - 메타 정보
  - 참조자 목록
  - 추가 검토자 목록
  - 히스토리 타임라인
  - 액션 바
- 현재 repo의 보드형 테이블 UI와 맞추기 위해, 목록 화면은 기존 `GroupTable` 패턴을 확장하고 상세 화면은 우측 보조 패널이 있는 workspace 레이아웃으로 맞춘다.

### 태블릿 레이아웃

- 단일 컬럼 카드 구조
- 액션 바는 상단 고정 또는 섹션 상단 배치

### 모바일 레이아웃

- 본문 우선 노출
- 메타 정보는 아코디언 또는 바텀시트
- 액션 바는 하단 고정

### 호출 API

- `GET /api/v1/reviews/{reviewId}`
- `GET /api/v1/reviews/{reviewId}/histories`

## 4.3 Review Submit / Resubmit

### 목적

업무 진행 중인 상태에서 새 리뷰를 생성하거나 반려 후 재상신한다.

### 입력 요소

- 본문 `Textarea`
- 참조자 선택 UI
- 첨부 초안 목록
- 첨부 추가 버튼
- 제출 버튼

### 호출 API

- `POST /api/v1/tasks/{taskId}/reviews`
- 첨부가 있을 때 구현 단계에서는 `presign -> 업로드 -> create request attachments` 또는 기존 UI 흐름에 맞는 업로드 절차 적용

### 유효성

- 본문 필수
- 첨부 초안의 파일명, 크기, 정렬 순서 필요

## 4.4 Review Edit

### 목적

`SUBMITTED` 상태에서 본문만 수정한다.

### 호출 API

- `PATCH /api/v1/reviews/{reviewId}`

### 인터랙션

- 저장 전 현재 `lockVersion` 사용
- 충돌 시 최신 데이터 재조회 후 사용자에게 충돌 안내

## 4.5 Review Decision

### Approve

- API: `POST /api/v1/reviews/{reviewId}/approve`
- 조건: `SUBMITTED` + 승인 권한 또는 추가 검토자
- UI: 확인 모달 후 실행

### Reject

- API: `POST /api/v1/reviews/{reviewId}/reject`
- 조건: `SUBMITTED` + 반려 권한 또는 추가 검토자
- UI: 반려 사유 입력 모달 필수

### Cancel

- API: `POST /api/v1/reviews/{reviewId}/cancel`
- 조건: `SUBMITTED` + 제출자 또는 취소 권한
- UI: 선택적 사유 입력 + 확인 모달

## 4.6 Reference Management

- 추가: `POST /api/v1/reviews/{reviewId}/references`
- 제거: `DELETE /api/v1/reviews/{reviewId}/references/{userId}`
- 조건: `SUBMITTED`
- UI:
  - 현재 참조자 리스트
  - 사용자 검색 또는 선택 필드
  - 제거 버튼

## 4.7 Additional Reviewer Management

- 추가: `POST /api/v1/reviews/{reviewId}/additional-reviewers`
- 제거: `DELETE /api/v1/reviews/{reviewId}/additional-reviewers/{userId}`
- 조건: `SUBMITTED`
- UI:
  - 현재 추가 검토자 리스트
  - 사용자 선택 필드
  - 제거 버튼

## 4.8 Attachment Management

### 단계

1. 파일 선택
2. `POST /api/v1/reviews/{reviewId}/attachments/presign`
3. 스토리지 업로드
4. `POST /api/v1/reviews/{reviewId}/attachments`
5. 필요 시 `DELETE /api/v1/reviews/{reviewId}/attachments/{attachmentId}`

### UI 정책

- 업로드 중 진행 상태 표시
- 실패 시 재시도 버튼
- 확정 전 임시 상태와 확정 후 상태를 구분 표시

## 4.9 Comment Thread

- 생성: `POST /api/v1/reviews/{reviewId}/comments`
- 수정: `PATCH /api/v1/reviews/{reviewId}/comments/{commentId}`
- 삭제: `DELETE /api/v1/reviews/{reviewId}/comments/{commentId}`

### 상태 규칙

- 생성: `SUBMITTED`, `APPROVED`
- 수정/삭제: `SUBMITTED`

### UI 정책

- 작성자 본인 코멘트만 수정/삭제 제어 노출
- 수정 이력은 `edited`, `editedAt`로 표현

## 4.10 History Timeline

- API: `GET /api/v1/reviews/{reviewId}/histories`
- 최신순 타임라인 표시
- 항목 정보:
  - 액션 타입
  - 대상 타입
  - 처리자
  - 사유
  - 발생 시각

## 5. 인터랙션 가이드

## 5.1 공통

- 버튼 클릭 전 상태와 권한을 먼저 검사해 선제 차단
- 변경성 액션은 전부 로딩 상태를 가진다
- 성공 시 상세 화면 재조회 또는 캐시 무효화
- 실패 시 에러 코드별 메시지 노출

## 5.2 로딩

- 목록: 테이블 또는 카드 스켈레톤
- 상세: 본문 영역과 사이드 패널 스켈레톤 분리
- 첨부 업로드: 파일 행 단위 진행 상태

## 5.3 오류 처리

| Error Code | UX 처리 |
| --- | --- |
| `VALIDATION_ERROR` | 입력 필드 하단 오류 표시 |
| `*_FORBIDDEN` | 권한 없음 토스트 또는 인라인 안내 |
| `*_NOT_ALLOWED` | 현재 상태에서는 수행 불가 메시지 |
| `REVIEW_VERSION_CONFLICT` | 최신 데이터 재조회 후 충돌 안내 모달 |
| `REVIEW_NOT_FOUND` | Not Found 상태 화면 |

## 6. API-화면 액션 매핑 표

| 화면명 | 사용자 액션 | 호출 API | 요청 body | 성공 후 UI 변화 | 실패 UX |
| --- | --- | --- | --- | --- | --- |
| Review List | 목록 조회 | `GET /tasks/{taskId}/reviews` | 없음 | 목록 렌더링 | 에러 배너 |
| Review Submit | 검토 제출 | `POST /tasks/{taskId}/reviews` | `content`, `referenceUserIds`, `attachments` | 상세 화면 이동 또는 최신 목록 반영 | 필드 오류, 권한/상태 오류 |
| Review Detail | 상세 조회 | `GET /reviews/{reviewId}` | 없음 | 상세 렌더링 | Not Found |
| Review Edit | 본문 수정 | `PATCH /reviews/{reviewId}` | `content` | 본문 갱신, 이력 반영 | 충돌/권한/상태 안내 |
| Review Decision | 승인 | `POST /reviews/{reviewId}/approve` | 없음 | 상태 `APPROVED` 반영 | 충돌/권한/상태 안내 |
| Review Decision | 반려 | `POST /reviews/{reviewId}/reject` | `reason` | 상태 `REJECTED`, 사유 노출 | 필드/권한/상태 안내 |
| Review Decision | 취소 | `POST /reviews/{reviewId}/cancel` | `reason?` | 상태 `CANCELLED` 반영 | 충돌/권한/상태 안내 |
| Reference Management | 참조자 추가 | `POST /reviews/{reviewId}/references` | `userId` | 리스트 반영 | 권한/중복/상태 안내 |
| Reference Management | 참조자 제거 | `DELETE /reviews/{reviewId}/references/{userId}` | 없음 | 리스트 반영 | 권한/상태 안내 |
| Additional Reviewer | 추가 검토자 추가 | `POST /reviews/{reviewId}/additional-reviewers` | `userId` | 리스트 반영 | 권한/중복/상태 안내 |
| Additional Reviewer | 추가 검토자 제거 | `DELETE /reviews/{reviewId}/additional-reviewers/{userId}` | 없음 | 리스트 반영 | 권한/상태 안내 |
| Attachment | presign 생성 | `POST /reviews/{reviewId}/attachments/presign` | 파일 메타데이터 | 업로드 진행 시작 | 업로드 오류 |
| Attachment | 첨부 확정 | `POST /reviews/{reviewId}/attachments` | 파일 메타데이터 | 첨부 리스트 반영 | 권한/상태 안내 |
| Attachment | 첨부 삭제 | `DELETE /reviews/{reviewId}/attachments/{attachmentId}` | 없음 | 첨부 제거 | 권한/상태 안내 |
| Comment Thread | 코멘트 작성 | `POST /reviews/{reviewId}/comments` | `content` | 스레드 하단 반영 | 권한/상태 안내 |
| Comment Thread | 코멘트 수정 | `PATCH /reviews/{reviewId}/comments/{commentId}` | `content` | 수정 상태 반영 | 권한/상태 안내 |
| Comment Thread | 코멘트 삭제 | `DELETE /reviews/{reviewId}/comments/{commentId}` | 없음 | 항목 제거 또는 삭제 상태 반영 | 권한/상태 안내 |
| History Timeline | 이력 조회 | `GET /reviews/{reviewId}/histories` | 없음 | 타임라인 렌더링 | 에러 배너 |

## 7. 반응형 기준

| 브레이크포인트 | 레이아웃 기준 |
| --- | --- |
| Desktop | 상세 2단, 액션과 메타 정보 우측 분리 |
| Tablet | 1단 카드 스택, 섹션별 구획 유지 |
| Mobile | 본문 우선, 메타 정보 축약, 액션 하단 고정 |

## 8. 구현 전 확인 필요 항목

- 기존 버튼, 모달, 폼, 배지 컴포넌트 존재 여부
- 사용자 검색/선택용 공용 컴포넌트 또는 API 존재 여부
- 인증 토큰과 `X-Actor-*` 헤더 주입 방식
- 상세 진입을 위한 라우터 도입 방식 여부
