# ADR-0003: Next.js 대신 Vite React TypeScript Tailwind

- 상태: 채택
- 날짜: 2026-03-09

## 배경

사용자가 현재 `Vite + React 19 + TypeScript + Tailwind` 조합이 괜찮은지, 그리고 `Next.js`가 더 나은지 질문했다.

## 검토한 선택지

### 1. Vite + React 19 + TypeScript + Tailwind 유지

장점:
- 현재 repo와 가장 자연스럽게 이어진다.
- 개발 서버가 빠르고 구조가 단순하다.
- 내부 업무툴처럼 상호작용 중심인 SPA에 잘 맞는다.
- TypeScript로 백엔드 DTO 1:1 매핑이 쉽다.
- Tailwind로 보드형 UI를 빠르게 정리할 수 있다.

단점:
- SSR, SSG, 메타 태그, 서버 컴포넌트 같은 기능은 기본 제공되지 않는다.
- 공개 서비스의 SEO 최적화에는 불리하다.

### 2. Next.js로 전환

장점:
- SSR, SSG, 파일 기반 라우팅, 서버 액션 등 풀스택 기능이 강하다.
- 공개 페이지나 검색 유입이 중요한 서비스에 유리하다.

단점:
- 현재 Vite 구조를 전환해야 하므로 비용이 크다.
- 내부 업무툴에서는 SSR 이득이 제한적일 수 있다.
- 기존 디자인만 가져가고 구조를 갈아엎는 상황에서 프레임워크 전환까지 하면 복잡도가 커진다.

## 권고안

현재 repo와 제품 성격을 기준으로 `Vite + React 19 + TypeScript + Tailwind` 유지가 더 적합하다.

## 결정

- 프레임워크: `Vite + React 19`
- 언어: `TypeScript`
- 스타일링: `Tailwind CSS`
- `Next.js` 전환은 하지 않음

## 결과

이 프로젝트는 공개 랜딩 페이지보다 인증된 내부 업무관리툴에 가깝고, 핵심 복잡도는 review API 연동과 상태 전이 처리다. 이 경우 프레임워크를 옮기기보다 현재 Vite 기반을 유지하면서 라우터, Query, 도메인 구조를 정리하는 편이 비용 대비 효과가 가장 좋다.
