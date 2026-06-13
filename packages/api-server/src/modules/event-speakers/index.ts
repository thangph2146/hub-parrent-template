/**
 * EventSpeakers module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseEventSpeakersService,
  BaseEventSpeakersService as BaseEventSpeakersAdminService,
} from './event-speakers.service';
export {
  BaseEventSpeakersController,
  BaseEventSpeakersController as BaseEventSpeakersAdminController,
} from './event-speakers.controller';
export type { IEventSpeakersControllerService } from './event-speakers.controller';
/** @deprecated Dùng `IEventSpeakersControllerService`. */
export type { IEventSpeakersControllerService as IEventSpeakersAdminControllerService } from './event-speakers.controller';
export type {
  EventSpeakerRowDto,
  ListEventSpeakersParams,
  ListEventSpeakersResult,
} from './event-speakers.service';
export { BaseEventSpeakersModule } from './event-speakers.module';
