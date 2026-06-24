"use client"

import { useCallback, useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@ui/components/button"
import { toast } from "@ui/components/sonner"
import type { RbacPermission } from "@workspace/api-client"
import type { RoleRow } from "../shared/utils"
import {
  buildRolePermissionCopyReport,
  buildRolePermissionsCodesCopyText,
} from "./role-permission-copy-report"
import {
  filterReportPermissionCodes,
  type RolePermissionGroup,
} from "./permission-report-groups"

async function copyText(text: string, successMessage: string) {
  await navigator.clipboard.writeText(text)
  toast.success(successMessage)
}

type RoleCopyActionsProps = {
  role: RoleRow
  allPermissions: RbacPermission[]
  /** Nhóm đang hiển thị (sau lọc tìm kiếm) — chỉ ảnh hưởng phần quyền đã gán. */
  visibleGroups?: RolePermissionGroup[]
  compact?: boolean
}

export function RoleCopyActions({
  role,
  allPermissions,
  visibleGroups,
  compact = false,
}: RoleCopyActionsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [copyingKey, setCopyingKey] = useState<string | null>(null)

  const selectedCodes = useMemo(
    () => filterReportPermissionCodes(role.permissions),
    [role.permissions],
  )

  const reportText = useMemo(
    () =>
      buildRolePermissionCopyReport({
        role,
        allPermissions,
        visiblePermissionGroups: visibleGroups,
        selectedOnly: true,
      }),
    [allPermissions, role, visibleGroups],
  )

  const codesJson = useMemo(
    () => buildRolePermissionsCodesCopyText(selectedCodes, "json"),
    [selectedCodes],
  )

  const onCopy = useCallback(
    async (key: string, text: string, message: string) => {
      if (copyingKey != null) return
      setCopyingKey(key)
      try {
        await copyText(text, message)
        setCopiedKey(key)
        window.setTimeout(() => setCopiedKey(null), 2000)
      } catch {
        toast.error("Không sao chép được")
      } finally {
        setCopyingKey(null)
      }
    },
    [copyingKey],
  )

  const btnSize = compact ? "xs" : "sm"

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size={btnSize}
        className="gap-1.5"
        onClick={() =>
          void onCopy(
            "report",
            reportText,
            "Đã sao chép báo cáo vai trò & quyền",
          )
        }
      >
        {copiedKey === "report" ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
        Báo cáo đầy đủ
      </Button>
      <Button
        type="button"
        variant="outline"
        size={btnSize}
        className="gap-1.5"
        onClick={() =>
          void onCopy(
            "json",
            codesJson,
            `Đã sao chép ${selectedCodes.length} mã quyền (JSON)`,
          )
        }
      >
        {copiedKey === "json" ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
        Mã quyền JSON
      </Button>
      <Button
        type="button"
        variant="outline"
        size={btnSize}
        className="gap-1.5"
        onClick={() =>
          void onCopy(
            "lines",
            buildRolePermissionsCodesCopyText(selectedCodes, "lines"),
            `Đã sao chép ${selectedCodes.length} mã quyền`,
          )
        }
      >
        {copiedKey === "lines" ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
        Danh sách mã
      </Button>
    </div>
  )
}
