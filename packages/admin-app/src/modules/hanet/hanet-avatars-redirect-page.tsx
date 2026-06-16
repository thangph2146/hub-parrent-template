"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminModulePath } from "@workspace/admin-app/runtime"

/** Giữ URL cũ `/hanet-avatars` → tab Avatar trên trang HANET. */
export default function HanetAvatarsRedirectPage() {
  const router = useRouter()
  const hanetPath = useAdminModulePath("hanet")

  useEffect(() => {
    router.replace(`${hanetPath()}/avatar`)
  }, [router, hanetPath])

  return null
}
