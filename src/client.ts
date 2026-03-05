import { logger } from './utils/logger.js';
import { checkWriteRateLimit } from './utils/rate-limiter.js';
import {
  AuthenticationError, ForbiddenError, NotFoundError,
  ValidationError, RateLimitError, ServerError, RootlyError,
} from './utils/errors.js';

const ROOTLY_BASE_URL = 'https://api.rootly.com/v1';

export function getToken(): string {
  const token = process.env.ROOTLY_API_TOKEN;
  if (!token) {
    throw new Error('ROOTLY_API_TOKEN environment variable is not set.');
  }
  return token;
}

export function isConfigured(): boolean {
  return !!process.env.ROOTLY_API_TOKEN;
}

/**
 * SAFE: Read body as text first, then JSON.parse.
 * Never response.json() + response.text() — "Body already read" error.
 */
async function handleResponse(res: Response): Promise<unknown> {
  // Read text once
  const rawText = await res.text();

  if (res.ok) {
    if (!rawText || res.status === 204) return null;
    try { return JSON.parse(rawText); }
    catch { return rawText; }
  }

  // Parse error body
  let responseBody: unknown;
  try { responseBody = JSON.parse(rawText); }
  catch { responseBody = rawText; }

  const detail = (responseBody as Record<string, unknown>)?.errors?.[0]?.detail as string ??
    (responseBody as Record<string, unknown>)?.error as string ??
    rawText;

  switch (res.status) {
    case 401: throw new AuthenticationError(`Unauthorized: ${detail}`, 401, responseBody);
    case 403: throw new ForbiddenError(`Forbidden: ${detail}`, 403, responseBody);
    case 404: throw new NotFoundError(`Not found: ${detail}`, 404, responseBody);
    case 422: throw new ValidationError(`Validation error: ${detail}`, 422, responseBody);
    case 429: throw new RateLimitError(`Rate limited: ${detail}`, 60, responseBody);
    case 500:
    case 502:
    case 503: throw new ServerError(`Server error ${res.status}: ${detail}`, res.status, responseBody);
    default:  throw new RootlyError(`API error ${res.status}: ${detail}`, res.status, responseBody);
  }
}

export async function rootlyGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const token = getToken();
  const url = new URL(`${ROOTLY_BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  logger.debug('GET', { url: url.toString() });
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.api+json',
    },
  });
  return handleResponse(res);
}

export async function rootlyPost(path: string, data: unknown): Promise<unknown> {
  const token = getToken();
  checkWriteRateLimit();
  logger.debug('POST', { path });
  const res = await fetch(`${ROOTLY_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function rootlyPatch(path: string, data: unknown): Promise<unknown> {
  const token = getToken();
  checkWriteRateLimit();
  logger.debug('PATCH', { path });
  const res = await fetch(`${ROOTLY_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
