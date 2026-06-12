import { Injectable } from '@nestjs/common';
import type { EntityManager } from '@mikro-orm/core';

export interface CreateContactRequestDto {
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
}

export type ContactRequestPendingBroadcast = {
  resource: string;
  id: number;
  status: string;
  title: string;
  description?: string | null;
  actionUrl?: string | null;
  actorUserId?: string;
};

export interface IPublicContactRealtimeDeps {
  pendingApproval(payload: ContactRequestPendingBroadcast): void;
}

@Injectable()
export abstract class BasePublicContactRequestsService {
  protected abstract getEm(): EntityManager;
  protected abstract getContactRequestEntity(): new () => Record<string, unknown>;
  protected abstract getAdminRealtime(): IPublicContactRealtimeDeps;
  protected abstract getContactRequestAdminUrl(id: number): string;

  async create(dto: CreateContactRequestDto) {
    const em = this.getEm();
    const ContactRequest = this.getContactRequestEntity();
    const resolvedName = dto.name?.trim() || dto.fullName?.trim() || '';
    const hasLegacyConsultationFields = Boolean(
      dto.address ||
        dto.program ||
        dto.major ||
        dto.subscribeNewsletter ||
        dto.subscribeConsultation,
    );
    const subject = dto.subject?.trim()
      ? dto.subject.trim()
      : hasLegacyConsultationFields
        ? 'Đăng ký tư vấn tuyển sinh'
        : 'Liên hệ hỗ trợ';
    const parts: string[] = [];
    if (dto.address) parts.push(`Địa chỉ: ${dto.address}`);
    if (dto.program) parts.push(`Chương trình: ${dto.program}`);
    if (dto.major) parts.push(`Ngành: ${dto.major}`);
    if (dto.subscribeNewsletter)
      parts.push('Đăng ký nhận thông tin tuyển sinh: Có');
    if (dto.subscribeConsultation) parts.push('Đăng ký tư vấn: Có');
    if (dto.content?.trim()) parts.push(`Nội dung: ${dto.content.trim()}`);
    const content =
      parts.length > 0 ? parts.join('\n') : 'Không có nội dung thêm';

    const contact = new ContactRequest() as Record<string, unknown>;
    contact.name = resolvedName;
    contact.email = dto.email;
    contact.phone = dto.phone?.trim() ? dto.phone.trim() : null;
    contact.subject = subject;
    contact.content = content;
    await em.persistAndFlush(contact);

    this.getAdminRealtime().pendingApproval({
      resource: 'contact-requests',
      id: contact.id as number,
      status: 'NEW',
      title: 'Yêu cầu liên hệ mới',
      description: `${contact.subject} — ${resolvedName || contact.email}`,
      actionUrl: this.getContactRequestAdminUrl(contact.id as number),
    });

    return {
      id: contact.id,
      message: 'Gửi liên hệ thành công. Chúng tôi sẽ phản hồi bạn sớm.',
    };
  }
}
