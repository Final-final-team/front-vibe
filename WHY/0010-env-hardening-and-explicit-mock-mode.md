# ADR-0010: Env Hardening And Explicit Mock Mode

- Status: accepted
- Date: 2026-03-09

## Context
- Frontend runtime API selection was split between:
  - hardcoded Vite proxy values in `vite.config.ts`
  - implicit runtime fallback in `src/features/review/api.ts`
- This made it too easy to ship the wrong runtime mode by accident, especially while switching between mock data, local backend, and Vercel deployments.

## Options Considered
### Option A. Explicit env-driven mode selection
- 장점:
  - mock/live 전환이 배포에서 명확해진다.
  - local proxy와 browser runtime API base를 분리할 수 있다.
  - 운영 실수를 줄이기 쉽다.
- 단점:
  - 필요한 env 키 수가 늘어난다.

### Option B. Missing env implies mock mode
- 장점:
  - 초기 구성은 단순해 보인다.
- 단점:
  - 배포에서 의도치 않게 mock/live가 바뀌어도 눈치채기 어렵다.
  - machine-specific 값이 코드와 설정에 섞이기 쉽다.

## Decision
- Public runtime API base uses `VITE_PUBLIC_API_BASE_URL`.
- Local Vite proxy target uses `DEV_PROXY_TARGET`.
- Mock mode is explicit with `VITE_USE_MOCK=true|false`.
- Runtime code reads env through a single config module in `src/shared/config/app-config.ts`.

## Consequences
- Vercel must define `VITE_USE_MOCK` and, when live mode is used, `VITE_PUBLIC_API_BASE_URL`.
- Local development should define `DEV_PROXY_TARGET` in `.env.local` when backend proxying is needed.
- Hardcoded machine-specific addresses are removed from committed runtime code.
