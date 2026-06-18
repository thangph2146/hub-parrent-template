import { z } from "zod"

export type EventRow = {
  id: string
  title: string
  slug: string | null
  poster: unknown
  description: string | null
  content: unknown
  startDate: string | null
  endDate: string | null
  checkinStart: string | null
  checkinEnd: string | null
  checkoutStart: string | null
  checkoutEnd: string | null
  registrationStart: string | null
  registrationEnd: string | null
  organizer: string | null
  location: string | null
  address: string | null
  qrCode: string | null
  status: number
  totalRegistrations: number
  totalCheckins: number
  totalCheckouts: number
  allowCheckin: boolean
  allowCheckout: boolean
  requireFaceId: boolean
  maxParticipants: number
  format: number
  onlineLink: string | null
  schedule: unknown
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  isFeatured: boolean
  featuredOrder: number
  checkinCameraId: string | null
  checkoutCameraId: string | null
  checkinCameraName: string | null
  checkoutCameraName: string | null
  checkinCameraCode: string | null
  checkoutCameraCode: string | null
}

export interface EventConfirmAction {
  kind: "delete" | "restore" | "purge"
  row: EventRow
}

export const eventFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z.string().optional(),
  posterUrl: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  checkinStart: z.string().optional(),
  checkinEnd: z.string().optional(),
  checkoutStart: z.string().optional(),
  checkoutEnd: z.string().optional(),
  registrationStart: z.string().optional(),
  registrationEnd: z.string().optional(),
  organizer: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  status: z.coerce.number(),
  isFeatured: z.coerce.boolean(),
  featuredOrder: z.coerce.number().int().min(0).optional(),
  allowCheckin: z.coerce.boolean(),
  allowCheckout: z.coerce.boolean(),
  requireFaceId: z.coerce.boolean(),
  checkinCameraId: z.string().optional(),
  checkoutCameraId: z.string().optional(),
  maxParticipants: z.coerce.number(),
  format: z.coerce.number().optional(),
  onlineLink: z.string().optional(),
  content: z.any().optional(),
  speakers: z
    .array(
      z.object({
        speakerId: z.coerce.number(),
        role: z.string().optional(),
        presentationTitle: z.string().optional(),
        duration: z.coerce.number().optional(),
      })
    )
    .optional(),
})

export type EventFormValues = z.infer<typeof eventFormSchema>

export type EventDetail = EventRow

export type EventFormSpeaker = {
  speakerId: number
  role?: string
  presentationTitle?: string
  duration?: number
}
