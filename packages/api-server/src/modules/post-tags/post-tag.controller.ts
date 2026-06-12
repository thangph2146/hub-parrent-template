/**
 * PostTags Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  PostTagsRowDto,
  PostTagsCreateData,
  PostTagsUpdateData,
} from './post-tag.service';

export type IPostTagsControllerService = ICrudControllerService<
  PostTagsRowDto,
  PostTagsCreateData,
  PostTagsUpdateData
>;

@ApiTags('PostTags')
export class BasePostTagsController extends BaseCrudController<
  PostTagsRowDto,
  PostTagsCreateData,
  PostTagsUpdateData
> {
  constructor(service: IPostTagsControllerService) {
    super(service, 'post-tags');
  }
}
