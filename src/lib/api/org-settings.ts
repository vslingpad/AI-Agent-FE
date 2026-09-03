import { ApiError, apiDelete, apiPatch, apiPost } from "@/lib/api/client";
import {
  OrganizationSettingsSchema,
  UpdateOrganizationSettingsInputSchema,
  type OrganizationSettings,
  type UpdateOrganizationSettingsInput,
} from "@/lib/schemas/org-settings";

export async function updateOrganizationSettings(input: UpdateOrganizationSettingsInput) {
  const body = UpdateOrganizationSettingsInputSchema.parse(input);
  const json = await apiPatch<unknown>("/api/settings/organization", body);
  return OrganizationSettingsSchema.parse(json);
}

export async function uploadOrganizationLogo(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/settings/organization/logo", {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new ApiError(
      errorBody?.error ?? `Request failed: ${response.statusText}`,
      response.status
    );
  }

  const json = await response.json();
  return OrganizationSettingsSchema.parse(json) as OrganizationSettings;
}

export async function removeOrganizationLogo() {
  const json = await apiDelete<unknown>("/api/settings/organization/logo");
  return OrganizationSettingsSchema.parse(json);
}

export async function leaveOrganization() {
  await apiPost("/api/settings/organization/leave");
}
