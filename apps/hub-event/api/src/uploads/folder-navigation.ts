import type { StorageRealm } from './storage-media';
import { getStorageRealm } from './storage-media';
import {
  resolveStorageFolderDisplayLabel,
  type StorageFolderLabelLookup,
} from './storage-folder-labels';

export interface StorageTabDto {
  id: string;
  label: string;
  count: number;
}

function normalizeStoragePath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/\/$/, '');
}

/** Path điều hướng (không prefix realm) → prefix trên disk. */
export function normalizeParentFolderPath(
  realm: StorageRealm,
  folderPath: string,
): string {
  const fp = folderPath.trim().replace(/\\/g, '/').replace(/\/$/, '');
  if (!fp) return '';
  if (
    fp.startsWith('images/') ||
    fp.startsWith('files/') ||
    fp.startsWith('videos/') ||
    fp.startsWith('audio/')
  ) {
    return fp;
  }
  if (realm === 'images') return `images/${fp}`;
  if (realm === 'files') return fp === 'files' ? 'files' : `files/${fp}`;
  if (realm === 'videos') {
    return fp === 'videos' ? 'videos' : `videos/${fp}`;
  }
  return fp === 'audio' ? 'audio' : `audio/${fp}`;
}

export function parentFolderPrefixes(
  realm: StorageRealm,
  folderPath: string,
): string[] {
  const parent = normalizeParentFolderPath(realm, folderPath);
  if (!parent) {
    if (realm === 'images') return ['images'];
    if (realm === 'files') return ['files'];
    if (realm === 'videos') return ['videos'];
    return ['audio'];
  }
  const nav = folderPath.trim().replace(/\/$/, '');
  const prefixes = new Set<string>([parent]);
  if (realm === 'images' && nav && !nav.startsWith('images/')) {
    prefixes.add(nav);
  }
  return [...prefixes];
}

