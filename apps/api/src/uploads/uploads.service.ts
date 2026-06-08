/**
 * Uploads Service - Quản lý file/thư mục upload (lưu trên disk tại API).
 * Cấu trúc thư mục: STORAGE_DIR/uploads/images và STORAGE_DIR/[custom].
 *
 * Có thể chuyển data ra ngoài thư mục tuyen-sinh-api bằng cách set env STORAGE_DIR
 * (đường dẫn tuyệt đối hoặc tương đối với process.cwd()).
 * VD: STORAGE_DIR=D:/HUB/data hoặc STORAGE_DIR=../shared-data
 */
import { Injectable } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import {
  stat,
  readdir,
  mkdir,
  unlink,
  rmdir,
  rename,
  writeFile,
  readFile,
} from 'fs/promises';
import JSZip from 'jszip';
import type { ReadStream } from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { appConfig } from '../config/app.config';
import { parseAdminListLimit } from '../common/parse-list-query';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';

/** Số file tối đa mỗi lần gọi bulk-delete (khớp export admin). */
export const UPLOADS_BULK_DELETE_MAX_PATHS = ADMIN_TABLE_EXPORT_MAX_LIMIT;

const UPLOADS_BULK_DELETE_CONCURRENCY = 32;

export type UploadsBulkDeleteResult = {
  deleted: number;
  failed: number;
  errors: Array<{ path: string; message: string }>;
};
import {
  isImageMime,
  isImageExt,
  processImageBuffer,
} from '../common/image-processor';
import {
  mapZipPathToStoragePath,
  normalizeZipEntryPath,
} from './zip-path-mapper';
import {
  buildStorageFolderTabs,
  buildStorageSubFolderTabs,
  buildStorageRealms,
  classifyStorageMedia,
  getStorageRealm,
  getStorageTabId,
  isAudioStorageFile,
  isVideoStorageFile,
  matchesStorageRealm,
  type StorageMediaKind,
  type StorageRealm,
  type StorageTabDto,
} from './storage-media';
import {
  collectDateFolderCleanupPaths,
  flattenDateStoragePath,
  isUnderReorganizeScope,
  uniqueFlattenTargetPath,
} from './folder-reorganize';
import {
  buildChildFolderTabs,
  buildStorageBreadcrumb,
  matchesStorageFolderScope,
} from './folder-navigation';
import {
  STORAGE_POLICY_FILENAME,
  buildFolderPolicy,
  inferRealmFromDiskFolderPath,
  isExtensionAllowed,
  type StorageFolderPolicy,
} from './storage-upload-policy';
import {
  resolveCreateFolderTarget,
  resolveStorageRelativePath,
  stripStorageFolderPath,
} from './storage-path-resolver';

const STORAGE_DIR = path.normalize(appConfig.storageDir);
const UPLOADS_DIR = path.normalize(path.join(STORAGE_DIR, 'uploads'));
const IMAGES_DIR = path.normalize(path.join(UPLOADS_DIR, 'images'));
const FILES_DIR = path.normalize(path.join(UPLOADS_DIR, 'files'));
const VIDEOS_DIR = path.normalize(path.join(UPLOADS_DIR, 'videos'));
const AUDIO_DIR = path.normalize(path.join(UPLOADS_DIR, 'audio'));
const IMAGE_RESIZE_CACHE_DIR = 'cache/resized';

// Allow list cho cả ảnh + file đính kèm (phục vụ download trong editor).
// Lưu ý: chỉ dựa theo ext để tránh trường hợp browser trả về mimeType trống/không chuẩn.
const ALLOWED_EXT = [
  // Images
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  // Docs / Spreadsheets
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.rtf',
  // Archives / Misc
  '.zip',
  '.rar',
  '.7z',
  '.txt',
  // Presentations
  '.ppt',
  '.pptx',
  '.webm',
  // Audio / video (đồng bộ với input accept trong editor)
  '.mp3',
  '.wav',
  '.mp4',
  '.mov',
  '.avi',
  '.m4v',
  // Ảnh phổ biến từ thiết bị
  '.bmp',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
];

const ALLOWED_MIME: Record<string, string> = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',

  // Docs
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.rtf': 'application/rtf',
  '.txt': 'text/plain; charset=utf-8',

  // Spreadsheets
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv; charset=utf-8',

  // Archives
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',

  // Presentations
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.m4v': 'video/x-m4v',
  '.bmp': 'image/bmp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

/** MIME chuẩn hóa → đuôi file (chỉ dùng khi tên file thiếu đuôi hoặc không khớp allow-list). */
const PRIMARY_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
  'image/tiff': '.tiff',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'application/rtf': '.rtf',
  'text/plain': '.txt',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv',
  'application/zip': '.zip',
  'application/vnd.rar': '.rar',
  'application/x-rar-compressed': '.rar',
  'application/x-7z-compressed': '.7z',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    '.pptx',
  'video/webm': '.webm',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
  'video/x-m4v': '.m4v',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
};

export interface ImageItemDto {
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  relativePath: string;
  createdAt: number;
  /** Phân loại hiển thị (ảnh / video / tài liệu…) — kiểu Google Drive. */
  mediaKind: StorageMediaKind;
  /** Tab = folder hệ thống (admincp, avatars, files, …). */
  storageTab: string;
  /** Dạng lưu trữ: images | files | videos. */
  storageRealm: StorageRealm;
}

export interface FolderNodeDto {
  name: string;
  path: string;
  images: ImageItemDto[];
  subfolders: FolderNodeDto[];
}

export interface FolderItemDto {
  path: string;
  name: string;
  allowedExtensions?: string[];
  realm?: StorageRealm;
}

