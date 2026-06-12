/**
 * StorageFiles Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseStorageFilesController } from './storage-file.controller';

@Module({})
export class BaseStorageFilesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseStorageFilesController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseStorageFilesController } from './storage-file.controller';
export {
  BaseStorageFilesService,
  type StorageFilesRowDto,
  type StorageFilesCreateData,
  type StorageFilesUpdateData,
} from './storage-file.service';
