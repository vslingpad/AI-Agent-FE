import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  CreateTeamInvitationInputSchema,
  TeamInvitationsListSchema,
  TeamInvitationSchema,
  TeamMembersListSchema,
  TeamMemberSchema,
  UpdateTeamMemberInputSchema,
  type CreateTeamInvitationInput,
  type TeamInvitation,
  type TeamListQuery,
  type TeamMember,
  type UpdateTeamMemberInput,
} from "@/lib/schemas/team";

function teamQueryParams(query: TeamListQuery) {
  return {
    page: String(query.page),
    pageSize: String(query.pageSize),
    ...(query.query ? { query: query.query } : {}),
  };
}

export async function getTeamMembers(query: TeamListQuery) {
  const json = await apiGet<unknown>("/api/team/members", teamQueryParams(query));
  return TeamMembersListSchema.parse(json);
}

export async function getTeamInvitations(query: TeamListQuery) {
  const json = await apiGet<unknown>("/api/team/invitations", teamQueryParams(query));
  return TeamInvitationsListSchema.parse(json);
}

export async function createTeamInvitation(input: CreateTeamInvitationInput) {
  const body = CreateTeamInvitationInputSchema.parse(input);
  const json = await apiPost<unknown>("/api/team/invitations", body);
  return TeamInvitationSchema.parse(json) as TeamInvitation;
}

export async function revokeTeamInvitation(invitationId: string) {
  const json = await apiDelete<unknown>(`/api/team/invitations/${invitationId}`);
  return TeamInvitationSchema.parse(json) as TeamInvitation;
}

export async function updateTeamMemberRole(userId: string, input: UpdateTeamMemberInput) {
  const body = UpdateTeamMemberInputSchema.parse(input);
  const json = await apiPatch<unknown>(`/api/team/members/${userId}`, body);
  return TeamMemberSchema.parse(json) as TeamMember;
}

export async function removeTeamMember(userId: string) {
  await apiDelete(`/api/team/members/${userId}`);
}
