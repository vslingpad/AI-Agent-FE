"use client";

import { Loader2Icon } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBillingOverview, useBillingPortalSession } from "@/hooks/use-billing";
import {
  planLimitReachedDescription,
  planLimitReachedMemberDescription,
  planLimitReachedTitle,
  type PlanLimitResource,
} from "@/lib/billing/plan-limits";

type PlanLimitReachedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: PlanLimitResource;
  limit: number;
  planName?: string;
};

export function PlanLimitReachedDialog({
  open,
  onOpenChange,
  resource,
  limit,
  planName: planNameProp,
}: PlanLimitReachedDialogProps) {
  const { membership } = useOrganization();
  const { data: billing } = useBillingOverview();
  const portalSession = useBillingPortalSession();
  const isAdmin = membership?.role === "org:admin";
  const planName = planNameProp ?? billing?.subscription.planName;

  const handleUpgrade = async () => {
    try {
      const session = await portalSession.mutateAsync();
      window.open(session.url, "_blank", "noopener,noreferrer");
    } catch {
      // Mutation toast is shown globally.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{planLimitReachedTitle(resource)}</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? planLimitReachedDescription(resource, limit, planName)
              : planLimitReachedMemberDescription(resource, limit, planName)}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isAdmin ? "Not now" : "Close"}
          </Button>
          {isAdmin ? (
            <Button disabled={portalSession.isPending} onClick={() => void handleUpgrade()}>
              {portalSession.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Upgrade
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
