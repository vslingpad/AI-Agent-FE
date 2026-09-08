"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2Icon,
  CircleIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useBuildPageMeta } from "@/components/build/use-build-page-meta";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { getCatalogItem } from "@/components/integrations/integration-utils";
import { getConnectorPath } from "@/lib/integrations/connector-paths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCompleteOAuthStep,
  useCreateConnector,
  useIntegrationsHub,
} from "@/hooks/use-integrations";
import type { ConnectSession } from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

type ConnectWizardPageProps = {
  slug: string;
  from?: string;
};

export function ConnectWizardPage({ slug, from }: ConnectWizardPageProps) {
  const router = useRouter();
  const { data: hub, isLoading } = useIntegrationsHub();
  const createConnector = useCreateConnector();

  const catalogItem = useMemo(
    () => hub?.catalog.find((item) => item.slug === slug),
    [hub, slug]
  );

  useBuildPageMeta({
    breadcrumbs: catalogItem
      ? [
          { label: "Integrations", href: "/integrations" },
          { label: `Connect ${catalogItem.name}` },
        ]
      : [{ label: "Integrations", href: "/integrations" }, { label: "Connect" }],
    enableSearch: false,
  });

  const [step, setStep] = useState<"details" | "authorize">("details");
  const [displayName, setDisplayName] = useState("");
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [session, setSession] = useState<ConnectSession | null>(null);
  const [connectorId, setConnectorId] = useState<string | null>(null);
  const completeOAuth = useCompleteOAuthStep(connectorId ?? "");

  if (isLoading) {
    return <ConnectWizardSkeleton />;
  }

  if (!catalogItem || !catalogItem.available) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <p className="text-sm text-muted-foreground">
          {catalogItem
            ? `${catalogItem.name} is coming soon.`
            : "Unknown integration type."}
        </p>
        <Button variant="outline" render={<Link href="/integrations" />}>
          Back to integrations
        </Button>
      </div>
    );
  }

  const defaultDisplayName =
    displayName ||
    (configValues.subdomain
      ? `${catalogItem.name} — ${configValues.subdomain}`
      : catalogItem.name);

  const getDefaultCapabilities = () => {
    if (from === "actions" && catalogItem.capabilities.includes("action")) {
      if (catalogItem.slug === "zendesk") {
        return ["channel", "action"] as const;
      }

      return catalogItem.capabilities.filter(
        (capability) => capability === "action"
      );
    }

    if (catalogItem.capabilities.length === 1) {
      return [...catalogItem.capabilities];
    }

    if (catalogItem.slug === "zendesk") {
      return ["channel"] as const;
    }

    return [...catalogItem.capabilities];
  };

  const handleDetailsNext = async () => {
    if (connectorId && session) {
      setStep("authorize");
      return;
    }

    const result = await createConnector.mutateAsync({
      integrationSlug: slug,
      displayName: defaultDisplayName,
      externalInstanceId: configValues.subdomain,
      capabilities: [...getDefaultCapabilities()],
      config: configValues,
    });

    setSession(result.session);
    setConnectorId(result.connector.id);
    setStep("authorize");
  };

  const handleAuthorize = async () => {
    if (!session || !connectorId || !session.wizard.currentStep) {
      return;
    }

    const result = await completeOAuth.mutateAsync({
      connectSessionId: session.connectSessionId,
      stepId: session.wizard.currentStep,
    });

    setSession(result.session);

    if (result.session.status === "active") {
      router.push(
        getConnectorPath(
          result.connector.integrationSlug,
          result.connector.id,
          from === "actions" ? { tab: "actions" } : undefined
        )
      );
    }
  };

  const detailsValid =
    (displayName.trim() || catalogItem.configFields.some((f) => f.key === "subdomain" && configValues.subdomain?.trim()) || catalogItem.configFields.length === 0) &&
    catalogItem.configFields.every(
      (field) => !field.required || configValues[field.key]?.trim()
    );

  const currentOAuthStep = session?.wizard.steps.find(
    (item) => item.id === session.wizard.currentStep
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Connect {catalogItem.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organization-level connection — agents bind to this instance later.
        </p>
      </div>

      <WizardSteps
        steps={[
          { id: "details", label: "Connection" },
          { id: "authorize", label: "Authorization" },
        ]}
        currentStep={step}
      />

      {step === "details" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <IntegrationBrandIcon slug={slug} />
              <div>
                <CardTitle>Connection details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Name this instance and provide account identifiers.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={`${catalogItem.name} — US Support`}
              />
              <p className="text-xs text-muted-foreground">
                Use a distinct name if you connect multiple {catalogItem.name}{" "}
                accounts.
              </p>
            </div>

            {catalogItem.configFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === "select" ? (
                  <select
                    id={field.key}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={configValues[field.key] ?? ""}
                    onChange={(event) =>
                      setConfigValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select…</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.key}
                    value={configValues[field.key] ?? ""}
                    onChange={(event) =>
                      setConfigValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                onClick={handleDetailsNext}
                disabled={!detailsValid || createConnector.isPending}
              >
                {createConnector.isPending ? "Creating…" : "Continue to authorize"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "authorize" && session && (
        <Card>
          <CardHeader>
            <CardTitle>Authorization</CardTitle>
            <p className="text-sm text-muted-foreground">
              {catalogItem.slug === "zendesk"
                ? "Authorize Zendesk Sunshine Messaging to connect your channel. Support & Guide auth is completed later when you enable Knowledge or Actions."
                : "Complete OAuth to grant the platform access to this integration."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {session.wizard.steps.map((oauthStep) => (
                <div
                  key={oauthStep.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-4"
                >
                  {oauthStep.status === "complete" ? (
                    <CheckCircle2Icon className="mt-0.5 size-5 text-emerald-600" />
                  ) : oauthStep.status === "in_progress" ? (
                    <LoaderCircleIcon className="mt-0.5 size-5 animate-spin text-primary" />
                  ) : (
                    <CircleIcon className="mt-0.5 size-5 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{oauthStep.label}</p>
                      <Badge variant="outline">
                        {oauthStep.status === "complete"
                          ? "Complete"
                          : oauthStep.status === "in_progress"
                            ? "In progress"
                            : "Pending"}
                      </Badge>
                    </div>
                    {oauthStep.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {oauthStep.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {currentOAuthStep && session.authorizeUrl && (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-sm font-medium">
                  {currentOAuthStep.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentOAuthStep.description ??
                    "Sign in with your admin account and approve the requested permissions."}
                </p>
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("details")}>
                Back
              </Button>
              <div className="flex gap-2">
                {session.authorizeUrl && session.status !== "active" && (
                  <Button
                    variant="outline"
                    render={
                      <a
                        href={session.authorizeUrl}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    Authorize with {catalogItem.name}
                    <ExternalLinkIcon />
                  </Button>
                )}
                <Button
                  onClick={handleAuthorize}
                  disabled={
                    !session.wizard.currentStep || completeOAuth.isPending
                  }
                >
                  {completeOAuth.isPending
                    ? "Verifying…"
                    : session.status === "active"
                      ? "Go to integration"
                      : "Continue"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WizardSteps({
  steps,
  currentStep,
}: {
  steps: Array<{ id: string; label: string }>;
  currentStep: string;
}) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <li
            key={step.id}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
              isCurrent && "border-primary bg-primary/5 text-primary",
              isComplete && "border-emerald-500/30 bg-emerald-500/5 text-emerald-700",
              !isCurrent && !isComplete && "border-border text-muted-foreground"
            )}
          >
            <span>{index + 1}</span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}

function ConnectWizardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-8 pt-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
