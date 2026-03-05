import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { incidentsModule } from './tools/incidents.js';
import { alertsModule } from './tools/alerts.js';
import { schedulesModule } from './tools/schedules.js';
import { teamsModule } from './tools/teams.js';
import { severitiesModule } from './tools/severities.js';
import { usersModule } from './tools/users.js';
import { logger } from './utils/logger.js';
import type { ToolModule } from './utils/types.js';

const MODULES: ToolModule[] = [
  incidentsModule,
  alertsModule,
  schedulesModule,
  teamsModule,
  severitiesModule,
  usersModule,
];

// Build a flat tool→module lookup at startup
const toolRegistry = new Map<string, ToolModule>();
for (const mod of MODULES) {
  for (const tool of mod.getTools()) {
    toolRegistry.set(tool.name, mod);
  }
}

export function createServer(): Server {
  const server = new Server(
    { name: 'rootly-mcp', version: '1.0.0' },
    {
      capabilities: {
        tools: {},
        logging: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = MODULES.flatMap((m) => m.getTools());
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const mod = toolRegistry.get(name);

    if (!mod) {
      return {
        content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }

    try {
      return await mod.handleCall(name, (args || {}) as Record<string, unknown>);
    } catch (error) {
      logger.error('Tool call failed', { tool: name, error: (error as Error).message });
      return {
        content: [{ type: 'text' as const, text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  });

  return server;
}
