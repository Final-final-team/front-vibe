# ADR-0016: 로컬 E2E는 Vite 프록시와 실제 로그인 사용자 기준으로 검증한다

- 상태: 채택
- 날짜: 2026-03-18

## 배경

- 프론트는 `https://task-automation-ui.vercel.app` 같은 HTTPS origin에서 로컬 HTTP 백엔드를 직접 호출하면 브라우저 쿠키 정책 때문에 `access_token`, `refresh_token` 전달이 흔들릴 수 있다.
- 현재 백엔드 인증은 Authorization 헤더가 아니라 HttpOnly 쿠키 기준이라, 브라우저에서 same-origin에 가깝게 붙는 개발 경로가 더 중요하다.
- review 화면은 non-mock 모드에서도 `X-Actor-*` 헤더와 localStorage 기반 fake actor를 사용하고 있어, 실제 백엔드 정책 E2E를 왜곡하고 있었다.

## 검토한 선택지

### 선택지 A. 브라우저가 백엔드 IP를 직접 호출한다

장점
- 배포 주소와 비슷한 URL을 눈으로 확인하기 쉽다.

단점
- 로컬 HTTP 백엔드와 크로스 오리진 쿠키 정책을 같이 맞춰야 한다.
- `Secure`, `SameSite=None`, 프리플라이트까지 동시에 흔들릴 수 있다.
- 문제 발생 시 프론트 구현 이슈와 브라우저 보안 정책 이슈가 섞인다.

### 선택지 B. Vite dev server가 `/api`, `/oauth2`, `/login`을 백엔드로 프록시한다

장점
- 브라우저는 프론트 origin 기준으로 요청하므로 로컬 E2E에서 쿠키 흐름을 더 안정적으로 볼 수 있다.
- 프론트 코드는 상대 경로만 쓰면 되므로 머신별 IP 의존이 줄어든다.
- 인증, 동의, refresh, 보호 API를 한 번에 점검하기 쉽다.

단점
- 개발 전용 프록시 설정을 유지해야 한다.
- 배포 환경의 절대 URL과는 다르게 보일 수 있다.

## 결정

- 로컬 E2E는 Vite 프록시를 기준으로 진행한다.
- `VITE_PUBLIC_API_BASE_URL`, `VITE_AUTH_BASE_URL`은 로컬에서 비워 둘 수 있게 허용하고, 이 경우 상대 경로를 사용한다.
- Vite 프록시는 `/api`, `/oauth2`, `/login`을 모두 백엔드로 전달한다.
- review non-mock 모드에서는 fake actor 헤더를 보내지 않는다.
- review 화면의 액션 노출은 “실제 로그인 사용자 식별 + 서버 최종 판정” 기준으로 본다.

## 결과

- 로컬 회원가입/로그인 이후 consent check, refresh, 보호 API를 같은 브라우저 세션에서 검증하기 쉬워진다.
- review 화면이 localStorage mock 권한으로 성공/실패를 가리는 문제를 줄인다.
- 백엔드 정책이 바뀌더라도 프론트는 fake permission 복제보다 서버 응답을 우선하게 된다.
