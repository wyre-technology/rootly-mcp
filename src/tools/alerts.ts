import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule, CallToolResult } from '../utils/types.js';
import { rootlyGet, rootlyPost, rootlyPatch } from '../client.js';

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(msg: string): CallToolResult {
  return { content: [{ type: 'text', text: msg }], isError: true };
}

export const alertsModule: ToolModule = {
  getTools(): Tool[] {
    return [
      {
        name: 'rootly_list_alerts',
        description: 'List Rootly alerts with optional status filter',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', description: 'Filter by status: triggered, acknowledged, resolved' },
            limit: { type: 'number', description: 'Max results per page (default 25)' },
            page: { type: 'number', description: 'Page number (default 1)' },
          },
        },
      },
      {
        name: 'rootly_acknowledge_alert',
        description: 'Acknowledge a Rootly alert',
        inputSchema: {
          type: 'object',
          required: ['alert_id'],
          properties: {
            alert_id: { type: 'string', description: 'Rootly alert ID' },
          },
        },
      },
      {
        name: 'rootly_resolve_alert',
        description: 'Resolve a Rootly alert',
        inputSchema: {
          type: 'object',
          required: ['alert_id'],
          properties: {
            alert_id: { type: 'string', description: 'Rootly alert ID' },
          },
        },
      },
      {
        name: 'rootly_create_alert',
        description: 'Create a new Rootly alert',
        inputSchema: {
          type: 'object',
          required: ['summary'],
          properties: {
            summary: { type: 'string', description: 'Alert summary' },
            source: { type: 'string', description: 'Alert source' },
            severity: { type: 'string', description: 'Severity: critical, warning, info' },
          },
        },
      },
      {
        name: 'rootly_update_alert',
        description: 'Update an existing Rootly alert',
        inputSchema: {
          type: 'object',
          required: ['alert_id'],
          properties: {
            alert_id: { type: 'string', description: 'Rootly alert ID' },
            status: { type: 'string', description: 'New status: triggered, acknowledged, resolved' },
            summary: { type: 'string', description: 'Updated summary' },
          },
        },
      },
    ];
  },

  async handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      switch (toolName) {
        case 'rootly_list_alerts': {
          const params: Record<string, string> = {};
          if (args.status) params['filter[status]'] = String(args.status);
          if (args.limit) params['page[size]'] = String(args.limit);
          if (args.page) params['page[number]'] = String(args.page);
          return ok(await rootlyGet('/alerts', params));
        }

        case 'rootly_acknowledge_alert': {
          return ok(await rootlyPatch(`/alerts/${args.alert_id}`, {
            data: {
              type: 'alerts',
              id: String(args.alert_id),
              attributes: { status: 'acknowledged' },
            },
          }));
        }

        case 'rootly_resolve_alert': {
          return ok(await rootlyPatch(`/alerts/${args.alert_id}`, {
            data: {
              type: 'alerts',
              id: String(args.alert_id),
              attributes: { status: 'resolved' },
            },
          }));
        }

        case 'rootly_create_alert': {
          const attrs: Record<string, unknown> = { summary: args.summary };
          if (args.source) attrs.source = args.source;
          if (args.severity) attrs.severity = args.severity;
          return ok(await rootlyPost('/alerts', {
            data: { type: 'alerts', attributes: attrs },
          }));
        }

        case 'rootly_update_alert': {
          const attrs: Record<string, unknown> = {};
          if (args.status) attrs.status = args.status;
          if (args.summary) attrs.summary = args.summary;
          return ok(await rootlyPatch(`/alerts/${args.alert_id}`, {
            data: {
              type: 'alerts',
              id: String(args.alert_id),
              attributes: attrs,
            },
          }));
        }

        default:
          return err(`Unknown alert tool: ${toolName}`);
      }
    } catch (e) {
      return err((e as Error).message);
    }
  },
};
