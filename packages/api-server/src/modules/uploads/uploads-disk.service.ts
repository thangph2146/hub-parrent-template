/**
 * Disk-only uploads helper — unit test filesystem (không EM).
 * Production dùng `BaseUploadsService` trong uploads.service.ts.
 */
import { Injectable } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import type { ReadStream } from 'node:fs';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import JSZip from 'jszip';
import { parseAdminListLimit } from '../../common';
import {
  classifyStorageMedia,
  getStorageRealm,
  getStorageTabId,
  type StorageMediaKind,
  type StorageRealm,
  type StorageTabDto,
} from './storage-media';

export type { StorageMediaKind, StorageRealm, StorageTabDto } from './storage-media';

export interface ImageItemDto {
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  relativePath: string;
  createdAt: number;
  mediaKind: StorageMediaKind;
  storageTab: string;
  storageRealm: StorageRealm;
  uploadOwnerId?: string | null;
  uploadOwnerName?: string | null;
}

export interface FolderItemDto {
  path: string;
  name: string;
  label?: string;
  allowedExtensions?: string[];
  realm?: StorageRealm;
}

export interface ListImagesResult {
  data: ImageItemDto[];
  folderTree: FolderItemDto | null;
  realms: StorageTabDto[];
  tabs: StorageTabDto[];
  subTabs: StorageTabDto[];
  childFolders: StorageTabDto[];
  breadcrumb: Array<{ id: string; label: string }>;
  folderPath: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateStorageFolderResult {
  folderName: string;
  folderPath: string;
  folderLabel?: string;
}

export interface UploadsBulkDeleteResult {
  deleted: number;
  failed: number;
  errors: Array<{ path: string; message: string }>;
}

export interface BulkMoveFilesResult {
  moved: number;
  skipped: number;
  renamed: number;
  errors: Array<{ from: string; to?: string; message: string }>;
}

export interface ReorganizeDateFoldersResult {
  dryRun: boolean;
  scopePath: string | null;
  candidates: number;
  moved: number;
  skipped: number;
  renamed: number;
  removedDirs: number;
  errors: Array<{ from: string; to?: string; message: string }>;
  preview: Array<{ from: string; to: string }>;
}

export interface ImportArchiveResult {
  restored: number;
  skipped: number;
  failed: number;
  totalEntries: number;
  skippedUnsupportedExt: number;
  skippedDuplicates: number;
  listedTotal: number;
  errors: string[];
}

export interface ExportArchiveResult {
  buffer: Buffer;
  fileCount: number;
  skipped: number;
}

export interface UploadFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

const STORAGE_REALMS: StorageRealm[] = ['images', 'files', 'videos', 'audio'];
const STORAGE_SKIP_DIRS = new Set(['uploads', 'cache', '.git', 'node_modules']);
const ALLOWED_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.bmp',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
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
  '.zip',
  '.rar',
  '.7z',
  '.mp3',
  '.wav',
  '.mp4',
  '.mov',
  '.avi',
  '.m4v',
  '.webm',
]);

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv; charset=utf-8',
  '.rtf': 'application/rtf',
  '.txt': 'text/plain; charset=utf-8',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.m4v': 'video/x-m4v',
  '.webm': 'video/webm',
};

const MEDIA_KIND_LABELS: Record<StorageRealm, string> = {
  images: 'Hinh anh',
  files: 'Tep tin',
  videos: 'Video',
  audio: 'Am thanh',
};

const DATE_SEGMENT_RE = /^\d{4}$|^(0[1-9]|1[0-2])$|^(0[1-9]|[12]\d|3[01])$/;

function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, '/');
}

function safeTrim(value: string | undefined | null): string {
  return String(value ?? '').trim();
}

function stripLeadingRealm(folderPath: string, realm: StorageRealm): string {
  const normalized = normalizeSlashes(folderPath).replace(/^\/+/, '');
  if (normalized === realm) return '';
  if (normalized.startsWith(`${realm}/`)) return normalized.slice(realm.length + 1);
  return normalized;
}

