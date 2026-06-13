/**
 * Events module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseEventsService,
  BaseEventsService as BaseEventsAdminService,
} from './events.service';
export {
  BaseEventsController,
  BaseEventsController as BaseEventsAdminController,
} from './events.controller';
export type { IEventsControllerService } from './events.controller';
/** @deprecated Dùng `IEventsControllerService`. */
export type { IEventsControllerService as IEventsAdminControllerService } from './events.controller';
export type {
  EventRowDto,
  ListEventsParams,
  ListEventsResult,
} from './events.service';
export { BaseEventsModule } from './events.module';
