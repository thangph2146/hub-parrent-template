/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './mikro-orm/mikro-orm.module';
import { PermissionsGuard } from './common';
import { AuthService } from './auth/auth.service';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SessionsModule } from './sessions/sessions.module';
import { UploadsModule } from './uploads/uploads.module';
import { ContactRequestsModule } from './contact-requests/contact-requests.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { PostsModule } from './posts/posts.module';
import { RolesModule } from './roles/roles.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { ProxyImageModule } from './proxy-image/proxy-image.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { SystemModule } from './system/system.module';
import { ParentStudentsModule } from './parent-students/parent-students.module';
import { TemplatesModule } from './templates/templates.module';
import { SeoMetasModule } from './seo-metas/seo-metas.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    SocketModule,
    AuthModule,
    NotificationsModule,
    SessionsModule,
    UploadsModule,
    ContactRequestsModule,
    CategoriesModule,
    TagsModule,
    PostsModule,
    RolesModule,
    StudentsModule,
    UsersModule,
    ProxyImageModule,
    DashboardModule,
    SettingsModule,
    SystemModule,
    ParentStudentsModule,
    TemplatesModule,
    SeoMetasModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, authService: AuthService) =>
        new PermissionsGuard(reflector, authService),
      inject: [Reflector, AuthService],
    },
  ],
})
export class AppModule {}
