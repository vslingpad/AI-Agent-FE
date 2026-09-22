export type PlanLimitResource = "agents" | "integrations";

export function isPlanResourceAtLimit(used: number, limit: number | null) {
  return limit !== null && used >= limit;
}

export function planLimitReachedTitle(resource: PlanLimitResource) {
  return resource === "agents" ? "Agent limit reached" : "Integration limit reached";
}

export function planLimitReachedDescription(
  resource: PlanLimitResource,
  limit: number,
  planName?: string
) {
  const planLabel = planName ? `Your ${planName} plan` : "Your plan";

  if (resource === "agents") {
    return `${planLabel} includes ${limit} agent${limit === 1 ? "" : "s"}. Upgrade to create more.`;
  }

  return `${planLabel} includes ${limit} integration${limit === 1 ? "" : "s"}. Upgrade to connect more.`;
}

export function planLimitReachedMemberDescription(
  resource: PlanLimitResource,
  limit: number,
  planName?: string
) {
  const planLabel = planName ? `Your organization's ${planName} plan` : "Your organization's plan";

  if (resource === "agents") {
    return `${planLabel} includes ${limit} agent${limit === 1 ? "" : "s"}. Ask an organization admin to upgrade.`;
  }

  return `${planLabel} includes ${limit} integration${limit === 1 ? "" : "s"}. Ask an organization admin to upgrade.`;
}
