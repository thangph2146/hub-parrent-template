export const rbacQueryKeys = {
  all: ["rbac"] as const,
  catalog: () => [...rbacQueryKeys.all, "catalog", "full"] as const,
  detail: (id: string) => [...rbacQueryKeys.all, "detail", id] as const,
}
