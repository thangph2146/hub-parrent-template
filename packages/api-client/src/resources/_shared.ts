import { ApiError, type ApiClient } from "../client";
import { registerLocalMutationFromApiPath } from "../realtime/toast-coordinator";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string | null;
  data?: T;
};

type PagedApiPagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type PagedDataListPayload<T> = {
  data: T[];
  pagination?: PagedApiPagination;
};

type PagedItemsListPayload<T> = {
  items: T[];
  total?: number;
  pagination?: PagedApiPagination;
};

export type NormalizedPagedResult<T> = {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

function isPagedDataListPayload<T>(
  value: unknown,
): value is PagedDataListPayload<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as PagedDataListPayload<T>).data) &&
    "pagination" in value
  );
}

function isPagedItemsListPayload<T>(
  value: unknown,
): value is PagedItemsListPayload<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "items" in value &&
    Array.isArray((value as PagedItemsListPayload<T>).items)
  );
}

function parsePagedDataList<T>(
  body: PagedDataListPayload<T>,
): NormalizedPagedResult<T> {
  const pagination = body.pagination;
  const total =
    typeof pagination?.total === "number"
      ? pagination.total
      : body.data.length;
  return {
    items: body.data,
    total,
    page: pagination?.page,
    limit: pagination?.limit,
    totalPages: pagination?.totalPages,
  };
}

function parsePagedItemsList<T>(
  body: PagedItemsListPayload<T>,
): NormalizedPagedResult<T> {
  const pagination = body.pagination;
  return {
    items: body.items,
    total:
      typeof pagination?.total === "number"
        ? pagination.total
        : typeof body.total === "number"
          ? body.total
          : body.items.length,
    page: pagination?.page,
    limit: pagination?.limit,
    totalPages: pagination?.totalPages,
  };
}

function stripApiEnvelope(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const envelope = body as ApiEnvelope<unknown>;
  if (envelope.success === false) {
    throw new ApiError(400, "Bad Request", body, envelope.message);
  }
  if ("success" in envelope && "data" in envelope) {
    return envelope.data;
  }
  return body;
}

export function unwrapApiEnvelope<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }

  const envelope = payload as ApiEnvelope<T>;
  if (envelope.success === false) {
    throw new ApiError(400, "Bad Request", payload, envelope.message);
  }

  // `{ data: T[], pagination }` — payload phân trang, không phải API envelope.
  if (isPagedDataListPayload(envelope)) {
    return payload as T;
  }

  if ("data" in envelope) {
    return envelope.data as T;
  }
  return payload as T;
}

/**
 * Chuẩn hóa response phân trang admin.
 * Hỗ trợ:
 * - `{ success, data: { data: T[], pagination } }`
 * - `{ data: T[], pagination }` (sau getData / unwrap một lần)
 * - `{ items: T[], total?, pagination? }`
 */
export function normalizePagedResult<T>(
  payload: unknown,
): NormalizedPagedResult<T> {
  const body: unknown = stripApiEnvelope(payload);

  if (isPagedDataListPayload<T>(body)) {
    return parsePagedDataList(body);
  }

  if (Array.isArray(body)) {
    return { items: body as T[], total: body.length };
  }

  if (body && typeof body === "object" && isPagedItemsListPayload<T>(body)) {
    return parsePagedItemsList(body);
  }

  return { items: [], total: 0 };
}

export async function getData<T>(
  http: ApiClient,
  path: string,
  options?: Parameters<ApiClient["get"]>[1],
): Promise<T> {
  const payload = await http.get<unknown>(path, options);
  return unwrapApiEnvelope<T>(payload);
}

export async function postData<T>(
  http: ApiClient,
  path: string,
  body?: unknown,
  options?: Parameters<ApiClient["post"]>[2],
): Promise<T> {
  const payload = await http.post<unknown>(path, body, options);
  const result = unwrapApiEnvelope<T>(payload);
  registerLocalMutationFromApiPath("POST", path, result);
  return result;
}

export async function putData<T>(
  http: ApiClient,
  path: string,
  body?: unknown,
  options?: Parameters<ApiClient["put"]>[2],
): Promise<T> {
  const payload = await http.put<unknown>(path, body, options);
  const result = unwrapApiEnvelope<T>(payload);
  registerLocalMutationFromApiPath("PUT", path, result);
  return result;
}

export async function patchData<T>(
  http: ApiClient,
  path: string,
  body?: unknown,
  options?: Parameters<ApiClient["patch"]>[2],
): Promise<T> {
  const payload = await http.patch<unknown>(path, body, options);
  const result = unwrapApiEnvelope<T>(payload);
  registerLocalMutationFromApiPath("PATCH", path, result);
  return result;
}

export async function deleteData<T>(
  http: ApiClient,
  path: string,
  options?: Parameters<ApiClient["delete"]>[1],
): Promise<T> {
  const payload = await http.delete<unknown>(path, options);
  const result = unwrapApiEnvelope<T>(payload);
  registerLocalMutationFromApiPath("DELETE", path, result);
  return result;
}

/** Chuyển `filters` admin sang query `filter[columnId]`. */
export function toApiFilterQuery(
  filters?: Record<string, string>,
): Record<string, string> {
  if (!filters) return {};
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    const normalized = String(value ?? "").trim();
    if (!normalized) continue;
    query[`filter[${key}]`] = normalized;
  }
  return query;
}

export type AdminListQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  trash?: boolean | string;
  filters?: Record<string, string>;
  statusFilter?: number | string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  deletedAtFrom?: string;
  deletedAtTo?: string;
  speakerStatus?: number | string;
  eventId?: string;
  categoryId?: string;
  tagId?: string;
};

/** Ghép query list admin chuẩn (page, status, search + filter[column]). */
export function buildAdminListQuery(
  params?: AdminListQueryParams,
  defaults?: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean | undefined | null> {
  if (!params) return { ...(defaults ?? {}) };
  const { filters, ...rest } = params;
  return {
    ...(defaults ?? {}),
    ...rest,
    ...toApiFilterQuery(filters),
  } as Record<string, string | number | boolean | undefined | null>;
}
