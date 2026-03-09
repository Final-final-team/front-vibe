# ADR-0010: 환경설정 하드닝과 명시적 Mock 모드

- 상태: 채택
- 날짜: 2026-03-09

## 배경
- 프론트엔드 런타임 API 선택 기준이 둘로 나뉘어 있었다.
  - `vite.config.ts` 안의 하드코딩된 Vite 프록시 값
  - `src/features/review/api.ts` 안의 암묵적인 런타임 fallback
- 이 구조는 mock 데이터, 로컬 백엔드, Vercel 배포를 오갈 때 의도하지 않은 런타임 모드를 잘못 배포하기 쉽게 만들었다.

## 검토한 선택지
### 선택지 A. 명시적 env 기반 모드 선택
- 장점:
  - mock/live 전환이 배포에서 명확해진다.
  - local proxy와 browser runtime API base를 분리할 수 있다.
  - 운영 실수를 줄이기 쉽다.
- 단점:
  - 필요한 env 키 수가 늘어난다.

### 선택지 B. env가 없으면 mock 모드로 간주
- 장점:
  - 초기 구성은 단순해 보인다.
- 단점:
  - 배포에서 의도치 않게 mock/live가 바뀌어도 눈치채기 어렵다.
  - machine-specific 값이 코드와 설정에 섞이기 쉽다.

## 결정
- 공개 런타임 API base는 `VITE_PUBLIC_API_BASE_URL`을 사용한다.
- 로컬 Vite 프록시 대상은 `DEV_PROXY_TARGET`을 사용한다.
- Mock 모드는 `VITE_USE_MOCK=true|false`로 명시한다.
- 런타임 코드는 `src/shared/config/app-config.ts`의 단일 설정 모듈을 통해 env를 읽는다.

## 결과
- Vercel은 `VITE_USE_MOCK`을 반드시 정의해야 하고, live 모드를 쓸 때는 `VITE_PUBLIC_API_BASE_URL`도 함께 정의해야 한다.
- 로컬 개발에서는 백엔드 프록시가 필요할 때 `.env.local`에 `DEV_PROXY_TARGET`을 정의해야 한다.
- 커밋되는 런타임 코드에서는 머신 종속 주소를 제거한다.
