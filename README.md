# rootly-mcp

MCP server for the [Rootly](https://rootly.com) incident management platform.

Built by WYRE Technology — part of the wyre-projects MCP server collection.

## Tools

### Incidents
| Tool | Description |
|------|-------------|
| `rootly_list_incidents` | List incidents with optional status/severity filters |
| `rootly_get_incident` | Get a single incident by ID |
| `rootly_create_incident` | Create a new incident |
| `rootly_update_incident` | Update title, summary, status, or severity |
| `rootly_resolve_incident` | Resolve an incident |

### Alerts
| Tool | Description |
|------|-------------|
| `rootly_list_alerts` | List alerts with optional status filter |
| `rootly_acknowledge_alert` | Acknowledge an alert |
| `rootly_resolve_alert` | Resolve an alert |
| `rootly_create_alert` | Create a new alert |
| `rootly_update_alert` | Update alert status or summary |

### On-Call / Org
| Tool | Description |
|------|-------------|
| `rootly_list_schedules` | List on-call schedules |
| `rootly_get_schedule` | Get a single on-call schedule |
| `rootly_list_teams` | List teams |
| `rootly_list_severities` | List severity levels |
| `rootly_get_current_user` | Get current authenticated user |

## Setup

### 1. Install dependencies & build

```bash
cd rootly-mcp
npm install
npm run build
```

### 2. Set your API token

```bash
export ROOTLY_API_TOKEN=rootly_xxxxxxxxxxxxxxxx
```

Get your token from **Rootly → Profile → API Tokens**.

### 3. Run via mcporter

Add to your mcporter config or run directly:

```bash
ROOTLY_API_TOKEN=your_token node dist/index.js
```

Or via mcporter:

```json
{
  "rootly": {
    "command": "node",
    "args": ["/path/to/rootly-mcp/dist/index.js"],
    "env": {
      "ROOTLY_API_TOKEN": "rootly_xxxxxxxxxxxxxxxx"
    }
  }
}
```

Then: `mcporter call rootly.rootly_list_incidents`

## Rate Limiting

Rootly enforces **3 write operations per 60 seconds**. The server tracks this in-process and returns a descriptive error with retry-after time if you exceed the limit.

## API Reference

- Rootly API docs: <https://docs.rootly.com/api-reference>
- API base URL: `https://api.rootly.com/v1`
- Auth: `Authorization: Bearer <token>`
- Write content-type: `application/vnd.api+json`

## Development

```bash
npm run dev        # watch mode
npm run lint       # TypeScript check
npm run test       # run tests
```

## License

Apache-2.0 © WYRE Technology
