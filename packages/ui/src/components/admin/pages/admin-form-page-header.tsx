"use client"

import type { ReactNode } from "react"

import { TypographyH1 } from "../../typography"

import {
  ADMIN_PAGE_HEADER_ACTIONS_CLASS,
  ADMIN_PAGE_HEADER_LEADING_CLASS,
  ADMIN_PAGE_HEADER_TOOLBAR_CLASS,
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_PRIMARY_CLASS,
} from "../../../lib/layout-shell"

import {
  AdminPageHeaderBackButton,
  AdminPageHeaderOutlineButton,
  AdminPageHeaderPrimaryButton,
} from "./admin-page-header-buttons"

export type AdminFormPageHeaderProps = {
  title: ReactNode

  subtitle?: ReactNode

  onBack: () => void

  onReset?: () => void

  formId: string

  submitting?: boolean

  isEdit?: boolean

  saveLabel?: string

  resetLabel?: string

  backLabel?: string

  extraActions?: ReactNode
}

/** Header trang thêm mới / chỉnh sửa (quay lại + H1 + Đặt lại + Lưu). */

export function AdminFormPageHeader({
  title,

  subtitle,

  onBack,

  onReset,

  formId,

  submitting = false,

  isEdit = false,

  saveLabel,

  resetLabel = "Đặt lại",

  backLabel = "Quay lại",

  extraActions,
}: AdminFormPageHeaderProps) {
  const saveText =
    saveLabel ?? (submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu")

  return (
    <div className={ADMIN_PAGE_HEADER_TOOLBAR_CLASS}>
      <div className={ADMIN_PAGE_HEADER_LEADING_CLASS}>
        <AdminPageHeaderBackButton onClick={onBack}>
          {backLabel}
        </AdminPageHeaderBackButton>

        <div>
          <TypographyH1 className={ADMIN_PAGE_TITLE_PRIMARY_CLASS}>
            {title}
          </TypographyH1>

          {subtitle ? (
            <p className={ADMIN_PAGE_SUBTITLE_CLASS}>{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className={ADMIN_PAGE_HEADER_ACTIONS_CLASS}>
        {extraActions}

        {onReset ? (
          <AdminPageHeaderOutlineButton onClick={onReset} disabled={submitting}>
            {resetLabel}
          </AdminPageHeaderOutlineButton>
        ) : null}

        <AdminPageHeaderPrimaryButton
          type="submit"
          form={formId}
          disabled={submitting}
        >
          {saveText}
        </AdminPageHeaderPrimaryButton>
      </div>
    </div>
  )
}
