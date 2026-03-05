import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { rootlyGet } from '../client.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(msg: string): CallToolResult {
  return { content: [{ type: 'text', text: msg }], isError: true };
}

function getTools(): Tool[] {
  return [
    {
      name: 'rootly_org_list_teams',
      description: 'List Rootly teams',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max results (default 25)' },
          page: { type: 'number', description: 'Page number (default 1)' },
        },
      },
    },
    {
      name: 'rootly_org_list_severities',
      description: 'List Rootly incident severity levels',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'rootly_org_current_user',
      description: 'Get the current authenticated Rootly user (verifies token)',
      inputSchema: { type: 'object', properties: {} },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  try {
    switch (toolName) {
      case 'rootly_org_list_teams': {
        const params: Record<string, string> = {};
        if (args.limit) params['page[size]'] = String(args.limit);
        if (args.page) params['page[number]'] = String(args.page);
        return ok(await rootlyGet('/teams', params));
      }
      case 'rootly_org_list_severities':
        return ok(await rootlyGet('/severities'));
      case 'rootly_org_current_user':
        return ok(await rootlyGet('/users/me'));
      default:
        return err(`Unknown tool: ${toolName}`);
    }
  } catch (e) {
    return err((e as Error).message);
  }
}

export const orgHandler: DomainHandler = { getTools, handleCall };
