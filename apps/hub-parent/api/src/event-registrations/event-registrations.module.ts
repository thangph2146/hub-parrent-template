import { Module } from '@nestjs/common';
import { SocketModule } from '../socket/socket.module';
import { EventRegistrationAttendanceService } from './event-registration-attendance.service';
import { EventRegistrationsController } from './event-registrations.controller';
import { EventRegistrationsService } from './event-registrations.service';

@Module({
  imports: [SocketModule],
  controllers: [EventRegistrationsController],
  providers: [EventRegistrationsService, EventRegistrationAttendanceService],
  exports: [EventRegistrationsService, EventRegistrationAttendanceService],
})
export class EventRegistrationsModule {}
