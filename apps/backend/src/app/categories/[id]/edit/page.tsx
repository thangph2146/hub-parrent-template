"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageSection } from "@ui/components/layout";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  CategoryFormShell,
  useCategoryForm,
  useCategoriesOptionsQuery,
  useCategoryDetailQuery,
  buildCategoryOptionTree,
  buildCategoryPayload,
} from "../../_component";
import type { CategoryFormValues } from "../../_component";

function EditCategoryPageInner() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const queryClient = useQueryClient();
  const { form } = useCategoryForm();

  const { data: category, isLoading, isError, refetch } = useCategoryDetailQuery(api, categoryId);
  const categoriesOptionsQuery = useCategoriesOptionsQuery(api);

  const categoryTreeOptions = useMemo(
    () => buildCategoryOptionTree(categoriesOptionsQuery.data ?? []),
    [categoriesOptionsQuery.data],
  );

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được danh mục");
      router.push("/categories");
    }
  }, [isError, router]);

  useEffect(() => {
    if (!category) return;
    form.reset({
      name: category.name ?? "",
      slug: category.slug ?? "",
      description: category.description ?? "",
      icon: category.icon ?? "Package2",
      sortOrder: category.sortOrder ?? 0,
      parentId: category.parentId ?? "__root__",
    });
  }, [category, form]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.categories.update(categoryId, input as Parameters<typeof api.categories.update>[1]),
    onSuccess: async (_data, variables) => {
      await invalidateAll();
      toast.success(`Đã cập nhật danh mục "${(variables.name as string)?.trim()}"`);
      router.push(`/categories/${categoryId}`);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Không thể cập nhật danh mục";
      toast.error(message);
    },
  });

  const handleSubmit = useCallback(
    async (values: CategoryFormValues) => {
      await updateMutation.mutateAsync(buildCategoryPayload(values));
    },
    [updateMutation],
  );

  if (isLoading) {
    return (
      <AdminPageLoading />
    );
  }

  if (!category) return null;

  return (
    <AdminPageSection>
      <CategoryFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={categoryId}
        categoryTreeOptions={categoryTreeOptions}
        onBack={() => router.push(`/categories/${categoryId}`)}
        onReset={async () => {
          await refetch();
        }}
      />
    </AdminPageSection>
  );
}

export default function EditCategoryPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditCategoryPageInner />
    </AdminPageGuard>
  );
}
