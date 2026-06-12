/**
 * ContactRequests Module barrel export.
 */
export {
  BaseContactRequestsService,
  BaseContactRequestsController,
  BasePublicContactRequestsController,
  BaseContactRequestsModule,
} from './contact-request.module';

export type {
  ContactRequestsRowDto,
  ContactRequestsCreateData,
  ContactRequestsUpdateData,
} from './contact-request.service';

export type { IPublicContactRequestsControllerService } from './public-contact-requests.controller';
