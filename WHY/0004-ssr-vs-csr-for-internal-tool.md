# ADR-0004: CSR Over SSR For Internal Tool

- Status: accepted
- Date: 2026-03-09

## Context

사용자가 `SSR`과 `CSR` 차이와, 어떤 방식이 더 나은지 질문했다.

## Options Considered

### 1. CSR

장점:
- 브라우저에서 라우팅과 데이터 패칭을 처리하므로 구조가 단순하다.
- 승인/반려/취소/첨부/코멘트 같은 상호작용 중심 흐름에 잘 맞는다.
- React Query와 조합이 자연스럽다.

단점:
- 초기 HTML이 비어 있어 SEO에는 약하다.
- 첫 진입 렌더는 JS 실행에 의존한다.

### 2. SSR

장점:
- 초기 HTML을 서버에서 렌더링하므로 첫 화면이 빠르게 보일 수 있다.
- SEO와 메타데이터 처리에 유리하다.

단점:
- 서버와 클라이언트 경계가 늘어나 구현 복잡도가 커진다.
- 내부 인증형 업무툴에서는 이득이 작을 수 있다.

## Recommendation

`CSR`가 더 적합하다.

## Decision

- 렌더링 모델: `CSR`

## Consequences

이 제품은 검색 유입이 중요한 공개 웹서비스가 아니라, 로그인 후 사용하는 업무관리툴이다. 따라서 SEO 이점보다 review 상태 변경, 락 충돌, 다중 액션 UX를 단순하게 구현하는 것이 중요하다. 이 관점에서 CSR이 더 실용적이다.
