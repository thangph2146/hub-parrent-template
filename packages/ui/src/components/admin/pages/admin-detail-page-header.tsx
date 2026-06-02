"use client"

import { Pencil } from "lucide-react"
import type { ReactNode } from "react"
import { TypographyH1, TypographyH2 } from "../../typography"
import {
  ADMIN_PAGE_HEADER_ACTIONS_CLASS,
  ADMIN_PAGE_HEADER_LEADING_CLASS,
  ADMIN_PAGE_HEADER_TOOLBAR_CLASS,
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_COMPACT_CLASS,
  ADMIN_PAGE_TITLE_PRIMARY_CLASS,
} from "../../../lib/layout-shell"
import {
  AdminPageHeaderBackButton,
  AdminPageHeaderPrimaryButton,
} from "./admin-page-header-buttons"

export type AdminDetailPageHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  onBack: () => void
  backLabel?: string
  /** `entity` = tiêu đề là tên bản ghi (H2 compact); `module` = tiêu đề module (H1). */
  variant?: "entity" | "module"
  onEdit?: () => void
  editLabel?: string
  actions?: ReactNode
}

/** Header trang chi tiết bản ghi. */
export function AdminDetailPageHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Quay lại",
  variant = "entity",
  onEdit,
  editLabel = "Chỉnh sửa",
  actions,
}: AdminDetailPageHeaderProps) {
  const TitleTag = variant === "module" ? TypographyH1 : TypographyH2
  const titleClass =
    variant === "module"
      ? ADMIN_PAGE_TITLE_PRIMARY_CLASS
      : ADMIN_PAGE_TITLE_COMPACT_CLASS

  return (
    <div className={ADMIN_PAGE_HEADER_TOOLBAR_CLASS}>
      <div className={ADMIN_PAGE_HEADER_LEADING_CLASS}>
        <AdminPageHeaderBackButton onClick={onBack}>
          {backLabel}
        </AdminPageHeaderBackButton>
        <div className="flex flex-col">
          <TitleTag className={titleClass}>{title}</TitleTag>
          {subtitle ? (
            <p className={ADMIN_PAGE_SUBTITLE_CLASS}>{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className={ADMIN_PAGE_HEADER_ACTIONS_CLASS}>
        {actions}
        {onEdit ? (
          <AdminPageHeaderPrimaryButton onClick={onEdit}>
            <Pencil className="size-4" aria-hidden />
            {editLabel}
          </AdminPageHeaderPrimaryButton>
        ) : null}
      </div>
    </div>
  )
}
