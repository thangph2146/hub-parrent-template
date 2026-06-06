"use client";

import { useAdminCrudNavigation } from "@/lib/admin-navigation";

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  CategoryFormShell,
  useCategoryForm,
  buildCategoryPayload,
  useCategoriesOptionsQuery,
  buildCategoryOptionTree,
} from "../_component";
import type { CategoryFormValues } from "../_component";

import { useAdminMutation } from "@/hooks/use-admin-mutation";
function NewCategoryPageInner() {
  const crudNav = useAdminCrudNavigation("/categories");
  const queryClient = useQueryClient();
  const form = useCategoryForm().form;
  const categoriesOptionsQuery = useCategoriesOptionsQuery(api);

  const categoryTreeOptions = useMemo(
    () => buildCategoryOptionTree(categoriesOptionsQuery.data ?? []),
    [categoriesOptionsQuery.data],
  );

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) => `Đã tạo danh mục "${(variables.name as string)?.trim()}"`,
      error: (err) => err instanceof Error ? err.message : "Không thể tạo danh mục",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.categories.create(input as Parameters<typeof api.categories.create>[0]),
    onSuccess: async () => {
      await invalidateAll();
      crudNav.list();
    }
    
  });

  const handleSubmit = useCallback(
    async (values: CategoryFormValues) => {
      await createMutation.mutateAsync(buildCategoryPayload(values));
    },
    [createMutation],
  );

  return (
    <AdminPageSection>
      <CategoryFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        categoryTreeOptions={categoryTreeOptions}
        onBack={() => crudNav.list()}
        onReset={() => { form.reset(); }}
      />
    </AdminPageSection>
  );
}

export default function NewCategoryPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewCategoryPageInner />
    </AdminPageGuard>
  );
}
