/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { unlink } from 'fs/promises';

const RETRYABLE_CODES = new Set(['EBUSY', 'EPERM', 'EACCES']);

export type UnlinkWithRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  ignoreMissing?: boolean;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function unlinkWithRetry(
  filePath: string,
  options: UnlinkWithRetryOptions = {},
): Promise<void> {
  const isWin = process.platform === 'win32';
  const maxAttempts = options.maxAttempts ?? (isWin ? 10 : 4);
  const baseDelayMs = options.baseDelayMs ?? (isWin ? 150 : 50);
  const ignoreMissing = options.ignoreMissing ?? false;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await unlink(filePath);
      return;
    } catch (err) {
      lastError = err;
      const errno = err as NodeJS.ErrnoException;
      if (errno.code === 'ENOENT' && ignoreMissing) return;
      if (
        attempt < maxAttempts - 1 &&
        errno.code &&
        RETRYABLE_CODES.has(errno.code)
      ) {
        await sleep(baseDelayMs * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
