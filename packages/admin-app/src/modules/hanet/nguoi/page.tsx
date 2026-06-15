"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { api } from "@workspace/admin-app/lib/api"
import { readHanetAdminPlaceId } from "@workspace/admin-app/lib/hanet-place-storage"
import { HANET_PARTNER_ENDPOINTS } from "@workspace/admin-app/lib/hanet-postman"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet-avatars/_component/hanet-place-select"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import { HanetModuleShell } from "../_component/hanet-module-shell"
import { HanetPersonsTable } from "../_component/hanet-persons-table"

const DEFAULT_PAGE_SIZE = 50

function NguoiContent() {
  const { data: hanetStatus } = useHanetStatusQuery()
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const effectivePlaceId =
    selectedPlaceId || hanetStatus?.defaultPlaceId || ""

  const personsQuery = useQuery({
    queryKey: ["hanet", "persons", effectivePlaceId, pageIndex, pageSize],
    queryFn: () =>
      api.hanet.listPersons({
        placeId: effectivePlaceId || undefined,
        pageIndex,
        pageSize,
      }),
    enabled: hanetStatus?.configured === true && Boolean(effectivePlaceId),
  })

  const items = personsQuery.data?.items ?? []

  if (!hanetStatus?.configured) {
    return (
      <FieldSet variant="section">
        <FieldSectionLegend
          title="Chưa cấu hình OAuth"
          description="Thiết lập client ID, secret và token trong .env API trước khi gọi person/getListByPlace."
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
    <HanetPersonsTable
      data={items}
      isLoading={personsQuery.isLoading}
      emptyLabel={
        effectivePlaceId
          ? "Không có person cho địa điểm này."
          : "Chọn địa điểm HANET để tải danh sách người."
      }
      pageIndex={pageIndex}
      pageSize={pageSize}
      total={personsQuery.data?.total}
      onPageIndexChange={setPageIndex}
      onPageSizeChange={(size) => {
        setPageSize(size)
        setPageIndex(0)
      }}
      filterToolbarExtra={
        <HanetPlaceSelect
          layout="stacked"
          value={selectedPlaceId}
          onChange={(id) => {
            setSelectedPlaceId(id)
            setPageIndex(0)
          }}
          defaultPlaceId={hanetStatus.defaultPlaceId}
        />
      }
    />
  )
}

export default function HanetNguoiPage() {
  return (
    <HanetModuleShell
      icon={Users}
      title="Người đăng ký"
      subtitle="Danh sách person theo địa điểm HANET."
      endpoint={HANET_PARTNER_ENDPOINTS.persons}
      endpointExtra="?placeId=&pageIndex=&pageSize="
      contentClassName="max-w-full"
    >
      <NguoiContent />
    </HanetModuleShell>
  )
}
