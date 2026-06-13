/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseCategoriesController as PackageCategoriesController } from '@workspace/api-server/modules/categories';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller(ADMIN_ROUTES.CATEGORIES)
@Permissions(PERMISSIONS.CATEGORIES_VIEW)
export class CategoriesController extends PackageCategoriesController {
  constructor(@Inject(CategoriesService) categoriesService: CategoriesService) {
    super(categoriesService);
  }
}
