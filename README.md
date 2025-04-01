# MCP Google Calendar Server

MCP(Model Context Protocol) 기반의 Google Calendar 통합 서버입니다. Claude Desktop과 같은 MCP 클라이언트에서 Google Calendar에 일정을 추가할 수 있도록 지원합니다.

## 기능

- Google OAuth 2.0 인증
- Google Calendar 일정 추가
- Google Calendar 일정 조회 (기간별 조회 지원)
- 오늘 날짜 조회
- 한국 시간대(KST) 지원
- 상세한 에러 처리 및 로깅

## 설치 방법

1. 저장소 클론

```bash
git clone [repository-url]
cd mcp-server-google-calendar
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정
   `.env` 파일을 생성하고 다음 내용을 추가합니다:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

## Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com)에서 새 프로젝트를 생성합니다.
2. Google Calendar API를 활성화합니다.
3. OAuth 2.0 클라이언트 ID를 생성합니다:
   - 애플리케이션 유형: "데스크톱 앱"
   - 생성된 클라이언트 ID와 시크릿을 `.env` 파일에 설정

## Claude Desktop 연동 설정

1. Claude Desktop 설치

   - [Claude Desktop 다운로드](https://claude.ai/download)
   - MCP 기능은 웹 버전이 아닌 데스크톱 앱에서만 사용 가능합니다.

2. MCP 서버 설정

   - `~/Library/Application Support/Claude/claude_desktop_config.json` 파일을 생성하고 다음 내용을 추가합니다:

   ```json
   {
     "mcp-server-google-calendar": {
       "command": "/usr/local/bin/node",
       "args": ["/{절대경로}/mcp-server-google-calendar/dist/main.js"],
       "env": {
         "GOOGLE_CLIENT_ID": "your_client_id",
         "GOOGLE_CLIENT_SECRET": "your_client_secret",
         "NODE_ENV": "production"
       }
     }
   }
   ```

   설정 항목 설명:

   - `command`: Node.js 실행 파일의 절대 경로
   - `args`: 실행할 JavaScript 파일의 절대 경로 (TypeScript 빌드 후 생성되는 파일)
   - `cwd`: 프로젝트의 작업 디렉토리 절대 경로
   - `env`: 환경 변수 설정
     - `GOOGLE_CLIENT_ID`: Google Cloud Console에서 생성한 클라이언트 ID
     - `GOOGLE_CLIENT_SECRET`: Google Cloud Console에서 생성한 클라이언트 시크릿
     - `NODE_ENV`: 실행 환경 설정

   > 주의: 위 예시는 현재 설치된 경로를 기준으로 작성되었습니다. 다른 환경에서는 해당 환경의 절대 경로로 수정해야 합니다.

3. 빌드 및 준비

   ```bash
   # TypeScript 컴파일
   npm run build

   # Node.js 실행 파일 위치 확인
   which node
   ```

4. Claude Desktop 재시작
   - 설정 적용을 위해 Claude Desktop을 재시작합니다.
   - 상태 아이콘을 클릭하여 서버 연결 상태를 확인할 수 있습니다.
   - 연결 문제 발생 시 로그를 확인합니다.

## 사용 가능한 도구

### googleAuthLogin

Google Calendar API 인증을 수행합니다.

```javascript
// Claude에서 사용 예시
tool("googleAuthLogin");
```

### addCalendarEvent

Google Calendar에 새로운 일정을 추가합니다.

```javascript
// Claude에서 사용 예시
tool("addCalendarEvent", {
  title: "회의",
  startTime: "2024-03-20 15:00", // YYYY-MM-DD HH:mm 형식
  duration: "60", // 분 단위
});
```

### listCalendarEvents

특정 기간의 Google Calendar 일정을 조회합니다.

```javascript
// Claude에서 사용 예시
tool("listCalendarEvents", {
  period: "2024-03-20~2024-03-27", // YYYY-MM-DD~YYYY-MM-DD 형식
});
```

### getTodayDate

오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다.

```javascript
// Claude에서 사용 예시
tool("getTodayDate");
```

## 디버깅

### 로그 확인

```bash
# 실시간 로그 확인
tail -n 20 -F ~/Library/Logs/Claude/mcp*.log
```

### 개발자 도구 활성화

1. 개발자 설정 파일 생성:

```bash
echo '{"allowDevTools": true}' > ~/Library/Application\ Support/Claude/developer_settings.json
```

2. 개발자 도구 열기: `Command-Option-Shift-i`

## 에러 처리

서버는 다음과 같은 상황에서 적절한 에러 메시지를 반환합니다:

- Google 인증이 필요한 경우
- 잘못된 시간 형식이 입력된 경우
- 필수 파라미터가 누락된 경우
- Google Calendar API 호출 실패 시

## 로깅

서버는 Pino 로거를 사용하여 다음 정보를 기록합니다:

- 서버 시작/종료
- 도구 호출 및 응답
- 인증 프로세스
- 에러 및 예외 상황

## 개발 환경 설정

1. TypeScript 컴파일

```bash
npm run build
```

2. 개발 모드 실행 (자동 재시작)

```bash
npm run dev
```

3. 린트 검사

```bash
npm run lint
```

## 문제 해결

1. 서버 연결 문제

   - Claude Desktop 로그 확인
   - 서버 프로세스 실행 상태 확인
   - 환경 변수 설정 확인
   - 절대 경로 사용 여부 확인

2. 인증 문제
   - Google Cloud Console에서 API 활성화 상태 확인
   - 클라이언트 ID와 시크릿 재확인
   - OAuth 동의 화면 설정 확인

## 라이선스

MIT License
