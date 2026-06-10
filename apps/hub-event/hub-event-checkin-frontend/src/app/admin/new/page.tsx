"use client"

import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { PERMISSION_CODES } from "@workspace/api-client"
import { api } from "@/lib/admin/api"
import { EventFormShell, useEventForm, buildEventPayload } from "../_component"
import type { EventFormValues } from "../_component"

import { useAdminMutation } from "@/hooks/admin/use-admin-mutation"
function NewEventPageInner() {
  const crudNav = useAdminCrudNavigation("/admin")
  const queryClient = useQueryClient()
  const { form } = useEventForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["events"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo sự kiện "${(variables.title as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo sự kiện",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.events.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: EventFormValues) => {
      const result = await createMutation.mutateAsync(buildEventPayload(values))
      const newEventId = (result as { id?: string })?.id
      if (newEventId && values.speakers?.length) {
        await Promise.all(
          values.speakers.map((s) =>
            api.eventSpeakers
              .create({
                eventId: newEventId,
                speakerId: s.speakerId,
                role: s.role?.trim() || null,
                presentationTitle: s.presentationTitle?.trim() || null,
                duration: s.duration ?? null,
              })
              .catch(() => {})
          )
        )
      }
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <EventFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        onBack={() => crudNav.list()}
        onReset={() => {
          form.reset()
        }}
      />
    </AdminPageSection>
  )
}

export default function NewEventPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.EVENTS_CREATE}>
      <NewEventPageInner />
    </AdminPageGuard>
  )
}
