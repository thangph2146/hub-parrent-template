"use client"

import { usePathname } from "next/navigation"
import { LayoutDashboard, Shield } from "lucide-react"
import {
  CHECKIN_ADMIN_HOME_PATH,
  CHECKIN_ADMIN_LOGIN_PATH,
} from "@/config/admin/checkin-admin-access"
import { HeaderActionTile } from "@/components/shared/header-action-tile"
import { useAdminSession } from "@/components/shared/use-admin-session"

export function HeaderAdminLink({ inMenu = false }: { inMenu?: boolean }) {
  const pathname = usePathname()
  const adminUser = useAdminSession()

  if (pathname.startsWith("/admin")) return null

  const signedIn = Boolean(adminUser)
  const href = signedIn ? CHECKIN_ADMIN_HOME_PATH : CHECKIN_ADMIN_LOGIN_PATH

  return (
    <HeaderActionTile
      href={href}
      icon={signedIn ? LayoutDashboard : Shield}
      title={signedIn ? "Quản trị" : "Quản trị"}
      subtitle={signedIn ? "Đã đăng nhập" : "Nhân viên · BTC"}
      variant="staff"
      ariaLabel={
        signedIn ? "Vào bảng quản trị sự kiện" : "Đăng nhập quản trị sự kiện"
      }
      inMenu={inMenu}
      showStatusDot={signedIn}
    />
  )
}
