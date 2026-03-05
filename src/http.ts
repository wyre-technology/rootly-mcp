import { createServer as createHttpServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createServer } from './server.js';
import { isConfigured } from './client.js';
import { logger } from './utils/logger.js';

const transports: Record<string, StreamableHTTPServerTransport> = {};

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

export function startHttpServer(): void {
  const port = parseInt(process.env.MCP_HTTP_PORT || '8080', 10);
  const host = process.env.MCP_HTTP_HOST || '0.0.0.0';

  const httpServer = createHttpServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    // Health check — unauthenticated
    if (url.pathname === '/health') {
      const statusCode = isConfigured() ? 200 : 503;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: isConfigured() ? 'ok' : 'degraded',
        transport: 'http',
        credentials: { configured: isConfigured() },
        timestamp: new Date().toISOString(),
      }));
      return;
    }

    if (url.pathname !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found', endpoints: ['/mcp', '/health'] }));
      return;
    }

    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    // POST — handle JSON-RPC messages
    if (req.method === 'POST') {
      const body = await readBody(req);
      const parsed = JSON.parse(body);

      if (sessionId && transports[sessionId]) {
        await transports[sessionId].handleRequest(req, res, parsed);
        return;
      }

      if (!sessionId && isInitializeRequest(parsed)) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true,
          onsessioninitialized: (sid) => { transports[sid] = transport; },
        });
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) delete transports[sid];
        };
        const server = createServer();
        await server.connect(transport);
        await transport.handleRequest(req, res, parsed);
        return;
      }

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Bad Request: missing or invalid session' },
        id: null,
      }));
      return;
    }

    // GET — SSE stream for server-initiated notifications
    if (req.method === 'GET') {
      if (!sessionId || !transports[sessionId]) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid or missing session ID');
        return;
      }
      await transports[sessionId].handleRequest(req, res);
      return;
    }

    // DELETE — terminate session
    if (req.method === 'DELETE') {
      if (!sessionId || !transports[sessionId]) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid or missing session ID');
        return;
      }
      await transports[sessionId].handleRequest(req, res);
      return;
    }

    res.writeHead(405).end();
  });

  httpServer.listen(port, host, () => {
    logger.info(`HTTP streaming server listening on ${host}:${port}`);
  });
}

// Entry point — check transport mode
if (process.env.MCP_TRANSPORT === 'http') {
  startHttpServer();
} else {
  // Default: stdio (import index.ts)
  await import('./index.js');
}
