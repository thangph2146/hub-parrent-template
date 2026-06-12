/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseUploadsAdminService,
  UPLOADS_BULK_DELETE_MAX_PATHS,
} from '@workspace/api-server/modules/uploads';
import { appConfig } from '../config/app.config';
import { StorageFile } from '../entities/storage-file.entity';
import { User } from '../entities/user.entity';

export type {
  ImageItemDto,
  FolderItemDto,
  FolderNodeDto,
  ListImagesResult,
  ListFoldersResult,
  BulkMoveFilesResult,
  ReorganizeDateFoldersResult,
  ImportArchiveResult,
  ExportArchiveResult,
  UploadsBulkDeleteResult,
} from '@workspace/api-server/modules/uploads';
export { UPLOADS_BULK_DELETE_MAX_PATHS };

@Injectable()
export class UploadsService extends BaseUploadsAdminService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getStorageFileEntity(): new () => Record<string, unknown> {
    return StorageFile as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getStorageRootDir(): string {
    return appConfig.storageDir;
  }
}
