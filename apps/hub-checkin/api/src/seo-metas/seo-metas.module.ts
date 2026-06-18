/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module } from '@nestjs/common';
import { SeoMetasController } from './seo-metas.controller';
import { SeoMetasService } from './seo-metas.service';

@Module({
  controllers: [SeoMetasController],
  providers: [SeoMetasService],
  exports: [SeoMetasService],
})
export class SeoMetasModule {}
