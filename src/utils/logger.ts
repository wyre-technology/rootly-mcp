const isDev = process.env.NODE_ENV === 'development' || process.env.ROOTLY_DEBUG === '1';

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (isDev) process.stderr.write(`[rootly-mcp] INFO  ${msg} ${meta ? JSON.stringify(meta) : ''}\n`);
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    process.stderr.write(`[rootly-mcp] WARN  ${msg} ${meta ? JSON.stringify(meta) : ''}\n`);
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    process.stderr.write(`[rootly-mcp] ERROR ${msg} ${meta ? JSON.stringify(meta) : ''}\n`);
  },
};
