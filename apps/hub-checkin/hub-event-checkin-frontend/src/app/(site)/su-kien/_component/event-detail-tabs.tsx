"use client"

import {
  CalendarDays,
  FileText,
  Mic,
  UserRound,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Card, CardContent, CardHeader } from "@ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import { EventContent } from "@/components/shared/event-content"
import { hasEventDetailContent } from "@/lib/site/event-detail-content"
import type { PublicEventDetail } from "@/lib/site/public-events"
import { EventDetailOverview } from "./event-detail-overview"
import { EventRegistrantsSection } from "./event-registrants-section"
import { EventSpeakersSection } from "./event-speakers-section"

type EventDetailTabsProps = {
  event: PublicEventDetail
}

export function EventDetailTabs({ event }: EventDetailTabsProps) {
  const hasContent = hasEventDetailContent(event.content)
  const speakers = event.speakers ?? []
  const registrants = event.registrants ?? []
  const registrantCount = Math.max(event.totalRegistrations, registrants.length)
  const defaultTab = hasContent ? "content" : "overview"

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
      <Tabs defaultValue={defaultTab} className="w-full">
        <CardHeader className="border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-6">
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-0 bg-transparent p-0"
          >
            <TabsTrigger value="overview" className="gap-1.5 px-3 py-2 text-sm">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              Chi tiết
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 px-3 py-2 text-sm">
              <FileText className="size-4 shrink-0" aria-hidden />
              Nội dung
            </TabsTrigger>
            <TabsTrigger value="speakers" className="gap-1.5 px-3 py-2 text-sm">
              <Mic className="size-4 shrink-0" aria-hidden />
              Diễn giả
              {speakers.length > 0 ? (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                  {speakers.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="registrants" className="gap-1.5 px-3 py-2 text-sm">
              <UserRound className="size-4 shrink-0" aria-hidden />
              Đã đăng ký
              {registrantCount > 0 ? (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                  {registrantCount}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="px-4 py-6 sm:px-6">
          <TabsContent value="overview" className="mt-0 outline-none">
            <EventDetailOverview event={event} />
          </TabsContent>

          <TabsContent value="content" className="mt-0 outline-none">
            {hasContent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Nội dung chi tiết do ban tổ chức cung cấp — vui lòng đọc kỹ quy định và lịch
                  trình trước khi đăng ký.
                </p>
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                  <EventContent content={event.content} />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-14 text-center">
                <FileText className="mx-auto mb-3 size-10 text-muted-foreground/40" aria-hidden />
                <p className="font-medium text-foreground">Chưa có nội dung chi tiết</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ban tổ chức sẽ cập nhật thêm thông tin sớm nhất.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="speakers" className="mt-0 outline-none">
            <EventSpeakersSection speakers={speakers} embedded />
          </TabsContent>

          <TabsContent value="registrants" className="mt-0 outline-none">
            <EventRegistrantsSection
              registrants={registrants}
              totalRegistrations={event.totalRegistrations}
              eventTitle={event.title}
              embedded
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
