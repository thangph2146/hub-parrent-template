"use client"

import { useState } from "react"
import { List, Search, Trash2, UserPlus, Users } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@ui/components/button"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { Tabs, TabsContent } from "@ui/components/tabs"
import { AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { api } from "@workspace/admin-app/lib/api"
import type { HanetPersonActionId } from "@workspace/admin-app/lib/hanet-person-api-actions"
import { readHanetAdminPlaceId } from "@workspace/admin-app/lib/hanet-place-storage"
import { HANET_PAGE_ENDPOINTS } from "@workspace/admin-app/lib/hanet-postman"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet-avatars/_component/hanet-place-select"
import { useHanetStatusQuery } from "@workspace/admin-app/modules/events/_component/_query"
import { HanetModuleShell } from "../_component/hanet-module-shell"
import { HanetPersonActionDialog } from "../_component/hanet-person-action-dialog"
import { HanetPersonLookupPanel } from "../_component/hanet-person-lookup-panel"
import { HanetPersonsTable } from "../_component/hanet-persons-table"
import type { HanetPersonRow } from "../_component/hanet-persons-table"
import { HanetRegisterFaceDialog } from "../_component/hanet-register-face-dialog"

const DEFAULT_PAGE_SIZE = 50

function NguoiContent() {
  const queryClient = useQueryClient()
  const { data: hanetStatus } = useHanetStatusQuery()
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [registerByUrlOpen, setRegisterByUrlOpen] = useState(false)
  const [personActionId, setPersonActionId] =
    useState<HanetPersonActionId | null>(null)
  const [personActionRow, setPersonActionRow] = useState<HanetPersonRow | null>(
    null,
  )

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

  const invalidatePersons = () => {
    void queryClient.invalidateQueries({ queryKey: ["hanet", "persons"] })
  }

  const openPersonAction = (
    actionId: HanetPersonActionId,
    person: HanetPersonRow | null = null,
  ) => {
    setPersonActionId(actionId)
    setPersonActionRow(person)
  }

  const closePersonAction = () => {
    setPersonActionId(null)
    setPersonActionRow(null)
  }

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

  const items = personsQuery.data?.items ?? []

  return (
    <div className="space-y-4">
      <Tabs defaultValue="list" className="space-y-3">
        <AdminListTabsList fullWidth className="max-w-md grid grid-cols-2">
          <AdminListTabsTrigger value="list" stretch>
            <List className="size-3.5 shrink-0" />
            Danh sách
          </AdminListTabsTrigger>
          <AdminListTabsTrigger value="lookup" stretch>
            <Search className="size-3.5 shrink-0" />
            Tra cứu
          </AdminListTabsTrigger>
        </AdminListTabsList>

        <TabsContent value="list" className="mt-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              disabled={!effectivePlaceId}
              onClick={() => openPersonAction("register")}
            >
              <UserPlus className="size-3.5" />
              register
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              disabled={!effectivePlaceId}
              onClick={() => setRegisterByUrlOpen(true)}
            >
              <UserPlus className="size-3.5" />
              registerByUrl
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              disabled={!effectivePlaceId}
              onClick={() => openPersonAction("remove-by-alias-ids")}
            >
              <Trash2 className="size-3.5" />
              Xóa theo aliasIDs
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 gap-1.5"
              disabled={!effectivePlaceId}
              onClick={() => openPersonAction("remove-all-in-place")}
            >
              <Trash2 className="size-3.5" />
              Xóa toàn bộ place
            </Button>
          </div>

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
            hanetTotal={personsQuery.data?.hanetTotal}
            listLimited={personsQuery.data?.listLimited}
            onPageIndexChange={setPageIndex}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPageIndex(0)
            }}
            onPersonAction={(actionId, person) =>
              openPersonAction(actionId, person)
            }
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
        </TabsContent>

        <TabsContent value="lookup" className="mt-0">
          <HanetPersonLookupPanel
            placeId={effectivePlaceId}
            selectedPlaceId={selectedPlaceId}
            onPlaceChange={setSelectedPlaceId}
            defaultPlaceId={hanetStatus.defaultPlaceId}
          />
        </TabsContent>
      </Tabs>

      <HanetPersonActionDialog
        open={personActionId != null}
        actionId={personActionId}
        placeId={effectivePlaceId}
        person={personActionRow}
        onClose={closePersonAction}
        onSuccess={invalidatePersons}
      />

      <HanetRegisterFaceDialog
        open={registerByUrlOpen}
        placeId={effectivePlaceId}
        onClose={() => setRegisterByUrlOpen(false)}
        onSuccess={invalidatePersons}
      />
    </div>
  )
}

export default function HanetNguoiPage() {
  return (
    <HanetModuleShell
      icon={Users}
      title="Người đăng ký"
      subtitle="getListByPlace · đủ 16 Person API Partner (đăng ký, tra cứu, cập nhật, xóa)."
      endpoints={HANET_PAGE_ENDPOINTS.nguoi}
      contentClassName="max-w-full"
    >
      <NguoiContent />
    </HanetModuleShell>
  )
}
