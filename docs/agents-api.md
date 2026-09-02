# Agents API

Backend contract for the agent workspace UI. Endpoints are **split by section** so each page loads only what it needs.

**Types:** `src/lib/schemas/agents.ts`  
**Mock store:** `src/lib/fixtures/agents-store.ts`  
**Client:** `src/lib/api/agents.ts`  
**Hooks:** `src/hooks/use-agents.ts`

---

## Authentication & tenancy

All requests require a signed-in user with an active organization (Clerk).

| Condition | Status | Body |
|-----------|--------|------|
| Not signed in | `401` | `{ "error": "Unauthorized" }` |
| No org selected | `400` | `{ "error": "Organization context required" }` |
| Insufficient role (admin-only write) | `403` | `{ "error": "Forbidden" }` |
| Invalid body | `400` | `{ "error": "Invalid request body" }` |
| Agent not found | `404` | `{ "error": "Agent not found" }` |

Scope all operations to `(orgId, agentId)`.

---

## Endpoint overview

| Method | Path | UI | Read | Write |
|--------|------|-----|------|-------|
| `GET` | `/api/agents` | Agents list | ✓ | |
| `POST` | `/api/agents` | Create agent | | ✓ |
| `GET` | `/api/agents/:agentId` | Workspace shell | ✓ | |
| `PATCH` | `/api/agents/:agentId` | Update agent, publish | | ✓ (admin) |
| `DELETE` | `/api/agents/:agentId` | Delete agent | | ✓ (admin) |
| `GET` | `/api/agents/:agentId/settings` | Settings | ✓ | |
| `PATCH` | `/api/agents/:agentId/settings` | Settings | | ✓ |
| `GET` | `/api/agents/:agentId/analytics` | Analytics | ✓ | |
| `GET` | `/api/agents/:agentId/knowledge` | Knowledge | ✓ | |
| `PATCH` | `/api/agents/:agentId/knowledge` | Knowledge | | ✓ |
| `GET` | `/api/agents/:agentId/actions` | Actions | ✓ | |
| `PATCH` | `/api/agents/:agentId/actions` | Action toggles | | ✓ |
| `GET` | `/api/agents/:agentId/procedures` | Procedures | ✓ | |
| `PATCH` | `/api/agents/:agentId/procedures` | Procedure toggles | | ✓ |
| `GET` | `/api/agents/:agentId/deploy/web-chat` | Web Chat | ✓ | |
| `PATCH` | `/api/agents/:agentId/deploy/web-chat` | Web Chat | | ✓ |
| `GET` | `/api/agents/:agentId/deploy/help-desk` | Help Desk | ✓ | |
| `PATCH` | `/api/agents/:agentId/deploy/help-desk` | Help Desk | | ✓ |
| `GET` | `/api/agents/:agentId/conversations` | Conversations | ✓ | |
| `GET` | `/api/agents/:agentId/conversations/locations` | Conversation location filters | ✓ | |
| `GET` | `/api/agents/:agentId/improve?kind=…` | Improve tabs | ✓ | |
| `GET` | `/api/agents/:agentId/test/cases` | Test Cases | ✓ | |
| `GET` | `/api/agents/:agentId/test/runs` | Test Runs | ✓ | |
| `GET` | `/api/agents/:agentId/test/playground/:sessionId` | Playground session | ✓ | |
| `POST` | `/api/agents/:agentId/test/playground` | New playground session | | ✓ |
| `PATCH` | `/api/agents/:agentId/test/playground/:sessionId` | Playground prompt override | | ✓ |
| `POST` | `/api/agents/:agentId/test/playground/:sessionId/messages` | Playground chat | | ✓ |

There is **no monolithic workspace GET**. `GET /api/agents/:agentId` returns **core metadata only**.

---

## `GET /api/agents`

List page payload.

