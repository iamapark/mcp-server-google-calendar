import { Tool } from "../types";

export const getTodayDate: Tool<{}> = {
  name: "getTodayDate",
  description: "오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다.",
  parameters: {},
  execute: async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    return {
      content: [
        {
          type: "text" as const,
          text: formattedDate,
        },
      ],
    };
  },
};
