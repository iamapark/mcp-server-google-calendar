import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";

export type ToolResponse = {
  content: {
    type: "text";
    text: string;
  }[];
};

export interface Tool<T extends ZodRawShape> {
  name: string;
  description: string;
  parameters: T;
  execute: ToolCallback<T>;
}