```json
{
  "agents": [
    {
      "id": "customer-support",
      "name": "Customer Support",
      "description": "Handles shipping, returns, and general product questions.",
      "icon": "support",
      "status": "live",
      "updatedAt": "2026-08-31T06:00:00.000Z",
      "publishedAt": "2026-08-11T06:00:00.000Z",
      "tickets": 412,
      "resolutionRate": 76,
      "handoffRate": 24,
      "knowledgeSourceCount": 5,
      "liveChannelCount": 2,
      "openImproveCount": 5
    }
  ],
  "planAgentLimit": 5
}
```

---

## `POST /api/agents`

Creates an agent. Returns **core metadata** (`201`), not the full workspace.

### Request

```json
{
  "name": "Returns Bot",
  "description": "Optional, max 280 chars"
}
```

### Response `AgentCore`

```json
{
  "id": "agt-returns-bot",
  "name": "Returns Bot",
  "description": "New AI support agent.",
  "icon": "support",
  "status": "draft",
  "hasUnpublishedChanges": true,
  "updatedAt": "2026-08-31T08:00:00.000Z",
  "publishedAt": null
}
```

Frontend redirects to `/agents/:id/build/knowledge` after create.

---

## `GET /api/agents/:agentId` — Agent core

Used by the workspace shell (header, nav context).

```json
{
  "id": "customer-support",
  "name": "Customer Support",
  "description": "Handles shipping, returns, and general product questions.",
  "icon": "support",
  "status": "live",
  "hasUnpublishedChanges": false,
  "updatedAt": "2026-08-31T06:00:00.000Z",
  "publishedAt": "2026-08-11T06:00:00.000Z"
}
```

| Field | Values |
|-------|--------|
| `icon` | `"support"` \| `"billing"` \| `"technical"` |
| `status` | `"draft"` \| `"live"` |

---

## `PATCH /api/agents/:agentId` — Agent core

Updates agent metadata. Returns updated `AgentCore`.

**Authorization:** org admin only (`org:admin`). The agents list card exposes this via an admin-only **Update** action.

### Update name / description

Used by the agents list **Update** dialog.

```json
{ "name": "New name" }
```

```json
{ "description": "Updated description" }
```

Both fields can be sent together:

```json
{
  "name": "Returns Bot",
  "description": "Handles return and refund questions."
}
```

| Field | Constraints |
|-------|-------------|
| `name` | Required when present; 1–80 chars |
| `description` | Optional; max 280 chars |

Updating name or description sets `hasUnpublishedChanges → true` and refreshes `updatedAt`.

### Publish

```json
{ "publish": true }
```

**Publish behavior:** `status → "live"`, `publishedAt → now`, `hasUnpublishedChanges → false`.

Any other section PATCH also sets `hasUnpublishedChanges → true` on core (frontend invalidates core query).

---

## `DELETE /api/agents/:agentId` — Delete agent

Permanently removes an agent and all section data for the org.

**Authorization:** org admin only (`org:admin`). The agents list card exposes this via an admin-only **Delete** action (with confirmation dialog).

### Response `200`

```json
{ "ok": true }
```

### Errors

| Condition | Status |
|-----------|--------|
| Agent not found | `404` |

After delete, the frontend invalidates the agents list and drops cached queries for that `agentId`.

**Backend should cascade delete** (or soft-delete) all agent-scoped data: knowledge, actions bindings, procedures toggles, deploy config, conversations, improve items, and test cases/runs.

---

## `GET/PATCH /api/agents/:agentId/settings`

Agent configuration shown on the **Settings** page. Name and description come from **Agent core** (`GET/PATCH /api/agents/:agentId`); this endpoint covers prompt and handover target only.

### GET → `AgentSettings`

```json
{
  "systemPrompt": "You are Acme's support agent…",
  "handoverConnectorId": "conn_zd_us"
}
```

| Field | Description |
|-------|-------------|
| `systemPrompt` | System prompt for the agent |
| `handoverConnectorId` | Org connector ID for human handover (**Target** in Handover settings) |

