import { formatStorageTabLabel } from './storage-media';

export type StorageFolderLabelLookup = Map<string, string>;

/** Slug path trên disk → nhãn hiển thị (từ `.storage-policy.json`). */
export function buildStorageFolderLabelLookup(
  folders: Array<{ path: string; label?: string | null }>,
): StorageFolderLabelLookup {
  const map: StorageFolderLabelLookup = new Map();

  for (const folder of folders) {
    const label = folder.label?.trim();
    if (!label) continue;

    const diskPath = folder.path.replace(/\\/g, '/').replace(/\/$/, '');
    map.set(diskPath, label);

    if (diskPath.startsWith('images/')) {
      map.set(diskPath.slice('images/'.length), label);
    } else if (diskPath.startsWith('files/')) {
      map.set(diskPath.slice('files/'.length), label);
    } else if (diskPath.startsWith('videos/')) {
      map.set(diskPath.slice('videos/'.length), label);
    } else if (diskPath.startsWith('audio/')) {
      map.set(diskPath.slice('audio/'.length), label);
    }
  }

  return map;
}

export function resolveStorageFolderDisplayLabel(
  segmentSlug: string,
  navPathId: string,
  lookup?: StorageFolderLabelLookup,
): string {
  const nav = navPathId.trim().replace(/\\/g, '/').replace(/\/$/, '');
  if (nav && lookup?.has(nav)) {
    return lookup.get(nav)!;
  }
  return formatStorageTabLabel(segmentSlug);
}
