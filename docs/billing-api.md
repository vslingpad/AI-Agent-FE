# Billing API

Backend contract for the `/billing` page. The frontend BFF (`src/app/api/billing/route.ts`) composes Control Plane responses into the overview shape below.

**Control Plane:** `GET /billing/usage`, `GET /billing/plans`, `GET /agents`, `GET /orgs/me/connectors`, `PATCH /billing/settings`, `POST /billing/portal`, `POST /billing/checkout`  
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
    "resetsAt": "2026-09-01T00:00:00.000Z",
    "canAnswer": true,
    "blockedReason": null
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

---

## GET /api/billing/invoices

Paginated list of **paid Zoho Books invoices** only (`status=synced` with a Zoho invoice id). Powers `/billing/invoices`.

**Auth:** org admin (BFF). Control Plane allows org members.

**Query:** `page` (default 1), `pageSize` (default 10), `paidFrom` / `paidTo` (ISO dates, filter on `paid_at`).

Only **paid** Zoho-synced invoices (`status=paid` in the API). The Zoho portal URL is **not** stored or listed; fetch it when the user clicks **View** via `GET /api/billing/invoices/{stripeInvoiceId}/view-url`.

### Response

```json
{
  "items": [
    {
      "stripeInvoiceId": "in_1ABC",
      "zohoInvoiceNumber": "INV-001",
      "amount": "149.00",
      "currency": "usd",
      "paidAt": "2026-09-01T12:00:00Z",
      "status": "paid"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

## GET /api/billing/invoices/{stripeInvoiceId}/view-url

Resolves the Zoho Books customer portal link on demand (when the user clicks **View**).

```json
{ "url": "https://books.zoho.com/portal/..." }
```

---

## POST /api/billing/checkout

Starts Stripe Checkout for the first paid plan via Control Plane `POST /billing/checkout`. Use this for Free → Starter / Growth / Scale. Enterprise remains sales-led.

### Body

```json
{
  "planTier": "starter",
  "billingInterval": "month",
  "successUrl": "https://app.example.com/billing?checkout=success",
  "cancelUrl": "https://app.example.com/billing?checkout=canceled"
}
```

`planTier` must be `starter`, `growth`, or `scale`. `billingInterval` is `month` or `year` (yearly bills 10 months and includes 2 months free).

### Response

```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

The console redirects the admin to this URL. After payment, Stripe `checkout.session.completed` upgrades the org; leftover free conversations become first-period rollover.

| Condition | Status |
|-----------|--------|
| Plan is not purchasable | `422` |
| Organization has no Stripe customer | `409` |
| Stripe is not configured | `503` |