### PATCH request

Partial update. Send only fields being changed.

**General tab — system prompt**

```json
{
  "settings": {
    "systemPrompt": "You are a concise support agent for Acme…"
  }
}
```

**Handover tab — target**

```json
{
  "settings": {
    "handoverConnectorId": "conn_zd_us"
  }
}
```

Response: full updated `AgentSettings`.

**Settings page data sources**

| UI field | API |
|----------|-----|
| Name, description | `GET/PATCH /api/agents/:agentId` (admin can PATCH) |
| System prompt | `GET/PATCH …/settings` |
| Handover target | `GET/PATCH …/settings` |
| Delete agent | `DELETE /api/agents/:agentId` (admin only) |

---

## `GET /api/agents/:agentId/analytics`

Read-only. Returns `AgentAnalytics`:

```json
{
  "kpis": [
    {
      "id": "tickets",
      "label": "AI-handled conversations",
      "displayValue": "412",
      "change": 12.4,
      "changeLabel": "vs prior 20 days",
      "direction": "up",
      "invert": true,
      "sparkline": [280, 290, 300]
    }
  ],
  "ticketsOverTime": [{ "date": "2026-08-12", "label": "Aug 12", "value": 18 }],
  "topTopics": [{ "topic": "Order tracking", "conversations": 98, "resolutionRate": 91 }],
  "avgConfidence": 0.82,
  "knowledgeGroundedRate": 94,
  "remainingCredits": 588,
  "includedCredits": 1000
}
```

---

## `GET/PATCH /api/agents/:agentId/knowledge`

### GET → `AgentKnowledge`

```json
{
  "sources": [
    {
      "id": "src_website",
      "slug": "website",
      "name": "Website",
      "kind": "website",
      "vendorSlug": null,
      "state": "connected",
      "enabled": true,
      "instanceName": null,
      "lastSyncedAt": "2026-08-31T05:00:00.000Z",
      "collections": [],
      "resources": []
    }
  ]
}
```

**Source ID conventions**

| Source | Pattern | Example |
|--------|---------|---------|
| Native | `src_{kind}` | `src_website`, `src_files`, `src_qna` |
| Connector | `src_{vendorSlug}_{kind}` | `src_zendesk_help_center` |

**Resource types** (discriminated union on `type`): `url`, `file`, `qna`, `article`, `ticket` — see `KnowledgeResourceSchema` in `src/lib/schemas/agents.ts`.

### PATCH — one operation per request

**Toggle source**
```json
{ "knowledgeSourceId": "src_zendesk_help_center", "knowledgeEnabled": true }
```

**Add website**
```json
{ "addUrl": "https://help.acme.com/docs" }
```

**Add file** (metadata only; real backend needs upload flow)
```json
{ "addFile": { "name": "Refund policy.pdf" } }
```

**Add Q&A**
```json
{
  "addQna": {
    "title": "Refund timing",
    "question": "How long do refunds take?",
    "answer": "5–7 business days."
  }
}
```

**Resource action**
```json
{
  "knowledgeResourceAction": {
    "sourceId": "src_files",
    "resourceIds": ["file_returns"],
    "action": "train"
  }
}
```

| `action` | Effect |
|----------|--------|
| `train` | `trained: true`, status → `indexed` where applicable |
| `untrain` | `trained: false`, articles → `pending` |
| `remove` | Delete resources (native sources only) |

Response: updated `AgentKnowledge`.

---

## `GET/PATCH /api/agents/:agentId/actions`

### GET

```json
{
  "actions": [
    {
      "id": "act_zendesk",
      "slug": "zendesk",
      "name": "Zendesk — US Support",
      "kind": "connector",
      "description": "Create tickets, add notes…",
      "connected": true,
      "connectorId": "conn_zd_us",
      "identifier": "support.acme.zendesk.com",
      "subActions": [
        {
          "id": "zd_internal_note",
          "name": "Add internal note",
          "description": "…",
          "enabled": true
        }
      ]
    }
  ]
}
```

