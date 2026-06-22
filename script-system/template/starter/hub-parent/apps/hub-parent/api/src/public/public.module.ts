import { Module, forwardRef } from '@nestjs/common';
import { SocketModule } from '../socket/socket.module';
import { PublicController } from './public.controller';
import { PublicPostsService } from './public-posts.service';
import { PublicCategoriesService } from './public-categories.service';
import { PublicContactRequestsService } from './public-contact-requests.service';
import { PublicAuthService } from './public-auth.service';
import { PageContentsModule } from '../page-contents/page-contents.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { SeoMetasModule } from '../seo-metas/seo-metas.module';
import { SettingsModule } from '../settings/settings.module';

/** Hub Parent — public API không phụ thuộc events/admission/hanet. */
@Module({
  imports: [
    forwardRef(() => SocketModule),
    PageContentsModule,
    UsersModule,
    AuthModule,
    SeoMetasModule,
    SettingsModule,
  ],
  controllers: [PublicController],
  providers: [
    PublicPostsService,
    PublicCategoriesService,
    PublicContactRequestsService,
    PublicAuthService,
  ],
})
export class PublicModule {}
