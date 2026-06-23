import { execFile } from 'child_process';
import * as path from 'path';
import { access, mkdir, rename, rm, unlink } from 'fs/promises';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const RETRYABLE_CODES = new Set(['EBUSY', 'EPERM', 'EACCES']);

export type UnlinkWithRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  ignoreMissing?: boolean;
  /** Windows: thư mục cách ly khi rename/unlink cùng thư mục bị EBUSY. */
  quarantineDirectory?: string;
  /** Windows: tổng thời gian chờ (ms) trước khi báo lỗi — mặc định 4000. */
  maxWaitMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null) {
    return (err as NodeJS.ErrnoException).code;
  }
  return undefined;
}

export function isRetryableDeleteError(err: unknown): boolean {
  const code = getErrCode(err);
  if (code != null && RETRYABLE_CODES.has(code)) return true;
  const message = err instanceof Error ? err.message : String(err ?? '');
  return /EBUSY|EPERM|EACCES|resource busy or locked/i.test(message);
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

function disposePendingFile(pendingPath: string, retryDelay: number): void {
  void rm(pendingPath, { force: true, maxRetries: 15, retryDelay }).catch(
    () => undefined,
  );
}

async function removeMovedFile(
  targetPath: string,
  baseDelayMs: number,
): Promise<void> {
  try {
    await rm(targetPath, { force: true, maxRetries: 4, retryDelay: baseDelayMs });
  } catch (rmErr) {
    if (getErrCode(rmErr) === 'ENOENT') return;
    if (isRetryableDeleteError(rmErr)) {
      disposePendingFile(targetPath, baseDelayMs);
      return;
    }
    throw rmErr;
  }
}

async function unlinkViaRenameOnce(
  filePath: string,
  baseDelayMs: number,
): Promise<void> {
  const pending = `${filePath}.pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.tmp`;
  await rename(filePath, pending);
  await removeMovedFile(pending, baseDelayMs);
}

async function unlinkViaQuarantineOnce(
  filePath: string,
  quarantineDirectory: string,
  baseDelayMs: number,
): Promise<void> {
  await mkdir(quarantineDirectory, { recursive: true });
  const dest = path.join(
    quarantineDirectory,
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${path.basename(filePath)}`,
  );
  await rename(filePath, dest);
  await removeMovedFile(dest, baseDelayMs);
}

async function unlinkViaWindowsDel(filePath: string): Promise<void> {
  const shell = process.env.ComSpec ?? 'cmd.exe';
  await execFileAsync(
    shell,
    ['/d', '/s', '/c', 'del', '/f', '/q', filePath],
    { windowsHide: true, timeout: 15_000 },
  );
  try {
    await access(filePath);
    const err = new Error(`EBUSY: still exists after del ${filePath}`) as NodeJS.ErrnoException;
    err.code = 'EBUSY';
    throw err;
  } catch (accessErr) {
    if ((accessErr as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw accessErr;
  }
}

async function unlinkWindowsWithDeadline(
  filePath: string,
  options: UnlinkWithRetryOptions,
): Promise<void> {
  const deadline = Date.now() + (options.maxWaitMs ?? 4_000);
  const baseDelayMs = options.baseDelayMs ?? 80;
  const quarantine = options.quarantineDirectory;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      await unlinkViaRenameOnce(filePath, baseDelayMs);
      return;
    } catch (err) {
      lastError = err;
      if (getErrCode(err) === 'ENOENT') throw err;
    }

    if (quarantine) {
      try {
        await unlinkViaQuarantineOnce(filePath, quarantine, baseDelayMs);
        return;
      } catch (err) {
        lastError = err;
        if (getErrCode(err) === 'ENOENT') throw err;
      }
    }

    try {
      await unlinkViaWindowsDel(filePath);
      return;
    } catch (err) {
      lastError = err;
      if (getErrCode(err) === 'ENOENT') throw err;
    }

    try {
      await rm(filePath, { force: true, maxRetries: 1, retryDelay: baseDelayMs });
      return;
    } catch (err) {
      lastError = err;
      if (getErrCode(err) === 'ENOENT') throw err;
    }

    await sleep(120);
  }

  throw lastError;
}

export async function unlinkWithRetry(
  filePath: string,
  options: UnlinkWithRetryOptions = {},
): Promise<void> {
  const isWin = process.platform === 'win32';
  const maxAttempts = options.maxAttempts ?? (isWin ? 8 : 4);
  const baseDelayMs = options.baseDelayMs ?? (isWin ? 80 : 50);
  const ignoreMissing = options.ignoreMissing ?? false;

  if (isWin) {
    try {
      await unlinkWindowsWithDeadline(filePath, options);
      return;
    } catch (err) {
      if (isIgnorableMissing(err, ignoreMissing)) return;
      throw err;
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
      const code = getErrCode(err);
      if (attempt < maxAttempts - 1 && code && RETRYABLE_CODES.has(code)) {
        await sleep(baseDelayMs * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
