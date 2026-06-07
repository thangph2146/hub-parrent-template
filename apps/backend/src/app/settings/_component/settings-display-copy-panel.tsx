"use client"

import { useMemo } from "react"
import { resolveSettingsDocumentHeadPreview } from "./settings-document-head-preview"
import { SettingsConfigCopyPanel } from "./settings-config-copy-panel"

export type SettingsDisplayCopyValues = {
  siteName: string
  siteDescription: string
  defaultNewUserRole: string
  defaultNewUserRoleLabel?: string | null
}

export type SettingsDisplayCopySeoContext = {
  title: string
  description: string
}

function buildDisplayConfigText(
  values: SettingsDisplayCopyValues,
  seoContext?: SettingsDisplayCopySeoContext,
  options?: { hasUnsavedChanges?: boolean },
): string {
  const documentHead = resolveSettingsDocumentHeadPreview({
    siteName: values.siteName,
    siteDescription: values.siteDescription,
    seoTitle: seoContext?.title ?? "",
    seoDescription: seoContext?.description ?? "",
  })

  const payload = {
    site_name: values.siteName.trim() || null,
    site_description: values.siteDescription.trim() || null,
    default_new_user_role: values.defaultNewUserRole.trim() || null,
    ...(values.defaultNewUserRoleLabel
      ? { default_new_user_role_label: values.defaultNewUserRoleLabel }
      : {}),
    publicApi: "GET /api/public/site-branding",
    adminSettingsKeys: [
      "site_name",
      "site_description",
      "default_new_user_role",
    ],
    documentHead,
    ...(options?.hasUnsavedChanges ? { note: "Form có thay đổi chưa lưu" } : {}),
  }

  return JSON.stringify(payload, null, 2)
}

export function SettingsDisplayCopyPanel({
  values,
  seoContext,
  hasUnsavedChanges = false,
}: {
  values: SettingsDisplayCopyValues
  seoContext?: SettingsDisplayCopySeoContext
  hasUnsavedChanges?: boolean
}) {
  const configText = useMemo(
    () => buildDisplayConfigText(values, seoContext, { hasUnsavedChanges }),
    [values, seoContext, hasUnsavedChanges],
  )

  return (
    <SettingsConfigCopyPanel
      configText={configText}
      copySuccessMessage="Đã sao chép cấu hình hiển thị"
      hasUnsavedChanges={hasUnsavedChanges}
    />
  )
}
