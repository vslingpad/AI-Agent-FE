import { clerkClient } from "@clerk/nextjs/server";
import type { Organization } from "@clerk/backend";
import type { OrganizationSettings } from "@/lib/schemas/org-settings";

export function mapOrganizationSettings(org: Organization): OrganizationSettings {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug ?? null,
    imageUrl: org.imageUrl ?? null,
    hasImage: org.hasImage,
  };
}

export async function getOrganizationSettings(orgId: string) {
  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ organizationId: orgId });
  return mapOrganizationSettings(org);
}

export async function updateOrganizationName(orgId: string, name: string) {
  const client = await clerkClient();
  const org = await client.organizations.updateOrganization(orgId, { name });
  return mapOrganizationSettings(org);
}

export async function updateOrganizationLogo(
  orgId: string,
  file: File,
  uploaderUserId: string
) {
  const client = await clerkClient();
  const org = await client.organizations.updateOrganizationLogo(orgId, {
    file,
    uploaderUserId,
  });
  return mapOrganizationSettings(org);
}

export async function deleteOrganizationLogo(orgId: string) {
  const client = await clerkClient();
  const org = await client.organizations.deleteOrganizationLogo(orgId);
  return mapOrganizationSettings(org);
}

export async function leaveOrganization(orgId: string, userId: string) {
  const client = await clerkClient();
  await client.organizations.deleteOrganizationMembership({
    organizationId: orgId,
    userId,
  });
}
