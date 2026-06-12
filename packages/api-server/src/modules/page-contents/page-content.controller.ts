/**
 * PageContents Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  PageContentsRowDto,
  PageContentsCreateData,
  PageContentsUpdateData,
} from './page-content.service';

export type IPageContentsControllerService = ICrudControllerService<
  PageContentsRowDto,
  PageContentsCreateData,
  PageContentsUpdateData
>;

@ApiTags('PageContents')
export class BasePageContentsController extends BaseCrudController<
  PageContentsRowDto,
  PageContentsCreateData,
  PageContentsUpdateData
> {
  constructor(service: IPageContentsControllerService) {
    super(service, 'page-contents');
  }
}
