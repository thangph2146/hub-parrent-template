/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BasePageContentsController } from '../common/module-bases/page-contents/page-contents.controller';
import { PageContentsService } from './page-contents.service';

@Permissions(PERMISSIONS.PAGE_CONTENTS_VIEW)
@Controller(ADMIN_ROUTES.PAGE_CONTENTS)
export class PageContentsController extends BasePageContentsController {
  constructor(pageContentsService: PageContentsService) {
    super(pageContentsService);
  }
}
