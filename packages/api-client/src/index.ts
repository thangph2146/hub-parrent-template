export * from "./types"
export type {
  ContactRequest,
  CreateContactRequestInput,
  UpdateContactRequestInput,
} from "./resources/contact-requests"
export type { ParentStudent, AddStudentInput } from "./resources/my-students"
export type {
  ParentStudent as ParentStudentAdmin,
  UpdateParentStudentInput,
} from "./resources/parent-students"
export { buildCategoriesFromProducts, fetchActivePublicProductsSample, fetchSuggestedPublicProducts } from "./storefront-catalog"
export {
  createStorefrontSdk,
  readStoreSyncSessionUserId,
  STORE_SYNC_SESSION_STORAGE_KEY,
  type CreateStorefrontSdkOptions,
} from "./storefront-sdk"
export {
  effectiveLineUnitPrice,
  unitSellingAndListPrice,
} from "./unit-pricing"
export {
  effectiveQuantityForCondition,
  matchesQuantityCondition,
} from "./quantity-conditions"
export {
  getProductUnits,
  productBaseStock,
  cartReservedBase,
  maxPurchasableUnitQty,
  unitStock,
  remainingUnitStock,
  clampSellQty,
  hasUnitWholesalePromo,
} from "./product-units"
export {
  resolveGiftRulesForUnit,
  parseGiftRulesFromFulfillmentNote,
  getLegacyGiftRuleForUnit,
  normalizeGiftRuleUnitType,
  isGiftLinkedToCatalogProduct,
  giftRuleCatalogProductId,
  giftRuleLegacyProductSku,
  catalogProductHref,
  isGiftProductBrowsable,
  collectGiftCatalogLookups,
  buildGiftCatalogHrefMap,
  type LegacyFulfillmentGiftRule,
  type GiftCatalogLookup,
} from "./gift-rules"
export {
  PERMISSION_CODES,
  STAFF_ADMIN_ROLE_CODES,
  hasPermission,
  canUserAccess,
  canAccessStaffAdmin,
  isSuperAdminRoleCode,
  type PermissionCode,
} from "./permissions"
export { ApiClient, ApiError } from "./client"
export {
  summarizeAuthUser,
  printDevApiCall,
  formatDevRequestBody,
  formatDevResponsePayload,
  buildDevLogResponseJson,
} from "@workspace/logger"
export type { ApiClientOptions, RequestOptions } from "./client"
export { UsersApi } from "./resources/users"
export {
  AccountsApi,
  type AccountProfile,
  type AccountRoleRef,
  type UpdateAccountInput,
  type ChangeAccountPasswordInput,
} from "./resources/accounts"
export { PostsApi } from "./resources/posts"
export { ProductsApi } from "./resources/products"
export { OrdersApi } from "./resources/orders"
export { PromoCodesApi } from "./resources/promo-codes"
export { CartsApi } from "./resources/carts"
export { CategoriesApi } from "./resources/categories"
export { TagsApi } from "./resources/tags"
export { GuidesApi } from "./resources/guides"
export { RbacApi } from "./resources/rbac"
export { ContactRequestsApi } from "./resources/contact-requests"
export { MyStudentsApi } from "./resources/my-students"
export { ParentStudentsApi } from "./resources/parent-students"
export { SystemApi } from "./resources/system"
export type {
  DatabaseSchemaResponse,
  SchemaColumn,
  SchemaRelation,
  SchemaTable,
} from "./resources/system"
export { SpeakersApi } from "./resources/speakers"
export { LocationsApi } from "./resources/locations"
export { TrainingLevelsApi } from "./resources/training-levels"
export { TrainingSystemsApi } from "./resources/training-systems"
export { MajorsApi } from "./resources/majors"
export { CoursesApi } from "./resources/courses"
export { AcademicYearsApi } from "./resources/academic-years"
export { EventsApi } from "./resources/events"
export { EventRegistrationsApi } from "./resources/event-registrations"
export { EventCheckinsApi } from "./resources/event-checkins"
export { EventCheckoutsApi } from "./resources/event-checkouts"
export { EventSpeakersApi } from "./resources/event-speakers"
export { FaceDataApi } from "./resources/face-data"
export { CamerasApi } from "./resources/cameras"
export { TemplatesApi } from "./resources/templates"
export { ScreensApi } from "./resources/screens"
export { DepartmentsApi } from "./resources/departments"
export { RolesApi } from "./resources/roles"
export { SettingsApi } from "./resources/settings"
export {
  AuthAdminApi,
  createAuthAdminApi,
  type AuthLoginPayload,
  type RegisterRequestPayload,
  type RegisterLeadPayload,
} from "./resources/auth-admin"
export {
  type DevLoginOption,
  type DevLoginOptionsQuery,
  type DevLoginRole,
} from "./types/dev-login"
export { fetchDevLoginOptions } from "./resources/dev-login"
export { SeoMetasApi } from "./resources/seo-metas"
export {
  DashboardApi,
  type DashboardStatsDto,
  type DashboardOverviewDto,
  type DashboardMonthlyItemDto,
  type DashboardCategoryItemDto,
  type DashboardTopPostDto,
} from "./resources/dashboard"
export {
  UploadsApi,
  type ImageItem,
  type FolderItem,
  type ListImagesData,
  type ImportArchiveResult,
  type UploadsBulkDeleteResult,
  type StorageTab,
  type StorageMediaKind,
  type StorageRealm,
  type CreateStorageFolderResult,
  type ReorganizeDateFoldersResult,
  type BulkMoveFilesResult,
} from "./resources/uploads"
export {
  PublicApi,
  createPublicApi,
  publicSsrRequestOptions,
  type PublicAuthPayload,
  type PublicContactRequestInput,
  type PublicContactRequestResult,
  type PublicPagedPayload,
  type PublicPaginationMeta,
} from "./resources/public"
export { StoreSyncSdk, createStoreSyncSdk, DEFAULT_API_URL } from "./sdk"
export {
  unwrapApiEnvelope,
  normalizePagedResult,
  type NormalizedPagedResult,
  getData,
  postData,
  putData,
  patchData,
  deleteData,
} from "./resources/_shared"
export {
  slugify,
  resolveStorageFolderSlugPath,
  formatDateTime,
  buildCategoryOptionTree,
  buildCategoryTree,
  type CategoryTreeNode,
  type PagedResult,
} from "./utils"
export {
  ADMIN_SOCKET_EVENTS,
  ADMIN_SOCKET_PATH,
  ADMIN_RESOURCE_QUERY_PREFIX,
  getSocketOriginFromApiBase,
  queryPrefixesForAdminResource,
  resolveRealtimeNotificationToast,
  shouldShowAdminRealtimeToast,
  shouldShowRealtimeSyncToast,
  markRealtimeToastShown,
  registerLocalAdminMutation,
  registerLocalMutationFromMeta,
  registerLocalMutationFromApiPath,
  buildMutationToastKey,
  buildRealtimeToastDedupeKey,
  socketNotificationToastMethod,
  type AdminCacheInvalidatePayload,
  type AdminStatusChangePayload,
  type AdminSocketEventName,
  type EventAttendanceSocketPayload,
  type ParentStudentReviewSocketPayload,
  type RealtimeToastMethod,
  type SocketAuthData,
  type SocketNotificationKind,
  type SocketNotificationPayload,
} from "./realtime"
