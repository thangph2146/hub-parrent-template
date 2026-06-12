/**
 * Registry module API scaffold — map api.app.config.json → @workspace/api-server.
 * Nguồn sự thật cho `generate-api-modules.cjs`.
 */
const GENERATED_BANNER = `/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */\n`

/** @type {Record<string, object>} */
const REGISTRY = {
  templates: {
    folder: 'templates',
    serviceFile: 'templates.service.ts',
    serviceClass: 'TemplatesService',
    apiModule: 'templates',
    baseService: 'BaseTemplatesService',
    rowDto: 'TemplatesRowDto',
    rowDtoAlias: 'TemplateRowDto',
    entity: { class: 'Template', file: 'template.entity' },
    columnFilters: 'TEMPLATE_COLUMN_FILTERS',
    mapRow: 'template',
    kind: 'crud',
    controllerFile: 'templates.controller.ts',
    controllerClass: 'TemplatesController',
    controller: {
      apiTags: 'Templates',
      adminRouteKey: 'TEMPLATES',
      permissionPrefix: 'TEMPLATES',
      notFoundLabel: 'mẫu',
      bulkLabel: 'maus',
      createRequired: { field: 'name', message: 'name là bắt buộc' },
    },
  },
  'event-checkouts': {
    folder: 'event-checkouts',
    serviceFile: 'event-checkouts.service.ts',
    serviceClass: 'EventCheckoutsService',
    apiModule: 'event-checkouts',
    baseService: 'BaseEventCheckoutsService',
    kind: 'em-only',
    reExportTypes: [
      'BulkClearCheckoutsResult',
      'EventCheckoutRowDto',
      'ListEventCheckoutsParams',
      'ListEventCheckoutsResult',
    ],
    controllerNative: true,
    controllerFile: 'event-checkouts.controller.ts',
    controllerClass: 'EventCheckoutsController',
    controllerTemplate: 'event-checkouts',
  },
  locations: {
    folder: 'locations',
    serviceFile: 'locations.service.ts',
    serviceClass: 'LocationsService',
    apiModule: 'locations',
    baseService: 'BaseLocationsService',
    rowDto: 'LocationsRowDto',
    rowDtoAlias: 'LocationRowDto',
    entity: { class: 'Location', file: 'location.entity' },
    columnFilters: 'LOCATION_COLUMN_FILTERS',
    mapRow: 'location',
    kind: 'crud',
    controllerFile: 'locations.controller.ts',
    controllerClass: 'LocationsController',
    controller: {
      apiTags: 'Locations',
      adminRouteKey: 'LOCATIONS',
      permissionPrefix: 'LOCATIONS',
      notFoundLabel: 'địa điểm',
      idCoercion: 'number',
      createRequired: { field: 'name', message: 'name là bắt buộc' },
    },
  },
  speakers: {
    folder: 'speakers',
    serviceFile: 'speakers.service.ts',
    serviceClass: 'SpeakersService',
    apiModule: 'speakers',
    baseService: 'BaseSpeakersService',
    rowDto: 'SpeakersRowDto',
    rowDtoAlias: 'SpeakerRowDto',
    entity: { class: 'Speaker', file: 'speaker.entity' },
    columnFilters: 'SPEAKER_COLUMN_FILTERS',
    mapRow: 'speaker',
    kind: 'crud',
    moduleClass: 'SpeakersModule',
    controllerFile: 'speakers.controller.ts',
    controllerClass: 'SpeakersController',
    controller: {
      apiTags: 'Speakers',
      adminRouteKey: 'SPEAKERS',
      permissionPrefix: 'SPEAKERS',
      notFoundLabel: 'diễn giả',
      idCoercion: 'number',
      createRequired: { field: 'name', message: 'name là bắt buộc' },
    },
  },
  categories: {
    folder: 'categories',
    serviceFile: 'categories.service.ts',
    serviceClass: 'CategoriesService',
    apiModule: 'categories',
    baseService: 'BaseCategoriesService',
    rowDto: 'CategoryRowDto',
    entity: { class: 'Category', file: 'category.entity' },
    columnFilters: 'CATEGORY_COLUMN_FILTERS',
    mapRow: 'category',
    populate: ['parent'],
    optionsConfig: 'category',
    kind: 'crud',
    moduleClass: 'CategoriesModule',
    moduleImports: [
      { symbol: 'NotificationsModule', from: '../notifications/notifications.module' },
    ],
    controllerFile: 'categories.controller.ts',
    controllerClass: 'CategoriesController',
    controller: {
      apiTags: 'Categories',
      adminRouteKey: 'CATEGORIES',
      permissionPrefix: 'CATEGORIES',
      notFoundLabel: 'danh mục',
      bulkLabel: 'danh muc',
      hasOptions: true,
      optionsDefaultColumn: 'name',
      createRequired: { field: 'name', message: 'name là bắt buộc' },
      createBodyType: 'CategoryCreateData',
      updateBodyType: 'CategoryUpdateData',
    },
  },
  tags: {
    folder: 'tags',
    serviceFile: 'tags.service.ts',
    serviceClass: 'TagsService',
    apiModule: 'tags',
    baseService: 'BaseTagsService',
    rowDto: 'TagsRowDto',
    rowDtoAlias: 'TagRowDto',
    entity: { class: 'Tag', file: 'tag.entity' },
    mapRow: 'tag',
    optionsConfig: 'tag',
    kind: 'crud',
    moduleClass: 'TagsModule',
    moduleImports: [
      { symbol: 'NotificationsModule', from: '../notifications/notifications.module' },
    ],
    extraMethods: `
  protected getSearchFields(): string[] {
    return ['name', 'slug'];
  }
  protected getFilterableFields(): string[] {
    return ['isActive'];
  }`,
    controllerFile: 'tags.controller.ts',
    controllerClass: 'TagsController',
    controller: {
      apiTags: 'Tags',
      adminRouteKey: 'TAGS',
      permissionPrefix: 'TAGS',
      notFoundLabel: 'thẻ',
      bulkLabel: 'the',
      hasOptions: true,
      optionsDefaultColumn: 'name',
      createRequired: { field: 'name', message: 'name là bắt buộc' },
    },
  },
  roles: {
    folder: 'roles',
    serviceFile: 'roles.service.ts',
    serviceClass: 'RolesService',
    apiModule: 'roles',
    baseService: 'BaseRolesService',
    rowDto: 'RolesRowDto',
    rowDtoAlias: 'RoleRowDto',
    entity: { class: 'Role', file: 'role.entity' },
    mapRow: 'role',
    optionsConfig: 'role',
    kind: 'crud',
    moduleClass: 'RolesModule',
    moduleImports: [
      { symbol: 'NotificationsModule', from: '../notifications/notifications.module' },
      { symbol: 'SocketModule', from: '../socket/socket.module' },
    ],
    extraMethods: `
  protected getSearchFields(): string[] {
    return ['name', 'displayName', 'description'];
  }`,
    controllerFile: 'roles.controller.ts',
    controllerClass: 'RolesController',
    controller: {
      apiTags: 'Roles',
      adminRouteKey: 'ROLES',
      permissionPrefix: 'ROLES',
      notFoundLabel: 'vai trò',
      bulkLabel: 'vai tro',
      hasOptions: true,
      optionsDefaultColumn: 'name',
      createRequired: { field: 'name', message: 'name là bắt buộc' },
    },
  },
  'seo-metas': {
    folder: 'seo-metas',
    serviceFile: 'seo-metas.service.ts',
    serviceClass: 'SeoMetasService',
    apiModule: 'seo-metas',
    baseService: 'BaseSeoMetasService',
    rowDto: 'SeoMetasRowDto',
    rowDtoAlias: 'SeoMetaRowDto',
    entity: { class: 'SeoMeta', file: 'seo-meta.entity' },
    columnFilters: 'SEO_META_COLUMN_FILTERS',
    mapRow: 'seo-meta',
    kind: 'crud',
    controllerNative: true,
    controllerFile: 'seo-metas.controller.ts',
    controllerClass: 'SeoMetasController',
    controllerTemplate: 'seo-metas',
  },
  screens: {
    folder: 'screens',
    serviceFile: 'screens.service.ts',
    serviceClass: 'ScreensService',
    apiModule: 'screens',
    baseService: 'BaseScreensService',
    rowDto: 'ScreensRowDto',
    rowDtoAlias: 'ScreenRowDto',
    entity: { class: 'Screen', file: 'screen.entity' },
    columnFilters: 'SCREEN_COLUMN_FILTERS',
    mapRow: 'screen',
    populate: ['camera', 'template'],
    kind: 'crud',
    controllerFile: 'screens.controller.ts',
    controllerClass: 'ScreensController',
    controller: {
      apiTags: 'Screens',
      adminRouteKey: 'SCREENS',
      permissionPrefix: 'SCREENS',
      notFoundLabel: 'màn hình',
      createRequired: { field: 'name', message: 'name là bắt buộc' },
    },
  },
  cameras: {
    folder: 'cameras',
    serviceFile: 'cameras.service.ts',
    serviceClass: 'CamerasService',
    apiModule: 'cameras',
    baseService: 'BaseCamerasService',
    rowDto: 'CamerasRowDto',
    rowDtoAlias: 'CameraRowDto',
    entity: { class: 'Camera', file: 'camera.entity' },
    columnFilters: 'CAMERA_COLUMN_FILTERS',
    mapRow: 'camera',
    populate: ['linkedEvent'],
    kind: 'crud',
    controllerFile: 'cameras.controller.ts',
    controllerClass: 'CamerasController',
    controller: {
      apiTags: 'Cameras',
      adminRouteKey: 'CAMERAS',
      permissionPrefix: 'CAMERAS',
      notFoundLabel: 'camera',
      createRequired: { field: 'name', message: 'name là bắt buộc' },
    },
  },
  'event-speakers': {
    folder: 'event-speakers',
    serviceFile: 'event-speakers.service.ts',
    serviceClass: 'EventSpeakersService',
    apiModule: 'event-speakers',
    baseService: 'BaseEventSpeakersAdminService',
    entity: { class: 'EventSpeaker', file: 'event-speaker.entity' },
    kind: 'event-speakers-binding',
    moduleClass: 'EventSpeakersModule',
    controllerFile: 'event-speakers.controller.ts',
    controllerClass: 'EventSpeakersController',
    controllerNative: true,
    reExportTypes: [
      'EventSpeakerRowDto',
      'ListEventSpeakersParams',
      'ListEventSpeakersResult',
    ],
  },
  auth: {
    folder: 'auth',
    serviceFile: 'auth.service.ts',
    serviceClass: 'AuthService',
    apiModule: 'auth',
    baseService: 'BaseAuthService',
    kind: 'auth-binding',
    moduleClass: 'AuthModule',
    controllerFile: 'auth-admin.controller.ts',
    controllerClass: 'AuthAdminController',
    controllerNative: true,
    preserveNativeFiles: ['auth.service.spec.ts'],
    reExportTypes: ['AuthLoginPayload', 'GoogleProfileDto'],
  },
  system: {
    folder: 'system',
    serviceFile: 'system.service.ts',
    serviceClass: 'SystemService',
    apiModule: 'system',
    baseService: 'BaseSystemAdminService',
    kind: 'system-binding',
    moduleNative: true,
    moduleClass: 'SystemModule',
    controllerFile: 'system.controller.ts',
    controllerClass: 'SystemController',
    controllerNative: true,
    preserveNativeFiles: [
      'system.controller.ts',
      'system.module.ts',
    ],
  },
  public: {
    folder: 'public',
    kind: 'public-multi-binding',
    skipPrimaryService: true,
    moduleNative: true,
    moduleClass: 'PublicModule',
    controllerFile: 'public.controller.ts',
    controllerClass: 'PublicController',
    controllerNative: true,
    preserveNativeFiles: [
      'event-student-email.ts',
      'public.module.ts',
      'public.controller.ts',
    ],
  },
  events: {
    folder: 'events',
    serviceFile: 'events.service.ts',
    serviceClass: 'EventsService',
    apiModule: 'events',
    baseService: 'BaseEventsAdminService',
    kind: 'events-binding',
    moduleClass: 'EventsModule',
    controllerFile: 'events.controller.ts',
    controllerClass: 'EventsController',
    controllerNative: true,
    reExportTypes: ['EventRowDto', 'ListEventsParams', 'ListEventsResult'],
  },
  hanet: {
    folder: 'hanet',
    serviceFile: 'hanet-webhook.service.ts',
    serviceClass: 'HanetWebhookService',
    apiModule: 'hanet',
    baseService: 'BaseHanetWebhookService',
    kind: 'hanet-binding',
    moduleClass: 'HanetModule',
    moduleImports: [
      {
        symbol: 'EventRegistrationsModule',
        from: '../event-registrations/event-registrations.module',
      },
    ],
    controllerFile: 'hanet-webhook.controller.ts',
    controllerClass: 'HanetWebhookController',
    controllerNative: true,
    reExportTypes: [
      'HanetWebhookBody',
      'HanetCameraRole',
      'HanetResolveContext',
      'HanetWebhookResult',
    ],
  },
  notifications: {
    folder: 'notifications',
    serviceFile: 'notifications.service.ts',
    serviceClass: 'NotificationsService',
    apiModule: 'notifications',
    baseService: 'BaseNotificationsAdminService',
    kind: 'notifications-binding',
    moduleClass: 'NotificationsModule',
    moduleImports: [
      { symbol: 'SocketModule', from: '../socket/socket.module', forwardRef: true },
    ],
    controllerFile: 'notifications.controller.ts',
    controllerClass: 'NotificationsController',
    controllerNative: true,
    preserveNativeFiles: ['notifications.service.spec.ts'],
    reExportTypes: [
      'NotificationsListQuery',
      'NotificationItemDto',
      'NotificationsListResult',
      'UnreadCountsResult',
      'AdminTableRowDto',
      'AdminTableQuery',
      'AdminTableResult',
    ],
  },
  dashboard: {
    folder: 'dashboard',
    serviceFile: 'dashboard.service.ts',
    serviceClass: 'DashboardService',
    apiModule: 'dashboard',
    baseService: 'BaseDashboardService',
    kind: 'dashboard-binding',
    moduleClass: 'DashboardModule',
    controllerFile: 'dashboard.controller.ts',
    controllerClass: 'DashboardController',
    controllerNative: true,
    reExportTypes: [
      'DashboardStatsDto',
      'DashboardOverviewDto',
      'DashboardMonthlyItemDto',
      'DashboardCategoryItemDto',
      'DashboardTopPostDto',
    ],
    preserveNativeFiles: ['dashboard.service.spec.ts'],
  },
  'event-registrations': {
    folder: 'event-registrations',
    serviceFile: 'event-registrations.service.ts',
    serviceClass: 'EventRegistrationsService',
    apiModule: 'event-registrations',
    baseService: 'BaseEventRegistrationsAdminService',
    entity: { class: 'EventRegistration', file: 'event-registration.entity' },
    kind: 'event-registrations-binding',
    moduleClass: 'EventRegistrationsModule',
    moduleImports: [
      { symbol: 'SocketModule', from: '../socket/socket.module' },
    ],
    extraProviders: [
      {
        class: 'EventRegistrationAttendanceService',
        file: 'event-registration-attendance.service.ts',
        kind: 'event-registration-attendance-binding',
      },
    ],
    moduleExports: ['EventRegistrationsService', 'EventRegistrationAttendanceService'],
    controllerFile: 'event-registrations.controller.ts',
    controllerClass: 'EventRegistrationsController',
    controllerNative: true,
    reExportTypes: [
      'EventRegistrationRowDto',
      'ListEventRegistrationsParams',
      'ListEventRegistrationsResult',
      'PublicEventRegistrantDto',
    ],
  },
  'event-checkins': {
    folder: 'event-checkins',
    serviceFile: 'event-checkins.service.ts',
    serviceClass: 'EventCheckinsService',
    apiModule: 'event-checkins',
    baseService: 'BaseEventCheckinsAdminService',
    entity: { class: 'EventCheckin', file: 'event-checkin.entity' },
    kind: 'event-checkins-binding',
    moduleClass: 'EventCheckinsModule',
    controllerFile: 'event-checkins.controller.ts',
    controllerClass: 'EventCheckinsController',
    controllerNative: true,
    reExportTypes: [
      'EventCheckinRowDto',
      'ListEventCheckinsParams',
      'ListEventCheckinsResult',
    ],
  },
  uploads: {
    folder: 'uploads',
    serviceFile: 'uploads.service.ts',
    serviceClass: 'UploadsService',
    apiModule: 'uploads',
    baseService: 'BaseUploadsAdminService',
    entity: { class: 'StorageFile', file: 'storage-file.entity' },
    kind: 'uploads-binding',
    moduleClass: 'UploadsModule',
    controllerFile: 'uploads.controller.ts',
    controllerClass: 'UploadsController',
    controllerNative: true,
    extraControllers: [
      {
        class: 'PublicUploadsController',
        file: 'public-uploads.controller.ts',
      },
    ],
    reExportTypes: [
      'ImageItemDto',
      'FolderItemDto',
      'FolderNodeDto',
      'ListImagesResult',
      'ListFoldersResult',
      'BulkMoveFilesResult',
      'ReorganizeDateFoldersResult',
      'ImportArchiveResult',
      'ExportArchiveResult',
      'UploadsBulkDeleteResult',
    ],
    reExportValues: ['UPLOADS_BULK_DELETE_MAX_PATHS'],
  },
  'page-contents': {
    folder: 'page-contents',
    serviceFile: 'page-contents.service.ts',
    serviceClass: 'PageContentsService',
    apiModule: 'page-contents',
    baseService: 'BasePageContentsAdminService',
    entity: { class: 'PageContent', file: 'page-content.entity' },
    kind: 'page-contents-binding',
    moduleClass: 'PageContentsModule',
    moduleImports: [
      { symbol: 'NotificationsModule', from: '../notifications/notifications.module' },
      { symbol: 'AuthModule', from: '../auth/auth.module' },
    ],
    controllerFile: 'page-contents.controller.ts',
    controllerClass: 'PageContentsController',
    controllerNative: true,
    reExportTypes: ['PageContentCreateInput', 'PageContentUpdateInput'],
  },
  sessions: {
    folder: 'sessions',
    serviceFile: 'sessions.service.ts',
    serviceClass: 'SessionsService',
    apiModule: 'sessions',
    baseService: 'BaseSessionsAdminService',
    entity: { class: 'Session', file: 'session.entity' },
    kind: 'sessions-binding',
    moduleClass: 'SessionsModule',
    moduleImports: [
      { symbol: 'NotificationsModule', from: '../notifications/notifications.module' },
      { symbol: 'SocketModule', from: '../socket/socket.module', forwardRef: true },
    ],
    controllerFile: 'sessions.controller.ts',
    controllerClass: 'SessionsController',
    controllerNative: true,
    reExportTypes: [
      'SessionRowDto',
      'ListSessionsParams',
      'ListSessionsResult',
      'AccountWithSessionStatusDto',
      'ListAccountsWithSessionStatusParams',
      'ListAccountsWithSessionStatusResult',
    ],
  },
  accounts: {
    folder: 'accounts',
    serviceFile: 'accounts.service.ts',
    serviceClass: 'AccountsService',
    apiModule: 'accounts',
    baseService: 'BaseAccountsAdminService',
    entity: { class: 'User', file: 'user.entity' },
    kind: 'accounts-binding',
    moduleClass: 'AccountsModule',
    moduleImports: [
      { symbol: 'UploadsModule', from: '../uploads/uploads.module' },
    ],
    controllerFile: 'accounts.controller.ts',
    controllerClass: 'AccountsController',
    controllerNative: true,
    reExportTypes: ['AccountProfileDto', 'UpdateAccountDto', 'UpdateAccountResult'],
  },
  comments: {
    folder: 'comments',
    serviceFile: 'comments.service.ts',
    serviceClass: 'CommentsService',
    apiModule: 'comments',
    baseService: 'BaseCommentsAdminService',
    entity: { class: 'Comment', file: 'comment.entity' },
    kind: 'comments-binding',
    moduleClass: 'CommentsModule',
    moduleImports: [
      { symbol: 'NotificationsModule', from: '../notifications/notifications.module' },
    ],
    controllerFile: 'comments.controller.ts',
    controllerClass: 'CommentsController',
    controllerNative: true,
    reExportTypes: ['CommentRowDto', 'ListCommentsParams', 'ListCommentsResult'],
  },
  posts: {
    folder: 'posts',
    serviceFile: 'posts.service.ts',
    serviceClass: 'PostsService',
    apiModule: 'posts',
    baseService: 'BasePostsAdminService',
    baseServiceModule: 'posts-admin.service',
    entity: { class: 'Post', file: 'post.entity' },
    kind: 'posts-binding',
    moduleClass: 'PostsModule',
    moduleImports: [
      { symbol: 'NotificationsModule', from: '../notifications/notifications.module' },
    ],
    controllerFile: 'posts.controller.ts',
    controllerClass: 'PostsController',
    controllerNative: true,
    reExportTypes: [
      'PostRowDto',
      'PostDetailDto',
      'ListPostsParams',
      'ListPostsResult',
    ],
  },
  users: {
    folder: 'users',
    serviceFile: 'users.service.ts',
    serviceClass: 'UsersService',
    apiModule: 'users',
    baseService: 'BaseUsersService',
    entity: { class: 'User', file: 'user.entity' },
    kind: 'users-binding',
    moduleClass: 'UsersModule',
    moduleImports: [
      { symbol: 'NotificationsModule', from: '../notifications/notifications.module' },
      { symbol: 'SocketModule', from: '../socket/socket.module', forwardRef: true },
      { symbol: 'SessionsModule', from: '../sessions/sessions.module', forwardRef: true },
    ],
    controllerFile: 'users.controller.ts',
    controllerClass: 'UsersController',
    controllerNative: true,
  },
  settings: {
    folder: 'settings',
    serviceFile: 'settings.service.ts',
    serviceClass: 'SettingsService',
    apiModule: 'settings',
    baseService: 'BaseSettingsService',
    entity: { class: 'Setting', file: 'setting.entity' },
    kind: 'binding',
    moduleClass: 'SettingsModule',
    controllerFile: 'settings.controller.ts',
    controllerClass: 'SettingsController',
    controllerTemplate: 'settings',
  },
  'face-data': {
    folder: 'face-data',
    serviceFile: 'face-data.service.ts',
    serviceClass: 'FaceDataService',
    apiModule: 'face-data',
    baseService: 'BaseFaceDatasService',
    rowDto: 'FaceDatasRowDto',
    rowDtoAlias: 'FaceDataRowDto',
    entity: { class: 'FaceData', file: 'face-data.entity' },
    mapRow: 'face-data',
    populate: ['user'],
    needsCrudTypesImport: true,
    extraMethods: `
  protected buildWhere(params: ListCrudParams) {
    const filters = { ...(params.filters ?? {}) };
    const userId = filters.userId;
    if (userId) {
      delete filters.userId;
    }
    const where = super.buildWhere({ ...params, filters }) as Record<string, unknown>;
    if (userId) {
      where.user = userId;
    }
    return where;
  }`,
    kind: 'crud',
    controllerNative: true,
    controllerFile: 'face-data.controller.ts',
    controllerClass: 'FaceDataController',
    controllerTemplate: 'face-data',
  },
}

