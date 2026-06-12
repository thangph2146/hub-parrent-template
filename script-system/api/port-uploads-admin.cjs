/**
 * Port hub-event uploads.service.ts → packages/api-server uploads-admin.service.ts
 */
const fs = require('fs')
const path = require('path')

const SRC = path.join(
  __dirname,
  '../../apps/hub-event/api/src/uploads/uploads.service.ts',
)
const DEST = path.join(
  __dirname,
  '../../packages/api-server/src/modules/uploads/uploads-admin.service.ts',
)

const raw = fs.readFileSync(SRC, 'utf8')

const marker = 'const ALLOWED_EXT = ['
const exportIdx = raw.indexOf(marker)
if (exportIdx < 0) throw new Error('ALLOWED_EXT not found')

let body = raw.slice(exportIdx)

const classIdx = body.indexOf('@Injectable()')
if (classIdx < 0) throw new Error('UploadsService class not found')
const constantsPart = body.slice(0, classIdx)
let classPart = body.slice(classIdx)

const header = `/**
 * Uploads Admin Service — logic đầy đủ từ apps/hub-event/api (port bằng port-uploads-admin.cjs).
 */
import { toEntityId, toEntityIdList } from '../../common/entity-id';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { createReadStream, existsSync } from 'fs';
import {
  stat,
  readdir,
  mkdir,
  rmdir,
  rename,
  writeFile,
  readFile,
  copyFile,
} from 'fs/promises';
import JSZip from 'jszip';
import type { ReadStream } from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { unlinkWithRetry } from '../../common/fs-unlink-retry';
import { parseAdminListLimit } from '../../common/parse-list-query';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../../common/pagination';
import {
  isImageMime,
  isImageExt,
  processImageBuffer,
} from '../../common/image-processor';
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
import { buildStorageFolderLabelLookup } from './storage-folder-labels';
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
import { resolveStorageFolderSlugPath } from './storage-folder-name';
import {
  planOrderLineImageSnapshots,
  type OrderLineSnapshotInput,
} from './order-image-snapshot';
import { assertStoragePathMutable } from './storage-protected-paths';
import {
  buildStoredUploadFileName,
  resolveImageFileOwnerId,
  storedUploadFilePrefix,
} from './upload-filename';

export const UPLOADS_BULK_DELETE_MAX_PATHS = ADMIN_TABLE_EXPORT_MAX_LIMIT;

/** Windows: giảm song song để tránh EBUSY khi ảnh vừa được serve/resize. */
const UPLOADS_BULK_DELETE_CONCURRENCY = process.platform === 'win32' ? 4 : 32;

export type UploadsBulkDeleteResult = {
  deleted: number;
  failed: number;
  errors: Array<{ path: string; message: string }>;
};

const IMAGE_RESIZE_CACHE_DIR = 'cache/resized';

`

classPart = classPart.replace(
  /@Injectable\(\)\r?\nexport class UploadsService \{\r?\n  constructor\(private readonly em: EntityManager\) \{\}\r?\n\r?\n  private getImagesDir\(\): string \{\r?\n    return IMAGES_DIR;\r?\n  \}\r?\n\r?\n  private getStorageDir\(\): string \{\r?\n    return STORAGE_DIR;\r?\n  \}\r?\n\r?\n  private getUploadsDir\(\): string \{\r?\n    return UPLOADS_DIR;\r?\n  \}\r?\n/,
  `@Injectable()
export abstract class BaseUploadsAdminService {
  protected abstract getEm(): EntityManager;
  protected abstract getStorageFileEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getStorageRootDir(): string;

  private getImagesDir(): string {
    return path.normalize(path.join(this.getStorageRootDir(), 'uploads', 'images'));
  }

  private getStorageDir(): string {
    return path.normalize(this.getStorageRootDir());
  }

  private getUploadsDir(): string {
    return path.normalize(path.join(this.getStorageRootDir(), 'uploads'));
  }

  private getFilesDir(): string {
    return path.normalize(path.join(this.getUploadsDir(), 'files'));
  }

  private getVideosDir(): string {
    return path.normalize(path.join(this.getUploadsDir(), 'videos'));
  }

  private getAudioDir(): string {
    return path.normalize(path.join(this.getUploadsDir(), 'audio'));
  }

`,
)

classPart = classPart.replace(/\bthis\.em\b/g, 'this.getEm()')

const entityReplacements = [
  [/findOne\(StorageFile,/g, 'findOne(this.getStorageFileEntity(),'],
  [/find\(StorageFile,/g, 'find(this.getStorageFileEntity(),'],
  [/nativeDelete\(StorageFile,/g, 'nativeDelete(this.getStorageFileEntity(),'],
  [/create\(StorageFile,/g, 'create(this.getStorageFileEntity(),'],
  [/findOne\(User,/g, 'findOne(this.getUserEntity(),'],
  [/find\(User,/g, 'find(this.getUserEntity(),'],
  [/\bIMAGES_DIR\b/g, 'this.getImagesDir()'],
  [/\bFILES_DIR\b/g, 'this.getFilesDir()'],
  [/\bVIDEOS_DIR\b/g, 'this.getVideosDir()'],
  [/\bAUDIO_DIR\b/g, 'this.getAudioDir()'],
  [/\bUPLOADS_DIR\b/g, 'this.getUploadsDir()'],
  [/\bSTORAGE_DIR\b/g, 'this.getStorageDir()'],
]

for (const [pattern, replacement] of entityReplacements) {
  classPart = classPart.replace(pattern, replacement)
}

// constantsPart may include export interface blocks before ALLOWED_EXT — already sliced from ALLOWED_EXT
// Extract exported interfaces between ALLOWED_EXT end and class - they're inside constantsPart
// constantsPart starts with ALLOWED_EXT array + PRIMARY_MIME + export interfaces

fs.writeFileSync(DEST, header + constantsPart.trim() + '\n\n' + classPart.trim() + '\n')
console.log('Wrote', DEST)
