import type { Metadata } from "next"
import { EventsPageContent } from "./_component/events-page-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sự kiện | HUB Events",
  description:
    "Danh sách hội nghị và sự kiện tại Trường Đại học Ngân hàng TP. HCM — tìm kiếm, lọc theo trạng thái và đăng ký tham gia.",
}

type SearchParams = Record<string, string | string[] | undefined>

export default function EventsListPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  return <EventsPageContent searchParams={searchParams} />
}
