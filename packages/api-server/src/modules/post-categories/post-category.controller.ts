/**
 * PostCategories Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  PostCategoriesRowDto,
  PostCategoriesCreateData,
  PostCategoriesUpdateData,
} from './post-category.service';

export type IPostCategoriesControllerService = ICrudControllerService<
  PostCategoriesRowDto,
  PostCategoriesCreateData,
  PostCategoriesUpdateData
>;

@ApiTags('PostCategorys')
export class BasePostCategoriesController extends BaseCrudController<
  PostCategoriesRowDto,
  PostCategoriesCreateData,
  PostCategoriesUpdateData
> {
  constructor(service: IPostCategoriesControllerService) {
    super(service, 'postcategorys');
  }
}
