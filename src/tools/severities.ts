import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule, CallToolResult } from '../utils/types.js';
import { rootlyGet } from '../client.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(msg: string): CallToolResult {
  return { content: [{ type: 'text', text: msg }], isError: true };
}

export const severitiesModule: ToolModule = {
  getTools(): Tool[] {
    return [
      {
        name: 'rootly_list_severities',
        description: 'List Rootly incident severity levels',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  },

  async handleCall(toolName: string, _args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      if (toolName === 'rootly_list_severities') {
        return ok(await rootlyGet('/severities'));
      }
      return err(`Unknown severity tool: ${toolName}`);
    } catch (e) {
      return err((e as Error).message);
    }
  },
};
