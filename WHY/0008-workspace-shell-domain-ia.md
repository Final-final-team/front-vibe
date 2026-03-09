# 0008. Workspace shell / domain IA / data layering

## Context

- 기존 최신 프론트는 이미 `React Router + TanStack Query + review mock/api layer` 구조로 정리되어 있었다.
- 이번 작업은 그 위에 `프로젝트 컨텍스트`, `멤버`, `역할/권한`, `마일스톤`, `업무`, `검토 inbox`를 얹어 IA를 확장하는 목적이다.
- 사용자는 기술 선택을 임의로 하지 말고 의미 있는 결정은 먼저 설명 후 확인할 것을 요구했다.

## Decision

### 1. Routing

- 기존 `React Router`를 유지한다.
- 도메인 탭은 `/members`, `/roles`, `/milestones`, `/tasks`, `/reviews`로 노출한다.
- 기존 review 상세/상신/수정 라우트는 그대로 유지한다.

### 2. Data layer

- 도메인 데이터는 `TanStack Query + mock layer`를 유지한다.
- 새 전역 스토어는 추가하지 않는다.
- 선택된 프로젝트 같은 UI 상태만 별도 컨텍스트로 관리한다.

### 3. Shared abstraction

- 완전 schema-driven table로 가지 않는다.
- `toolbar`, `status pill`, `metric card`, `panel/card` 같은 공통 프리미티브만 공유한다.
- 실제 화면은 도메인별 래퍼 페이지에서 책임진다.

## Why

- 라우터를 되돌리면 이미 구현된 review 흐름을 다시 해체해야 해서 비용이 크다.
- Query/mock 레이어를 유지하면 review 도메인과 새 도메인의 데이터 접근 방식이 일관된다.
- 멤버, 권한 매트릭스, 마일스톤, 업무 보드, review 상세는 화면 성격이 달라 완전 공통 테이블이 오히려 경직된다.

## Consequences

- 프로젝트 선택은 URL이 아니라 컨텍스트 상태로 유지된다.
- 리뷰 도메인은 독립 페이지와 task row 진입점을 동시에 가진다.
- 추후 실제 API가 붙더라도 route 계약은 유지하고 queryFn만 교체하면 된다.
