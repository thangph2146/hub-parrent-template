import * as path from 'path';

export type StorageRealmDir = 'images' | 'files' | 'videos' | 'audio';

export type StoragePathRoots = {
  storageDir: string;
  uploadsDir: string;
  imagesDir: string;
  filesDir: string;
  videosDir: string;
  audioDir: string;
};

/** Bỏ prefix realm — «files» → «», «files/docs» → «docs». */
export function stripStorageFolderPath(
  folderPath: string,
  realm: StorageRealmDir,
): string {
  const normalized = folderPath.replace(/\\/g, '/').replace(/\/$/, '');
  if (!normalized || normalized === realm) return '';
  const prefix = `${realm}/`;
  if (normalized.startsWith(prefix)) {
    return normalized.slice(prefix.length);
  }
  return normalized
    .replace(/^images\//, '')
    .replace(/^files\//, '')
    .replace(/^videos\//, '')
    .replace(/^audio\//, '');
}

export function resolveCreateFolderTarget(
  parentPath: string,
  folderName: string,
  roots: StoragePathRoots,
): { targetDir: string; folderPath: string } | null {
  const trimmed = parentPath.replace(/\\/g, '/').replace(/\/$/, '');
  const realmMap: Array<{ realm: StorageRealmDir; dir: string }> = [
    { realm: 'images', dir: roots.imagesDir },
    { realm: 'files', dir: roots.filesDir },
    { realm: 'videos', dir: roots.videosDir },
    { realm: 'audio', dir: roots.audioDir },
  ];

  for (const { realm, dir } of realmMap) {
    if (trimmed === realm) {
      return {
        targetDir: path.join(dir, folderName),
        folderPath: `${realm}/${folderName}`,
      };
    }
    if (trimmed.startsWith(`${realm}/`)) {
      const rest = trimmed.slice(realm.length + 1);
      return {
        targetDir: path.join(dir, rest, folderName),
        folderPath: `${realm}/${rest}/${folderName}`,
      };
    }
  }

  return null;
}

export function resolveStorageRelativePath(
  relativePath: string,
  roots: StoragePathRoots,
): { fullPath: string; baseDir: string } {
  const normalized = relativePath
    .replace(/\.\./g, '')
    .replace(/\\/g, '/')
    .replace(/\/$/, '');

  if (normalized === 'images') {
    const resolved = path.resolve(roots.imagesDir);
    return { fullPath: resolved, baseDir: resolved };
  }
  if (normalized === 'files') {
    const resolved = path.resolve(roots.filesDir);
    return { fullPath: resolved, baseDir: resolved };
  }
  if (normalized === 'videos') {
    const resolved = path.resolve(roots.videosDir);
    return { fullPath: resolved, baseDir: resolved };
  }
  if (normalized === 'audio') {
    const resolved = path.resolve(roots.audioDir);
    return { fullPath: resolved, baseDir: resolved };
  }
  if (normalized.startsWith('images/')) {
    const fromImages = path.join(roots.imagesDir, normalized.slice(7));
    return {
      fullPath: path.resolve(fromImages),
      baseDir: path.resolve(roots.imagesDir),
    };
  }
  if (normalized.startsWith('files/')) {
    const fromFiles = path.join(roots.filesDir, normalized.slice(6));
    return {
      fullPath: path.resolve(fromFiles),
      baseDir: path.resolve(roots.filesDir),
    };
  }
  if (normalized.startsWith('videos/')) {
    const fromVideos = path.join(roots.videosDir, normalized.slice(7));
    return {
      fullPath: path.resolve(fromVideos),
      baseDir: path.resolve(roots.videosDir),
    };
  }
  if (normalized.startsWith('audio/')) {
    const fromAudio = path.join(roots.audioDir, normalized.slice(6));
    return {
      fullPath: path.resolve(fromAudio),
      baseDir: path.resolve(roots.audioDir),
    };
  }
  const fromStorage = path.join(roots.storageDir, normalized);
  return {
    fullPath: path.resolve(fromStorage),
    baseDir: path.resolve(roots.storageDir),
  };
}
