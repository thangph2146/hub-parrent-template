import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Page, PageContent } from "@ui/components/layout"
import { EventsPageClient } from "./_component/events-page-client"
import { EventsQueryProvider } from "./_component/events-query-provider"

export const metadata: Metadata = {
  title: "Sự kiện | HUB Events",
  description:
    "Danh sách hội nghị và sự kiện tại Trường Đại học Ngân hàng TP. HCM — tìm kiếm, lọc theo trạng thái và đăng ký tham gia.",
}

function EventsPageFallback() {
  return (
    <Page>
      <PageContent className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" aria-label="Đang tải sự kiện" />
      </PageContent>
    </Page>
  )
}

export default function EventsListPage() {
  return (
    <EventsQueryProvider>
      <Suspense fallback={<EventsPageFallback />}>
        <EventsPageClient />
      </Suspense>
    </EventsQueryProvider>
  )
}