const MAP_ROW_BODIES = {
  template: (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      name: row.name,
      code: row.code ?? null,
      content: row.content ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  location: (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      name: row.name ?? null,
      address: row.address ?? null,
      mapUrl: row.mapUrl,
      status: row.status ?? null,
      isActive: (row.status ?? 0) !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  speaker: (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      name: row.name,
      title: row.title ?? null,
      organization: row.organization ?? null,
      bio: row.bio ?? null,
      avatar: row.avatar ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  'seo-meta': (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      page: row.page,
      title: row.title ?? null,
      description: row.description ?? null,
      keywords: row.keywords ?? null,
      ogTitle: row.ogTitle ?? null,
      ogDescription: row.ogDescription ?? null,
      ogImage: row.ogImage ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  screen: (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      name: row.name,
      code: row.code ?? null,
      cameraId: row.camera?.id ?? null,
      cameraName: row.camera?.name ?? null,
      templateId: row.template?.id ?? null,
      templateName: row.template?.name ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  'face-data': (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      userId: row.user?.id ?? null,
      imagePath: row.imagePath,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  category: (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      parentId: row.parent?.id ?? null,
      description: row.description ?? null,
      isActive: row.deletedAt == null,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  tag: (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon ?? null,
      isActive: row.deletedAt == null,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  role: (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      name: row.name,
      displayName: row.displayName,
      description: row.description ?? null,
      permissions: row.permissions,
      isActive: row.isActive,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
  camera: (entityClass, rowDto) => `  protected mapRow(entity: Record<string, unknown>): ${rowDto} {
    const row = entity as unknown as ${entityClass};
    return {
      id: row.id,
      name: row.name,
      code: row.code ?? null,
      linkedEventId: row.linkedEvent?.id ?? null,
      linkedEventTitle: row.linkedEvent?.title ?? null,
      linkedEventSlug: row.linkedEvent?.slug ?? null,
      ipAddress: row.ipAddress ?? null,
      port: row.port ?? null,
      username: row.username ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }`,
}

const OPTIONS_CONFIG_BODIES = {
  category: `const CATEGORY_OPTIONS_CONFIG: GetOptionsConfig = {
  id: { valueField: 'id', labelField: 'name', searchField: 'name' },
  slug: { valueField: 'slug', searchField: 'slug' },
  name: { valueField: 'name', searchField: 'name' },
  '*': { valueField: 'name', searchField: 'name' },
};`,
  tag: `const TAG_OPTIONS_CONFIG: GetOptionsConfig = {
  id: { valueField: 'id', labelField: 'name', searchField: 'name' },
  slug: { valueField: 'slug', searchField: 'slug' },
  name: { valueField: 'name', searchField: 'name' },
  '*': { valueField: 'name', searchField: 'name' },
};`,
  role: `const ROLE_OPTIONS_CONFIG: GetOptionsConfig = {
  name: { valueField: 'name', searchField: 'name' },
  displayName: { valueField: 'displayName', searchField: 'displayName' },
  '*': { valueField: 'name', searchField: 'name' },
};`,
}

function getOptionsConfigName(key) {
  return `${key.replace(/-/g, '_').toUpperCase()}_OPTIONS_CONFIG`
}

function getModuleDef(moduleId) {
  const def = REGISTRY[moduleId]
  if (!def) {
    throw new Error(`[api-module-registry] Module không có trong registry: ${moduleId}`)
  }
  return def
}

function renderCrudService(def) {
  const entityClass = def.entity.class
  const mapRowFn = MAP_ROW_BODIES[def.mapRow]
  if (!mapRowFn) {
    throw new Error(`[api-module-registry] Thiếu mapRow template: ${def.mapRow}`)
  }
  const aliasLine =
    def.rowDtoAlias && def.rowDtoAlias !== def.rowDto
      ? `\nexport type ${def.rowDtoAlias} = ${def.rowDto};\n`
      : ''

  const columnFiltersImport = def.columnFilters
    ? `import { ${def.columnFilters} } from '../common/admin-filter-configs';\n`
    : ''
  const adminCommonImport = def.columnFilters
    ? 'import { toIso, type AdminColumnFiltersConfig } from \'@workspace/api-server/common\';'
    : 'import { toIso } from \'@workspace/api-server/common\';'
  const crudTypesImport = def.needsCrudTypesImport
    ? 'import type { ListCrudParams } from \'@workspace/api-server/types/crud.types\';\n'
    : ''
  const columnFiltersMethod = def.columnFilters
    ? `
  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return ${def.columnFilters};
  }
`
    : ''
  const extraMethods = def.extraMethods ?? ''
  const optionsBody = def.optionsConfig ? OPTIONS_CONFIG_BODIES[def.optionsConfig] : ''
  const optionsConfigName = def.optionsConfig
    ? getOptionsConfigName(def.optionsConfig)
    : ''
  const optionsConfigConst = def.optionsConfig
    ? optionsBody.replace(
        /const [A-Z_]+_OPTIONS_CONFIG/,
        `const ${optionsConfigName}`,
      )
    : ''
  const getOptionsImport = def.optionsConfig
    ? `import { getOptionsFromModel, type GetOptionsConfig } from '../common/get-options';\n`
    : ''
  const getOptionsMethod = def.optionsConfig
    ? `
  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    return getOptionsFromModel(
      this.getEm().getRepository(${entityClass}),
      { deletedAt: null },
      column,
      ${optionsConfigName},
      search,
      limit,
    );
  }`
    : ''

  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
${crudTypesImport}import {
  ${def.baseService},
  type ${def.rowDto},
} from '@workspace/api-server/modules/${def.apiModule}';
${adminCommonImport}
${getOptionsImport}import { ${entityClass} } from '../entities/${def.entity.file}';
${columnFiltersImport}${optionsConfigConst ? `${optionsConfigConst}\n` : ''}${aliasLine}
@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return ${entityClass} as unknown as new () => Record<string, unknown>;
  }

${columnFiltersMethod}${def.populate?.length ? `
  protected getListPopulate(): string[] {
    return ${JSON.stringify(def.populate)};
  }
` : ''}${extraMethods}${getOptionsMethod}
${mapRowFn(entityClass, def.rowDto)}
}
`
}

function renderEmOnlyService(def) {
  const typeImports = def.reExportTypes.join(',\n  ')
  const typeExports = def.reExportTypes.map((t) => `  ${t},`).join('\n')

  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  ${def.baseService},
  type ${typeImports},
} from '@workspace/api-server/modules/${def.apiModule}';

export type {
${typeExports}
};

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }
}
`
}

function renderUsersBindingService(def) {
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseUsersService } from '@workspace/api-server/modules/users';
import {
  canEditProtectedAdminUser,
  isProtectedAdminEmail,
} from '../config/protected-admin';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';

export type {
  DevLoginOptionDto,
  DevLoginOptionsQuery,
} from '../common/dev-login-options';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity(): unknown {
    return User;
  }

  protected getRoleEntity(): unknown {
    return Role;
  }

  protected getUserRoleEntity(): unknown {
    return UserRole;
  }

  protected getSettingEntity(): unknown {
    return Setting;
  }

  protected canEditProtectedAdminUser(
    actorEmail: string,
    targetEmail: string,
  ): boolean {
    return canEditProtectedAdminUser(actorEmail, targetEmail);
  }

  protected isProtectedAdminEmail(email: string): boolean {
    return isProtectedAdminEmail(email);
  }
}
`
}

function renderEventSpeakersBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { EventSpeaker } from '../entities/event-speaker.entity';
import { Event } from '../entities/event.entity';
import { Speaker } from '../entities/speaker.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventSpeakerEntity(): new () => Record<string, unknown> {
    return EventSpeaker as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getSpeakerEntity(): new () => Record<string, unknown> {
    return Speaker as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderSystemBindingService(def) {
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { ormEntities } from '../mikro-orm/orm-entities';
import {
  runSuperadminBootstrap,
  ensureActingUserRoleAfterImport,
  ensureSeedUserRoleLinks,
} from '../seeds/superadmin-bootstrap.runner';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(em: EntityManager) {
    super(em, ormEntities, {
      runSuperadminBootstrap,
      ensureSeedUserRoleLinks,
      ensureActingUserRoleAfterImport,
    });
  }
}
`
}

function renderAuthBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';

export type { ${typeExports} } from '${baseImport}';
export type { AuthLoginPayload as AuthUserPayload } from '${baseImport}';

export type LoginDto = {
  email: string;
  password: string;
};

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getRoleEntity(): new () => Record<string, unknown> {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getSettingEntity(): new () => Record<string, unknown> {
    return Setting as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderEventsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { Event } from '../entities/event.entity';
import { Camera } from '../entities/camera.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getCameraEntity(): new () => Record<string, unknown> {
    return Camera as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderHanetBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { EventRegistrationAttendanceService } from '../event-registrations/event-registration-attendance.service';
import { Event } from '../entities/event.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { Camera } from '../entities/camera.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(
    private readonly em: EntityManager,
    private readonly attendanceService: EventRegistrationAttendanceService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }

  protected getCameraEntity(): new () => Record<string, unknown> {
    return Camera as unknown as new () => Record<string, unknown>;
  }

  protected async recordCheckin(input: {
    eventId: number;
    registration: Record<string, unknown>;
    at: Date;
    source: 'hanet';
    deviceId?: string | null;
    deviceName?: string | null;
  }) {
    const result = await this.attendanceService.recordCheckin({
      eventId: input.eventId,
      registration: input.registration as unknown as EventRegistration,
      at: input.at,
      source: input.source,
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    });
    return {
      email: result.email,
      fullName: result.fullName,
      registrationId: result.registrationId,
      at: result.at,
      duplicate: result.duplicate,
    };
  }

  protected async recordCheckout(input: {
    eventId: number;
    registration: Record<string, unknown>;
    at: Date;
    source: 'hanet';
  }) {
    const result = await this.attendanceService.recordCheckout({
      eventId: input.eventId,
      registration: input.registration as unknown as EventRegistration,
      at: input.at,
      source: input.source,
    });
    return {
      email: result.email,
      fullName: result.fullName,
      registrationId: result.registrationId,
      at: result.at,
      duplicate: result.duplicate,
    };
  }
}
`
}

function renderNotificationsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { SocketGateway } from '../socket/socket.gateway';
import {
  mapNotificationToPayload,
  type NotificationLike,
} from '../socket/notification-mapper';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Message } from '../entities/message.entity';
import { ContactRequest } from '../entities/contact-request.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(
    private readonly em: EntityManager,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getNotificationEntity(): new () => Record<string, unknown> {
    return Notification as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getMessageEntity(): new () => Record<string, unknown> {
    return Message as unknown as new () => Record<string, unknown>;
  }

  protected getContactRequestEntity(): new () => Record<string, unknown> {
    return ContactRequest as unknown as new () => Record<string, unknown>;
  }

  protected emitNotificationToUser(
    recipientUserId: number,
    notification: Record<string, unknown>,
  ): void {
    const payload = mapNotificationToPayload(
      notification as unknown as NotificationLike,
    );
    this.socketGateway.emitNotificationToUser(recipientUserId, payload);
  }
}
`
}

function renderDashboardBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { Category } from '../entities/category.entity';
import { Post } from '../entities/post.entity';
import { PostCategory } from '../entities/post-category.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }

  protected getPostEntity(): new () => Record<string, unknown> {
    return Post as unknown as new () => Record<string, unknown>;
  }

  protected getPostCategoryEntity(): new () => Record<string, unknown> {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderEventRegistrationAttendanceBindingService(def, parentDef) {
  const baseImport = `@workspace/api-server/modules/${parentDef.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEventRegistrationAttendanceService } from '${baseImport}';
import { Event } from '../entities/event.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { SocketGateway } from '../socket/socket.gateway';
import { EventRegistrationsService } from './event-registrations.service';

export type {
  AttendanceSource,
  ManualAttendanceAction,
  ApplyAttendanceResult,
} from '${baseImport}';

@Injectable()
export class EventRegistrationAttendanceService extends BaseEventRegistrationAttendanceService {
  constructor(
    em: EntityManager,
    socketGateway: SocketGateway,
    eventRegistrationsService: EventRegistrationsService,
  ) {
    super(em, {
      eventEntity: Event as unknown as new () => Record<string, unknown>,
      eventRegistrationEntity:
        EventRegistration as unknown as new () => Record<string, unknown>,
      getRegistrationById: (id) => eventRegistrationsService.getById(id),
      emitAttendance: (payload) => socketGateway.emitEventAttendance(payload),
    });
  }
}
`
}

function renderExtraProviderService(extra, parentDef) {
  if (extra.kind === 'event-registration-attendance-binding') {
    return renderEventRegistrationAttendanceBindingService(extra, parentDef)
  }
  return null
}

function renderEventRegistrationsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { EventRegistration } from '../entities/event-registration.entity';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderEventCheckinsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { EventCheckin } from '../entities/event-checkin.entity';
import { Event } from '../entities/event.entity';
import { EventRegistration } from '../entities/event-registration.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventCheckinEntity(): new () => Record<string, unknown> {
    return EventCheckin as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderUploadsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const valueExports = (def.reExportValues || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService}${valueExports ? `, ${valueExports}` : ''} } from '${baseImport}';
import { appConfig } from '../config/app.config';
import { StorageFile } from '../entities/storage-file.entity';
import { User } from '../entities/user.entity';

export type { ${typeExports} } from '${baseImport}';
${valueExports ? `export { ${valueExports} };\n` : ''}
@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getStorageFileEntity(): new () => Record<string, unknown> {
    return StorageFile as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getStorageRootDir(): string {
    return appConfig.storageDir;
  }
}
`
}

function renderPageContentsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  const entityClass = def.entity.class
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { ${entityClass} } from '../entities/${def.entity.file}';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getPageContentEntity(): new () => Record<string, unknown> {
    return ${entityClass} as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderSessionsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { AUTH_ROLE_NAMES } from '../config/constants';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getSessionEntity(): new () => Record<string, unknown> {
    return Session as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getRoleEntity(): new () => Record<string, unknown> {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getAuthRoleNames() {
    return {
      USER: AUTH_ROLE_NAMES.USER,
      ADMIN: AUTH_ROLE_NAMES.ADMIN,
      SUPER_ADMIN: AUTH_ROLE_NAMES.SUPER_ADMIN,
    };
  }
}
`
}

function renderAccountsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderCommentsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  const entityClass = def.entity.class
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '${baseImport}';
import { ${entityClass} } from '../entities/${def.entity.file}';

export type { ${typeExports} } from '${baseImport}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCommentEntity(): new () => Record<string, unknown> {
    return ${entityClass} as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderPostsBindingService(def) {
  const typeExports = (def.reExportTypes || []).join(', ')
  const baseImport = `@workspace/api-server/modules/${def.apiModule}`
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService}, POSTS_FILTER_CATEGORIES_NONE } from '${baseImport}';
import { Post } from '../entities/${def.entity.file}';
import { PostCategory } from '../entities/post-category.entity';
import { PostTag } from '../entities/post-tag.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';

export type { ${typeExports} } from '${baseImport}';
export { POSTS_FILTER_CATEGORIES_NONE };

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getPostEntity(): new () => Record<string, unknown> {
    return Post as unknown as new () => Record<string, unknown>;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }

  protected getTagEntity(): new () => Record<string, unknown> {
    return Tag as unknown as new () => Record<string, unknown>;
  }

  protected getPostCategoryEntity(): new () => Record<string, unknown> {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }

  protected getPostTagEntity(): new () => Record<string, unknown> {
    return PostTag as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderBindingService(def) {
  const entityClass = def.entity.class
  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${def.baseService} } from '@workspace/api-server/modules/${def.apiModule}';
import { ${entityClass} } from '../entities/${def.entity.file}';

@Injectable()
export class ${def.serviceClass} extends ${def.baseService} {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return ${entityClass} as unknown as new () => Record<string, unknown>;
  }
}
`
}

function renderPublicServiceBindings() {
  const baseImport = '@workspace/api-server/modules/public'
  return [
    {
      file: 'public-categories.service.ts',
      content: `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicCategoriesService } from '${baseImport}';
import { Category } from '../entities/category.entity';

@Injectable()
export class PublicCategoriesService extends BasePublicCategoriesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }
}
`,
    },
    {
      file: 'public-event-categories.service.ts',
      content: `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicEventCategoriesService } from '${baseImport}';
