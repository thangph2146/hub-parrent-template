"use client"

import { useCallback, useMemo, useState } from "react"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { GraduationCap, Plus, BarChart3 } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageHeaderPrimaryButton,
  AdminPageSection,
} from "@ui/components/admin"
import { useAuth } from "@/providers/auth-provider"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { api } from "@/lib/api"
import { queryKeys } from "@/hooks/queries"
import {
  AddStudentDialog,
  MyStudentsTable,
  StudentGradeDialog,
  DEMO_GRADE_STUDENT,
  getMyStudentsColumns,
  type GradeDialogTarget,
  type MyStudentRow,
} from "./_component"
import {
  myStudentsPollInterval,
  useMyStudentsSocket,
} from "./_component/use-my-students-socket"

import { useAdminMutation } from "@/hooks/use-admin-mutation"
export default function MyStudentsPage() {
  const { user } = useAuth()
  const canCreate = user
    ? canUserAccess(user, PERMISSION_CODES.STUDENTS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.STUDENTS_VIEW_OWN)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.STUDENTS_VIEW_OWN) ||
      canUserAccess(user, PERMISSION_CODES.STUDENTS_DELETE) ||
      canUserAccess(user, PERMISSION_CODES.STUDENTS_MANAGE)
    : false

  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [gradeTarget, setGradeTarget] = useState<GradeDialogTarget | null>(null)
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const handleStudentReviewed = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.myStudents() })
  }, [queryClient])

  const { connected: socketConnected } = useMyStudentsSocket(
    true,
    handleStudentReviewed
  )

  const { data: students, isLoading } = useQuery<MyStudentRow[]>({
    queryKey: queryKeys.myStudents(),
    queryFn: async () => {
      const result = await api.myStudents.list()
      return result as unknown as MyStudentRow[]
    },

    refetchInterval: (query) => {
      const rows = query.state.data as MyStudentRow[] | undefined
      const hasPending = (rows ?? []).some((row) => row.status === "pending")
      return myStudentsPollInterval(socketConnected, hasPending)
    },
  })

  const deleteMutation = useAdminMutation({
    toast: {
      loading: "Đang xóa liên kết…",
      success: "Đã xóa liên kết sinh viên.",
      error: (err) =>
        err instanceof Error
          ? err.message
          : "Không thể xóa liên kết sinh viên.",
    },
    mutationFn: async (id: string) => {
      await api.myStudents.remove(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myStudents() })
    },
  })

  const handleDelete = useCallback(
    async (row: MyStudentRow) => {
      await deleteMutation.mutateAsync(row.id)
    },
    [deleteMutation]
  )

  const handleViewGrades = useCallback((row: MyStudentRow) => {
    setGradeTarget({
      studentCode: row.studentCode,
      studentName: row.studentName,
    })
  }, [])

  const columns = useMemo(
    () =>
      getMyStudentsColumns({
        onViewGrades: handleViewGrades,
        onDelete: handleDelete,
        canDelete,
        deleteBusy: deleteMutation.isPending,
      }),
    [canDelete, deleteMutation.isPending, handleDelete, handleViewGrades]
  )

  const clearFilters = useCallback(() => {
    setColumnFilters([])
    setGlobalFilter("")
  }, [])

  const displayName = user?.name?.trim() || user?.email || "Phụ huynh"
  const isDev = process.env.NODE_ENV === "development"

  const devToolbarExtra = isDev ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 border-dashed border-yellow-400 text-yellow-800 dark:text-yellow-400"
      onClick={() =>
        setGradeTarget({
          studentCode: DEMO_GRADE_STUDENT.code,
          studentName: DEMO_GRADE_STUDENT.name,
        })
      }
    >
      <BarChart3 className="size-3.5" aria-hidden />
      Demo bảng điểm
    </Button>
  ) : undefined

  return (
    <AdminPageGuard permission={PERMISSION_CODES.STUDENTS_VIEW_OWN}>
      <AdminPageSection>
        <AdminListPageHeader
          title="Quản lý sinh viên"
          subtitle={
            <>
              Xin chào,{" "}
              <span className="font-semibold text-foreground">
                {displayName}
              </span>
              . Quản lý liên kết sinh viên và theo dõi kết quả học tập.
            </>
          }
          icon={GraduationCap}
          actions={
            canCreate ? (
              <AdminPageHeaderPrimaryButton onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Thêm sinh viên
              </AdminPageHeaderPrimaryButton>
            ) : undefined
          }
        />

        <MyStudentsTable
          data={students ?? []}
          columns={columns}
          isLoading={isLoading}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onClearFilters={clearFilters}
          filterToolbarExtra={devToolbarExtra}
        />

        <AddStudentDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: queryKeys.myStudents() })
          }
        />

        <StudentGradeDialog
          target={gradeTarget}
          onClose={() => setGradeTarget(null)}
        />
      </AdminPageSection>
    </AdminPageGuard>
  )
}
