## MCP 서버 개발 상세 블루프린트 (Stdio, Device Flow 인증 포함, 한국어)

**프로젝트 개요:**

사용자가 Claude/ChatGPT와 같은 LLM 앱을 통해 자연어로 입력한 일정을 Google Calendar에 등록하는 **독립 실행형 MCP(Model Context Protocol) 서버**를 개발합니다. `@modelcontextprotocol/sdk` 와 `StdioServerTransport` 를 사용하여 표준 입출력(stdio)으로 LLM 환경과 통신합니다. Google Calendar API 연동 및 **애플리케이션 내장 Google OAuth 2.0 Device Flow**를 통한 사용자 인증을 구현합니다.

**핵심 변경 사항:**

- **HTTP 서버 불필요:** 이전 stdio 버전과 동일.
- **OAuth 방식 변경:** 사용자가 별도 인증하는 대신, **애플리케이션이 직접 Device Flow를 실행**하여 사용자 인증 및 토큰 획득/저장/갱신을 처리합니다. 이를 위해 별도의 `googleAuthLogin` MCP 도구를 제공합니다.
- **SDK 사용:** `@modelcontextprotocol/sdk` 를 계속 사용합니다.

---

### 단계별 개발 계획 (Iterative Breakdown)

**Phase 1: 기본 설정 및 핵심 모듈 구현 (Device Flow 인증 로직 추가)**

1.  **프로젝트 설정 및 기본 구조:**

    - Node.js 프로젝트 초기화 (`npm init -y`).
    - **의존성 설치:**
      - 실행: `@modelcontextprotocol/sdk`, `googleapis`, `zod`, `date-fns` (또는 `dayjs`), `dotenv`, `pino`, `axios` (Device Flow API 호출용).
      - 개발: `@types/node`, `typescript`, `ts-node`, `nodemon`, `pino-pretty`.
    - `tsconfig.json` 설정 (CommonJS 모듈 권장).
    - `package.json` 스크립트 설정 (build, dev, start).
    - **로거 설정:** `src/logger.ts` 파일 생성 및 `pino` 로거 설정.
    - `.gitignore` 설정 (`node_modules`, `dist`, `.env`, `token.json`).
    - _Test:_ TypeScript 컴파일 및 기본 로거 작동 확인.

2.  **Google 인증 모듈 (`src/googleAuth.ts`):**

    - `googleapis`, `dotenv`, `fs/promises`, `axios`, logger import.
    - `dotenv.config()` 호출. `.env` 파일에 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 설정 필수.
    - 모듈 레벨 `OAuth2Client` 인스턴스 생성.
    - `TOKEN_PATH` 상수 정의 (`'token.json'`).
    - `saveCredentialsToFile(creds)`, `loadCredentialsFromFile()` 비동기 함수 구현 (이전과 동일).
    - **`startDeviceFlow(logger)` 비동기 함수:**
      - `axios.post` 를 사용하여 `https://oauth2.googleapis.com/device/code` 엔드포인트 호출 (파라미터: `client_id`, `scope='https://www.googleapis.com/auth/calendar.events'`).
      - 성공 시 응답 데이터 (`device_code`, `user_code`, `verification_url`, `interval`, `expires_in`) 반환.
      - 실패 시 오류 로깅 및 throw.
    - **`pollForTokens(device_code, interval, expires_in, logger)` 비동기 함수:**
      - 지정된 `interval` 간격으로 `expires_in` 시간 동안 `https://oauth2.googleapis.com/token` 엔드포인트 폴링 (`axios.post`, 파라미터: `client_id`, `client_secret`, `device_code`, `grant_type='urn:ietf:params:oauth:grant-type:device_code'`).
      - 폴링 로직 구현 (반복 + `setTimeout` 또는 유사 기법):
        - 응답 상태 확인: `authorization_pending` (계속), `slow_down` (간격 증가 후 계속), `access_denied` (오류 throw), `expired_token` (오류 throw).
        - 성공 시 (토큰 객체 수신): `saveCredentialsToFile(tokens)` 호출 및 토큰 객체 반환.
      - 타임아웃 또는 최대 시도 횟수 도달 시 오류 throw.
    - **`initializeAuthClient(logger)` 비동기 함수:**
      - `loadCredentialsFromFile()` 호출하여 토큰 로드.
      - 토큰 로드 성공 시 `oAuth2Client.setCredentials(tokens)` 호출 및 `'tokens'` 이벤트 리스너 설정 (갱신된 토큰 저장).
    - **`getAuthenticatedClient()` 함수:**
      - 현재 `oAuth2Client` 인스턴스에 유효한 `access_token` 있는지 확인 후, 유효하면 `oAuth2Client` 반환, 아니면 `null` 반환.
    - _Test:_ `save/load` 유닛 테스트. `startDeviceFlow` 유닛 테스트 (axios 모킹). `pollForTokens` 유닛 테스트 (axios 모킹, 다양한 응답/타이밍 시나리오). `initializeAuthClient`, `getAuthenticatedClient` 유닛 테스트.

3.  **Google Calendar 서비스 모듈 (`src/calendarService.ts`):**
    - 이전 버전과 동일하게 `createGoogleCalendarEvent(authClient, eventDetails, logger)` 함수 구현.
    - _Test:_ 이전 버전과 동일한 유닛 테스트 수행.

