/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import sharp from 'sharp';

export interface ImageProcessOptions {
  maxWidth?: number;
  quality?: number;
}

const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_QUALITY = 80;

/** HANET registerByUrl — ảnh chân dung JPG, kích thước tối thiểu theo tài liệu face API. */
export const HANET_FACE_MIN_PX = 200;
export const HANET_FACE_JPEG_MAX_WIDTH = 1920;
export const HANET_FACE_JPEG_QUALITY = 90;

export const HANET_FACE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

export function isHanetFaceMime(mime: string): boolean {
  return HANET_FACE_MIME_TYPES.has(
    (mime || '').split(';')[0].trim().toLowerCase(),
  );
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith('image/') && !mime.includes('svg');
}

export function isImageExt(ext: string): boolean {
  return [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.bmp',
    '.tif',
    '.tiff',
    '.heic',
    '.heif',
  ].includes(ext.toLowerCase());
}

export async function processImageBuffer(
  buffer: Buffer,
  options?: ImageProcessOptions,
): Promise<{
  webpBuffer: Buffer;
  originalFormat: string;
  width: number;
  height: number;
}> {
  const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH;
  const quality = options?.quality ?? DEFAULT_QUALITY;

  let image = sharp(buffer);
  const metadata = await image.metadata();
  const originalFormat = metadata.format ?? 'jpeg';
  let width = metadata.width ?? 0;
  let height = metadata.height ?? 0;

  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
    image = image.resize(maxWidth, undefined, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const webpBuffer = await image.webp({ quality }).toBuffer();
  return { webpBuffer, originalFormat, width, height };
}

/** Xử lý ảnh khuôn mặt cho HANET — giữ JPEG (không WebP), resize nếu quá lớn. */
export async function processFaceImageJpegBuffer(
  buffer: Buffer,
  options?: { minPx?: number; maxWidth?: number; quality?: number },
): Promise<{ jpegBuffer: Buffer; width: number; height: number }> {
  const minPx = options?.minPx ?? HANET_FACE_MIN_PX;
  const maxWidth = options?.maxWidth ?? HANET_FACE_JPEG_MAX_WIDTH;
  const quality = options?.quality ?? HANET_FACE_JPEG_QUALITY;

  let image = sharp(buffer);
  const metadata = await image.metadata();
  let width = metadata.width ?? 0;
  let height = metadata.height ?? 0;

  if (width < minPx || height < minPx) {
    throw new Error(
      `Ảnh khuôn mặt tối thiểu ${minPx}×${minPx}px (yêu cầu HANET registerByUrl).`,
    );
  }

  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
    image = image.resize(maxWidth, undefined, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const jpegBuffer = await image
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  return { jpegBuffer, width, height };
}
