/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseRolesService,
  type RolesRowDto,
} from '@workspace/api-server/modules/roles';
import { toIso } from '@workspace/api-server/common';

import {
  getOptionsFromModel,
  type GetOptionsConfig,
} from '../common/get-options';
import { Role } from '../entities/role.entity';
const ROLE_OPTIONS_CONFIG: GetOptionsConfig = {
  name: { valueField: 'name', searchField: 'name' },
  displayName: { valueField: 'displayName', searchField: 'displayName' },
  '*': { valueField: 'name', searchField: 'name' },
};

export type RoleRowDto = RolesRowDto;

@Injectable()
export class RolesService extends BaseRolesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'displayName', 'description'];
  }
  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    return getOptionsFromModel(
      this.getEm().getRepository(Role),
      { deletedAt: null },
      column,
      ROLE_OPTIONS_CONFIG,
      search,
      limit,
    );
  }
  protected mapRow(entity: Record<string, unknown>): RolesRowDto {
    const row = entity as unknown as Role;
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
  }
}
