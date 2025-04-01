import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
// import { Logger } from "pino";
import { parseISO, addMinutes, formatISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export interface EventDetails {
  title: string;
  startTime: string; // 'YYYY-MM-DD HH:mm' 형식
  duration: string; // 분 단위
}

/**
 * Google Calendar에 이벤트를 생성합니다.
 */
export async function createGoogleCalendarEvent(
  authClient: OAuth2Client,
  eventDetails: EventDetails
  // logger: Logger
): Promise<{ id: string; htmlLink: string }> {
  try {
    // 시작 시간을 Date 객체로 변환 (한국 시간 기준)
    const startTime = new Date(eventDetails.startTime);

    // 종료 시간 계산
    const durationMinutes = parseInt(eventDetails.duration, 10);
    if (isNaN(durationMinutes)) {
      throw new Error("일정 시간은 숫자(분)로 변환 가능해야 합니다.");
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // Google Calendar API 클라이언트 초기화
    const calendar = google.calendar({ version: "v3", auth: authClient });

    // 이벤트 리소스 생성
    const event = {
      summary: eventDetails.title,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "Asia/Seoul",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "Asia/Seoul",
      },
    };

    // logger.debug({ event }, "캘린더 이벤트 생성 시도");

    // 이벤트 생성 API 호출
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    if (!response.data.id || !response.data.htmlLink) {
      throw new Error("이벤트 생성 응답에 필요한 데이터가 없습니다.");
    }

    // logger.info(
    //   { eventId: response.data.id, eventLink: response.data.htmlLink },
    //   "캘린더 이벤트가 성공적으로 생성되었습니다."
    // );

    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (err) {
    // logger.error({ err, eventDetails }, "캘린더 이벤트 생성 실패");
    throw new Error(
      `캘린더 이벤트 생성에 실패했습니다: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

/**
 * 특정 기간의 Google Calendar 이벤트를 조회합니다.
 */
export async function listGoogleCalendarEvents(
  authClient: OAuth2Client,
  period: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  }
) {
  const calendar = google.calendar({ version: "v3", auth: authClient });

  // 시작 날짜와 종료 날짜를 ISO 문자열로 변환
  const timeMin = new Date(`${period.startDate}T00:00:00+09:00`).toISOString();
  const timeMax = new Date(`${period.endDate}T23:59:59+09:00`).toISOString();

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin,
    timeMax: timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });

  return (
    response.data.items?.map((event) => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      status: event.status,
      htmlLink: event.htmlLink,
    })) || []
  );
}
