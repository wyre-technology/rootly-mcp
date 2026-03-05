import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule, CallToolResult } from '../utils/types.js';
import { rootlyGet } from '../client.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(msg: string): CallToolResult {
  return { content: [{ type: 'text', text: msg }], isError: true };
}

export const teamsModule: ToolModule = {
  getTools(): Tool[] {
    return [
      {
        name: 'rootly_list_teams',
        description: 'List Rootly teams',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Max results (default 25)' },
            page: { type: 'number', description: 'Page number (default 1)' },
          },
        },
      },
    ];
  },

  async handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      if (toolName === 'rootly_list_teams') {
        const params: Record<string, string> = {};
        if (args.limit) params['page[size]'] = String(args.limit);
        if (args.page) params['page[number]'] = String(args.page);
        return ok(await rootlyGet('/teams', params));
      }
      return err(`Unknown team tool: ${toolName}`);
    } catch (e) {
      return err((e as Error).message);
    }
  },
};
