/**
 * Chuẩn hóa *-admin.controller.ts theo mẫu events-admin.controller.ts.
 * Usage: node script-system/api/normalize-admin-controllers.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')

/** @type {Array<{ file: string, interfaceName: string, serviceType: string, pick: string[] }>} */
const CONTROLLERS = [
  {
    file: 'event-checkins/event-checkins-admin.controller.ts',
    interfaceName: 'IEventCheckinsAdminControllerService',
    serviceType: 'BaseEventCheckinsAdminService',
    pick: [
      'list',
      'getById',
      'create',
      'update',
      'hardDelete',
      'softDelete',
      'restore',
      'bulk',
    ],
  },
  {
    file: 'event-speakers/event-speakers-admin.controller.ts',
    interfaceName: 'IEventSpeakersAdminControllerService',
    serviceType: 'BaseEventSpeakersAdminService',
    pick: ['list', 'getById', 'create', 'update', 'delete', 'bulk'],
  },
  {
    file: 'event-registrations/event-registrations-admin.controller.ts',
    interfaceName: 'IEventRegistrationsAdminControllerService',
    serviceType: 'BaseEventRegistrationsAdminService',
    pick: [
      'syncEventRegistrationCount',
      'list',
      'getById',
      'create',
      'update',
      'hardDelete',
      'softDelete',
      'restore',
      'bulk',
    ],
  },
  {
    file: 'accounts/accounts-admin.controller.ts',
    interfaceName: 'IAccountsAdminControllerService',
    serviceType: 'BaseAccountsAdminService',
    pick: ['getProfile', 'updateProfile'],
  },
  {
    file: 'comments/comments-admin.controller.ts',
    interfaceName: 'ICommentsAdminControllerService',
    serviceType: 'BaseCommentsAdminService',
    pick: [
      'list',
      'getOptions',
      'getById',
      'softDelete',
      'restore',
      'hardDelete',
      'approve',
      'unapprove',
      'bulk',
    ],
  },
  {
    file: 'page-contents/page-contents-admin.controller.ts',
    interfaceName: 'IPageContentsAdminControllerService',
    serviceType: 'BasePageContentsAdminService',
    pick: ['list', 'getById', 'create', 'update', 'delete', 'bulk'],
  },
  {
    file: 'posts/posts.controller.ts',
    interfaceName: 'IPostsControllerService',
    serviceType: 'BasePostsService',
    pick: [
      'list',
      'getOptions',
      'getDatesWithPosts',
      'getById',
      'create',
      'update',
      'bulkSetCategories',
      'bulkClearImages',
      'bulk',
      'hardDelete',
      'softDelete',
      'restore',
    ],
  },
  {
    file: 'sessions/sessions-admin.controller.ts',
    interfaceName: 'ISessionsAdminControllerService',
    serviceType: 'BaseSessionsAdminService',
    pick: [
      'list',
      'listAccountsWithSessionStatus',
      'create',
      'getOptions',
      'userHasSuperAdminRole',
      'revokeAllSessionsByUserId',
      'getById',
      'update',
      'softDelete',
      'bulk',
      'restore',
      'hardDelete',
    ],
  },
  {
    file: 'notifications/notifications-admin.controller.ts',
    interfaceName: 'INotificationsAdminControllerService',
    serviceType: 'BaseNotificationsAdminService',
    pick: [
      'listForAdminTable',
      'getColumnOptions',
      'list',
      'getUnreadCounts',
      'markRead',
      'deleteOne',
      'markAllAsRead',
      'bulkDelete',
      'bulkMarkReadUnread',
    ],
  },
]

function pickBlock(interfaceName, serviceType, methods) {
  const lines = methods.map((m) => `  | '${m}'`).join('\n')
  return `export type ${interfaceName} = Pick<\n  ${serviceType},\n${lines}\n>;\n\n`
}