import { Category } from '../entities/category.entity';

@Injectable()
export class PublicEventCategoriesService extends BasePublicEventCategoriesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }
}
`,
    },
    {
      file: 'public-posts.service.ts',
      content: `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicPostsService } from '${baseImport}';
import { Post } from '../entities/post.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class PublicPostsService extends BasePublicPostsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getPostEntity(): new () => Record<string, unknown> {
    return Post as unknown as new () => Record<string, unknown>;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }

  protected getTagEntity(): new () => Record<string, unknown> {
    return Tag as unknown as new () => Record<string, unknown>;
  }

  protected getSettingEntity(): new () => Record<string, unknown> {
    return Setting as unknown as new () => Record<string, unknown>;
  }
}
`,
    },
    {
      file: 'public-events.service.ts',
      content: `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicEventsService } from '${baseImport}';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { EventRegistrationsService } from '../event-registrations/event-registrations.service';
import { EventSpeakersService } from '../event-speakers/event-speakers.service';

export type { EventTimeFilter } from '${baseImport}';

@Injectable()
export class PublicEventsService extends BasePublicEventsService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventRegistrationsService: EventRegistrationsService,
    private readonly eventSpeakersService: EventSpeakersService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationsService() {
    const svc = this.eventRegistrationsService;
    return {
      findActiveByEventAndEmail: async (eventId: string | number, email: string) => {
        const row = await svc.findActiveByEventAndEmail(eventId, email);
        if (!row) return null;
        return {
          id: row.id,
          email: row.email,
          fullName: row.fullName,
          status: row.status,
          registeredAt: row.registeredAt,
        };
      },
      syncEventRegistrationCount: (eventId: string | number) =>
        svc.syncEventRegistrationCount(eventId),
      listPublicForEvent: (eventId: string | number, limit: number) =>
        svc.listPublicForEvent(eventId, limit),
    };
  }

  protected getEventSpeakersService() {
    return this.eventSpeakersService;
  }
}
`,
    },
    {
      file: 'public-event-registration.service.ts',
      content: `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicEventRegistrationService } from '${baseImport}';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { EventRegistrationsService } from '../event-registrations/event-registrations.service';

