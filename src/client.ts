import { logger } from './utils/logger.js';
import { checkWriteRateLimit } from './utils/rate-limiter.js';

const ROOTLY_BASE_URL = 'https://api.rootly.com/v1';

export function getToken(): string {
  const token = process.env.ROOTLY_API_TOKEN;
  if (!token) {
    throw new Error('ROOTLY_API_TOKEN environment variable is not set.');
  }
  return token;
}

async function handleResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed?.errors?.[0]?.detail ?? parsed?.error ?? text;
    } catch {}
    throw new Error(`Rootly API error ${res.status}: ${detail}`);
  }
  if (!text || res.status === 204) return null;
  return JSON.parse(text);
}

export async function rootlyGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const token = getToken();
  const url = new URL(`${ROOTLY_BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  logger.info('GET', { url: url.toString() });
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
  logger.info('POST', { path });
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
  logger.info('PATCH', { path });
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
