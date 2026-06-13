/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseTagsController as PackageTagsController } from '@workspace/api-server/modules/tags';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller(ADMIN_ROUTES.TAGS)
@Permissions(PERMISSIONS.TAGS_VIEW)
export class TagsController extends PackageTagsController {
  constructor(@Inject(TagsService) tagsService: TagsService) {
    super(tagsService);
  }
}
