"use client"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import type { UseMutationResult } from "@tanstack/react-query"
import type { MajorConfirmAction, MajorFormValues } from "../shared/types"
import { majorFormSchema } from "../shared/types"
import { zodResolver } from "@hookform/resolvers/zod"

const EMPTY_VALUES: MajorFormValues = { name: "", code: "", status: 1 }

export function buildMajorPayload(
  values: MajorFormValues
): Record<string, unknown> {
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    status: values.status,
  }
}

export function useMajorForm() {
  const form = useForm<MajorFormValues>({
    resolver: zodResolver(majorFormSchema),
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
    React.SetStateAction<MajorConfirmAction | null>
  >
) {
  return useCallback(
    async ({ kind, row }: MajorConfirmAction) => {
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
  const [confirmAction, setConfirmAction] = useState<MajorConfirmAction | null>(
    null
  )
  return { confirmAction, setConfirmAction }
}
