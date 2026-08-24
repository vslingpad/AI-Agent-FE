export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  path: string,
  init: RequestInit,
  params?: Record<string, string | undefined>
): Promise<T> {
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, value);
      }
    }
  }

  const query = searchParams.toString();
  const url = query ? `${path}?${query}` : path;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new ApiError(
      errorBody?.error ?? `Request failed: ${response.statusText}`,
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  return apiRequest<T>(path, { method: "GET" }, params);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  params?: Record<string, string | undefined>
): Promise<T> {
  return apiRequest<T>(
    path,
    { method: "POST", body: body ? JSON.stringify(body) : undefined },
    params
  );
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  params?: Record<string, string | undefined>
): Promise<T> {
  return apiRequest<T>(
    path,
    { method: "PATCH", body: JSON.stringify(body) },
    params
  );
}

export async function apiDelete<T>(
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" }, params);
}
