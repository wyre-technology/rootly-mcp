import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server.js';
// The write window lives in node-rootly now; import from there
import { _resetWriteWindow } from '@wyre-technology/node-rootly';

// Start MSW intercept server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// Reset handlers + rate-limit window between tests (prevent state bleed)
afterEach(() => {
  server.resetHandlers();
  _resetWriteWindow();
});
// Clean up after all tests
afterAll(() => server.close());
