"use client";

import { useRef, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useResetKey } from "@/hooks/use-reset-key";
import { Loader2Icon, UploadIcon } from "lucide-react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLeaveOrganization,
  useRemoveOrganizationLogo,
  useUpdateOrganizationSettings,
  useUploadOrganizationLogo,
} from "@/hooks/use-org-settings";
import { SUPPORT_EMAIL } from "@/lib/constants/support";
import { getOrgInitials } from "@/lib/org-utils";
import { cn } from "@/lib/utils";

export function OrgSettingsPage() {
  const { organization, membership, isLoaded } = useOrganization();
  const isAdmin = membership?.role === "org:admin";
  const [name, setName] = useState(organization?.name ?? "");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSettings = useUpdateOrganizationSettings();
  const uploadLogo = useUploadOrganizationLogo();
  const removeLogo = useRemoveOrganizationLogo();
  const leaveOrg = useLeaveOrganization();

  if (useResetKey(organization?.name) && organization?.name) {
    setName(organization.name);
  }

  if (!isLoaded) {
    return <OrgSettingsSkeleton />;
  }

  if (!organization || !membership) {
    return (
      <AgentPageFrame
        title="Settings"
        description="Manage your organization profile and membership."
      >
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium">No organization selected</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an organization from the sidebar to view its settings.
          </p>
        </div>
      </AgentPageFrame>
    );
  }

  const logoPending = uploadLogo.isPending || removeLogo.isPending;
  const nameDirty = name.trim() !== organization.name;

  const handleSaveName = () => {
    void updateSettings.mutateAsync({ name: name.trim() });
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      await uploadLogo.mutateAsync(file);
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    void removeLogo.mutateAsync();
  };

  const handleLeave = async () => {
    try {
      await leaveOrg.mutateAsync();
      setLeaveOpen(false);
    } catch {
      setLeaveOpen(false);
    }
  };

  return (
    <AgentPageFrame
      title="Settings"
      description={
        isAdmin
          ? "Manage your organization profile and membership."
          : "View your organization profile and membership options."
      }
    >
      <div className="flex max-w-2xl flex-col gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Update the name and logo shown across your workspace."
                : "Your organization profile is managed by admins."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Logo</Label>
              <div className="flex flex-wrap items-center gap-4">
                <OrgLogo
                  name={organization.name}
                  imageUrl={organization.imageUrl}
                  hasImage={organization.hasImage}
                />

                {isAdmin ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="hidden"
                      onChange={(event) => void handleLogoChange(event)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={logoPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadLogo.isPending ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <UploadIcon className="size-4" />
                      )}
                      Upload logo
                    </Button>
                    {organization.hasImage ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={logoPending}
                        onClick={() => void handleRemoveLogo()}
                      >
                        {removeLogo.isPending ? "Removing…" : "Remove"}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!isAdmin || updateSettings.isPending}
                readOnly={!isAdmin}
              />
            </div>

            {isAdmin ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={!nameDirty || !name.trim() || updateSettings.isPending}
                  onClick={() => void handleSaveName()}
                >
                  {updateSettings.isPending ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Leave organization</CardTitle>
            <CardDescription>
              You will lose access to {organization.name} and its agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setLeaveOpen(true)}>
              Leave organization
            </Button>
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Delete organization</CardTitle>
              <CardDescription>
                Need to permanently remove this organization? Our team can help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                render={
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Delete organization request")}&body=${encodeURIComponent(`Organization: ${organization.name}\nOrganization ID: ${organization.id}\n\nPlease help me delete this organization.`)}`}
                  />
                }
              >
                Contact support
              </Button>
            </CardContent>
          </Card>
        ) : null}
        
      </div>

      <LeaveOrganizationDialog
        open={leaveOpen}
        organizationName={organization.name}
        pending={leaveOrg.isPending}
        onOpenChange={setLeaveOpen}
        onConfirm={() => void handleLeave()}
      />
    </AgentPageFrame>
  );
}

function OrgLogo({
  name,
  imageUrl,
  hasImage,
}: {
  name: string;
  imageUrl: string | null;
  hasImage: boolean;
}) {
  if (hasImage && imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className="size-16 rounded-lg object-cover ring-1 ring-border"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-16 items-center justify-center rounded-lg bg-gray-800 text-lg font-semibold text-white ring-1 ring-border"
      )}
    >
      {getOrgInitials(name)}
    </div>
  );
}

function LeaveOrganizationDialog({
  open,
  organizationName,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  organizationName: string;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave organization</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave {organizationName}? You can rejoin only if an
            admin invites you again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Leaving…
              </>
            ) : (
              "Leave organization"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrgSettingsSkeleton() {
  return (
    <AgentPageFrame
      title="Settings"
      description="Manage your organization profile and membership."
    >
      <div className="max-w-2xl space-y-6">
        <Card className="border-border">
          <CardContent className="space-y-6 pt-6">
            <Skeleton className="size-16 rounded-lg" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="ml-auto h-9 w-28" />
          </CardContent>
        </Card>
      </div>
    </AgentPageFrame>
  );
}
