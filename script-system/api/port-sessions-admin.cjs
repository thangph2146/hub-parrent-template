/**
 * Port hub-event sessions.service.ts → packages/api-server sessions-admin.service.ts
 */
const fs = require('fs')
const path = require('path')

const SRC = path.join(
  __dirname,
  '../../apps/hub-event/api/src/sessions/sessions.service.ts',
)
const DEST = path.join(
  __dirname,
  '../../packages/api-server/src/modules/sessions/sessions-admin.service.ts',
)

let body = fs.readFileSync(SRC, 'utf8')

const header = `/**
 * Sessions Admin Service — logic đầy đủ từ apps/hub-event/api (port bằng port-sessions-admin.cjs).
 */
import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  resolveRelationFilters,
  type RelationFiltersConfig,
} from '../../common/resolve-relation-filters';
import {
  normalizePageLimit,
  paginationMeta,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from '../../common/pagination';
import {
  toEntityId,
  toEntityIdList,
  relationEntityId,
} from '../../common/entity-id';
import { safeIsoString, safeIsoStringNow } from '../../common/date-utils';

export interface AuthRoleNamesBinding {
  USER: string;
  ADMIN: string;
  SUPER_ADMIN: string;
}

`

const exportIdx = body.indexOf('export interface SessionRowDto')
if (exportIdx < 0) throw new Error('SessionRowDto export not found')
body = body.slice(exportIdx)

body = body.replace(
  /type SessionWithUser = Session & \{[\s\S]*?\};/,
  `type SessionWithUser = Record<string, unknown> & {
  id: number;
  accessToken: string;
  refreshToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  isActive: boolean;
  expiresAt: Date | string;
  lastActivity: Date | string;
  createdAt: Date | string;
  user?: { id?: number; name?: string | null; email?: string | null } | string | null;
};`,
)

body = body.replace(
  /function buildWhere\(params: ListSessionsParams\): FilterQuery<Session>/,
  'function buildWhere(params: ListSessionsParams): FilterQuery<object>',
)
body = body.replace(/as FilterQuery<Session>/g, 'as FilterQuery<object>')

body = body.replace(
  /expiresAt: s\.expiresAt\.toISOString\(\),\n    lastActivity: s\.lastActivity\.toISOString\(\),\n    createdAt: s\.createdAt\.toISOString\(\),/,
  `expiresAt: safeIsoStringNow(s.expiresAt),
    lastActivity: safeIsoStringNow(s.lastActivity),
    createdAt: safeIsoStringNow(s.createdAt),`,
)

body = body.replace(
  /deletedAt: u\.deletedAt\?\.toISOString\(\) \?\? null,/,
  'deletedAt: safeIsoString(u.deletedAt),',
)

body = body.replace(
  /@Injectable\(\)\r?\nexport class SessionsService \{\r?\n  constructor\(private readonly em: EntityManager\) \{\}\r?\n\r?\n  private readonly optionColumns = new Set<keyof Session>\(\[/,
  `@Injectable()
export abstract class BaseSessionsAdminService {
  protected abstract getEm(): EntityManager;
  protected abstract getSessionEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getUserRoleEntity(): new () => Record<string, unknown>;
  protected abstract getRoleEntity(): new () => Record<string, unknown>;
  protected abstract getAuthRoleNames(): AuthRoleNamesBinding;

  protected resolveRelationEntity(model: string): (new () => object) | undefined {
    if (model === 'user') return this.getUserEntity();
    return undefined;
  }

  private readonly optionColumns = new Set<string>([`,
)

body = body.replace(
  /import \{ AUTH_ROLE_NAMES \} from '\.\.\/config\/constants';\n/,
  '',
)
body = body.replace(/\bAUTH_ROLE_NAMES\.USER\b/g, 'this.getAuthRoleNames().USER')
body = body.replace(/\bAUTH_ROLE_NAMES\.ADMIN\b/g, 'this.getAuthRoleNames().ADMIN')
body = body.replace(/name: 'super_admin'/g, "name: this.getAuthRoleNames().SUPER_ADMIN")

body = body.replace(/\bthis\.em\b/g, 'this.getEm()')

const entityReplacements = [
  [/findOne\(Role,/g, 'findOne(this.getRoleEntity(),'],
  [/findOne\(User,/g, 'findOne(this.getUserEntity(),'],
  [/findOne\(Session,/g, 'findOne(this.getSessionEntity(),'],
  [/find\(Role,/g, 'find(this.getRoleEntity(),'],
  [/find\(User,/g, 'find(this.getUserEntity(),'],
  [/find\(Session,/g, 'find(this.getSessionEntity(),'],
  [/find\(UserRole,/g, 'find(this.getUserRoleEntity(),'],
  [/count\(Session,/g, 'count(this.getSessionEntity(),'],
  [/count\(User,/g, 'count(this.getUserEntity(),'],
  [/count\(UserRole,/g, 'count(this.getUserRoleEntity(),'],
  [/nativeDelete\(Session,/g, 'nativeDelete(this.getSessionEntity(),'],
  [/nativeUpdate\(\s*Session,/g, 'nativeUpdate(this.getSessionEntity(),'],
  [/new Role\(\)/g, 'new (this.getRoleEntity())()'],
  [/new User\(\)/g, 'new (this.getUserEntity())()'],
  [/new UserRole\(\)/g, 'new (this.getUserRoleEntity())()'],
  [/new Session\(\)/g, 'new (this.getSessionEntity())()'],
  [/getReference\(Role,/g, 'getReference(this.getRoleEntity(),'],
  [/getReference\(User,/g, 'getReference(this.getUserEntity(),'],
  [/\bSession,\n/g, 'this.getSessionEntity(),\n'],
  [/\bUser,\n/g, 'this.getUserEntity(),\n'],
]

for (const [pattern, replacement] of entityReplacements) {
  body = body.replace(pattern, replacement)
}

body = body.replace(
  /await resolveRelationFilters\(\s*this\.getEm\(\),\s*params\.filters,\s*SESSION_RELATION_FILTERS,\s*\);/,
  `await resolveRelationFilters(
      this.getEm(),
      params.filters,
      SESSION_RELATION_FILTERS,
      (model) => this.resolveRelationEntity(model),
    );`,
)

body = body.replace(
  /column as keyof Session/g,
  'column',
)
body = body.replace(
  /optionColumn as keyof Session/g,
  'optionColumn',
)

fs.writeFileSync(DEST, header + body.trim() + '\n')
console.log('Wrote', DEST)
