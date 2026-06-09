import { DEFAULT_API_URL } from "@workspace/api-client"

const UPLOADS_PREFIX = "/api/uploads/"

export function parseImageUrlList(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function formatImageUrlList(urls: readonly string[]): string {
  return urls.join("\n")
}

function getApiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
    /\/api\/?$/,
    ""
  )
}

/** URL tuyệt đối cho `<img src>` — hỗ trợ path `/api/uploads/...` hoặc URL ngoài. */
export function resolveMediaUrl(url: string, width?: number): string {
  const raw = url.trim()
  if (!raw) return ""

  let absolute = raw
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    const apiOrigin = getApiOrigin()
    if (raw.startsWith(UPLOADS_PREFIX)) {
      absolute = `${apiOrigin}${raw}`
    } else if (raw.startsWith("api/uploads/")) {
      absolute = `${apiOrigin}/${raw}`
    } else if (raw.startsWith("/")) {
      absolute = `${apiOrigin}${raw}`
    } else {
      absolute = `${apiOrigin}${UPLOADS_PREFIX}${raw}`
    }
  }

  if (!width) return absolute

  const marker = UPLOADS_PREFIX
  const idx = absolute.indexOf(marker)
  if (idx === -1 || absolute.includes(`${marker}resized/`)) {
    return absolute
  }
  const origin = absolute.slice(0, idx + marker.length)
  const path = absolute.slice(idx + marker.length)
  if (!path) return absolute
  return `${origin}resized/${path}?w=${width}&q=75`
}
