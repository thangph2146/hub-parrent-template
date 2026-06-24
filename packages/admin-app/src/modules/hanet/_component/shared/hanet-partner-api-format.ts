import {
  HANET_PARTNER_API_BASE,
  type HanetPartnerEndpoint,
} from "./hanet-postman"

export function isHanetEndpointProxied(endpoint: HanetPartnerEndpoint): boolean {
  return Boolean(endpoint.hubMethod?.trim() && endpoint.hubPath?.trim())
}

export function formatPartnerEndpointLine(
  endpoint: HanetPartnerEndpoint
): string {
  return `${endpoint.partnerMethod} ${HANET_PARTNER_API_BASE}${endpoint.partnerPath}`
}

export function formatHubEndpointLine(
  endpoint: HanetPartnerEndpoint
): string | null {
  if (!isHanetEndpointProxied(endpoint)) return null
  return `${endpoint.hubMethod} ${endpoint.hubPath}`
}

/** Một dòng đối chiếu — copy nhanh từng endpoint. */
export function formatEndpointMappingLine(
  endpoint: HanetPartnerEndpoint
): string {
  const partner = formatPartnerEndpointLine(endpoint)
  const hub = formatHubEndpointLine(endpoint)
  return hub ? `${partner} → ${hub}` : `${partner} → [Chưa cấu hình Hub]`
}

export function summarizePartnerEndpoints(
  endpoints: readonly HanetPartnerEndpoint[]
) {
  const proxied = endpoints.filter(isHanetEndpointProxied)
  const missing = endpoints.filter((ep) => !isHanetEndpointProxied(ep))
  return {
    total: endpoints.length,
    proxied: proxied.length,
    missing: missing.length,
    missingEndpoints: missing,
  }
}

export function buildPartnerHubComparisonMarkdown(
  endpoints: readonly HanetPartnerEndpoint[],
  title = "HANET ↔ Hub Admin API"
): string {
  const lines = [
    `# ${title}`,
    "",
    "| Nhóm | Partner API | Hub Admin | Trạng thái |",
    "| --- | --- | --- | --- |",
  ]

  for (const ep of endpoints) {
    const partner = `\`${ep.partnerMethod} ${ep.partnerPath}\``
    const hub = formatHubEndpointLine(ep)
    const hubCell = hub ? `\`${hub}\`` : "—"
    const status = hub ? "✅ Đã proxy" : "❌ Chưa cấu hình Hub"
    lines.push(`| ${ep.group} | ${partner} | ${hubCell} | ${status} |`)
  }

  return lines.join("\n")
}

/** Danh sách Partner API chưa có route Hub — dùng khi implement backend. */
export function buildMissingHubConfigText(
  endpoints: readonly HanetPartnerEndpoint[]
): string {
  const missing = endpoints.filter((ep) => !isHanetEndpointProxied(ep))
  if (missing.length === 0) {
    return "Tất cả endpoint trên trang này đã có Hub Admin proxy."
  }

  const lines = [
    `# API chưa cấu hình Hub (${missing.length})`,
    "",
    ...missing.map(
      (ep) =>
        `- [${ep.group}] ${ep.partnerMethod} ${ep.partnerPath}`
    ),
    "",
    "## Gợi ý mapping",
    "",
    ...missing.map((ep) => `- ${formatEndpointMappingLine(ep)}`),
  ]

  return lines.join("\n")
}

export async function copyTextToClipboard(
  text: string
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
