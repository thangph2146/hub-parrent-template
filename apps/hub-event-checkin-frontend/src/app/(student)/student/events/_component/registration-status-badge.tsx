"use client"

import { Badge } from "@ui/components/badge"
import { MY_REGISTRATION_STATUS, type MyRegisteredEvent } from "@/lib/my-registered-events"

export function RegistrationStatusBadge({ row }: { row: MyRegisteredEvent }) {
  if (row.status === MY_REGISTRATION_STATUS.CANCELLED) {
    return <Badge variant="outline">Đã hủy</Badge>
  }
  if (row.hasCheckin) {
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-600">
        Đã check-in
      </Badge>
    )
  }
  if (row.status === MY_REGISTRATION_STATUS.CONFIRMED) {
    return (
      <Badge className="bg-primary text-primary-foreground hover:bg-primary">
        Đã xác nhận
      </Badge>
    )
  }
  return <Badge variant="secondary">Chờ xử lý</Badge>
}
