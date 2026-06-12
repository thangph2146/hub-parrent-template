/**
 * Tags Module barrel export.
 */
export {
  BaseTagsService,
  BaseTagsController,
  BaseTagsModule,
} from './tags.module';

export type { ITagsControllerService } from './tag.controller';

export type {
  TagsRowDto,
  TagsCreateData,
  TagsUpdateData,
} from './tag.service';
