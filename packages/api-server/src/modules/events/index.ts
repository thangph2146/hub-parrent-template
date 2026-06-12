/**
 * Events Module barrel export.
 */
export {
  BaseEventsService,
  BaseEventsController,
  BaseEventsModule,
} from './events.module';

export type { IEventsControllerService } from './event.controller';

export type {
  EventsRowDto,
  EventsCreateData,
  EventsUpdateData,
} from './event.service';

export { BaseEventsAdminService } from './events-admin.service';
export type {
  EventRowDto,
  ListEventsParams,
  ListEventsResult,
} from './events-admin.service';
