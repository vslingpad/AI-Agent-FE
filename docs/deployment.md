# Nelto Console — AWS Deployment (CloudFront)

This app deploys to AWS using [SST](https://sst.dev) + [OpenNext](https://opennext.js.org/aws), which provisions:

- **CloudFront** — CDN and request routing
- **S3** — static assets (`/_next/static`, public files)
- **Lambda** — SSR, API routes (`/api/*`), and Clerk middleware

CI/CD is handled by GitHub Actions (`.github/workflows/build-and-deploy.yml`).

## Prerequisites

1. AWS account with permissions for CloudFront, S3, Lambda, IAM, and Route 53 (if using a custom domain).
2. GitHub repo secrets/variables configured (see below).
3. An IAM role for GitHub OIDC (same pattern as `Django-Backend` and `lingpad-ai-agent`).

## First-time setup

### 1. Configure GitHub secrets

| Name | Type | Description |
|------|------|-------------|
| `AWS_ROLE_ARN` | Secret | IAM role ARN for GitHub OIDC (shared with other Lingpad repos) |
| `CLERK_SECRET_KEY` | Secret | Clerk secret key for the target environment |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Secret | Clerk publishable key |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Secret | PostHog token (optional) |

Use **GitHub Environments** (`stage`, `prod`) so each environment can have different Clerk keys.

### 2. Configure GitHub variables

Set these per environment (`stage` / `prod`):

| Name | Example | Description |
|------|---------|-------------|
| `CONTROL_PLANE_URL` | `https://api-stage.example.com` | lingpad-ai-agent control plane URL (server-side BFF) |
| `APP_DOMAIN` | `console-stage.example.com` | Custom domain (optional; omit to use the CloudFront URL) |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` | PostHog host (optional) |

### 3. Bootstrap and deploy locally (once)

From the repo root, with AWS credentials configured:

```bash
npm install
export CLERK_SECRET_KEY=sk_test_...
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
export CONTROL_PLANE_URL=https://your-control-plane-url
npm run deploy:stage
```

SST bootstraps state in your AWS account on the first run and prints the CloudFront URL when complete.

### 4. Configure Clerk

In the [Clerk Dashboard](https://dashboard.clerk.com), add your CloudFront URL (or custom domain) to:

- **Allowed origins**
- **Redirect URLs** for sign-in / sign-up

## CI/CD behavior

| Trigger | Stage |
|---------|-------|
| Push to `develop` | `stage` |
| Push to `main` | `prod` |
| Manual workflow dispatch | chosen environment |

Pull requests run lint + build only (`.github/workflows/ci.yml`).

## Custom domain

Set the `APP_DOMAIN` GitHub variable for the target environment, e.g. `console.example.com`.

If the domain is in Route 53 in the same AWS account, SST creates the ACM certificate and DNS records automatically. For other DNS providers, follow the SST output instructions to add validation records.

## Useful commands

```bash
# Deploy to staging
npm run deploy:stage

# Deploy to production
npm run deploy:prod

# Remove a non-prod stage (destroys CloudFront, S3, Lambda for that stage)
npx sst remove --stage stage
```

## Architecture

```
Browser
  └── CloudFront
        ├── S3 (static assets)
        └── Lambda (Next.js server — SSR, /api/*, Clerk)
              └── CONTROL_PLANE_URL (lingpad-ai-agent)
```

## Troubleshooting

- **Build fails in CI**: Ensure Clerk placeholder keys are set in `ci.yml`, or add required env vars.
- **502 from CloudFront**: Check Lambda logs in CloudWatch for the `Web` server function.
- **Clerk auth errors**: Verify allowed origins and redirect URLs match your deployed domain.
- **API routes fail**: Confirm `CONTROL_PLANE_URL` points to a reachable control plane from Lambda (not `localhost`).
