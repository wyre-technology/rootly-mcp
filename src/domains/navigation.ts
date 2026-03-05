import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainName, NavigationState } from '../utils/types.js';

// Per-session navigation state (per-process for stdio, per-session for HTTP)
const sessionStates = new Map<string, NavigationState>();

export function getState(sessionId: string = 'default'): NavigationState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, { currentDomain: null });
  }
  return sessionStates.get(sessionId)!;
}

export function getNavigationTools(): Tool[] {
  return [
    {
      name: 'rootly_navigate',
      description:
        'Navigate to a Rootly domain to see its available tools. ' +
        'Domains: incidents, alerts, schedules, org (teams/severities/user).',
      inputSchema: {
        type: 'object',
        required: ['domain'],
        properties: {
          domain: {
            type: 'string',
            enum: ['incidents', 'alerts', 'schedules', 'org'],
            description: 'The domain to navigate to',
          },
        },
      },
    },
    {
      name: 'rootly_status',
      description: 'Check Rootly API connection status and available domains.',
      inputSchema: { type: 'object', properties: {} },
    },
  ];
}

export function getBackTool(): Tool {
  return {
    name: 'rootly_back',
    description: 'Return to the Rootly domain navigation menu.',
    inputSchema: { type: 'object', properties: {} },
  };
}

export const DOMAIN_DESCRIPTIONS: Record<DomainName, string> = {
  incidents: 'Create, list, update, and resolve incidents',
  alerts: 'List, acknowledge, resolve, create, and update alerts',
  schedules: 'View on-call schedules',
  org: 'Full team management (create/get/update/delete), severities, current user',
};
