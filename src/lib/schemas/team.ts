import { z } from "zod";

export const OrgMemberRoleSchema = z.enum(["org:admin", "org:member"]);

export const TeamMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: OrgMemberRoleSchema,
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.number(),
});

export const TeamMembersListSchema = z.object({
  members: z.array(TeamMemberSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const TeamInvitationSchema = z.object({
  id: z.string(),
  emailAddress: z.string(),
  role: OrgMemberRoleSchema,
  status: z.string(),
  createdAt: z.number(),
});

export const TeamInvitationsListSchema = z.object({
  invitations: z.array(TeamInvitationSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const TeamListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  query: z.string().trim().optional(),
});

export const CreateTeamInvitationInputSchema = z.object({
  emailAddress: z.email(),
  role: OrgMemberRoleSchema.default("org:member"),
});

export const UpdateTeamMemberInputSchema = z.object({
  role: OrgMemberRoleSchema,
});

export type OrgMemberRole = z.infer<typeof OrgMemberRoleSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type TeamInvitation = z.infer<typeof TeamInvitationSchema>;
export type CreateTeamInvitationInput = z.infer<
  typeof CreateTeamInvitationInputSchema
>;
export type UpdateTeamMemberInput = z.infer<typeof UpdateTeamMemberInputSchema>;
export type TeamListQuery = z.infer<typeof TeamListQuerySchema>;

export const TEAM_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
