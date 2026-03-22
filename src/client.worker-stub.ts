// Worker stub for @wyre-technology/node-rootly
// The Cloudflare Worker uses native fetch directly; this module is not used at runtime.
// This stub exists only to satisfy the TypeScript/esbuild module resolution in the Worker build.

export const request = async (_token: string, _path: string, _options?: unknown): Promise<unknown> => {
  throw new Error('@wyre-technology/node-rootly is not available in Cloudflare Worker environment');
};

export class RootlyClient {}
export class RootlyError extends Error {}
export class AuthenticationError extends Error {}
export class ForbiddenError extends Error {}
export class NotFoundError extends Error {}
export class ValidationError extends Error {}
export class RateLimitError extends Error {}
export class ServerError extends Error {}
