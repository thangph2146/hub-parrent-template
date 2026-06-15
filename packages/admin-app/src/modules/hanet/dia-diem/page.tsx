"use client"

import { MapPin } from "lucide-react"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { HANET_PARTNER_ENDPOINTS } from "@workspace/admin-app/lib/hanet-postman"
import { useHanetPlacesQuery } from "@workspace/admin-app/modules/hanet-avatars/_component/use-hanet-places-query"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import { HanetModuleShell } from "../_component/hanet-module-shell"
import { HanetPlacesTable } from "../_component/hanet-places-table"

function DiaDiemContent() {
  const { data: hanetStatus } = useHanetStatusQuery()
  const placesQuery = useHanetPlacesQuery(hanetStatus?.configured === true)
  const places = placesQuery.data ?? []
  const defaultPlaceId = hanetStatus?.defaultPlaceId

  if (!hanetStatus?.configured) {
    return (
      <FieldSet variant="section">
        <FieldSectionLegend
          title="Chưa cấu hình OAuth"
          description="Thiết lập client ID, secret và token trong .env API trước khi gọi place/getPlaces."
        />
        <FieldSetContent>
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-100">
            Cấu hình OAuth trong .env API, sau đó kiểm tra tại trang{" "}
            <strong>Kết nối</strong>.
          </p>
        </FieldSetContent>
      </FieldSet>
    )
  }

  return (
    <HanetPlacesTable
      data={places}
      isLoading={placesQuery.isLoading}
      defaultPlaceId={defaultPlaceId}
    />
  )
}

export default function HanetDiaDiemPage() {
  return (
    <HanetModuleShell
      icon={MapPin}
      title="Địa điểm"
      subtitle="POST /place/getPlaces — danh sách place gắn với app HANET."
      endpoint={HANET_PARTNER_ENDPOINTS.places}
      contentClassName="max-w-full"
    >
      <DiaDiemContent />
    </HanetModuleShell>
  )
}
