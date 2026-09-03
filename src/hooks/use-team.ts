"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import {
  createTeamInvitation,
  getTeamInvitations,
  getTeamMembers,
  removeTeamMember,
  revokeTeamInvitation,
  updateTeamMemberRole,
} from "@/lib/api/team";
import type {
  CreateTeamInvitationInput,
  OrgMemberRole,
  TeamListQuery,
  UpdateTeamMemberInput,
} from "@/lib/schemas/team";

function teamMembersKey(orgId?: string, query?: TeamListQuery) {
  return ["team", orgId, "members", query?.page, query?.pageSize, query?.query] as const;
}

function teamInvitationsKey(orgId?: string, query?: TeamListQuery) {
  return ["team", orgId, "invitations", query?.page, query?.pageSize, query?.query] as const;
}

export function useTeamMembers(query: TeamListQuery) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: teamMembersKey(organization?.id, query),
    queryFn: () => getTeamMembers(query),
    enabled: isLoaded && Boolean(organization?.id),
  });
}

export function useTeamInvitations(query: TeamListQuery) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: teamInvitationsKey(organization?.id, query),
    queryFn: () => getTeamInvitations(query),
    enabled: isLoaded && Boolean(organization?.id),
  });
}

export function useCreateTeamInvitation() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: CreateTeamInvitationInput) => createTeamInvitation(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["team", organization?.id, "invitations"],
      });
    },
  });
}

export function useRevokeTeamInvitation() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (invitationId: string) => revokeTeamInvitation(invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["team", organization?.id, "invitations"],
      });
    },
  });
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: ({
      userId,
      input,
    }: {
      userId: string;
      input: UpdateTeamMemberInput;
    }) => updateTeamMemberRole(userId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["team", organization?.id, "members"],
      });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (userId: string) => removeTeamMember(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["team", organization?.id, "members"],
      });
    },
  });
}

export type { OrgMemberRole };
