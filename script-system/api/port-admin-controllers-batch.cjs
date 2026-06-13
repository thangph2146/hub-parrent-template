/**
 * Port admin HTTP controllers hub-event → packages/api-server.
 * Usage: node script-system/api/port-admin-controllers-batch.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')

const NOTIFICATION_KIND = 'SYSTEM'

/** @type {Array<object>} */
const MODULES = [
  {
    folder: 'event-checkins',
    hubFile: 'event-checkins.controller.ts',
    pkgFile: 'event-checkins-admin.controller.ts',
    appClass: 'EventCheckinsController',
    pkgClass: 'BaseEventCheckinsAdminController',
    serviceProp: 'eventCheckinsService',
    serviceType: 'BaseEventCheckinsAdminService',
    serviceImport: './event-checkins-admin.service',
  },
  {
    folder: 'event-speakers',
    hubFile: 'event-speakers.controller.ts',
    pkgFile: 'event-speakers-admin.controller.ts',
    appClass: 'EventSpeakersController',
    pkgClass: 'BaseEventSpeakersAdminController',
    serviceProp: 'eventSpeakersService',
    serviceType: 'BaseEventSpeakersAdminService',
    serviceImport: './event-speakers-admin.service',
  },
  {
    folder: 'event-registrations',
    hubFile: 'event-registrations.controller.ts',
    pkgFile: 'event-registrations-admin.controller.ts',
    appClass: 'EventRegistrationsController',
    pkgClass: 'BaseEventRegistrationsAdminController',
    serviceProp: 'eventRegistrationsService',
    serviceType: 'BaseEventRegistrationsAdminService',
    serviceImport: './event-registrations-admin.service',
    extraTypes:
      "import type { ManualAttendanceAction } from './event-registration-attendance.types';\nimport type { BaseEventRegistrationAttendanceService } from './event-registration-attendance.service';\n",
    extraServices: [
      {
        prop: 'attendanceService',
        appClass: 'EventRegistrationAttendanceService',
        importFrom: './event-registration-attendance.service',
        typeName: 'BaseEventRegistrationAttendanceService',
      },
    ],
  },
  {
    folder: 'accounts',
    hubFile: 'accounts.controller.ts',
    pkgFile: 'accounts-admin.controller.ts',
    appClass: 'AccountsController',
    pkgClass: 'BaseAccountsAdminController',
    serviceProp: 'accountsService',
    serviceType: 'BaseAccountsAdminService',
    serviceImport: './accounts-admin.service',
    extraServices: [
      {
        prop: 'uploadsService',
        appClass: 'UploadsService',
        importFrom: '../uploads/uploads.service',
        typeName: 'BaseUploadsService',
        pick: 'saveFile',
      },
    ],
    extraTypes:
      "import type { UpdateAccountDto } from './accounts-admin.service';\nimport { apiServerAppConfig } from '../../config/app-config';\n",
  },
  {
    folder: 'comments',
    hubFile: 'comments.controller.ts',
    pkgFile: 'comments-admin.controller.ts',
    appClass: 'CommentsController',
    pkgClass: 'BaseCommentsAdminController',
    serviceProp: 'commentsService',
    serviceType: 'BaseCommentsAdminService',
    serviceImport: './comments-admin.service',
    stripNotifications: true,
    stripCheckPermission: true,
  },
  {
    folder: 'page-contents',
    hubFile: 'page-contents.controller.ts',
    pkgFile: 'page-contents-admin.controller.ts',
    appClass: 'PageContentsController',
    pkgClass: 'BasePageContentsAdminController',
    serviceProp: 'pageContentsService',
    serviceType: 'BasePageContentsAdminService',
    serviceImport: './page-contents-admin.service',
    stripNotifications: true,
    stripCheckPermission: true,
  },
  {
    folder: 'sessions',
    hubFile: 'sessions.controller.ts',
    pkgFile: 'sessions-admin.controller.ts',
    appClass: 'SessionsController',
    pkgClass: 'BaseSessionsAdminController',
    serviceProp: 'sessionsService',
    serviceType: 'BaseSessionsAdminService',
    serviceImport: './sessions-admin.service',
    extraServices: [
      {
        prop: 'notificationsService',
        appClass: 'NotificationsService',
        importFrom: '../notifications/notifications.service',
        typeName: 'BaseNotificationsAdminService',
        typeImport: '../notifications/notifications-admin.service',
        pick:
          'create | getSuperAdminUserIds | hasRecentLoginNotification | hasRecentWelcomeBackNotification',
      },
      {
        prop: 'socketGateway',
        appClass: 'SocketGateway',
        importFrom: '../socket/socket.gateway',
        typeName: 'ISessionsAdminSocketGateway',
        inlineType: true,
      },
    ],
    stripLogActivity: true,
  },
  {
    folder: 'posts',
    hubFile: 'posts.controller.ts',
    pkgFile: 'posts.controller.ts',
    appClass: 'PostsController',
    pkgClass: 'BasePostsController',
    serviceProp: 'postsService',
    serviceType: 'BasePostsService',
    serviceImport: './posts.service',
    stripNotifications: true,
  },
  {
    folder: 'notifications',
    hubFile: 'notifications.controller.ts',
    pkgFile: 'notifications-admin.controller.ts',
    appClass: 'NotificationsController',
    pkgClass: 'BaseNotificationsAdminController',
    serviceProp: 'notificationsService',
    serviceType: 'BaseNotificationsAdminService',
    serviceImport: './notifications-admin.service',
    resultTypes:
      'NotificationsListResult, UnreadCountsResult, AdminTableResult',
  },
]

