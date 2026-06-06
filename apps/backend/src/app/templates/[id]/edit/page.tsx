"use client";
import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import { TemplateFormShell, useTemplateForm, useTemplateDetailQuery, buildTemplatePayload } from "../../_component";
import type { TemplateFormValues } from "../../_component";
function EditTemplatePageInner() {
  const crudNav = useAdminCrudNavigation("/templates"), params = useParams(), id = params.id as string, qc = useQueryClient(), { form } = useTemplateForm();
  const { data: e, isLoading, isError, refetch } = useTemplateDetailQuery(api, id);
  useEffect(() => { if (isError) { toast.error("Không tải được mẫu"); crudNav.list(); } }, [isError, crudNav]);
  useEffect(() => { if (!e) return; form.reset({ name: e.name ?? "", code: e.code ?? "", status: e.status ?? 1 }); }, [e, form]);
  const inv = async () => { await qc.invalidateQueries({ queryKey: ["templates"] }); };
  const mut = useMutation({ mutationFn: (i: Record<string, unknown>) => api.templates.update(id, i), onSuccess: async (_d, v) => { await inv(); toast.success(`Đã cập nhật "${v.name}"`); crudNav.view(String(id)); }, onError: (e: Error) => toast.error(e.message || "Lỗi") });
  const h = useCallback(async (v: TemplateFormValues) => { await mut.mutateAsync(buildTemplatePayload(v)); }, [mut]);
  if (isLoading) return <AdminPageLoading variant="form" />;
  if (!e) return null;
  return (<AdminPageSection><TemplateFormShell form={form} onSubmit={h} submitting={mut.isPending} editingId={id} onBack={() => crudNav.view(String(id))} onReset={async () => { await refetch(); }} /></AdminPageSection>);
}
export default function EditTemplatePage() { return <AdminPageGuard roles={["super_admin", "admin", "manager"]}><EditTemplatePageInner /></AdminPageGuard>; }
