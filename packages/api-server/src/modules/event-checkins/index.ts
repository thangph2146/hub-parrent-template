/**
 * EventCheckins module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseEventCheckinsService,
  BaseEventCheckinsService as BaseEventCheckinsAdminService,
} from './event-checkins.service';
export {
  BaseEventCheckinsController,
  BaseEventCheckinsController as BaseEventCheckinsAdminController,
} from './event-checkins.controller';
export type { IEventCheckinsControllerService } from './event-checkins.controller';
/** @deprecated Dùng `IEventCheckinsControllerService`. */
export type { IEventCheckinsControllerService as IEventCheckinsAdminControllerService } from './event-checkins.controller';
export type {
  EventCheckinRowDto,
  ListEventCheckinsParams,
  ListEventCheckinsResult,
} from './event-checkins.service';
export { BaseEventCheckinsModule } from './event-checkins.module';
