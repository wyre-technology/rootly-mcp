// Stub/shim for @wyre-technology/node-rootly
// Used for:
//   - Cloudflare Worker build (tsup alias): noExternal bundles everything but Node.js modules aren't available
//   - Vitest tests (vitest.config.ts alias): the published package has no dist/ files, so tests use this
//
// The `request` function mimics the real node-rootly request, using native fetch (interceptable by MSW).

const ROOTLY_BASE = 'https://api.rootly.com/v1';

export async function request(
  token: string,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    params?: Record<string, string>;
  }
): Promise<unknown> {
  const url = new URL(`${ROOTLY_BASE}${path}`);
  if (options?.params) {
    for (const [k, v] of Object.entries(options.params)) {
      url.searchParams.set(k, v);
    }
  }

  const response = await fetch(url.toString(), {
    method: options?.method ?? 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: options?.body != null ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

let _writeWindowOpen = true;
export function _resetWriteWindow(): void {
  _writeWindowOpen = true;
}

export class RootlyClient {}
export class RootlyError extends Error {}
export class AuthenticationError extends Error {}
export class ForbiddenError extends Error {}
export class NotFoundError extends Error {}
export class ValidationError extends Error {}
export class RateLimitError extends Error {}
export class ServerError extends Error {}
