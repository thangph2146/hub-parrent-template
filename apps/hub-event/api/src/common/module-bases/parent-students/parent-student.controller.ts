/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * ParentStudents Controller.
 */
import {
  Get,
  Query,
  Patch,
  Param,
  Body,
  Headers,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  Delete,
  Post,
  Controller,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  createSuccessResponse,
  createErrorResponse,
  parseAdminListLimit,
  parseAdminListPage,
  type ApiResponsePayload,
} from '../../index';
import type {
  ParentStudentsRowDto,
  AddParentStudentInput,
} from './parent-student.service';

export interface IParentStudentsControllerService {
  list(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    filters?: Record<string, string>;
  }): Promise<{
    data: ParentStudentsRowDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  review(
    id: string | number,
    action: 'approved' | 'rejected',
    reviewerId: string,
  ): Promise<ParentStudentsRowDto | null>;
  listByParent(parentId: string | number): Promise<ParentStudentsRowDto[]>;
  addStudentRequest(data: AddParentStudentInput): Promise<ParentStudentsRowDto>;
  removeForParent(
    id: string | number,
    parentId: string | number,
  ): Promise<boolean>;
}

@ApiTags('ParentStudents')
export class BaseParentStudentsController {
  private readonly parentStudentsService: IParentStudentsControllerService;

  constructor(service: IParentStudentsControllerService) {
    this.parentStudentsService = service;
  }

  @Get()
  @ApiOperation({ summary: 'List parent-student requests' })
  @ApiResponse({
    status: 200,
    description: 'Parent-student requests retrieved successfully',
  })
  async list(
    @Query() query: Record<string, string | string[] | undefined>,
  ): Promise<
    ApiResponsePayload<{
      data: ParentStudentsRowDto[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    const filters: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('filter[') && key.endsWith(']') && value) {
        const column = key.slice(7, -1);
        const raw = Array.isArray(value) ? value[0] : value;
        if (raw?.trim()) filters[column] = raw.trim();
      }
    }
    if (typeof query.status === 'string' && query.status.trim()) {
      filters.status = query.status.trim();
    }
    if (typeof query.createdAt === 'string' && query.createdAt.trim()) {
      filters.createdAt = query.createdAt.trim();
    }

    const result = await this.parentStudentsService.list({
      page: parseAdminListPage(query.page),
      limit: parseAdminListLimit(query.limit, 20),
      search: typeof query.search === 'string' ? query.search.trim() : '',
      status: 'all',
      filters,
    });
    return createSuccessResponse(result).body;
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Review parent-student request' })
  @ApiResponse({
    status: 200,
    description: 'Parent-student request reviewed successfully',
  })
  async review(
    @Param('id') id: string,
    @Body() body: { action: 'approved' | 'rejected'; note?: string },
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<ParentStudentsRowDto | null>> {
    if (!['approved', 'rejected'].includes(body.action)) {
      throw new BadRequestException(
        createErrorResponse('action phải là approved hoặc rejected', {
          status: 400,
        }).body,
      );
    }
    const reviewerId =
      headers['x-user-id']?.trim() || headers['X-User-Id']?.trim() || 'system';
    const result = await this.parentStudentsService.review(
      id,
      body.action,
      reviewerId,
    );
    if (!result) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy', { status: 404 }).body,
      );
    }
    return createSuccessResponse(result).body;
  }
}

@Controller()
@ApiTags('ParentMyStudents')
export class BaseParentMyStudentsController {
  private readonly logger = new Logger(BaseParentMyStudentsController.name);

  constructor(private readonly service: IParentStudentsControllerService) {}

  private getUserId(headers: Record<string, string | undefined>): string {
    const userId =
      headers['x-user-id']?.trim() ||
      headers['X-User-Id']?.trim() ||
      headers['x-userid']?.trim();
    if (!userId) {
      throw new UnauthorizedException(
        createErrorResponse('Chưa đăng nhập', { status: 401 }).body,
      );
    }
    return userId;
  }

  private async ensureApprovedStudent(
    parentId: string,
    studentCode: string,
  ): Promise<void> {
    const links = await this.service.listByParent(parentId);
    const approved = links.find(
      (item) => item.studentCode === studentCode && item.status === 'approved',
    );
    if (!approved) {
      throw new ForbiddenException(
        createErrorResponse(
          'Học sinh chưa được duyệt hoặc không thuộc tài khoản này',
          { status: 403 },
        ).body,
      );
    }
  }

