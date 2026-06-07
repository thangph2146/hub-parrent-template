"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@ui/components/button"
import { TypographyH1 } from "@ui/components/typography"
import { useAdminLayout } from "@ui/components/admin"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { siteName, siteDescription } = useAdminLayout()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="flex size-14 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
        <AlertTriangle className="size-7" aria-hidden />
      </div>
      <div className="max-w-md space-y-2 text-center">
        <TypographyH1 className="text-xl font-semibold tracking-tight">
          {siteName ? `${siteName} — Lỗi` : "Đã xảy ra lỗi"}
        </TypographyH1>
        <p className="text-sm text-muted-foreground">
          {siteDescription ||
            "Không thể tải nội dung trang. Vui lòng thử lại hoặc quay về trang chủ."}
        </p>
      </div>
      <Button type="button" variant="outline" onClick={() => reset()}>
        <RotateCcw className="size-4" aria-hidden />
        Thử lại
      </Button>
    </div>
  )
}
