/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * API Response Formatter.
 *
 * Bám sát pattern `apps/main/api/src/common/api-response.ts`.
 *
 * Format response giống tuyen-sinh-admin (success, message, error, data).
 */
export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message?: string;
  error?: string | null;
  data?: T;
}

const DEFAULT_SUCCESS_MESSAGE = 'Thao tác thành công';
const DEFAULT_ERROR_MESSAGE = 'Đã xảy ra lỗi';

export function createSuccessResponse<T>(
  payload: T,
  options?: { message?: string; status?: number },
): { statusCode: number; body: ApiResponsePayload<T> } {
  return {
    statusCode: options?.status ?? 200,
    body: {
      success: true,
      message: options?.message ?? DEFAULT_SUCCESS_MESSAGE,
      error: null,
      data: payload,
    },
  };
}

export function createErrorResponse(
  message?: string,
  options?: { status?: number; error?: string; data?: unknown },
): { statusCode: number; body: ApiResponsePayload } {
  return {
    statusCode: options?.status ?? 400,
    body: {
      success: false,
      message: message ?? DEFAULT_ERROR_MESSAGE,
      error: options?.error ?? message ?? DEFAULT_ERROR_MESSAGE,
      data: options?.data,
    },
  };
}

export function ok<T>(data: T, message?: string): ApiResponsePayload<T> {
  return {
    success: true,
    message: message ?? DEFAULT_SUCCESS_MESSAGE,
    error: null,
    data,
  };
}

export function fail(
  message: string,
  data?: unknown,
): ApiResponsePayload {
  return {
    success: false,
    message,
    error: message,
    data,
  };
}
