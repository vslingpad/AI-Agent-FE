import type { DashboardPagination } from "@/lib/schemas/dashboard";

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; pagination: DashboardPagination } {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}
