/**
 * Speakers Module barrel export.
 */
export {
  BaseSpeakersService,
  BaseSpeakersController,
  BaseSpeakersModule,
} from './speakers.module';

export type { ISpeakersControllerService } from './speaker.controller';

export type {
  SpeakersRowDto,
  SpeakersCreateData,
  SpeakersUpdateData,
} from './speaker.service';
