# ADR-0011: Vite 유지와 Tailwind 4 + shadcn/ui 도입 전략

- 상태: 채택
- 날짜: 2026-03-12

## 배경
- 현재 제품은 공개 웹사이트보다 로그인 후 내부 사용자가 쓰는 업무관리 도구에 가깝다.
- 핵심 화면은 `업무`, `검토`, `역할/권한`, `멤버`, `마일스톤`이며, 보드/모달/필터/상세 패널 중심의 SPA 상호작용 비중이 높다.
- 백엔드는 별도 API 서버로 운영하고, 프론트엔드는 UI 애플리케이션으로 분리하는 방향을 유지하고 있다.
- 한 차례 `Next.js App Router` 전환을 검토했지만, 현재 단계에서는 SEO, SSR, SSG, BFF, 서버 액션 우선순위가 낮다.
- 동시에 UI 품질과 컴포넌트 일관성을 높이기 위해 `shadcn/ui` 기반의 디자인 시스템 도입 필요성이 커졌다.

## 검토한 선택지
### 선택지 A. Next.js로 전환하면서 shadcn/ui 도입
- 장점:
  - 최신 `shadcn/ui` 문서 흐름과 자연스럽게 맞는다.
  - 향후 공개 페이지와 BFF가 필요해지면 확장 여지가 있다.
- 단점:
  - 현재 내부 업무도구 구조에 비해 라우팅, 런타임 경계, 배포 구조가 과해진다.
  - 백엔드 분리 운영이라는 현재 전제와 직접적인 시너지가 작다.
  - 현재 팀이 감당해야 할 구조적 복잡성이 늘어난다.

### 선택지 B. React + Vite 유지, Tailwind 3 유지, shadcn/ui 수동 적용
- 장점:
  - 현재 구조에 대한 변경 폭이 가장 작다.
  - 빠르게 몇 개 컴포넌트만 흡수할 수 있다.
- 단점:
  - 최신 `shadcn/ui` 공식 문서 흐름과 차이가 생긴다.
  - 이후 컴포넌트 확장 시 수동 보정 비용이 누적될 수 있다.

### 선택지 C. React + Vite 유지, Tailwind 4로 올리고 shadcn/ui 도입
- 장점:
  - 현재 선택한 프론트 구조를 유지한다.
  - 최신 `shadcn/ui`와 Tailwind 4 흐름에 맞출 수 있다.
  - 서버 프레임워크 전환 없이 UI 시스템만 개선할 수 있다.
- 단점:
  - Tailwind 4 전환에 따른 CSS와 빌드 설정 수정이 필요하다.
  - 초기에 디자인 토큰과 컴포넌트 기준을 다시 맞춰야 한다.

## 결정
- 프론트엔드는 `React + Vite`를 유지한다.
- `Next.js` 전환은 현재 단계에서는 진행하지 않는다.
- 스타일 시스템은 `Tailwind CSS 4`로 올린다.
- UI 컴포넌트 시스템은 `shadcn/ui`를 도입한다.
- 복잡한 인터랙션 컴포넌트는 `Radix UI` 기반으로 가져간다.
- 단순 레이아웃과 도메인별 보드/테이블 구성은 기존 코드와 프로젝트 문맥에 맞게 직접 조합한다.
- 데이터 계층은 기존처럼 `TanStack Query`를 유지한다.

## 결과
- 현재 구조의 핵심 뼈대인 `React Router + TanStack Query + 별도 백엔드 API`는 유지된다.
- UI 시스템 개선은 프레임워크 교체가 아니라 `디자인 시스템 업그레이드`로 다룬다.
- 우선 도입 대상은 다음 컴포넌트다.
  - `button`
  - `card`
  - `badge`
  - `input`
  - `tabs`
  - `dialog`
  - `sheet`
  - `dropdown-menu`
  - `select`
  - `table`
  - `sidebar`
- 이 중 실제 화면에 바로 영향이 큰 기준 레퍼런스는 다음과 같다.
  - 워크스페이스 셸: `sidebar`, `tabs`, `dropdown-menu`
  - 멤버 초대/검토 처리: `dialog`, `sheet`, `select`
  - 업무/검토 보드: `card`, `badge`, `table`, `input`
  - 이후 확장 뷰: `tabs`, `card`, `chart` 계열 조합

## 재검토 조건
- 공개 랜딩 페이지나 문서형 화면이 중요해질 때
- SEO가 실제 KPI가 될 때
- 프론트 안에서 BFF 성격의 서버 계층이 필요해질 때
- 프론트와 백엔드를 다시 느슨하게 분리하는 대신 통합 운영이 필요해질 때

## 참고 자료
- `WHY/0002-stack-choice-vite-csr.md`
- `WHY/0003-vite-react-ts-tailwind-vs-next.md`
- `WHY/0004-ssr-vs-csr-for-internal-tool.md`
- `WHY/0005-query-vs-zustand-vs-redux-toolkit.md`
