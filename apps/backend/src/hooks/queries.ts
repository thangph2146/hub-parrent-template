"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query"
import {
  adminDetailPlaceholderFromList,
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query"
import {
  api,
  type AccountProfile,
  type ChangeAccountPasswordInput,
  type ChangePasswordInput,
  type RbacPermission,
  type RbacRole,
  type UpdateAccountInput,
  type UpdateProfileInput,
  type User,
  type ContactRequest,
  type ParentStudent,
  type ParentStudentAdmin,
} from "@/lib/api"

export const queryKeys = {
  accountProfile: () => ["accounts", "profile"] as const,
  staffProfile: (id: string | number) =>
    ["users", "staff-profile", id] as const,
  staffUserList: () => ["users", "staff-list"] as const,
  usersTrashed: () => ["users", "trashed"] as const,
  rbacCatalog: () => ["rbac", "catalog"] as const,
  contactRequests: (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    trash?: boolean
    filters?: Record<string, string>
  }) => ["contact-requests", params] as const,
  myStudents: () => ["my-students"] as const,
  parentStudents: (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }) => ["parent-students", params] as const,
}

export type UsersListData = {
  items: User[]
  total: number
  page?: number
  limit?: number
}
export type RbacCatalog = { permissions: RbacPermission[]; roles: RbacRole[] }
export type ContactRequestsData = {
  items: ContactRequest[]
  total: number
  page?: number
  limit?: number
  totalPages?: number
}
export type MyStudentsData = { items: ParentStudent[] }
export type ParentStudentsData = { items: ParentStudentAdmin[]; total: number }

export const useAccountProfile = (enabled = true) =>
  useQuery<AccountProfile, Error>({
    queryKey: queryKeys.accountProfile(),
    queryFn: () => api.accounts.get(),
    enabled,
  })

export const useUpdateAccountProfile = (): UseMutationResult<
  AccountProfile,
  Error,
  UpdateAccountInput
> => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input) => api.accounts.update(input),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.accountProfile(), profile)
    },
  })
}

export const useChangeAccountPassword = (): UseMutationResult<
  AccountProfile,
  Error,
  ChangeAccountPasswordInput
> => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input) => api.accounts.changePassword(input),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.accountProfile(), profile)
    },
  })
}

export function prefetchStaffProfile(
  queryClient: QueryClient,
  userId: string | number
) {
  return prefetchAdminDetailQuery(
    queryClient,
    queryKeys.staffProfile(userId),
    () => api.users.get(userId)
  )
}

export const useStaffProfile = (userId: string | number | null | undefined) => {
  const queryClient = useQueryClient()
  const id = userId ?? ""
  const enabled =
    (typeof userId === "string" && userId.trim().length > 0) ||
    (typeof userId === "number" && userId > 0)

  return useQuery<User, Error>({
    ...adminDetailQueryOptions(
      queryKeys.staffProfile(userId ?? "missing"),
      async () => api.users.get(userId as string | number),
      String(id)
    ),
    enabled,
    placeholderData: () =>
      adminDetailPlaceholderFromList<User, User>(
        queryClient,
        queryKeys.staffUserList(),
        String(id),
        (row) => row
      ),
  })
}

export const useUpdateStaffProfile = (): UseMutationResult<
  User,
  Error,
  { id: string | number; input: UpdateProfileInput }
> => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => api.users.updateProfile(id, input),
    onSuccess: (u) => {
      qc.setQueryData(queryKeys.staffProfile(u.id), u)
    },
  })
}

export const useChangeStaffPassword = (): UseMutationResult<
  { ok: true },
  Error,
  { id: string | number; input: ChangePasswordInput }
> => {
  return useMutation({
    mutationFn: ({ id, input }) => api.users.changePassword(id, input),
  })
}

export const useRbacCatalog = (opts?: { enabled?: boolean }) =>
  useQuery<RbacCatalog, Error>({
    queryKey: queryKeys.rbacCatalog(),
    queryFn: async () => {
      const [permissions, roles] = await Promise.all([
        api.rbac.listPermissions(),
        api.rbac.listRoles(),
      ])
      return { permissions, roles }
    },
    enabled: opts?.enabled ?? true,
  })

