"use client"

import Link from "next/link"
import { ExternalLink, Loader2, XCircle } from "lucide-react"
import { Button } from "@ui/components/button"
import { getCancelRegistrationState } from "@/lib/my-registered-events"
import type { MyRegisteredEventRow } from "./types"
import { eventHref } from "./utils"

export type MyRegisteredEventRowActionHandlers = {
  onCancel: (row: MyRegisteredEventRow) => void | Promise<void>
  cancellingId?: string | null
}

export function MyRegisteredEventRowActions({
  row,
  handlers,
}: {
  row: MyRegisteredEventRow
  handlers: MyRegisteredEventRowActionHandlers
}) {
  const cancelState = getCancelRegistrationState(row)

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={eventHref(row)}>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <ExternalLink className="size-3.5" />
          Xem
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-destructive hover:text-destructive"
        disabled={!cancelState.allowed || handlers.cancellingId === row.id}
        title={!cancelState.allowed ? cancelState.reason : "Hủy đăng ký"}
        onClick={() => void handlers.onCancel(row)}
      >
        {handlers.cancellingId === row.id ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <XCircle className="size-3.5" />
        )}
        Hủy
      </Button>
    </div>
  )
}
