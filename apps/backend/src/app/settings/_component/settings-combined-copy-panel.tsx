"use client"

import { useMemo } from "react"
import { SITE_SEO_PAGE_KEY } from "./constants"
import { resolveSettingsDocumentHeadPreview } from "./settings-document-head-preview"
import {
  SettingsConfigCopyButton,
  SettingsConfigCopyPanel,
} from "./settings-config-copy-panel"
import type { SettingsDisplayCopyValues } from "./settings-display-copy-panel"
import type { SettingsSeoGlobalCopyValues } from "./settings-seo-global-copy-panel"

function useCombinedConfigText({
  display,
  seoGlobal,
  hasUnsavedChanges = false,
}: {
  display?: SettingsDisplayCopyValues
  seoGlobal?: SettingsSeoGlobalCopyValues
  hasUnsavedChanges?: boolean
}) {
  return useMemo(() => {
    const documentHead = resolveSettingsDocumentHeadPreview({
      siteName: display?.siteName ?? "",
      siteDescription: display?.siteDescription ?? "",
      seoTitle: seoGlobal?.title ?? "",
      seoDescription: seoGlobal?.description ?? "",
    })

    const payload = {
      display: display
        ? {
            site_name: display.siteName.trim() || null,
            site_description: display.siteDescription.trim() || null,
            default_new_user_role: display.defaultNewUserRole.trim() || null,
            ...(display.defaultNewUserRoleLabel
              ? {
                  default_new_user_role_label: display.defaultNewUserRoleLabel,
                }
              : {}),
            publicApi: "GET /api/public/site-branding",
          }
        : null,
      seoGlobal: seoGlobal
        ? {
            page: SITE_SEO_PAGE_KEY,
            title: seoGlobal.title.trim() || null,
            description: seoGlobal.description.trim() || null,
            keywords: seoGlobal.keywords.trim() || null,
            ogTitle: seoGlobal.ogTitle.trim() || null,
            ogDescription: seoGlobal.ogDescription.trim() || null,
            ogImage: seoGlobal.ogImage.trim() || null,
            publicApi: `GET /api/public/seo-meta?page=${SITE_SEO_PAGE_KEY}`,
          }
        : null,
      documentHead,
      priority: {
        title: "seo-global.title → Quản trị {display.site_name} → fallback",
        metaDescription:
          "seo-global.description → display.site_description → fallback",
      },
      ...(hasUnsavedChanges
        ? { note: "Một hoặc nhiều tab có thay đổi chưa lưu" }
        : {}),
    }

    return JSON.stringify(payload, null, 2)
  }, [display, seoGlobal, hasUnsavedChanges])
}

export function SettingsCombinedCopyButton({
  display,
  seoGlobal,
  hasUnsavedChanges = false,
}: {
  display?: SettingsDisplayCopyValues
  seoGlobal?: SettingsSeoGlobalCopyValues
  hasUnsavedChanges?: boolean
}) {
  const configText = useCombinedConfigText({ display, seoGlobal, hasUnsavedChanges })

  if (!display && !seoGlobal) return null

  return (
    <SettingsConfigCopyButton
      configText={configText}
      copySuccessMessage="Đã sao chép snapshot cấu hình"
      hasUnsavedChanges={hasUnsavedChanges}
    />
  )
}

export function SettingsCombinedCopyPanel({
  display,
  seoGlobal,
  hasUnsavedChanges = false,
}: {
  display?: SettingsDisplayCopyValues
  seoGlobal?: SettingsSeoGlobalCopyValues
  hasUnsavedChanges?: boolean
}) {
  const configText = useCombinedConfigText({ display, seoGlobal, hasUnsavedChanges })

  if (!display && !seoGlobal) return null

  return (
    <SettingsConfigCopyPanel
      configText={configText}
      copySuccessMessage="Đã sao chép snapshot display + SEO + document head"
      hasUnsavedChanges={hasUnsavedChanges}
    />
  )
}
