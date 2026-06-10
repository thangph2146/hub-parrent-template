import sharp from 'sharp';

export interface ImageProcessOptions {
  maxWidth?: number;
  quality?: number;
}

const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_QUALITY = 80;

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
