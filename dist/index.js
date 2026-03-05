#!/usr/bin/env node

// src/index.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// src/utils/logger.ts
var isDev = process.env.NODE_ENV === "development" || process.env.ROOTLY_DEBUG === "1";
var logger = {
  info: (msg, meta) => {
    if (isDev) process.stderr.write(`[rootly-mcp] INFO  ${msg} ${meta ? JSON.stringify(meta) : ""}
`);
  },
  warn: (msg, meta) => {
    process.stderr.write(`[rootly-mcp] WARN  ${msg} ${meta ? JSON.stringify(meta) : ""}
`);
  },
  error: (msg, meta) => {
    process.stderr.write(`[rootly-mcp] ERROR ${msg} ${meta ? JSON.stringify(meta) : ""}
`);
  }
};

// src/utils/rate-limiter.ts
var WRITE_LIMIT = 3;
var WINDOW_MS = 6e4;
var writeTimes = [];
function checkWriteRateLimit() {
  const now = Date.now();
  while (writeTimes.length > 0 && writeTimes[0] < now - WINDOW_MS) {
    writeTimes.shift();
  }
  if (writeTimes.length >= WRITE_LIMIT) {
    const oldest = writeTimes[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    throw new Error(
      `Rootly write rate limit exceeded (${WRITE_LIMIT} writes/60s). Retry after ${Math.ceil(retryAfterMs / 1e3)}s.`
    );
  }
  writeTimes.push(now);
}

// src/client.ts
var ROOTLY_BASE_URL = "https://api.rootly.com/v1";
function getToken() {
  const token = process.env.ROOTLY_API_TOKEN;
  if (!token) {
    throw new Error("ROOTLY_API_TOKEN environment variable is not set.");
  }
  return token;
}
async function handleResponse(res) {
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed?.errors?.[0]?.detail ?? parsed?.error ?? text;
    } catch {
    }
    throw new Error(`Rootly API error ${res.status}: ${detail}`);
  }
  if (!text || res.status === 204) return null;
  return JSON.parse(text);
}
async function rootlyGet(path, params) {
  const token = getToken();
  const url = new URL(`${ROOTLY_BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  logger.info("GET", { url: url.toString() });
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.api+json"
    }
  });
  return handleResponse(res);
}
async function rootlyPost(path, data) {
  const token = getToken();
  checkWriteRateLimit();
  logger.info("POST", { path });
  const res = await fetch(`${ROOTLY_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json"
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}
async function rootlyPatch(path, data) {
  const token = getToken();
  checkWriteRateLimit();
  logger.info("PATCH", { path });
  const res = await fetch(`${ROOTLY_BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json"
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

// src/tools/incidents.ts
function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err(msg) {
  return { content: [{ type: "text", text: msg }], isError: true };
}
var incidentsModule = {
  getTools() {
    return [
      {
        name: "rootly_list_incidents",
        description: "List Rootly incidents with optional filters",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string", description: "Filter by status: started, mitigated, resolved" },
            severity: { type: "string", description: "Filter by severity slug (e.g. sev1)" },
            limit: { type: "number", description: "Max results per page (default 25)" },
            page: { type: "number", description: "Page number (default 1)" }
          }
        }
      },
      {
        name: "rootly_get_incident",
        description: "Get a single Rootly incident by ID",
        inputSchema: {
          type: "object",
          required: ["incident_id"],
          properties: {
            incident_id: { type: "string", description: "Rootly incident ID" }
          }
        }
      },
      {
        name: "rootly_create_incident",
        description: "Create a new Rootly incident",
        inputSchema: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", description: "Incident title" },
            summary: { type: "string", description: "Short summary of the incident" },
            severity_id: { type: "string", description: "Severity ID to assign" },
            team_ids: {
              type: "array",
              items: { type: "string" },
              description: "List of team IDs to assign"
            }
          }
        }
      },
      {
        name: "rootly_update_incident",
        description: "Update an existing Rootly incident (title, summary, status, severity)",
        inputSchema: {
          type: "object",
          required: ["incident_id"],
          properties: {
            incident_id: { type: "string", description: "Rootly incident ID" },
            title: { type: "string" },
            summary: { type: "string" },
            status: { type: "string", description: "started | mitigated | resolved" },
            severity_id: { type: "string" }
          }
        }
      },
      {
        name: "rootly_resolve_incident",
        description: "Mark a Rootly incident as resolved",
        inputSchema: {
          type: "object",
          required: ["incident_id"],
          properties: {
            incident_id: { type: "string", description: "Rootly incident ID" }
          }
        }
      }
    ];
  },
  async handleCall(toolName, args) {
    try {
      switch (toolName) {
        case "rootly_list_incidents": {
          const params = {};
          if (args.status) params["filter[status]"] = String(args.status);
          if (args.severity) params["filter[severity_slug]"] = String(args.severity);
          if (args.limit) params["page[size]"] = String(args.limit);
          if (args.page) params["page[number]"] = String(args.page);
          return ok(await rootlyGet("/incidents", params));
        }
        case "rootly_get_incident": {
          return ok(await rootlyGet(`/incidents/${args.incident_id}`));
        }
        case "rootly_create_incident": {
          const attrs = { title: args.title };
          if (args.summary) attrs.summary = args.summary;
          if (args.severity_id) attrs.severity_id = args.severity_id;
          const payload = {
            data: {
              type: "incidents",
              attributes: attrs
            }
          };
          if (args.team_ids && Array.isArray(args.team_ids)) {
            payload.data.relationships = {
              teams: {
                data: args.team_ids.map((id) => ({ type: "teams", id }))
              }
            };
          }
          return ok(await rootlyPost("/incidents", payload));
        }
        case "rootly_update_incident": {
          const attrs = {};
          if (args.title) attrs.title = args.title;
          if (args.summary) attrs.summary = args.summary;
          if (args.status) attrs.status = args.status;
          if (args.severity_id) attrs.severity_id = args.severity_id;
          return ok(await rootlyPatch(`/incidents/${args.incident_id}`, {
            data: { type: "incidents", id: String(args.incident_id), attributes: attrs }
          }));
        }
        case "rootly_resolve_incident": {
          return ok(await rootlyPatch(`/incidents/${args.incident_id}`, {
            data: {
              type: "incidents",
              id: String(args.incident_id),
              attributes: { status: "resolved" }
            }
          }));
        }
        default:
          return err(`Unknown incident tool: ${toolName}`);
      }
    } catch (e) {
      return err(e.message);
    }
  }
};

// src/tools/alerts.ts
function ok2(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err2(msg) {
  return { content: [{ type: "text", text: msg }], isError: true };
}
var alertsModule = {
  getTools() {
    return [
      {
        name: "rootly_list_alerts",
        description: "List Rootly alerts with optional status filter",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string", description: "Filter by status: triggered, acknowledged, resolved" },
            limit: { type: "number", description: "Max results per page (default 25)" },
            page: { type: "number", description: "Page number (default 1)" }
          }
        }
      },
      {
        name: "rootly_acknowledge_alert",
        description: "Acknowledge a Rootly alert",
        inputSchema: {
          type: "object",
          required: ["alert_id"],
          properties: {
            alert_id: { type: "string", description: "Rootly alert ID" }
          }
        }
      },
      {
        name: "rootly_resolve_alert",
        description: "Resolve a Rootly alert",
        inputSchema: {
          type: "object",
          required: ["alert_id"],
          properties: {
            alert_id: { type: "string", description: "Rootly alert ID" }
          }
        }
      },
      {
        name: "rootly_create_alert",
        description: "Create a new Rootly alert",
        inputSchema: {
          type: "object",
          required: ["summary"],
          properties: {
            summary: { type: "string", description: "Alert summary" },
            source: { type: "string", description: "Alert source" },
            severity: { type: "string", description: "Severity: critical, warning, info" }
          }
        }
      },
      {
        name: "rootly_update_alert",
        description: "Update an existing Rootly alert",
        inputSchema: {
          type: "object",
          required: ["alert_id"],
          properties: {
            alert_id: { type: "string", description: "Rootly alert ID" },
            status: { type: "string", description: "New status: triggered, acknowledged, resolved" },
            summary: { type: "string", description: "Updated summary" }
          }
        }
      }
    ];
  },
  async handleCall(toolName, args) {
    try {
      switch (toolName) {
        case "rootly_list_alerts": {
          const params = {};
          if (args.status) params["filter[status]"] = String(args.status);
          if (args.limit) params["page[size]"] = String(args.limit);
          if (args.page) params["page[number]"] = String(args.page);
          return ok2(await rootlyGet("/alerts", params));
        }
        case "rootly_acknowledge_alert": {
          return ok2(await rootlyPatch(`/alerts/${args.alert_id}`, {
            data: {
              type: "alerts",
              id: String(args.alert_id),
              attributes: { status: "acknowledged" }
            }
          }));
        }
        case "rootly_resolve_alert": {
          return ok2(await rootlyPatch(`/alerts/${args.alert_id}`, {
            data: {
              type: "alerts",
              id: String(args.alert_id),
              attributes: { status: "resolved" }
            }
          }));
        }
        case "rootly_create_alert": {
          const attrs = { summary: args.summary };
          if (args.source) attrs.source = args.source;
          if (args.severity) attrs.severity = args.severity;
          return ok2(await rootlyPost("/alerts", {
            data: { type: "alerts", attributes: attrs }
          }));
        }
        case "rootly_update_alert": {
          const attrs = {};
          if (args.status) attrs.status = args.status;
          if (args.summary) attrs.summary = args.summary;
          return ok2(await rootlyPatch(`/alerts/${args.alert_id}`, {
            data: {
              type: "alerts",
              id: String(args.alert_id),
              attributes: attrs
            }
          }));
        }
        default:
          return err2(`Unknown alert tool: ${toolName}`);
      }
    } catch (e) {
      return err2(e.message);
    }
  }
};

// src/tools/schedules.ts
function ok3(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err3(msg) {
  return { content: [{ type: "text", text: msg }], isError: true };
}
var schedulesModule = {
  getTools() {
    return [
      {
        name: "rootly_list_schedules",
        description: "List Rootly on-call schedules",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Max results (default 25)" },
            page: { type: "number", description: "Page number (default 1)" }
          }
        }
      },
      {
        name: "rootly_get_schedule",
        description: "Get a single Rootly on-call schedule by ID",
        inputSchema: {
          type: "object",
          required: ["schedule_id"],
          properties: {
            schedule_id: { type: "string", description: "Schedule ID" }
          }
        }
      }
    ];
  },
  async handleCall(toolName, args) {
    try {
      switch (toolName) {
        case "rootly_list_schedules": {
          const params = {};
          if (args.limit) params["page[size]"] = String(args.limit);
          if (args.page) params["page[number]"] = String(args.page);
          return ok3(await rootlyGet("/on_call_schedules", params));
        }
        case "rootly_get_schedule": {
          return ok3(await rootlyGet(`/on_call_schedules/${args.schedule_id}`));
        }
        default:
          return err3(`Unknown schedule tool: ${toolName}`);
      }
    } catch (e) {
      return err3(e.message);
    }
  }
};

// src/tools/teams.ts
function ok4(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err4(msg) {
  return { content: [{ type: "text", text: msg }], isError: true };
}
var teamsModule = {
  getTools() {
    return [
      {
        name: "rootly_list_teams",
        description: "List Rootly teams",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Max results (default 25)" },
            page: { type: "number", description: "Page number (default 1)" }
          }
        }
      }
    ];
  },
  async handleCall(toolName, args) {
    try {
      if (toolName === "rootly_list_teams") {
        const params = {};
        if (args.limit) params["page[size]"] = String(args.limit);
        if (args.page) params["page[number]"] = String(args.page);
        return ok4(await rootlyGet("/teams", params));
      }
      return err4(`Unknown team tool: ${toolName}`);
    } catch (e) {
      return err4(e.message);
    }
  }
};

// src/tools/severities.ts
function ok5(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err5(msg) {
  return { content: [{ type: "text", text: msg }], isError: true };
}
var severitiesModule = {
  getTools() {
    return [
      {
        name: "rootly_list_severities",
        description: "List Rootly incident severity levels",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ];
  },
  async handleCall(toolName, _args) {
    try {
      if (toolName === "rootly_list_severities") {
        return ok5(await rootlyGet("/severities"));
      }
      return err5(`Unknown severity tool: ${toolName}`);
    } catch (e) {
      return err5(e.message);
    }
  }
};

// src/tools/users.ts
function ok6(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err6(msg) {
  return { content: [{ type: "text", text: msg }], isError: true };
}
var usersModule = {
  getTools() {
    return [
      {
        name: "rootly_get_current_user",
        description: "Get the current authenticated Rootly user (verifies token, shows user details)",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ];
  },
  async handleCall(toolName, _args) {
    try {
      if (toolName === "rootly_get_current_user") {
        return ok6(await rootlyGet("/users/me"));
      }
      return err6(`Unknown user tool: ${toolName}`);
    } catch (e) {
      return err6(e.message);
    }
  }
};

// src/server.ts
var MODULES = [
  incidentsModule,
  alertsModule,
  schedulesModule,
  teamsModule,
  severitiesModule,
  usersModule
];
var toolRegistry = /* @__PURE__ */ new Map();
for (const mod of MODULES) {
  for (const tool of mod.getTools()) {
    toolRegistry.set(tool.name, mod);
  }
}
function createServer() {
  const server2 = new Server(
    { name: "rootly-mcp", version: "1.0.0" },
    {
      capabilities: {
        tools: {},
        logging: {}
      }
    }
  );
  server2.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = MODULES.flatMap((m) => m.getTools());
    return { tools };
  });
  server2.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const mod = toolRegistry.get(name);
    if (!mod) {
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true
      };
    }
    try {
      return await mod.handleCall(name, args || {});
    } catch (error) {
      logger.error("Tool call failed", { tool: name, error: error.message });
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  });
  return server2;
}

// src/index.ts
var server = createServer();
var transport = new StdioServerTransport();
await server.connect(transport);
logger.info("Rootly MCP server started (stdio)");
//# sourceMappingURL=index.js.map