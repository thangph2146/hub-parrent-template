"use client"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import type { UseMutationResult } from "@tanstack/react-query"
import type { SpeakerConfirmAction, SpeakerFormValues } from "../shared/types"
import { speakerFormSchema } from "../shared/types"
import { zodResolver } from "@hookform/resolvers/zod"

const EMPTY_VALUES: SpeakerFormValues = {
  name: "",
  title: "",
  organization: "",
  bio: "",
  avatar: "",
  email: "",
  phone: "",
  status: 1,
}

export function buildSpeakerPayload(
  values: SpeakerFormValues
): Record<string, unknown> {
  return {
    name: values.name.trim(),
    title: values.title?.trim() || null,
    organization: values.organization?.trim() || null,
    bio: values.bio?.trim() || null,
    avatar: values.avatar?.trim() || null,
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    status: values.status,
  }
}

export function useSpeakerForm() {
  const form = useForm<SpeakerFormValues>({
    resolver: zodResolver(speakerFormSchema),
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
    React.SetStateAction<SpeakerConfirmAction | null>
  >
) {
  return useCallback(
    async ({ kind, row }: SpeakerConfirmAction) => {
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
  const [confirmAction, setConfirmAction] =
    useState<SpeakerConfirmAction | null>(null)
  return { confirmAction, setConfirmAction }
}
