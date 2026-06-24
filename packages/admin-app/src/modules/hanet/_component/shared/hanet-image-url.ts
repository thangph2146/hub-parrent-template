/** Kiểm tra URL ảnh hợp lệ cho HANET registerByUrl / updateByFaceUrl (khớp API). */
const HANET_IMAGE_EXT_RE = /\.(jpe?g|png)(\?|#|$)/i

export function isHanetRegisterImageUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (/\.webp(\?|#|$)/i.test(trimmed)) return false
  return HANET_IMAGE_EXT_RE.test(trimmed)
}

export function hanetRegisterImageUrlError(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return "Thiếu URL ảnh JPG/PNG"
  if (/\.webp(\?|#|$)/i.test(trimmed)) {
    return "HANET không hỗ trợ WebP — dùng JPG hoặc PNG"
  }
  if (!HANET_IMAGE_EXT_RE.test(trimmed)) {
    return "URL ảnh HANET phải trỏ tới file JPG hoặc PNG (đuôi .jpg/.jpeg/.png)"
  }
  return null
}
