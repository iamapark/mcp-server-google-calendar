// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// import {
//   getAuthenticatedClient,
//   startDeviceFlow,
//   pollForTokens,
// } from "../googleAuth";
// import { createGoogleCalendarEvent } from "../calendarService";
// import { calendar_v3 } from "googleapis";

// // Mock 모듈들
// jest.mock("@modelcontextprotocol/sdk/server/mcp.js");
// jest.mock("@modelcontextprotocol/sdk/server/stdio.js");
// jest.mock("../googleAuth");
// jest.mock("../calendarService");
// jest.mock("../logger");

// describe("MCP Server Tests", () => {
//   let server: McpServer;

//   beforeEach(() => {
//     jest.clearAllMocks();

//     server = new McpServer({
//       name: "google-calendar",
//       version: "1.0.0",
//     });
//   });

//   describe("Server Initialization", () => {
//     it("서버가 StdioServerTransport와 연결되어야 합니다", async () => {
//       const transport = new StdioServerTransport();
//       await server.connect(transport);
//       expect(server.connect).toHaveBeenCalledWith(transport);
//     });
//   });

//   describe("googleAuthLogin Tool", () => {
//     it("인증 성공 시 적절한 응답을 반환해야 합니다", async () => {
//       // Mock device flow 응답
//       const mockDeviceInfo = {
//         device_code: "device_code",
//         user_code: "user_code",
//         verification_url: "https://example.com",
//         expires_in: 1800,
//         interval: 5,
//       };
//       (startDeviceFlow as jest.Mock).mockResolvedValue(mockDeviceInfo);

//       // Mock token 응답
//       const mockTokens = {
//         access_token: "access_token",
//         refresh_token: "refresh_token",
//       };
//       (pollForTokens as jest.Mock).mockResolvedValue(mockTokens);

//       // 도구 등록
//       server.tool("googleAuthLogin", {}, async () => {
//         const deviceInfo = await startDeviceFlow();
//         const tokens = await pollForTokens(
//           deviceInfo.device_code,
//           deviceInfo.interval,
//           deviceInfo.expires_in
//         );

//         const authClient = getAuthenticatedClient();
//         authClient?.setCredentials(tokens);

//         return {
//           content: [
//             {
//               type: "text",
//               text: "Google 인증에 성공했습니다. 이제 캘린더 관련 기능을 사용할 수 있습니다.",
//             },
//           ],
//         };
//       });

//       // 도구 실행 및 검증
//       const result = await server.tool("googleAuthLogin").handler({});
//       expect(startDeviceFlow).toHaveBeenCalled();
//       expect(pollForTokens).toHaveBeenCalledWith(
//         mockDeviceInfo.device_code,
//         mockDeviceInfo.interval,
//         mockDeviceInfo.expires_in
//       );
//       expect(result.content[0].text).toBe(
//         "Google 인증에 성공했습니다. 이제 캘린더 관련 기능을 사용할 수 있습니다."
//       );
//     });

//     it("인증 실패 시 에러를 던져야 합니다", async () => {
//       (startDeviceFlow as jest.Mock).mockRejectedValue(
//         new Error("Google 인증에 실패했습니다")
//       );

//       server.tool("googleAuthLogin", {}, async () => {
//         await startDeviceFlow();
//         return { content: [] };
//       });

//       await expect(server.tool("googleAuthLogin").handler({})).rejects.toThrow(
//         "Google 인증에 실패했습니다"
//       );
//     });
//   });

//   describe("addCalendarEvent Tool", () => {
//     const validEventParams = {
//       title: "테스트 일정",
//       startTime: "2024-03-20 15:00",
//       duration: "60",
//     };

//     it("유효한 파라미터로 일정이 생성되어야 합니다", async () => {
//       const mockAuthClient = {
//         setCredentials: jest.fn(),
//       };
//       (getAuthenticatedClient as jest.Mock).mockReturnValue(mockAuthClient);

//       const mockEventResult = {
//         id: "event123",
//         htmlLink: "https://calendar.google.com/event/123",
//       };
//       (createGoogleCalendarEvent as jest.Mock).mockResolvedValue(
//         mockEventResult
//       );

//       server.tool("addCalendarEvent", {}, async (params) => {
//         const authClient = getAuthenticatedClient();
//         if (!authClient) {
//           throw new Error("Google 인증이 필요합니다");
//         }

//         const result = await createGoogleCalendarEvent(authClient, params);
//         return {
//           content: [
//             {
//               type: "text",
//               text: `일정이 성공적으로 등록되었습니다.\n일정 링크: ${result.htmlLink}`,
//             },
//           ],
//         };
//       });

//       const result = await server
//         .tool("addCalendarEvent")
//         .handler(validEventParams);
//       expect(createGoogleCalendarEvent).toHaveBeenCalledWith(
//         mockAuthClient,
//         validEventParams
//       );
//       expect(result.content[0].text).toContain(
//         "일정이 성공적으로 등록되었습니다"
//       );
//       expect(result.content[0].text).toContain(mockEventResult.htmlLink);
//     });

//     it("인증되지 않은 상태에서 에러를 던져야 합니다", async () => {
//       (getAuthenticatedClient as jest.Mock).mockReturnValue(null);

//       server.tool("addCalendarEvent", {}, async (params) => {
//         const authClient = getAuthenticatedClient();
//         if (!authClient) {
//           throw new Error("Google 인증이 필요합니다");
//         }
//         return { content: [] };
//       });

//       await expect(
//         server.tool("addCalendarEvent").handler(validEventParams)
//       ).rejects.toThrow("Google 인증이 필요합니다");
//     });

//     it("잘못된 파라미터 형식으로 에러를 던져야 합니다", async () => {
//       const mockAuthClient = {
//         setCredentials: jest.fn(),
//       };
//       (getAuthenticatedClient as jest.Mock).mockReturnValue(mockAuthClient);
//       (createGoogleCalendarEvent as jest.Mock).mockRejectedValue(
//         new Error("잘못된 시간 형식입니다")
//       );

//       server.tool("addCalendarEvent", {}, async (params) => {
//         const authClient = getAuthenticatedClient();
//         if (!authClient) {
//           throw new Error("Google 인증이 필요합니다");
//         }
//         await createGoogleCalendarEvent(authClient, params);
//         return { content: [] };
//       });

//       const invalidParams = {
//         title: "테스트 일정",
//         startTime: "잘못된 시간 형식",
//         duration: "60",
//       };

//       await expect(
//         server.tool("addCalendarEvent").handler(invalidParams)
//       ).rejects.toThrow("잘못된 시간 형식입니다");
//     });
//   });
// });
