import { z } from "zod";

export const CustomToolAuthTypeSchema = z.enum([
  "none",
  "api_key",
  "oauth2",
  "basic",
  "bearer",
]);

export const CustomToolHttpMethodSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

export const ResponseMappingModeSchema = z.enum(["full_body", "json_path"]);

export const ResponseMappingSchema = z.object({
  mode: ResponseMappingModeSchema,
  paths: z.array(z.string()).default([]),
});

export const AuthPublicSchema = z.object({
  headerName: z.string().optional(),
  username: z.string().optional(),
  tokenUrl: z.string().optional(),
  clientId: z.string().optional(),
  scope: z.string().optional(),
  hasSecret: z.boolean(),
});

export const AuthKeysInputSchema = z.object({
  headerName: z.string().optional(),
  apiKey: z.string().optional(),
  token: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  tokenUrl: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  scope: z.string().optional(),
});

export const CustomToolSchema = z.object({
  id: z.string(),
  slug: z.string(),
  displayName: z.string(),
  description: z.string(),
  httpMethod: CustomToolHttpMethodSchema,
  endpointUrl: z.string(),
  authType: CustomToolAuthTypeSchema,
  auth: AuthPublicSchema,
  responseMapping: ResponseMappingSchema,
  proceduresEnabled: z.boolean(),
  usedByAgentCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CustomToolsHubSchema = z.object({
  enabled: z.boolean(),
  tools: z.array(CustomToolSchema),
});

export const CreateCustomToolInputSchema = z.object({
  displayName: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  httpMethod: CustomToolHttpMethodSchema,
  endpointUrl: z.string().min(1).max(500),
  authType: CustomToolAuthTypeSchema,
  authKeys: AuthKeysInputSchema.optional(),
  responseMapping: ResponseMappingSchema,
  proceduresEnabled: z.boolean(),
});

export const UpdateCustomToolInputSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(500).optional(),
  httpMethod: CustomToolHttpMethodSchema.optional(),
  endpointUrl: z.string().min(1).max(500).optional(),
  authType: CustomToolAuthTypeSchema.optional(),
  authKeys: AuthKeysInputSchema.optional(),
  responseMapping: ResponseMappingSchema.optional(),
  proceduresEnabled: z.boolean().optional(),
});

export const UpdateCustomToolsSettingsInputSchema = z.object({
  enabled: z.boolean(),
});

export type CustomToolAuthType = z.infer<typeof CustomToolAuthTypeSchema>;
export type CustomToolHttpMethod = z.infer<typeof CustomToolHttpMethodSchema>;
export type ResponseMappingMode = z.infer<typeof ResponseMappingModeSchema>;
export type ResponseMapping = z.infer<typeof ResponseMappingSchema>;
export type AuthPublic = z.infer<typeof AuthPublicSchema>;
export type AuthKeysInput = z.infer<typeof AuthKeysInputSchema>;
export type CustomTool = z.infer<typeof CustomToolSchema>;
export type CustomToolsHub = z.infer<typeof CustomToolsHubSchema>;
export type CreateCustomToolInput = z.infer<typeof CreateCustomToolInputSchema>;
export type UpdateCustomToolInput = z.infer<typeof UpdateCustomToolInputSchema>;
export type UpdateCustomToolsSettingsInput = z.infer<
  typeof UpdateCustomToolsSettingsInputSchema
>;
