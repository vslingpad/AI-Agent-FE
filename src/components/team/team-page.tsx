"use client";

import { useState } from "react";
import { Show, useUser } from "@clerk/nextjs";
import { Loader2Icon, SearchIcon, Trash2Icon } from "lucide-react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateTeamInvitation,
  useRemoveTeamMember,
  useRevokeTeamInvitation,
  useTeamInvitations,
  useTeamMembers,
  useUpdateTeamMemberRole,
  type OrgMemberRole,
} from "@/hooks/use-team";
import { ApiError } from "@/lib/api/client";
import { formatOrgRole, getOrgInitials } from "@/lib/org-utils";
import {
  TEAM_PAGE_SIZE_OPTIONS,
  type TeamInvitation,
  type TeamListQuery,
  type TeamMember,
} from "@/lib/schemas/team";
import { toTotalPages } from "@/lib/team/pagination";
import { cn } from "@/lib/utils";

type TeamTab = "members" | "invitations";

const selectClassName =
  "h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60";

const defaultMembersQuery: TeamListQuery = { page: 1, pageSize: 10 };
const defaultInvitationsQuery: TeamListQuery = { page: 1, pageSize: 10 };

export function TeamPage() {
  const [activeTab, setActiveTab] = useState<TeamTab>("members");
  const [actionError, setActionError] = useState<string | null>(null);
  const [membersQuery, setMembersQuery] = useState<TeamListQuery>(defaultMembersQuery);
  const [invitationsQuery, setInvitationsQuery] =
    useState<TeamListQuery>(defaultInvitationsQuery);

  const activeQuery = activeTab === "members" ? membersQuery : invitationsQuery;
  const activeSearch = activeQuery.query ?? "";

  const handleSearchChange = (value: string) => {
    const nextQuery = value.trim();

    if (activeTab === "members") {
      setMembersQuery((current) => ({
        ...current,
        page: 1,
        query: nextQuery || undefined,
      }));
      return;
    }

    setInvitationsQuery((current) => ({
      ...current,
      page: 1,
      query: nextQuery || undefined,
    }));
  };

  return (
    <Show
      when={{ role: "org:admin" }}
      fallback={
        <AgentPageFrame
          title="Team"
          description="Manage organization members and invitations."
        >
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">Admin access required</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Only organization admins can manage team members and invitations.
            </p>
          </div>
        </AgentPageFrame>
      }
    >
      <AgentPageFrame
        title="Team"
        description="Manage who has access to your organization and invite new members."
      >
        {actionError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TeamTab)}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between max-w-5xl">
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invitations">Invitations</TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-72">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={activeSearch}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={
                  activeTab === "members" ? "Search members…" : "Search invitations…"
                }
                className="h-9 pl-8"
                aria-label={
                  activeTab === "members" ? "Search members" : "Search invitations"
                }
              />
            </div>
          </div>

          <TabsContent value="members">
            <MembersTab
              query={membersQuery}
              onQueryChange={setMembersQuery}
              onError={setActionError}
              onClearError={() => setActionError(null)}
            />
          </TabsContent>

          <TabsContent value="invitations">
            <InvitationsTab
              query={invitationsQuery}
              onQueryChange={setInvitationsQuery}
              onError={setActionError}
              onClearError={() => setActionError(null)}
            />
          </TabsContent>
        </Tabs>
      </AgentPageFrame>
    </Show>
  );
}

