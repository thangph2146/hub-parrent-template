import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public, createErrorResponse, createSuccessResponse } from '../../common';
import { PUBLIC_ROUTES } from '../../config';
import type { BaseContactRequestsService } from './contact-request.service';

export type CreatePublicContactRequestDto = {
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  subject?: string;
  address?: string;
  program?: string;
  major?: string;
  subscribeNewsletter?: boolean;
  subscribeConsultation?: boolean;
  content?: string;
};

export type IPublicContactRequestsControllerService = Pick<
  BaseContactRequestsService,
  'create'
>;

@Public()
@Controller(PUBLIC_ROUTES.BASE)
export class BasePublicContactRequestsController {
  constructor(private readonly service: IPublicContactRequestsControllerService) {}

  @Post('contact-requests')
  async createContactRequest(
    @Body() body: CreatePublicContactRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    const name = body?.name?.trim() || body?.fullName?.trim();
    const email = body?.email?.trim();
    const subject = body?.subject?.trim();
    const hasLegacyConsultationFields = Boolean(
      body?.address ||
        body?.program ||
        body?.major ||
        body?.subscribeNewsletter ||
        body?.subscribeConsultation,
    );

    if (!name || !email || (!subject && !hasLegacyConsultationFields)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Vui long dien day du ho ten, email va chu de lien he.',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const resolvedSubject = subject
        ? subject
        : hasLegacyConsultationFields
          ? 'Dang ky tu van tuyen sinh'
          : 'Lien he ho tro';

      const parts: string[] = [];
      if (body.address) parts.push(`Dia chi: ${body.address}`);
      if (body.program) parts.push(`Chuong trinh: ${body.program}`);
      if (body.major) parts.push(`Nganh: ${body.major}`);
      if (body.subscribeNewsletter)
        parts.push('Dang ky nhan thong tin tuyen sinh: Co');
      if (body.subscribeConsultation) parts.push('Dang ky tu van: Co');
      if (body.content?.trim()) parts.push(`Noi dung: ${body.content.trim()}`);
      const content = parts.length > 0 ? parts.join('\n') : 'Khong co noi dung them';

      const created = await this.service.create({
        name,
        email,
        phone: body.phone?.trim() ? body.phone.trim() : null,
        subject: resolvedSubject,
        content,
        status: 'NEW',
        isRead: false,
      } as never);

      const { statusCode, body: okBody } = createSuccessResponse({
        id: String((created as unknown as { id?: string | number }).id ?? ''),
        message: 'Gui lien he thanh cong. Chung toi se phan hoi ban som.',
      });
      return res.status(statusCode).json(okBody);
    } catch {
      const { statusCode, body: errBody } = createErrorResponse(
        'Khong the gui lien he ho tro. Vui long thu lai sau.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }
}

