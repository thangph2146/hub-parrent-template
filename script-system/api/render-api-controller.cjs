/**
 * Sinh admin CRUD controller (@Res envelope) cho hub-event từ registry entry.
 */
const { renderNativeController } = require('./render-native-controllers.cjs')

const GENERATED_BANNER = `/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */\n`

function idExpr(idCoercion) {
  return idCoercion === 'number' ? 'Number(id)' : 'id'
}

function renderCreateValidation(createRequired) {
  if (!createRequired) return ''
  const { field, message } = createRequired
  return `
    if (!body?.${field}?.toString().trim()) {
      const { statusCode, body: err } = createErrorResponse(
        '${message}',
        { status: 400 },
      );
      return res.status(statusCode).json(err);
    }`
}

function renderListUserIdParam(listUserIdFilter) {
  if (!listUserIdFilter) return ''
  return `
    @Query('userId') userId?: string,`
}

function renderListUserIdArg(listUserIdFilter) {
  if (!listUserIdFilter) return ''
  return `
        userId,`
}

function renderOptionsRoute(c, serviceProp) {
  if (!c.hasOptions) return ''
  const defaultColumn = c.optionsDefaultColumn ?? 'name'
  return `
  @Get('options')
  @ApiOperation({ summary: 'Get ${c.notFoundLabel} options for dropdowns' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async options(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('column') column?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const options = await this.${serviceProp}.getOptions(
      column?.trim() || '${defaultColumn}',
      search,
      Math.min(1000, Math.max(1, parseInt(String(limit), 10) || 50)),
    );
    const { statusCode, body } = createSuccessResponse(options);
    return res.status(statusCode).json(body);
  }
`
}

function renderController(def) {
  if (def.controllerTemplate) {
    return renderNativeController(def)
  }
  const c = def.controller
  if (!c) {
    throw new Error(`[render-api-controller] Thiếu controller config: ${def.folder}`)
  }
  if (def.controllerNative) return null

  const P = c.permissionPrefix
  const idArg = idExpr(c.idCoercion)
  const serviceProp = def.serviceClass.charAt(0).toLowerCase() + def.serviceClass.slice(1)
  const bulkLabel = c.bulkLabel ?? c.notFoundLabel
  const createBodyType = c.createBodyType ?? 'Record<string, unknown>'
  const updateBodyType = c.updateBodyType ?? createBodyType
  const dtoImport = c.createBodyType
    ? `import type { ${c.createBodyType}${c.updateBodyType && c.updateBodyType !== c.createBodyType ? `, ${c.updateBodyType}` : ''} } from '@workspace/api-server/modules/${def.apiModule}';\n`
    : ''

  return `${GENERATED_BANNER}${dtoImport}import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ${def.serviceClass} } from './${def.serviceFile.replace(/\.ts$/, '')}';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { isBulkAction } from '../common/bulk-actions';
import { buildAdminListCrudParams } from '../common/admin-list-params';

@ApiTags('${c.apiTags}')
@Controller(ADMIN_ROUTES.${c.adminRouteKey})
@Permissions(PERMISSIONS.${P}_VIEW)
export class ${def.controllerClass} {
  private readonly logger = new Logger(${def.controllerClass}.name);

  constructor(private readonly ${serviceProp}: ${def.serviceClass}) {}

  private getUserId(
    headers: Record<string, string | undefined>,
  ): string | null {
    const id = headers[APP_HEADERS.USER_ID]?.trim();
    return id || null;
  }

  private unauthorized(res: Response): Response {
    const { statusCode, body } = createErrorResponse('Thiếu header X-User-Id', {
      status: 401,
    });
    return res.status(statusCode).json(body);
  }

  @Get()
  @ApiOperation({ summary: 'List ${c.notFoundLabel}' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('statusFilter') statusFilter?: string,
    @Query('updatedAtFrom') updatedAtFrom?: string,
    @Query('updatedAtTo') updatedAtTo?: string,
    @Query('deletedAtFrom') deletedAtFrom?: string,
    @Query('deletedAtTo') deletedAtTo?: string,${renderListUserIdParam(c.listUserIdFilter)}
    @Query() query?: Record<string, string>,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const result = await this.${serviceProp}.list(
      buildAdminListCrudParams({
        page,
        limit,
        search,
        status,
        statusFilter,
        updatedAtFrom,
        updatedAtTo,
        deletedAtFrom,
        deletedAtTo,${renderListUserIdArg(c.listUserIdFilter)}
        query,
      }),
    );
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }
${renderOptionsRoute(c, serviceProp)}
  @Get(':id')
  @ApiOperation({ summary: 'Get ${c.notFoundLabel} by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const row = await this.${serviceProp}.getById(${idArg});
    if (!row) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy ${c.notFoundLabel}', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.${P}_CREATE)
  @Post()
  @ApiOperation({ summary: 'Create ${c.notFoundLabel}' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: ${createBodyType},
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);${renderCreateValidation(c.createRequired)}
    const created = await this.${serviceProp}.create(body);
    const { statusCode, body: ok } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(ok);
  }

  @Permissions(PERMISSIONS.${P}_UPDATE)
  @Put(':id')
  @ApiOperation({ summary: 'Update ${c.notFoundLabel}' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() body: ${updateBodyType},
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const updated = await this.${serviceProp}.update(${idArg}, body);
    if (!updated) {
      const { statusCode, body: err } = createErrorResponse(
        'Không tìm thấy ${c.notFoundLabel}',
        { status: 404 },
      );
      return res.status(statusCode).json(err);
    }
    const { statusCode, body: ok } = createSuccessResponse(updated);
    return res.status(statusCode).json(ok);
  }

  @Permissions(PERMISSIONS.${P}_MANAGE)
  @Delete(':id/hard-delete')
  @ApiOperation({ summary: 'Hard delete ${c.notFoundLabel}' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.${serviceProp}.hardDelete(${idArg});
    if (!ok) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy ${c.notFoundLabel}', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vĩnh viễn ${c.notFoundLabel}',
    });
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.${P}_DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete ${c.notFoundLabel}' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.${serviceProp}.softDelete(${idArg});
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        '${c.notFoundLabel} không tồn tại hoặc đã bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa ${c.notFoundLabel}',
    });
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.${P}_RESTORE)
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore ${c.notFoundLabel}' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.${serviceProp}.restore(${idArg});
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        '${c.notFoundLabel} không tồn tại hoặc chưa bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã khôi phục ${c.notFoundLabel}',
    });
    return res.status(statusCode).json(body);
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.${P}_MANAGE)
  @ApiOperation({ summary: 'Bulk action on ${bulkLabel}' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiBody({ description: 'Bulk action with ids' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { action?: string; ids?: string[] },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const action = body?.action;
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (!action || !isBulkAction(action)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Action khong hop le',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const result = await this.${serviceProp}.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.success, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
`
}

module.exports = { renderController }