### PATCH

```json
{
  "actionId": "act_zendesk",
  "actionSubActionId": "zd_internal_note",
  "actionSubActionEnabled": true
}
```

Response: `{ "actions": [...] }`.

Sub-action IDs: `src/lib/actions/agent-action-catalog.ts`.

---

## `GET/PATCH /api/agents/:agentId/procedures`

### GET

```json
{
  "procedures": [
    {
      "id": "proc_refund",
      "name": "Refund escalation",
      "whenToUse": "Customer asks to cancel and refund…",
      "status": "live",
      "enabled": true,
      "stepCount": 6,
      "lastSimulatedAt": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

### PATCH

```json
{ "procedureId": "proc_refund", "procedureEnabled": false }
```

Response: `{ "procedures": [...] }`. UI only allows toggling when `status === "live"`.

---

## `GET/PATCH /api/agents/:agentId/deploy/web-chat`

### GET → `WebChatConfig`

```json
{
  "enabled": true,
  "greeting": "Hi — I can help with orders, shipping, and returns.",
  "position": "right",
  "primaryColor": "#111111",
  "domainAllowlist": ["acme.com", "help.acme.com"],
  "publishableKey": "pk_live_acme_support"
}
```

### PATCH

```json
{
  "webChat": {
    "enabled": true,
    "greeting": "Hello!",
    "domainAllowlist": ["acme.com"]
  }
}
```

Response: full updated `WebChatConfig`.

---

## `GET/PATCH /api/agents/:agentId/deploy/help-desk`

### GET → `HelpDeskBinding`

```json
{
  "connectorId": "conn_zd_us",
  "slug": "zendesk",
  "name": "Zendesk — US Support",
  "identifier": "support.acme.zendesk.com",
  "status": "active",
  "useChannel": true,
  "routing": "inherit"
}
```

| `status` | `"active"` \| `"reauth_required"` \| `"not_connected"` |

### PATCH

```json
{ "useChannel": true }
```

Response: full updated `HelpDeskBinding`.

---

## `GET /api/agents/:agentId/conversations`

Optional query parameters:

| Param | Type | Description |
|-------|------|-------------|
| `customer` | string | Match customer name or email |
| `conversationId` | string | Match conversation ID (partial) |
| `dateFrom` | string | Filter on or after date (`YYYY-MM-DD`) |
| `dateTo` | string | Filter on or before date (`YYYY-MM-DD`) |
| `location` | string | Filter by location (exact). Use `__none__` for missing location |
| `channel` | `web_chat` \| `zendesk` \| `playground` | Filter by channel |
| `status` | `ai_active` \| `handed_over` \| `resolved` | Filter by status |
| `billable` | boolean | Filter billable conversations |
| `knowledgeGap` | boolean | Filter knowledge-gap conversations |
| `page` | number | Page number (default `1`) |
| `pageSize` | number | Page size (default `20`, max `100`) |

```json
{
  "conversations": [
    {
      "id": "cs-c-refund",
      "channel": "zendesk",
      "customerName": "Maya Chen",
      "customerEmail": "maya@example.com",
      "location": "San Francisco, US",
      "preview": "I need a refund for order #48219…",
      "status": "handed_over",
      "startedAt": "2026-08-31T03:00:00.000Z",
      "messageCount": 6,
      "billable": true,
      "knowledgeGap": false,
      "messages": [
        { "id": "m1", "role": "customer", "content": "…", "at": "…" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 18,
    "totalPages": 1
  }
}
```

---

## `GET /api/agents/:agentId/conversations/locations`

Returns distinct location filter options for the agent's conversations, derived from stored conversation data.

```json
{
  "locations": [
    { "value": "Berlin, DE", "label": "Berlin, DE" },
    { "value": "London, UK", "label": "London, UK" },
    { "value": "San Francisco, US", "label": "San Francisco, US" },
    { "value": "__none__", "label": "No location" }
  ]
}
```

`__none__` is included only when at least one conversation has no location.

---

## `GET /api/agents/:agentId/conversations/export`

Same filter query params as the list endpoint (`customer`, `conversationId`, `dateFrom`, `dateTo`, `location`, `channel`, `status`, `billable`, `knowledgeGap`). Returns all matching conversations as a CSV download (`Content-Type: text/csv`).

---

## `GET /api/agents/:agentId/improve`

Optional query: `?kind=knowledge-gap`

| `kind` values |
|---------------|
| `knowledge-gap`, `knowledge-conflict`, `duplicate-content`, `missing-action`, `missing-procedure` |

```json
{
  "items": [
    {
      "id": "cs-gap-warranty",
      "kind": "knowledge-gap",
      "title": "Extended warranty after 30 days",
      "description": "…",
      "status": "open",
      "occurrences": 14,
      "conversationId": "cs-c-warranty",
      "suggestedAction": "Add a Q&A or Help Center article…",
      "createdAt": "2026-08-31T06:00:00.000Z"
    }
  ]
}
```

Improve empty-state also uses `GET /api/agents/:agentId` for `status === "draft"`.

---

## `GET /api/agents/:agentId/test/cases`

```json
{
  "testCases": [
    {
      "id": "tc-track",
      "name": "Track a shipped order",
      "prompt": "Where is order 11902?",
      "expectedContains": "UPS",
      "lastResult": "pass",
      "lastRunAt": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

---

## `GET /api/agents/:agentId/test/runs`

```json
{
  "testRuns": [
    {
      "id": "tr-1",
      "name": "Regression · Aug 25",
      "startedAt": "2026-08-30T10:00:00.000Z",
      "status": "failed",
      "passRate": 50,
      "caseCount": 2
    }
  ]
}
```

Test Runs page also calls `GET …/test/cases` to check if any cases exist.

---

## `POST /api/agents/:agentId/test/playground` — Create session

Creates a **new playground session** when the user opens the playground or clicks **New test**. Playground messages are free and do not consume conversation credits.

### Response `201` → `PlaygroundSession`

```json
{
  "id": "pg-customer-support-2-1756646400000",
  "agentId": "customer-support",
  "agentName": "Customer Support",
  "sessionNumber": 2,
  "createdAt": "2026-08-31T08:00:00.000Z",
  "productionPrompt": "You are Acme's support agent…",
  "promptOverride": null,
  "effectivePrompt": "You are Acme's support agent…",
  "messages": []
}
```

---

## `GET /api/agents/:agentId/test/playground/:sessionId`

Returns the current session state (messages and prompt override).

Response: `PlaygroundSession`.

---

## `PATCH /api/agents/:agentId/test/playground/:sessionId`

Updates **playground-only** configuration. Does not change published agent settings.

### Prompt override

```json
{ "promptOverride": "You are a concise support agent for Acme…" }
```

Reset to production prompt:

```json
{ "promptOverride": null }
```

Response: updated `PlaygroundSession` with refreshed `effectivePrompt`.

---

## `POST /api/agents/:agentId/test/playground/:sessionId/messages`

Send a customer message and receive an AI reply

### Request

```json
{ "content": "Where is order 11902?" }
```

### Response

```json
{
  "session": {
    "id": "pg-customer-support-2-1756646400000",
    "messages": [
      {
        "id": "u-1756646401000",
        "role": "user",
        "content": "Where is order 11902?",
        "at": "2026-08-31T08:00:01.000Z"
      },
      {
        "id": "a-1756646401001",
        "role": "assistant",
        "content": "Order 11902 is with UPS…",
        "at": "2026-08-31T08:00:02.000Z"
      }
    ]
  }
}
```

### Errors

| Condition | Status |
|-----------|--------|
| Session not found | `404` |

---

## Frontend hook mapping

| Hook | Endpoint |
|------|----------|
| `useAgentsList()` | `GET /api/agents` |
| `useCreateAgent()` | `POST /api/agents` |
| `useAgent(id)` | `GET /api/agents/:id` |
| `useUpdateAgent(id)` | `PATCH /api/agents/:id` |
| `useDeleteAgent()` | `DELETE /api/agents/:id` |
| `useAgentSettings(id)` | `GET …/settings` |
| `useUpdateAgentSettings(id)` | `PATCH …/settings` |
| `useAgentAnalytics(id)` | `GET …/analytics` |
| `useAgentKnowledge(id)` | `GET/PATCH …/knowledge` |
| `useAgentActions(id)` | `GET/PATCH …/actions` |
| `useAgentProcedures(id)` | `GET/PATCH …/procedures` |
| `useAgentWebChat(id)` | `GET/PATCH …/deploy/web-chat` |
| `useAgentHelpDesk(id)` | `GET/PATCH …/deploy/help-desk` |
| `useAgentConversations(id, params?)` | `GET …/conversations`, `GET …/conversations/export` |
| `useAgentConversationLocations(id)` | `GET …/conversations/locations` |
| `useAgentImprove(id, kind)` | `GET …/improve?kind=` |
| `useAgentTestCases(id)` | `GET …/test/cases` |
| `useAgentTestRuns(id)` | `GET …/test/runs` |
| `useCreatePlaygroundSession(id)` | `POST …/test/playground` |
| `usePlaygroundSession(id, sessionId)` | `GET …/test/playground/:sessionId` |
| `useUpdatePlaygroundSession(id, sessionId)` | `PATCH …/test/playground/:sessionId` |
| `useSendPlaygroundMessage(id, sessionId)` | `POST …/test/playground/:sessionId/messages` |

React Query keys: `["agents", orgId, agentId, section]`.

Section PATCH mutations invalidate the agent **core** query (for `hasUnpublishedChanges`) and the agents list.

---

## Backend implementation notes

1. **No workspace blob** — implement each section as its own handler/service. The fixture store (`agents-store.ts`) still holds one in-memory `AgentWorkspace` per agent but exposes section getters/updaters.

2. **Connector bindings** — `actions`, `helpDesk`, and connector knowledge sources reference org-level integrations. Agent APIs configure bindings, not OAuth.

3. **Admin-only core writes** — `PATCH /api/agents/:agentId` (update) and `DELETE /api/agents/:agentId` are shown only to `org:admin` in the UI. Backend should enforce the same role check and return `403` for members.

4. **Publish / draft** — core PATCH with `publish: true` is the only publish path today.

5. **File uploads** — `addFile` only sends a name in the mock. Real backend needs multipart or presigned URLs.

6. **Validation** — mirror Zod schemas in `src/lib/schemas/agents.ts`. Frontend parses every response strictly.

7. **Suggested future endpoints**
   - `POST /api/agents/:agentId/test/runs`
   - `PATCH /api/agents/:agentId/improve/:itemId`
   - `GET /api/agents/:agentId/knowledge/sources/:sourceId` for source detail pagination

---

## Example: knowledge page load

```http
GET /api/agents/customer-support
GET /api/agents/customer-support/knowledge
```

Two lightweight calls instead of one heavy workspace payload.

## Example: update agent (admin)

```http
PATCH /api/agents/customer-support
Content-Type: application/json

{
  "name": "Customer Support",
  "description": "Handles shipping, returns, and product questions."
}
```

Returns updated `AgentCore`; agents list refetches.

## Example: delete agent (admin)

```http
DELETE /api/agents/customer-support
```

Returns `{ "ok": true }`; agent is removed from the list.

## Example: publish agent

```http
PATCH /api/agents/customer-support
Content-Type: application/json

{ "publish": true }
```

Returns updated core; list page refetches on next visit.
