"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminModulePath } from "@workspace/admin-app/runtime"

export default function HanetIndexPage() {
  const router = useRouter()
  const hanetPath = useAdminModulePath("hanet")

  useEffect(() => {
    router.replace(`${hanetPath()}/ket-noi`)
  }, [router, hanetPath])

  return null
}
