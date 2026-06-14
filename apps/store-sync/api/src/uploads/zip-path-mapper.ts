/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import * as path from 'path';

const ZIP_PATH_PREFIX_STRIPS = [
  'uploads/',
  'data/',
  'storage/',
  'public/',
  'wwwroot/',
] as const;

const IMAGE_STORAGE_PREFIX = 'images/';
const FILE_STORAGE_PREFIX = 'files/';
const VIDEO_STORAGE_PREFIX = 'videos/';
const AUDIO_STORAGE_PREFIX = 'audio/';

/** Thư mục legacy CMS (admincp/...) nằm dưới uploads/images trên disk. */
const LEGACY_IMAGE_ROOT_MARKERS = ['admincp/'] as const;

export function normalizeZipEntryPath(raw: string): string | null {
  const normalized = raw.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.endsWith('/')) return null;
  if (normalized.includes('..')) return null;
  if (normalized.startsWith('__MACOSX/') || normalized.includes('/__MACOSX/'))
    return null;
  const base = path.posix.basename(normalized);
  if (base === '.DS_Store' || base.startsWith('._')) return null;
  return normalized;
}

function sliceFromStorageRoot(normalized: string): string | null {
  const imagesIdx = normalized.indexOf(IMAGE_STORAGE_PREFIX);
  const filesIdx = normalized.indexOf(FILE_STORAGE_PREFIX);
  const videosIdx = normalized.indexOf(VIDEO_STORAGE_PREFIX);
  const audioIdx = normalized.indexOf(AUDIO_STORAGE_PREFIX);

  const hits = [
    { idx: imagesIdx, prefix: IMAGE_STORAGE_PREFIX },
    { idx: filesIdx, prefix: FILE_STORAGE_PREFIX },
    { idx: videosIdx, prefix: VIDEO_STORAGE_PREFIX },
    { idx: audioIdx, prefix: AUDIO_STORAGE_PREFIX },
  ]
    .filter((hit) => hit.idx >= 0)
    .sort((a, b) => a.idx - b.idx);

  if (hits.length > 0) {
    return normalized.slice(hits[0].idx);
  }
  return null;
}

function legacyImagePath(normalized: string): string | null {
  for (const marker of LEGACY_IMAGE_ROOT_MARKERS) {
    const idx = normalized.indexOf(marker);
    if (idx >= 0) {
      return normalized.slice(idx);
    }
  }
  return null;
}

function peelKnownPrefixes(normalized: string): string {
  let current = normalized;
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of ZIP_PATH_PREFIX_STRIPS) {
      if (current.startsWith(prefix)) {
        current = current.slice(prefix.length);
        changed = true;
      }
    }
  }
  return current;
}

/**
 * Chuẩn hóa đường dẫn entry ZIP → relativePath trên kho (giữ cấu trúc folder gốc).
 * Hỗ trợ ZIP đa wrapper: kho-luu-tru/images/..., uploads/images/..., admincp/... (legacy).
 */
export function mapZipPathToStoragePath(
  zipPath: string,
  allZipPaths: string[],
): string {
  const normalized = zipPath.replace(/\\/g, '/');

  if (
    normalized.startsWith(IMAGE_STORAGE_PREFIX) ||
    normalized.startsWith(FILE_STORAGE_PREFIX) ||
    normalized.startsWith(VIDEO_STORAGE_PREFIX) ||
    normalized.startsWith(AUDIO_STORAGE_PREFIX)
  ) {
    return normalized;
  }

  const directStorage = sliceFromStorageRoot(normalized);
  if (directStorage) return directStorage;

  const directLegacy = legacyImagePath(normalized);
  if (directLegacy) return directLegacy;

  let peeled = peelKnownPrefixes(normalized);
  const peeledStorage = sliceFromStorageRoot(peeled) ?? legacyImagePath(peeled);
  if (peeledStorage) return peeledStorage;

  const roots = new Set(
    allZipPaths.map((entry) => entry.split('/')[0]).filter(Boolean),
  );
  if (roots.size === 1) {
    const root = [...roots][0];
    if (
      root &&
      root !== 'images' &&
      root !== 'files' &&
      root !== 'admincp' &&
      peeled.startsWith(`${root}/`)
    ) {
      const stripped = peeled.slice(root.length + 1);
      const strippedStorage =
        sliceFromStorageRoot(stripped) ?? legacyImagePath(stripped);
      if (strippedStorage) return strippedStorage;
      // Chỉ bỏ wrapper khi bên trong đã có images/ hoặc files/ (vd. kho-luu-tru/images/…).
      if (
        stripped.startsWith(IMAGE_STORAGE_PREFIX) ||
        stripped.startsWith(FILE_STORAGE_PREFIX) ||
        stripped.startsWith(VIDEO_STORAGE_PREFIX) ||
        stripped.startsWith(AUDIO_STORAGE_PREFIX)
      ) {
        peeled = stripped;
      }
    }
  }

  return peeled;
}
