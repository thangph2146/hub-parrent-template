/**
 * Uploads module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseUploadsService,
  BaseUploadsService as BaseUploadsAdminService,
  UPLOADS_BULK_DELETE_MAX_PATHS,
} from './uploads.service';
export {
  BaseUploadsController,
  BaseUploadsController as BaseUploadsAdminController,
} from './uploads.controller';
export type { IUploadsControllerService } from './uploads.controller';
/** @deprecated Dùng `IUploadsControllerService`. */
export type { IUploadsControllerService as IUploadsAdminControllerService } from './uploads.controller';
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
  CreateStorageFolderResult,
  UploadFileInput,
  StorageMediaKind,
  StorageRealm,
  StorageTabDto,
} from './uploads.service';
export { BaseUploadsModule } from './uploads.module';