/** File nằm trong folder (cả cây con). */
export function fileUnderFolderPath(
  relativePath: string,
  folderPath: string,
  realm: StorageRealm,
): boolean {
  const normalized = normalizeStoragePath(relativePath);
  return parentFolderPrefixes(realm, folderPath).some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/** Phần path còn lại ngay dưới prefix folder cha (không tính file nằm trực tiếp). */
function relativePathBelowFolderPrefix(
  relativePath: string,
  parentFolderPath: string,
  realm: StorageRealm,
): string | null {
  const normalized = normalizeStoragePath(relativePath);
  for (const prefix of parentFolderPrefixes(realm, parentFolderPath)) {
    if (!normalized.startsWith(`${prefix}/`)) continue;
    const rest = normalized.slice(prefix.length + 1);
    if (!rest || !rest.includes('/')) return null;
    return rest;
  }
  return null;
}

/** Folder con trực tiếp — id = path điều hướng (admincp/buh/…). */
export function extractImmediateChildFolder(
  relativePath: string,
  parentFolderPath: string,
  realm: StorageRealm,
): string | null {
  const rest = relativePathBelowFolderPrefix(
    relativePath,
    parentFolderPath,
    realm,
  );
  if (!rest) return null;
  const segment = rest.split('/')[0];
  if (!segment) return null;
  const baseNav = parentFolderPath.trim().replace(/\/$/, '');
  return baseNav ? `${baseNav}/${segment}` : segment;
}

export function extractImmediateChildFromDiskFolder(
  diskFolderPath: string,
  parentFolderPath: string,
  realm: StorageRealm,
): string | null {
  const normalized = normalizeStoragePath(diskFolderPath);
  for (const prefix of parentFolderPrefixes(realm, parentFolderPath)) {
    if (!normalized.startsWith(`${prefix}/`)) continue;
    const rest = normalized.slice(prefix.length + 1);
    const segment = rest.split('/')[0];
    if (!segment) return null;
    const baseNav = parentFolderPath.trim().replace(/\/$/, '');
    return baseNav ? `${baseNav}/${segment}` : segment;
  }
  return null;
}

/** File nằm trực tiếp trong folder đang mở (không gồm file ở subfolder). */
export function fileDirectlyInFolderPath(
  relativePath: string,
  folderPath: string,
  realm: StorageRealm,
): boolean {
  const normalized = normalizeStoragePath(relativePath);
  for (const prefix of parentFolderPrefixes(realm, folderPath)) {
    if (!normalized.startsWith(`${prefix}/`)) continue;
    const rest = normalized.slice(prefix.length + 1);
    return rest.length > 0 && !rest.includes('/');
  }
  return false;
}

/** Lọc file theo folder đang mở — chỉ file trực tiếp, không gồm cây con. */
export function matchesStorageFolderPath(
  relativePath: string,
  folderPath: string | undefined,
  realm: StorageRealm,
): boolean {
  if (!folderPath?.trim()) {
    const normalized = normalizeStoragePath(relativePath);
    const rootPrefix =
      realm === 'images'
        ? 'images'
        : realm === 'files'
          ? 'files'
          : realm === 'videos'
            ? 'videos'
            : 'audio';
    if (normalized.startsWith(`${rootPrefix}/`)) {
      const rest = normalized.slice(rootPrefix.length + 1);
      return rest.length > 0 && !rest.includes('/');
    }
    if (realm === 'images') {
      return normalized.length > 0 && !normalized.includes('/');
    }
    return false;
  }
  return fileDirectlyInFolderPath(relativePath, folderPath, realm);
}

/** Lọc file theo phạm vi folder — trực tiếp hoặc gồm toàn bộ cây con. */
export function matchesStorageFolderScope(
  relativePath: string,
  folderPath: string | undefined,
  realm: StorageRealm,
  includeDescendants: boolean,
): boolean {
  if (includeDescendants) {
    if (!folderPath?.trim()) return true;
    return fileUnderFolderPath(relativePath, folderPath, realm);
  }
  return matchesStorageFolderPath(relativePath, folderPath, realm);
}

/** Tab folder con trực tiếp tại path hiện tại — không giới hạn độ sâu. */
export function buildChildFolderTabs(
  items: Array<{ relativePath: string; mediaKind: StorageMediaKind }>,
  realm: StorageRealm,
  parentFolderPath: string,
  diskFolders?: string[],
  labelLookup?: StorageFolderLabelLookup,
): StorageTabDto[] {
  type Media = { relativePath: string; mediaKind: StorageMediaKind };
  const scoped = items.filter(
    (item) => getStorageRealm(item.relativePath, item.mediaKind) === realm,
  );

  const counts = new Map<string, number>();

  const addChildCounts = (source: Media[]) => {
    for (const item of source) {
      if (
        parentFolderPath &&
        !fileUnderFolderPath(item.relativePath, parentFolderPath, realm)
      ) {
        continue;
      }
      const childId = extractImmediateChildFolder(
        item.relativePath,
        parentFolderPath,
        realm,
      );
      if (!childId) continue;
      counts.set(childId, (counts.get(childId) ?? 0) + 1);
    }
  };

  addChildCounts(scoped);

  if (diskFolders?.length) {
    for (const folderPath of diskFolders) {
      const childId = extractImmediateChildFromDiskFolder(
        folderPath,
        parentFolderPath,
        realm,
      );
      if (!childId || counts.has(childId)) continue;
      counts.set(childId, 0);
    }
  }

  return [...counts.entries()]
    .map(([id, count]) => ({
      id,
      label: resolveStorageFolderDisplayLabel(
        id.split('/').pop() ?? id,
        id,
        labelLookup,
      ),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'vi'));
}

export function buildStorageBreadcrumb(
  realm: StorageRealm,
  folderPath: string,
  labelLookup?: StorageFolderLabelLookup,
): Array<{ id: string; label: string }> {
  const nav = folderPath.trim().replace(/\\/g, '/').replace(/\/$/, '');
  if (!nav) return [];
  const parts = nav.split('/').filter(Boolean);
  const crumbs: Array<{ id: string; label: string }> = [];
  let current = '';
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    crumbs.push({
      id: current,
      label: resolveStorageFolderDisplayLabel(part, current, labelLookup),
    });
  }
  return crumbs;
}

type StorageMediaKind = import('./storage-media').StorageMediaKind;
