# 다음 단계: 업무 커맨드 UX 연결

## 1. 문서 목적

이 문서는 현재 `front-vibe` 프론트에서 이미 연결된 업무 조회/생성/담당자 지정 기능을 기준으로, 다음 단계에서 어떤 업무 커맨드 UX를 어떤 방식으로 붙일지 정리한 실행 문서다.

기준 원칙:
- 백엔드 기준 저장소는 [be-api-server](https://github.com/Final-final-team/be-api-server)
- 기본 참조 브랜치는 `dev`
- 프론트 수정은 항상 실제 백엔드 필드와 향후 `task` 도메인 확장을 같이 고려한다.
- 현재 mock UI도 이후 API 교체만으로 이어질 수 있게 공통 view model과 공용 모달 구조를 유지한다.

현재 프론트 기준 관련 파일:
- [/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/tasks/api.ts](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/tasks/api.ts)
- [/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/tasks/hooks.ts](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/tasks/hooks.ts)
- [/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/tasks/types.ts](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/features/tasks/types.ts)
- [/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/TaskListPage.tsx](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/TaskListPage.tsx)

## 2. 현재 연결 상태

### 2.1 이미 프론트에 들어온 것

- 프로젝트 업무 목록 조회
  - `GET /api/projects/{projectId}/tasks`
- 업무 상세 조회
  - `GET /api/projects/{projectId}/tasks/{taskId}`
- 새 업무 생성
  - `POST /api/projects/{projectId}/tasks`
- 담당자 지정
  - `POST /api/projects/{projectId}/tasks/{taskId}/assign`
- 나에게 지정
  - `POST /api/projects/{projectId}/tasks/{taskId}/assign/me`

### 2.2 현재 프론트 타입

현재 프론트의 업무 타입은 아래 정도까지 연결돼 있다.

```ts
type TaskSummary = {
  id: number;
  projectId: number;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
  priority: PriorityLevel;
  startDate: string | null;
  dueDate: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
};

type TaskDetail = TaskSummary & {
  description: string;
};
```

즉, 현재 시점에서 프론트는 이미 읽기/생성/담당자 변경의 기반은 갖고 있고, 다음 단계는 `상세 모달 안에서 실제 커맨드 UX를 더 자연스럽게 연결하는 작업`이다.

## 3. 다음 단계 범위

### 3.1 상세 수정 커맨드

업무 상세 모달 안에서 필드 단위 수정으로 연결한다.

대상 필드:
- 제목
- 설명
- 시작일
- 마감일
- 우선순위

대상 backend API:
- `PATCH /api/projects/{projectId}/tasks/{taskId}/title`
- `PATCH /api/projects/{projectId}/tasks/{taskId}/description`
- `PATCH /api/projects/{projectId}/tasks/{taskId}/start-date`
- `PATCH /api/projects/{projectId}/tasks/{taskId}/due-date`
- `PATCH /api/projects/{projectId}/tasks/{taskId}/priority`

설계 원칙:
- “한 번에 전체 저장”이 아니라 필드별 저장
- 각 줄은 `읽기 상태 -> 편집 상태 -> 저장/취소`로 전환
- 서버 성공 후 상세 query 재조회
- 실패 시 서버 에러 문구를 그대로 보여주되, 라벨은 프론트에서 읽기 쉽게 정리

### 3.2 담당자 제어

업무 상세 모달 안에서 담당자 관련 액션을 처리한다.

지원할 흐름:
- 나에게 재할당
- 다른 멤버 지정
- 담당 해제

대상 backend API:
- `POST /api/projects/{projectId}/tasks/{taskId}/assign`
- `POST /api/projects/{projectId}/tasks/{taskId}/assign/me`
- `POST /api/projects/{projectId}/tasks/{taskId}/unassign`
- `POST /api/projects/{projectId}/tasks/{taskId}/unassign/me`

UX 기준:
- 현재 담당자 영역 옆에 `변경` 버튼 배치
- 클릭 시 작은 선택 모달 또는 드롭다운으로 멤버 리스트 노출
- `나에게 할당`, `담당 해제`는 빠른 액션으로 제공
- `내 업무만` 필터와 시각적으로 바로 연결돼야 함

### 3.3 상태 전이

운영자/담당자 시점에서 가능한 상태 전이를 상세 모달 하단 액션 영역에 둔다.

지원할 흐름:
- 대기 상태에서 업무 시작
- 진행중 상태에서 시작 취소
- 검토중 상태에서 강제 완료

대상 backend API:
- `POST /api/projects/{projectId}/tasks/{taskId}/start`
- `POST /api/projects/{projectId}/tasks/{taskId}/cancel-start`
- `POST /api/projects/{projectId}/tasks/{taskId}/force-complete`

UX 기준:
- 상태 전이는 상단 메타 옆이 아니라 하단 `작업 액션` 영역에 몰아둔다.
- `강제 완료`는 파괴적 액션이므로 별도 확인 다이얼로그 필수
- 상태가 맞지 않거나 권한이 없으면 버튼을 숨기거나 비활성화
- 단순히 안 보이게 끝내지 말고 이유를 보조 문구로 제공

## 4. 상세 모달 UX 구조

다음 단계의 목표는 “읽기 전용 상세 모달”이 아니라 “상세 + 실행” 모달이다.

권장 구조:

### 4.1 상단

- 제목
- 현재 상태 배지
- 담당자
- 마일스톤
- 다음 행동 1개

여기는 한눈에 현재 맥락이 보여야 한다.

### 4.2 본문

- 설명
- 일정
- 우선순위
- 최근 갱신

### 4.3 실행 영역

- 상태 전이
- 담당자 변경
- 새 검토 상신
- 최신 검토 상세

### 4.4 보조 영역

- 검토 라운드 목록
- 서버에서 아직 없는 필드는 자리만 잡고 실제 API 붙을 때 채움

## 5. 현재 화면 기준 개선 포인트

현재 [TaskListPage.tsx](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/pages/TaskListPage.tsx)의 상세 모달은 이미 다음을 갖고 있다.

- 제목
- 상태/우선순위/기한/담당자/업무 영역 메타
- 최신 검토 요약
- 새 검토 상신
- 최신 검토 상세 진입

하지만 다음이 아직 부족하다.

- 필드 편집이 읽기 전용
- 담당자 변경 UX 없음
- 상태 전이 버튼 없음
- 위험 액션 확인 다이얼로그 없음
- 상세 상단에서 “지금 무엇을 해야 하는가”가 더 강하게 드러나지 않음

즉, 다음 패스는 디자인을 갈아엎는 게 아니라 `현재 상세 모달에 실제 커맨드 UX를 붙이는 것`이 목적이다.

## 6. 백엔드 매핑 원칙

이 문서 기준 구현 시 반드시 지킬 매핑 원칙:

- 실제 백엔드 `dev` 브랜치에 없는 필드는 새로 invent 하지 않는다.
- 프론트에서 먼저 필요한 보조 필드는 `derived field`로만 만든다.
  - 예: `다음 행동`, `위험 액션`, `표시용 라벨`
- 서버 상태는 항상 `TanStack Query`로 읽고, 액션 후 invalidate/re-fetch
- 업무 view model은 계속 유지하고, 이후 `task` API 확장 시 매핑층만 교체한다.

## 7. 구현 순서

1. 업무 상세 모달에 `편집 가능한 필드 행` 추가
2. 제목/설명/시작일/마감일/우선순위 patch mutation 연결
3. 담당자 변경 mutation 연결
4. 상태 전이 mutation 연결
5. 강제 완료 확인 다이얼로그 추가
6. 성공/실패 피드백 문구 정리
7. `내 업무만` / 담당자 / 상태 필터와 연동 확인

## 8. 검증 기준

- 상세 모달에서 수정한 값이 실제 상세/목록 query 재조회 후 즉시 반영돼야 한다.
- `내 업무만` 필터는 현재 사용자 기준을 계속 유지해야 한다.
- 담당자 변경 후 목록/상세에 같은 값이 보여야 한다.
- `PENDING -> IN_PROGRESS -> PENDING` 전이가 실제 버튼으로 확인돼야 한다.
- `IN_REVIEW -> COMPLETED` 강제 완료는 별도 확인 후 실행돼야 한다.
- `npm run build`, `npm run lint`가 유지돼야 한다.

## 9. 이번 문서의 범위 밖

이번 문서는 아래를 직접 포함하지 않는다.

- 검토 도메인 자체의 상세 설계
- 멤버/역할/마일스톤 UX 재정비
- 감사 로그 화면 구조
- 백엔드 API 계약 변경 제안

이 문서는 오직 `업무 상세 모달에서 어떤 커맨드를 어떻게 연결할지`를 정의하는 다음 패스 문서다.
