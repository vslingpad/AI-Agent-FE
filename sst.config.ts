/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "lingpad-ai-fe",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: process.env.AWS_REGION ?? "us-east-2",
        },
      },
    };
  },
  async run() {
    const appDomain = process.env.APP_DOMAIN?.trim();

    new sst.aws.Nextjs("Web", {
      ...(appDomain ? { domain: appDomain } : {}),
      environment: {
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
        CONTROL_PLANE_URL: process.env.CONTROL_PLANE_URL ?? "",
        LINGPAD_AGENT_API_URL: process.env.LINGPAD_AGENT_API_URL ?? "",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
        NEXT_PUBLIC_CLERK_SIGN_IN_URL:
          process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in",
        NEXT_PUBLIC_CLERK_SIGN_UP_URL:
          process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up",
        NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
          process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/",
        NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
          process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? "/",
        NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:
          process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? "",
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "",
      },
    });
  },
});
