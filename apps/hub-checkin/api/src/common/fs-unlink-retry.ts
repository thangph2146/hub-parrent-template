/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { rename, rm, unlink } from 'fs/promises';

const RETRYABLE_CODES = new Set(['EBUSY', 'EPERM', 'EACCES']);

export type UnlinkWithRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  ignoreMissing?: boolean;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isIgnorableMissing(
  err: unknown,
  ignoreMissing: boolean,
): err is NodeJS.ErrnoException {
  return (
    ignoreMissing &&
    typeof err === 'object' &&
    err !== null &&
    (err as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

/** Windows: đổi tên file đang bị lock rồi xóa bản copy — thường thành công hơn unlink trực tiếp. */
async function unlinkViaRename(
  filePath: string,
  maxRetries: number,
  retryDelay: number,
): Promise<void> {
  const pending = `${filePath}.pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.tmp`;
  await rename(filePath, pending);
  await rm(pending, { force: true, maxRetries, retryDelay });
}

export async function unlinkWithRetry(
  filePath: string,
  options: UnlinkWithRetryOptions = {},
): Promise<void> {
  const isWin = process.platform === 'win32';
  const maxAttempts = options.maxAttempts ?? (isWin ? 15 : 4);
  const baseDelayMs = options.baseDelayMs ?? (isWin ? 250 : 50);
  const ignoreMissing = options.ignoreMissing ?? false;

  if (isWin) {
    try {
      await rm(filePath, {
        force: true,
        maxRetries: maxAttempts,
        retryDelay: baseDelayMs,
      });
      return;
    } catch (err) {
      if (isIgnorableMissing(err, ignoreMissing)) return;
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'EBUSY' || code === 'EPERM' || code === 'EACCES') {
        try {
          await unlinkViaRename(filePath, maxAttempts, baseDelayMs);
          return;
        } catch (renameErr) {
          if (isIgnorableMissing(renameErr, ignoreMissing)) return;
          /* fallback loop below */
        }
      } else {
        throw err;
      }
    }
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await unlink(filePath);
      return;
    } catch (err) {
      lastError = err;
      if (isIgnorableMissing(err, ignoreMissing)) return;
      const errno = err as NodeJS.ErrnoException;
      if (
        isWin &&
        attempt === Math.floor(maxAttempts / 2) &&
        errno.code &&
        RETRYABLE_CODES.has(errno.code)
      ) {
        try {
          await unlinkViaRename(filePath, 5, baseDelayMs);
          return;
        } catch {
          /* continue loop */
        }
      }
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
