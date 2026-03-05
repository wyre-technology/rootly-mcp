import { describe, it, expect, beforeEach } from 'vitest';
import { alertsHandler } from '../../src/domains/alerts.js';

beforeEach(() => {
  process.env.ROOTLY_API_TOKEN = 'test-token';
});

describe('alerts domain', () => {
  it('list — returns alert data', async () => {
    const result = await alertsHandler.handleCall('rootly_alerts_list', {});
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data).toHaveLength(2);
    expect(parsed.data[0].attributes.summary).toBe('High CPU on web-01');
  });

  it('list — passes status filter', async () => {
    const result = await alertsHandler.handleCall('rootly_alerts_list', { status: 'triggered' });
    expect(result.isError).toBeFalsy();
  });

  it('acknowledge — returns updated alert', async () => {
    const result = await alertsHandler.handleCall('rootly_alerts_acknowledge', { alert_id: 'alert-1' });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.status).toBe('acknowledged');
  });

  it('resolve — returns resolved alert', async () => {
    const result = await alertsHandler.handleCall('rootly_alerts_resolve', { alert_id: 'alert-1' });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.status).toBe('resolved');
  });

  it('create — returns new alert', async () => {
    const result = await alertsHandler.handleCall('rootly_alerts_create', {
      summary: 'Test alert',
      source: 'test',
      severity: 'warning',
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.id).toBe('alert-new');
    expect(parsed.data.attributes.summary).toBe('Test alert');
  });

  it('update — returns updated alert', async () => {
    const result = await alertsHandler.handleCall('rootly_alerts_update', {
      alert_id: 'alert-1',
      status: 'acknowledged',
      summary: 'Updated summary',
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.status).toBe('acknowledged');
  });

  it('unknown tool — returns error', async () => {
    const result = await alertsHandler.handleCall('rootly_alerts_bogus', {});
    expect(result.isError).toBe(true);
  });
});
