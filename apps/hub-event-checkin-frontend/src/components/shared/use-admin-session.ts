"use client"

import { useSyncExternalStore } from "react"
import {
  ADMIN_SESSION_EVENT,
  ADMIN_SESSION_KEY,
  readAdminSession,
} from "@/lib/admin/auth-session"

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

export function useAdminSession() {
  return useSyncExternalStore(
    subscribeAdminSession,
    readAdminSession,
    () => null,
  )
}
