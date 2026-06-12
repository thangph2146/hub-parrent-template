/**
 * EventSpeakers Module barrel export.
 */
export {
  BaseEventSpeakersService,
  BaseEventSpeakersController,
  BaseEventSpeakersModule,
} from './event-speaker.module';

export type {
  EventSpeakersRowDto,
  EventSpeakersCreateData,
  EventSpeakersUpdateData,
} from './event-speaker.service';

export { BaseEventSpeakersAdminService } from './event-speakers-admin.service';
export type {
  EventSpeakerRowDto,
  ListEventSpeakersParams,
  ListEventSpeakersResult,
} from './event-speakers-admin.service';
