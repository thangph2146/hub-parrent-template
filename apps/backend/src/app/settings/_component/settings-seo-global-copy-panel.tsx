"use client"

import { useMemo } from "react"
import { SITE_SEO_PAGE_KEY } from "./constants"
import { resolveSettingsDocumentHeadPreview } from "./settings-document-head-preview"
import { SettingsConfigCopyPanel } from "./settings-config-copy-panel"

export type SettingsSeoGlobalCopyValues = {
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
  ogImage: string
}

export type SettingsSeoGlobalCopyDisplayContext = {
  siteName: string
  siteDescription: string
}

function buildSeoGlobalConfigText(
  values: SettingsSeoGlobalCopyValues,
  displayContext?: SettingsSeoGlobalCopyDisplayContext,
  options?: { hasUnsavedChanges?: boolean },
): string {
  const documentHead = resolveSettingsDocumentHeadPreview({
    siteName: displayContext?.siteName ?? "",
    siteDescription: displayContext?.siteDescription ?? "",
    seoTitle: values.title,
    seoDescription: values.description,
  })

  const payload = {
    page: SITE_SEO_PAGE_KEY,
    title: values.title.trim() || null,
    description: values.description.trim() || null,
    keywords: values.keywords.trim() || null,
    ogTitle: values.ogTitle.trim() || null,
    ogDescription: values.ogDescription.trim() || null,
    ogImage: values.ogImage.trim() || null,
    publicApi: `GET /api/public/seo-meta?page=${SITE_SEO_PAGE_KEY}`,
    documentHead,
    ...(options?.hasUnsavedChanges ? { note: "Form có thay đổi chưa lưu" } : {}),
  }

  return JSON.stringify(payload, null, 2)
}

export function SettingsSeoGlobalCopyPanel({
  values,
  displayContext,
  hasUnsavedChanges = false,
}: {
  values: SettingsSeoGlobalCopyValues
  displayContext?: SettingsSeoGlobalCopyDisplayContext
  hasUnsavedChanges?: boolean
}) {
  const configText = useMemo(
    () =>
      buildSeoGlobalConfigText(values, displayContext, { hasUnsavedChanges }),
    [values, displayContext, hasUnsavedChanges],
  )

  return (
    <SettingsConfigCopyPanel
      configText={configText}
      copySuccessMessage="Đã sao chép cấu hình SEO mặc định"
      hasUnsavedChanges={hasUnsavedChanges}
    />
  )
}
