import {
  QueryClient,
  type DefaultOptions,
  type MutationCache,
} from "@tanstack/react-query";

/**
 * Retry mặc định: không retry lỗi 4xx (duck-typing `status`, không phụ thuộc class ApiError từng app).
 */
export function hubDefaultQueryRetry(failureCount: number, error: unknown): boolean {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
      ? (error as { status: number }).status
      : Number.NaN;
  if (Number.isFinite(status) && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < 2;
}

/** Cấu hình mặc định dùng chung cho @frontend và @backend. */
export const hubQueryClientDefaultOptions: DefaultOptions = {
  queries: {
    /** List/detail admin: hiển thị cache ngay khi quay lại trong cửa sổ này. */
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    retry: hubDefaultQueryRetry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    /** Chỉ refetch khi dữ liệu đã stale — tránh flash loading khi chuyển trang. */
    refetchOnMount: true,
    structuralSharing: true,
  },
  mutations: {
    retry: false,
  },
};

export type CreateHubQueryClientOptions = {
  mutationCache?: MutationCache;
};

export function createHubQueryClient(
  options?: CreateHubQueryClientOptions,
): QueryClient {
  return new QueryClient({
    defaultOptions: hubQueryClientDefaultOptions,
    mutationCache: options?.mutationCache,
  });
}
