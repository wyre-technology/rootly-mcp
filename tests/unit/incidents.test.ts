import { describe, it, expect, beforeEach } from 'vitest';
import { incidentsHandler } from '../../src/domains/incidents.js';

beforeEach(() => {
  process.env.ROOTLY_API_TOKEN = 'test-token';
});

describe('incidents domain', () => {
  it('list — returns incident list', async () => {
    const result = await incidentsHandler.handleCall('rootly_incidents_list', {});
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data).toHaveLength(1);
    expect(parsed.data[0].attributes.title).toBe('Production database down');
  });

  it('get — returns single incident', async () => {
    const result = await incidentsHandler.handleCall('rootly_incidents_get', { incident_id: 'inc-1' });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.id).toBe('inc-1');
  });

  it('create — creates incident with title', async () => {
    const result = await incidentsHandler.handleCall('rootly_incidents_create', {
      title: 'New incident',
      summary: 'Something broke',
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.title).toBe('New incident');
    expect(parsed.data.attributes.status).toBe('started');
  });

  it('update — updates incident status', async () => {
    const result = await incidentsHandler.handleCall('rootly_incidents_update', {
      incident_id: 'inc-1',
      status: 'mitigated',
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.status).toBe('mitigated');
  });

  it('resolve — sets status to resolved', async () => {
    const result = await incidentsHandler.handleCall('rootly_incidents_resolve', {
      incident_id: 'inc-1',
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.status).toBe('resolved');
  });

  it('unknown tool — returns error', async () => {
    const result = await incidentsHandler.handleCall('rootly_incidents_bogus', {});
    expect(result.isError).toBe(true);
  });
});
