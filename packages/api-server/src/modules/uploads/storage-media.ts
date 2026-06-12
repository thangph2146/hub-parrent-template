import * as path from 'path';

import { isImageExt } from '../../common/image-processor';
import {
  resolveStorageFolderDisplayLabel,
  type StorageFolderLabelLookup,
} from './storage-folder-labels';

export type { StorageFolderLabelLookup } from './storage-folder-labels';

export type StorageMediaKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'other';

/** Bốn dạng lưu trữ chính trên kho. */

export type StorageRealm = 'images' | 'files' | 'videos' | 'audio';

const VIDEO_EXT = new Set(['.mp4', '.mov', '.avi', '.m4v', '.webm']);

const AUDIO_EXT = new Set(['.mp3', '.wav']);

const DOCUMENT_EXT = new Set([
  '.pdf',

  '.doc',

  '.docx',

  '.xls',

  '.xlsx',

  '.csv',

  '.rtf',

  '.txt',

  '.ppt',

  '.pptx',
]);

const ARCHIVE_EXT = new Set(['.zip', '.rar', '.7z']);

const STORAGE_REALM_ORDER: StorageRealm[] = [
  'images',
  'files',
  'videos',
  'audio',
];

const STORAGE_REALM_LABELS: Record<StorageRealm, string> = {
  images: 'Hình ảnh',
  files: 'Tệp tin',
  videos: 'Video',
  audio: 'Âm thanh',
};

/** Nhãn hiển thị cho tab folder con trong từng realm. */

const STORAGE_TAB_LABELS: Record<string, string> = {
  admincp: 'Admin CP',

  avatars: 'Ảnh đại diện',

  events: 'Sự kiện',

  guides: 'Hướng dẫn',

  'san-pham': 'Sản phẩm',

  files: 'Tệp tin',

  videos: 'Video',

  images: 'Hình ảnh',

  audio: 'Âm thanh',
};

export interface StorageTabDto {
  id: string;

  label: string;

  count: number;
}

export function classifyStorageMedia(
  ext: string,

  mimeType: string,
): StorageMediaKind {
  const normalizedExt = ext.toLowerCase();

  const mime = mimeType.toLowerCase();

  if (isImageExt(normalizedExt) || mime.startsWith('image/')) {
    return 'image';
  }

  if (VIDEO_EXT.has(normalizedExt) || mime.startsWith('video/')) {
    return 'video';
  }

  if (AUDIO_EXT.has(normalizedExt) || mime.startsWith('audio/')) {
    return 'audio';
  }

  if (ARCHIVE_EXT.has(normalizedExt)) {
    return 'archive';
  }

  if (DOCUMENT_EXT.has(normalizedExt) || mime.startsWith('text/')) {
    return 'document';
  }

  return 'other';
}

export function isVideoStorageFile(ext: string, mimeType: string): boolean {
  return classifyStorageMedia(ext, mimeType) === 'video';
}

export function isAudioStorageFile(ext: string, mimeType: string): boolean {
  return classifyStorageMedia(ext, mimeType) === 'audio';
}

/**

 * Realm = images | files | videos | audio (theo loại media, không chỉ prefix path).

 * Video/audio trong files/legacy vẫn thuộc tab Video/Âm thanh.

 */

export function getStorageRealm(
  relativePath: string,

  mediaKind: StorageMediaKind,
): StorageRealm {
  const normalized = relativePath.replace(/\\/g, '/');

  if (normalized.startsWith('audio/')) return 'audio';

  if (normalized.startsWith('videos/')) return 'videos';

  if (mediaKind === 'audio') return 'audio';

  if (mediaKind === 'video') return 'videos';

  if (mediaKind === 'image') return 'images';

  return 'files';
}

/**

 * Tab folder con trong realm (admincp, avatars, files, videos, …).

 * - images/admincp/... → admincp

 * - files/... → files hoặc subfolder

 * - videos/events/... → events

 */

function normalizeStoragePath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/\/$/, '');
}

/** Thư mục trên disk thuộc realm nào. */
export function folderBelongsToRealm(
  folderPath: string,
  realm: StorageRealm,
): boolean {
  const normalized = normalizeStoragePath(folderPath);
  if (realm === 'images') {
    if (normalized === 'images' || normalized.startsWith('images/')) {
      return true;
    }
    if (
      normalized === 'files' ||
      normalized.startsWith('files/') ||
      normalized === 'videos' ||
      normalized.startsWith('videos/') ||
      normalized === 'audio' ||
      normalized.startsWith('audio/')
    ) {
      return false;
    }
    return true;
  }
  if (realm === 'files') {
    return normalized === 'files' || normalized.startsWith('files/');
  }
  if (realm === 'videos') {
    return normalized === 'videos' || normalized.startsWith('videos/');
  }
  return normalized === 'audio' || normalized.startsWith('audio/');
}

