import { describe, it, expect, beforeEach, vi } from 'vitest';

// We need to re-import the module fresh for each test to reset the window
describe('rate limiter', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('allows up to 3 writes in 60s window', async () => {
    const { checkWriteRateLimit } = await import('../../src/utils/rate-limiter.js');
    expect(() => checkWriteRateLimit()).not.toThrow();
    expect(() => checkWriteRateLimit()).not.toThrow();
    expect(() => checkWriteRateLimit()).not.toThrow();
  });

  it('throws on the 4th write in 60s window', async () => {
    const { checkWriteRateLimit } = await import('../../src/utils/rate-limiter.js');
    checkWriteRateLimit();
    checkWriteRateLimit();
    checkWriteRateLimit();
    expect(() => checkWriteRateLimit()).toThrow(/rate limit exceeded/i);
  });

  it('error message includes retry-after seconds', async () => {
    const { checkWriteRateLimit } = await import('../../src/utils/rate-limiter.js');
    checkWriteRateLimit();
    checkWriteRateLimit();
    checkWriteRateLimit();
    try {
      checkWriteRateLimit();
    } catch (e) {
      expect((e as Error).message).toMatch(/retry after/i);
    }
  });
});
