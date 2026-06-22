/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseSystemService } from '../common/module-bases/system/system.service';
import { ormEntities } from '../mikro-orm/orm-entities';
import {
  runSuperadminBootstrap,
  ensureActingUserRoleAfterImport,
  ensureSeedUserRoleLinks,
} from '../seeds/superadmin-bootstrap.runner';

export type {
  ExportDataResult,
  ImportDataResult,
} from '../common/module-bases/system/system.service';

@Injectable()
export class SystemService extends BaseSystemService {
  constructor(protected readonly em: EntityManager) {
    super(em, ormEntities, {
      runSuperadminBootstrap,
      ensureSeedUserRoleLinks,
      ensureActingUserRoleAfterImport,
    });
  }
}