/** Tab folder cấp 1 từ path thư mục trên disk. */
export function getFolderTabIdFromDiskPath(
  folderPath: string,
  realm: StorageRealm,
): string | null {
  const parts = normalizeStoragePath(folderPath).split('/').filter(Boolean);
  if (!parts.length) return null;

  if (realm === 'images') {
    if (parts[0] === 'images') return parts.length >= 2 ? parts[1] : null;
    if (parts[0] === 'files' || parts[0] === 'videos' || parts[0] === 'audio') {
      return null;
    }
    return parts[0];
  }
  if (realm === 'files') {
    if (parts[0] !== 'files') return null;
    return parts.length >= 2 ? parts[1] : 'files';
  }
  if (realm === 'videos') {
    if (parts[0] !== 'videos') return null;
    return parts.length >= 2 ? parts[1] : 'videos';
  }
  if (parts[0] !== 'audio') return null;
  return parts.length >= 2 ? parts[1] : 'audio';
}

/** Prefix path trên disk cho tab folder cha (admincp → images/admincp, …). */
export function parentStoragePrefixes(
  parentTabId: string,
  realm: StorageRealm,
): string[] {
  const tab = parentTabId.trim();
  if (tab.includes('/')) {
    return [
      tab,
      `images/${tab}`,
      `videos/${tab}`,
      `audio/${tab}`,
      `files/${tab}`,
    ];
  }
  if (realm === 'images') {
    return [`images/${tab}`, tab];
  }
  if (realm === 'files') {
    return tab === 'files' ? ['files'] : [`files/${tab}`, 'files'];
  }
  if (realm === 'videos') {
    return tab === 'videos' ? ['videos'] : [`videos/${tab}`, 'videos'];
  }
  return tab === 'audio' ? ['audio'] : [`audio/${tab}`, 'audio'];
}

export function fileUnderParentTab(
  relativePath: string,
  parentTabId: string,
  realm: StorageRealm,
): boolean {
  const normalized = normalizeStoragePath(relativePath);
  return parentStoragePrefixes(parentTabId, realm).some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/** Tab con = segment ngay dưới folder cha (admincp/buh_slidehome). */
export function extractSubFolderTabId(
  relativePath: string,
  parentTabId: string,
  realm: StorageRealm,
): string | null {
  const normalized = normalizeStoragePath(relativePath);
  for (const prefix of parentStoragePrefixes(parentTabId, realm)) {
    if (!normalized.startsWith(`${prefix}/`)) continue;
    const rest = normalized.slice(prefix.length + 1);
    const segment = rest.split('/')[0];
    if (!segment) return null;
    return `${parentTabId}/${segment}`;
  }
  return null;
}

export function getStorageTabId(relativePath: string): string {
  const parts = relativePath.replace(/\\/g, '/').split('/').filter(Boolean);

  if (!parts.length) return 'other';

  if (parts[0] === 'images' && parts.length >= 2) return parts[1];

  if (parts[0] === 'videos' && parts.length >= 2) return parts[1];

  if (parts[0] === 'audio' && parts.length >= 2) return parts[1];

  if (parts[0] === 'files') {
    return parts.length >= 2 ? parts[1] : 'files';
  }

  return parts[0];
}

export function formatStorageTabLabel(tabId: string): string {
  if (STORAGE_TAB_LABELS[tabId]) return STORAGE_TAB_LABELS[tabId];

  // Tên folder UTF-8 / có khoảng trắng — hiển thị đúng như trên disk.
  // eslint-disable-next-line no-control-regex -- phát hiện ký tự ngoài ASCII
  if (/[^\x00-\x7F]/.test(tabId) || /\s/.test(tabId)) {
    return tabId;
  }

  return tabId

    .replace(/[_-]+/g, ' ')

    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Bốn tab cố định: Hình ảnh / Tệp tin / Video / Âm thanh. */

export function buildStorageRealms(
  items: Array<{ relativePath: string; mediaKind: StorageMediaKind }>,
): StorageTabDto[] {
  const counts: Record<StorageRealm, number> = {
    images: 0,

    files: 0,

    videos: 0,

    audio: 0,
  };

  for (const item of items) {
    const realm = getStorageRealm(item.relativePath, item.mediaKind);

    counts[realm] += 1;
  }

  return STORAGE_REALM_ORDER.map((id) => ({
    id,

    label: STORAGE_REALM_LABELS[id],

    count: counts[id],
  }));
}

/** Tab folder con trong một realm đang chọn. */

export function buildStorageFolderTabs(
  items: Array<{
    relativePath: string;

    mediaKind: StorageMediaKind;
  }>,

  realm?: StorageRealm,

  diskFolders?: string[],
  labelLookup?: StorageFolderLabelLookup,
): StorageTabDto[] {
  const scoped = realm
    ? items.filter(
        (item) => getStorageRealm(item.relativePath, item.mediaKind) === realm,
      )
    : items;

  const counts = new Map<string, number>();

  for (const item of scoped) {
    const tabId = getStorageTabId(item.relativePath);

    counts.set(tabId, (counts.get(tabId) ?? 0) + 1);
  }

  if (realm && diskFolders?.length) {
    for (const folderPath of diskFolders) {
      if (!folderBelongsToRealm(folderPath, realm)) continue;
      const tabId = getFolderTabIdFromDiskPath(folderPath, realm);
      if (tabId && !counts.has(tabId)) {
        counts.set(tabId, 0);
      }
    }
  }

  return [...counts.entries()]

    .map(([id, count]) => ({
      id,

      label: resolveStorageFolderDisplayLabel(id, id, labelLookup),

      count,
    }))

    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'vi'));
}

