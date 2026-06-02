import { notFound, redirect } from "next/navigation"
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

  redirect(`/su-kien/${event.slug ?? slug}`)
}