export interface ListImagesResult {
  data: ImageItemDto[];
  folderTree: FolderNodeDto | null;
  /** Ba tab cố định: images / files / videos. */
  realms: StorageTabDto[];
  /** Tab folder con trong realm đang lọc. */
  tabs: StorageTabDto[];
  /** Tab folder cấp 2 trong tab cha đang chọn (admincp/buh_slidehome, …). */
  subTabs: StorageTabDto[];
  /** Folder con trực tiếp tại folderPath (mọi cấp). */
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

export interface ListFoldersResult {
  data: FolderItemDto[];
}

export type BulkMoveFilesResult = {
  moved: number;
  skipped: number;
  renamed: number;
  errors: Array<{ from: string; to?: string; message: string }>;
};

export type ReorganizeDateFoldersResult = {
  dryRun: boolean;
  scopePath: string | null;
  candidates: number;
  moved: number;
  skipped: number;
  renamed: number;
  removedDirs: number;
  errors: Array<{ from: string; to?: string; message: string }>;
  preview: Array<{ from: string; to: string }>;
};

export interface ImportArchiveResult {
  restored: number;
  skipped: number;
  failed: number;
  /** Số file hợp lệ trong ZIP (sau khi lọc entry hệ thống). */
  totalEntries: number;
  /** Bỏ qua vì đuôi file không nằm trong allow-list. */
  skippedUnsupportedExt: number;
  /** Bỏ qua vì file đã tồn tại và không ghi đè. */
  skippedDuplicates: number;
  /** Tổng file trong kho sau khi khôi phục (quét disk). */
  listedTotal: number;
  errors: string[];
}

export interface ExportArchiveResult {
  buffer: Buffer;
  fileCount: number;
  skipped: number;
}

const STORAGE_LEGACY_SKIP_DIRS = new Set([
  'uploads',
  'cache',
  '.git',
  'node_modules',
]);

@Injectable()
export class UploadsService {
  private getImagesDir(): string {
    return IMAGES_DIR;
  }

  private getStorageDir(): string {
    return STORAGE_DIR;
  }

  private getUploadsDir(): string {
    return UPLOADS_DIR;
  }

  /** Đảm bảo thư mục tồn tại */
  private async ensureDir(dirPath: string): Promise<void> {
    if (
      !dirPath ||
      dirPath === '.' ||
      dirPath === '/' ||
      dirPath === '\\' ||
      dirPath.includes('\\\\?')
    ) {
      return;
    }
    const normalized = path.normalize(path.resolve(dirPath));
    // Check for malformed Windows path after resolve
    if (normalized.startsWith('\\\\?\\')) {
      // This is fine for long paths, but if it's just \\?\, it's invalid
      if (normalized.length <= 4) return;
    }
    try {
      await stat(normalized);
    } catch {
      await mkdir(normalized, { recursive: true });
    }
  }

  /** Kiểm tra path có phải năm/tháng/ngày */
  private hasDateStructure(folderPath: string): boolean {
    const parts = folderPath.split('/').filter(Boolean);
    if (parts.length < 3) return false;
    const [y, m, d] = parts.slice(-3);
    return (
      /^\d{4}$/.test(y) &&
      /^(0[1-9]|1[0-2])$/.test(m) &&
      /^(0[1-9]|[12]\d|3[01])$/.test(d)
    );
  }

  /** Tạo đường dẫn lưu file — không tạo thư mục ngày tháng */
  generateFilePath(
    fileName: string,
    customFolderPath?: string,
    isExistingFolder = false,
    serveBaseUrl = '',
    uploadKind: 'images' | 'files' | 'videos' | 'audio' = 'images',
  ): { relativePath: string; fullPath: string; urlPath: string } {
    const baseDir =
      uploadKind === 'images'
        ? IMAGES_DIR
        : uploadKind === 'videos'
          ? VIDEOS_DIR
          : uploadKind === 'audio'
            ? AUDIO_DIR
            : FILES_DIR;
    const prefix = uploadKind;

    let fullPath: string;
    let relativePath: string;

    if (customFolderPath) {
      const clean = stripStorageFolderPath(customFolderPath, uploadKind);

      if (isExistingFolder) {
        fullPath = path.normalize(path.join(baseDir, clean, fileName));
        relativePath = path.join(prefix, clean, fileName).replace(/\\/g, '/');
      } else {
        fullPath = path.normalize(path.join(baseDir, clean, fileName));
        relativePath = path.join(prefix, clean, fileName).replace(/\\/g, '/');
      }
    } else {
      fullPath = path.normalize(path.join(baseDir, fileName));
      relativePath = path.join(prefix, fileName).replace(/\\/g, '/');
    }

    const urlPath = serveBaseUrl
      ? `${serveBaseUrl}/${relativePath}`
      : `/api/uploads/${relativePath}`;

    return { relativePath, fullPath, urlPath };
  }

  /** Quét đệ quy lấy tất cả ảnh trong một thư mục */
  private readOriginalName(_fullPath: string, fallback: string): string {
    return fallback.replace(/_\d{13}(\.\w+)$/, '$1');
  }

  /** Quét thư mục legacy ngoài uploads/ (file import / khôi phục giữ folder gốc). */
  private async scanLegacyStorageDirs(
    serveBaseUrl: string,
  ): Promise<ImageItemDto[]> {
    const result: ImageItemDto[] = [];
    try {
      const top = await readdir(STORAGE_DIR, { withFileTypes: true });
      for (const entry of top) {
        if (!entry.isDirectory() || STORAGE_LEGACY_SKIP_DIRS.has(entry.name)) {
          continue;
        }
        const full = path.join(STORAGE_DIR, entry.name);
        const sub = await this.scanImagesInDir(full, entry.name, serveBaseUrl);
        result.push(...sub);
      }
    } catch {
      // ignore
    }
    return result;
  }

  private dedupeByRelativePath(items: ImageItemDto[]): ImageItemDto[] {
    const seen = new Set<string>();
    const unique: ImageItemDto[] = [];
    for (const item of items) {
      if (seen.has(item.relativePath)) continue;
      seen.add(item.relativePath);
      unique.push(item);
    }
    return unique;
  }

