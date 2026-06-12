/**
 * Registry module API scaffold — map api.app.config.json → @workspace/api-server.
 * Nguồn sự thật cho `generate-api-modules.cjs`.
 */
const GENERATED_BANNER = `/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.services */\n`

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
  const aliasLine = def.rowDtoAlias
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

  return `${GENERATED_BANNER}import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
${crudTypesImport}import {
  ${def.baseService},
  type ${def.rowDto},
} from '@workspace/api-server/modules/${def.apiModule}';
${adminCommonImport}
import { ${entityClass} } from '../entities/${def.entity.file}';
${columnFiltersImport}${aliasLine}
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
` : ''}${extraMethods}
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

function renderService(moduleId) {
  const def = getModuleDef(moduleId)
  if (def.kind === 'em-only') return renderEmOnlyService(def)
  return renderCrudService(def)
}

module.exports = {
  REGISTRY,
  getModuleDef,
  renderService,
  GENERATED_BANNER,
}
