import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePublicUploadsController } from './public-uploads.controller';
import { BaseUploadsController } from './uploads.controller';

@Module({})
export class BaseUploadsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseUploadsController,
        BasePublicUploadsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseUploadsController } from './uploads.controller';
export { BasePublicUploadsController } from './public-uploads.controller';
export {
  BaseUploadsService,
  type StorageMediaKind,
  type StorageRealm,
  type StorageTabDto,
  type ImageItemDto,
  type FolderItemDto,
  type ListImagesResult,
  type CreateStorageFolderResult,
  type UploadsBulkDeleteResult,
  type BulkMoveFilesResult,
  type ReorganizeDateFoldersResult,
  type ImportArchiveResult,
  type ExportArchiveResult,
  type UploadFileInput,
} from './uploads.service';
