"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, RefreshCw, UserPlus } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@ui/components/button"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useAdminApi } from "@workspace/admin-app/runtime"
import type { HanetFaceActionId } from "../shared/hanet-face-actions"
import type { HanetSyncAvatarsResult } from "@workspace/api-client"
import { readHanetAdminPlaceId } from "../shared/hanet-place-storage"
import { useHanetStatusQuery } from "../queries"
import { HanetPlaceSelect } from "../shared/hanet-place-select"
import { HanetFaceActionDialog } from "../persons/hanet-face-action-dialog"
import { HanetRegisterFaceDialog } from "../persons/hanet-register-face-dialog"
import { HanetPersonsTable } from "../persons/hanet-persons-table"
import type { HanetPersonRow } from "../persons/hanet-persons-table"

const DEFAULT_PAGE_SIZE = 50

export function HanetAvatarsTab() {
  const api = useAdminApi()
  const queryClient = useQueryClient()
  const { data: hanetStatus } = useHanetStatusQuery()
  const [selectedPlaceId, setSelectedPlaceId] = useState(readHanetAdminPlaceId)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [faceActionId, setFaceActionId] = useState<HanetFaceActionId | null>(
    null,
  )
  const [facePerson, setFacePerson] = useState<HanetPersonRow | null>(null)

  const effectivePlaceId =
    selectedPlaceId || hanetStatus?.defaultPlaceId || ""

  const personsQuery = useQuery({
    queryKey: [
      "hanet",
      "persons",
      effectivePlaceId,
      pageIndex,
      pageSize,
    ],
    queryFn: () =>
      api.hanet.listPersons({
        placeId: effectivePlaceId || undefined,
        pageIndex,
        pageSize,
      }),
    enabled: hanetStatus?.configured === true && Boolean(effectivePlaceId),
  })

  const syncMutation = useAdminMutation({
    mutationKey: ["hanet", "avatars", "sync"],
    mutationFn: () =>
      api.hanet.syncPersonAvatars(effectivePlaceId || undefined),
    toast: {
      loading: "Đang đồng bộ avatar từ HANET vào face_data…",
      success: (res: HanetSyncAvatarsResult) =>
        res.listLimited && res.hanetTotal != null
          ? `Đã đồng bộ ${res.fetched} người (HANET có ${res.hanetTotal} — API chỉ trả ~${res.hanetListCap ?? 50}/lần)`
          : `Đã đồng bộ ${res.fetched} người (${res.created} mới, ${res.updated} cập nhật)`,
      error: (err) =>
        err instanceof Error ? err.message : "Không đồng bộ được avatar HANET",
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hanet", "avatars"] })
      void queryClient.invalidateQueries({ queryKey: ["hanet", "persons"] })
    },
  })

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
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          {personsQuery.data?.listLimited &&
          personsQuery.data.hanetTotal != null ? (
            <>
              HANET báo{" "}
              <span className="font-medium text-foreground">
                {personsQuery.data.hanetTotal}
              </span>{" "}
              người · hiển thị được{" "}
              <span className="font-medium text-foreground">
                {personsQuery.data.total}
              </span>
            </>
          ) : (
            <>
              Tổng{" "}
              <span className="font-medium text-foreground">
                {personsQuery.data?.total ?? "—"}
              </span>{" "}
              người
            </>
          )}
          {personsQuery.data?.syncedTotal != null &&
          personsQuery.data.syncedTotal > 0 ? (
            <>
              {" "}
              · đã sync local{" "}
              <span className="font-medium text-foreground">
                {personsQuery.data.syncedTotal}
              </span>
            </>
          ) : null}
          {items.length > 0 ? (
            <>
              {" "}
              · trang {pageIndex + 1} hiển thị {items.length} dòng
            </>
          ) : null}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={!effectivePlaceId}
          onClick={() => setRegisterOpen(true)}
        >
          <UserPlus className="size-4" />
          registerByUrl
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5"
          disabled={syncMutation.isPending || !effectivePlaceId}
          onClick={() => syncMutation.mutate()}
        >
          {syncMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Đồng bộ vào face_data
        </Button>
        <Link
          href="https://developers.hanet.ai/document"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Tài liệu HANET
        </Link>
      </div>

      {personsQuery.data?.listLimited ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Partner API <code className="text-xs">person/getListByPlace</code> chỉ
          trả tối đa ~{personsQuery.data.hanetListCap ?? 50} người mỗi lần gọi
          (mọi <code className="text-xs">pageIndex</code> đều trùng danh sách).
          Hub không thể kéo đủ{" "}
          {personsQuery.data.hanetTotal ?? "tổng HANET"} người qua API này — cần
          gói cloud HANET hoặc tích lũy qua webhook Face Data. Đã lưu local:{" "}
          {personsQuery.data.syncedTotal ?? 0} bản ghi.
        </p>
      ) : null}

      {hanetStatus.configured && !effectivePlaceId ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Chọn địa điểm HANET bên dưới để tải danh sách avatar.
        </p>
      ) : null}

      <HanetPersonsTable
        data={items}
        isLoading={personsQuery.isLoading}
        emptyLabel={
          effectivePlaceId
            ? pageIndex > 0 && items.length === 0
              ? "Trang này chưa có dữ liệu — bấm «Đồng bộ vào face_data» để kéo thêm từ HANET (API HANET hiện chỉ trả ~50 người/lần)."
              : "Không có person cho địa điểm này."
            : "Chọn địa điểm HANET để tải danh sách avatar."
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
        onFaceAction={(actionId, person) => {
          setFaceActionId(actionId)
          setFacePerson(person)
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
            disabled={syncMutation.isPending}
          />
        }
      />

      <HanetRegisterFaceDialog
        open={registerOpen}
        placeId={effectivePlaceId}
        onClose={() => setRegisterOpen(false)}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["hanet", "persons"] })
          void queryClient.invalidateQueries({ queryKey: ["hanet", "avatars"] })
        }}
      />

      <HanetFaceActionDialog
        open={faceActionId != null}
        actionId={faceActionId}
        placeId={effectivePlaceId}
        person={facePerson}
        onClose={() => {
          setFaceActionId(null)
          setFacePerson(null)
        }}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["hanet", "persons"] })
          void queryClient.invalidateQueries({ queryKey: ["hanet", "avatars"] })
        }}
      />
    </div>
  )
}
