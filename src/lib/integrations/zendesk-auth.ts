export type ZendeskAuthStatus = {
  sunshine: boolean;
  globalAuth: boolean;
};

export function getZendeskAuthStatus(
  config: Record<string, unknown>
): ZendeskAuthStatus {
  const auth = config.auth as
    | { sunshine?: boolean; globalAuth?: boolean; global_auth?: boolean }
    | undefined;

  return {
    sunshine: auth?.sunshine ?? false,
    globalAuth: auth?.globalAuth ?? auth?.global_auth ?? false,
  };
}

export function capabilityRequiresGlobalAuth(capability: string) {
  return capability === "knowledge" || capability === "action";
}

export function mergeZendeskAuthConfig(
  config: Record<string, unknown>,
  patch: Partial<ZendeskAuthStatus>
) {
  const current = getZendeskAuthStatus(config);

  return {
    ...config,
    auth: {
      sunshine: patch.sunshine ?? current.sunshine,
      globalAuth: patch.globalAuth ?? current.globalAuth,
    },
  };
}
