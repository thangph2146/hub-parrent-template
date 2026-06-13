/**
 * Sinh NestJS module mỏng (providers + controllers từ app generated).
 */
const GENERATED_BANNER = `/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */\n`

function renderApiModule(def) {
  const serviceFile = def.serviceFile.replace(/\.ts$/, '')
  const controllerFile = def.controllerFile?.replace(/\.ts$/, '')
  const hasController = Boolean(
    controllerFile && (def.controller || def.controllerTemplate || def.controllerNative),
  )
  const moduleImports = def.moduleImports ?? []
  const moduleImportLines = moduleImports
    .map((item) => `import { ${item.symbol} } from '${item.from}';`)
    .join('\n')
  const nestImports = moduleImports.some((item) => item.forwardRef)
    ? '{ Module, forwardRef }'
    : '{ Module }'
  const moduleImportEntries = moduleImports.map((item) =>
    item.forwardRef ? `forwardRef(() => ${item.symbol})` : item.symbol,
  )

  const importsBlock =
    moduleImportEntries.length > 0
      ? moduleImportEntries.length === 1
        ? `\n  imports: [${moduleImportEntries[0]}],\n`
        : `\n  imports: [\n    ${moduleImportEntries.join(',\n    ')},\n  ],\n`
      : '\n'

  const extraControllers = def.extraControllers ?? []
  const extraProviders = def.extraProviders ?? []
  const controllerClasses = [
    ...(hasController ? [def.controllerClass] : []),
    ...extraControllers.map((item) => item.class),
  ]
  const providerClasses = [def.serviceClass, ...extraProviders.map((item) => item.class)]
  const exportClasses =
    def.moduleExports?.length > 0 ? def.moduleExports : providerClasses
  const controllersLine =
    controllerClasses.length > 0
      ? `  controllers: [${controllerClasses.join(', ')}],\n`
      : ''
  const controllerImport = [
    hasController
      ? `import { ${def.controllerClass} } from './${controllerFile}';`
      : '',
    ...extraControllers.map(
      (item) =>
        `import { ${item.class} } from './${item.file.replace(/\.ts$/, '')}';`,
    ),
  ]
    .filter(Boolean)
    .join('\n')
  const controllerImportLine = controllerImport ? `${controllerImport}\n` : ''
  const extraProviderImports = extraProviders
    .map(
      (item) =>
        `import { ${item.class} } from './${item.file.replace(/\.ts$/, '')}';`,
    )
    .join('\n')
  const extraProviderImportLine = extraProviderImports
    ? `${extraProviderImports}\n`
    : ''

  return `${GENERATED_BANNER}import ${nestImports} from '@nestjs/common';
import { ${def.serviceClass} } from './${serviceFile}';
${controllerImportLine}${extraProviderImportLine}${moduleImportLines ? `${moduleImportLines}\n` : ''}
@Module({${importsBlock}${controllersLine}  providers: [${providerClasses.join(', ')}],
  exports: [${exportClasses.join(', ')}],
})
export class ${def.moduleClass ?? def.serviceClass.replace(/Service$/, 'Module')} {}
`
}

module.exports = { renderApiModule, GENERATED_BANNER }
