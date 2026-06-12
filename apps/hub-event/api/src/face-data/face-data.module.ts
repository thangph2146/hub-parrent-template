/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { FaceDataService } from './face-data.service';
import { FaceDataController } from './face-data.controller';

@Module({
  controllers: [FaceDataController],
  providers: [FaceDataService],
  exports: [FaceDataService],
})
export class FaceDataModule {}
