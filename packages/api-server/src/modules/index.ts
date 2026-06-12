/**
 * Modules barrel export.
 *
 * Re-exports tất cả module implementations trong `@workspace/api-server`.
 * Mỗi module cung cấp:
 *   - `Base{Entity}sService` - abstract CRUD service (extend `BaseCrudService`)
 *   - `Base{Entity}sController` - HTTP controller (extend `BaseCrudController`)
 *   - `Base{Entity}sModule` - NestJS module (re-export + forRoot helper)
 *
 * Pattern này bám sát cấu trúc của `apps/main/api/src/<entity>/` - mỗi
 * entity có folder riêng với `<entity>.service.ts`, `<entity>.controller.ts`,
 * `<entity>.module.ts`. Subclass trong app chỉ cần implement các abstract
 * methods (`getEntity`, `getEntityName`, ...) để integrate với entity cụ thể.
 */

// Rich modules (hand-written với logic riêng)
export * from './users';
export * from './posts';
export * from './comments';
export * from './categories';

// CRUD scaffolds (auto-generated, mỗi entity có thể extend BaseCrudService)
export * from './academic-years';
export * from './accounts';
export * from './admission-results';
export * from './auth';
export * from './cameras';
export * from './contact-requests';
export * from './courses';
export * from './customer-carts';
export * from './departments';
export * from './events';
export * from './event-checkins';
export * from './event-checkouts';
export * from './event-registrations';
export * from './event-speakers';
export * from './face-data';
export * from './groups';
export * from './group-members';
export * from './imported-users';
export * from './locations';
export * from './majors';
export * from './messages';
export * from './message-reads';
export * from './notifications';
export * from './orders';
export * from './page-contents';
export * from './public';
export * from './parent-students';
export * from './post-categories';
export * from './post-tags';
export * from './products';
export * from './promo-codes';
export * from './roles';
export * from './screens';
export * from './seo-metas';
export * from './sessions';
export * from './settings';
export * from './speakers';
export * from './storage-files';
export * from './students';
export * from './tags';
export * from './templates';
export * from './training-levels';
export * from './training-systems';
export * from './uploads';
export * from './user-roles';
export * from './verification-tokens';
