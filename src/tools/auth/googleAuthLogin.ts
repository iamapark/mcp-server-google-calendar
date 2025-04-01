import { Tool } from "../types";
import { generateAuthUrl } from "../../googleAuth";
import { setAuthCompletionCallback } from "../../authServer";
import { ZodRawShape } from "zod";

export const googleAuthLogin: Tool<ZodRawShape> = {
  name: "googleAuthLogin",
  description: "Google 계정 인증을 시작합니다.",
  parameters: {},
  execute: async () => {
    return new Promise((resolve) => {
      // 인증 완료 콜백 설정
      setAuthCompletionCallback((success, error) => {
        if (success) {
          resolve({
            content: [
              {
                type: "text" as const,
                text: "✅ Google 계정 인증이 완료되었습니다.",
              },
            ],
          });
        } else {
          resolve({
            content: [
              {
                type: "text" as const,
                text: "❌ Google 계정 인증 실패",
              },
              {
                type: "text" as const,
                text: `오류 내용: ${error || "알 수 없는 오류"}`,
              },
              {
                type: "text" as const,
                text: "'googleAuthLogin' 도구를 다시 실행하여 재시도해주세요.",
              },
            ],
          });
        }
      });

      // 인증 URL 생성 및 반환
      const authUrl = generateAuthUrl();
      console.error("인증 URL이 브라우저에서 열립니다:", authUrl);

      // URL을 기본 브라우저에서 열기
      const start =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
          ? "start"
          : "xdg-open";
      require("child_process").exec(`${start} "${authUrl}"`);
    });
  },
};
