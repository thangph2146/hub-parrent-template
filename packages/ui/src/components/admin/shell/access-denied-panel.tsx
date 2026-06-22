"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AlertCircle, Check, Copy } from "lucide-react"
import type { AuthUser, PermissionCode } from "@workspace/api-client"
import { resolveAdminOperationError } from "../../../lib/admin-operation-error"
import { resolveAdminPortalLabel } from "../../../lib/admin-operation-report-branding"
import { permissionLabelVi } from "../../../lib/permission-label-vi"
import { Badge } from "../../badge"
import { Button } from "../../button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../card"
import { toast } from "../../sonner"
import {
  isAdminForbiddenPermissionError,
  type AdminAccessDeniedScope,
} from "./admin-permission-denied"

export type AdminAccessDeniedPanelProps = {
  user: AuthUser
  pagePath?: string | null
  /** `page` — chặn truy cập trang; `action` — chặn thao tác trong trang. */
  scope?: AdminAccessDeniedScope
  /** Mô tả thao tác khi `scope="action"`. */
  actionLabel?: string
  /** Bố cục gọn cho banner trong form / section. */
  compact?: boolean
  requiredPermission?: PermissionCode
  /** Một trong các quyền (OR) — dùng khi trang/chức năng chấp nhận nhiều mã. */
  requiredPermissions?: PermissionCode[]
  requiredRoles?: string[]
  /** Prod: thay panel chi tiết (dev) bằng nội dung tùy chỉnh. */
  fallback?: ReactNode
}

function formatRoleLabel(role: { name: string; displayName?: string }): string {
  const code = role.name
  const label = role.displayName?.trim()
  if (label && label !== code) return `${label} (${code})`
  return code
}

function formatUserRoles(user: AuthUser): string {
  if (!user.roles?.length) return "Chưa gán vai trò"
  return user.roles.map(formatRoleLabel).join(", ")
}

function formatPermissionLine(code: string): string {
  return `${code} — ${permissionLabelVi(code)}`
}

function collectPermissionCodes(props: AdminAccessDeniedPanelProps): string[] {
  return [
    ...(props.requiredPermission ? [props.requiredPermission] : []),
    ...(props.requiredPermissions ?? []),
  ].filter((code, index, arr) => arr.indexOf(code) === index)
}

export function buildAdminAccessDeniedCopyText({
  user,
  pagePath,
  scope = "page",
  actionLabel,
  requiredPermission,
  requiredPermissions,
  requiredRoles,
}: AdminAccessDeniedPanelProps): string {
  const path = pagePath?.trim() || "(không xác định)"
  const isAction = scope === "action"
  const portalLabel = resolveAdminPortalLabel()
  const lines: string[] = [
    isAction
      ? `YÊU CẦU CẤP QUYỀN THAO TÁC — ${portalLabel}`
      : `YÊU CẦU CẤP QUYỀN TRUY CẬP — ${portalLabel}`,
    "",
    `Trang: ${path}`,
  ]

  if (isAction && actionLabel?.trim()) {
    lines.push(`Thao tác: ${actionLabel.trim()}`)
  }

  lines.push(
    `Tài khoản: ${user.email} (ID: ${user.id})`,
    `Vai trò hiện tại: ${formatUserRoles(user)}`,
  )

  const permissionCodes = collectPermissionCodes({
    user,
    requiredPermission,
    requiredPermissions,
  })

  if (permissionCodes.length > 0) {
    lines.push(
      "",
      isAction
        ? "Quyền cần có để thực hiện thao tác này:"
        : "Quyền cần có để truy cập trang này:",
    )
    for (const code of permissionCodes) {
      lines.push(`- ${formatPermissionLine(code)}`)
    }
  }

  if (requiredRoles?.length) {
    lines.push("", "Vai trò được phép (một trong các mã sau):")
    for (const role of requiredRoles) {
      lines.push(`- ${role}`)
    }
  }

  if (user.permissions?.length) {
    lines.push("", `Quyền đang có (${user.permissions.length} mã):`)
    lines.push(user.permissions.join(", "))
  }

  lines.push(
    "",
    "Vui lòng liên hệ quản trị hệ thống để được cấp quyền phù hợp.",
  )

  return lines.join("\n")
}

const IS_DEV = process.env.NODE_ENV === "development"

function AdminAccessDeniedPanelSimple({
  scope = "page",
}: {
  scope?: AdminAccessDeniedScope
}) {
  const isAction = scope === "action"
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div>
          <CardTitle className="text-base">
            {isAction
              ? "Không có quyền thực hiện thao tác"
              : "Không có quyền truy cập"}
          </CardTitle>
          <CardDescription className="mt-1">
            {isAction
              ? "Tài khoản của bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị hệ thống nếu bạn cần được cấp quyền."
              : "Tài khoản của bạn không có quyền xem trang này. Vui lòng liên hệ quản trị hệ thống nếu bạn cần được cấp quyền."}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}

