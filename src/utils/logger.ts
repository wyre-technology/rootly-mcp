// ALL output MUST go to stderr — stdout is reserved for MCP protocol (JSON-RPC)
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LEVELS;

function getConfiguredLevel(): LogLevel {
  const env = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return (env in LEVELS) ? env as LogLevel : 'info';
}

function log(level: LogLevel, message: string, context?: unknown): void {
  if (LEVELS[level] < LEVELS[getConfiguredLevel()]) return;
  const timestamp = new Date().toISOString();
  const prefix = `${timestamp} [rootly-mcp] [${level.toUpperCase()}]`;
  if (context !== undefined) {
    let ctx: string;
    try { ctx = JSON.stringify(context); }
    catch { ctx = String(context); }
    console.error(`${prefix} ${message} ${ctx}`);
  } else {
    console.error(`${prefix} ${message}`);
  }
}

export const logger = {
  debug: (msg: string, ctx?: unknown) => log('debug', msg, ctx),
  info:  (msg: string, ctx?: unknown) => log('info',  msg, ctx),
  warn:  (msg: string, ctx?: unknown) => log('warn',  msg, ctx),
  error: (msg: string, ctx?: unknown) => log('error', msg, ctx),
};
