import { access, readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import { unlinkWithRetry } from '../common';

const TOMBSTONE_FILENAME = '.hub-storage-tombstones.json';

type TombstoneStore = {
  paths: string[];
};

let tombstones = new Set<string>();
let storePath = '';
let loaded = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const pendingPhysicalDeletes = new Map<
  string,
  { fullPath: string; relativePath: string; quarantineDirectory: string }
>();

function normalizeRelativePath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/^\/+/, '').trim();
}

export async function preloadStorageDeleteTombstones(): Promise<void> {
  await ensureLoaded();
}

export function initStorageDeleteTombstones(storageDir: string): void {
  storePath = path.join(path.normalize(storageDir), TOMBSTONE_FILENAME);
  loaded = false;
}

async function ensureLoaded(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw) as TombstoneStore;
    tombstones = new Set(
      (parsed.paths ?? [])
        .map((p) => normalizeRelativePath(String(p)))
        .filter(Boolean),
    );
  } catch {
    tombstones = new Set();
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushTombstones();
  }, 250);
}

async function flushTombstones(): Promise<void> {
  if (!storePath) return;
  const payload: TombstoneStore = {
    paths: [...tombstones].sort(),
  };
  await writeFile(storePath, JSON.stringify(payload, null, 2), 'utf8');
}

export function isStoragePathTombstoned(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  return normalized.length > 0 && tombstones.has(normalized);
}

export async function addStorageDeleteTombstone(
  relativePath: string,
): Promise<void> {
  await ensureLoaded();
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return;
  tombstones.add(normalized);
  scheduleFlush();
}

export async function removeStorageDeleteTombstone(
  relativePath: string,
): Promise<void> {
  await ensureLoaded();
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return;
  if (!tombstones.delete(normalized)) return;
  scheduleFlush();
}

async function fileExists(fullPath: string): Promise<boolean> {
  try {
    await access(fullPath);
    return true;
  } catch {
    return false;
  }
}

async function runPhysicalDelete(
  fullPath: string,
  relativePath: string,
  quarantineDirectory: string,
): Promise<boolean> {
  try {
    await unlinkWithRetry(fullPath, {
      quarantineDirectory,
      maxWaitMs: 8_000,
    });
    await removeStorageDeleteTombstone(relativePath);
    return true;
  } catch {
    const stillThere = await fileExists(fullPath);
    if (!stillThere) {
      await removeStorageDeleteTombstone(relativePath);
      return true;
    }
    return false;
  }
}

function ensureBackgroundWorker(): void {
  if (process.env.NODE_ENV === 'test') return;
  if ((ensureBackgroundWorker as { started?: boolean }).started) return;
  (ensureBackgroundWorker as { started?: boolean }).started = true;

  setInterval(() => {
    void (async () => {
      if (!pendingPhysicalDeletes.size) return;
      for (const [key, job] of [...pendingPhysicalDeletes.entries()]) {
        const ok = await runPhysicalDelete(
          job.fullPath,
          job.relativePath,
          job.quarantineDirectory,
        );
        if (ok) pendingPhysicalDeletes.delete(key);
      }
    })();
  }, 2_000);
}

export function scheduleStoragePhysicalDelete(
  fullPath: string,
  relativePath: string,
  quarantineDirectory: string,
): void {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return;
  pendingPhysicalDeletes.set(normalized, {
    fullPath,
    relativePath: normalized,
    quarantineDirectory,
  });
  ensureBackgroundWorker();
  void runPhysicalDelete(fullPath, normalized, quarantineDirectory);
}