function mergeImportBlocks(src) {
  src = src.replace(
    /import \{ PERMISSIONS \} from '\.\.\/\.\.\/config';\nimport \{ APP_HEADERS, ADMIN_ROUTES \} from '\.\.\/\.\.\/config';/g,
    "import { APP_HEADERS, ADMIN_ROUTES, PERMISSIONS } from '../../config';",
  )
  src = src.replace(
    /import \{ APP_HEADERS, ADMIN_ROUTES \} from '\.\.\/\.\.\/config';\nimport \{ PERMISSIONS \} from '\.\.\/\.\.\/config';/g,
    "import { APP_HEADERS, ADMIN_ROUTES, PERMISSIONS } from '../../config';",
  )
  src = src.replace(
    /import \{\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n\} from '\.\.\/\.\.\/common';\nimport \{ isBulkAction[^}]+\} from '\.\.\/\.\.\/common';\nimport \{ parseAdminListLimit \} from '\.\.\/\.\.\/common';/g,
    "import {\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n  isBulkAction,\n  parseAdminListLimit,\n} from '../../common';",
  )
  src = src.replace(
    /import \{\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n\} from '\.\.\/\.\.\/common';\nimport \{ isBulkAction \} from '\.\.\/\.\.\/common';\nimport \{ parseAdminListLimit \} from '\.\.\/\.\.\/common';/g,
    "import {\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n  isBulkAction,\n  parseAdminListLimit,\n} from '../../common';",
  )
  src = src.replace(
    /import \{\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n\} from '\.\.\/\.\.\/common';\nimport \{ parseAdminListLimit \} from '\.\.\/\.\.\/common';/g,
    "import {\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n  parseAdminListLimit,\n} from '../../common';",
  )
  src = src.replace(
    /import \{\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n\} from '\.\.\/\.\.\/common';\nimport \{ isBulkAction, parseColumnFiltersFromQuery \} from '\.\.\/\.\.\/common';/g,
    "import {\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n  isBulkAction,\n  parseColumnFiltersFromQuery,\n} from '../../common';",
  )
  src = src.replace(
    /import \{\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n\} from '\.\.\/\.\.\/common';\nimport \{ isBulkAction \} from '\.\.\/\.\.\/common';/g,
    "import {\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n  isBulkAction,\n} from '../../common';",
  )
  return src
}

function cleanHeader(src, title) {
  src = src.replace(/^\/\*\*[\s\S]*?\*\/\n\/\*\*[\s\S]*?\*\/\n/m, `/**\n * ${title}\n */\n`)
  return src
}

function stripVerboseNotificationLogging(src) {
  src = src.replace(/private logRequest\([\s\S]*?\n  \}\n\n/g, '')
  src = src.replace(/private logResponse\([\s\S]*?\n  \}\n\n/g, '')
  src = src.replace(/\n\s*this\.logRequest\([\s\S]*?\);\n/g, '\n')
  src = src.replace(/\n\s*this\.logResponse\([\s\S]*?\);\n/g, '\n')
  src = src.replace(
    /console\.error\('\[Notifications API\][^']+', error\);/g,
    'this.logger.error(error);',
  )
  return src
}

function normalize(cfg) {
  const abs = path.join(ROOT, 'packages/api-server/src/modules', cfg.file)
  if (!fs.existsSync(abs)) return
  let src = fs.readFileSync(abs, 'utf8')
  const classMatch = src.match(/export class (Base\w+AdminController)/)
  const title = classMatch
    ? `${classMatch[1]} — HTTP admin dùng chung (@workspace/api-server).`
    : 'Admin controller — HTTP admin dùng chung (@workspace/api-server).'

  src = cleanHeader(src, title)
  src = mergeImportBlocks(src)
  src = src.replace(/private getUserId\(/g, 'protected getUserId(')
  src = src.replace(/private unauthorized\(/g, 'protected unauthorized(')
  src = src.replace(
    new RegExp(`protected readonly service: ${cfg.serviceType}`),
    `protected readonly service: ${cfg.interfaceName}`,
  )

  const pick = pickBlock(cfg.interfaceName, cfg.serviceType, cfg.pick)
  if (!src.includes(`export type ${cfg.interfaceName}`)) {
    src = src.replace(
      /(@ApiTags|@Permissions|@Controller|export interface ISessionsAdminSocketGateway)/,
      `${pick}$1`,
    )
  }

  if (cfg.file.includes('notifications/')) {
    if (!src.includes('protected readonly logger')) {
      src = src.replace(
        /export class BaseNotificationsAdminController \{/,
        'export class BaseNotificationsAdminController {\n  protected readonly logger = new Logger(BaseNotificationsAdminController.name);\n',
      )
      src = src.replace(
        /^import \{\n  Controller,/m,
        "import {\n  Logger,\n  Controller,",
      )
    }
    src = stripVerboseNotificationLogging(src)
  }

  src = src.replace(/\n{3,}/g, '\n\n')
  fs.writeFileSync(abs, src, 'utf8')
  console.log(`[normalize] ${cfg.file}`)
}

for (const cfg of CONTROLLERS) {
  normalize(cfg)
}

console.log('[normalize] done')
