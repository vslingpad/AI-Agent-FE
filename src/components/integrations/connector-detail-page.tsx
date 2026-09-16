"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  InfoIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { Show } from "@clerk/nextjs";
import { useBuildPageMeta } from "@/components/build/use-build-page-meta";
import { ActionsTab } from "@/components/integrations/tabs/actions-tab";
import { OverviewTab } from "@/components/integrations/tabs/overview-tab";
import { DeleteConnectorDialog } from "@/components/integrations/delete-connector-dialog";
import { GlobalAuthDialog } from "@/components/integrations/global-auth-dialog";
import { INTEGRATION_CATALOG } from "@/lib/fixtures/integrations-store";
import {
  ConnectorStatusBadge,
  getCatalogItem,
} from "@/components/integrations/integration-utils";
import { RenameConnectorDialog } from "@/components/integrations/rename-connector-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useConnectorDetail,
  useStartReauth,
  useUpdateConnector,
} from "@/hooks/use-integrations";
import {
  TAB_LABELS,
  formatConnectedDate,
  getConnectorPath,
  getDetailTabs,
  isDetailTab,
  type DetailTab,
} from "@/lib/integrations/connector-paths";
import type { ActionsPermissionFix } from "@/lib/integrations/actions-permissions";
import type {
  ConnectorCapability,
  KnowledgeSubCapability,
} from "@/lib/schemas/integrations";
import {
  capabilityRequiresGlobalAuth,
  getZendeskAuthStatus,
} from "@/lib/integrations/zendesk-auth";
import { cn } from "@/lib/utils";

type ConnectorDetailPageProps = {
  type: string;
  connectorId: string;
  initialTab?: string;
};

