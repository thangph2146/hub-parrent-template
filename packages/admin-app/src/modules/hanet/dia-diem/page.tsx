"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { MapPin, Plus } from "lucide-react"
import {
  AdminPageHeaderPrimaryButton,
  AdminReadOnlyHint,
} from "@ui/components/admin"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { useAdminAuth as useAuth } from "@workspace/admin-app/runtime"
import { HANET_PAGE_ENDPOINTS } from "@workspace/admin-app/lib/hanet-postman"
import type { HanetPlaceOption } from "@workspace/admin-app/lib/hanet-place-parse"
import {
  hanetPlacesQueryKey,
  useHanetPlacesQuery,
} from "@workspace/admin-app/modules/hanet-avatars/_component/use-hanet-places-query"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import { HanetModuleShell } from "../_component/hanet-module-shell"
import { HanetPlaceDeleteDialog } from "../_component/hanet-place-delete-dialog"
import { HanetPlaceFormDialog } from "../_component/hanet-place-form-dialog"
import { HanetPlacesTable } from "../_component/hanet-places-table"

function HanetDiaDiemPageInner() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canWrite = user
    ? canUserAccess(user, PERMISSION_CODES.EVENTS_MANAGE)
    : false

  const { data: hanetStatus } = useHanetStatusQuery()
  const placesQuery = useHanetPlacesQuery(hanetStatus?.configured === true)
  const places = placesQuery.data ?? []
  const defaultPlaceId = hanetStatus?.defaultPlaceId

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activePlace, setActivePlace] = useState<HanetPlaceOption | null>(null)

  const refreshPlaces = () => {
    void queryClient.invalidateQueries({ queryKey: hanetPlacesQueryKey() })
  }

  const openCreate = () => {
    setActivePlace(null)
    setFormOpen(true)
  }

  return (
    <HanetModuleShell
      icon={MapPin}
      title="Địa điểm"
      subtitle="Quản lý place trên HANET — getPlaces, addPlace, updatePlace, removePlace."
      endpoints={HANET_PAGE_ENDPOINTS.diaDiem}
      contentClassName="max-w-full"
      readOnlyHint={
        !canWrite ? (
          <AdminReadOnlyHint>Chỉ xem — cần quyền quản lý sự kiện</AdminReadOnlyHint>
        ) : null
      }
      headerActions={
        canWrite ? (
          <AdminPageHeaderPrimaryButton onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            Thêm địa điểm
          </AdminPageHeaderPrimaryButton>
        ) : null
      }
    >
      {!hanetStatus?.configured ? (
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
      ) : (
        <>
          <HanetPlacesTable
          data={places}
          isLoading={placesQuery.isLoading}
          defaultPlaceId={defaultPlaceId}
          canWrite={canWrite}
          onEdit={
            canWrite
              ? (place) => {
                  setActivePlace(place)
                  setFormOpen(true)
                }
              : undefined
          }
          onDelete={
            canWrite
              ? (place) => {
                  setActivePlace(place)
                  setDeleteOpen(true)
                }
              : undefined
          }
        />
        </>
      )}

      <HanetPlaceFormDialog
        open={formOpen}
        place={activePlace}
        onClose={() => setFormOpen(false)}
        onSuccess={refreshPlaces}
      />

      <HanetPlaceDeleteDialog
        open={deleteOpen}
        place={activePlace}
        onClose={() => setDeleteOpen(false)}
        onSuccess={refreshPlaces}
      />
    </HanetModuleShell>
  )
}

export default function HanetDiaDiemPage() {
  return <HanetDiaDiemPageInner />
}
