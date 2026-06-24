"use client"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import type { UseMutationResult } from "@tanstack/react-query"
import type {
  TrainingSystemConfirmAction,
  TrainingSystemFormValues,
} from "../shared/types"
import { entityFormSchema } from "../shared/types"
import { zodResolver } from "@hookform/resolvers/zod"

const EMPTY_VALUES: TrainingSystemFormValues = { name: "", code: "", status: 1 }

export function buildTrainingSystemPayload(
  values: TrainingSystemFormValues
): Record<string, unknown> {
  return {
    name: values.name.trim(),
    code: values.code?.trim() || null,
    status: values.status,
  }
}

export function useTrainingSystemForm() {
  const form = useForm<TrainingSystemFormValues>({
    resolver: zodResolver(entityFormSchema),
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
    React.SetStateAction<TrainingSystemConfirmAction | null>
  >
) {
  return useCallback(
    async ({ kind, row }: TrainingSystemConfirmAction) => {
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
    useState<TrainingSystemConfirmAction | null>(null)
  return { confirmAction, setConfirmAction }
}
