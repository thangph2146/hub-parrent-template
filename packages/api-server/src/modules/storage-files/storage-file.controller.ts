/**
 * StorageFiles Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  StorageFilesRowDto,
  StorageFilesCreateData,
  StorageFilesUpdateData,
} from './storage-file.service';

export type IStorageFilesControllerService = ICrudControllerService<
  StorageFilesRowDto,
  StorageFilesCreateData,
  StorageFilesUpdateData
>;

@ApiTags('StorageFiles')
export class BaseStorageFilesController extends BaseCrudController<
  StorageFilesRowDto,
  StorageFilesCreateData,
  StorageFilesUpdateData
> {
  constructor(service: IStorageFilesControllerService) {
    super(service, 'storage-files');
  }
}
