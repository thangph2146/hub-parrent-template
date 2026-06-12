/**
 * PageContents Module barrel export.
 */
export {
  BasePageContentsService,
  BasePageContentsController,
  BasePageContentsModule,
} from './page-content.module';

export type {
  PageContentsRowDto,
  PageContentsCreateData,
  PageContentsUpdateData,
} from './page-content.service';

export { BasePageContentsAdminService } from './page-contents-admin.service';
export type {
  PageContentCreateInput,
  PageContentUpdateInput,
} from './page-contents-admin.service';
