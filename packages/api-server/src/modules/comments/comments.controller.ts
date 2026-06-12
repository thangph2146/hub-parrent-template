/**
 * Comments Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  CommentRowDto,
  CommentCreateData,
  CommentUpdateData,
} from './comments.service';

export type ICommentsControllerService = ICrudControllerService<
  CommentRowDto,
  CommentCreateData,
  CommentUpdateData
>;

@ApiTags('Comments')
export class BaseCommentsController extends BaseCrudController<
  CommentRowDto,
  CommentCreateData,
  CommentUpdateData
> {
  constructor(service: ICommentsControllerService) {
    super(service, 'comments');
  }
}
