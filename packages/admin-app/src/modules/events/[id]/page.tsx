"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { toast } from "@ui/components/sonner"

import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckSquare,
  FileText,
  ClipboardList,
  Mic,
  Link,
  Radio,
  Camera,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionBadge,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import { Tabs, TabsContent } from "@ui/components/tabs"
import {
  AdminListTabsList,
  AdminListTabsTrigger,
  buildEventDetailXlsxExport,
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
  AdminDetailPageHeader,
} from "@ui/components/admin"
import { AdminDataTable } from "@ui/components/data-table"
import {useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"
import {
  EventDetailContentPanel,
  useEventDetailQuery,
  useEventSpeakersQuery,
} from "../_component"
import { EventRegistrationsLiveTable } from "../_component/event-registrations-live-table"
import { EventAttendanceProvider } from "../_component/_live/event-attendance-provider"
import { EventLiveMonitorTab } from "../_component/_live/event-live-monitor-tab"
import { EventHanetConfigCard } from "../_component/_live/event-hanet-config-card"
import { getPosterUrlFromValue } from "../_component/utils"

import {
  RegistrationAvatarCell,
  resolveRegistrationAvatarUrl,
} from "../_component/registration-avatar-cell"

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
}

function EventDetailInner() {
  const crudNav = useAdminModuleNavigation("events")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.EVENTS_UPDATE)
    : false
  const { data: entity, isLoading, isError } = useEventDetailQuery(api, id)
  const { data: speakers, isLoading: loadingSpeakers } = useEventSpeakersQuery(
    api,
    id
  )

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được sự kiện")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!entity) return null

  const posterUrl = getPosterUrlFromValue(entity.poster)

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title="Chi tiết sự kiện"
        subtitle="Quản lý sự kiện check-in."
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(id)) : undefined}
      />

      <Tabs defaultValue="info" className="my-6">
        <AdminListTabsList fullWidth>
          <AdminListTabsTrigger value="info" stretch>
            <FileText className="size-3.5" /> Thông tin sự kiện
          </AdminListTabsTrigger>
          <AdminListTabsTrigger value="live" stretch>
            <Radio className="size-3.5" /> Theo dõi realtime
          </AdminListTabsTrigger>
          <AdminListTabsTrigger value="lists" stretch>
            <ClipboardList className="size-3.5" /> Danh sách
          </AdminListTabsTrigger>
        </AdminListTabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EventDetailContentPanel
                content={entity.content}
                description={entity.description}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-2 flex max-h-[calc(100vh-6rem)] flex-col gap-4 overflow-y-auto">
                <EventHanetConfigCard
                  eventId={id}
                  cameras={{
                    checkinCameraName: entity.checkinCameraName ?? null,
                    checkinCameraCode: entity.checkinCameraCode ?? null,
                    checkoutCameraName: entity.checkoutCameraName ?? null,
                    checkoutCameraCode: entity.checkoutCameraCode ?? null,
                  }}
                />

                <FieldSet variant="section">
                  <FieldSectionLegend
                    icon={Calendar}
                    title="Thông tin sự kiện"
                  />
                  <FieldSetContent variant="section" className="space-y-4 pt-0">
                    {posterUrl ? (
                      <div className="overflow-hidden rounded-lg border border-border/70">
                        <img
                          src={posterUrl}
                          alt={entity.title}
                          className="aspect-[16/10] w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <FieldSectionField label="Tiêu đề" icon={FileText}>
                      <p className="whitespace-pre-wrap">{entity.title}</p>
                    </FieldSectionField>
                    <FieldSectionField label="Slug" icon={Link}>
                      <p className="text-muted-foreground">{entity.slug}</p>
                    </FieldSectionField>
                  </FieldSetContent>
                </FieldSet>

                <FieldSet variant="section">
                  <FieldSectionLegend
                    icon={MapPin}
                    title="Thời gian & Địa điểm"
                  />
                  <FieldSetContent variant="section" className="space-y-4 pt-0">
                    {entity.description ? (
                      <FieldSectionField label="Mô tả">
                        <p className="whitespace-pre-wrap">
                          {entity.description}
                        </p>
                      </FieldSectionField>
                    ) : null}
                    <FieldSectionField label="Bắt đầu" icon={Calendar}>
                      {formatDateTime(entity.startDate)}
                    </FieldSectionField>
                    <FieldSectionField label="Kết thúc" icon={Clock}>
                      {formatDateTime(entity.endDate)}
                    </FieldSectionField>
                    <FieldSectionField label="Đơn vị tổ chức" icon={Building2}>
                      {entity.organizer || "—"}
                    </FieldSectionField>
                    <FieldSectionField label="Địa điểm" icon={MapPin}>
                      {entity.location || "—"}
                    </FieldSectionField>
                    <FieldSectionField label="Địa chỉ">
                      {entity.address || "—"}
                    </FieldSectionField>
                  </FieldSetContent>
                </FieldSet>

                <FieldSet variant="section">
                  <FieldSectionLegend icon={Clock} title="Check-in & Đăng ký" />
                  <FieldSetContent variant="section" className="space-y-3 pt-0">
                    <FieldSectionField label="Check-in từ" icon={Clock}>
                      {formatDateTime(entity.checkinStart)}
                    </FieldSectionField>
                    <FieldSectionField label="Check-in đến">
                      {formatDateTime(entity.checkinEnd)}
                    </FieldSectionField>
                    <FieldSectionField label="Check-out từ" icon={Clock}>
                      {formatDateTime(entity.checkoutStart)}
                    </FieldSectionField>
                    <FieldSectionField label="Check-out đến">
                      {formatDateTime(entity.checkoutEnd)}
                    </FieldSectionField>
                    <FieldSectionField label="Đăng ký từ">
                      {formatDateTime(entity.registrationStart)}
                    </FieldSectionField>
                    <FieldSectionField label="Đăng ký đến">
                      {formatDateTime(entity.registrationEnd)}
                    </FieldSectionField>
                  </FieldSetContent>
                </FieldSet>

                <FieldSet variant="section">
                  <FieldSectionLegend title="Hình thức & Trạng thái" />
                  <FieldSetContent variant="section" className="pt-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant={
                          entity.format === 1
                            ? "secondary"
                            : entity.format === 2
                              ? "outline"
                              : "default"
                        }
                      >
                        {entity.format === 1
                          ? "Online"
                          : entity.format === 2
                            ? "Hybrid"
                            : "Offline"}
                      </Badge>
                      {entity.status === 1 ? (
                        <Badge variant="default">Hoạt động</Badge>
                      ) : (
                        <Badge variant="outline">Khóa</Badge>
                      )}
                    </div>
                  </FieldSetContent>
                </FieldSet>

                <FieldSet variant="section">
                  <FieldSectionLegend
                    icon={Mic}
                    title="Diễn giả"
                    badge={
                      speakers?.length ? (
                        <FieldSectionBadge>{speakers.length}</FieldSectionBadge>
                      ) : undefined
                    }
                  />
                  <FieldSetContent variant="section" className="pt-0">
                    {loadingSpeakers ? (
                      <p className="text-sm text-muted-foreground">
                        Đang tải...
                      </p>
                    ) : !speakers?.length ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có diễn giả.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {speakers.map((s) => (
                          <div
                            key={s.id as string}
                            className="flex items-center gap-3 rounded-lg border border-border/70 p-3"
                          >
                            <RegistrationAvatarCell row={s} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {(s.speakerName as string) || "—"}
                              </p>
                              {(s.speakerTitle as string) && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {s.speakerTitle as string}
                                </p>
                              )}
                            </div>
                            {(s.role as string) && (
                              <Badge variant="secondary" className="shrink-0">
                                {s.role as string}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldSetContent>
                </FieldSet>

                <FieldSet variant="section">
                  <FieldSectionLegend title="Thống kê" />
                  <FieldSetContent variant="section" className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/30 p-3 text-center">
                        <p className="text-2xl font-bold text-primary">
                          {entity.totalRegistrations}
                        </p>
                        <p className="text-xs text-muted-foreground">Đăng ký</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {entity.totalCheckins}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Check-in
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3 text-center">
                        <p className="text-2xl font-bold text-amber-600">
                          {entity.totalCheckouts}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Check-out
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3 text-center">
                        <p className="text-2xl font-bold text-muted-foreground">
                          {entity.maxParticipants || "∞"}
                        </p>
                        <p className="text-xs text-muted-foreground">Tối đa</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckSquare className="size-4" />
                        {entity.allowCheckin
                          ? "Cho phép check-in"
                          : "Không check-in"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckSquare className="size-4" />
                        {entity.allowCheckout
                          ? "Cho phép check-out"
                          : "Không check-out"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckSquare className="size-4" />
                        {entity.requireFaceId
                          ? "Yêu cầu Face ID"
                          : "Không yêu cầu Face ID"}
                      </div>
                      {(entity.checkinCameraName ||
                        entity.checkoutCameraName) && (
                        <div className="flex items-start gap-2 pt-1 text-sm">
                          <Camera className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <p>
                              <span className="text-muted-foreground">
                                Check-in:{" "}
                              </span>
                              {entity.checkinCameraName ?? "—"}
                              {entity.checkinCameraCode ? (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {" "}
                                  ({entity.checkinCameraCode})
                                </span>
                              ) : null}
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Check-out:{" "}
                              </span>
                              {entity.checkoutCameraName ?? "—"}
                              {entity.checkoutCameraCode ? (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {" "}
                                  ({entity.checkoutCameraCode})
                                </span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </FieldSetContent>
                </FieldSet>

                <FieldSet variant="section">
                  <FieldSectionLegend
                    icon={Clock}
                    title="Thời gian"
                    description="Mốc tạo và cập nhật sự kiện."
                  />
                  <FieldSetContent variant="section" className="space-y-3 pt-0">
                    <FieldSectionField
                      label="Ngày tạo"
                      icon={Calendar}
                      valueClassName="font-medium"
                    >
                      {formatDateTime(entity.createdAt)}
                    </FieldSectionField>
                    <FieldSectionField
                      label="Cập nhật lần cuối"
                      icon={Clock}
                      valueClassName="font-medium"
                    >
                      {formatDateTime(entity.updatedAt)}
                    </FieldSectionField>
                  </FieldSetContent>
                </FieldSet>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          <EventLiveMonitorTab
            eventId={id}
            eventTitle={entity.title}
            initialStats={{
              totalRegistrations: entity.totalRegistrations,
              totalCheckins: entity.totalCheckins,
              totalCheckouts: entity.totalCheckouts,
            }}
          />
        </TabsContent>

        <TabsContent value="lists" className="mt-6">
          <Tabs defaultValue="registrations">
            <AdminListTabsList fullWidth className="max-w-md grid grid-cols-2">
              <AdminListTabsTrigger value="registrations" stretch>
                <ClipboardList className="size-3.5" /> Danh sách đăng ký
              </AdminListTabsTrigger>
              <AdminListTabsTrigger value="speakers" stretch>
                <Mic className="size-3.5" /> Diễn giả
              </AdminListTabsTrigger>
            </AdminListTabsList>
            <TabsContent value="registrations" className="mt-4">
              <EventRegistrationsLiveTable
                eventId={id}
                eventTitle={entity.title}
              />
            </TabsContent>
            <TabsContent value="speakers" className="mt-4">
              <SpeakersTab eventId={id} eventTitle={entity.title} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </AdminPageSection>
  )
}

function EventDetailWithAttendance() {
  const params = useParams()
  const eventId = params.id as string
  if (!eventId) return null
  return (
    <EventAttendanceProvider eventId={eventId}>
      <EventDetailInner />
    </EventAttendanceProvider>
  )
}

type Dict = Record<string, unknown>

function SpeakersTab({
  eventId,
  eventTitle,
}: {
  eventId: string
  eventTitle: string
}) {
  const { data: speakers, isLoading } = useEventSpeakersQuery(api, eventId)
  const rows = speakers ?? []
  const columns = useMemo<ColumnDef<Dict>[]>(
    () => [
      {
        id: "avatar",
        header: "Avatar",
        enableColumnFilter: false,
        size: 56,
        meta: {
          exportHeader: "Avatar",
          exportValue: (row) => resolveRegistrationAvatarUrl(row) || "",
          exportWidth: 36,
        },
        cell: ({ row }) => <RegistrationAvatarCell row={row.original} />,
      },
      {
        accessorKey: "speakerName",
        header: "Diễn giả",
        enableColumnFilter: false,
        cell: ({ getValue }) => (getValue() as string) || "—",
      },
      {
        accessorKey: "speakerTitle",
        header: "Chức danh",
        enableColumnFilter: false,
        cell: ({ getValue }) => (getValue() as string) || "—",
      },
      {
        accessorKey: "role",
        header: "Vai trò",
        enableColumnFilter: false,
        cell: ({ getValue }) => (getValue() as string) || "—",
      },
      {
        accessorKey: "presentationTitle",
        header: "Chủ đề",
        enableColumnFilter: false,
        cell: ({ getValue }) => (getValue() as string) || "—",
      },
      {
        accessorKey: "duration",
        header: "Thời lượng",
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const v = getValue() as number | null
          return v ? `${v} phút` : "—"
        },
      },
    ],
    []
  )
  return (
    <AdminDataTable<Dict>
      data={rows}
      columns={columns}
      getRowId={(row) => String(row.id ?? "")}
      isLoading={isLoading}
      emptyLabel="Chưa có diễn giả nào."
      globalFilterPlaceholder="Tìm theo tên, vai trò, chủ đề…"
      getGlobalFilterText={(row) =>
        [row.speakerName, row.speakerTitle, row.role, row.presentationTitle]
          .filter(Boolean)
          .join(" ")
      }
      xlsxExport={buildEventDetailXlsxExport("speakers", {
        eventId,
        eventTitle,
        pageCount: rows.length,
        total: rows.length,
      })}
    />
  )
}

export default function EventDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EventDetailWithAttendance />
    </AdminPageGuard>
  )
}