function titleize(segment: string): string {
  const normalized = safeTrim(segment);
  if (!normalized) return '';
  return normalized
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function uniqueByPath<T extends { relativePath: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.relativePath)) continue;
    seen.add(item.relativePath);
    out.push(item);
  }
  return out;
}

function extractUploadOwnerIdFromFileName(fileName: string): string | null {
  const base = normalizeSlashes(fileName).split('/').pop() ?? fileName;
  const match = base.match(/^(.+)_(\d{10,13})(\.[^.]+)$/i);
  if (!match?.[1]) return null;
  const candidate = match[1].split('_')[0] ?? '';
  return /^[a-zA-Z0-9_-]{2,64}$/.test(candidate) ? candidate : null;
}

function normalizeFolderScope(
  realm: StorageRealm,
  folderPath: string | undefined,
): { diskPrefix: string | null; navPath: string | null } {
  const normalized = safeTrim(folderPath).replace(/^\/+|\/+$/g, '');
  if (!normalized) {
    return { diskPrefix: null, navPath: null };
  }
  if (
    normalized.startsWith('images/') ||
    normalized.startsWith('files/') ||
    normalized.startsWith('videos/') ||
    normalized.startsWith('audio/')
  ) {
    const navPath = stripLeadingRealm(normalized, realm);
    return { diskPrefix: normalized, navPath: navPath || null };
  }
  if (realm === 'images') {
    return { diskPrefix: `images/${normalized}`, navPath: normalized };
  }
  return { diskPrefix: `${realm}/${normalized}`, navPath: normalized };
}

function itemMatchesFolder(
  relativePath: string,
  realm: StorageRealm,
  folderPath: string | undefined,
  includeDescendants: boolean,
): boolean {
  const normalized = normalizeSlashes(relativePath);
  const { diskPrefix } = normalizeFolderScope(realm, folderPath);
  if (!diskPrefix) {
    return true;
  }
  if (normalized === diskPrefix) {
    return false;
  }
  if (!normalized.startsWith(`${diskPrefix}/`)) {
    return false;
  }
  if (includeDescendants) return true;
  const rest = normalized.slice(diskPrefix.length + 1);
  return rest.length > 0 && !rest.includes('/');
}

function splitBaseAndExt(fileName: string): { baseName: string; ext: string } {
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, ext || undefined) || 'file';
  return { baseName, ext };
}