const SESSIONS_GATEWAY_INTERFACE = `export interface ISessionsAdminSocketGateway {
  emitSessionUpsert(session: unknown, fromStatus: string, toStatus: string): void;
  emitSessionRevoked(sessionId: string): void;
  emitSessionRemove(sessionId: string, status: string): void;
  emitNotificationToUser(
    userId: number,
    payload: {
      id: number;
      kind: string;
      title: string;
      description: string | null;
      toUserId: string;
      timestamp: number;
      read: boolean;
      actionUrl?: string | null;
    },
  ): void;
}

`

function removeMethod(src, signature) {
  let idx = src.indexOf(signature)
  while (idx !== -1) {
    const lineStart = src.lastIndexOf('\n', idx)
    const braceStart = src.indexOf('{', idx)
    let depth = 0
    let end = braceStart
    for (let i = braceStart; i < src.length; i++) {
      if (src[i] === '{') depth++
      else if (src[i] === '}') {
        depth--
        if (depth === 0) {
          end = i + 1
          break
        }
      }
    }
    src = src.slice(0, lineStart + 1) + src.slice(end)
    idx = src.indexOf(signature)
  }
  return src
}

function finalCleanup(src, cfg) {
  src = src.replace(/\r\n/g, '\n')
  src = removeCheckPermissionBlocks(src)
  src = src.replace(
    /\n\s*if \(userId && result\.affected > 0\) \{[\s\S]*?\n\s*\}\n(?=\s*const \{ statusCode)/g,
    '\n',
  )
  src = src.replace(
    /\n\s*if \(userId && affected > 0\) \{[\s\S]*?\n\s*\}\n(?=\s*const \{ statusCode)/g,
    '\n',
  )
  src = src.replace(/, type BulkAction/g, '')
  if (/Permissions,[\s\S]*?from '\.\.\/\.\.\/common'/.test(src)) {
    src = src.replace(/import \{ Permissions \} from '\.\.\/\.\.\/common';\n/g, '')
  }
  src = src.replace(
    /(from '\.\.\/\.\.\/common';)\nimport \{ Permissions \} from '\.\.\/\.\.\/common';/g,
    '$1',
  )
  src = src.replace(/import \{ Permissions \} from '\.\.\/common\/permissions\.decorator';\n/g, '')
  src = src.replace(/import \{ toEntityId \} from '\.\.\/common\/entity-id';\n/g, '')
  src = src.replace(/import \{ \w+Service \} from '\.\/[^']+\.service';\n/g, '')
  src = src.replace(/import \{ NotificationsService \}[^\n]+\n/g, '')
  src = src.replace(/import \{ NotificationKind \}[^\n]+\n/g, '')
  src = src.replace(/import \{ SocketGateway \}[^\n]+\n/g, '')
  src = src.replace(/import \{ AuthService \}[^\n]+\n/g, '')
  src = src.replace(/import \{ appConfig \}[^\n]+\n/g, '')
  src = src.replace(/import type \{ UpdateAccountDto \} from '\.\/accounts\.service';\n/g, '')
  src = src.replace(/import \{ UploadsService \}[^\n]+\n/g, '')
  src = src.replace(
    /import \{\s*EventRegistrationAttendanceService,\s*type ManualAttendanceAction,\s*\}[^\n]+\n/g,
    '',
  )
  src = src.replace(/import type \{[\s\S]*?\} from '\.\/notifications\.service';\n/g, '')
  src = src.replace(
    /from '\.\/page-contents\.service'/g,
    "from './page-contents-admin.service'",
  )
  src = src.replace(/, RESOURCES, ACTIONS/g, '')
  src = src.replace(/, ACTIONS/g, '')
  src = src.replace(/, RESOURCES/g, '')
  src = src.replace(/,\s*AUTH_ROLE_NAMES/g, '')
  src = src.replace(/AUTH_ROLE_NAMES,\s*/g, '')

  if (cfg.folder === 'sessions') {
    if (!src.includes('ISessionsAdminSocketGateway')) {
      src = src.replace(
        /(\n@Permissions\(PERMISSIONS\.SESSIONS_VIEW\)\n@Controller\(ADMIN_ROUTES\.SESSIONS\))/,
        `\n${SESSIONS_GATEWAY_INTERFACE}$1`,
      )
    }
  }

  return src
}

function removeCheckPermissionBlocks(src) {
  return src.replace(
    /\n\s*const hasPermission = await this\.checkPermission\([\s\S]*?\n\s*if \(!hasPermission\) \{\n[\s\S]*?return res\.status\(statusCode\)\.json\(body\);\n\s*\}\n/g,
    '\n',
  )
}

function removeLogActivityUsage(src) {
  src = src.replace(
    /\n\s*if \([^)]+\) \{\s*\n\s*this\.logActivity\([\s\S]*?\n\s*\}\s*\n/g,
    '\n',
  )
  src = src.replace(/\n\s*this\.logActivity\([\s\S]*?\);\s*\n/g, '\n')
  return src
}

function stripAppOnlyBlocks(src, cfg) {
  src = src.replace(/import \{ toEntityId \} from '\.\.\/common\/entity-id';\n/g, '')
  src = src.replace(/import \{ AuthService \} from '\.\.\/auth\/auth\.service';\n/g, '')
  if (cfg.stripNotifications) {
    src = src.replace(
      /import \{ NotificationsService \} from '\.\.\/notifications\/notifications\.service';\n/g,
      '',
    )
    src = src.replace(/import \{ NotificationKind \} from '\.\.\/entities\/notification\.entity';\n/g, '')
    src = src.replace(/,\s*private readonly notificationsService: NotificationsService/g, '')
  }
  src = src.replace(/import \{ RESOURCES, ACTIONS, PERMISSIONS \}/g, 'import { PERMISSIONS }')
  src = src.replace(/,\s*private readonly authService: AuthService/g, '')
  src = removeMethod(src, 'private async checkPermission(')
  src = removeCheckPermissionBlocks(src)
  if (cfg.stripNotifications || cfg.stripLogActivity) {
    src = removeMethod(src, 'private logActivity(')
    src = removeLogActivityUsage(src)
  }
  src = src.replace(
    /if \(!\(await this\.checkPermission[\s\S]*?return res\.status\(statusCode\)\.json\(body\);\n    \}\n/g,
    '',
  )
  src = src.replace(/kind: NotificationKind\.SYSTEM/g, `kind: '${NOTIFICATION_KIND}'`)
  return src
}

function transformImports(src) {
  return src
    .replace(
      /import \{\s*createSuccessResponse,\s*createErrorResponse,\s*\} from '\.\.\/common\/api-response';/g,
      "import {\n  createSuccessResponse,\n  createErrorResponse,\n  Permissions,\n} from '../../common';",
    )
    .replace(/from '\.\.\/common\/api-response'/g, "from '../../common'")
    .replace(/from '\.\.\/config\/constants'/g, "from '../../config'")
    .replace(/from '\.\.\/config\/permissions'/g, "from '../../config'")
    .replace(/from '\.\.\/common\/permissions\.decorator'/g, "from '../../common'")
    .replace(/from '\.\.\/common\/parse-list-query'/g, "from '../../common'")
    .replace(/from '\.\.\/common\/bulk-actions'/g, "from '../../common'")
    .replace(/from '\.\.\/common\/parse-column-filters'/g, "from '../../common'")
    .replace(/from '\.\.\/config\/app\.config'/g, "from '../../config/app-config'")
    .replace(/appConfig\./g, 'apiServerAppConfig.')
}

function buildTypeImports(cfg) {
  const parts = [`import type { ${cfg.serviceType} } from '${cfg.serviceImport}';`]
  if (cfg.resultTypes) {
    parts[0] = `import type { ${cfg.serviceType}, ${cfg.resultTypes} } from '${cfg.serviceImport}';`
  }
  if (cfg.extraTypes) parts.push(cfg.extraTypes.trim())
  for (const extra of cfg.extraServices ?? []) {
    if (extra.extraTypes) parts.push(extra.extraTypes.trim())
    if (extra.inlineType) continue
    if (cfg.extraTypes?.includes(extra.typeName)) continue
    const from =
      extra.typeImport ??
      extra.importFrom.replace(
        /notifications\.service$/,
        'notifications-admin.service',
      )
    parts.push(`import type { ${extra.typeName} } from '${from}';`)
  }
  return `${[...new Set(parts)].join('\n')}\n`
}

function buildConstructor(cfg) {
  const params = [`protected readonly service: ${cfg.serviceType}`]
  for (const extra of cfg.extraServices ?? []) {
    if (extra.inlineType) {
      params.push(`protected readonly ${extra.prop}: ISessionsAdminSocketGateway`)
    } else if (extra.pick) {
      params.push(
        `protected readonly ${extra.prop}: Pick<${extra.typeName}, '${extra.pick.split(' | ').join("' | '")}'>`,
      )
    } else {
      params.push(`protected readonly ${extra.prop}: ${extra.typeName}`)
    }
  }
  return `constructor(\n    ${params.join(',\n    ')},\n  ) {}`
}

function portModule(cfg) {
  const hubPath = path.join(ROOT, 'apps/hub-event/api/src', cfg.folder, cfg.hubFile)
  if (!fs.existsSync(hubPath)) {
    console.warn(`[port] skip missing ${hubPath}`)
    return
  }

  let src = fs.readFileSync(hubPath, 'utf8')
  src = stripAppOnlyBlocks(src, cfg)
  src = transformImports(src)

  const serviceClass = cfg.appClass.replace(/Controller$/, 'Service')
  src = src.replace(new RegExp(`import \\{ ${serviceClass} \\} from '\\./[^']+';\\n`, 'g'), '')
  src = src.replace(
    new RegExp(`import type \\{[^}]+\\} from '\\./[^']+\\.service';\\n`, 'g'),
    '',
  )

  for (const extra of cfg.extraServices ?? []) {
    if (extra.inlineType) {
      src = src.replace(
        new RegExp(`import \\{ ${extra.appClass} \\} from '${extra.importFrom.replace(/\//g, '\\/')}';\\n`),
        '',
      )
    } else {
      src = src.replace(
        new RegExp(
          `import \\{ ${extra.appClass}[^}]*\\} from '${extra.importFrom.replace(/\//g, '\\/')}';\\n`,
        ),
        '',
      )
    }
  }

  src = src.replace(new RegExp(`export class ${cfg.appClass}`), `export class ${cfg.pkgClass}`)
  src = src.replace(new RegExp(`${cfg.appClass}\\.name`, 'g'), `${cfg.pkgClass}.name`)
  src = src.replace(/private readonly logger/g, 'protected readonly logger')

  src = src.replace(
    new RegExp(`private readonly ${cfg.serviceProp}: ${serviceClass}`, 'g'),
    'protected readonly service',
  )
  src = src.replace(new RegExp(`this\\.${cfg.serviceProp}\\.`, 'g'), 'this.service.')

  for (const extra of cfg.extraServices ?? []) {
    src = src.replace(
      new RegExp(`private readonly ${extra.prop}: ${extra.appClass}`, 'g'),
      `protected readonly ${extra.prop}`,
    )
  }

  src = src.replace(/constructor\([\s\S]*?\) \{\}/, buildConstructor(cfg))

  if (src.includes('toEntityId(') && !src.includes("from '../../common/entity-id'")) {
    src = src.replace(
      /^(import type \{ Response \} from 'express';)/m,
      `$1\nimport { toEntityId } from '../../common/entity-id';`,
    )
    if (!src.includes("from '../../common/entity-id'")) {
      src = src.replace(
        /^(import \{[\s\S]*?\} from '@nestjs\/common';)/m,
        `$1\nimport { toEntityId } from '../../common/entity-id';`,
      )
    }
  }

  const typeImports = buildTypeImports(cfg)
  src = src.replace(
    /^(import type \{ Response \} from 'express';)/m,
    `$1\n${typeImports}`,
  )
  if (!src.includes(`import type { ${cfg.serviceType}`)) {
    src = src.replace(
      /^(import \{[\s\S]*?\} from '@nestjs\/common';)/m,
      `$1\n${typeImports}`,
    )
  }

  src = finalCleanup(src, cfg)
  // Chuẩn hóa sau port — gọi normalize riêng: node script-system/api/normalize-admin-controllers.cjs

  if (!src.includes(`import type { ${cfg.serviceType}`)) {
    const typeImports = buildTypeImports(cfg)
    const responseImport = "import type { Response } from 'express';\n"
    if (src.includes("import type { Response } from 'express';")) {
      src = src.replace(
        /^(import type \{ Response \} from 'express';)/m,
        `$1\n${typeImports}`,
      )
    } else {
      src = src.replace(
        /^(import \{[\s\S]*?\} from '@nestjs\/common';)/m,
        `${responseImport}${typeImports}$1`,
      )
    }
  }
  if (!src.includes("from '../../common/entity-id'") && src.includes('toEntityId(')) {
    src = src.replace(
      /^(import type \{ Response \} from 'express';)/m,
      `$1\nimport { toEntityId } from '../../common/entity-id';`,
    )
  }

  const header = `/**\n * ${cfg.pkgClass} — HTTP admin dùng chung (@workspace/api-server).\n */\n`
  const outPath = path.join(
    ROOT,
    'packages/api-server/src/modules',
    cfg.folder,
    cfg.pkgFile,
  )
  fs.writeFileSync(outPath, header + src, 'utf8')
  console.log(`[port] wrote ${path.relative(ROOT, outPath)}`)
}

for (const mod of MODULES) {
  portModule(mod)
}

require('node:child_process').execSync(
  'node script-system/api/normalize-admin-controllers.cjs',
  { cwd: ROOT, stdio: 'inherit' },
)

console.log('[port] done')
