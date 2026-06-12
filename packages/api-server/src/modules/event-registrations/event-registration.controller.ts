/**
 * EventRegistrations Controller.
 *
 * Bám sát pattern của `apps/main/api/src/event-registrations/event-registrations.controller.ts`.
 */
import {
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponsePayload,
} from '../../common';
import type {
  EventRegistrationsRowDto,
  EventRegistrationsCreateData,
  EventRegistrationsUpdateData,
} from './event-registration.service';

export type ManualAttendanceAction =
  | 'checkin'
  | 'checkout'
  | 'reset-checkin'
  | 'reset-checkout'
  | 'reset-all';

const MANUAL_ATTENDANCE_ACTIONS = new Set<ManualAttendanceAction>([
  'checkin',
  'checkout',
  'reset-checkin',
  'reset-checkout',
  'reset-all',
]);

export interface IEventRegistrationsControllerService
  extends ICrudControllerService<
    EventRegistrationsRowDto,
    EventRegistrationsCreateData,
    EventRegistrationsUpdateData
  > {
  applyManualAttendance(
    id: string | number,
    action: ManualAttendanceAction,
  ): Promise<EventRegistrationsRowDto>;
}

@ApiTags('EventRegistrations')
export class BaseEventRegistrationsController extends BaseCrudController<
  EventRegistrationsRowDto,
  EventRegistrationsCreateData,
  EventRegistrationsUpdateData
> {
  private readonly eventRegistrationsService: IEventRegistrationsControllerService;

  constructor(service: IEventRegistrationsControllerService) {
    super(service, 'event-registrations');
    this.eventRegistrationsService = service;
  }

  /**
   * POST /event-registrations/:id/attendance — khớp api-client.setAttendance().
   */
  @Post(':id/attendance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Cập nhật trạng thái check-in/out thủ công (khi socket lỗi hoặc điều chỉnh)',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Registration row after attendance update' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async setAttendance(
    @Param('id') id: string,
    @Body() body: { action?: ManualAttendanceAction },
  ): Promise<ApiResponsePayload<EventRegistrationsRowDto>> {
    const action = body?.action;
    if (!action || !MANUAL_ATTENDANCE_ACTIONS.has(action)) {
      throw new BadRequestException(
        createErrorResponse(
          'action phải là checkin | checkout | reset-checkin | reset-checkout | reset-all',
          { status: 400 },
        ).body,
      );
    }
    const updated = await this.eventRegistrationsService.applyManualAttendance(
      id,
      action,
    );
    return createSuccessResponse(updated).body;
  }
}
