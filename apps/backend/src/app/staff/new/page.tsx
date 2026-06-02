"use client";

import { useRouter } from "next/navigation";
import { useStaffForm, useStaffMutations } from "../_component";
import { StaffFormShell } from "../_component/_form";
import { useRbacCatalog } from "@/hooks/queries";
import { useAuth } from "@/providers/auth-provider";
import { AdminFormPageHeader, AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import { Card, CardContent } from "@ui/components/card";
import { api } from "@/lib/api";

function NewStaffPageInner() {
  const router = useRouter();
  const { user: session } = useAuth();
  const canManageUsers =
    session != null && canUserAccess(session, PERMISSION_CODES.USERS_MANAGE);
  const { createMutation } = useStaffMutations({ api });
  const { form, resetForm, getPayload } = useStaffForm();

  const rbacQuery = useRbacCatalog({
    enabled: Boolean(session) && canManageUsers,
  });

  const roles = rbacQuery.data?.roles ?? [];

  if (!session || !canManageUsers) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Thêm nhân sự mới"
          onBack={() => router.push("/staff")}
          formId="staff-form"
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Không có quyền truy cập</p>
          </CardContent>
        </Card>
      </AdminPageSection>
    );
  }

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const payload = getPayload();
    try {
      await createMutation.mutateAsync(payload);
      router.push("/staff");
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    resetForm();
    router.push("/staff");
  };

  return (
    <AdminPageSection>
      <StaffFormShell
        isEdit={false}
        form={form}
        roles={roles}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={createMutation.isPending}
      />
    </AdminPageSection>
  );
}

export default function NewStaffPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <NewStaffPageInner />
    </AdminPageGuard>
  );
}
