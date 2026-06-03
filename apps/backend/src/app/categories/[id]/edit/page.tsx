"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageGuard, AdminPageSection, AdminPageLoading } from "@ui/components/admin";
import { api } from "@/lib/api";
import {
  CategoryFormShell,
  useCategoriesOptionsQuery,
  useCategoryDetailQuery,
  buildCategoryOptionTree,
  buildCategoryPayload,
  categoryFormSchema,
  getCategoryDefaultValues,
} from "../../_component";
import type { CategoryFormValues, CategoryDetail } from "../../_component";

function EditCategoryForm({
  category,
  categoryTreeOptions,
}: {
  category: CategoryDetail;
  categoryTreeOptions: ReturnType<typeof buildCategoryOptionTree>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getCategoryDefaultValues(category),
  });

  const updateMutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      api.categories.update(category.id, input as Parameters<typeof api.categories.update>[1]),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Đã cập nhật danh mục "${(variables.name as string)?.trim()}"`);
      router.push(`/categories/${category.id}`);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật danh mục");
    },
  });

  const handleSubmit = useCallback(
    async (values: CategoryFormValues) => {
      await updateMutation.mutateAsync(buildCategoryPayload(values));
    },
    [updateMutation],
  );

  return (
    <AdminPageSection>
      <CategoryFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={category.id}
        categoryTreeOptions={categoryTreeOptions}
        onBack={() => router.push(`/categories/${category.id}`)}
        onReset={() => form.reset(getCategoryDefaultValues(category))}
      />
    </AdminPageSection>
  );
}

function EditCategoryPageInner() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const { data: category, isLoading, isError } = useCategoryDetailQuery(api, categoryId);
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

  if (isLoading) return <AdminPageLoading />;
  if (!category) return null;

  return (
    <EditCategoryForm
      category={category}
      categoryTreeOptions={categoryTreeOptions}
    />
  );
}

export default function EditCategoryPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditCategoryPageInner />
    </AdminPageGuard>
  );
}
