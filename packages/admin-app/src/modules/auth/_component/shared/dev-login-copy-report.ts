import type { AuthUser, DevLoginOption } from "@workspace/api-client"
import { buildAdminSessionLoginCopyText } from "@ui/components/admin"
import { buildPublicApiSubmitCopyReport } from "@ui/lib/public-api-submit-toast"
import { resolveAdminPortalLabel } from "@ui/lib/admin-operation-report-branding"

const ADMIN_DEV_LOGIN_PATH = "/auth/admin/dev-login"

export type AdminDevLoginCopyReportInput = {
  message: string
  userId: string
  user?: AuthUser | null
  devOption?: DevLoginOption | null
  loginPath?: string | null
  portalLabel?: string | null
  error?: unknown
}

/** Báo cáo copy (dev) sau đăng nhập development cổng admin. */
export function buildAdminDevLoginCopyReport(
  input: AdminDevLoginCopyReportInput,
): string {
  const apiReport = buildPublicApiSubmitCopyReport({
    label: "Đăng nhập development (admin)",
    method: "POST",
    path: ADMIN_DEV_LOGIN_PATH,
    pagePath: input.loginPath,
    message: input.message,
    request: { userId: input.userId },
    response: input.user
      ? {
          id: input.user.id,
          email: input.user.email,
          name: input.user.name,
          roles: input.user.roles,
          permissions: input.user.permissions,
        }
      : undefined,
    error: input.error,
  })

  const sections = [apiReport]

  if (input.devOption) {
    sections.push(
      "",
      "── Dev login option (đã chọn) ──",
      JSON.stringify(input.devOption, null, 2),
    )
  }

  if (input.user) {
    sections.push(
      "",
      "── Session admin (copy paste) ──",
      buildAdminSessionLoginCopyText(input.user, {
        loginPath: input.loginPath,
        portalLabel: input.portalLabel ?? resolveAdminPortalLabel(),
      }),
    )
  }

  return sections.join("\n")
}
