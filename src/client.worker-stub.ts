// Worker/test stub for @wyre-technology/node-rootly
// Used in Cloudflare Worker build (via tsup alias) and Vitest tests.

export const request = async (_token: string, _path: string, _options?: unknown): Promise<unknown> => {
  throw new Error('@wyre-technology/node-rootly is not available in this environment');
};

export function _resetWriteWindow(): void {}

export class RootlyClient {}
export class RootlyError extends Error {}
export class AuthenticationError extends Error {}
export class ForbiddenError extends Error {}
export class NotFoundError extends Error {}
export class ValidationError extends Error {}
export class RateLimitError extends Error {}
export class ServerError extends Error {}
