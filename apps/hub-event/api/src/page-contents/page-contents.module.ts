/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { PageContentsService } from './page-contents.service';
import { PageContentsController } from './page-contents.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [NotificationsModule, AuthModule],
  controllers: [PageContentsController],
  providers: [PageContentsService],
  exports: [PageContentsService],
})
export class PageContentsModule {}
