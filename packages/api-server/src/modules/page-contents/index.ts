/**
 * PageContents module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BasePageContentsService,
  BasePageContentsService as BasePageContentsAdminService,
} from './page-contents.service';
export {
  BasePageContentsController,
  BasePageContentsController as BasePageContentsAdminController,
} from './page-contents.controller';
export type { IPageContentsControllerService } from './page-contents.controller';
/** @deprecated Dùng `IPageContentsControllerService`. */
export type { IPageContentsControllerService as IPageContentsAdminControllerService } from './page-contents.controller';
export type {
  PageContentCreateInput,
  PageContentUpdateInput,
} from './page-contents.service';
export { BasePageContentsModule } from './page-contents.module';
