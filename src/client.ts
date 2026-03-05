/**
 * Thin adapter — exposes raw request functions used by domain handlers,
 * delegating to @wyre-technology/node-rootly for the actual HTTP layer.
 *
 * Domain handlers import from here; the underlying implementation lives
 * in the node-rootly client library.
 */
import { request as _request } from '@wyre-technology/node-rootly';

export { RootlyClient } from '@wyre-technology/node-rootly';
export {
  RootlyError, AuthenticationError, ForbiddenError, NotFoundError,
  ValidationError, RateLimitError, ServerError,
} from '@wyre-technology/node-rootly';

export function getToken(): string {
  const token = process.env.ROOTLY_API_TOKEN;
  if (!token) throw new Error('ROOTLY_API_TOKEN environment variable is not set.');
  return token;
}

export function isConfigured(): boolean {
  return !!process.env.ROOTLY_API_TOKEN;
}

export async function rootlyGet(path: string, params?: Record<string, string>): Promise<unknown> {
  return _request(getToken(), path, { params });
}

export async function rootlyPost(path: string, data: unknown): Promise<unknown> {
  return _request(getToken(), path, { method: 'POST', body: data });
}

export async function rootlyPatch(path: string, data: unknown): Promise<unknown> {
  return _request(getToken(), path, { method: 'PATCH', body: data });
}

export async function rootlyPut(path: string, data: unknown): Promise<unknown> {
  return _request(getToken(), path, { method: 'PUT', body: data });
}

export async function rootlyDelete(path: string): Promise<unknown> {
  return _request(getToken(), path, { method: 'DELETE' });
}