export type {
  RegisterForEventResult,
  MyRegisteredEventItem,
} from '${baseImport}';

@Injectable()
export class PublicEventRegistrationService extends BasePublicEventRegistrationService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationsService() {
    return this.eventRegistrationsService;
  }
}
`,
    },
    {
      file: 'public-auth.service.ts',
      content: `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicAuthService } from '${baseImport}';
import { Role } from '../entities/role.entity';
import { Setting } from '../entities/setting.entity';
import { User } from '../entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

export type { CreatePublicRegisterDto } from '${baseImport}';

@Injectable()
export class PublicAuthService extends BasePublicAuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getRoleEntity(): new () => Record<string, unknown> {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getSettingEntity(): new () => Record<string, unknown> {
    return Setting as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUsersService() {
    return this.usersService;
  }

  protected getAuthService() {
    return this.authService;
  }
}
`,
    },
    {
      file: 'public-contact-requests.service.ts',
      content: `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicContactRequestsService } from '${baseImport}';
import { ContactRequest } from '../entities/contact-request.entity';
import { AdminRealtimeBroadcastService } from '../common/admin-realtime-broadcast.service';
import { ADMIN_ROUTES } from '../config/constants';

export type { CreateContactRequestDto } from '${baseImport}';

@Injectable()
export class PublicContactRequestsService extends BasePublicContactRequestsService {
  constructor(
    private readonly em: EntityManager,
    private readonly adminRealtime: AdminRealtimeBroadcastService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getContactRequestEntity(): new () => Record<string, unknown> {
    return ContactRequest as unknown as new () => Record<string, unknown>;
  }

  protected getAdminRealtime() {
    return this.adminRealtime;
  }

  protected getContactRequestAdminUrl(id: number): string {
    return \`\${ADMIN_ROUTES.CONTACT_REQUESTS}/\${id}\`;
  }
}
`,
    },
  ]
}

