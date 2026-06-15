/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { BadRequestException } from '@nestjs/common';
import { apiServerAppConfig } from '../config/app-config';
import { appConfig } from '../config/app.config';

const UPLOADS_PREFIX = '/api/uploads/';

/** Gốc API public (HTTPS) — HANET tải ảnh từ URL này khi registerByUrl. */
export function getHanetPublicApiOrigin(): string | undefined {
  const raw =
    apiServerAppConfig.publicUrl?.trim() ||
    appConfig.publicUrl?.trim() ||
    '';
  if (!raw) return undefined;
  return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
}

/**
 * Chuẩn hóa URL ảnh lưu trong DB thành URL tuyệt đối public cho HANET.
 * HANET partner API yêu cầu `url` truy cập được từ internet (HTTPS production).
 */
export function resolveHanetPublicImageUrl(storedUrl: string): string {
  const trimmed = storedUrl.trim();
  if (!trimmed) {
    throw new BadRequestException('Thiếu url ảnh khuôn mặt');
  }

  let absolute = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    const origin = getHanetPublicApiOrigin();
    if (!origin) {
      throw new BadRequestException(
        'Chưa cấu hình API_PUBLIC_URL — HANET không tải được ảnh relative/localhost. Đặt API_PUBLIC_URL=https://domain-cua-ban trong .env API.',
      );
    }
    if (trimmed.startsWith(UPLOADS_PREFIX)) {
      absolute = `${origin}${trimmed}`;
    } else if (trimmed.startsWith('api/uploads/')) {
      absolute = `${origin}/${trimmed}`;
    } else if (trimmed.startsWith('/')) {
      absolute = `${origin}${trimmed}`;
    } else {
      absolute = `${origin}${UPLOADS_PREFIX}${trimmed.replace(/^\//, '')}`;
    }
  }

  assertHanetFetchableImageUrl(absolute);
  return absolute;
}

/** HANET registerByUrl: JPG/PNG public HTTPS — không WebP, không localhost. */
export function assertHanetFetchableImageUrl(url: string): void {
  const lower = url.toLowerCase();
  if (/\.webp(\?|#|$)/.test(lower)) {
    throw new BadRequestException(
      'HANET registerByUrl yêu cầu ảnh JPG hoặc PNG — không dùng WebP.',
    );
  }
  if (!/\.(jpe?g|png)(\?|#|$)/.test(lower)) {
    throw new BadRequestException(
      'URL ảnh HANET phải trỏ tới file JPG hoặc PNG (đuôi .jpg/.jpeg/.png).',
    );
  }
  if (/^http:\/\/localhost/i.test(url) || /^http:\/\/127\.0\.0\.1/i.test(url)) {
    throw new BadRequestException(
      'HANET không tải được ảnh localhost — đặt API_PUBLIC_URL trỏ domain public HTTPS.',
    );
  }
  if (/^http:\/\//i.test(url) && apiServerAppConfig.nodeEnv === 'production') {
    throw new BadRequestException(
      'Production: URL ảnh HANET nên dùng HTTPS (registerByUrl).',
    );
  }
}
