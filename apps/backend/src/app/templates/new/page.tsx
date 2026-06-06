"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import { TemplateFormShell, useTemplateForm, buildTemplatePayload } from "../_component";
import type { TemplateFormValues } from "../_component";
function NewTemplatePageInner() {
  const crudNav = useAdminCrudNavigation("/templates"), qc = useQueryClient(), { form } = useTemplateForm();
  const inv = async () => { await qc.invalidateQueries({ queryKey: ["templates"] }); };
  const mut = useMutation({ mutationFn: (i: Record<string, unknown>) => api.templates.create(i), onSuccess: async (_d, v) => { await inv(); toast.success(`Đã tạo mẫu "${v.name}"`); crudNav.list(); }, onError: (e: Error) => toast.error(e.message || "Lỗi") });
  const h = useCallback(async (v: TemplateFormValues) => { await mut.mutateAsync(buildTemplatePayload(v)); }, [mut]);
  return (<AdminPageSection><TemplateFormShell form={form} onSubmit={h} submitting={mut.isPending} editingId={null} onBack={() => crudNav.list()} onReset={() => form.reset()} /></AdminPageSection>);
}
export default function NewTemplatePage() { return <AdminPageGuard roles={["super_admin", "admin", "manager"]}><NewTemplatePageInner /></AdminPageGuard>; }
