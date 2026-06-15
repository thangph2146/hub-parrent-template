"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@workspace/admin-app/lib/fetch-all-admin-list"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import {
  EventFormShell,
  useEventForm,
  useEventDetailQuery,
} from "../../_component"
import { buildEventSubmitPayload } from "@workspace/admin-app/lib/build-event-submit-payload"
import { getPosterUrlFromValue } from "../../_component/utils"
import type {
  EventDetail,
  EventFormValues,
  EventFormSpeaker,
} from "../../_component"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useAdminFormDraftPersistence } from "@workspace/admin-app/hooks/use-admin-edit-form-hydration"
function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function normalizeContent(value: unknown): EventFormValues["content"] {
  if (value && typeof value === "object" && "root" in value) return value
  if (typeof value === "string") {
    let parsed: unknown = null
    try {
      parsed = JSON.parse(value)
    } catch {
      parsed = null
    }
    if (parsed && typeof parsed === "object" && "root" in parsed) return parsed
  }
  return {
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
}

function buildFormValues(
  entity: EventDetail,
  speakers: EventFormSpeaker[]
): EventFormValues {
  return {
    title: entity.title ?? "",
    slug: entity.slug ?? "",
    posterUrl: getPosterUrlFromValue(entity.poster),
    description: entity.description ?? "",
    startDate: toDatetimeLocal(entity.startDate),
    endDate: toDatetimeLocal(entity.endDate),
    checkinStart: toDatetimeLocal(entity.checkinStart),
    checkinEnd: toDatetimeLocal(entity.checkinEnd),
    checkoutStart: toDatetimeLocal(entity.checkoutStart),
    checkoutEnd: toDatetimeLocal(entity.checkoutEnd),
    registrationStart: toDatetimeLocal(entity.registrationStart),
    registrationEnd: toDatetimeLocal(entity.registrationEnd),
    organizer: entity.organizer ?? "",
    location: entity.location ?? "",
    address: entity.address ?? "",
    status: entity.status ?? 1,
    isFeatured: entity.isFeatured === true,
    featuredOrder: Number(entity.featuredOrder) || 0,
    allowCheckin: entity.allowCheckin ?? true,
    allowCheckout: entity.allowCheckout ?? true,
    requireFaceId: entity.requireFaceId ?? false,
    checkinCameraId: entity.checkinCameraId ?? "",
    checkoutCameraId: entity.checkoutCameraId ?? "",
    checkinHanetDeviceId: entity.checkinCameraCode ?? "",
    checkoutHanetDeviceId: entity.checkoutCameraCode ?? "",
    maxParticipants: entity.maxParticipants ?? 0,
    format: entity.format ?? 0,
    onlineLink: entity.onlineLink ?? "",
    content: normalizeContent(entity.content),
    speakers,
  }
}

function EditEventPageInner() {
  const crudNav = useAdminModuleNavigation("events")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = useEventForm()
  const {
    data: entity,
    isLoading,
    isError,
    refetch,
  } = useEventDetailQuery(api, id)
  const [existingSpeakers, setExistingSpeakers] = useState<
    { id: string; speakerId: number }[]
  >([])
  const hydratedRef = useRef<string | null>(null)
  const { clearDraft } = useAdminFormDraftPersistence("events", id, form)

  useEffect(() => {
    hydratedRef.current = null
  }, [id])

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được sự kiện")
      crudNav.list()
    }
  }, [isError, crudNav])

  useEffect(() => {
    if (!entity || hydratedRef.current === id) return

    const draft = loadEntityDraft<EventFormValues>(
      buildEntityDraftKey("events", id),
    )
    if (draft) {
      form.reset(draft)
      hydratedRef.current = id
      return
    }

    api.eventSpeakers
      .list<EventFormSpeaker & { id: string }>({
        eventId: id,
        limit: ADMIN_LIST_EXPORT_FETCH_LIMIT,
      })
      .then((res) => {
        const assignments = res.items.map((a) => ({
          id: a.id,
          speakerId: a.speakerId as number,
        }))
        setExistingSpeakers(assignments)
        const speakers = res.items.map((a) => ({
          speakerId: a.speakerId as number,
          role: (a.role as string) ?? undefined,
          presentationTitle: (a.presentationTitle as string) ?? undefined,
          duration: a.duration != null ? (a.duration as number) : undefined,
        }))
        form.reset(buildFormValues(entity, speakers))
      })
      .catch(() => form.reset(buildFormValues(entity, [])))
      .finally(() => {
        hydratedRef.current = id
      })
  }, [entity, form, id])

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["events"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật sự kiện "${(variables.title as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật sự kiện",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.events.update(id, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(id))
    },
  })

  const handleSubmit = useCallback(
    async (values: EventFormValues) => {
      await updateMutation.mutateAsync(await buildEventSubmitPayload(values))
      const newSpeakers = values.speakers ?? []
      const existingMap = new Map(existingSpeakers.map((a) => [a.speakerId, a]))
      const newIds = newSpeakers.map((s) => s.speakerId)
      const existingIds = existingSpeakers.map((a) => a.speakerId)
      const toCreate = newSpeakers.filter(
        (s) => !existingIds.includes(s.speakerId)
      )
      const toUpdate = newSpeakers.filter((s) =>
        existingIds.includes(s.speakerId)
      )
      const toRemove = existingSpeakers.filter(
        (a) => !newIds.includes(a.speakerId)
      )
      await Promise.all([
        ...toCreate.map((s) =>
          api.eventSpeakers
            .create({
              eventId: id,
              speakerId: s.speakerId,
              role: s.role?.trim() || null,
              presentationTitle: s.presentationTitle?.trim() || null,
              duration: s.duration ?? null,
            })
            .catch(() => {})
        ),
        ...toUpdate.map((s) => {
          const existing = existingMap.get(s.speakerId)
          if (!existing) return Promise.resolve()
          return api.eventSpeakers
            .update(existing.id, {
              role: s.role?.trim() || null,
              presentationTitle: s.presentationTitle?.trim() || null,
              duration: s.duration ?? null,
            })
            .catch(() => {})
        }),
        ...toRemove.map((a) => api.eventSpeakers.remove(a.id).catch(() => {})),
      ])
    },
    [updateMutation, existingSpeakers, id]
  )

  if (isLoading) return <AdminPageLoading variant="form" />
  if (!entity) return null

  return (
    <AdminPageSection>
      <EventFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={id}
        onBack={() => crudNav.view(String(id))}
        onReset={async () => {
          await refetch()
        }}
      />
    </AdminPageSection>
  )
}

export default function EditEventPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditEventPageInner />
    </AdminPageGuard>
  )
}
