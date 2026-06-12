/**
 * Speakers Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseSpeakersController } from './speaker.controller';

@Module({})
export class BaseSpeakersModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseSpeakersController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseSpeakersController } from './speaker.controller';
export {
  BaseSpeakersService,
  type SpeakersRowDto,
  type SpeakersCreateData,
  type SpeakersUpdateData,
} from './speaker.service';
