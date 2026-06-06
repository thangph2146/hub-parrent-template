"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import { EventFormShell, useEventForm, buildEventPayload } from "../_component";
import type { EventFormValues } from "../_component";

function NewEventPageInner() {
  const crudNav = useAdminCrudNavigation("/events");
  const queryClient = useQueryClient();
  const { form } = useEventForm();

  const invalidateAll = async () => { await queryClient.invalidateQueries({ queryKey: ["events"] }); };

  const createMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) => api.events.create(input),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã tạo sự kiện "${(variables.title as string)?.trim()}"`);
      crudNav.list();
    },
    onError: (err: unknown) => { toast.error(err instanceof Error ? err.message : "Không thể tạo sự kiện"); },
  });

  const handleSubmit = useCallback(async (values: EventFormValues) => {
    const result = await createMutation.mutateAsync(buildEventPayload(values));
    const newEventId = (result as { id?: string })?.id;
    if (newEventId && values.speakers?.length) {
      await Promise.all(values.speakers.map((s) =>
        api.eventSpeakers.create({
          eventId: newEventId,
          speakerId: s.speakerId,
          role: s.role?.trim() || null,
          presentationTitle: s.presentationTitle?.trim() || null,
          duration: s.duration ?? null,
        }).catch(() => {})
      ));
    }
  }, [createMutation]);

  return (
    <AdminPageSection>
      <EventFormShell form={form} onSubmit={handleSubmit} submitting={createMutation.isPending} editingId={null}
        onBack={() => crudNav.list()} onReset={() => { form.reset(); }} />
    </AdminPageSection>
  );
}

export default function NewEventPage() {
  return <AdminPageGuard roles={["super_admin", "admin", "manager"]}><NewEventPageInner /></AdminPageGuard>;
}