function MembersTab({
  query,
  onQueryChange,
  onError,
  onClearError,
}: {
  query: TeamListQuery;
  onQueryChange: (query: TeamListQuery) => void;
  onError: (message: string) => void;
  onClearError: () => void;
}) {
  const { user } = useUser();
  const { data, isLoading, isError, refetch } = useTeamMembers(query);
  const updateRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();

  const members = data?.members ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = toTotalPages(totalCount, query.pageSize);
  const pageStart = (query.page - 1) * query.pageSize;

  const handleRoleChange = async (member: TeamMember, role: OrgMemberRole) => {
    if (member.role === role) {
      return;
    }

    onClearError();

    try {
      await updateRole.mutateAsync({ userId: member.userId, input: { role } });
    } catch (error) {
      onError(getErrorMessage(error));
    }
  };

  const handleRemove = async (member: TeamMember) => {
    onClearError();

    try {
      await removeMember.mutateAsync(member.userId);

      if (members.length === 1 && query.page > 1) {
        onQueryChange({ ...query, page: query.page - 1 });
      }
    } catch (error) {
      onError(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <TeamTableSkeleton columns={4} rows={query.pageSize} />;
  }

  if (isError || !data) {
    return (
      <TeamErrorState
        message="Unable to load members."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <TeamTableCard
      empty={totalCount === 0}
      emptyTitle={query.query ? "No members found" : "No members yet"}
      emptyDescription={
        query.query
          ? "Try a different name or email address."
          : "Invite someone to join your organization."
      }
      pagination={
        totalCount > 0 ? (
          <TablePagination
            page={query.page}
            totalPages={totalPages}
            totalItems={totalCount}
            pageStart={pageStart}
            pageSize={query.pageSize}
            pageSizeOptions={TEAM_PAGE_SIZE_OPTIONS}
            onPageChange={(page) => onQueryChange({ ...query, page })}
            onPageSizeChange={(pageSize) => onQueryChange({ page: 1, pageSize, query: query.query })}
          />
        ) : null
      }
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const isCurrentUser = member.userId === user?.id;
            const isPending =
              (updateRole.isPending && updateRole.variables?.userId === member.userId) ||
              (removeMember.isPending && removeMember.variables === member.userId);

            return (
              <tr key={member.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <MemberAvatar member={member} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">
                          {formatMemberName(member)}
                        </p>
                        {isCurrentUser ? (
                          <Badge variant="muted" className="text-[11px]">
                            You
                          </Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-muted-foreground">
                        {member.email ?? "No email"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    className={selectClassName}
                    value={member.role}
                    disabled={isCurrentUser || isPending}
                    aria-label={`Role for ${formatMemberName(member)}`}
                    onChange={(event) =>
                      void handleRoleChange(member, event.target.value as OrgMemberRole)
                    }
                  >
                    <option value="org:admin">Admin</option>
                    <option value="org:member">Member</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatTeamDate(member.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isCurrentUser || isPending}
                      aria-label={`Remove ${formatMemberName(member)}`}
                      onClick={() => void handleRemove(member)}
                    >
                      {removeMember.isPending && removeMember.variables === member.userId ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <Trash2Icon className="size-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TeamTableCard>
  );
}

function InvitationsTab({
  query,
  onQueryChange,
  onError,
  onClearError,
}: {
  query: TeamListQuery;
  onQueryChange: (query: TeamListQuery) => void;
  onError: (message: string) => void;
  onClearError: () => void;
}) {
  const { data, isLoading, isError, refetch } = useTeamInvitations(query);
  const createInvitation = useCreateTeamInvitation();
  const revokeInvitation = useRevokeTeamInvitation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgMemberRole>("org:member");

  const invitations = data?.invitations ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = toTotalPages(totalCount, query.pageSize);
  const pageStart = (query.page - 1) * query.pageSize;

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClearError();

    try {
      await createInvitation.mutateAsync({ emailAddress: email.trim(), role });
      setEmail("");
      setRole("org:member");
      onQueryChange({ ...query, page: 1 });
    } catch (error) {
      onError(getErrorMessage(error));
    }
  };

  const handleRevoke = async (invitation: TeamInvitation) => {
    onClearError();

    try {
      await revokeInvitation.mutateAsync(invitation.id);

      if (invitations.length === 1 && query.page > 1) {
        onQueryChange({ ...query, page: query.page - 1 });
      }
    } catch (error) {
      onError(getErrorMessage(error));
    }
  };

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <Card className="border-border">
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Invite member</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Send an invitation email to add someone to your organization.
            </p>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleInvite}>
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-2 sm:w-40">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                className={cn(selectClassName, "w-full")}
                value={role}
                onChange={(event) => setRole(event.target.value as OrgMemberRole)}
              >
                <option value="org:member">Member</option>
                <option value="org:admin">Admin</option>
              </select>
            </div>

            <Button type="submit" disabled={createInvitation.isPending || !email.trim()}>
              {createInvitation.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Inviting…
                </>
              ) : (
                "Invite"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <TeamTableSkeleton columns={5} rows={query.pageSize} />
      ) : isError || !data ? (
        <TeamErrorState
          message="Unable to load invitations."
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        <TeamTableCard
          empty={totalCount === 0}
          emptyTitle={query.query ? "No invitations found" : "No pending invitations"}
          emptyDescription={
            query.query
              ? "Try a different email address."
              : "Invited members will appear here until they accept."
          }
          pagination={
            totalCount > 0 ? (
              <TablePagination
                page={query.page}
                totalPages={totalPages}
                totalItems={totalCount}
                pageStart={pageStart}
                pageSize={query.pageSize}
                pageSizeOptions={TEAM_PAGE_SIZE_OPTIONS}
                onPageChange={(page) => onQueryChange({ ...query, page })}
                onPageSizeChange={(pageSize) =>
                  onQueryChange({ page: 1, pageSize, query: query.query })
                }
              />
            ) : null
          }
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Email address</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Invited</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => {
                const isPending =
                  revokeInvitation.isPending &&
                  revokeInvitation.variables === invitation.id;

                return (
                  <tr key={invitation.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{invitation.emailAddress}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatOrgRole(invitation.role)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatTeamDate(invitation.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="muted">Pending</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => void handleRevoke(invitation)}
                        >
                          {isPending ? (
                            <>
                              <Loader2Icon className="size-4 animate-spin" />
                              Revoking…
                            </>
                          ) : (
                            "Revoke"
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TeamTableCard>
      )}
    </div>
  );
}

function TeamTableCard({
  children,
  empty,
  emptyTitle,
  emptyDescription,
  pagination,
}: {
  children: React.ReactNode;
  empty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  pagination: React.ReactNode;
}) {
  if (empty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Card className="max-w-5xl overflow-hidden border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">{children}</div>
        {pagination}
      </CardContent>
    </Card>
  );
}

function MemberAvatar({ member }: { member: TeamMember }) {
  const name = formatMemberName(member);

  if (member.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.imageUrl}
        alt={name}
        className="size-8 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {getOrgInitials(name)}
    </div>
  );
}

function TeamTableSkeleton({
  columns,
  rows,
}: {
  columns: number;
  rows: number;
}) {
  return (
    <Card className="max-w-5xl border-border">
      <CardContent className="space-y-0 p-0">
        <div className="border-b border-border px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-24" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-8 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TeamErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex max-w-5xl flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm font-medium">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex max-w-5xl flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function formatMemberName(member: TeamMember) {
  const parts = [member.firstName, member.lastName].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return member.email ?? "Member";
}

function formatTeamDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong";
}
