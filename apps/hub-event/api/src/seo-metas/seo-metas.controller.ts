/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseSeoMetasController as PackageSeoMetasController } from '@workspace/api-server/modules/seo-metas';
import { SeoMetasService } from './seo-metas.service';

@ApiTags('SeoMetas')
export class SeoMetasController extends PackageSeoMetasController {
  constructor(@Inject(SeoMetasService) seoMetasService: SeoMetasService) {
    super(seoMetasService);
  }
}
