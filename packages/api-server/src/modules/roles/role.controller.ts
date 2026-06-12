/**
 * Roles Controller.
 *
 * Bám sát pattern của `apps/main/api/src/roles/roles.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /roles              - list
 *   GET    /roles/:id          - getById
 *   POST   /roles              - create
 *   PUT    /roles/:id          - update
 *   DELETE /roles/:id          - softDelete
 *   POST   /roles/:id/restore  - restore
 *   DELETE /roles/:id/hard     - hardDelete
 *   POST   /roles/bulk         - bulk action
 */
import { Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import {
  createSuccessResponse,
  parseAdminListLimit,
  type ApiResponsePayload,
} from '../../common';
import { PERMISSIONS } from '../../config/permissions';
import type {
  RolesRowDto,
  RolesCreateData,
  RolesUpdateData,
} from './role.service';

export type IRolesControllerService = ICrudControllerService<
  RolesRowDto,
  RolesCreateData,
  RolesUpdateData
>;

@ApiTags('Roles')
export class BaseRolesController extends BaseCrudController<
  RolesRowDto,
  RolesCreateData,
  RolesUpdateData
> {
  constructor(service: IRolesControllerService) {
    super(service, 'roles');
  }

  @Get('options')
  @ApiOperation({ summary: 'Get role options for dropdowns' })
  @ApiResponse({ status: 200, description: 'Role options retrieved successfully' })
  async options(
    @Query('column') column = 'name',
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponsePayload<Array<{ label: string; value: string }>>> {
    const result = await this.service.list({
      page: 1,
      limit: parseAdminListLimit(limit, 50),
      search: search?.trim() ?? '',
      status: 'active',
      filters: {},
    });
    const items = result.data.map((row) => {
      const source =
        typeof row[column as keyof RolesRowDto] === 'string'
          ? String(row[column as keyof RolesRowDto] ?? '').trim()
          : String(row.displayName ?? row.name ?? '').trim();
      return {
        label: source || String(row.displayName ?? row.name ?? row.id ?? ''),
        value: String(row.id ?? ''),
      };
    });
    return createSuccessResponse(items).body;
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List permission catalog' })
  @ApiResponse({ status: 200, description: 'Permission catalog retrieved successfully' })
  listPermissionCatalog(): ApiResponsePayload<
    Array<{ id: number; code: string; name: string; description: null }>
  > {
    const items = Object.values(PERMISSIONS)
      .map((code, index) => ({
        id: index + 1,
        code,
        name: code,
        description: null,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
    return createSuccessResponse(items).body;
  }
}
