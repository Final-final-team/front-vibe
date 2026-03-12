# Vercel 운영 및 보안 가이드

## 1. 문서 목적

이 문서는 `front-vibe` 프론트엔드를 Vercel에서 팀 단위로 운영할 때 필요한 설정, 배포 확인, 로그 확인, 접근 제어, 보안 점검 기준을 정리한 운영 기준서다.

대상:
- 프론트엔드 개발자
- 백엔드 개발자
- 배포와 운영을 함께 보는 팀원

전제:
- 현재 프론트는 `Vite + React 19 + TypeScript` 기반 SPA다.
- 현재 런타임 환경변수 전략은 다음 파일을 기준으로 정리되어 있다.
  - [package.json](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/package.json)
  - [vite.config.ts](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/vite.config.ts)
  - [app-config.ts](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/src/shared/config/app-config.ts)
  - [.env.example](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/.env.example)
  - [WHY/0010-env-hardening-and-explicit-mock-mode.md](/mnt/c/Users/user/Desktop/Final-front/task-automation-ui/WHY/0010-env-hardening-and-explicit-mock-mode.md)

---

## 2. 운영 원칙

### 2.1 Git에 넣지 말아야 하는 값

- 실제 API 비밀 키
- OAuth client secret
- DB 비밀번호
- 토큰 서명 키
- 내부 관리자용 비밀값

위 값들은 프론트 저장소에 커밋하면 안 된다.

### 2.2 프론트에 둘 수 있는 값

현재 프론트는 `VITE_` 접두사를 사용하는 값을 브라우저 번들에 포함할 수 있다. 즉 아래 값은 공개되어도 되는 설정값이어야 한다.

- `VITE_PUBLIC_API_BASE_URL`
- `VITE_USE_MOCK`

주의:
- `VITE_` 값은 브라우저 개발자도구에서 확인될 수 있다.
- 따라서 비밀값을 `VITE_` 변수로 두면 안 된다.

### 2.3 로컬과 배포 환경을 분리한다

- 로컬 개발: `.env.local`
- Git 저장소: `.env.example`만 보관
- 배포 환경: Vercel 환경변수 사용

---

## 3. 현재 프론트 환경변수 정책

### 3.1 사용 중인 변수

| 변수명 | 용도 | 저장 위치 |
| --- | --- | --- |
| `VITE_PUBLIC_API_BASE_URL` | 배포된 브라우저가 호출할 공개 API 주소 | Vercel |
| `VITE_USE_MOCK` | mock 모드 사용 여부 | Vercel 또는 로컬 |
| `DEV_PROXY_TARGET` | 로컬 `vite` dev server가 `/api`를 프록시할 대상 | `.env.local` |

### 3.2 예시

로컬 개발 예시:

```env
VITE_USE_MOCK=true
VITE_PUBLIC_API_BASE_URL=
DEV_PROXY_TARGET=http://127.0.0.1:8080
```

배포 예시:

```env
VITE_USE_MOCK=false
VITE_PUBLIC_API_BASE_URL=https://api.example.com
```

### 3.3 주의사항

- WSL IP나 개인 PC의 로컬 IP를 장기 운영용 값으로 유지하지 않는다.
- Vercel production에 `127.0.0.1`, `localhost`, 사설 IP를 넣는 것은 임시 테스트 외에는 금지한다.
- Preview와 Production은 분리해서 생각한다.

---

## 4. Vercel 프로젝트 확인 경로

### 4.1 프로젝트 진입

