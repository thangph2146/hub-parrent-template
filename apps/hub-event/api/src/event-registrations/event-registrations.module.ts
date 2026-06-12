/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { EventRegistrationsService } from './event-registrations.service';
import { EventRegistrationsController } from './event-registrations.controller';
import { EventRegistrationAttendanceService } from './event-registration-attendance.service';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [SocketModule],
  controllers: [EventRegistrationsController],
  providers: [EventRegistrationsService, EventRegistrationAttendanceService],
  exports: [EventRegistrationsService, EventRegistrationAttendanceService],
})
export class EventRegistrationsModule {}
