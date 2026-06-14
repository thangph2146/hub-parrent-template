/**
 * Screens Module.
 *
 * Bám sát pattern của `apps/main/api/src/screens/screens.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseScreensController } from './screen.controller';

@Module({})
export class BaseScreensModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseScreensController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseScreensController } from './screen.controller';
export {
  BaseScreensService,
  type ScreensRowDto,
  type ScreensCreateData,
  type ScreensUpdateData,
} from './screen.service';