function sanitizeUploadUserId(userId: string): string {
  return safeTrim(userId).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

function buildStoredUploadFileName(
  baseName: string,
  ext: string,
  ownerId?: string,
): string {
  const safeBase = safeTrim(baseName).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
  const prefix = ownerId ? `${sanitizeUploadUserId(ownerId)}_` : '';
  return `${prefix}${safeBase}_${Date.now()}${ext}`;
}

function stripTrailingDateSegments(parts: string[]): string[] {
  const out = [...parts];
  while (out.length > 0 && DATE_SEGMENT_RE.test(out[out.length - 1] ?? '')) {
    out.pop();
  }
  return out;
}

@Injectable()
export class BaseUploadsDiskService {
  protected getStorageDir(): string {
    const configured = safeTrim(process.env.STORAGE_DIR);
    return path.resolve(configured || path.join(process.cwd(), 'storage'));
  }

  protected getUploadsDir(): string {
    return path.join(this.getStorageDir(), 'uploads');
  }

  protected getRealmDir(realm: StorageRealm): string {
    return path.join(this.getUploadsDir(), realm);
  }

  protected stripStorageFolderPath(folderPath: string, realm: StorageRealm): string {
    const normalized = normalizeSlashes(folderPath).replace(/\/$/, '');
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

  protected normalizeRelativePath(relativePath: string): string {
    const normalized = normalizeSlashes(safeTrim(relativePath))
      .replace(/^\/+/, '')
      .replace(/\/+/g, '/');
    if (!normalized || normalized.includes('..') || /^[a-zA-Z]:/.test(normalized)) {
      throw new Error('Duong dan khong hop le');
    }
    return normalized;
  }

  protected buildPublicUrl(relativePath: string, serveBaseUrl = ''): string {
    const normalized = normalizeSlashes(relativePath);
    const base = safeTrim(serveBaseUrl).replace(/\/$/, '');
    return base ? `${base}/${normalized}` : `/api/uploads/${normalized}`;
  }

  protected resolveFullPath(relativePath: string): string {
    const normalized = this.normalizeRelativePath(relativePath);
    const storageRoot = path.resolve(this.getStorageDir());
    const realmRoots: Array<{ prefix: StorageRealm; dir: string }> = STORAGE_REALMS.map((realm) => ({
      prefix: realm,
      dir: this.getRealmDir(realm),
    }));

    let fullPath: string;
    let baseDir: string;

    const directRealm = realmRoots.find(({ prefix }) => normalized === prefix);
    if (directRealm) {
      fullPath = path.resolve(directRealm.dir);
      baseDir = path.resolve(directRealm.dir);
    } else {
      const prefixedRealm = realmRoots.find(({ prefix }) => normalized.startsWith(`${prefix}/`));
      if (prefixedRealm) {
        const rest = normalized.slice(prefixedRealm.prefix.length + 1);
        fullPath = path.resolve(prefixedRealm.dir, rest);
        baseDir = path.resolve(prefixedRealm.dir);
      } else {
        fullPath = path.resolve(storageRoot, normalized);
        baseDir = storageRoot;
      }
    }

    if (!fullPath.startsWith(baseDir)) {
      throw new Error('Duong dan khong hop le');
    }
    return fullPath;
  }

  protected async ensureDir(dirPath: string): Promise<void> {
    await mkdir(dirPath, { recursive: true });
  }

  protected async scanDir(
    fullDir: string,
    relativeDir: string,
    serveBaseUrl: string,
  ): Promise<ImageItemDto[]> {
    const out: ImageItemDto[] = [];
    let entries;
    try {
      entries = await readdir(fullDir, { withFileTypes: true });
    } catch {
      return out;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const nextFull = path.join(fullDir, entry.name);
      const nextRelative = relativeDir
        ? `${relativeDir}/${entry.name}`
        : entry.name;
      if (entry.isDirectory()) {
        out.push(...(await this.scanDir(nextFull, nextRelative, serveBaseUrl)));
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) continue;
      const info = await stat(nextFull).catch(() => null);
      if (!info?.isFile()) continue;
      const mimeType = MIME_BY_EXT[ext] ?? 'application/octet-stream';
      const mediaKind = classifyStorageMedia(ext, mimeType);
      const uploadOwnerId = extractUploadOwnerIdFromFileName(entry.name);
      out.push({
        fileName: entry.name,
        originalName: entry.name,
        size: info.size,
        mimeType,
        url: this.buildPublicUrl(nextRelative, serveBaseUrl),
        relativePath: nextRelative,
        createdAt: info.mtimeMs,
        mediaKind,
        storageTab: getStorageTabId(nextRelative),
        storageRealm: getStorageRealm(nextRelative, mediaKind),
        uploadOwnerId,
        uploadOwnerName: null,
      });
    }
    return out;
  }

  async collectAllStorageItems(serveBaseUrl = ''): Promise<ImageItemDto[]> {
    const out: ImageItemDto[] = [];
    for (const realm of STORAGE_REALMS) {
      const dir = this.getRealmDir(realm);
      out.push(...(await this.scanDir(dir, realm, serveBaseUrl)));
    }

    try {
      const topEntries = await readdir(this.getStorageDir(), { withFileTypes: true });
      for (const entry of topEntries) {
        if (!entry.isDirectory() || STORAGE_SKIP_DIRS.has(entry.name)) continue;
        out.push(
          ...(await this.scanDir(
            path.join(this.getStorageDir(), entry.name),
            entry.name,
            serveBaseUrl,
          )),
        );
      }
    } catch {
      // ignore missing storage root
    }

    return uniqueByPath(out).sort((left, right) => right.createdAt - left.createdAt);
  }

  async listFolders(): Promise<{ data: FolderItemDto[] }> {
    const folders = new Set<string>();

    const walk = async (fullDir: string, relativeDir: string): Promise<void> => {
      let entries;
      try {
        entries = await readdir(fullDir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        const nextRelative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
        folders.add(nextRelative);
        await walk(path.join(fullDir, entry.name), nextRelative);
      }
    };

    for (const realm of STORAGE_REALMS) {
      const realmDir = this.getRealmDir(realm);
      const realmExists = await stat(realmDir).catch(() => null);
      if (realmExists?.isDirectory()) {
        folders.add(realm);
        await walk(realmDir, realm);
      }
    }

    try {
      const topEntries = await readdir(this.getStorageDir(), { withFileTypes: true });
      for (const entry of topEntries) {
        if (!entry.isDirectory() || STORAGE_SKIP_DIRS.has(entry.name)) continue;
        folders.add(entry.name);
        await walk(path.join(this.getStorageDir(), entry.name), entry.name);
      }
    } catch {
      // ignore
    }

    return {
      data: [...folders]
        .sort((left, right) => left.localeCompare(right))
        .map((folderPath) => ({
          path: folderPath,
          name: path.posix.basename(folderPath),
          label: titleize(path.posix.basename(folderPath)),
          realm: STORAGE_REALMS.find(
            (realm) => folderPath === realm || folderPath.startsWith(`${realm}/`),
          ),
        })),
    };
  }

  async listImages(params: {
    page: number;
    limit: number;
    serveBaseUrl?: string;
    realm?: StorageRealm;
    folderPath?: string;
    tab?: string;
    includeDescendants?: boolean;
    uploadOwnerId?: string;
  }): Promise<ListImagesResult> {
    const allItems = await this.collectAllStorageItems(params.serveBaseUrl ?? '');
    const realms = STORAGE_REALMS.map((realm) => ({
      id: realm,
      label: MEDIA_KIND_LABELS[realm],
      count: allItems.filter((item) => item.storageRealm === realm).length,
    }));

    const folderPath = safeTrim(params.folderPath || params.tab) || undefined;
    const includeDescendants = params.includeDescendants === true;
    const ownerFilter = safeTrim(params.uploadOwnerId) || undefined;

    const realmItems = params.realm
      ? allItems.filter((item) => item.storageRealm === params.realm)
      : allItems;

    const scoped = params.realm && folderPath
      ? realmItems.filter((item) =>
          itemMatchesFolder(item.relativePath, params.realm as StorageRealm, folderPath, includeDescendants),
        )
      : realmItems;

    const filtered = ownerFilter
      ? scoped.filter((item) => item.uploadOwnerId === ownerFilter)
      : scoped;

    const tabs = params.realm
      ? [...new Set(realmItems.map((item) => getStorageTabId(item.relativePath)))]
          .sort((left, right) => left.localeCompare(right))
          .map((id) => ({
            id,
            label: titleize(id),
            count: realmItems.filter((item) => getStorageTabId(item.relativePath) === id).length,
          }))
      : [];

    const childFolders = params.realm && folderPath
      ? [...new Set(
          realmItems
            .filter((item) => itemMatchesFolder(item.relativePath, params.realm as StorageRealm, folderPath, true))
            .map((item) => {
              const { diskPrefix, navPath } = normalizeFolderScope(params.realm as StorageRealm, folderPath);
              if (!diskPrefix) return null;
              const normalized = normalizeSlashes(item.relativePath);
              const rest = normalized.slice(diskPrefix.length + 1);
              const first = rest.split('/')[0];
              if (!first || !rest.includes('/')) return null;
              return navPath ? `${navPath}/${first}` : first;
            })
            .filter((value): value is string => Boolean(value)),
        )]
          .sort((left, right) => left.localeCompare(right))
          .map((id) => ({ id, label: titleize(path.posix.basename(id)), count: 0 }))
      : [];

    const breadcrumb = folderPath
      ? folderPath
          .split('/')
          .filter(Boolean)
          .map((_, index, parts) => {
            const id = parts.slice(0, index + 1).join('/');
            return { id, label: titleize(parts[index] ?? id) };
          })
      : [];

    const total = filtered.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = parseAdminListLimit(params.limit, 50);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      folderTree: folderPath
        ? {
            path: folderPath,
            name: path.posix.basename(folderPath),
            label: titleize(path.posix.basename(folderPath)),
            realm: params.realm,
          }
        : null,
      realms,
      tabs,
      subTabs: [],
      childFolders,
      breadcrumb,
      folderPath: folderPath ?? null,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async createFolder(
    folderName: string,
    parentPath?: string,
    resourceType: StorageRealm = 'images',
    allowedExtensions?: string[],
  ): Promise<CreateStorageFolderResult> {
    const cleanName = safeTrim(folderName)
      .replace(/[^a-zA-Z0-9 _-]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!cleanName) {
      throw new Error('Thieu folderName');
    }

    const normalizedParent = parentPath ? this.normalizeRelativePath(parentPath).replace(/\/$/, '') : '';
    let relativePath: string;

    if (normalizedParent) {
      const targetRealm = STORAGE_REALMS.find(
        (realm) => normalizedParent === realm || normalizedParent.startsWith(`${realm}/`),
      );
      relativePath = targetRealm
        ? `${normalizedParent}/${cleanName}`
        : `${normalizedParent}/${cleanName}`;
    } else if (resourceType === 'files' || resourceType === 'videos' || resourceType === 'audio') {
      relativePath = `${resourceType}/${cleanName}`;
    } else {
      // Keep image root folders at STORAGE_DIR/<folder> like the main API legacy layout.
      relativePath = cleanName;
    }

    const fullPath = this.resolveFullPath(relativePath);
    await this.ensureDir(fullPath);

    if (Array.isArray(allowedExtensions) && allowedExtensions.length > 0) {
      const policyPath = path.join(fullPath, '.storage-policy.json');
      await writeFile(
        policyPath,
        JSON.stringify(
          {
            version: 1,
            realm: resourceType,
            allowedExtensions,
          },
          null,
          2,
        ),
        'utf8',
      );
    }

    return {
      folderName: cleanName,
      folderPath: relativePath,
      folderLabel: titleize(cleanName),
    };
  }

  async saveFile(
    file: UploadFileInput,
    folderPath?: string,
    _isExistingFolder?: boolean,
    serveBaseUrl?: string,
    userId?: string,
    ownerUserId?: string,
  ): Promise<{
    fileName: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    relativePath: string;
  }> {
    if (!file?.buffer?.length) {
      throw new Error('Thieu file');
    }

    const originalName = safeTrim(file.originalname) || 'upload.bin';
    const { baseName, ext: rawExt } = splitBaseAndExt(originalName);
    const ext = rawExt || '.bin';
    if (!ALLOWED_EXT.has(ext)) {
      throw new Error('Dinh dang file khong duoc phep');
    }

    const mediaKind = classifyStorageMedia(ext, file.mimetype || '');
    const realm = getStorageRealm(originalName, mediaKind);
    const ownerId = safeTrim(ownerUserId || userId) || undefined;
    const fileName = buildStoredUploadFileName(baseName, ext, ownerId);
    const relativeFolder = folderPath
      ? `${realm}/${this.stripStorageFolderPath(this.normalizeRelativePath(folderPath), realm)}`
          .replace(/\/+$/, '')
          .replace(/\/{2,}/g, '/')
      : realm;
    const relativePath = `${relativeFolder}/${fileName}`;
    const fullPath = this.resolveFullPath(relativePath);
    await this.ensureDir(path.dirname(fullPath));
    await writeFile(fullPath, file.buffer);

    return {
      fileName,
      originalName,
      size: file.buffer.length,
      mimeType: MIME_BY_EXT[ext] ?? file.mimetype ?? 'application/octet-stream',
      url: this.buildPublicUrl(relativePath, serveBaseUrl),
      relativePath,
    };
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.resolveFullPath(relativePath);
    await rm(fullPath, { force: false });
  }

  async bulkDeleteFiles(paths: string[]): Promise<UploadsBulkDeleteResult> {
    const unique = [...new Set(paths.map((item) => safeTrim(item)).filter(Boolean))];
    let deleted = 0;
    let failed = 0;
    const errors: Array<{ path: string; message: string }> = [];

    for (const relativePath of unique) {
      try {
        await this.deleteFile(relativePath);
        deleted += 1;
      } catch (error) {
        failed += 1;
        errors.push({
          path: relativePath,
          message: error instanceof Error ? error.message : 'Loi xoa file',
        });
      }
    }

    return { deleted, failed, errors };
  }

  async deleteFolder(relativePath: string): Promise<void> {
    const fullPath = this.resolveFullPath(relativePath);
    await rm(fullPath, { recursive: true, force: false });
  }

  async bulkMoveFiles(
    paths: string[],
    destinationFolder: string,
  ): Promise<BulkMoveFilesResult> {
    const unique = [...new Set(paths.map((item) => safeTrim(item)).filter(Boolean))];
    const destination = this.normalizeRelativePath(destinationFolder);
    const destinationDir = this.resolveFullPath(destination);
    await this.ensureDir(destinationDir);

    let moved = 0;
    let skipped = 0;
    let renamed = 0;
    const errors: Array<{ from: string; to?: string; message: string }> = [];

    for (const fromRelative of unique) {
      const fileName = path.posix.basename(normalizeSlashes(fromRelative));
      let toRelative = `${destination}/${fileName}`;
      let toFull = this.resolveFullPath(toRelative);
      let suffix = 1;

      while (await stat(toFull).catch(() => null)) {
        const { name, ext } = path.parse(fileName);
        toRelative = `${destination}/${name}-${suffix}${ext}`;
        toFull = this.resolveFullPath(toRelative);
        suffix += 1;
      }

      try {
        await rename(this.resolveFullPath(fromRelative), toFull);
        moved += 1;
        if (toRelative !== `${destination}/${fileName}`) renamed += 1;
      } catch (error) {
        skipped += 1;
        errors.push({
          from: fromRelative,
          to: toRelative,
          message: error instanceof Error ? error.message : 'Loi di chuyen file',
        });
      }
    }

    return { moved, skipped, renamed, errors };
  }

  async exportArchive(): Promise<ExportArchiveResult> {
    const items = await this.collectAllStorageItems('');
    if (!items.length) {
      throw new Error('Khong co file de xuat');
    }

    const zip = new JSZip();
    let fileCount = 0;
    let skipped = 0;
    for (const item of items) {
      try {
        const fullPath = this.resolveFullPath(item.relativePath);
        zip.file(item.relativePath, await readFile(fullPath));
        fileCount += 1;
      } catch {
        skipped += 1;
      }
    }

    return {
      buffer: await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      }),
      fileCount,
      skipped,
    };
  }

  async importArchive(
    zipBuffer: Buffer,
    options?: { overwrite?: boolean },
  ): Promise<ImportArchiveResult> {
    const zip = await JSZip.loadAsync(zipBuffer);
    const overwrite = options?.overwrite === true;
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);
    if (!entries.length) {
      throw new Error('File ZIP khong chua file hop le');
    }

    let restored = 0;
    let skipped = 0;
    let failed = 0;
    let skippedUnsupportedExt = 0;
    let skippedDuplicates = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      const relativePath = this.normalizeRelativePath(normalizeSlashes(entry.name));
      const ext = path.extname(relativePath).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) {
        skipped += 1;
        skippedUnsupportedExt += 1;
        continue;
      }
      const fullPath = this.resolveFullPath(relativePath);
      const exists = await stat(fullPath).catch(() => null);
      if (exists?.isFile() && !overwrite) {
        skipped += 1;
        skippedDuplicates += 1;
        continue;
      }
      try {
        await this.ensureDir(path.dirname(fullPath));
        await writeFile(fullPath, await entry.async('nodebuffer'));
        restored += 1;
      } catch (error) {
        failed += 1;
        if (errors.length < 10) {
          errors.push(
            `${relativePath}: ${error instanceof Error ? error.message : 'Loi ghi file'}`,
          );
        }
      }
    }

    return {
      restored,
      skipped,
      failed,
      totalEntries: entries.length,
      skippedUnsupportedExt,
      skippedDuplicates,
      listedTotal: (await this.collectAllStorageItems('')).length,
      errors,
    };
  }

  async reorganizeDateFolders(params: {
    scopePath?: string;
    dryRun?: boolean;
  }): Promise<ReorganizeDateFoldersResult> {
    const scopePath = safeTrim(params.scopePath) || null;
    const dryRun = params.dryRun === true;
    const items = await this.collectAllStorageItems('');
    const preview: Array<{ from: string; to: string }> = [];
    const moves: Array<{ from: string; to: string }> = [];

    for (const item of items) {
      if (scopePath && !item.relativePath.startsWith(scopePath)) continue;
      const normalized = normalizeSlashes(item.relativePath);
      const parts = normalized.split('/').filter(Boolean);
      if (parts.length < 3) continue;
      const fileName = parts.pop() as string;
      const baseParts = stripTrailingDateSegments(parts);
      if (baseParts.length === parts.length) continue;
      const target = [...baseParts, fileName].join('/');
      if (target === normalized) continue;
      moves.push({ from: normalized, to: target });
      if (preview.length < 50) {
        preview.push({ from: normalized, to: target });
      }
    }

    const result: ReorganizeDateFoldersResult = {
      dryRun,
      scopePath,
      candidates: moves.length,
      moved: 0,
      skipped: 0,
      renamed: 0,
      removedDirs: 0,
      errors: [],
      preview,
    };

    if (dryRun) {
      return result;
    }

    for (const move of moves) {
      let targetPath = move.to;
      let targetFull = this.resolveFullPath(targetPath);
      let suffix = 1;
      while (await stat(targetFull).catch(() => null)) {
        const parsed = path.posix.parse(move.to);
        targetPath = `${parsed.dir}/${parsed.name}-${suffix}${parsed.ext}`;
        targetFull = this.resolveFullPath(targetPath);
        suffix += 1;
      }

      try {
        await this.ensureDir(path.dirname(targetFull));
        await rename(this.resolveFullPath(move.from), targetFull);
        result.moved += 1;
        if (targetPath !== move.to) result.renamed += 1;
      } catch (error) {
        result.skipped += 1;
        result.errors.push({
          from: move.from,
          to: targetPath,
          message: error instanceof Error ? error.message : 'Loi di chuyen file',
        });
      }
    }

    return result;
  }

  async serveFile(relativePath: string): Promise<{
    stream: ReadStream;
    contentType: string;
    originalName: string;
  }> {
    const normalized = this.normalizeRelativePath(relativePath);
    const fullPath = this.resolveFullPath(normalized);
    const info = await stat(fullPath);
    if (!info.isFile()) {
      throw new Error('Not found');
    }
    const ext = path.extname(normalized).toLowerCase();
    return {
      stream: createReadStream(fullPath),
      contentType: MIME_BY_EXT[ext] ?? 'application/octet-stream',
      originalName: path.basename(normalized),
    };
  }

  async serveResized(
    relativePath: string,
    _width: number,
    _quality: number,
  ): Promise<{
    stream: ReadStream;
    contentType: string;
    originalName: string;
  }> {
    return this.serveFile(relativePath);
  }

  async createTempStorageRoot(): Promise<string> {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'api-server-uploads-'));
    process.env.STORAGE_DIR = dir;
    return dir;
  }

  async snapshotRelativeFile(fromRelative: string, toRelative: string): Promise<boolean> {
    try {
      const fromFull = this.resolveFullPath(fromRelative);
      const toFull = this.resolveFullPath(toRelative);
      await this.ensureDir(path.dirname(toFull));
      await copyFile(fromFull, toFull);
      return true;
    } catch {
      return false;
    }
  }
}
