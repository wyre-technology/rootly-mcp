export const fixtures = {
  alerts: {
    list: {
      data: [
        {
          id: 'alert-1',
          type: 'alerts',
          attributes: {
            summary: 'High CPU on web-01',
            status: 'triggered',
            source: 'datadog',
            severity: 'critical',
            created_at: '2026-03-05T10:00:00Z',
          },
        },
        {
          id: 'alert-2',
          type: 'alerts',
          attributes: {
            summary: 'Disk usage > 90% on db-02',
            status: 'acknowledged',
            source: 'prometheus',
            severity: 'warning',
            created_at: '2026-03-05T10:05:00Z',
          },
        },
      ],
      meta: { total_count: 2, current_page: 1 },
    },
    single: {
      data: {
        id: 'alert-1',
        type: 'alerts',
        attributes: {
          summary: 'High CPU on web-01',
          status: 'acknowledged',
          source: 'datadog',
          severity: 'critical',
          created_at: '2026-03-05T10:00:00Z',
        },
      },
    },
  },

  incidents: {
    list: {
      data: [
        {
          id: 'inc-1',
          type: 'incidents',
          attributes: {
            title: 'Production database down',
            status: 'started',
            created_at: '2026-03-05T09:00:00Z',
          },
        },
      ],
      meta: { total_count: 1, current_page: 1 },
    },
    single: {
      data: {
        id: 'inc-1',
        type: 'incidents',
        attributes: {
          title: 'Production database down',
          status: 'resolved',
          created_at: '2026-03-05T09:00:00Z',
        },
      },
    },
  },

  teams: {
    list: {
      data: [
        {
          id: 'team-1',
          type: 'teams',
          attributes: {
            name: 'Platform Engineering',
            description: 'Platform team',
            color: '#3B82F6',
            notify_emails: ['platform@example.com'],
          },
        },
      ],
      meta: { total_count: 1, current_page: 1 },
    },
    single: {
      data: {
        id: 'team-1',
        type: 'teams',
        attributes: {
          name: 'Platform Engineering',
          description: 'Platform team',
          color: '#3B82F6',
          notify_emails: ['platform@example.com'],
        },
      },
    },
  },

  user: {
    data: {
      id: 'user-1',
      type: 'users',
      attributes: {
        name: 'Test User',
        email: 'test@example.com',
      },
    },
  },

  severities: {
    data: [
      { id: 'sev-1', type: 'severities', attributes: { name: 'SEV1', slug: 'sev1', color: '#DC2626' } },
      { id: 'sev-2', type: 'severities', attributes: { name: 'SEV2', slug: 'sev2', color: '#F59E0B' } },
    ],
  },
};
