import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export type CallToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export interface ToolModule {
  getTools(): Tool[];
  handleCall(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<CallToolResult>;
}
