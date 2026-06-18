/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseSeoMetasController } from '../common/module-bases/seo-metas/seo-meta.controller';
import { SeoMetasService } from './seo-metas.service';

@Permissions(PERMISSIONS.SEO_METAS_VIEW)
@Controller(ADMIN_ROUTES.SEO_METAS)
export class SeoMetasController extends BaseSeoMetasController {
  constructor(service: SeoMetasService) {
    super(service);
  }
}
