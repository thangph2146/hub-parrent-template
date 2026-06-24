export type {
  DepartmentRow,
  DepartmentFormValues,
  DepartmentConfirmAction,
  DepartmentDetail,
} from "./shared/types"
export { departmentFormSchema } from "./shared/types"
export { getDepartmentColumns } from "./_table/columns"
export {
  useDepartmentDetailQuery,
  useDepartmentsListQuery,
  useDepartmentsTrashQuery,
  departmentDetailQueryKey,
  prefetchDepartmentDetail,
} from "./_query"
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  buildDepartmentPayload,
  useDepartmentForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks"
export { DepartmentFormShell } from "./_form"
export { DepartmentsConfirmDialog } from "./_alert-dialog"
export { DepartmentsTable, DepartmentsTrashTable } from "./_table"
export {
  default,
  default as DepartmentsPage,
  DepartmentsPageInner,
} from "./_page/departments-page"
export { default as DepartmentsDetailPage } from "./_page/departments-detail-page"
export { default as DepartmentsNewPage } from "./_page/departments-new-page"
export { default as DepartmentsEditPage } from "./_page/departments-edit-page"