1. [Vercel Dashboard](https://vercel.com/dashboard)에 접속
2. 프로젝트 `task-automation-ui` 선택

### 4.2 자주 쓰는 메뉴

- `Deployments`
  - 배포 이력
  - 배포 상태
  - 실패 원인
  - 재배포
- `Settings > Environment Variables`
  - Production / Preview / Development 별 환경변수 관리
- `Settings > Git`
  - GitHub 연결 상태
  - 배포 브랜치 정책
- `Settings > Domains`
  - 실제 도메인 연결
- `Settings > Functions` 또는 관련 관측 메뉴
  - 런타임 로그 확인
- `Settings > Members` 또는 팀 설정
  - 프로젝트 접근 권한 확인

예시 화면:
![Vercel 프로젝트 개요](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/project-overview.png)

---

## 5. 환경변수 설정 방법

### 5.1 대시보드에서 설정

경로:
1. 프로젝트 선택
2. `Settings`
3. `Environment Variables`

설정 원칙:
- `Production`과 `Preview`를 구분해서 입력한다.
- 실운영 API 주소는 `Production`에만 넣고, 필요하면 `Preview`는 mock 또는 staging API를 사용한다.

예시 화면:
![Vercel 환경변수 목록](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/environment-variables.png)

### 5.2 변수 변경 후 해야 하는 일

- 환경변수는 보통 빌드 시 반영된다.
- 값을 바꿨으면 새 배포를 다시 생성해야 한다.

체크:
- 변경 후 `Deployments`에서 가장 최신 배포가 생성되었는지 확인
- 실제 브라우저에서 네트워크 요청 주소가 변경됐는지 확인

---

## 6. 배포 확인 방법

### 6.1 배포 목록 확인

경로:
- 프로젝트 `Deployments`

여기서 확인할 것:
- 배포 시각
- 배포 브랜치
- 배포 상태
- 배포 URL
- Production / Preview 구분

예시 화면:
![Vercel 배포 목록](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/deployments-list.png)

### 6.2 배포 실패 시 확인 포인트

- 빌드 단계 실패인지
- 환경변수 누락인지
- 타입 오류인지
- lint 오류인지
- 외부 API 주소 또는 네트워크 설정 문제인지

예시 화면:
![Vercel 배포 상세](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/deployment-detail.png)

### 6.3 롤백 관점에서 볼 것

Vercel은 이전 배포 이력이 남기 때문에, 문제가 생기면 이전 정상 배포를 다시 기준점으로 확인할 수 있다.

팀 운영 체크:
- 마지막 정상 배포 URL을 기록한다.
- 배포 장애 시 어떤 커밋부터 깨졌는지 확인한다.
- Production에 올리기 전 Preview에서 먼저 확인한다.

---

## 7. 로그와 관측 확인

### 7.1 무엇을 로그로 볼 수 있는가

프론트 기준으로 주로 확인하는 것은 다음이다.

- 빌드 로그
- 배포 로그
- 런타임 에러
- 네트워크 실패

### 7.2 어디서 보는가

1. `Deployments`에서 특정 배포 선택
2. 해당 배포 상세에서 빌드 로그 확인
3. 필요 시 Vercel의 런타임/관측 메뉴에서 요청 로그 확인

예시 화면:
![Vercel 관측 화면](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/observability.png)

### 7.3 프론트에서 추가로 같이 봐야 하는 것

- 브라우저 개발자도구 `Console`
- 브라우저 개발자도구 `Network`

예시:
- `403`: 보통 CORS, 권한, 보호 설정 문제
- `404`: 프론트가 호출한 리소스 자체가 없음
- `ERR_CONNECTION_REFUSED`: API 서버 주소는 맞지만 서버가 꺼져 있음

---

## 8. 접근 제어와 배포 보호

### 8.1 팀 공유 프로젝트 기준

아래 항목을 반드시 점검한다.

- 누가 Vercel 프로젝트를 볼 수 있는지
- 누가 환경변수를 수정할 수 있는지
- 누가 Production 배포를 트리거할 수 있는지
- Preview 배포가 외부 공개인지, 보호 상태인지

### 8.2 보호가 필요한 경우

다음 상황에서는 배포 보호를 적극 검토한다.

- 내부 도구라 외부 공개가 불필요할 때
- Preview에 실제 운영 API가 연결될 수 있을 때
- 테스트 데이터라도 민감할 수 있을 때

예시 화면:
![Vercel 배포 보호 설정](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/deployment-protection.png)

### 8.3 팀 규칙 권장안

- Production env 수정 권한은 최소 인원만 가진다.
- Preview env는 운영 API 대신 staging 또는 mock을 우선 사용한다.
- 외부인이 볼 수 없는 internal preview가 필요하면 배포 보호를 켠다.

---

## 9. GitHub 연동 운영 원칙

### 9.1 기본 원칙

- `main` 브랜치는 Production 기준으로 본다.
- PR 또는 기능 브랜치는 Preview 배포 기준으로 본다.

### 9.2 체크 포인트

- GitHub 연결이 끊기지 않았는지
- 올바른 저장소가 연결되어 있는지
- 자동 Preview가 생성되는지
- push 이후 예상한 브랜치에서 배포가 생성되는지

예시 화면:
![Vercel Git 연결 설정](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/git-settings.png)

도메인 연결 예시:
![Vercel 도메인 설정](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/domains.png)

프로젝트 권한 예시:
![Vercel 프로젝트 멤버 설정](C:/Users/user/Desktop/Final-front/task-automation-ui/docs/assets/vercel/project-members.png)

### 9.3 실수 방지

- 임시 개인 저장소가 아니라 팀 저장소를 연결했는지 확인
- 수동 claim 방식 임시 프로젝트는 정리
- Preview와 Production URL을 혼동하지 않기

---

## 10. 보안 체크리스트

### 10.1 환경변수

- `VITE_` 변수에 비밀값이 없는가
- API 주소에 개인 장비 IP를 장기 운영값으로 쓰고 있지 않은가
- `.env.local`이 Git에 올라가지 않도록 `.gitignore`에 포함되어 있는가

### 10.2 배포

- Production에 테스트용 mock 설정이 들어가 있지 않은가
- Preview가 실제 운영 API를 바라보고 있지 않은가
- 배포 후 실제 네트워크 요청 주소가 의도와 같은가

### 10.3 접근 제어

- 프로젝트 멤버 권한이 최소 권한 원칙을 따르는가
- 환경변수 수정 권한이 제한되어 있는가
- 외부 공개가 불필요한 Preview는 보호되어 있는가

### 10.4 연동 보안

- Google OAuth, 외부 API secret, 서버 토큰은 프론트가 아니라 백엔드에 저장하는가
- 프론트는 비밀값이 아니라 공개 설정값만 알고 있는가
- 허용 Origin, redirect URI, callback URL이 실제 운영 도메인과 일치하는가

---

## 11. 팀 운영 체크리스트

배포 전:
- 필요한 env가 모두 설정되어 있는지 확인
- Preview에서 UI와 API 연결 상태 확인
- 브라우저 `Console`, `Network` 확인

배포 후:
- 최신 deployment가 정상 완료됐는지 확인
- Production URL에서 주요 화면 진입 확인
- API 요청 주소와 응답 코드 확인

문제 발생 시:
- 최근 변경 커밋 확인
- env 변경 이력 확인
- 빌드 로그 확인
- 브라우저 네트워크 실패 원인 분류

---

## 12. 스크린샷 캡처 권장 지점

이 문서에 실제 캡처를 붙일 경우 아래 화면만 우선 사용한다.

- 프로젝트 메인 `Deployments` 화면
- `Settings > Environment Variables`
- `Settings > Git`
- 로그/배포 상세 화면

주의:
- env 값 자체는 보이지 않게 한다
- 이메일, 토큰, 내부 URL, 개인 정보는 가린다
- 비밀값 입력 모달은 캡처하지 않는다

---

## 13. 현재 저장소 기준 결론

현재 `front-vibe` 프론트는 다음 원칙으로 운영한다.

- 실제 값은 Git이 아니라 Vercel env에 둔다
- 로컬 개발용 값은 `.env.local`에 둔다
- `VITE_` 값은 공개 설정값만 사용한다
- mock/live 모드는 `VITE_USE_MOCK`으로 명시한다
- 배포 API 주소는 `VITE_PUBLIC_API_BASE_URL`로 관리한다

이 원칙을 벗어나는 설정은 임시 테스트일 수는 있어도 장기 운영 표준으로 삼지 않는다.
