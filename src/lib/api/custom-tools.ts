import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  CreateCustomToolInputSchema,
  CustomToolSchema,
  CustomToolsHubSchema,
  UpdateCustomToolInputSchema,
  UpdateCustomToolsSettingsInputSchema,
  type CreateCustomToolInput,
  type CustomTool,
  type CustomToolsHub,
  type UpdateCustomToolInput,
  type UpdateCustomToolsSettingsInput,
} from "@/lib/schemas/custom-tools";

export async function getCustomToolsHub(): Promise<CustomToolsHub> {
  const json = await apiGet<unknown>("/api/tools");
  return CustomToolsHubSchema.parse(json);
}

export async function updateCustomToolsSettings(
  input: UpdateCustomToolsSettingsInput
): Promise<CustomToolsHub> {
  const parsed = UpdateCustomToolsSettingsInputSchema.parse(input);
  const json = await apiPatch<unknown>("/api/tools", parsed);
  return CustomToolsHubSchema.parse(json);
}

export async function createCustomTool(
  input: CreateCustomToolInput
): Promise<CustomTool> {
  const parsed = CreateCustomToolInputSchema.parse(input);
  const json = await apiPost<unknown>("/api/tools", parsed);
  return CustomToolSchema.parse(json);
}

export async function updateCustomTool(
  id: string,
  input: UpdateCustomToolInput
): Promise<CustomTool> {
  const parsed = UpdateCustomToolInputSchema.parse(input);
  const json = await apiPatch<unknown>(`/api/tools/${id}`, parsed);
  return CustomToolSchema.parse(json);
}

export async function deleteCustomTool(id: string): Promise<void> {
  await apiDelete(`/api/tools/${id}`);
}
