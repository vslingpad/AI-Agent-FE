import { clerkClient } from "@clerk/nextjs/server";
import type {
  OrganizationInvitation,
  OrganizationMembership,
} from "@clerk/backend";
import type {
  OrgMemberRole,
  TeamInvitation,
  TeamMember,
} from "@/lib/schemas/team";

function mapMembership(membership: OrganizationMembership): TeamMember {
  const user = membership.publicUserData;

  return {
    id: membership.id,
    userId: user?.userId ?? membership.id,
    role: membership.role as OrgMemberRole,
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    email: user?.identifier ?? null,
    imageUrl: user?.imageUrl ?? null,
    createdAt: membership.createdAt,
  };
}

function mapInvitation(invitation: OrganizationInvitation): TeamInvitation {
  return {
    id: invitation.id,
    emailAddress: invitation.emailAddress ?? "",
    role: invitation.role as OrgMemberRole,
    status: invitation.status ?? "pending",
    createdAt: invitation.createdAt,
  };
}

export async function listTeamMembers(
  orgId: string,
  query: { limit: number; offset: number; search?: string }
) {
  const client = await clerkClient();
  const response = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    limit: query.limit,
    offset: query.offset,
    orderBy: "-created_at",
    ...(query.search ? { query: query.search } : {}),
  });

  return {
    members: response.data.map(mapMembership),
    totalCount: response.totalCount,
  };
}

async function fetchAllPendingInvitations(orgId: string) {
  const client = await clerkClient();
  const batchSize = 100;
  let offset = 0;
  let items: OrganizationInvitation[] = [];
  let totalCount = 0;

  while (true) {
    const response = await client.organizations.getOrganizationInvitationList({
      organizationId: orgId,
      status: ["pending"],
      limit: batchSize,
      offset,
    });

    items = items.concat(response.data);
    totalCount = response.totalCount;
    offset += response.data.length;

    if (offset >= totalCount || response.data.length === 0) {
      break;
    }
  }

  return items;
}

export async function listTeamInvitations(
  orgId: string,
  query: { limit: number; offset: number; search?: string }
) {
  if (query.search) {
    const normalized = query.search.toLowerCase();
    const filtered = (await fetchAllPendingInvitations(orgId)).filter((invitation) =>
      (invitation.emailAddress ?? "").toLowerCase().includes(normalized)
    );

    return {
      invitations: filtered
        .slice(query.offset, query.offset + query.limit)
        .map(mapInvitation),
      totalCount: filtered.length,
    };
  }

  const client = await clerkClient();
  const response = await client.organizations.getOrganizationInvitationList({
    organizationId: orgId,
    status: ["pending"],
    limit: query.limit,
    offset: query.offset,
  });

  return {
    invitations: response.data.map(mapInvitation),
    totalCount: response.totalCount,
  };
}

export async function createTeamInvitation(
  orgId: string,
  input: { emailAddress: string; role: OrgMemberRole; inviterUserId: string }
) {
  const client = await clerkClient();
  const invitation = await client.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: input.emailAddress,
    role: input.role,
    inviterUserId: input.inviterUserId,
  });

  return mapInvitation(invitation);
}

export async function revokeTeamInvitation(
  orgId: string,
  invitationId: string,
  requestingUserId: string
) {
  const client = await clerkClient();
  const invitation = await client.organizations.revokeOrganizationInvitation({
    organizationId: orgId,
    invitationId,
    requestingUserId,
  });

  return mapInvitation(invitation);
}

export async function updateTeamMemberRole(
  orgId: string,
  userId: string,
  role: OrgMemberRole
) {
  const client = await clerkClient();
  const membership = await client.organizations.updateOrganizationMembership({
    organizationId: orgId,
    userId,
    role,
  });

  return mapMembership(membership);
}

export async function removeTeamMember(orgId: string, userId: string) {
  const client = await clerkClient();
  await client.organizations.deleteOrganizationMembership({
    organizationId: orgId,
    userId,
  });
}
