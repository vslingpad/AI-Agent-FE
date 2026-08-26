"use client";

import { useMemo, useState } from "react";
import { PlusIcon, SettingsIcon, Trash2Icon } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { CustomActionFormDialog } from "@/components/actions/custom-action-form-dialog";
import { useBuildPageMeta, useBuildSearchQuery } from "@/components/build/use-build-page-meta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCustomToolsHub,
  useDeleteCustomTool,
} from "@/hooks/use-custom-tools";
import {
  CUSTOM_TOOL_AUTH_LABELS,
  RESPONSE_MAPPING_LABELS,
} from "@/lib/actions/action-utils";
import type { CustomTool } from "@/lib/schemas/custom-tools";

export function CustomActionsPage() {
  const { data, isLoading, isError, refetch } = useCustomToolsHub();
  const { searchQuery } = useBuildSearchQuery();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<CustomTool | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomTool | null>(null);

  useBuildPageMeta({
    breadcrumbs: [
      { label: "Actions", href: "/actions" },
      { label: "Custom actions" },
    ],
    enableSearch: true,
    searchPlaceholder: "Search custom actions…",
  });

  const tools = useMemo(() => {
    const list = data?.tools ?? [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return list;
    }

    return list.filter((tool) =>
      [
        tool.displayName,
        tool.description,
        tool.endpointUrl,
        tool.httpMethod,
        CUSTOM_TOOL_AUTH_LABELS[tool.authType],
        RESPONSE_MAPPING_LABELS[tool.responseMapping.mode],
        tool.proceduresEnabled ? "procedures" : "",
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  const openCreate = () => {
    setEditingTool(null);
    setFormOpen(true);
  };

  const openEdit = (tool: CustomTool) => {
    setEditingTool(tool);
    setFormOpen(true);
  };

  if (isLoading) {
    return <CustomActionsSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <p className="text-sm text-muted-foreground">
          Unable to load custom actions.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Actions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What your agents can do beyond answering — connector actions and
          custom HTTP calls.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Custom actions
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Admin-defined HTTP APIs the AI can call during a conversation.
            </p>
          </div>
          <Show when={{ role: "org:admin" }}>
            <Button onClick={openCreate}>
              <PlusIcon />
              Add custom action
            </Button>
          </Show>
        </div>

        {tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm font-medium">No custom actions found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery.trim()
                ? "Try a different name, endpoint, or auth type."
                : "Add an HTTP API your agents can call during conversations."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-230 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Endpoint</th>
                  <th className="px-4 py-3 font-medium">Auth</th>
                  <th className="px-4 py-3 font-medium">Response</th>
                  <th className="px-4 py-3 font-medium">Procedures</th>
                  <th className="px-4 py-3 font-medium">Used by</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Row actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => {
                  return (
                    <tr
                      key={tool.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-medium">{tool.displayName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {tool.description}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <p className="max-w-xs break-all font-mono text-xs">
                          {tool.httpMethod} {tool.endpointUrl}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 align-top text-muted-foreground">
                        {CUSTOM_TOOL_AUTH_LABELS[tool.authType] ?? tool.authType}
                      </td>
                      <td className="px-4 py-3.5 align-top text-muted-foreground">
                        {RESPONSE_MAPPING_LABELS[tool.responseMapping.mode]}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <Badge
                          variant={
                            tool.proceduresEnabled ? "success" : "muted"
                          }
                        >
                          {tool.proceduresEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 align-top text-muted-foreground">
                        {tool.usedByAgentCount}{" "}
                        {tool.usedByAgentCount === 1 ? "agent" : "agents"}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <Show when={{ role: "org:admin" }}>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Edit ${tool.displayName}`}
                              onClick={() => openEdit(tool)}
                            >
                              <SettingsIcon />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-destructive hover:text-destructive"
                              aria-label={`Delete ${tool.displayName}`}
                              onClick={() => setDeleteTarget(tool)}
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
                        </Show>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CustomActionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tool={editingTool}
      />

      <DeleteCustomActionDialog
        tool={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

function DeleteCustomActionDialog({
  tool,
  open,
  onOpenChange,
}: {
  tool: CustomTool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteTool = useDeleteCustomTool();

  const handleDelete = async () => {
    if (!tool) {
      return;
    }

    await deleteTool.mutateAsync(tool.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete custom action</DialogTitle>
          <DialogDescription>
            Agents using{" "}
            <span className="font-medium text-foreground">
              {tool?.displayName}
            </span>{" "}
            will no longer be able to call this API.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTool.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomActionsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
