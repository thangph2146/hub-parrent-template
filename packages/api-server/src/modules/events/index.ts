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
