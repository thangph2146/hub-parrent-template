/**
 * Templates Module barrel export.
 */
export {
  BaseTemplatesService,
  BaseTemplatesController,
  BaseTemplatesModule,
} from './templates.module';

export type { ITemplatesControllerService } from './template.controller';

export type {
  TemplatesRowDto,
  TemplatesCreateData,
  TemplatesUpdateData,
} from './template.service';
