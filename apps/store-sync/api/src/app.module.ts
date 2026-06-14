/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './mikro-orm/mikro-orm.module';
import { PermissionsGuard } from './common';
import { AuthService } from './auth/auth.service';
import { PublicModule } from './public/public.module';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AccountsModule } from './accounts/accounts.module';
import { SessionsModule } from './sessions/sessions.module';
import { UploadsModule } from './uploads/uploads.module';
import { CategoriesModule } from './categories/categories.module';
import { RolesModule } from './roles/roles.module';
import { AdmissionResultsModule } from './admission-results/admission-results.module';
import { UsersModule } from './users/users.module';
import { ProxyImageModule } from './proxy-image/proxy-image.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PageContentsModule } from './page-contents/page-contents.module';
import { SettingsModule } from './settings/settings.module';
import { SystemModule } from './system/system.module';
import { EventRegistrationsModule } from './event-registrations/event-registrations.module';
import { EventSpeakersModule } from './event-speakers/event-speakers.module';
import { SeoMetasModule } from './seo-metas/seo-metas.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { CartsModule } from './carts/carts.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PublicModule,
    SocketModule,
    AuthModule,
    NotificationsModule,
    AccountsModule,
    SessionsModule,
    UploadsModule,
    CategoriesModule,
    RolesModule,
    AdmissionResultsModule,
    UsersModule,
    ProxyImageModule,
    DashboardModule,
    PageContentsModule,
    SettingsModule,
    SystemModule,
    EventRegistrationsModule,
    EventSpeakersModule,
    SeoMetasModule,
    ProductsModule,
    OrdersModule,
    PromoCodesModule,
    CartsModule,
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
