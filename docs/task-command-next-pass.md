# 다음 단계: 업무 커맨드 UX 연결

## 목표

- 백엔드에 이미 있는 업무 커맨드 API를 프론트 상세 모달에서 자연스럽게 사용할 수 있게 연결한다.
- API 계약은 유지하고, 화면 상호작용과 상태 전이 UX만 보강한다.

## 이번 단계에서 붙일 기능

### 업무 상세 편집

- 제목 수정
- 설명 수정
- 시작일 수정
- 마감일 수정
- 우선순위 수정

대상 backend API:
- `PATCH /api/projects/{projectId}/tasks/{taskId}/title`
- `PATCH /api/projects/{projectId}/tasks/{taskId}/description`
- `PATCH /api/projects/{projectId}/tasks/{taskId}/start-date`
- `PATCH /api/projects/{projectId}/tasks/{taskId}/due-date`
- `PATCH /api/projects/{projectId}/tasks/{taskId}/priority`

### 담당자 제어

- 나에게 재할당
- 다른 멤버 지정
- 담당 해제

대상 backend API:
- `POST /api/projects/{projectId}/tasks/{taskId}/assign`
- `POST /api/projects/{projectId}/tasks/{taskId}/assign/me`
- `POST /api/projects/{projectId}/tasks/{taskId}/unassign`
- `POST /api/projects/{projectId}/tasks/{taskId}/unassign/me`

### 상태 전이

- 대기 상태에서 업무 시작
- 진행중 상태에서 시작 취소
- 검토중 상태에서 강제 완료

대상 backend API:
- `POST /api/projects/{projectId}/tasks/{taskId}/start`
- `POST /api/projects/{projectId}/tasks/{taskId}/cancel-start`
- `POST /api/projects/{projectId}/tasks/{taskId}/force-complete`

## UX 원칙

- 읽기 전용 상세 모달을 `상세 + 액션 패널` 구조로 확장한다.
- 필드 수정은 한 번에 전부 저장하지 않고, backend 계약에 맞게 필드별 저장 패턴으로 푼다.
- 상태 전이는 확인 문구와 함께 노출한다.
- 권한이 없거나 상태가 맞지 않는 액션은 선제 차단하되, 서버 실패 메시지도 그대로 보여준다.
- 위험 액션인 강제 완료는 별도 확인 다이얼로그를 둔다.

## 선행 반영 완료

- 프로젝트 상세 기반 `currentUserId` 문맥 도입
- `PENDING / IN_PROGRESS / IN_REVIEW / COMPLETED` 상태 복원
- 새 업무 생성 후 담당자 지정 플로우 연결

## 검증 기준

- 상세 모달에서 수정한 값이 실제 task query 재조회 후 즉시 반영된다.
- `내 업무만`과 담당자 표시는 현재 사용자 기준을 유지한다.
- `PENDING -> IN_PROGRESS -> PENDING` 전이와 `IN_REVIEW -> COMPLETED` 강제 완료가 실제 화면에서 확인된다.
- `npm run build`, `npm run lint`가 유지된다.
