import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PUBLIC_ROUTES } from '../config/constants';
import { normalizeHanetBody } from './hanet-payload';
import { HanetWebhookService } from './hanet-webhook.service';
import type { HanetWebhookBody } from './hanet.types';

@ApiTags('HANET Webhook')
@Controller(PUBLIC_ROUTES.HANET_WEBHOOK)
export class HanetWebhookController {
  private readonly logger = new Logger(HanetWebhookController.name);

  constructor(private readonly hanetWebhookService: HanetWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Webhook HANET (tự suy eventId từ deviceID ↔ camera.code nếu đã gắn sự kiện)',
  })
  async receiveAuto(@Body() body: HanetWebhookBody) {
    return this.handle(body);
  }

  @Post(':eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Webhook HANET cho một sự kiện — URL cấu hình trên developers.hanet.ai',
  })
  async receiveForEvent(
    @Param('eventId') eventId: string,
    @Body() body: HanetWebhookBody,
  ) {
    return this.handle(body, eventId);
  }

  private async handle(rawBody: HanetWebhookBody, eventId?: string) {
    const body = normalizeHanetBody(rawBody);
    this.logger.debug(
      `HANET webhook eventId=${eventId ?? 'auto'} keys=${Object.keys(body).join(',')} camera=${body.camera_id ?? body.deviceID ?? '-'}`,
    );
    const result = await this.hanetWebhookService.handleWebhook(eventId, body);
    return { success: true, data: result };
  }
}
