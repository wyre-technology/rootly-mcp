import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule, CallToolResult } from '../utils/types.js';
import { rootlyGet } from '../client.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(msg: string): CallToolResult {
  return { content: [{ type: 'text', text: msg }], isError: true };
}

export const usersModule: ToolModule = {
  getTools(): Tool[] {
    return [
      {
        name: 'rootly_get_current_user',
        description: 'Get the current authenticated Rootly user (verifies token, shows user details)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  },

  async handleCall(toolName: string, _args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      if (toolName === 'rootly_get_current_user') {
        // Rootly uses /v1/users/me for current user
        return ok(await rootlyGet('/users/me'));
      }
      return err(`Unknown user tool: ${toolName}`);
    } catch (e) {
      return err((e as Error).message);
    }
  },
};
