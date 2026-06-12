/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { EventCheckoutsService } from './event-checkouts.service';
import { EventCheckoutsController } from './event-checkouts.controller';

@Module({
  controllers: [EventCheckoutsController],
  providers: [EventCheckoutsService],
  exports: [EventCheckoutsService],
})
export class EventCheckoutsModule {}
