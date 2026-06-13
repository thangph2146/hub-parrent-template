/**
 * Sinh controller mỏng extend Base*Controller từ @workspace/api-server.
 */
const {
  formatExtendControllerConstructor,
} = require('./format-generated-ts.cjs')

const GENERATED_BANNER = `/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */\n`

function permissionLines(def) {
  const c = def.controller
  const prefix = c?.permissionPrefix ?? def.packageController?.permissionPrefix
  if (!prefix) return ''
  return `@Permissions(PERMISSIONS.${prefix}_VIEW)\n`
}

function controllerDecorator(def) {
  const c = def.controller
  const routeKey = c?.adminRouteKey ?? def.packageController?.adminRouteKey
  if (!routeKey) return ''
  return `@Controller(ADMIN_ROUTES.${routeKey})\n`
}

function extraImports(def) {
  return (def.controllerExtend?.extraImports ?? []).join('\n')
}

function renderPackageExtendController(def) {
  const pkg = def.packageController
  if (!pkg?.className || !pkg?.module) {
    throw new Error(
      `[render-package-extend-controller] Thiếu packageController cho ${def.folder}`,
    )
  }

  const serviceProp = def.controllerExtend?.serviceProp ?? def.serviceClass.replace(/^./, (c) => c.toLowerCase())
  const serviceVar = def.controllerExtend?.serviceVar ?? serviceProp
  const importPath = `@workspace/api-server/modules/${pkg.module}`
  const skipControllerDecorator = pkg.skipControllerDecorator === true
  const needsPermissions =
    !skipControllerDecorator &&
    Boolean(
      def.controller?.permissionPrefix ?? def.packageController?.permissionPrefix,
    )
  const needsAdminRoutes =
    !skipControllerDecorator &&
    Boolean(def.controller?.adminRouteKey ?? def.packageController?.adminRouteKey)
  const needsApiTags =
    !skipControllerDecorator &&
    Boolean(def.controller?.apiTags ?? def.controllerClass)

  const decoratorBlock = skipControllerDecorator
    ? ''
    : `${needsApiTags ? `@ApiTags('${def.controller?.apiTags ?? def.controllerClass.replace(/Controller$/, '')}')\n` : ''}${controllerDecorator(def)}${permissionLines(def)}`

  const swaggerImport = needsApiTags ? "import { ApiTags } from '@nestjs/swagger';\n" : ''
  const constructorBlock = formatExtendControllerConstructor(
    def.serviceClass,
    serviceVar,
    def,
  )

  return `${GENERATED_BANNER}${swaggerImport}import { Inject } from '@nestjs/common';
import { ${pkg.className} as Package${def.controllerClass} } from '${importPath}';
${needsPermissions ? "import { Permissions } from '../common/permissions.decorator';\nimport { PERMISSIONS } from '../config/permissions';\n" : ''}${needsAdminRoutes ? "import { ADMIN_ROUTES } from '../config/constants';\nimport { Controller } from '@nestjs/common';\n" : ''}${extraImports(def) ? `${extraImports(def)}\n` : ''}import { ${def.serviceClass} } from './${def.serviceFile.replace(/\.ts$/, '')}';

${decoratorBlock}export class ${def.controllerClass} extends Package${def.controllerClass} {
${constructorBlock}
}
`
}

module.exports = { renderPackageExtendController, GENERATED_BANNER }
