import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminRealtimeInterceptor } from '../common/admin/realtime/interceptor';
import { AdminRealtimeBroadcastService } from '../common/admin/realtime/broadcast.service';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [],
  providers: [
    SocketGateway,
    AdminRealtimeBroadcastService,
    AdminRealtimeInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminRealtimeInterceptor,
    },
  ],
  exports: [
    SocketGateway,
    AdminRealtimeBroadcastService,
    AdminRealtimeInterceptor,
  ],
})
export class SocketModule {}
