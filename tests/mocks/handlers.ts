import { http, HttpResponse } from 'msw';
import { fixtures } from '../fixtures/index.js';

const BASE = 'https://api.rootly.com/v1';

export const handlers = [
  // ── Alerts ──────────────────────────────────────────────────────────
  http.get(`${BASE}/alerts`, () => HttpResponse.json(fixtures.alerts.list)),

  http.patch(`${BASE}/alerts/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    const attrs = (body?.data as Record<string, unknown>)?.attributes as Record<string, unknown>;
    return HttpResponse.json({
      data: {
        id: params.id,
        type: 'alerts',
        attributes: {
          ...fixtures.alerts.single.data.attributes,
          ...attrs,
        },
      },
    });
  }),

  http.post(`${BASE}/alerts`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const attrs = (body?.data as Record<string, unknown>)?.attributes as Record<string, unknown>;
    return HttpResponse.json(
      {
        data: {
          id: 'alert-new',
          type: 'alerts',
          attributes: { status: 'triggered', ...attrs },
        },
      },
      { status: 201 }
    );
  }),

  // ── Incidents ────────────────────────────────────────────────────────
  http.get(`${BASE}/incidents`, () => HttpResponse.json(fixtures.incidents.list)),

  http.get(`${BASE}/incidents/:id`, () => HttpResponse.json(fixtures.incidents.single)),

  http.post(`${BASE}/incidents`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const attrs = (body?.data as Record<string, unknown>)?.attributes as Record<string, unknown>;
    return HttpResponse.json(
      { data: { id: 'inc-new', type: 'incidents', attributes: { status: 'started', ...attrs } } },
      { status: 201 }
    );
  }),

  http.patch(`${BASE}/incidents/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    const attrs = (body?.data as Record<string, unknown>)?.attributes as Record<string, unknown>;
    return HttpResponse.json({
      data: {
        id: params.id,
        type: 'incidents',
        attributes: { ...fixtures.incidents.single.data.attributes, ...attrs },
      },
    });
  }),

  // ── Teams ────────────────────────────────────────────────────────────
  http.get(`${BASE}/teams`, () => HttpResponse.json(fixtures.teams.list)),

  http.get(`${BASE}/teams/:id`, () => HttpResponse.json(fixtures.teams.single)),

  http.post(`${BASE}/teams`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const attrs = (body?.data as Record<string, unknown>)?.attributes as Record<string, unknown>;
    return HttpResponse.json(
      { data: { id: 'team-new', type: 'teams', attributes: attrs } },
      { status: 201 }
    );
  }),

  http.put(`${BASE}/teams/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    const attrs = (body?.data as Record<string, unknown>)?.attributes as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, type: 'teams', attributes: attrs },
    });
  }),

  http.delete(`${BASE}/teams/:id`, () => new HttpResponse(null, { status: 204 })),

  // ── Org ──────────────────────────────────────────────────────────────
  http.get(`${BASE}/severities`, () => HttpResponse.json(fixtures.severities)),
  http.get(`${BASE}/users/me`, () => HttpResponse.json(fixtures.user)),

  // ── Schedules ────────────────────────────────────────────────────────
  http.get(`${BASE}/on_call_schedules`, () =>
    HttpResponse.json({ data: [], meta: { total_count: 0 } })
  ),
];
