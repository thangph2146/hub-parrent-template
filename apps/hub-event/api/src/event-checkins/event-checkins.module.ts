/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { EventCheckinsService } from './event-checkins.service';
import { EventCheckinsController } from './event-checkins.controller';

@Module({
  controllers: [EventCheckinsController],
  providers: [EventCheckinsService],
  exports: [EventCheckinsService],
})
export class EventCheckinsModule {}
