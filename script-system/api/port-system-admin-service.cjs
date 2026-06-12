/**
 * Port apps/hub-event/api/src/system/system.service.ts →
 * packages/api-server/src/modules/system/system-admin.service.ts
 *
 * Usage: node script-system/api/port-system-admin-service.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')

const SOURCE = path.join(ROOT, 'apps/hub-event/api/src/system/system.service.ts')
const DEST = path.join(
  ROOT,
  'packages/api-server/src/modules/system/system-admin.service.ts',
)

const ENTITY_MODEL = {
  PostCategory: 'postCategory',
  PostTag: 'postTag',
  PageContent: 'pageContent',
  ContactRequest: 'contactRequest',
  UserRole: 'userRole',
  Category: 'category',
  Comment: 'comment',
  Notification: 'notification',
  Message: 'message',
  Student: 'student',
  Speaker: 'speaker',
  Setting: 'setting',
  Group: 'group',
  Event: 'event',
  Post: 'post',
  Role: 'role',
  User: 'user',
  Tag: 'tag',
}

function modelRef(modelKey) {
  return `this.modelEntity('${modelKey}')`
}

function replaceEntityRefs(body) {
  let out = body
  for (const [entity, modelKey] of Object.entries(ENTITY_MODEL)) {
    const ref = modelRef(modelKey)
    out = out.replaceAll(`new ${entity}()`, `this.createEntityInstance('${modelKey}')`)
    out = out.replaceAll(`${entity}.name`, `this.getEntityName(${ref})`)
    out = out.replaceAll(`leftEntity: ${entity},`, `leftEntity: ${ref},`)
    out = out.replaceAll(`rightEntity: ${entity},`, `rightEntity: ${ref},`)
    const emOps = [
      'find',
      'findOne',
      'insert',
      'nativeDelete',
      'nativeUpdate',
      'count',
    ]
    for (const op of emOps) {
      out = out.replaceAll(`em.${op}(${entity},`, `em.${op}(${ref},`)
      out = out.replaceAll(`this.em.${op}(${entity},`, `this.em.${op}(${ref},`)
    }
    out = out.replaceAll(`await em.find(\n            ${entity},`, `await em.find(\n            ${ref},`)
  }
  return out
}

function main() {
  let src = fs.readFileSync(SOURCE, 'utf8')

  src = src.replace(
    /import \{[\s\S]*?\} from '\.\.\/common\/entity-id';/,
    `import {
  coerceImportPrimaryKey,
  parseEntityId,
  relationEntityId,
  toEntityId,
  toEntityIdList,
} from '../../common';`,
  )

  src = src.replace(/import \{ Injectable, Logger \} from '@nestjs\/common';/, "import { Logger } from '@nestjs/common';")

  src = src.replace(
    /import \{ Category \}[\s\S]*?import type \{ SuperadminBootstrapResult \}[\s\S]*?from '\.\.\/seeds\/superadmin-bootstrap\.runner';/,
    `import type { SystemBootstrapDeps } from './system-bootstrap.deps';`,
  )

  src = src.replace(
    /const entityByModelName[\s\S]*?modelNameByEntityClass\[className\] = model;\n\}/,
    '',
  )

  src = src.replace(
    /@Injectable\(\)\nexport class SystemService \{/,
    `export class BaseSystemAdminService {
  protected readonly entityByModelName: Record<string, EntityName<any>>;
  protected readonly modelNameByEntityClass: Record<string, string>;

  protected modelEntity(modelKey: string): EntityName<any> {
    const entity = this.entityByModelName[modelKey];
    if (!entity) {
      throw new Error(\`Unknown export model "\${modelKey}"\`);
    }
    return entity;
  }

  protected createEntityInstance(modelKey: string): Record<string, unknown> {
    const Entity = this.modelEntity(modelKey);
    return new (Entity as new () => Record<string, unknown>)();
  }`,
  )

  src = src.replace(
    /constructor\(private readonly em: EntityManager\) \{\n    this\.modelOrder = this\.buildModelOrder\(\);\n  \}/,
    `constructor(
    protected readonly em: EntityManager,
    ormEntities: readonly EntityName<any>[],
    protected readonly bootstrap: SystemBootstrapDeps,
  ) {
    this.entityByModelName = buildEntityByModelName(ormEntities);
    this.modelNameByEntityClass = {};
    for (const [model, entity] of Object.entries(this.entityByModelName)) {
      const className =
        typeof entity === 'function'
          ? entity.name
          : String(entity);
      this.modelNameByEntityClass[className] = model;
    }
    this.modelOrder = this.buildModelOrder();
  }`,
  )

  src = src.replaceAll('runSuperadminBootstrap(', 'this.bootstrap.runSuperadminBootstrap(')
  src = src.replaceAll('ensureSeedUserRoleLinks(', 'this.bootstrap.ensureSeedUserRoleLinks(')
  src = src.replaceAll('ensureActingUserRoleAfterImport(', 'this.bootstrap.ensureActingUserRoleAfterImport(')

  src = src.replaceAll(
    `new LegacyImportIdMap(
        Setting as unknown as new () => Record<string, unknown>,
      )`,
    `new LegacyImportIdMap(this.modelEntity('setting') as new () => Record<string, unknown>)`,
  )

  src = replaceEntityRefs(src)

  const header = `/** Ported from apps/hub-event/api — logic import/export dùng chung. Binding app: ormEntities + bootstrap. */\n`

  fs.writeFileSync(DEST, header + src, 'utf8')
  console.log(`[port-system-admin] wrote ${path.relative(ROOT, DEST)}`)
}

main()