export function AdminAccessDeniedPanel(props: AdminAccessDeniedPanelProps) {
  const pathname = usePathname()
  const pagePath = props.pagePath ?? pathname
  const scope = props.scope ?? "page"
  const isAction = scope === "action"
  const [copied, setCopied] = useState(false)

  const copyText = useMemo(
    () => buildAdminAccessDeniedCopyText({ ...props, pagePath, scope }),
    [props, pagePath, scope],
  )

  const permissionCodes = useMemo(
    () => collectPermissionCodes(props),
    [props],
  )

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      toast.success("Đã sao chép thông báo")
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Không sao chép được")
    }
  }, [copyText])

  if (!IS_DEV) {
    if (props.fallback) return <>{props.fallback}</>
    return (
      <div className={props.compact ? undefined : "p-6"}>
        <AdminAccessDeniedPanelSimple scope={scope} />
      </div>
    )
  }

  return (
    <div className={props.compact ? undefined : "p-6"}>
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base">
              {isAction
                ? "Không có quyền thực hiện thao tác"
                : "Không có quyền truy cập"}
            </CardTitle>
            <CardDescription>
              {isAction ? (
                <>
                  Tài khoản của bạn không có quyền thực hiện thao tác này. Chi
                  tiết dưới đây chỉ hiển thị khi{" "}
                  <code className="text-xs">NODE_ENV=development</code> — sao
                  chép gửi quản trị nếu cần cấp quyền.
                </>
              ) : (
                <>
                  Tài khoản của bạn không có quyền xem trang này. Chi tiết dưới
                  đây chỉ hiển thị khi{" "}
                  <code className="text-xs">NODE_ENV=development</code> — sao
                  chép gửi quản trị nếu cần cấp quyền.
                </>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-[minmax(8rem,auto)_1fr]">
            <dt className="text-muted-foreground">Trang</dt>
            <dd className="font-mono text-xs break-all">{pagePath || "—"}</dd>

            {isAction && props.actionLabel?.trim() ? (
              <>
                <dt className="text-muted-foreground">Thao tác</dt>
                <dd>{props.actionLabel.trim()}</dd>
              </>
            ) : null}

            <dt className="text-muted-foreground">Tài khoản</dt>
            <dd className="break-all">{props.user.email}</dd>

            <dt className="text-muted-foreground">Vai trò hiện tại</dt>
            <dd>
              {props.user.roles?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {props.user.roles.map((role) => (
                    <Badge key={role.id ?? role.name} variant="secondary">
                      {formatRoleLabel(role)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">Chưa gán vai trò</span>
              )}
            </dd>

            {permissionCodes.length > 0 ? (
              <>
                <dt className="text-muted-foreground">Quyền cần có</dt>
                <dd className="space-y-1">
                  {permissionCodes.map((code) => (
                    <div
                      key={code}
                      className="rounded-md border bg-background/80 px-2.5 py-1.5"
                    >
                      <code className="text-xs font-medium">{code}</code>
                      <p className="text-muted-foreground text-xs">
                        {permissionLabelVi(code)}
                      </p>
                    </div>
                  ))}
                </dd>
              </>
            ) : null}

            {props.requiredRoles?.length ? (
              <>
                <dt className="text-muted-foreground">Vai trò được phép</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {props.requiredRoles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </dd>
              </>
            ) : null}
          </dl>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Nội dung gửi quản trị</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => void onCopy()}
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" aria-hidden />
                    Đã copy
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" aria-hidden />
                    Sao chép
                  </>
                )}
              </Button>
            </div>
            <pre className="max-h-56 overflow-auto rounded-lg border bg-background/90 p-3 text-xs leading-relaxed whitespace-pre-wrap">
              {copyText}
            </pre>
          </div>

          <p className="text-muted-foreground text-sm">
            Liên hệ quản trị hệ thống (siêu quản trị / bộ phận CNTT) để được gán
            vai trò hoặc quyền phù hợp, kèm nội dung đã sao chép ở trên.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export type AdminPermissionDeniedNoticeProps = AdminAccessDeniedPanelProps & {
  error?: unknown
}

/** Banner thiếu quyền từ API 403 hoặc kiểm tra client — có báo cáo copy (dev). */
export function AdminPermissionDeniedNotice({
  error,
  ...panelProps
}: AdminPermissionDeniedNoticeProps) {
  if (error != null && !isAdminForbiddenPermissionError(error)) {
    return (
      <p className="text-sm text-destructive">
        {resolveAdminOperationError(error)}
      </p>
    )
  }

  return (
    <AdminAccessDeniedPanel
      scope="action"
      compact
      {...panelProps}
    />
  )
}

export {
  ADMIN_FORBIDDEN_ACTION_MESSAGE,
  isAdminForbiddenPermissionError,
  type AdminAccessDeniedScope,
} from "./admin-permission-denied"