  private async fetchExternalData<T>(
    path: string,
    fallbackData: T,
    noConfigMessage: string,
    errorMessage: string,
  ): Promise<ApiResponsePayload<T>> {
    const externalApiUrl = process.env.EXTERNAL_API_URL;
    if (!externalApiUrl) {
      return createSuccessResponse(fallbackData, { message: noConfigMessage })
        .body;
    }

    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (process.env.EXTERNAL_API_TOKEN) {
      fetchHeaders.Authorization = `Bearer ${process.env.EXTERNAL_API_TOKEN}`;
    }

    try {
      const response = await fetch(`${externalApiUrl}${path}`, {
        headers: fetchHeaders,
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        throw new Error(`API điểm trả về lỗi: ${response.status}`);
      }
      const data = (await response.json()) as T;
      return createSuccessResponse(data).body;
    } catch (error) {
      this.logger.error(errorMessage, error);
      const message =
        error instanceof Error &&
        error.message.startsWith('API điểm trả về lỗi:')
          ? error.message
          : errorMessage;
      throw new BadRequestException(
        createErrorResponse(message, { status: 400 }).body,
      );
    }
  }

  @Get('parent/my-students')
  @ApiOperation({ summary: 'List my students for current parent' })
  async list(
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<ParentStudentsRowDto[]>> {
    const parentId = this.getUserId(headers);
    const data = await this.service.listByParent(parentId);
    return createSuccessResponse(data).body;
  }

  @Post('parent/my-students')
  @ApiOperation({ summary: 'Add student link request for current parent' })
  async add(
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { studentCode: string; studentName?: string; note?: string },
  ): Promise<ApiResponsePayload<ParentStudentsRowDto>> {
    const parentId = this.getUserId(headers);
    if (!body.studentCode?.trim()) {
      throw new BadRequestException(
        createErrorResponse('Mã sinh viên không được để trống', {
          status: 400,
        }).body,
      );
    }
    const data = await this.service.addStudentRequest({
      parentId: Number.parseInt(parentId, 10),
      studentCode: body.studentCode,
      studentName: body.studentName,
      note: body.note,
    });
    return createSuccessResponse(data).body;
  }

  @Delete('parent/my-students/:id')
  @ApiOperation({ summary: 'Delete current parent student link request' })
  async remove(
    @Param('id') id: string,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<{ id: string }>> {
    const parentId = this.getUserId(headers);
    const ok = await this.service.removeForParent(id, parentId);
    if (!ok) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy hoặc không có quyền', {
          status: 404,
        }).body,
      );
    }
    return createSuccessResponse({ id }).body;
  }

  @Get('parent/my-students/scores/detailed/:studentCode')
  @ApiOperation({ summary: 'Get detailed scores for an approved student' })
  async getDetailedScores(
    @Param('studentCode') studentCode: string,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<unknown[]>> {
    const parentId = this.getUserId(headers);
    await this.ensureApprovedStudent(parentId, studentCode);
    return this.fetchExternalData(
      `/api/scores/detailed/${encodeURIComponent(studentCode)}`,
      [],
      'EXTERNAL_API_URL chưa được cấu hình',
      'Không thể lấy dữ liệu điểm chi tiết',
    );
  }

  @Get('parent/my-students/averages/year/:studentCode')
  @ApiOperation({ summary: 'Get year averages for an approved student' })
  async getYearAverages(
    @Param('studentCode') studentCode: string,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<unknown[]>> {
    const parentId = this.getUserId(headers);
    await this.ensureApprovedStudent(parentId, studentCode);
    return this.fetchExternalData(
      `/api/averages/year/${encodeURIComponent(studentCode)}`,
      [],
      'EXTERNAL_API_URL chưa được cấu hình',
      'Không thể lấy dữ liệu điểm trung bình năm',
    );
  }

  @Get('parent/my-students/averages/terms/:studentCode')
  @ApiOperation({ summary: 'Get term averages for an approved student' })
  async getTermAverages(
    @Param('studentCode') studentCode: string,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<unknown[]>> {
    const parentId = this.getUserId(headers);
    await this.ensureApprovedStudent(parentId, studentCode);
    return this.fetchExternalData(
      `/api/averages/terms/${encodeURIComponent(studentCode)}`,
      [],
      'EXTERNAL_API_URL chưa được cấu hình',
      'Không thể lấy dữ liệu điểm trung bình học kỳ',
    );
  }

  @Get('parent/my-students/averages/overall/:studentCode')
  @ApiOperation({ summary: 'Get overall average for an approved student' })
  async getOverallAverage(
    @Param('studentCode') studentCode: string,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<unknown>> {
    const parentId = this.getUserId(headers);
    await this.ensureApprovedStudent(parentId, studentCode);
    return this.fetchExternalData(
      `/api/averages/overall/${encodeURIComponent(studentCode)}`,
      null,
      'EXTERNAL_API_URL chưa được cấu hình',
      'Không thể lấy dữ liệu tổng hợp điểm',
    );
  }
}
