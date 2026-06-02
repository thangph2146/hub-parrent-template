"use client"

import { useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

const LexicalEditor = dynamic(
  () =>
    import("@thangph2146/lexical-editor").then((mod) => ({
      default: mod.LexicalEditor,
    })),
  { ssr: false },
)
import {
  Loader2,
  ArrowLeft,
  Pencil,
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckSquare,
  FileText,
  ClipboardList,
  Mic,
  Link,
  ImageIcon,
  Radio,
  Camera,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Divider, PageSection } from "@ui/components/layout"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import { AdminDataTable } from "@ui/components/data-table"
import { buildEventDetailXlsxExport, AdminPageSection, AdminPageLoading, AdminDetailPageHeader, AdminDetailLayout, AdminDetailMain, AdminDetailSidebar } from "@ui/components/admin"
import { AdminPageGuard } from "@ui/components/admin"
import { useAuth } from "@/providers/auth-provider"
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"
import { api } from "@/lib/api"
import {
  useEventDetailQuery,
  useEventSpeakersQuery,
} from "../_component"
import { EventRegistrationsLiveTable } from "../_component/event-registrations-live-table"
import { EventAttendanceProvider } from "../_component/_live/event-attendance-provider"
import { EventLiveMonitorTab } from "../_component/_live/event-live-monitor-tab"
import { getPosterUrlFromValue } from "../_component/utils"
import { TypographyH1 } from "@ui/components/typography"
import {
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_PRIMARY_CLASS,
} from "@ui/lib/layout-shell"
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
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.EVENTS_UPDATE)
    : false
  const { data: entity, isLoading, isError } = useEventDetailQuery(api, id)
  const { data: speakers, isLoading: loadingSpeakers } = useEventSpeakersQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được sự kiện")
      router.push("/events")
    }
  }, [isError, router])

  if (isLoading)
    return (
      <AdminPageLoading />
    )
  if (!entity) return null

  const posterUrl = getPosterUrlFromValue(entity.poster)

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title="Chi tiết sự kiện"
        subtitle="Quản lý sự kiện check-in."
        variant="module"
        onBack={() => router.push("/events")}
        onEdit={
          canUpdate ? () => router.push(`/events/${id}/edit`) : undefined
        }
      />

      <Tabs defaultValue="info" className="my-6">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1 gap-1.5">
            <FileText className="size-4" /> Thông tin sự kiện
          </TabsTrigger>
          <TabsTrigger value="live" className="flex-1 gap-1.5">
            <Radio className="size-4" /> Theo dõi realtime
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex-1 gap-1.5">
            <ClipboardList className="size-4" /> Danh sách
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {entity.content ? (
                <Card className="border border-border/70 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="size-5 text-primary" /> Nội dung chi tiết
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LexicalEditor
                      value={entity.content}
                      readOnly
                      className="max-w-full"
                    />
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="space-y-6 lg:col-span-1">
              <Card className="sticky top-2 max-h-[calc(100vh-6rem)] overflow-y-auto border border-border/70 shadow-sm">
                <CardContent className="space-y-0">
                  <Divider label="Thông tin sự kiện" className="my-6" />
                  {posterUrl ? (
                    <div className="mb-4 overflow-hidden rounded-lg border border-border/70">
                      <p className="flex items-center gap-1.5 border-b border-border/70 bg-muted/30 px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <ImageIcon className="size-3" /> Hình đại diện
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={posterUrl}
                        alt={entity.title}
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="grid gap-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <FileText className="size-3" /> Tiêu đề
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-wrap text-foreground border border-border/70 rounded-lg p-2">
                        {entity.title}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <Link className="size-3" /> Slug
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground border border-border/70 rounded-lg p-2">
                        {entity.slug}
                      </p>
                    </div>
                  </div>
                  <Divider label="Thời gian & Địa điểm" className="my-6" />
                  {entity.description && (
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Mô tả
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-wrap text-foreground border border-border/70 rounded-lg p-2">
                        {entity.description}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 grid gap-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <Calendar className="size-3" /> Bắt đầu
                      </p>
                      <p className="mt-1 text-sm text-foreground border border-border/70 rounded-lg p-2">
                        {formatDateTime(entity.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <Clock className="size-3" /> Kết thúc
                      </p>
                      <p className="mt-1 text-sm text-foreground border border-border/70 rounded-lg p-2">
                        {formatDateTime(entity.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      <Building2 className="size-3" /> Đơn vị tổ chức
                    </p>
                    <p className="mt-1 text-sm text-foreground border border-border/70 rounded-lg p-2">
                      {entity.organizer || "—"}
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      <MapPin className="size-3" /> Địa điểm
                    </p>
                    <p className="mt-1 text-sm text-foreground border border-border/70 rounded-lg p-2">
                      {entity.location || "—"}
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Địa chỉ
                    </p>
                    <p className="mt-1 text-sm text-foreground border border-border/70 rounded-lg p-2">
                      {entity.address || "—"}
                    </p>
                  </div>

                  <Divider label="Check-in & Đăng ký" className="my-6" />

                  <div className="space-y-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <Clock className="size-3" /> Check-in từ
                      </p>
                      <p className="mt-0.5 text-sm border border-border/70 rounded-lg p-2">
                        {formatDateTime(entity.checkinStart)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Check-in đến
                      </p>
                      <p className="mt-0.5 text-sm border border-border/70 rounded-lg p-2">
                        {formatDateTime(entity.checkinEnd)}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <Clock className="size-3" /> Check-out từ
                      </p>
                      <p className="mt-0.5 text-sm border border-border/70 rounded-lg p-2">
                        {formatDateTime(entity.checkoutStart)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Check-out đến
                      </p>
                      <p className="mt-0.5 text-sm border border-border/70 rounded-lg p-2">
                        {formatDateTime(entity.checkoutEnd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Đăng ký từ
                      </p>
                      <p className="mt-0.5 text-sm border border-border/70 rounded-lg p-2">
                        {formatDateTime(entity.registrationStart)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Đăng ký đến
                      </p>
                      <p className="mt-0.5 text-sm border border-border/70 rounded-lg p-2">
                        {formatDateTime(entity.registrationEnd)}
                      </p>
                    </div>
                  </div>

                  <Divider label="Hình thức & Trạng thái" className="my-6" />

                  <div className="flex flex-wrap items-center gap-3">
                    <div>
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
                    </div>
                    <div>
                      {entity.status === 1 ? (
                        <Badge variant="default">Hoạt động</Badge>
                      ) : (
                        <Badge variant="outline">Khóa</Badge>
                      )}
                    </div>
                  </div>

                  <Divider label="Diễn giả" className="my-6" />

                  <div>
                    {loadingSpeakers ? (
                      <p className="text-sm text-muted-foreground">Đang tải...</p>
                    ) : !speakers?.length ? (
                      <p className="text-sm text-muted-foreground">Chưa có diễn giả.</p>
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
                  </div>

                  <Divider label="Thống kê" className="my-6" />

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
                      <p className="text-xs text-muted-foreground">Check-in</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {entity.totalCheckouts}
                      </p>
                      <p className="text-xs text-muted-foreground">Check-out</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <p className="text-2xl font-bold text-muted-foreground">
                        {entity.maxParticipants || "∞"}
                      </p>
                      <p className="text-xs text-muted-foreground">Tối đa</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckSquare className="size-4" />{" "}
                      {entity.allowCheckin ? "Cho phép check-in" : "Không check-in"}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckSquare className="size-4" />{" "}
                      {entity.allowCheckout
                        ? "Cho phép check-out"
                        : "Không check-out"}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckSquare className="size-4" />{" "}
                      {entity.requireFaceId
                        ? "Yêu cầu Face ID"
                        : "Không yêu cầu Face ID"}
                    </div>
                    {(entity.checkinCameraName || entity.checkoutCameraName) && (
                      <>
                        <div className="flex items-start gap-2 text-sm pt-1">
                          <Camera className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <p>
                              <span className="text-muted-foreground">Check-in: </span>
                              {entity.checkinCameraName ?? "—"}
                              {entity.checkinCameraCode ? (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {" "}
                                  ({entity.checkinCameraCode})
                                </span>
                              ) : null}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Check-out: </span>
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
                      </>
                    )}
                  </div>

                  <Divider label="Thời gian" className="my-6" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                        <Calendar className="size-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày tạo</p>
                        <p className="text-sm font-medium">
                          {formatDateTime(entity.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                        <Clock className="size-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Cập nhật lần cuối
                        </p>
                        <p className="text-sm font-medium">
                          {formatDateTime(entity.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="registrations" className="flex-1 gap-1.5">
                <ClipboardList className="size-4" /> Danh sách đăng ký
              </TabsTrigger>
              <TabsTrigger value="speakers" className="flex-1 gap-1.5">
                <Mic className="size-4" /> Diễn giả
              </TabsTrigger>
            </TabsList>
            <TabsContent value="registrations" className="mt-4">
              <EventRegistrationsLiveTable
                eventId={id}
                eventTitle={entity.title}
              />
            </TabsContent>
            <TabsContent value="speakers" className="mt-4">
              <SpeakersTab
                eventId={id}
                eventTitle={entity.title}
              />
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
  const columns = useMemo<ColumnDef<Dict>[]>(() => [
    { id: "stt", header: "STT", enableColumnFilter: false, size: 48,
      cell: ({ row }) => row.index + 1 },
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
    { accessorKey: "speakerName", header: "Diễn giả", enableColumnFilter: false,
      cell: ({ getValue }) => (getValue() as string) || "—" },
    { accessorKey: "speakerTitle", header: "Chức danh", enableColumnFilter: false,
      cell: ({ getValue }) => (getValue() as string) || "—" },
    { accessorKey: "role", header: "Vai trò", enableColumnFilter: false,
      cell: ({ getValue }) => (getValue() as string) || "—" },
    { accessorKey: "presentationTitle", header: "Chủ đề", enableColumnFilter: false,
      cell: ({ getValue }) => (getValue() as string) || "—" },
    { accessorKey: "duration", header: "Thời lượng", enableColumnFilter: false,
      cell: ({ getValue }) => {
        const v = getValue() as number | null
        return v ? `${v} phút` : "—"
      } },
  ], [])
  return (
    <AdminDataTable<Dict>
      data={rows}
      columns={columns}
      getRowId={(row) => String(row.id ?? "")}
      isLoading={isLoading}
      emptyLabel="Chưa có diễn giả nào."
      globalFilterPlaceholder="Tìm theo tên, vai trò, chủ đề…"
      getGlobalFilterText={(row) =>
        [row.speakerName, row.speakerTitle, row.role, row.presentationTitle].filter(Boolean).join(" ")
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