**Phase 2: MCP 서버 설정 및 도구 구현 (인증 도구 추가)**

4.  **메인 애플리케이션 파일 (`src/main.ts`):**
    - 필수 모듈 import (MCP, Stdio, zod, logger, 인증 함수, calendar 함수).
    - `addCalendarEventParamsSchema` Zod 스키마 정의 (이전과 동일).
    - **`async function run()` 메인 실행 함수 정의:**
      - 로거 인스턴스 가져오기.
      - **`await initializeAuthClient(logger)` 호출 (중요!).**
      - `McpServer` 인스턴스 생성.
      - **`googleAuthLogin` 도구 정의 (`server.tool('googleAuthLogin', z.object({}), async (_) => { ... })`):**
        - 핸들러 내부 (`_` 는 빈 파라미터 의미):
          - `logger.info('Starting Google Authentication via Device Flow...');`
          - `try/catch` 로 감싸기:
            - `const deviceInfo = await startDeviceFlow(logger);` 호출.
            - **사용자 안내 메시지 생성 및 출력 (stdout 사용):**
              ```typescript
              const message = `\n=== Google 계정 인증 필요 ===\n1. 웹 브라우저에서 다음 주소로 이동하세요:\n   ${
                deviceInfo.verification_url
              }\n2. 화면에 다음 코드를 입력하세요:\n   ${
                deviceInfo.user_code
              }\n\n위 단계 완료 후 프로그램이 자동으로 인증을 완료할 때까지 잠시 기다려주세요...\n(이 메시지는 ${Math.floor(
                deviceInfo.expires_in / 60
              )}분 후에 만료됩니다)\n`;
              process.stdout.write(message); // 사용자에게 직접 안내 전달
              ```
            - `const tokens = await pollForTokens(deviceInfo.device_code, deviceInfo.interval, deviceInfo.expires_in, logger);` 호출.
            - **성공 시:** `getAuthenticatedClient()?.setCredentials(tokens);` 호출 (로드된 클라이언트에 새 토큰 설정), 성공 로깅 및 MCP 응답 반환:
              `return { content: [{ type: 'text', text: 'Google 인증에 성공했습니다. 이제 캘린더 관련 기능을 사용할 수 있습니다.' }] };`
          - **실패 시 (catch 블록):** 오류 로깅 및 `Error` throw (SDK가 처리):
            `logger.error({ err: error }, 'Google Authentication failed'); throw new Error('Google 인증에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));`
      - **`addCalendarEvent` 도구 정의 (`server.tool('addCalendarEvent', addCalendarEventParamsSchema, async (params) => { ... })`):**
        - 핸들러 내부:
          - `const authClient = getAuthenticatedClient();` 호출.
          - **인증 확인:** `if (!authClient) { throw new Error('Google 인증이 필요합니다. 먼저 \'googleAuthLogin\' 도구를 실행하여 인증해주세요.'); }`
          - `try/catch` 사용하여 `await createGoogleCalendarEvent(authClient, params, logger)` 호출 및 결과 처리 (성공 시 `content` 반환, 실패 시 `Error` throw - 이전 버전과 유사).
      - `StdioServerTransport` 생성 및 `server.connect(transport)` 호출.
    - **스크립트 최하단에서 `run().catch(...)` 호출** (전역 오류 처리).
    - _Test:_ 각 도구 핸들러 유닛 테스트 (인증/캘린더 서비스 모킹). 통합 테스트 (stdio 시뮬레이션): `googleAuthLogin` 호출 시 사용자 안내 메시지 출력 확인, `addCalendarEvent` 호출 시 인증 상태에 따른 분기 확인 및 성공/실패 시나리오.

**Phase 3: 문서화 및 마무리**

5.  **README.md 작성:**
    - 프로젝트 설명, 설치 방법, `.env` 설정 방법 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
    - **사용법:**
      - **1단계 (최초 1회 또는 필요시):** LLM에게 `googleAuthLogin` 도구 실행 요청. 화면(LLM 채팅창)에 표시되는 안내에 따라 웹 브라우저에서 인증 및 코드 입력 수행.
      - **2단계:** LLM에게 `addCalendarEvent` 도구 실행 요청 (일정 정보 포함).
    - 실행 방법 (`npm run build` 및 `npm start` 등).
6.  **최종 코드 검토:**
    - 로깅 메시지 명확성 및 상세 수준 확인.
    - Device Flow 사용자 안내 메시지 명확성 확인.
    - 오류 처리 로직 견고성 확인.
    - 코드 스타일 및 가독성 검토.

---

**핵심 고려사항 요약:**

- 이 블루프린트는 Stdio 기반 MCP 서버 내에서 Google OAuth Device Flow를 구현합니다.
- 별도의 `googleAuthLogin` 도구를 통해 사용자가 인증 프로세스를 시작하고 완료합니다.
- `addCalendarEvent` 도구는 인증 상태를 확인하고, 인증되지 않은 경우 `googleAuthLogin` 도구를 사용하도록 안내합니다.
- Device Flow 구현을 위해 `axios` 또는 유사 HTTP 클라이언트가 필요합니다.
- README 문서에 Device Flow 사용 절차를 명확하게 안내하는 것이 매우 중요합니다.
