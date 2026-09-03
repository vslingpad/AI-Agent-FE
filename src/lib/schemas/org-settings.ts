import { z } from "zod";

export const OrganizationSettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  imageUrl: z.string().nullable(),
  hasImage: z.boolean(),
});

export const UpdateOrganizationSettingsInputSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required"),
});

export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>;
export type UpdateOrganizationSettingsInput = z.infer<
  typeof UpdateOrganizationSettingsInputSchema
>;
