// import { google } from "googleapis";
// import { GoogleAuth } from "google-auth-library";
// import { Logger } from "pino";
// import { createGoogleCalendarEvent, EventDetails } from "../calendarService";

// // Mock googleapis
// jest.mock("googleapis", () => ({
//   google: {
//     calendar: jest.fn().mockReturnValue({
//       events: {
//         insert: jest.fn(),
//       },
//     }),
//   },
// }));

// // Mock logger
// const mockLogger: Logger = {
//   debug: jest.fn(),
//   info: jest.fn(),
//   error: jest.fn(),
// } as any;

// describe("Calendar Service", () => {
//   let mockAuthClient: jest.Mocked<GoogleAuth>;
//   let mockCalendar: jest.Mock;
//   let mockInsert: jest.Mock;

//   const mockEventDetails: EventDetails = {
//     title: "Test Event",
//     startTime: "2024-04-01 10:00",
//     duration: "60",
//   };

//   const mockResponse = {
//     data: {
//       id: "test-event-id",
//       htmlLink: "https://calendar.google.com/event?id=test-event-id",
//     },
//   };

//   beforeEach(() => {
//     // Mock 설정
//     mockInsert = jest.fn().mockResolvedValue(mockResponse);
//     mockCalendar = jest.fn().mockReturnValue({
//       events: {
//         insert: mockInsert,
//       },
//     });

//     (google.calendar as jest.Mock) = jest.fn().mockReturnValue({
//       events: {
//         insert: mockInsert,
//       },
//     });

//     mockAuthClient = {
//       getClient: jest.fn().mockResolvedValue({}),
//     } as unknown as jest.Mocked<GoogleAuth>;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("createGoogleCalendarEvent", () => {
//     it("이벤트를 성공적으로 생성해야 합니다", async () => {
//     const mockEventDetails: EventDetails = {
//       title: "테스트 일정",
//       startTime: "2024-04-01 10:00",
//       duration: "60",
//     };

//     it("이벤트를 성공적으로 생성해야 합니다", async () => {
//       const mockResponse = {
//         data: {
//           id: "test_event_id",
//           htmlLink: "https://calendar.google.com/event?id=test",
//         },
//       };

//       const calendarApi = google.calendar({
//         version: "v3",
//         auth: mockAuthClient,
//       });
//       (calendarApi.events.insert as jest.Mock).mockResolvedValue(mockResponse);

//       const result = await createGoogleCalendarEvent(
//         mockAuthClient,
//         mockEventDetails
//         // mockLogger
//       );

//       expect(result).toEqual({
//         id: mockResponse.data.id,
//         htmlLink: mockResponse.data.htmlLink,
//       });

//       expect(calendarApi.events.insert).toHaveBeenCalledWith({
//         calendarId: "primary",
//         requestBody: expect.objectContaining({
//           summary: mockEventDetails.title,
//           start: expect.any(Object),
//           end: expect.any(Object),
//         }),
//       });
//     });

//     it("잘못된 duration 형식에 대해 오류를 발생시켜야 합니다", async () => {
//       const invalidEventDetails = {
//         ...mockEventDetails,
//         duration: "잘못된 시간",
//       };

//       await expect(
//         createGoogleCalendarEvent(
//           mockAuthClient,
//           invalidEventDetails
//           // mockLogger
//         )
//       ).rejects.toThrow("일정 시간은 숫자(분)로 변환 가능해야 합니다.");
//     });

//     it("API 응답에 필요한 데이터가 없을 경우 오류를 발생시켜야 합니다", async () => {
//       const mockResponse = {
//         data: {}, // id와 htmlLink가 없는 응답
//       };

//       const calendarApi = google.calendar({
//         version: "v3",
//         auth: mockAuthClient,
//       });
//       (calendarApi.events.insert as jest.Mock).mockResolvedValue(mockResponse);

//       await expect(
//         createGoogleCalendarEvent(mockAuthClient, mockEventDetails)
//       ).rejects.toThrow("이벤트 생성 응답에 필요한 데이터가 없습니다.");
//     });

//     it("API 호출 실패 시 오류를 발생시켜야 합니다", async () => {
//       const mockError = new Error("API 호출 실패");
//       const calendarApi = google.calendar({
//         version: "v3",
//         auth: mockAuthClient,
//       });
//       (calendarApi.events.insert as jest.Mock).mockRejectedValue(mockError);

//       await expect(
//         createGoogleCalendarEvent(mockAuthClient, mockEventDetails)
//       ).rejects.toThrow("캘린더 이벤트 생성에 실패했습니다: API 호출 실패");
//     });
//   });
// });
