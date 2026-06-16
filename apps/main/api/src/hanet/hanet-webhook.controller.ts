import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PUBLIC_ROUTES } from '../config/constants';
import { Public } from '../common';
import { getHanetConfig, isHanetConfigured } from './hanet.config';
import { normalizeHanetBody } from './hanet-payload';
import { HanetWebhookService } from './hanet-webhook.service';
import { getHanetWebhookUrls } from './hanet-webhook-urls';
import type { HanetWebhookBody } from './hanet.types';

@ApiTags('HANET Webhook')
@Public()
@Controller(PUBLIC_ROUTES.HANET_WEBHOOK)
export class HanetWebhookController {
  private readonly logger = new Logger(HanetWebhookController.name);

  constructor(private readonly hanetWebhookService: HanetWebhookService) {}

  @Get('info')
  @ApiOperation({
    summary:
      'URL webhook + trạng thái cấu hình HANET (đăng ký trên developers.hanet.ai)',
  })
  getWebhookInfo(@Query('eventId') eventId?: string) {
    const config = getHanetConfig();
    return {
      configured: isHanetConfigured(config),
      webhookVerify: config.webhookVerify,
      clientId: config.clientId || null,
      urls: getHanetWebhookUrls(eventId?.trim() || undefined),
    };
  }

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
      `HANET webhook eventId=${eventId ?? 'auto'} keys=${Object.keys(body).join(',')} camera=${String(body.camera_id ?? body.deviceID ?? '-')}`,
    );
    const result = await this.hanetWebhookService.handleWebhook(eventId, body);
    return { success: true, data: result };
  }
}
