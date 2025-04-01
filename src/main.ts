import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startAuthServer, stopAuthServer } from "./authServer";
import { initializeAuthClient } from "./googleAuth";
import {
  addCalendarEvent,
  googleAuthLogin,
  listCalendarEvents,
  getTodayDate,
} from "./tools";

async function run() {
  try {
    // OAuth 클라이언트 초기화
    await initializeAuthClient();

    // OAuth 콜백 서버 시작
    await startAuthServer();

    // MCP 서버 인스턴스 생성
    const server = new McpServer(
      {
        name: "mcp-server-google-calendar",
        version: "1.0.0",
      },
      {
        capabilities: {
          logging: {},
        },
      }
    );

    // Tool 등록
    server.tool(
      googleAuthLogin.name,
      googleAuthLogin.description,
      googleAuthLogin.parameters,
      googleAuthLogin.execute
    );

    server.tool(
      addCalendarEvent.name,
      addCalendarEvent.description,
      addCalendarEvent.parameters,
      addCalendarEvent.execute
    );

    server.tool(
      listCalendarEvents.name,
      listCalendarEvents.description,
      listCalendarEvents.parameters,
      listCalendarEvents.execute
    );

    server.tool(
      getTodayDate.name,
      getTodayDate.description,
      getTodayDate.parameters,
      getTodayDate.execute
    );

    // 서버 시작
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // 로깅은 stderr로 출력
    console.error("MCP 서버가 시작되었습니다.");
  } catch (error) {
    console.error("서버 시작 실패:", error);
    await stopAuthServer();
    process.exit(1);
  }
}

// 서버 실행
run().catch(async (error) => {
  console.error("예상치 못한 오류 발생:", error);
  await stopAuthServer();
  process.exit(1);
});
