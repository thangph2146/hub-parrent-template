/**
 * Screens Module barrel export.
 */
export {
  BaseScreensService,
  BaseScreensController,
  BaseScreensModule,
} from './screens.module';

export type { IScreensControllerService } from './screen.controller';

export type {
  ScreensRowDto,
  ScreensCreateData,
  ScreensUpdateData,
} from './screen.service';
