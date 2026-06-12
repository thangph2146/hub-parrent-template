/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { EventSpeakersService } from './event-speakers.service';
import { EventSpeakersController } from './event-speakers.controller';

@Module({
  controllers: [EventSpeakersController],
  providers: [EventSpeakersService],
  exports: [EventSpeakersService],
})
export class EventSpeakersModule {}
