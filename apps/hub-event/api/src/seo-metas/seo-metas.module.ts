/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { SeoMetasService } from './seo-metas.service';
import { SeoMetasController } from './seo-metas.controller';

@Module({
  controllers: [SeoMetasController],
  providers: [SeoMetasService],
  exports: [SeoMetasService],
})
export class SeoMetasModule {}
