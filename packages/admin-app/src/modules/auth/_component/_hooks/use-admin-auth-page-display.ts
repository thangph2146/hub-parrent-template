"use client"

import { useAdminLayout } from "@ui/components/admin"

/** Dữ liệu hiển thị trang đăng nhập/đăng ký — lấy từ settings public branding + SEO. */
export function useAdminAuthPageDisplay() {
  const {
    siteName,
    siteDescription,
    authHeroImage,
    brandingReady,
  } = useAdminLayout()

  return {
    siteName: brandingReady ? siteName : "",
    siteDescription: brandingReady ? siteDescription : "",
    heroImageSrc: brandingReady ? authHeroImage : null,
    isReady: brandingReady,
  }
}
