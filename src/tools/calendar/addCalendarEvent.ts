import { z, ZodRawShape } from "zod";
import { Tool } from "../types";
import { createGoogleCalendarEvent } from "../../calendarService";
import { getAuthenticatedClient } from "../../googleAuth";

interface AddCalendarEventParams {
  title: string;
  startTime: string;
  duration: string;
}

export const addCalendarEvent: Tool<ZodRawShape> = {
  name: "addCalendarEvent",
  description: "Google Calendar에 새 일정을 추가합니다.",
  parameters: {
    title: z.string().describe("일정 제목"),
    startTime: z.string().describe("시작 시간 (YYYY-MM-DD HH:mm 형식)"),
    duration: z.string().describe("일정 시간 (분 단위)"),
  },
  execute: async ({ title, startTime, duration }) => {
    try {
      const authClient = getAuthenticatedClient();
      if (!authClient) {
        return {
          content: [
            {
              type: "text" as const,
              text: "❌ Google 계정 인증이 필요합니다.",
            },
            {
              type: "text" as const,
              text: "'googleAuthLogin' 도구를 먼저 실행하여 인증을 진행해주세요.",
            },
          ],
        };
      }

      const result = await createGoogleCalendarEvent(authClient, {
        title,
        startTime,
        duration,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ 일정이 성공적으로 등록되었습니다.\n일정 링크: ${result.htmlLink}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: "❌ 일정 등록 실패",
          },
          {
            type: "text" as const,
            text: `오류 내용: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  },
};
