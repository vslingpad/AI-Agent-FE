# Billing API

Backend contract for the `/billing` page. The frontend calls these endpoints via Next.js route handlers (`src/app/api/billing/route.ts`) backed by an in-memory fixture store. Implement the same shapes on your real Control Plane / Stripe integration.

**Plan source of truth:** `src/lib/billing/plans.ts` (from product launch docs)  
**Types:** `src/lib/schemas/billing.ts`  
**Mock store:** `src/lib/fixtures/billing-store.ts`

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

Returns the billing overview for the active organization.

### Response

```json
{
  "subscription": {
    "tier": "growth",
    "planName": "Growth",
    "status": "active",
    "monthlyBaseLabel": "Contact sales",
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

`monthlyUsage.points` powers the **Monthly conversation usage** bar chart on `/billing` (included vs overage stacked bars, last 6 months).

---

## PATCH /api/billing

Updates org billing settings.

### Body

```json
{
  "allowOverage": true
}
```

Free plan returns `400` if overage is requested.

### Response

Same shape as `GET /api/billing`.

---

## POST /api/billing

Creates a Stripe Customer Portal session.

### Response

```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

The console opens this URL for payment method updates, invoices, and plan changes.

---

## Plan tiers (reference)

| Plan | Included conversations/mo | Additional cost | Max overage | Agents | Integrations |
|------|-------------------------|-----------------|-------------|--------|--------------|
| Free | 50 | N/A | — | 1 | 2 |
| Starter | 250 | $0.20 | 250 | 3 | 5 |
| Growth | 1,000 | $0.15 | 1,000 | 5 | 10 |
| Scale | 5,000 | $0.10 | 5,000 | 10 | Unlimited |

See `docs/product-launch/06-billing-stripe-metering.md` in the backend repo for the full feature matrix and metering rules.
