# 개발자용 상세 스펙 문서

**프로젝트 개요:**

본 프로젝트는 사용자가 Claude 또는 ChatGPT와 같은 LLM 앱을 통해 자연어 형식으로 입력한 하루 일정을 Google Calendar에 자동으로 등록하는 MCP (Model Context Protocol) 서버를 개발하는 것을 목표로 합니다. MCP를 활용하여 LLM과 외부 서비스 (Google Calendar)를 효과적으로 연동하고, 자연스러운 사용자 경험을 제공하는 데 중점을 둡니다.

**1. 기능 요구사항 (Requirements):**

- **핵심 기능:**
  - 사용자는 Claude 또는 ChatGPT 앱을 통해 자연어 형식으로 하루 일정을 입력합니다. (예: "오늘 10시부터 2시간 동안 백엔드 팀 회의, 2시부터 45분 기능 구현").
  - MCP 서버는 Claude (MCP Client)로부터 일정 정보를 수신합니다.
  - MCP 서버는 수신된 일정 정보를 분석하고, Google Calendar API를 사용하여 사용자의 Google Calendar에 해당 일정을 등록합니다.
  - Google Calendar 일정 등록 성공 또는 실패 여부를 Claude (MCP Client)에게 응답합니다.
- **Google Calendar 연동:**
  - Google Calendar API 연동을 위해 OAuth 2.0 인증 방식을 사용합니다.
  - 사용자는 Google 계정으로 인증하고, Google Calendar 접근 권한을 MCP 서버에 부여해야 합니다.
  - MCP 서버는 Access Token과 Refresh Token을 안전하게 관리하여 Google Calendar API를 지속적으로 사용할 수 있도록 합니다.
- **자연어 입력 처리:**
  - 사용자는 자유로운 자연어 형식으로 하루 일정을 입력할 수 있어야 합니다.
  - MCP 서버는 자연어 입력에서 '일정 제목', '시작 시간', '일정 시간' 정보를 추출해야 합니다.
  - 만약 '일정 시간' 정보가 누락된 경우, MCP 서버는 사용자에게 "해당 일정을 처리하는데 몇 분 또는 몇 시간 정도 걸릴까요?"와 같은 질문을 통해 정보를 다시 요청해야 합니다.
- **오류 처리:**
  - Google Calendar API 호출 실패, 데이터 파싱 실패, 인증 실패 등 다양한 오류 상황에 대한 적절한 오류 처리 메커니즘을 구현해야 합니다.
  - 오류 발생 시, 사용자에게 친절하고 명확한 오류 메시지를 제공해야 합니다.

**2. 아키텍처 (Architecture Choices):**

- **MCP 서버 (Backend):**
  - **주요 역할:** Claude (MCP Client)로부터 일정 정보를 수신, Google Calendar API 연동, 일정 등록 로직 처리, 오류 처리.
  - **프로그래밍 언어:** TypeScript
  - **OAuth 2.0 인증:** `googleapis` 공식 라이브러리를 사용하여 OAuth 2.0 인증을 구현합니다.
  - **Tool:** `addCalendarEvent` Tool을 구현하여 Claude (MCP Client)에서 호출할 수 있도록 합니다.
- **Claude (MCP Client):**
  - **역할:** 사용자로부터 자연어 일정 입력을 받고, MCP 서버의 `addCalendarEvent` Tool을 호출하여 일정 정보를 전달합니다.
  - **프롬프트 설계:** Claude에게 적절한 프롬프트를 제공하여 사용자 입력으로부터 '일정 제목', '시작 시간', '일정 시간' 정보를 정확하게 추출하고, `addCalendarEvent` Tool 호출 시 필요한 파라미터 형태로 변환하도록 합니다.
- **Google Calendar API:**
  - Google Calendar에 일정 등록을 위해 Google Calendar API (v3)를 사용합니다.
  - OAuth 2.0 인증을 통해 API 접근 권한을 획득합니다.

**3. 데이터 처리 (Data Handling Details):**

- **입력 데이터:**
  - Claude (MCP Client)로부터 `addCalendarEvent` Tool 호출 시 JSON 형식으로 다음 파라미터를 수신합니다.
    - `title` (string): 일정 제목
    - `startTime` (string): 'YYYY-MM-DD HH:mm' 형식의 시작 시간 (description에 형식 명시)
    - `duration` (string): 분 단위의 일정 시간 (description에 '분 단위' 명시)
- **데이터 유효성 검증:**
  - `zod` 라이브러리를 사용하여 `addCalendarEvent` Tool 입력 파라미터의 유효성을 검증합니다.
  - 특히 `startTime`과 `duration` 파라미터가 지정된 형식 및 단위에 맞는지 검증합니다.
