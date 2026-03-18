# Real Backend E2E

## Goal
- 프론트가 mock이 아니라 실제 백엔드/인증 상태와 붙었을 때 핵심 흐름이 유지되는지 빠르게 확인한다.

## Preconditions
- 백엔드가 로컬 `8080`에서 실행 중이어야 한다.
- 프론트 dev 서버가 실제 백엔드를 바라보도록 실행되어야 한다.
- 브라우저 세션에 로그인 쿠키와 필수 동의 상태가 이미 있어야 한다.

## Frontend Env
- [`/.env.local`](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/.env.local)

```env
VITE_USE_MOCK=false
VITE_PUBLIC_API_BASE_URL=
VITE_AUTH_BASE_URL=
DEV_PROXY_TARGET=http://127.0.0.1:8080
```

## Run Order
1. 백엔드 실행
   - `cd C:\Users\user\Desktop\final-back`
   - `run-local-postgres.cmd`
2. 프론트 실행
   - `cd C:\Users\user\Desktop\Final-front\task-automation-ui`
   - `npm run dev -- --host 127.0.0.1 --port 5300 --strictPort`
3. 브라우저에서 `http://127.0.0.1:5300` 접속 후 로그인/동의 완료
4. 같은 주소 기준으로 real E2E 실행
   - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5300 npm run test:e2e:real`

## Covered Smoke
- 프로젝트 허브 진입
- 업무 상세에서 검토 상신 모달 열기
- 검토 상세에서 추가 검토자 할당

## Failure Hints
- `/login`으로 튀면 인증 쿠키가 없는 상태다.
- `403`이면 동의 미완료 또는 CSRF/Origin 설정을 먼저 본다.
- `redirect_uri_mismatch`면 프론트 E2E 문제가 아니라 Google OAuth 설정 문제다.
