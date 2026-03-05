import { describe, it, expect, beforeEach } from 'vitest';
import { orgHandler } from '../../src/domains/org.js';

beforeEach(() => {
  process.env.ROOTLY_API_TOKEN = 'test-token';
});

describe('org domain — teams', () => {
  it('list teams', async () => {
    const result = await orgHandler.handleCall('rootly_org_teams_list', {});
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data[0].attributes.name).toBe('Platform Engineering');
  });

  it('get team by id', async () => {
    const result = await orgHandler.handleCall('rootly_org_teams_get', { team_id: 'team-1' });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.id).toBe('team-1');
  });

  it('create team', async () => {
    const result = await orgHandler.handleCall('rootly_org_teams_create', {
      name: 'New Team',
      description: 'Test team',
      color: '#10B981',
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.name).toBe('New Team');
    expect(parsed.data.attributes.color).toBe('#10B981');
  });

  it('update team (PUT — full replace)', async () => {
    const result = await orgHandler.handleCall('rootly_org_teams_update', {
      team_id: 'team-1',
      name: 'Platform Engineering Updated',
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.name).toBe('Platform Engineering Updated');
  });

  it('patch team (GET→merge→PUT — safe partial update)', async () => {
    const result = await orgHandler.handleCall('rootly_org_teams_patch', {
      team_id: 'team-1',
      description: 'New description only',
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    // Name should be preserved from the GET fetch
    expect(parsed.data.attributes.name).toBe('Platform Engineering');
    expect(parsed.data.attributes.description).toBe('New description only');
  });

  it('delete team', async () => {
    const result = await orgHandler.handleCall('rootly_org_teams_delete', { team_id: 'team-1' });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.deleted).toBe(true);
  });
});

describe('org domain — severities & user', () => {
  it('list severities', async () => {
    const result = await orgHandler.handleCall('rootly_org_severities_list', {});
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data[0].attributes.slug).toBe('sev1');
  });

  it('current user', async () => {
    const result = await orgHandler.handleCall('rootly_org_current_user', {});
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data.attributes.email).toBe('test@example.com');
  });
});
