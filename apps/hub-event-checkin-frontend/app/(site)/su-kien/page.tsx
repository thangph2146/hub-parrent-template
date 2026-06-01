import type { Metadata } from "next"
import { EventsPageContent } from "@/features/events/events-page-content"

export const metadata: Metadata = {
  title: "Hội nghị - Sự kiện",
  description:
    "Danh sách hội nghị và sự kiện tại Trường Đại học Ngân hàng TP. HCM — sự kiện nổi bật, danh mục và đăng ký tham gia.",
}

type SearchParams = Record<string, string | string[] | undefined>

export default function EventsListPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  return <EventsPageContent searchParams={searchParams} />
}
