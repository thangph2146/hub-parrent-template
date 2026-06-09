"use client"

import { useCallback, useEffect, useRef } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"
import {
  buildEntityDraftKey,
  clearEntityDraft,
  loadEntityDraft,
  saveEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"

export type UseAdminEditFormHydrationOptions<
  TData,
  TFormValues extends FieldValues,
> = {
  /** Namespace draft — vd. `products`, `orders`. */
  scope: string
  entityId: string
  data: TData | undefined
  form: UseFormReturn<TFormValues>
  toFormValues: (data: TData) => TFormValues
  /** Gộp draft session với giá trị server (vd. giữ `code` read-only từ API). */
  mergeDraft?: (draft: TFormValues, server: TFormValues) => TFormValues
}

/**
 * Hydrate form edit admin một lần / entity + lưu draft session khi dirty.
 * Kết hợp `useHydrateOncePerEntity` để không bị ghi đè khi query refetch.
 */
export function useAdminEditFormHydration<
  TData,
  TFormValues extends FieldValues,
>({
  scope,
  entityId,
  data,
  form,
  toFormValues,
  mergeDraft,
}: UseAdminEditFormHydrationOptions<TData, TFormValues>) {
  const draftKey = buildEntityDraftKey(scope, entityId)
  const toFormValuesRef = useRef(toFormValues)
  toFormValuesRef.current = toFormValues
  const mergeDraftRef = useRef(mergeDraft)
  mergeDraftRef.current = mergeDraft

  const hydrateFromServer = useCallback(
    (source: TData) => {
      const serverValues = toFormValuesRef.current(source)
      const draft = loadEntityDraft<TFormValues>(draftKey)
      const merged =
        draft && mergeDraftRef.current
          ? mergeDraftRef.current(draft, serverValues)
          : draft ?? serverValues
      form.reset(merged)
    },
    [draftKey, form],
  )

  useHydrateOncePerEntity(entityId, data, hydrateFromServer)

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!form.formState.isDirty) return
      saveEntityDraft(draftKey, values as TFormValues)
    })
    return () => subscription.unsubscribe()
  }, [form, draftKey])

  const clearDraft = useCallback(() => {
    clearEntityDraft(draftKey)
  }, [draftKey])

  const resetFromServer = useCallback(() => {
    if (data === undefined) return
    clearEntityDraft(draftKey)
    form.reset(toFormValuesRef.current(data))
  }, [data, draftKey, form])

  return { clearDraft, resetFromServer, draftKey }
}

/** Chỉ lưu draft session khi form dirty — dùng kèm `useHydrateOncePerEntity`. */
export function useAdminFormDraftPersistence<
  TFormValues extends FieldValues,
>(scope: string, entityId: string, form: UseFormReturn<TFormValues>) {
  const draftKey = buildEntityDraftKey(scope, entityId)

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!form.formState.isDirty) return
      saveEntityDraft(draftKey, values as TFormValues)
    })
    return () => subscription.unsubscribe()
  }, [form, draftKey])

  const clearDraft = useCallback(() => {
    clearEntityDraft(draftKey)
  }, [draftKey])

  return { clearDraft, draftKey }
}
