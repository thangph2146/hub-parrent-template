"use client"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import type { UseMutationResult } from "@tanstack/react-query"
import type { CourseConfirmAction, CourseFormValues } from "../shared/types"
import { courseFormSchema } from "../shared/types"
import { zodResolver } from "@hookform/resolvers/zod"

const EMPTY_VALUES: CourseFormValues = {
  name: "",
  startYear: undefined,
  endYear: undefined,
  departmentId: "",
  status: 1,
}

function parseDepartmentId(value: string | undefined): number | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

export function buildCoursePayload(
  values: CourseFormValues
): Record<string, unknown> {
  return {
    name: values.name.trim(),
    startYear: values.startYear || null,
    endYear: values.endYear || null,
    departmentId: parseDepartmentId(values.departmentId),
    status: values.status,
  }
}

export function useCourseForm() {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
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
    React.SetStateAction<CourseConfirmAction | null>
  >
) {
  return useCallback(
    async ({ kind, row }: CourseConfirmAction) => {
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
    useState<CourseConfirmAction | null>(null)
  return { confirmAction, setConfirmAction }
}
