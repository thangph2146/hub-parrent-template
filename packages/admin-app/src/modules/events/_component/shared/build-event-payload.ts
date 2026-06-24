import type { EventFormValues } from "./types"
import { buildPosterPayload } from "./utils"

export function buildEventPayload(
  values: EventFormValues
): Record<string, unknown> {
  return {
    title: values.title.trim(),
    slug: values.slug?.trim() || null,
    poster: buildPosterPayload(values.posterUrl),
    description: values.description?.trim() || null,
    startDate: values.startDate || null,
    endDate: values.endDate || null,
    checkinStart: values.checkinStart || null,
    checkinEnd: values.checkinEnd || null,
    checkoutStart: values.checkoutStart || null,
    checkoutEnd: values.checkoutEnd || null,
    registrationStart: values.registrationStart || null,
    registrationEnd: values.registrationEnd || null,
    organizer: values.organizer?.trim() || null,
    location: values.location?.trim() || null,
    address: values.address?.trim() || null,
    status: values.status,
    isFeatured: values.isFeatured ?? false,
    featuredOrder: values.featuredOrder ?? 0,
    allowCheckin: values.allowCheckin,
    allowCheckout: values.allowCheckout,
    requireFaceId: values.requireFaceId,
    checkinCameraId: values.checkinCameraId?.trim() || null,
    checkoutCameraId: values.checkoutCameraId?.trim() || null,
    maxParticipants: values.maxParticipants,
    format: values.format ?? 0,
    onlineLink: values.onlineLink?.trim() || null,
    content: values.content ?? null,
  }
}
