"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { TypographyH1 } from "../../typography"
import {
  ADMIN_PAGE_HEADER_ACTIONS_CLASS,
  ADMIN_PAGE_HEADER_TOOLBAR_CLASS,
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_ICON_CLASS,
  ADMIN_PAGE_TITLE_PRIMARY_CLASS,
} from "../../../lib/layout-shell"

export type AdminListPageHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  icon?: LucideIcon
  readOnlyHint?: ReactNode
  actions?: ReactNode
}

/** Header trang danh sách module (H1 + icon + mô tả + nút thêm). */
export function AdminListPageHeader({
  title,
  subtitle,
  icon: Icon,
  readOnlyHint,
  actions,
}: AdminListPageHeaderProps) {
  return (
    <div className={ADMIN_PAGE_HEADER_TOOLBAR_CLASS}>
      <div>
        <TypographyH1 className={ADMIN_PAGE_TITLE_PRIMARY_CLASS}>
          {Icon ? (
            <Icon className={ADMIN_PAGE_TITLE_ICON_CLASS} aria-hidden />
          ) : null}
          {title}
        </TypographyH1>
        {subtitle ? (
          <p className={ADMIN_PAGE_SUBTITLE_CLASS}>{subtitle}</p>
        ) : null}
        {readOnlyHint}
      </div>
      {actions ? (
        <div className={ADMIN_PAGE_HEADER_ACTIONS_CLASS}>{actions}</div>
      ) : null}
    </div>
  )
}
