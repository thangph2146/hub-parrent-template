/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BaseTagsController } from '../common/module-bases/tags/tag.controller';
import { TagsService } from './tags.service';

@Permissions(PERMISSIONS.TAGS_VIEW)
@Controller(ADMIN_ROUTES.TAGS)
export class TagsController extends BaseTagsController {
  constructor(service: TagsService) {
    super(service);
  }
}
