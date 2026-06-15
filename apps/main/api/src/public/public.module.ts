import { Module, forwardRef } from '@nestjs/common';
import { SocketModule } from '../socket/socket.module';
import { PublicController } from './public.controller';
import { PublicPostsService } from './public-posts.service';
import { PublicCategoriesService } from './public-categories.service';
import { PublicContactRequestsService } from './public-contact-requests.service';
import { PublicEventsService } from './public-events.service';
import { PublicEventCategoriesService } from './public-event-categories.service';
import { PublicAuthService } from './public-auth.service';

import { AdmissionResultsModule } from '../admission-results/admission-results.module';
import { PageContentsModule } from '../page-contents/page-contents.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { EventRegistrationsModule } from '../event-registrations/event-registrations.module';
import { EventSpeakersModule } from '../event-speakers/event-speakers.module';
import { PublicEventRegistrationService } from './public-event-registration.service';
import { SeoMetasModule } from '../seo-metas/seo-metas.module';
import { SettingsModule } from '../settings/settings.module';
import { HanetModule } from '../hanet/hanet.module';

@Module({
  imports: [
    forwardRef(() => SocketModule),
    AdmissionResultsModule,
    PageContentsModule,
    UsersModule,
    AuthModule,
    EventRegistrationsModule,
    EventSpeakersModule,
    SeoMetasModule,
    SettingsModule,
    HanetModule,
  ],
  controllers: [PublicController],
  providers: [
    PublicPostsService,
    PublicCategoriesService,
    PublicContactRequestsService,
    PublicEventsService,
    PublicEventCategoriesService,
    PublicAuthService,
    PublicEventRegistrationService,
  ],
})
export class PublicModule {}
