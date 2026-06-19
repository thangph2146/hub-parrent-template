/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module } from '@nestjs/common';
import { TrainingSystemsController } from './training-systems.controller';
import { TrainingSystemsService } from './training-systems.service';

@Module({
  controllers: [TrainingSystemsController],
  providers: [TrainingSystemsService],
  exports: [TrainingSystemsService],
})
export class TrainingSystemsModule {}
