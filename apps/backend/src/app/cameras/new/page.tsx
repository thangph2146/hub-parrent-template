"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ui/components/sonner";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import { CameraFormShell, useCameraForm, buildCameraPayload } from "../_component";
import type { CameraFormValues } from "../_component";
function NewCameraPageInner() {
  const crudNav = useAdminCrudNavigation("/cameras"), qc = useQueryClient(), { form } = useCameraForm();
  const inv = async () => { await qc.invalidateQueries({ queryKey: ["cameras"] }); };
  const mut = useMutation({ mutationFn: (i: Record<string, unknown>) => api.cameras.create(i), onSuccess: async (_d, v) => { await inv(); toast.success(`Đã tạo camera "${v.name}"`); crudNav.list(); }, onError: (e: Error) => toast.error(e.message || "Lỗi") });
  const h = useCallback(async (v: CameraFormValues) => { await mut.mutateAsync(buildCameraPayload(v)); }, [mut]);
  return (<AdminPageSection><CameraFormShell form={form} onSubmit={h} submitting={mut.isPending} editingId={null} onBack={() => crudNav.list()} onReset={() => form.reset()} /></AdminPageSection>);
}
export default function NewCameraPage() { return <AdminPageGuard roles={["super_admin", "admin", "manager"]}><NewCameraPageInner /></AdminPageGuard>; }