export function ConnectorDetailPage({
  type,
  connectorId,
  initialTab,
}: ConnectorDetailPageProps) {
  const router = useRouter();
  const { data: connector, isLoading, isError } = useConnectorDetail(connectorId);
  const updateConnector = useUpdateConnector(connectorId);
  const startReauth = useStartReauth(connectorId);

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>(
    isDetailTab(initialTab) ? initialTab : "overview"
  );
  const [actionsSearchQuery, setActionsSearchQuery] = useState("");
  const [enabledCapabilities, setEnabledCapabilities] = useState<
    ConnectorCapability[]
  >([]);
  const [enabledKnowledgeSubCapabilities, setEnabledKnowledgeSubCapabilities] =
    useState<KnowledgeSubCapability[]>([]);
  const [globalAuthOpen, setGlobalAuthOpen] = useState(false);
  const [pendingCapability, setPendingCapability] =
    useState<ConnectorCapability | null>(null);

  const tabs = getDetailTabs(type) as DetailTab[];

  const pageMeta = useMemo(
    () =>
      connector
        ? {
            breadcrumbs: [
              { label: "Integrations", href: "/integrations" },
              { label: connector.display_name },
            ],
            enableSearch: false,
          }
        : null,
    [connector]
  );

  useBuildPageMeta(pageMeta ?? { enableSearch: false });

  useEffect(() => {
    if (!connector) {
      return;
    }

    if (connector.integration_slug !== type) {
      router.replace(
        getConnectorPath(connector.integration_slug, connector.id)
      );
      return;
    }

    setEnabledCapabilities(connector.enabled_capabilities);
    setEnabledKnowledgeSubCapabilities(
      connector.enabled_knowledge_sub_capabilities ?? []
    );
  }, [connector, type, router]);

  if (isLoading) {
    return <ConnectorDetailSkeleton />;
  }

  if (isError || !connector) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <p className="text-sm text-muted-foreground">
          Integration not found.
        </p>
        <Button variant="outline" render={<Link href="/integrations" />}>
          Back to integrations
        </Button>
      </div>
    );
  }

  const catalogItem = getCatalogItem(INTEGRATION_CATALOG, connector.integration_slug);

  const toggleCapability = async (capability: ConnectorCapability) => {
    const isEnabling = !enabledCapabilities.includes(capability);

    if (
      isEnabling &&
      connector.integration_slug === "zendesk" &&
      capabilityRequiresGlobalAuth(capability) &&
      !getZendeskAuthStatus(connector.config).globalAuth
    ) {
      setPendingCapability(capability);
      setGlobalAuthOpen(true);
      return;
    }

    const next = isEnabling
      ? [...enabledCapabilities, capability]
      : enabledCapabilities.filter((item) => item !== capability);

    setEnabledCapabilities(next);

    if (capability === "knowledge" && !isEnabling) {
      setEnabledKnowledgeSubCapabilities([]);
      await updateConnector.mutateAsync({
        enabled_capabilities: next,
        enabled_knowledge_sub_capabilities: [],
      });
      return;
    }

    if (capability === "knowledge" && isEnabling && catalogItem?.knowledge_sub_capabilities) {
      const subs = [...catalogItem.knowledge_sub_capabilities];
      setEnabledKnowledgeSubCapabilities(subs);
      await updateConnector.mutateAsync({
        enabled_capabilities: next,
        enabled_knowledge_sub_capabilities: subs,
      });
      return;
    }

    await updateConnector.mutateAsync({ enabled_capabilities: next });
  };

  const toggleKnowledgeSubCapability = async (
    subCapability: KnowledgeSubCapability
  ) => {
    if (!enabledCapabilities.includes("knowledge")) {
      return;
    }

    const isEnabling = !enabledKnowledgeSubCapabilities.includes(subCapability);

    if (
      isEnabling &&
      connector.integration_slug === "zendesk" &&
      !getZendeskAuthStatus(connector.config).globalAuth
    ) {
      setPendingCapability("knowledge");
      setGlobalAuthOpen(true);
      return;
    }

    const next = isEnabling
      ? [...enabledKnowledgeSubCapabilities, subCapability]
      : enabledKnowledgeSubCapabilities.filter((item) => item !== subCapability);

    setEnabledKnowledgeSubCapabilities(next);
    await updateConnector.mutateAsync({ enabled_knowledge_sub_capabilities: next });
  };

  const handleGlobalAuthComplete = async (capability: ConnectorCapability) => {
    const next = [...new Set([...enabledCapabilities, capability])];
    setEnabledCapabilities(next);

    if (capability === "knowledge" && catalogItem?.knowledge_sub_capabilities) {
      const subs = [...catalogItem.knowledge_sub_capabilities];
      setEnabledKnowledgeSubCapabilities(subs);
      await updateConnector.mutateAsync({
        enabled_capabilities: next,
        enabled_knowledge_sub_capabilities: subs,
      });
      return;
    }

    await updateConnector.mutateAsync({ enabled_capabilities: next });
  };

  const handleReconnect = async () => {
    const session = await startReauth.mutateAsync();
    router.push(
      `/integrations/new/${connector.integration_slug}?reauth=${connector.id}&session=${session.connect_session_id}`
    );
  };

  const handleFixPermission = async (fix: ActionsPermissionFix) => {
    switch (fix) {
      case "enable_actions":
        await toggleCapability("action");
        break;
      case "enable_channel":
        await toggleCapability("channel");
        break;
      case "authorize_global_auth":
        setPendingCapability("action");
        setGlobalAuthOpen(true);
        break;
      case "reconnect":
        await handleReconnect();
        break;
    }
  };

  const isFixPending =
    updateConnector.isPending || startReauth.isPending;

  return (
    <div className="flex w-full flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {connector.display_name}
            </h1>
            <ConnectorStatusBadge status={connector.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {connector.identifier} · connected by{" "}
            {connector.connected_by.name} on{" "}
            {formatConnectedDate(connector.connected_by.connected_at)}
          </p>
        </div>

        <Show when={{ role: "org:admin" }}>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setRenameOpen(true)}>
              <PencilIcon />
              Rename
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href={`/integrations/new/${connector.integration_slug}`} />
              }
            >
              <PlusIcon />
              Add another
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon />
              Delete
            </Button>
          </div>
        </Show>
      </div>

      {connector.notification && (
        <NotificationBanner notification={connector.notification} />
      )}

      {connector.reauth_required && !connector.notification && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <AlertTriangleIcon className="mt-0.5 size-4 text-amber-600" />
            <p className="text-sm text-amber-900 dark:text-amber-200">
              Authorization expired. Reconnect to restore access.
            </p>
          </div>
          <Button size="sm" onClick={handleReconnect}>
            Reconnect
          </Button>
        </div>
      )}

      <Tabs
        className="w-full max-w-6xl"
        value={activeTab}
        onValueChange={(value) => {
          const nextTab = value as DetailTab;
          setActiveTab(nextTab);
          if (nextTab !== "actions") {
            setActionsSearchQuery("");
          }
        }}
      >
        <div className="flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          {activeTab === "actions" ? (
            <div className="relative w-full sm:w-72 sm:shrink-0">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={actionsSearchQuery}
                onChange={(event) => setActionsSearchQuery(event.target.value)}
                placeholder="Search actions…"
                className="h-9 pl-8"
                aria-label="Search actions"
              />
            </div>
          ) : null}
        </div>

        <TabsContent value="overview" className="w-full max-w-6xl">
          <OverviewTab
            connector={connector}
            catalogItem={catalogItem}
            enabled_capabilities={enabledCapabilities}
            enabled_knowledge_sub_capabilities={enabledKnowledgeSubCapabilities}
            onToggleCapability={toggleCapability}
            onToggleKnowledgeSubCapability={toggleKnowledgeSubCapability}
          />
        </TabsContent>

        <TabsContent value="actions" className="w-full max-w-6xl">
          <ActionsTab
            connector={connector}
            enabled_capabilities={enabledCapabilities}
            searchQuery={actionsSearchQuery}
            onFixPermission={handleFixPermission}
            isFixPending={isFixPending}
          />
        </TabsContent>
      </Tabs>

      <GlobalAuthDialog
        connectorId={connectorId}
        open={globalAuthOpen}
        onOpenChange={setGlobalAuthOpen}
        pendingCapability={pendingCapability}
        onAuthorized={handleGlobalAuthComplete}
      />

      <RenameConnectorDialog
        connector={connector}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />

      <DeleteConnectorDialog
        connector={connector}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectOnDelete
      />
    </div>
  );
}

function NotificationBanner({
  notification,
}: {
  notification: NonNullable<
    import("@/lib/schemas/integrations").ConnectorDetail["notification"]
  >;
}) {
  const styles = {
    warning:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
    error:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
    info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
  };

  const Icon =
    notification.type === "info" ? InfoIcon : AlertTriangleIcon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3",
        styles[notification.type]
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p className="text-sm">{notification.message}</p>
    </div>
  );
}

function ConnectorDetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 px-6 pb-8 pt-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
