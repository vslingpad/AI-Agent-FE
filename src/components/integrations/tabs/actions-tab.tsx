"use client";

import { useMemo } from "react";
import { Show } from "@clerk/nextjs";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  LockIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getActionsPermissionIssue,
  type ActionsPermissionFix,
} from "@/lib/integrations/actions-permissions";
import type {
  ConnectorAction,
  ConnectorCapability,
  ConnectorDetail,
} from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

type ActionsTabProps = {
  connector: ConnectorDetail;
  enabled_capabilities: ConnectorCapability[];
  searchQuery: string;
  onFixPermission?: (fix: ActionsPermissionFix) => void;
  isFixPending?: boolean;
};

function filterActions(actions: ConnectorAction[], query: string) {
  if (!query.trim()) {
    return actions;
  }

  const normalized = query.trim().toLowerCase();

  return actions.filter((action) =>
    [action.name, action.description, action.required_scope]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalized))
  );
}

export function ActionsTab({
  connector,
  enabled_capabilities,
  searchQuery,
  onFixPermission,
  isFixPending = false,
}: ActionsTabProps) {
  const filteredActions = useMemo(
    () => filterActions(connector.actions ?? [], searchQuery),
    [connector.actions, searchQuery]
  );

  const permissionIssue = getActionsPermissionIssue(
    connector,
    enabled_capabilities
  );

  return (
    <div className="w-full max-w-6xl space-y-4">
      {permissionIssue ? (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {permissionIssue.title}
              </p>
              <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
                {permissionIssue.description}
              </p>
              {!permissionIssue.fix ? (
                <Show when={{ role: "org:member" }}>
                  <p className="mt-2 text-xs text-amber-800/80 dark:text-amber-300/80">
                    Ask an admin to update connector settings.
                  </p>
                </Show>
              ) : null}
            </div>
          </div>

          {permissionIssue.fix && onFixPermission ? (
            <Show when={{ role: "org:admin" }}>
              <Button
                size="sm"
                className="shrink-0"
                disabled={isFixPending}
                onClick={() => onFixPermission(permissionIssue.fix!)}
              >
                {isFixPending ? "Working…" : permissionIssue.fixLabel}
              </Button>
            </Show>
          ) : null}

          {permissionIssue.fix ? (
            <Show when={{ role: "org:member" }}>
              <p className="w-full text-xs text-amber-800/80 sm:w-auto dark:text-amber-300/80">
                Ask an admin to {permissionIssue.fixLabel?.toLowerCase()}.
              </p>
            </Show>
          ) : null}
        </div>
      ) : null}

      {filteredActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium">No actions found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different action name or permission scope.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredActions.map((action) => (
            <Card
              key={action.id}
              size="sm"
              className={cn(
                !action.permission_granted &&
                  "border-amber-200/80 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/10"
              )}
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {action.permission_granted ? (
                      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <LockIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    )}
                    <div>
                      <CardTitle className="text-sm">{action.name}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={action.permission_granted ? "success" : "warning"}
                  >
                    {action.permission_granted ? "Allowed" : "Missing permission"}
                  </Badge>
                </div>
              </CardHeader>
              {action.required_scope && (
                <CardContent>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Required: {action.required_scope}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
