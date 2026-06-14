/**
 * Override binding tay cho module phức tạp (constructor / hook đặc biệt).
 * Stub TypeScript: deploy/config/overrides/*.ts
 */
const fs = require('node:fs')
const path = require('node:path')

const OVERRIDES_DIR = path.join(__dirname, 'overrides')

function readOverride(fileName) {
  return fs.readFileSync(path.join(OVERRIDES_DIR, fileName), 'utf8')
}

const MANUAL_PACKAGE_MODULE_OVERRIDES = {
  system: {
    skipOop: true,
    preserveController: true,
    controllerParams:
      'service: SystemService,\n    @Inject(forwardRef(() => AuthService)) authService?: AuthService',
    controllerSuperCall: 'super(service, authService);',
    controllerExtraImports: ["import { AuthService } from '../auth/auth.service';"],
  },
  notifications: {
    skipOop: true,
  },
  sessions: {
    entityHooks: [
      { method: 'getSessionEntity', entity: 'Session', importPath: '../entities/session.entity' },
      { method: 'getUserEntity', entity: 'User', importPath: '../entities/user.entity' },
      { method: 'getUserRoleEntity', entity: 'UserRole', importPath: '../entities/user-role.entity' },
      { method: 'getRoleEntity', entity: 'Role', importPath: '../entities/role.entity' },
    ],
    constHooks: [
      {
        method: 'getAuthRoleNames',
        returnExpr: 'AUTH_ROLE_NAMES',
        importName: 'AUTH_ROLE_NAMES',
        importPath: '../config/constants',
      },
    ],
    controllerParams:
      'service: SessionsService,\n    notificationsService: NotificationsService,\n    socketGateway: SocketGateway',
    controllerSuperCall: 'super(service, notificationsService, socketGateway);',
    controllerExtraImports: [
      "import { NotificationsService } from '../notifications/notifications.service';",
      "import { SocketGateway } from '../socket/socket.gateway';",
    ],
  },
  posts: {
    controllerParams: 'postsService: PostsService',
    controllerSuperCall: 'super(postsService);',
  },
  'event-registrations': {
    companionServices: {
      'event-registration-attendance.service.ts': readOverride(
        'event-registration-attendance.service.ts',
      ),
    },
    controllerParams:
      'eventRegistrationsService: EventRegistrationsService,\n    attendanceService: EventRegistrationAttendanceService',
    controllerSuperCall: 'super(eventRegistrationsService, attendanceService);',
    controllerExtraImports: [
      "import { EventRegistrationAttendanceService } from './event-registration-attendance.service';",
    ],
    useBaseControllerParams: true,
  },
  'contact-requests': {
    controllerParams: 'contactRequestsService: ContactRequestsService',
    controllerSuperCall: 'super(contactRequestsService);',
    useBaseControllerParams: true,
  },
  'page-contents': {
    controllerParams: 'pageContentsService: PageContentsService',
    controllerSuperCall: 'super(pageContentsService);',
    useBaseControllerParams: true,
  },
  orders: {
    skipOop: true,
    preserveController: true,
  },
  products: {
    skipOop: true,
    preserveController: true,
  },
  'promo-codes': {
    serviceExtensions: {
      methods: ['listPublicRules', 'findRedeemableByCode', 'incrementUsage'],
      includePreamble: true,
    },
  },
  settings: {
    skipOop: true,
  },
  'admission-results': {
    skipOop: true,
    serviceExtensions: {
      methods: ['lookup'],
      includePreamble: true,
    },
  },
  roles: {
    skipOop: true,
    serviceExtensions: {
      methods: ['resolveActorEmail', 'getOptions'],
      includePreamble: true,
    },
  },
  categories: {
    skipOop: true,
    serviceExtensions: {
      methods: ['getOptions', 'getUsage'],
      includePreamble: true,
    },
  },
  groups: {
    skipOop: true,
    serviceExtensions: {
      methods: [
        'create',
        'list',
        'findById',
        'addMembers',
        'removeMember',
        'updateMemberRole',
        'markRead',
        'getMessages',
      ],
      includePreamble: true,
    },
  },
  'parent-students': {
    skipOop: true,
    customController: readOverride('parent-students.controller.ts'),
    serviceExtensions: {
      methods: [
        'listByParent',
        'listPending',
        'listAll',
        'addStudentRequest',
        'review',
        'remove',
        'removeByAdmin',
      ],
      includePreamble: true,
    },
  },
  carts: {
    controllerFile: 'public-carts.controller.ts',
    controllerOutputFile: 'public-carts.controller.ts',
    controllerClass: 'PublicCartsController',
    baseControllerImport: '../common/module-bases/carts/carts.controller',
    controllerParams: 'cartsService: CartsService',
    controllerSuperCall: 'super(cartsService);',
  },
}

module.exports = { MANUAL_PACKAGE_MODULE_OVERRIDES }