  private async scanImagesInDir(
    dirPath: string,
    baseRelative: string,
    serveBaseUrl: string,
  ): Promise<ImageItemDto[]> {
    const result: ImageItemDto[] = [];
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.endsWith('.meta.json')) continue;
        const full = path.join(dirPath, entry.name);
        const rel = baseRelative ? `${baseRelative}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          const sub = await this.scanImagesInDir(full, rel, serveBaseUrl);
          result.push(...sub);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (!ALLOWED_EXT.includes(ext)) continue;
          try {
            const st = await stat(full);
            const mimeType = ALLOWED_MIME[ext] || 'application/octet-stream';
            const url = serveBaseUrl
              ? `${serveBaseUrl}/${rel}`
              : `/api/uploads/${rel}`;
            const originalName = this.readOriginalName(full, entry.name);
            const mediaKind = classifyStorageMedia(ext, mimeType);
            result.push({
              fileName: entry.name,
              originalName,
              size: st.size,
              mimeType,
              url,
              relativePath: rel,
              createdAt: st.mtimeMs,
              mediaKind,
              storageTab: getStorageTabId(rel),
              storageRealm: getStorageRealm(rel, mediaKind),
            });
          } catch {
            // skip unreadable
          }
        }
      }
    } catch {
      // dir not found or not readable
    }
    return result;
  }

  /** Quét toàn bộ kho (không phân trang) — dùng cho list, export ZIP, đối chiếu sau import. */
  async collectAllStorageItems(serveBaseUrl = ''): Promise<ImageItemDto[]> {
    const baseUrl = serveBaseUrl.replace(/\/$/, '');
    const allImages: ImageItemDto[] = [];

    allImages.push(
      ...(await this.scanImagesInDir(IMAGES_DIR, 'images', baseUrl)),
    );
    allImages.push(
      ...(await this.scanImagesInDir(FILES_DIR, 'files', baseUrl)),
    );
    allImages.push(
      ...(await this.scanImagesInDir(VIDEOS_DIR, 'videos', baseUrl)),
      ...(await this.scanImagesInDir(AUDIO_DIR, 'audio', baseUrl)),
    );
    allImages.push(...(await this.scanLegacyStorageDirs(baseUrl)));

    const merged = this.dedupeByRelativePath(allImages);
    merged.sort((a, b) => b.createdAt - a.createdAt);
    return merged;
  }

  /** Lấy danh sách file kho lưu trữ — realm (images/files/videos) + tab folder con. */
  async listImages(params: {
    page: number;
    limit: number;
    serveBaseUrl?: string;
    realm?: StorageRealm;
    /** Folder đang mở — path điều hướng (admincp/buh/…). */
    folderPath?: string;
    /** @deprecated Dùng `folderPath`. */
    tab?: string;
    /** @deprecated Dùng `realm`. */
    type?: 'images' | 'files';
    /** true = gồm file trong mọi subfolder dưới folderPath. */
    includeDescendants?: boolean;
  }): Promise<ListImagesResult> {
    const merged = await this.collectAllStorageItems(params.serveBaseUrl);
    const realms = buildStorageRealms(merged);

    let realmFilter = params.realm;
    if (!realmFilter && params.type === 'files') {
      realmFilter = 'files';
    } else if (!realmFilter && params.type === 'images') {
      realmFilter = 'images';
    }

    const inRealm = realmFilter
      ? merged.filter((item) =>
          matchesStorageRealm(item.relativePath, item.mediaKind, realmFilter),
        )
      : merged;

    const folderList = await this.listFolders();
    const diskFolders = folderList.data.map((folder) => folder.path);

    const folderFilter =
      params.folderPath?.trim() || params.tab?.trim() || null;

    const tabs = buildStorageFolderTabs(merged, realmFilter, diskFolders);
    const childFolders = realmFilter
      ? buildChildFolderTabs(
          merged,
          realmFilter,
          folderFilter ?? '',
          diskFolders,
        )
      : [];
    const breadcrumb =
      realmFilter && folderFilter
        ? buildStorageBreadcrumb(realmFilter, folderFilter)
        : [];

    const parentTabForSubTabs = folderFilter?.includes('/')
      ? folderFilter.split('/')[0]
      : folderFilter;
    const subTabs =
      realmFilter && parentTabForSubTabs
        ? buildStorageSubFolderTabs(
            merged,
            realmFilter,
            parentTabForSubTabs,
            diskFolders,
          )
        : [];

    const includeDescendants = params.includeDescendants === true;
    const filtered = realmFilter
      ? inRealm.filter((item) =>
          matchesStorageFolderScope(
            item.relativePath,
            folderFilter ?? undefined,
            realmFilter,
            includeDescendants,
          ),
        )
      : merged;

    const total = filtered.length;
    const page = Math.max(1, params.page);
    const limit = parseAdminListLimit(params.limit, 20);
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    const folderTree = this.buildFolderTree(filtered);

    return {
      data,
      folderTree,
      realms,
      tabs,
      subTabs,
      childFolders,
      breadcrumb,
      folderPath: folderFilter,
      pagination: { page, limit, total, totalPages },
    };
  }

  /** Di chuyển file vào folder đích (images / files / videos). */
  async bulkMoveFiles(
    paths: string[],
    destinationFolder: string,
  ): Promise<BulkMoveFilesResult> {
    const unique = [
      ...new Set(
        paths.map((p) => p?.trim()).filter((p): p is string => Boolean(p)),
      ),
    ];
    const dest = destinationFolder.trim().replace(/\/$/, '');
    if (!unique.length) {
      return { moved: 0, skipped: 0, renamed: 0, errors: [] };
    }
    if (!dest) {
      throw new Error('Thiếu thư mục đích');
    }

    const { fullPath: destDir, baseDir } = this.resolvePath(dest);
    if (!destDir.startsWith(baseDir)) {
      throw new Error('Thư mục đích không hợp lệ');
    }
    let destStat = await stat(destDir).catch(() => null);
    if (!destStat?.isDirectory()) {
      const isRealmRoot = ['images', 'files', 'videos', 'audio'].includes(dest);
      if (isRealmRoot) {
        await this.ensureDir(destDir);
        destStat = await stat(destDir).catch(() => null);
      }
    }
    if (!destStat?.isDirectory()) {
      throw new Error('Thư mục đích không tồn tại');
    }

    const result: BulkMoveFilesResult = {
      moved: 0,
      skipped: 0,
      renamed: 0,
      errors: [],
    };
    const usedTargets = new Set<string>();

    for (const from of unique) {
      const fileName = path.posix.basename(from.replace(/\\/g, '/'));
      const plannedTo = `${dest}/${fileName}`.replace(/\\/g, '/');
      const to = uniqueFlattenTargetPath(plannedTo, usedTargets);
      try {
        const { fullPath: fromFull, baseDir: fromBase } =
          this.resolvePath(from);
        const { fullPath: toFull, baseDir: toBase } = this.resolvePath(to);
        if (!fromFull.startsWith(fromBase) || !toFull.startsWith(toBase)) {
          throw new Error('Đường dẫn không hợp lệ');
        }
        const fromStat = await stat(fromFull).catch(() => null);
        if (!fromStat?.isFile()) {
          result.skipped += 1;
          continue;
        }
        await this.ensureDir(path.dirname(toFull));
        const exists = await stat(toFull).catch(() => null);
        if (exists) {
          result.skipped += 1;
          result.errors.push({
            from,
            to,
            message: 'File đích đã tồn tại',
          });
          continue;
        }
        await rename(fromFull, toFull);
        result.moved += 1;
        if (to !== plannedTo) result.renamed += 1;
      } catch (err) {
        result.skipped += 1;
        result.errors.push({
          from,
          to,
          message: err instanceof Error ? err.message : 'Lỗi di chuyển file',
        });
      }
    }

    return result;
  }

  /** Xây folder tree từ danh sách ảnh */
  private buildFolderTree(images: ImageItemDto[]): FolderNodeDto {
    const root: FolderNodeDto = {
      name: '',
      path: '',
      images: [],
      subfolders: [],
    };
    const pathToNode = new Map<string, FolderNodeDto>();
    pathToNode.set('', root);

    for (const img of images) {
      const parts = img.relativePath.split('/').filter(Boolean);
      const fileName = parts.pop();
      if (!fileName) continue;
      let currentPath = '';
      let current = root;
      for (const part of parts) {
        const nextPath = currentPath ? `${currentPath}/${part}` : part;
        let node = pathToNode.get(nextPath);
        if (!node) {
          node = { name: part, path: nextPath, images: [], subfolders: [] };
          current.subfolders.push(node);
          pathToNode.set(nextPath, node);
        }
        current = node;
        currentPath = nextPath;
      }
      current.images.push(img);
    }
    return root;
  }

  /** Danh sách thư mục (path + name) */
  async listFolders(): Promise<ListFoldersResult> {
    const folderSet = new Set<string>();
    const addFromImages = async (dir: string, prefix: string) => {
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
          folderSet.add(rel);
          await addFromImages(path.join(dir, entry.name), rel);
        }
      } catch {
        // ignore
      }
    };
    await addFromImages(IMAGES_DIR, 'images');
    await addFromImages(FILES_DIR, 'files');
    await addFromImages(VIDEOS_DIR, 'videos');
    await addFromImages(AUDIO_DIR, 'audio');
    const realmRoots: Array<[string, string]> = [
      [IMAGES_DIR, 'images'],
      [FILES_DIR, 'files'],
      [VIDEOS_DIR, 'videos'],
      [AUDIO_DIR, 'audio'],
    ];
    for (const [dir, rel] of realmRoots) {
      try {
        const st = await stat(dir);
        if (st.isDirectory()) folderSet.add(rel);
      } catch {
        // realm chưa có thư mục trên disk
      }
    }
    try {
      const top = await readdir(STORAGE_DIR, { withFileTypes: true });
      for (const entry of top) {
        if (!entry.isDirectory() || entry.name === 'uploads') continue;
        folderSet.add(entry.name);
        await addFromImages(path.join(STORAGE_DIR, entry.name), entry.name);
      }
    } catch {
      // ignore
    }

    const sorted = Array.from(folderSet).sort();
    const data: FolderItemDto[] = await Promise.all(
      sorted.map(async (p) => {
        const policy = await this.readPolicyForRelativeFolder(p);
        return {
          path: p,
          name: path.basename(p),
          allowedExtensions: policy?.allowedExtensions,
          realm: policy?.realm,
        };
      }),
    );
    return { data };
  }

  private policyFilePath(dirPath: string): string {
    return path.join(dirPath, STORAGE_POLICY_FILENAME);
  }

  private async readPolicyFile(
    dirPath: string,
  ): Promise<StorageFolderPolicy | null> {
    try {
      const raw = await readFile(this.policyFilePath(dirPath), 'utf8');
      const parsed = JSON.parse(raw) as StorageFolderPolicy;
      if (
        parsed?.version === 1 &&
        Array.isArray(parsed.allowedExtensions) &&
        parsed.allowedExtensions.length > 0
      ) {
        return parsed;
      }
    } catch {
      // no policy
    }
    return null;
  }

  private async writePolicyFile(
    dirPath: string,
    policy: StorageFolderPolicy,
  ): Promise<void> {
    await writeFile(
      this.policyFilePath(dirPath),
      `${JSON.stringify(policy, null, 2)}\n`,
      'utf8',
    );
  }

  private async readPolicyWalkingUp(
    startDir: string,
  ): Promise<StorageFolderPolicy | null> {
    let current = path.resolve(startDir);
    const storageRoot = path.resolve(STORAGE_DIR);
    const uploadsRoot = path.resolve(UPLOADS_DIR);

    while (current.startsWith(storageRoot) || current.startsWith(uploadsRoot)) {
      const policy = await this.readPolicyFile(current);
      if (policy) return policy;
      if (current === storageRoot || current === uploadsRoot) break;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return null;
  }

  private async readPolicyForRelativeFolder(
    relativeFolder: string,
  ): Promise<StorageFolderPolicy | null> {
    try {
      const { fullPath } = this.resolvePath(relativeFolder);
      const st = await stat(fullPath).catch(() => null);
      if (!st?.isDirectory()) return null;
      return this.readPolicyFile(fullPath);
    } catch {
      return null;
    }
  }

  private async resolveUploadPolicy(
    folderPath?: string,
    uploadKind: 'images' | 'files' | 'videos' | 'audio' = 'images',
  ): Promise<StorageFolderPolicy> {
    if (folderPath?.trim()) {
      const normalized = folderPath.replace(/\\/g, '/').replace(/\/$/, '');
      try {
        const { fullPath } = this.resolvePath(normalized);
        const st = await stat(fullPath).catch(() => null);
        const startDir = st?.isDirectory() ? fullPath : path.dirname(fullPath);
        const inherited = await this.readPolicyWalkingUp(startDir);
        if (inherited) return inherited;
        const realm = inferRealmFromDiskFolderPath(normalized);
        return buildFolderPolicy(realm);
      } catch {
        return buildFolderPolicy(uploadKind);
      }
    }
    return buildFolderPolicy(uploadKind);
  }

  /** Tạo thư mục */
  async createFolder(
    folderName: string,
    parentPath?: string | null,
    resourceType: 'images' | 'files' | 'videos' | 'audio' = 'images',
    allowedExtensions?: string[],
  ): Promise<{ folderName: string; folderPath: string }> {
    const safeName = folderName
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/\/+/g, '');
    if (!safeName) throw new Error('Tên thư mục không hợp lệ');

    let targetDir: string;
    let folderPath: string;

    if (parentPath) {
      const trimmed = parentPath.replace(/\/$/, '');
      const realmTarget = resolveCreateFolderTarget(trimmed, safeName, {
        storageDir: STORAGE_DIR,
        uploadsDir: UPLOADS_DIR,
        imagesDir: IMAGES_DIR,
        filesDir: FILES_DIR,
        videosDir: VIDEOS_DIR,
        audioDir: AUDIO_DIR,
      });

      if (realmTarget) {
        targetDir = realmTarget.targetDir;
        folderPath = realmTarget.folderPath;
      } else {
        // Legacy: folderPath không có prefix images/files
        const clean = trimmed.replace(/^images\//, '');
        if (clean.startsWith('images') || this.hasDateStructure(clean)) {
          targetDir = path.join(
            IMAGES_DIR,
            clean.replace(/^images\/?/, ''),
            safeName,
          );
          folderPath = path
            .join('images', clean.replace(/^images\/?/, ''), safeName)
            .replace(/\\/g, '/');
        } else {
          targetDir = path.join(STORAGE_DIR, clean, safeName);
          folderPath = path.join(clean, safeName).replace(/\\/g, '/');
        }
      }
    } else {
      // Root create
      if (resourceType === 'files') {
        targetDir = path.join(FILES_DIR, safeName);
        folderPath = path.join('files', safeName).replace(/\\/g, '/');
      } else if (resourceType === 'videos') {
        targetDir = path.join(VIDEOS_DIR, safeName);
        folderPath = path.join('videos', safeName).replace(/\\/g, '/');
      } else if (resourceType === 'audio') {
        targetDir = path.join(AUDIO_DIR, safeName);
        folderPath = path.join('audio', safeName).replace(/\\/g, '/');
      } else {
        targetDir = path.join(STORAGE_DIR, safeName);
        folderPath = safeName;
      }
    }

    await this.ensureDir(targetDir);

    if (allowedExtensions?.length) {
      const policy = buildFolderPolicy(resourceType, allowedExtensions);
      await this.writePolicyFile(targetDir, policy);
    }

    return { folderName: safeName, folderPath };
  }

  /** Lưu file upload (buffer) và trả về metadata. Không cho phép upload trùng tên (cùng tên file trong cùng thư mục). */
  private fixUtf8Filename(name: string): string {
    // Busboy/Multer trên Windows đôi khi decode UTF-8 filename thành Latin-1.
    // Nếu phát hiện ký tự lạ (Ã, Â, ¡, ¢...), thử re-encode.
    if (
      /[\u0080-\u00FF]/.test(name) &&
      /[ÃÂÀÁÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüý]/.test(name)
    ) {
      try {
        const decoded = Buffer.from(name, 'latin1').toString('utf8');
        if (decoded !== name) return decoded;
      } catch {
        /* fallback */
      }
    }
    return name;
  }

  async saveFile(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    folderPath?: string,
    isExistingFolder?: boolean,
    serveBaseUrl?: string,
  ): Promise<{
    fileName: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    relativePath: string;
  }> {
    const originalName = this.fixUtf8Filename(file.originalname);
    const rawExt = path.extname(originalName).toLowerCase();
    const mimePrimary = (file.mimetype || '')
      .split(';')[0]
      .trim()
      .toLowerCase();

    let ext = rawExt;
    if (!ALLOWED_EXT.includes(ext)) {
      // Chỉ suy đuôi từ MIME khi không có đuôi — tránh ghi đè tên kiểu "file.exe".
      if (
        ext === '' &&
        mimePrimary &&
        mimePrimary !== 'application/octet-stream'
      ) {
        const inferred = PRIMARY_MIME_TO_EXT[mimePrimary];
        if (inferred && ALLOWED_EXT.includes(inferred)) {
          ext = inferred;
        }
      }
    }

    if (!ALLOWED_EXT.includes(ext)) {
      throw new Error(
        [
          'Định dạng file không được phép.',
          rawExt ? `Đuôi: ${rawExt}` : 'Không có đuôi file.',
          mimePrimary ? `MIME: ${mimePrimary}` : '',
        ]
          .filter(Boolean)
          .join(' '),
      );
    }

    const uploadKind: 'images' | 'files' | 'videos' | 'audio' =
      ALLOWED_MIME[ext]?.startsWith('image/') ||
      (isImageExt(ext) && isImageMime(file.mimetype))
        ? 'images'
        : isVideoStorageFile(ext, mimePrimary || file.mimetype)
          ? 'videos'
          : isAudioStorageFile(ext, mimePrimary || file.mimetype)
            ? 'audio'
            : 'files';

    const uploadPolicy = await this.resolveUploadPolicy(folderPath, uploadKind);
    if (!isExtensionAllowed(ext, uploadPolicy.allowedExtensions)) {
      throw new Error(
        `Định dạng ${ext} không được phép trong thư mục đích. Cho phép: ${uploadPolicy.allowedExtensions.join(', ')}`,
      );
    }

    const stripForBase = rawExt || ext;
    let baseName = path.basename(originalName, stripForBase || undefined);
    // Thay ký tự không hợp lệ thành dấu gạch ngang
    baseName = baseName.replace(/[^[\]\p{L}\p{N}_-]/gu, '-');
    // Rút gọn nhiều dấu gạch liên tiếp
    baseName = baseName.replace(/[-_]+/g, '-');
    // Xoá dấu gạch đầu/cuối
    baseName = baseName.replace(/^-+|-+$/g, '');

    // Xử lý ảnh: resize + chuyển WebP để giảm dung lượng
    let writeBuffer = file.buffer;
    let finalExt = ext;
    let finalMime =
      ALLOWED_MIME[ext] ||
      mimePrimary ||
      file.mimetype ||
      'application/octet-stream';
    let finalSize = file.buffer.length;
    let isImage = false;

    if (
      uploadKind === 'images' &&
      isImageExt(ext) &&
      isImageMime(file.mimetype)
    ) {
      try {
        const processed = await processImageBuffer(file.buffer);
        writeBuffer = processed.webpBuffer;
        finalExt = '.webp';
        finalMime = 'image/webp';
        finalSize = writeBuffer.length;
        isImage = true;
      } catch {
        // fallback: lưu file gốc nếu xử lý ảnh thất bại
      }
    }

    const uniqueName = `${baseName}_${Date.now()}${isImage ? '.webp' : finalExt}`;

    const { fullPath, relativePath, urlPath } = this.generateFilePath(
      uniqueName,
      folderPath || undefined,
      isExistingFolder === true,
      serveBaseUrl,
      uploadKind,
    );

    const targetDir = path.dirname(fullPath);
    await this.ensureDir(targetDir);

    // Nếu đã có file cùng baseName trong thư mục, trả về URL file đó thay vì upload lại
    const existingFile = await this.findFileWithSameBaseName(
      targetDir,
      baseName,
      finalExt,
    );
    if (existingFile) {
      const existingRelative = path
        .join(path.dirname(relativePath), existingFile)
        .replace(/\\/g, '/');
      const existingUrl = serveBaseUrl
        ? `${serveBaseUrl}/${existingRelative}`
        : `/api/uploads/${existingRelative}`;
      return {
        fileName: existingFile,
        originalName,
        size: finalSize,
        mimeType: finalMime,
        url: existingUrl,
        relativePath: existingRelative,
      };
    }

    const { writeFile } = await import('fs/promises');
    await writeFile(fullPath, writeBuffer);

    return {
      fileName: uniqueName,
      originalName,
      size: finalSize,
      mimeType: finalMime,
      url: urlPath,
      relativePath,
    };
  }

  /**
   * Kiểm tra trong thư mục đã có file có cùng baseName và ext chưa (bỏ qua phần _timestamp).
   * So sánh không phân biệt hoa/thường để trùng "Photo.jpg" và "photo.jpg".
   */
  private async findFileWithSameBaseName(
    dirPath: string,
    baseName: string,
    ext: string,
  ): Promise<string | null> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      const prefix = baseName + '_';
      const prefixLower = prefix.toLowerCase();
      const extLower = ext.toLowerCase();
      const found = entries.find(
        (e) =>
          !e.isDirectory() &&
          e.name.toLowerCase().startsWith(prefixLower) &&
          e.name.toLowerCase().endsWith(extLower),
      );
      return found ? found.name : null;
    } catch {
      return null;
    }
  }

  /**
   * Xuất toàn bộ kho lưu trữ thành ZIP (quét disk trên server — không giới hạn phân trang UI).
   */
  async exportArchive(): Promise<ExportArchiveResult> {
    const items = await this.collectAllStorageItems('');
    const zip = new JSZip();
    const usedPaths = new Set<string>();
    let fileCount = 0;
    let skipped = 0;

    for (const item of items) {
      const entryPath = item.relativePath.replace(/\\/g, '/');
      let zipPath = entryPath;
      if (usedPaths.has(zipPath)) {
        const dot = zipPath.lastIndexOf('.');
        const stem = dot > 0 ? zipPath.slice(0, dot) : zipPath;
        const ext = dot > 0 ? zipPath.slice(dot) : '';
        let index = 2;
        zipPath = `${stem}-${index}${ext}`;
        while (usedPaths.has(zipPath)) {
          index += 1;
          zipPath = `${stem}-${index}${ext}`;
        }
      }

      try {
        const { fullPath, baseDir } = this.resolvePath(entryPath);
        if (!fullPath.startsWith(baseDir)) {
          skipped += 1;
          continue;
        }
        const st = await stat(fullPath);
        if (!st.isFile()) {
          skipped += 1;
          continue;
        }
        const buffer = await readFile(fullPath);
        zip.file(zipPath, buffer);
        usedPaths.add(zipPath);
        fileCount += 1;
      } catch {
        skipped += 1;
      }
    }

    if (fileCount === 0) {
      throw new Error('Không có file để xuất từ kho lưu trữ');
    }

    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return { buffer, fileCount, skipped };
  }

  /**
   * Khôi phục kho lưu trữ từ file ZIP (export từ admin).
   * Ghi trực tiếp lên disk theo relativePath — không đổi tên / không nén lại ảnh.
   */
  async importArchive(
    zipBuffer: Buffer,
    options?: { overwrite?: boolean },
  ): Promise<ImportArchiveResult> {
    const overwrite = options?.overwrite === true;
    const zip = await JSZip.loadAsync(zipBuffer);

    const rawEntries: Array<{
      zipPath: string;
      entry: JSZip.JSZipObject;
    }> = [];
    for (const [zipPath, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;
      const normalized = normalizeZipEntryPath(zipPath);
      if (!normalized) continue;
      rawEntries.push({ zipPath: normalized, entry });
    }

    if (!rawEntries.length) {
      throw new Error('File ZIP không chứa file hợp lệ');
    }

    const allZipPaths = rawEntries.map((item) => item.zipPath);
    const totalEntries = rawEntries.length;
    let restored = 0;
    let skipped = 0;
    let skippedUnsupportedExt = 0;
    let skippedDuplicates = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const { zipPath, entry } of rawEntries) {
      const relativePath = mapZipPathToStoragePath(zipPath, allZipPaths);
      const ext = path.extname(relativePath).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        skipped += 1;
        skippedUnsupportedExt += 1;
        continue;
      }

      try {
        const { fullPath, baseDir } = this.resolvePath(relativePath);
        if (!fullPath.startsWith(baseDir)) {
          failed += 1;
          if (errors.length < 10) {
            errors.push(`${relativePath}: đường dẫn không hợp lệ`);
          }
          continue;
        }

        const existing = await stat(fullPath).catch(() => null);
        if (existing?.isFile() && !overwrite) {
          skipped += 1;
          skippedDuplicates += 1;
          continue;
        }

        const buffer = await entry.async('nodebuffer');
        await this.ensureDir(path.dirname(fullPath));
        await writeFile(fullPath, buffer);
        restored += 1;
      } catch (err) {
        failed += 1;
        if (errors.length < 10) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${relativePath}: ${msg}`);
        }
      }
    }

    if (restored === 0 && skipped === 0) {
      throw new Error('Không khôi phục được file nào từ ZIP');
    }

    const listedTotal = (await this.collectAllStorageItems('')).length;

    return {
      restored,
      skipped,
      failed,
      totalEntries,
      skippedUnsupportedExt,
      skippedDuplicates,
      listedTotal,
      errors,
    };
  }

  /**
   * Gom file từ folder ngày/tháng/năm (YYYY/MM/DD, YYYY/MM, YYYY) về folder chính.
   * VD: images/avatars/2026/05/15/a.jpg → images/avatars/a.jpg
   */
  async reorganizeDateFolders(params: {
    scopePath?: string;
    dryRun?: boolean;
  }): Promise<ReorganizeDateFoldersResult> {
    const scopePath = params.scopePath?.trim() || null;
    const dryRun = Boolean(params.dryRun);
    const items = await this.collectAllStorageItems();

    const moves: Array<{ from: string; to: string; plannedTo: string }> = [];
    const usedTargets = new Set<string>();

    for (const item of items) {
      if (!isUnderReorganizeScope(item.relativePath, scopePath ?? undefined)) {
        continue;
      }
      const plan = flattenDateStoragePath(item.relativePath);
      if (!plan) continue;
      const to = uniqueFlattenTargetPath(plan.to, usedTargets);
      moves.push({ from: plan.from, to, plannedTo: plan.to });
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
      preview: moves.slice(0, 50).map((move) => ({
        from: move.from,
        to: move.to,
      })),
    };

    if (dryRun || !moves.length) {
      return result;
    }

    for (const move of moves) {
      try {
        const { fullPath: fromFull, baseDir: fromBase } = this.resolvePath(
          move.from,
        );
        const { fullPath: toFull, baseDir: toBase } = this.resolvePath(move.to);
        if (!fromFull.startsWith(fromBase) || !toFull.startsWith(toBase)) {
          throw new Error('Đường dẫn không hợp lệ');
        }
        const fromStat = await stat(fromFull).catch(() => null);
        if (!fromStat?.isFile()) {
          result.skipped += 1;
          continue;
        }
        await this.ensureDir(path.dirname(toFull));
        const exists = await stat(toFull).catch(() => null);
        if (exists) {
          result.skipped += 1;
          result.errors.push({
            from: move.from,
            to: move.to,
            message: 'File đích đã tồn tại',
          });
          continue;
        }
        await rename(fromFull, toFull);
        result.moved += 1;
        if (move.to !== move.plannedTo) {
          result.renamed += 1;
        }
      } catch (err) {
        result.skipped += 1;
        result.errors.push({
          from: move.from,
          to: move.to,
          message: err instanceof Error ? err.message : 'Lỗi di chuyển file',
        });
      }
    }

    const cleanupPaths = collectDateFolderCleanupPaths(
      moves.map((move) => move.from),
    );
    for (const dirPath of cleanupPaths) {
      try {
        const { fullPath, baseDir } = this.resolvePath(dirPath);
        if (!fullPath.startsWith(baseDir)) continue;
        const dirStat = await stat(fullPath).catch(() => null);
        if (!dirStat?.isDirectory()) continue;
        const entries = await readdir(fullPath);
        if (entries.length > 0) continue;
        await rmdir(fullPath);
        result.removedDirs += 1;
      } catch {
        // bỏ qua — folder có thể chưa trống hoặc đã xóa
      }
    }

    return result;
  }

  /** Xóa file theo relativePath */
  async deleteFile(relativePath: string): Promise<void> {
    const { fullPath } = this.resolvePath(relativePath);
    await unlink(fullPath);
  }

  /**
   * Xóa hàng loạt trên server (một request API) — tránh N lần HTTP DELETE từ browser.
   */
  async bulkDeleteFiles(paths: string[]): Promise<UploadsBulkDeleteResult> {
    const unique = [
      ...new Set(
        paths.map((p) => p?.trim()).filter((p): p is string => Boolean(p)),
      ),
    ];
    if (!unique.length) {
      return { deleted: 0, failed: 0, errors: [] };
    }
    if (unique.length > UPLOADS_BULK_DELETE_MAX_PATHS) {
      throw new Error(
        `Tối đa ${UPLOADS_BULK_DELETE_MAX_PATHS} file mỗi lần xóa hàng loạt`,
      );
    }

    const errors: UploadsBulkDeleteResult['errors'] = [];
    let deleted = 0;
    let failed = 0;
    let cursor = 0;

    const worker = async (): Promise<void> => {
      while (cursor < unique.length) {
        const index = cursor;
        cursor += 1;
        const relativePath = unique[index];
        if (!relativePath) continue;
        try {
          await this.deleteFile(relativePath);
          deleted += 1;
        } catch (err) {
          failed += 1;
          const message = err instanceof Error ? err.message : 'Lỗi xóa file';
          errors.push({ path: relativePath, message });
        }
      }
    };

    const workers = Math.min(UPLOADS_BULK_DELETE_CONCURRENCY, unique.length);
    await Promise.all(Array.from({ length: workers }, () => worker()));

    return { deleted, failed, errors };
  }

  /** Xóa thư mục đệ quy */
  private async deleteDirRecursive(dirPath: string): Promise<void> {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await this.deleteDirRecursive(full);
      } else {
        await unlink(full);
      }
    }
    await rmdir(dirPath);
  }

  async deleteFolder(relativePath: string): Promise<void> {
    const clean = relativePath.replace(/\/$/, '').replace(/\.\./g, '');
    let fullPath: string;
    let baseDir: string;
    if (clean.startsWith('images/')) {
      fullPath = path.resolve(IMAGES_DIR, clean.slice(7));
      baseDir = path.resolve(IMAGES_DIR);
    } else if (clean.startsWith('files/')) {
      fullPath = path.resolve(FILES_DIR, clean.slice(6));
      baseDir = path.resolve(FILES_DIR);
    } else if (clean.startsWith('videos/')) {
      fullPath = path.resolve(VIDEOS_DIR, clean.slice(7));
      baseDir = path.resolve(VIDEOS_DIR);
    } else if (clean.startsWith('audio/')) {
      fullPath = path.resolve(AUDIO_DIR, clean.slice(6));
      baseDir = path.resolve(AUDIO_DIR);
    } else {
      fullPath = path.resolve(STORAGE_DIR, clean);
      baseDir = path.resolve(STORAGE_DIR);
    }
    if (!fullPath.startsWith(baseDir) || fullPath === baseDir) {
      throw new Error('Đường dẫn không hợp lệ');
    }
    const st = await stat(fullPath).catch(() => null);
    if (!st?.isDirectory()) throw new Error('Thư mục không tồn tại');
    await this.deleteDirRecursive(fullPath);
  }

  /** Resolve relativePath -> fullPath (bảo mật) */
  resolvePath(relativePath: string): { fullPath: string; baseDir: string } {
    return resolveStorageRelativePath(relativePath, {
      storageDir: STORAGE_DIR,
      uploadsDir: UPLOADS_DIR,
      imagesDir: IMAGES_DIR,
      filesDir: FILES_DIR,
      videosDir: VIDEOS_DIR,
      audioDir: AUDIO_DIR,
    });
  }

  /** Stream file để serve (trả về stream + contentType + originalName) */
  async serveFile(relativePath: string): Promise<{
    stream: ReadStream;
    contentType: string;
    originalName: string;
  }> {
    const { fullPath, baseDir } = this.resolvePath(relativePath);
    if (!fullPath.startsWith(baseDir)) {
      throw new Error('Invalid path');
    }
    const st = await stat(fullPath);
    if (!st.isFile()) throw new Error('Not a file');
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = ALLOWED_MIME[ext] || 'application/octet-stream';
    const stream = createReadStream(fullPath);
    const originalName = this.readOriginalName(
      fullPath,
      path.basename(relativePath),
    );
    return { stream, contentType, originalName };
  }

  /**
   * Serve ảnh đã resize theo chiều rộng yêu cầu. Cache file trên đĩa để tránh xử lý lại.
   */
  async serveResized(
    relativePath: string,
    width: number,
    quality: number,
  ): Promise<{
    stream: ReadStream;
    contentType: string;
    originalName: string;
  }> {
    const { fullPath, baseDir } = this.resolvePath(relativePath);
    if (!fullPath.startsWith(baseDir)) {
      throw new Error('Invalid path');
    }
    const st = await stat(fullPath).catch(() => null);
    if (!st?.isFile()) throw new Error('Not a file');

    const originalName = this.readOriginalName(
      fullPath,
      path.basename(relativePath),
    );

    const cacheDir = path.join(STORAGE_DIR, IMAGE_RESIZE_CACHE_DIR);
    const relPathWithoutPrefix = relativePath.replace(
      /^(images\/|files\/)/,
      '',
    );
    const cachePath = path.join(
      cacheDir,
      `${relPathWithoutPrefix}_w${width}_q${quality}.webp`,
    );

    // Trả về cached nếu có
    if (existsSync(cachePath)) {
      return {
        stream: createReadStream(cachePath),
        contentType: 'image/webp',
        originalName,
      };
    }

    // Resize và cache
    await mkdir(path.dirname(cachePath), { recursive: true });
    try {
      await sharp(fullPath)
        .resize(width, undefined, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toFile(cachePath);
    } catch {
      // Nếu resize thất bại, trả về file gốc
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = ALLOWED_MIME[ext] || 'application/octet-stream';
      return { stream: createReadStream(fullPath), contentType, originalName };
    }

    return {
      stream: createReadStream(cachePath),
      contentType: 'image/webp',
      originalName,
    };
  }
}