- **Google Calendar 일정 등록 데이터:**
  - `addCalendarEvent` Tool 입력 파라미터를 기반으로 Google Calendar API에 필요한 형식으로 데이터를 변환하여 일정 등록 요청을 생성합니다.
  - `startTime`은 'YYYY-MM-DDTHH:mm:00+09:00' (한국 시간 기준)과 같은 RFC3339 형식으로 변환해야 할 수 있습니다. (Google Calendar API 문서 참고)
  - `duration`은 시작 시간과 종료 시간을 계산하여 Google Calendar API에 전달해야 합니다.

**4. 오류 처리 전략 (Error Handling Strategies):**

- **OAuth 2.0 인증 오류:**
  - 인증 실패 시, 사용자에게 인증 오류 메시지를 표시하고, 재인증 절차를 안내합니다.
  - Refresh Token 갱신 실패 시, 사용자에게 재인증을 요청하거나, 오류 로그를 기록하고 관리자에게 알립니다.
- **Google Calendar API 오류:**
  - API 호출 실패 (예: 네트워크 오류, 서버 오류, 권한 부족 등) 시, 오류 메시지를 기록하고, 사용자에게 일정 등록 실패 사실을 알립니다.
  - API 응답 코드를 분석하여 구체적인 오류 원인을 파악하고, 적절한 오류 메시지를 사용자에게 제공합니다.
- **데이터 파싱 오류:**
  - Claude (MCP Client)로부터 수신한 데이터가 예상된 형식이 아니거나, 필수 파라미터가 누락된 경우, 데이터 파싱 오류를 처리하고, Claude (MCP Client)에게 오류 응답을 반환합니다.
  - 자연어 입력에서 '일정 시간' 정보를 추출하지 못했을 경우, 사용자에게 다시 질문하는 로직을 구현합니다.
- **로그 기록:**
  - 오류, 경고, 중요한 이벤트 등을 로그 파일 또는 콘솔에 기록하여 문제 발생 시 추적 및 디버깅에 활용합니다.
  - 로그 레벨을 설정하여 (예: debug, info, warning, error) 로그 상세도를 조절할 수 있도록 합니다.

**5. 테스트 계획 (Testing Plan):**

- **단위 테스트 (Unit Tests):**
  - MCP 서버의 각 기능별 컴포넌트 (예: OAuth 2.0 인증, Google Calendar API 호출, 데이터 파싱, 오류 처리 등)에 대한 단위 테스트를 작성합니다.
  - `zod` 스키마 유효성 검증 로직에 대한 테스트를 포함합니다.
- **통합 테스트 (Integration Tests):**
  - Claude (MCP Client)와 MCP 서버 간의 연동 테스트를 수행합니다.
  - 실제 Google Calendar API를 호출하여 일정 등록 기능을 테스트합니다. (테스트 환경 또는 Mock API 활용 고려)
  - OAuth 2.0 인증 흐름 전체를 테스트합니다.
- **사용자 시나리오 테스트 (User Scenario Tests):**
  - 실제 사용자가 Claude 또는 ChatGPT 앱을 통해 다양한 자연어 형식으로 일정을 입력하고, Google Calendar에 정상적으로 등록되는지 E2E 테스트를 수행합니다.
  - 다양한 오류 상황 (예: 인증 실패, API 오류, 잘못된 입력 등)을 시뮬레이션하여 오류 처리 로직을 검증합니다.
- **UI/UX 테스트 (Claude Client 측면):** (본 스펙은 MCP 서버에 집중, Claude Client 테스트는 별도 계획 필요)
  - Claude 앱에서 사용자 입력 및 정보 요청/응답 과정이 자연스럽고 편리한지 검증합니다.
  - 오류 메시지가 사용자에게 명확하게 전달되는지 확인합니다.

**다음 단계:**

1. 본 스펙 문서 검토 및 개발팀 공유
2. 개발 환경 설정 (TypeScript, Node.js, `googleapis` 등)
3. MCP 서버 (TypeScript) 코드 개발 시작 (OAuth 2.0 인증, `addCalendarEvent` Tool 구현, Google Calendar API 연동)
4. 단위 테스트 및 통합 테스트 작성 및 실행
5. Claude (MCP Client) 연동 및 E2E 테스트
6. 배포 및 운영 환경 구축

**참고:**

- Google Calendar API v3 문서: [https://developers.google.com/calendar/api/v3/reference](https://developers.google.com/calendar/api/v3/reference)
- googleapis npm 패키지: [https://www.npmjs.com/package/googleapis](https://www.npmjs.com/package/googleapis)
- Model Context Protocol (MCP) 문서: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)

---

**본 스펙 문서를 검토하시고, 개발 시작 전에 궁금한 점이나 추가적으로 논의하고 싶은 부분이 있다면 언제든지 말씀해주세요.**
