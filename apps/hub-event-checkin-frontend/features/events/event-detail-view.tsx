"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCheck,
  Clock,
  FileText,
  Globe,
  Info,
  MapPin,
  Mic,
  Monitor,
  UserRound,
  Users,
} from "lucide-react";
import { Badge } from "@ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { EventDetailBreadcrumb } from "@/components/events/event-detail-breadcrumb";
import { EventPoster } from "@/components/shared/event-poster";
import { EventContent } from "@/components/shared/event-content";
import { EventRegistrationPanel } from "@/features/events/event-registration-panel";
import { EventSpeakersSection } from "@/features/events/event-speakers-section";
import { EventRegistrantsSection } from "@/features/events/event-registrants-section";
import {
  EVENT_STATUS_LABELS,
  formatEventTimeDateLine,
  getEventLocationLabel,
  getEventStatus,
  getPosterUrl,
  type PublicEventDetail,
} from "@/lib/public-events";
import { FORMAT_LABELS, formatRange } from "@/lib/registration-format";
import { cn } from "@ui/lib/utils";

const STATUS_STYLES = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  ongoing: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  past: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
} as const;

type EventDetailViewProps = {
  event: PublicEventDetail;
  eventPath: string;
};

export function EventDetailView({ event, eventPath }: EventDetailViewProps) {
  const [liveEvent, setLiveEvent] = useState(event);

  useEffect(() => {
    setLiveEvent(event);
  }, [event]);

  const status = getEventStatus(liveEvent);
  const timeLine = formatEventTimeDateLine(liveEvent.startDate);
  const locationLabel = getEventLocationLabel(liveEvent);
  const hasPoster = Boolean(getPosterUrl(liveEvent.poster));
  const hasDescription = Boolean(liveEvent.description?.trim());
  const hasContent = Boolean(liveEvent.content);
  const speakers = liveEvent.speakers ?? [];
  const registrants = liveEvent.registrants ?? [];
  const registrantCount = Math.max(liveEvent.totalRegistrations, registrants.length);
  const defaultTab = hasContent ? "content" : "overview";

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-secondary text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.12),transparent)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-8 md:px-12 md:py-10">
          <Link
            href="/su-kien"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    STATUS_STYLES[status],
                  )}
                >
                  {EVENT_STATUS_LABELS[status]}
                </span>
                <Badge variant="secondary" className="bg-white/15 text-white">
                  <Monitor className="mr-1 size-3.5" />
                  {FORMAT_LABELS[liveEvent.format] ?? "Offline"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-4xl">
                {liveEvent.title}
              </h1>
              {timeLine ? (
                <p className="flex items-center gap-2 text-base font-medium text-white/90">
                  <CalendarDays className="size-5 shrink-0" />
                  {timeLine}
                </p>
              ) : null}
              {locationLabel ? (
                <p className="flex items-start gap-2 text-sm text-white/80">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {locationLabel}
                </p>
              ) : null}
            </div>

            {hasPoster ? (
              <EventPoster
                poster={liveEvent.poster}
                alt={liveEvent.title}
                aspectClassName="aspect-[16/10] w-full"
                className="rounded-xl ring-2 ring-white/20"
                priority
              />
            ) : null}
          </div>
        </div>
      </section>

      <EventDetailBreadcrumb title={liveEvent.title} />

      <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-12 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="min-w-0 space-y-6">
            {hasDescription ? (
              <Card className="border-primary/20 bg-primary/[0.04] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <Info className="size-5" />
                    Lưu ý &amp; thông tin quan trọng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                    {liveEvent.description}
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <Card className="overflow-hidden shadow-sm">
              <Tabs defaultValue={defaultTab} className="w-full">
                <CardHeader className="border-b border-border/60 pb-0">
                  <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                    <TabsTrigger
                      value="overview"
                      className="gap-1.5 rounded-lg data-active:bg-muted data-active:shadow-none"
                    >
                      <CalendarDays className="size-4 shrink-0" />
                      <span className="hidden sm:inline">Chi tiết</span>
                      <span className="sm:hidden">Tổ chức</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="content"
                      className="gap-1.5 rounded-lg data-active:bg-muted data-active:shadow-none"
                    >
                      <FileText className="size-4 shrink-0" />
                      Nội dung
                    </TabsTrigger>
                    <TabsTrigger
                      value="speakers"
                      className="gap-1.5 rounded-lg data-active:bg-muted data-active:shadow-none"
                    >
                      <Mic className="size-4 shrink-0" />
                      Diễn giả
                      {speakers.length > 0 ? (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {speakers.length}
                        </Badge>
                      ) : null}
                    </TabsTrigger>
                    <TabsTrigger
                      value="registrants"
                      className="gap-1.5 rounded-lg data-active:bg-muted data-active:shadow-none"
                    >
                      <UserRound className="size-4 shrink-0" />
                      <span className="hidden sm:inline">Đã đăng ký</span>
                      <span className="sm:hidden">SV</span>
                      {registrantCount > 0 ? (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {registrantCount}
                        </Badge>
                      ) : null}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  <TabsContent value="overview" className="mt-0 outline-none">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailRow
                        icon={CalendarDays}
                        label="Thời gian sự kiện"
                        value={formatRange(liveEvent.startDate, liveEvent.endDate)}
                      />
                      <DetailRow
                        icon={CheckCheck}
                        label="Thời hạn đăng ký"
                        value={formatRange(
                          liveEvent.registrationStart,
                          liveEvent.registrationEnd,
                        )}
                      />
                      {(liveEvent.checkinStart || liveEvent.checkinEnd) && (
                        <DetailRow
                          icon={Clock}
                          label="Cửa sổ check-in"
                          value={formatRange(
                            liveEvent.checkinStart,
                            liveEvent.checkinEnd,
                          )}
                        />
                      )}
                      {(liveEvent.location || liveEvent.address) && (
                        <DetailRow
                          icon={MapPin}
                          label="Địa điểm"
                          value={[liveEvent.location, liveEvent.address]
                            .filter(Boolean)
                            .join(" · ")}
                        />
                      )}
                      {liveEvent.organizer ? (
                        <DetailRow
                          icon={Users}
                          label="Ban tổ chức"
                          value={liveEvent.organizer}
                        />
                      ) : null}
                      {liveEvent.onlineLink ? (
                        <DetailRow
                          icon={Globe}
                          label="Liên kết online"
                          value={
                            <a
                              href={liveEvent.onlineLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-primary underline-offset-4 hover:underline"
                            >
                              {liveEvent.onlineLink}
                            </a>
                          }
                        />
                      ) : null}
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="mt-0 outline-none">
                    {hasContent ? (
                      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary">
                        <p className="not-prose mb-4 text-sm text-muted-foreground">
                          Đọc kỹ trước khi đăng ký — gồm quy định, lịch trình và yêu cầu tham
                          dự.
                        </p>
                        <EventContent content={liveEvent.content} />
                      </div>
                    ) : (
                      <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                        Ban tổ chức chưa cập nhật nội dung chi tiết.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="speakers" className="mt-0 outline-none">
                    <EventSpeakersSection speakers={speakers} embedded />
                  </TabsContent>

                  <TabsContent value="registrants" className="mt-0 outline-none">
                    <EventRegistrantsSection
                      registrants={registrants}
                      totalRegistrations={liveEvent.totalRegistrations}
                      embedded
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-26">
            <Card className="overflow-hidden border-primary/15 shadow-lg py-0">
              <div className="bg-primary px-5 py-4 text-primary-foreground">
                <h2 className="text-lg font-bold">Đăng ký tham gia</h2>
                <p className="mt-1 text-sm text-primary-foreground/90">
                  Sinh viên đăng nhập HUB để ghi danh
                </p>
              </div>
              <CardContent className="p-5">
                <EventRegistrationPanel
                  event={liveEvent}
                  eventPath={eventPath}
                  onEventRefresh={setLiveEvent}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}
