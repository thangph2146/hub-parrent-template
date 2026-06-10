"use client"

import { usePathname } from "next/navigation"
import { LayoutDashboard, Shield } from "lucide-react"
import {
  CHECKIN_ADMIN_HOME_PATH,
  CHECKIN_ADMIN_LOGIN_PATH,
} from "@/config/admin/checkin-admin-access"
import {
  ADMIN_SESSION_EVENT,
  ADMIN_SESSION_KEY,
  readAdminSession,
} from "@/lib/admin/auth-session"
import { useSyncExternalStore } from "react"
import { HeaderActionTile } from "@/components/shared/header-action-tile"

function subscribeAdminSession(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === ADMIN_SESSION_KEY) callback()
  }
  const onCustom = () => callback()
  window.addEventListener("storage", onStorage)
  window.addEventListener(ADMIN_SESSION_EVENT, onCustom)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(ADMIN_SESSION_EVENT, onCustom)
  }
}

export function HeaderAdminLink({ inMenu = false }: { inMenu?: boolean }) {
  const pathname = usePathname()
  const adminUser = useSyncExternalStore(
    subscribeAdminSession,
    readAdminSession,
    () => null,
  )

  if (pathname.startsWith("/admin-checkin-su-kien")) return null

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
