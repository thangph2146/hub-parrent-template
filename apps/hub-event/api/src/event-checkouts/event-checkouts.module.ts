/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module } from '@nestjs/common';
import { EventCheckoutsController } from './event-checkouts.controller';
import { EventCheckoutsService } from './event-checkouts.service';

@Module({
  controllers: [EventCheckoutsController],
  providers: [EventCheckoutsService],
  exports: [EventCheckoutsService],
})
export class EventCheckoutsModule {}
