import { BadRequestException } from '@nestjs/common';
import type { HanetPartnerEnvelope } from './hanet-partner.types';

export const HANET_RETURN_SUCCESS = 1;
/** Một số endpoint HANET trả -103 khi token hết hạn. */
export const HANET_RETURN_TOKEN_EXPIRED = -103;
/** `getPlaces` và endpoint khác có thể trả 401 + "Token is expired". */
export const HANET_RETURN_HTTP_TOKEN_EXPIRED = 401;

export function isHanetTokenExpiredEnvelope(
  envelope: HanetPartnerEnvelope,
): boolean {
  if (
    envelope.returnCode === HANET_RETURN_TOKEN_EXPIRED ||
    envelope.returnCode === HANET_RETURN_HTTP_TOKEN_EXPIRED
  ) {
    return true;
  }
  const message = envelope.returnMessage?.toLowerCase() ?? '';
  return message.includes('token is expired') || message.includes('token expired');
}

export function isHanetPartnerEnvelope(
  value: unknown,
): value is HanetPartnerEnvelope {
  return (
    value != null &&
    typeof value === 'object' &&
    'returnCode' in value &&
    typeof (value as HanetPartnerEnvelope).returnCode === 'number'
  );
}

export function assertHanetPartnerOk<T = unknown>(
  envelope: HanetPartnerEnvelope<T>,
  path: string,
): T {
  if (envelope.returnCode === HANET_RETURN_SUCCESS) {
    return envelope.data as T;
  }

  const message =
    envelope.returnMessage?.trim() ||
    `HANET ${path} returnCode=${envelope.returnCode}`;
  throw new BadRequestException(message);
}

/** dd/MM/yyyy — format ngày thường dùng trên partner API HANET. */
export function formatHanetPartnerDayDate(input: string | Date): string {
  const date =
    typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())
      ? new Date(`${input.trim()}T12:00:00`)
      : typeof input === 'string'
        ? new Date(input)
        : input;

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Ngày không hợp lệ (dùng yyyy-mm-dd)');
  }

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
