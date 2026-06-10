export {
  useAdminMutation,
  type UseAdminMutationOptions,
} from "@ui/hooks/use-admin-mutation"

export {
  adminToastMeta,
  createAdminMutationCache,
  defaultAdminOperationToast,
  defaultBulkOperationToast,
  resolveAdminOperationError,
  type AdminOperationToastMessages,
} from "@ui/lib/admin-operation-toast"

export {
  adminToastSuppressMeta,
  suppressRealtimeToastAfterMutation,
  suppressRealtimeToastForEntity,
  type AdminToastSuppressMeta,
} from "@ui/lib/admin-toast-suppress"
