/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BasePageContentsController as PackagePageContentsController } from '@workspace/api-server/modules/page-contents';
import { PageContentsService } from './page-contents.service';

export class PageContentsController extends PackagePageContentsController {
  constructor(
    @Inject(PageContentsService) pageContentsService: PageContentsService,
  ) {
    super(pageContentsService);
  }
}
