import type { Metadata } from "next"

export type CreateAdminMetadataOptions = {
  titleDefault?: string
  titleTemplate?: string
  description?: string
}

const DEFAULT_DESCRIPTION =
  "Cổng quản trị nội bộ — quản lý nội dung, tài khoản, phân quyền và vận hành hệ thống."

/** Metadata chuẩn cho app admin (noindex). */
export function createAdminMetadata(
  options: CreateAdminMetadataOptions = {},
): Metadata {
  return {
    title: {
      template: options.titleTemplate ?? "%s | Quản trị HUB",
      default: options.titleDefault ?? "Quản trị HUB",
    },
    description: options.description ?? DEFAULT_DESCRIPTION,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  }
}