export const useStaffUserList = (opts?: {
  enabled?: boolean
  listParams?: {
    q?: string
    page?: number
    limit?: number
    filters?: Record<string, string>
  }
}): UseQueryResult<UsersListData, Error> =>
  useQuery({
    queryKey: [...queryKeys.staffUserList(), opts?.listParams ?? null] as const,
    queryFn: async () => {
      const res = await api.users.list({
        q: opts?.listParams?.q,
        page: opts?.listParams?.page,
        limit: opts?.listParams?.limit,
        filters: opts?.listParams?.filters,
      })
      return {
        items: res.items,
        total: res.total,
        page: res.page,
        limit: res.limit,
      }
    },
    enabled: opts?.enabled ?? true,
  })

export const useTrashedStaffUsers = (opts?: {
  enabled?: boolean
  listParams?: {
    page?: number
    limit?: number
    q?: string
    filters?: Record<string, string>
  }
}): UseQueryResult<UsersListData, Error> =>
  useQuery({
    queryKey: [...queryKeys.usersTrashed(), opts?.listParams ?? null] as const,
    queryFn: async () => {
      const lp = opts?.listParams
      const res = await api.users.listTrashed({
        page: lp?.page ?? 1,
        limit: lp?.limit ?? 25,
        q: lp?.q,
        filters: lp?.filters,
      })
      return {
        items: res.items,
        total: res.total,
        page: res.page,
        limit: res.limit,
      }
    },
    enabled: opts?.enabled ?? true,
  })

// Contact Requests hooks
export const useContactRequests = (opts?: {
  enabled?: boolean
  params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    trash?: boolean
    filters?: Record<string, string>
  }
}): UseQueryResult<ContactRequestsData, Error> =>
  useQuery({
    queryKey: queryKeys.contactRequests(opts?.params),
    queryFn: async () => {
      const res = await api.contactRequests.list(opts?.params)
      return {
        items: res.items,
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
      }
    },
    enabled: opts?.enabled ?? true,
  })

export const contactRequestDetailQueryKey = (id: string | number) =>
  ["contact-requests", id] as const

export function prefetchContactRequestDetail(
  queryClient: QueryClient,
  id: string | number
) {
  return prefetchAdminDetailQuery(
    queryClient,
    contactRequestDetailQueryKey(id),
    () => api.contactRequests.detail(id)
  )
}

export const useContactRequestDetail = (
  id: string | number | null | undefined
) => {
  const queryClient = useQueryClient()
  const normalizedId = id != null ? String(id) : ""

  return useQuery<ContactRequest, Error>({
    ...adminDetailQueryOptions(
      contactRequestDetailQueryKey(id ?? "missing"),
      async () => api.contactRequests.detail(id as string | number),
      normalizedId
    ),
    enabled: !!id,
    placeholderData: () =>
      adminDetailPlaceholderFromList<ContactRequest, ContactRequest>(
        queryClient,
        ["contact-requests"],
        normalizedId,
        (row) => row
      ),
  })
}

// My Students hooks
export const useMyStudents = (opts?: {
  enabled?: boolean
}): UseQueryResult<MyStudentsData, Error> =>
  useQuery({
    queryKey: queryKeys.myStudents(),
    queryFn: async () => {
      const res = await api.myStudents.list()
      return { items: res }
    },
    enabled: opts?.enabled ?? true,
  })

// Parent Students hooks
export const useParentStudents = (opts?: {
  enabled?: boolean
  params?: { page?: number; limit?: number; status?: string; search?: string }
}): UseQueryResult<ParentStudentsData, Error> =>
  useQuery({
    queryKey: queryKeys.parentStudents(opts?.params),
    queryFn: async () => {
      const res = await api.parentStudents.list(opts?.params)
      return { items: res.items, total: res.total }
    },
    enabled: opts?.enabled ?? true,
  })
