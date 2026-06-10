import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './mikro-orm/mikro-orm.module';
import { PermissionsGuard } from './common/permissions.guard';
import { PublicModule } from './public/public.module';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AccountsModule } from './accounts/accounts.module';
import { SessionsModule } from './sessions/sessions.module';
import { UploadsModule } from './uploads/uploads.module';
import { CommentsModule } from './comments/comments.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { PostsModule } from './posts/posts.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { ProxyImageModule } from './proxy-image/proxy-image.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PageContentsModule } from './page-contents/page-contents.module';
import { SettingsModule } from './settings/settings.module';
import { SystemModule } from './system/system.module';
import { LocationsModule } from './locations/locations.module';
import { SpeakersModule } from './speakers/speakers.module';
import { EventsModule } from './events/events.module';
import { CamerasModule } from './cameras/cameras.module';
import { TemplatesModule } from './templates/templates.module';
import { ScreensModule } from './screens/screens.module';
import { EventRegistrationsModule } from './event-registrations/event-registrations.module';
import { EventCheckinsModule } from './event-checkins/event-checkins.module';
import { EventCheckoutsModule } from './event-checkouts/event-checkouts.module';
import { FaceDataModule } from './face-data/face-data.module';
import { EventSpeakersModule } from './event-speakers/event-speakers.module';
import { SeoMetasModule } from './seo-metas/seo-metas.module';
import { HanetModule } from './hanet/hanet.module';

/**
 * Composition API check-in — subset của main.
 * Cập nhật thủ công; không ghi đè khi `pnpm sync:checkin`.
 * @see apps/hub-event/api/api.sync-profile.json
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    PublicModule,
    SocketModule,
    AuthModule,
    NotificationsModule,
    AccountsModule,
    SessionsModule,
    UploadsModule,
    CommentsModule,
    CategoriesModule,
    TagsModule,
    PostsModule,
    RolesModule,
    UsersModule,
    ProxyImageModule,
    DashboardModule,
    PageContentsModule,
    SettingsModule,
    SystemModule,
    LocationsModule,
    SpeakersModule,
    EventsModule,
    CamerasModule,
    TemplatesModule,
    ScreensModule,
    EventRegistrationsModule,
    EventCheckinsModule,
    EventCheckoutsModule,
    FaceDataModule,
    EventSpeakersModule,
    SeoMetasModule,
    HanetModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
