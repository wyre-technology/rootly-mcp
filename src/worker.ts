import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from './server.js';
import { logger } from './utils/logger.js';

interface Env {
  ROOTLY_API_TOKEN: string;
  LOG_LEVEL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check — unauthenticated
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          transport: 'cloudflare-worker',
          timestamp: new Date().toISOString(),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url.pathname !== '/mcp') {
      return new Response(JSON.stringify({ error: 'Not found', endpoints: ['/mcp', '/health'] }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Inject credentials from Worker environment bindings
    process.env.ROOTLY_API_TOKEN = env.ROOTLY_API_TOKEN;
    if (env.LOG_LEVEL) process.env.LOG_LEVEL = env.LOG_LEVEL;

    // Stateless: one transport per request
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
    });

    const server = createServer();
    await server.connect(transport);

    logger.info('Cloudflare Worker handling request');
    return transport.handleRequest(request);
  },
} satisfies ExportedHandler<Env>;
