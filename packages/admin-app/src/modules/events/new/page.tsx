"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { EventFormShell, useEventForm } from "../_component"
import type { EventFormValues } from "../_component"
import { buildEventSubmitPayload } from "@workspace/admin-app/lib/build-event-submit-payload"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewEventPageInner() {
  const crudNav = useAdminModuleNavigation("events")
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
      const result = await createMutation.mutateAsync(
        await buildEventSubmitPayload(values)
      )
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
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewEventPageInner />
    </AdminPageGuard>
  )
}
