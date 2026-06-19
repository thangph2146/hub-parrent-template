/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { AdmissionResultsService } from './admission-results.service';
import { AdmissionResultsController } from './admission-results.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [AdmissionResultsController],
  providers: [AdmissionResultsService],
  exports: [AdmissionResultsService],
})
export class AdmissionResultsModule {}
