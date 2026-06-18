/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { BadRequestException } from '@nestjs/common';

export type HanetFaceImagePayload = {
  buffer: Buffer;
  mimeType: 'image/jpeg' | 'image/png';
  filename: string;
};

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

function detectImageMime(
  buffer: Buffer,
): HanetFaceImagePayload['mimeType'] | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === JPEG_MAGIC[0] &&
    buffer[1] === JPEG_MAGIC[1] &&
    buffer[2] === JPEG_MAGIC[2]
  ) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 4 &&
    buffer[0] === PNG_MAGIC[0] &&
    buffer[1] === PNG_MAGIC[1] &&
    buffer[2] === PNG_MAGIC[2] &&
    buffer[3] === PNG_MAGIC[3]
  ) {
    return 'image/png';
  }
  return null;
}

/** Decode base64 (hoặc data URL) ảnh khuôn mặt gửi HANET multipart. */
export function decodeHanetFaceImageBase64(
  input: string,
): HanetFaceImagePayload {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new BadRequestException('Thiếu file ảnh (base64)');
  }

  const dataUrl = /^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/i.exec(trimmed);
  const base64 = dataUrl ? dataUrl[2] : trimmed;
  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, 'base64');
  } catch {
    throw new BadRequestException('fileBase64 không hợp lệ');
  }
  if (!buffer.length) {
    throw new BadRequestException('Ảnh rỗng');
  }

  const mimeType = detectImageMime(buffer);
  if (!mimeType) {
    throw new BadRequestException('Ảnh HANET phải là JPEG hoặc PNG');
  }

  return {
    buffer,
    mimeType,
    filename: mimeType === 'image/png' ? 'face.png' : 'face.jpg',
  };
}
