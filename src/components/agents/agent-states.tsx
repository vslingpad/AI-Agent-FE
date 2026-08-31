import type { ReactNode } from "react";
import { BotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function AgentPageShell({
  withAction,
  children,
}: {
  withAction?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        {withAction ? <Skeleton className="h-9 w-24 shrink-0" /> : null}
      </div>
      {children}
    </div>
  );
}

function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function AgentWorkspaceSkeleton() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-border px-6">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex flex-1">
        <div className="w-52 border-r border-border p-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="mb-2 h-7 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-4 p-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AgentListSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function AgentAnalyticsSkeleton() {
  return (
    <AgentPageShell>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </AgentPageShell>
  );
}

export function AgentKnowledgeSkeleton() {
  return (
    <AgentPageShell withAction>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-[148px] shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <CardListSkeleton count={4} />
      </div>
    </AgentPageShell>
  );
}

export function AgentSettingsSkeleton() {
  return (
    <AgentPageShell withAction>
      <div className="grid max-w-3xl gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    </AgentPageShell>
  );
}

export function AgentActionsSkeleton() {
  return (
    <AgentPageShell withAction>
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-[92px] shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    </AgentPageShell>
  );
}

export function AgentProceduresSkeleton() {
  return (
    <AgentPageShell>
      <CardListSkeleton count={3} />
    </AgentPageShell>
  );
}

export function AgentWebChatSkeleton() {
  return (
    <AgentPageShell withAction>
      <div className="grid max-w-3xl gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    </AgentPageShell>
  );
}

export function AgentHelpDeskSkeleton() {
  return (
    <AgentPageShell withAction>
      <Skeleton className="h-56 w-full max-w-3xl rounded-xl" />
    </AgentPageShell>
  );
}

export function AgentConversationsSkeleton() {
  return (
    <AgentPageShell>
      <Skeleton className="min-h-[28rem] w-full rounded-xl" />
    </AgentPageShell>
  );
}

export function AgentImproveSkeleton() {
  return (
    <AgentPageShell>
      <CardListSkeleton count={3} />
    </AgentPageShell>
  );
}

export function AgentPlaygroundSkeleton() {
  return (
    <div className="flex h-[calc(100svh-var(--notification-banner-height)-3.5rem)] min-h-[32rem] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_280px]">
        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 space-y-3 p-6">
            <Skeleton className="h-16 w-3/4 max-w-md rounded-xl" />
            <Skeleton className="ml-auto h-12 w-2/3 max-w-sm rounded-xl" />
          </div>
          <div className="border-t border-border p-4">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="hidden border-l border-border p-4 lg:block">
          <Skeleton className="mb-4 h-4 w-16" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentTestCasesSkeleton() {
  return (
    <AgentPageShell withAction>
      <CardListSkeleton count={2} />
    </AgentPageShell>
  );
}

export function AgentTestRunsSkeleton() {
  return (
    <AgentPageShell withAction>
      <CardListSkeleton count={2} />
    </AgentPageShell>
  );
}

export function AgentErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
      <BotIcon className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
