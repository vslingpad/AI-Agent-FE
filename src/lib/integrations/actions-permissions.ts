import type {
  ConnectorCapability,
  ConnectorDetail,
} from "@/lib/schemas/integrations";
import { getZendeskAuthStatus } from "@/lib/integrations/zendesk-auth";

export type ActionsPermissionFix =
  | "enable_actions"
  | "enable_channel"
  | "authorize_global_auth"
  | "reconnect";

export type ActionsPermissionIssue = {
  title: string;
  description: string;
  fix?: ActionsPermissionFix;
  fixLabel?: string;
};

export function getActionsPermissionIssue(
  connector: ConnectorDetail,
  enabled_capabilities: ConnectorCapability[]
): ActionsPermissionIssue | null {
  const actions = connector.actions ?? [];
  const missingActions = actions.filter((action) => !action.permission_granted);

  if (missingActions.length === 0) {
    return null;
  }

  const countLabel = `${missingActions.length} action${missingActions.length === 1 ? "" : "s"}`;

  if (!enabled_capabilities.includes("action")) {
    return {
      title: `${countLabel} unavailable`,
      description:
        "Enable the Actions capability to expose tools for your agents.",
      fix: "enable_actions",
      fixLabel: "Enable Actions",
    };
  }

  if (connector.reauth_required) {
    const scope = connector.reauth_scope ?? "sunshine";
    const globalAuthScope = scope === "global_auth" || scope === "both";

    return {
      title: `${countLabel} missing permissions`,
      description: globalAuthScope
        ? "Support & Guide authorization expired. Reconnect to restore action tools."
        : "Authorization expired. Reconnect to restore access.",
      fix: "reconnect",
      fixLabel: "Reconnect",
    };
  }

  if (connector.integration_slug === "zendesk") {
    const auth = getZendeskAuthStatus(connector.config);
    const needsGlobalAuth = missingActions.some((action) =>
      action.required_scope?.toLowerCase().includes("global auth")
    );
    const needsChannel = missingActions.some((action) =>
      action.required_scope?.toLowerCase().includes("sunshine")
    );

    if (needsGlobalAuth && !auth.globalAuth) {
      return {
        title: `${countLabel} missing permissions`,
        description:
          "Ticket actions require Support & Guide authorization (Zendesk Global Auth).",
        fix: "authorize_global_auth",
        fixLabel: "Authorize Support & Guide",
      };
    }

    if (needsChannel && !enabled_capabilities.includes("channel")) {
      return {
        title: `${countLabel} missing permissions`,
        description:
          "Messaging handover requires the Channel capability and Sunshine authorization.",
        fix: "enable_channel",
        fixLabel: "Enable Channel",
      };
    }
  }

  const policyOnly = missingActions.every((action) =>
    action.required_scope?.toLowerCase().includes("policy")
  );

  if (policyOnly) {
    return {
      title: `${countLabel} restricted`,
      description:
        "These actions require connector policy configuration before they can be used.",
    };
  }

  return {
    title: `${countLabel} missing permissions`,
    description:
      "Complete authorization or update connector settings to unlock restricted tools.",
  };
}
