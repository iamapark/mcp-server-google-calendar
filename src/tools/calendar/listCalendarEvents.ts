import { z, ZodRawShape } from "zod";
import { Tool } from "../types";
import { listGoogleCalendarEvents } from "../../calendarService";
import { getAuthenticatedClient } from "../../googleAuth";

// Period 형식 검증을 위한 정규식
const periodRegex = /^\d{4}-\d{2}-\d{2}~\d{4}-\d{2}-\d{2}$/;

interface ListCalendarEventsParams {
  period: string;
}

export const listCalendarEvents: Tool<ZodRawShape> = {
  name: "listCalendarEvents",
  description: "특정 기간의 Google Calendar 일정을 조회합니다.",
  parameters: {
    period: z
      .string()
      .regex(periodRegex, "기간은 'YYYY-MM-DD~YYYY-MM-DD' 형식이어야 합니다."),
  },
  execute: async ({ period }) => {
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

      const [startDate, endDate] = period.split("~");

      const events = await listGoogleCalendarEvents(authClient, {
        startDate,
        endDate,
      });

      if (events.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `📅 ${startDate} ~ ${endDate} 기간에 등록된 일정이 없습니다.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `📅 ${startDate} ~ ${endDate} 기간의 일정 목록`,
          },
          ...events.map((event) => ({
            type: "text" as const,
            text: `\n제목: ${event.summary}
시작: ${event.start}
종료: ${event.end}${event.description ? `\n설명: ${event.description}` : ""}
링크: ${event.htmlLink}
----------------------------------------`,
          })),
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: "❌ 일정 조회 실패",
          },
          {
            type: "text" as const,
            text: `오류 내용: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
          {
            type: "text" as const,
            text: "올바른 날짜 형식(YYYY-MM-DD~YYYY-MM-DD)으로 다시 시도해주세요.",
          },
        ],
      };
    }
  },
};
