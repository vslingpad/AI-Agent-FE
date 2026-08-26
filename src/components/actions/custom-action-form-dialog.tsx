"use client";

import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
  useCreateCustomTool,
  useUpdateCustomTool,
} from "@/hooks/use-custom-tools";
import { CUSTOM_TOOL_AUTH_LABELS } from "@/lib/actions/action-utils";
import type {
  AuthKeysInput,
  CustomTool,
  CustomToolAuthType,
  CustomToolHttpMethod,
  ResponseMappingMode,
} from "@/lib/schemas/custom-tools";

const HTTP_METHODS: CustomToolHttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];

const AUTH_TYPES: CustomToolAuthType[] = [
  "none",
  "api_key",
  "bearer",
  "basic",
  "oauth2",
];

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClassName =
  "min-h-20 w-full rounded-md border border-input bg-transparent px-2.5 py-2 font-mono text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CustomActionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: CustomTool | null;
};

export function CustomActionFormDialog({
  open,
  onOpenChange,
  tool,
}: CustomActionFormDialogProps) {
  const isEditing = Boolean(tool);
  const createTool = useCreateCustomTool();
  const updateTool = useUpdateCustomTool();

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [httpMethod, setHttpMethod] = useState<CustomToolHttpMethod>("GET");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [authType, setAuthType] = useState<CustomToolAuthType>("api_key");
  const [headerName, setHeaderName] = useState("X-API-Key");
  const [apiKey, setApiKey] = useState("");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tokenUrl, setTokenUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [scope, setScope] = useState("");
  const [responseMode, setResponseMode] =
    useState<ResponseMappingMode>("full_body");
  const [responsePaths, setResponsePaths] = useState("");
  const [proceduresEnabled, setProceduresEnabled] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDisplayName(tool?.displayName ?? "");
    setDescription(tool?.description ?? "");
    setHttpMethod(tool?.httpMethod ?? "GET");
    setEndpointUrl(tool?.endpointUrl ?? "");
    setAuthType(tool?.authType ?? "api_key");
    setHeaderName(tool?.auth.headerName ?? "X-API-Key");
    setApiKey("");
    setToken("");
    setUsername(tool?.auth.username ?? "");
    setPassword("");
    setTokenUrl(tool?.auth.tokenUrl ?? "");
    setClientId(tool?.auth.clientId ?? "");
    setClientSecret("");
    setScope(tool?.auth.scope ?? "");
    setResponseMode(tool?.responseMapping.mode ?? "full_body");
    setResponsePaths((tool?.responseMapping.paths ?? []).join("\n"));
    setProceduresEnabled(tool?.proceduresEnabled ?? false);
    setShowApiKey(false);
  }, [open, tool]);

  const parsedPaths = responsePaths
    .split("\n")
    .map((path) => path.trim())
    .filter(Boolean);

  const authKeysValid = isAuthKeysValid({
    authType,
    isEditing,
    hasSecret: tool?.auth.hasSecret ?? false,
    headerName,
    apiKey,
    token,
    username,
    password,
    tokenUrl,
    clientId,
    clientSecret,
  });

  const valid =
    displayName.trim().length > 0 &&
    description.trim().length > 0 &&
    endpointUrl.trim().length > 0 &&
    authKeysValid &&
    (responseMode === "full_body" || parsedPaths.length > 0);

  const isPending = createTool.isPending || updateTool.isPending;

  const buildAuthKeys = (): AuthKeysInput => ({
    headerName: headerName.trim() || undefined,
    apiKey: apiKey.trim() || undefined,
    token: token.trim() || undefined,
    username: username.trim() || undefined,
    password: password.trim() || undefined,
    tokenUrl: tokenUrl.trim() || undefined,
    clientId: clientId.trim() || undefined,
    clientSecret: clientSecret.trim() || undefined,
    scope: scope.trim() || undefined,
  });

  const handleSubmit = async () => {
    if (!valid) {
      return;
    }

    const payload = {
      displayName: displayName.trim(),
      description: description.trim(),
      httpMethod,
      endpointUrl: endpointUrl.trim(),
      authType,
      authKeys: buildAuthKeys(),
      responseMapping: {
        mode: responseMode,
        paths: responseMode === "json_path" ? parsedPaths : [],
      },
      proceduresEnabled,
    };

    if (tool) {
      await updateTool.mutateAsync({
        id: tool.id,
        input: payload,
      });
    } else {
      await createTool.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  const secretPlaceholder = isEditing && tool?.auth.hasSecret
    ? "Leave blank to keep the current value"
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(85vh,800px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit custom action" : "Add custom action"}
          </DialogTitle>
          <DialogDescription>
            Define an HTTP API the agent can call during a conversation, and
            optionally from Procedures.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <section className="grid gap-4">
            <h3 className="text-sm font-medium">Basics</h3>
            <div className="space-y-2">
              <Label htmlFor="action-name">Name</Label>
              <Input
                id="action-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Order Lookup"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-description">Description</Label>
              <Input
                id="action-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Look up shipping status when the customer provides an order number."
              />
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="text-sm font-medium">Request</h3>
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="action-method">Method</Label>
                <select
                  id="action-method"
                  className={selectClassName}
                  value={httpMethod}
                  onChange={(event) =>
                    setHttpMethod(event.target.value as CustomToolHttpMethod)
                  }
                >
                  {HTTP_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action-url">Full URL</Label>
                <Input
                  id="action-url"
                  value={endpointUrl}
                  onChange={(event) => setEndpointUrl(event.target.value)}
                  placeholder="https://api.acme.com/v1/orders/{{args.order_id}}"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{args.field}}"} placeholders for values the AI fills
                  in.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="text-sm font-medium">Auth</h3>
            <div className="space-y-2">
              <Label htmlFor="action-auth">Auth type</Label>
              <select
                id="action-auth"
                className={selectClassName}
                value={authType}
                onChange={(event) =>
                  setAuthType(event.target.value as CustomToolAuthType)
                }
              >
                {AUTH_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {CUSTOM_TOOL_AUTH_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            {authType === "api_key" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="action-header-name">Header name</Label>
                  <Input
                    id="action-header-name"
                    value={headerName}
                    onChange={(event) => setHeaderName(event.target.value)}
                    placeholder="X-API-Key"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action-api-key">API key</Label>
                  <div className="relative">
                    <Input
                      id="action-api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      placeholder={secretPlaceholder ?? "Enter API key"}
                      autoComplete="off"
                      className="pr-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowApiKey((visible) => !visible)}
                      aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    >
                      {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
            {authType === "bearer" ? (
              <div className="space-y-2">
                <Label htmlFor="action-token">Bearer token</Label>
                <Input
                  id="action-token"
                  type="password"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder={secretPlaceholder ?? "Enter token"}
                  autoComplete="off"
                />
              </div>
            ) : null}
            {authType === "basic" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="action-username">Username</Label>
                  <Input
                    id="action-username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="service-account"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action-password">Password</Label>
                  <Input
                    id="action-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={secretPlaceholder ?? "Enter password"}
                    autoComplete="off"
                  />
                </div>
              </div>
            ) : null}
            {authType === "oauth2" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="action-token-url">Token URL</Label>
                  <Input
                    id="action-token-url"
                    value={tokenUrl}
                    onChange={(event) => setTokenUrl(event.target.value)}
                    placeholder="https://api.acme.com/oauth/token"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action-client-id">Client ID</Label>
                  <Input
                    id="action-client-id"
                    value={clientId}
                    onChange={(event) => setClientId(event.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action-client-secret">Client secret</Label>
                  <Input
                    id="action-client-secret"
                    type="password"
                    value={clientSecret}
                    onChange={(event) => setClientSecret(event.target.value)}
                    placeholder={secretPlaceholder ?? "Enter client secret"}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="action-scope">Scope</Label>
                  <Input
                    id="action-scope"
                    value={scope}
                    onChange={(event) => setScope(event.target.value)}
                    placeholder="refunds:write"
                  />
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4">
            <h3 className="text-sm font-medium">Response</h3>
            <div className="space-y-2">
              <Label htmlFor="action-response-mode">Format</Label>
              <select
                id="action-response-mode"
                className={selectClassName}
                value={responseMode}
                onChange={(event) =>
                  setResponseMode(event.target.value as ResponseMappingMode)
                }
              >
                <option value="full_body">Full response body</option>
                <option value="json_path">JSON paths</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {responseMode === "full_body"
                  ? "The agent receives the full API response, truncated at 15,000 characters."
                  : "Only the listed fields are passed to the agent."}
              </p>
            </div>
            {responseMode === "json_path" ? (
              <div className="space-y-2">
                <Label htmlFor="action-response-paths">JSON paths</Label>
                <textarea
                  id="action-response-paths"
                  className={textareaClassName}
                  value={responsePaths}
                  onChange={(event) => setResponsePaths(event.target.value)}
                  placeholder={"status\ncarrier\ntracking_url"}
                />
                <p className="text-xs text-muted-foreground">
                  One path per line, for example data.order.status
                </p>
              </div>
            ) : null}
          </section>

          <section className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="action-procedures">Enable for Procedures</Label>
              <p className="text-xs text-muted-foreground">
                Allow this API to be called as a step in procedures only.
              </p>
            </div>
            <Switch
              id="action-procedures"
              checked={proceduresEnabled}
              onCheckedChange={(checked) => setProceduresEnabled(checked)}
            />
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!valid || isPending}>
            {isPending
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Add custom action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function isAuthKeysValid({
  authType,
  isEditing,
  hasSecret,
  headerName,
  apiKey,
  token,
  username,
  password,
  tokenUrl,
  clientId,
  clientSecret,
}: {
  authType: CustomToolAuthType;
  isEditing: boolean;
  hasSecret: boolean;
  headerName: string;
  apiKey: string;
  token: string;
  username: string;
  password: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
}) {
  const secretOk = (value: string) =>
    value.trim().length > 0 || (isEditing && hasSecret);

  switch (authType) {
    case "none":
      return true;
    case "api_key":
      return headerName.trim().length > 0 && secretOk(apiKey);
    case "bearer":
      return secretOk(token);
    case "basic":
      return username.trim().length > 0 && secretOk(password);
    case "oauth2":
      return (
        tokenUrl.trim().length > 0 &&
        clientId.trim().length > 0 &&
        secretOk(clientSecret)
      );
  }
}