/** Tab folder con (cấp 2) trong một tab cha — vd. admincp/buh_slidehome. */
export function buildStorageSubFolderTabs(
  items: Array<{
    relativePath: string;
    mediaKind: StorageMediaKind;
  }>,
  realm: StorageRealm,
  parentTabId: string,
  diskFolders?: string[],
  labelLookup?: StorageFolderLabelLookup,
): StorageTabDto[] {
  const parent = parentTabId.trim();
  if (!parent || parent.includes('/')) return [];

  const scoped = items.filter(
    (item) =>
      getStorageRealm(item.relativePath, item.mediaKind) === realm &&
      fileUnderParentTab(item.relativePath, parent, realm),
  );

  const counts = new Map<string, number>();
  for (const item of scoped) {
    const subId = extractSubFolderTabId(item.relativePath, parent, realm);
    if (subId) {
      counts.set(subId, (counts.get(subId) ?? 0) + 1);
    }
  }

  if (diskFolders?.length) {
    for (const folderPath of diskFolders) {
      if (!folderBelongsToRealm(folderPath, realm)) continue;
      const subId = extractSubFolderTabId(folderPath, parent, realm);
      if (subId && !counts.has(subId)) {
        counts.set(subId, 0);
      }
    }
  }

  return [...counts.entries()]
    .map(([id, count]) => {
      const segment = id.split('/').pop() ?? id;
      return {
        id,
        label: resolveStorageFolderDisplayLabel(segment, id, labelLookup),
        count,
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'vi'));
}

/** @deprecated Dùng buildStorageFolderTabs — giữ tên cũ cho test/import nội bộ. */

export function buildStorageTabs(
  items: Array<{ relativePath: string; mediaKind?: StorageMediaKind }>,
): StorageTabDto[] {
  return buildStorageFolderTabs(
    items.map((item) => ({
      relativePath: item.relativePath,

      mediaKind: item.mediaKind ?? 'other',
    })),
  );
}

export function matchesStorageRealm(
  relativePath: string,

  mediaKind: StorageMediaKind,

  realm: StorageRealm | undefined,
): boolean {
  if (!realm) return true;

  return getStorageRealm(relativePath, mediaKind) === realm;
}

export function matchesStorageTab(
  relativePath: string,

  tabId: string | undefined,
): boolean {
  if (!tabId?.trim()) return true;

  const normalized = normalizeStoragePath(relativePath);
  const tab = tabId.trim().replace(/\\/g, '/');

  if (tab.includes('/')) {
    const prefixes = [
      tab,
      `images/${tab}`,
      `videos/${tab}`,
      `audio/${tab}`,
      `files/${tab}`,
    ];
    return prefixes.some(
      (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
    );
  }

  return getStorageTabId(normalized) === tab;
}

export function basenameFromPath(relativePath: string): string {
  return path.posix.basename(relativePath.replace(/\\/g, '/'));
}
