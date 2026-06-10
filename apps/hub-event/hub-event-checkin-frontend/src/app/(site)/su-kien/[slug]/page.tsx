import { notFound } from "next/navigation"
import { Page, PageContent } from "@ui/components/layout"
import { EventDetailView } from "../_component/event-detail-view"
import { getPublicEventBySlug } from "@/lib/public-events"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await getPublicEventBySlug(slug)

  if (!event) {
    notFound()
  }

  const eventPath = `/su-kien/${event.slug ?? slug}`

  return (
    <Page className="bg-background">
      <PageContent className="p-0">
        <EventDetailView event={event} eventPath={eventPath} />
      </PageContent>
    </Page>
  )
}
