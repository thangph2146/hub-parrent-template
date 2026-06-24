"use client"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import type { UseMutationResult } from "@tanstack/react-query"
import type { EventConfirmAction, EventFormValues } from "../shared/types"
import { eventFormSchema } from "../shared/types"
import { zodResolver } from "@hookform/resolvers/zod"

const EMPTY_EDITOR_STATE = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
}

const EMPTY_VALUES: EventFormValues = {
  title: "",
  slug: "",
  posterUrl: "",
  description: "",
  startDate: "",
  endDate: "",
  checkinStart: "",
  checkinEnd: "",
  checkoutStart: "",
  checkoutEnd: "",
  registrationStart: "",
  registrationEnd: "",
  organizer: "",
  location: "",
  address: "",
  status: 1,
  isFeatured: false,
  featuredOrder: 0,
  allowCheckin: true,
  allowCheckout: true,
  requireFaceId: false,
  checkinCameraId: "",
  checkoutCameraId: "",
  checkinHanetDeviceId: "",
  checkoutHanetDeviceId: "",
  maxParticipants: 0,
  format: 0,
  onlineLink: "",
  content: EMPTY_EDITOR_STATE,
  speakers: [],
}

export function useEventForm() {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: EMPTY_VALUES,
  })
  const resetForm = useCallback(() => {
    form.reset(EMPTY_VALUES)
  }, [form])
  return { form, resetForm }
}

export function useHandleConfirmAction(
  deleteMutation: UseMutationResult<unknown, Error, string>,
  restoreMutation: UseMutationResult<unknown, Error, string>,
  purgeMutation: UseMutationResult<unknown, Error, string>,
  setConfirmAction: React.Dispatch<
    React.SetStateAction<EventConfirmAction | null>
  >
) {
  return useCallback(
    async ({ kind, row }: EventConfirmAction) => {
      try {
        if (kind === "delete") {
          await deleteMutation.mutateAsync(row.id)
        } else if (kind === "restore") {
          await restoreMutation.mutateAsync(row.id)
        } else if (kind === "purge") {
          await purgeMutation.mutateAsync(row.id)
        }
      } catch {
        /* toast: MutationCache */
      } finally {
        setConfirmAction(null)
      }
    },
    [deleteMutation, restoreMutation, purgeMutation, setConfirmAction]
  )
}

export function useConfirmAction() {
  const [confirmAction, setConfirmAction] = useState<EventConfirmAction | null>(
    null
  )
  return { confirmAction, setConfirmAction }
}