function renderService(moduleId) {
  const def = getModuleDef(moduleId)
  if (def.kind === 'public-multi-binding') return null
  if (def.kind === 'em-only') return renderEmOnlyService(def)
  if (def.kind === 'binding') return renderBindingService(def)
  if (def.kind === 'users-binding') return renderUsersBindingService(def)
  if (def.kind === 'auth-binding') return renderAuthBindingService(def)
  if (def.kind === 'system-binding') return renderSystemBindingService(def)
  if (def.kind === 'events-binding') return renderEventsBindingService(def)
  if (def.kind === 'hanet-binding') return renderHanetBindingService(def)
  if (def.kind === 'notifications-binding') return renderNotificationsBindingService(def)
  if (def.kind === 'dashboard-binding') return renderDashboardBindingService(def)
  if (def.kind === 'event-speakers-binding') return renderEventSpeakersBindingService(def)
  if (def.kind === 'event-registrations-binding') return renderEventRegistrationsBindingService(def)
  if (def.kind === 'event-checkins-binding') return renderEventCheckinsBindingService(def)
  if (def.kind === 'uploads-binding') return renderUploadsBindingService(def)
  if (def.kind === 'page-contents-binding') return renderPageContentsBindingService(def)
  if (def.kind === 'sessions-binding') return renderSessionsBindingService(def)
  if (def.kind === 'accounts-binding') return renderAccountsBindingService(def)
  if (def.kind === 'comments-binding') return renderCommentsBindingService(def)
  if (def.kind === 'posts-binding') return renderPostsBindingService(def)
  return renderCrudService(def)
}

module.exports = {
  REGISTRY,
  getModuleDef,
  renderService,
  renderExtraProviderService,
  renderPublicServiceBindings,
  GENERATED_BANNER,
}
