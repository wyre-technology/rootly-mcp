import type { DomainHandler, DomainName } from '../utils/types.js';

const domainCache = new Map<DomainName, DomainHandler>();

export async function getDomainHandler(domain: DomainName): Promise<DomainHandler> {
  const cached = domainCache.get(domain);
  if (cached) return cached;

  let handler: DomainHandler;
  switch (domain) {
    case 'incidents': {
      const { incidentsHandler } = await import('./incidents.js');
      handler = incidentsHandler;
      break;
    }
    case 'alerts': {
      const { alertsHandler } = await import('./alerts.js');
      handler = alertsHandler;
      break;
    }
    case 'schedules': {
      const { schedulesHandler } = await import('./schedules.js');
      handler = schedulesHandler;
      break;
    }
    case 'org': {
      const { orgHandler } = await import('./org.js');
      handler = orgHandler;
      break;
    }
    default:
      throw new Error(`Unknown domain: ${domain}`);
  }

  domainCache.set(domain, handler);
  return handler;
}
