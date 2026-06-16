/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Speakers Module.
 *
 * Bám sát pattern của `apps/main/api/src/speakers/speakers.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseSpeakersController } from './speaker.controller';

@Module({})
export class BaseSpeakersModule {
  /**
   * Configure module với metadata bổ sung.
   */
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
