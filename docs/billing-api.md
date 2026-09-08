# Billing API

Backend contract for the `/billing` page. The frontend BFF (`src/app/api/billing/route.ts`) composes Control Plane responses into the overview shape below.

**Control Plane:** `GET /billing/usage`, `GET /billing/plans`, `GET /agents`, `GET /orgs/me/connectors`, `PATCH /billing/settings`, `POST /billing/portal`  
**Types:** `src/lib/schemas/billing.ts`

---

## Authentication

All billing endpoints require:

- Signed-in user
- Active organization context
- `org:admin` role

| Condition | Status | Body |
|-----------|--------|------|
| Not signed in | `401` | `{ "error": "Unauthorized" }` |
| No org selected | `400` | `{ "error": "Organization context required" }` |
| Not admin | `403` | `{ "error": "Admin access required" }` |

Billing is **not** handled by Clerk. Stripe + Control Plane own subscription state, usage, and entitlements.

---

## GET /api/billing

Returns the billing overview for the active organization, composed from Control Plane usage, plans, agents, and connectors.

### Response

```json
{
  "subscription": {
    "tier": "growth",
    "planName": "Growth",
    "status": "active",
    "monthlyBaseLabel": "$149",
    "hasActiveSubscription": true,
    "currentPeriodEnd": "2026-09-01T00:00:00.000Z"
  },
  "usage": {
    "conversationsUsed": 412,
    "conversationsIncluded": 1000,
    "freeRolloverRemaining": 0,
    "overageUsed": 12,
    "overageCap": 1000,
    "additionalConversationCost": 0.15,
    "estimatedOverageCost": 1.8,
    "usagePercent": 41,
    "resetsAt": "2026-09-01T00:00:00.000Z"
  },
  "limits": {
    "agents": { "used": 3, "limit": 5 },
    "integrations": { "used": 4, "limit": 10 }
  },
  "settings": {
    "allowOverage": true,
    "alertThresholds": [0.8, 1.0]
  },
  "monthlyUsage": {
    "points": [
      {
        "month": "2026-04",
        "label": "Apr",
        "included": 680,
        "overage": 0,
        "total": 680
      }
    ]
  }
}
```

`monthlyUsage.points` comes from Control Plane `GET /billing/usage` (`monthly_usage`), grouped from `conversation_billing_events`.

---

## PATCH /api/billing

Updates org billing settings via `PATCH /billing/settings`.

### Body

```json
{
  "allowOverage": true
}
```

Free plan returns `409` if overage is requested.

### Response

Same shape as `GET /api/billing`.

---

## POST /api/billing

Creates a Stripe Customer Portal session via `POST /billing/portal`.

### Response

```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

The console opens this URL for payment method updates, invoices, and plan changes. Returns `409` if the organization has no Stripe customer yet.
