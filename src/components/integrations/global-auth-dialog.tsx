"use client";

import { useEffect, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useCompleteOAuthStep,
  useConnectStatus,
  useStartOAuthStep,
} from "@/hooks/use-integrations";
import type {
  ConnectorCapability,
  ConnectSession,
} from "@/lib/schemas/integrations";

type GlobalAuthDialogProps = {
  connectorId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingCapability: ConnectorCapability | null;
  onAuthorized: (capability: ConnectorCapability) => void;
};

export function GlobalAuthDialog({
  connectorId,
  open,
  onOpenChange,
  pendingCapability,
  onAuthorized,
}: GlobalAuthDialogProps) {
  const startOAuth = useStartOAuthStep(connectorId);
  const completeOAuth = useCompleteOAuthStep(connectorId);
  const [session, setSession] = useState<ConnectSession | null>(null);
  const connectStatus = useConnectStatus(
    connectorId,
    session?.connectSessionId ?? null,
    open && Boolean(session?.connectSessionId)
  );

  useEffect(() => {
    if (connectStatus.data) {
      setSession(connectStatus.data);
    }
  }, [connectStatus.data]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSession(null);
    }

    onOpenChange(next);
  };

  const handleStart = async () => {
    const nextSession = await startOAuth.mutateAsync("global_auth");
    setSession(nextSession);
  };

  const handleAuthorize = async () => {
    if (!session || !pendingCapability) {
      return;
    }

    const alreadyDone =
      session.status === "active" ||
      session.wizard.steps.some(
        (item) => item.id === "global_auth" && item.status === "complete"
      );

    if (alreadyDone) {
      onAuthorized(pendingCapability);
      setSession(null);
      onOpenChange(false);
      return;
    }

    if (!session.wizard.currentStep) {
      return;
    }

    const result = await completeOAuth.mutateAsync({
      connectSessionId: session.connectSessionId,
      stepId: session.wizard.currentStep,
    });
    const nextSession = result.session;
    setSession(nextSession);

    const globalAuthDone = nextSession.wizard.steps.some(
      (item) => item.id === "global_auth" && item.status === "complete"
    );

    if (!globalAuthDone && nextSession.status !== "active") {
      return;
    }

    onAuthorized(pendingCapability);
    setSession(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zendesk Global Auth required</DialogTitle>
          <DialogDescription>
            {pendingCapability === "knowledge"
              ? "Help Center sync requires Support & Guide authorization."
              : "Support ticket actions require Support & Guide authorization."}{" "}
            Sunshine Messaging auth alone is not sufficient for this capability.
          </DialogDescription>
        </DialogHeader>

        {!session ? (
          <p className="text-sm text-muted-foreground">
            You will be redirected to Zendesk to approve read/write access for
            Support and Help Center APIs.
          </p>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium">Support &amp; Guide (Global Auth)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign in as a Zendesk admin and approve the requested scopes.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {!session ? (
            <Button onClick={handleStart} disabled={startOAuth.isPending}>
              Continue to authorize
            </Button>
          ) : (
            <div className="flex gap-2">
              {session.authorizeUrl ? (
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
                  Open Zendesk
                  <ExternalLinkIcon />
                </Button>
              ) : null}
              <Button
                onClick={handleAuthorize}
                disabled={completeOAuth.isPending}
              >
                {completeOAuth.isPending ? "Verifying…" : "Complete authorization"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
