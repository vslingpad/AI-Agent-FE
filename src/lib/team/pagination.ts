import { TeamListQuerySchema } from "@/lib/schemas/team";

export function parseTeamListQuery(searchParams: URLSearchParams) {
  const query = searchParams.get("query")?.trim();

  return TeamListQuerySchema.parse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    query: query || undefined,
  });
}

export function toClerkPagination(query: { page: number; pageSize: number }) {
  return {
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  };
}

export function toTotalPages(totalCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}
