export type {
  MajorRow,
  MajorFormValues,
  MajorConfirmAction,
  MajorDetail,
} from "./shared/types"
export { majorFormSchema } from "./shared/types"
export { getMajorColumns } from "./_table/columns"
export {
  useMajorDetailQuery,
  useMajorsListQuery,
  useMajorsTrashQuery,
  majorDetailQueryKey,
  prefetchMajorDetail,
} from "./_query"
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  buildMajorPayload,
  useMajorForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks"
export { MajorsFormShell } from "./_form"
export { MajorsConfirmDialog } from "./_alert-dialog"
export { MajorsTable, MajorsTrashTable } from "./_table"
export {
  default,
  default as MajorsPage,
  MajorsPageInner,
} from "./_page/majors-page"
export { default as MajorsDetailPage } from "./_page/majors-detail-page"
export { default as MajorsNewPage } from "./_page/majors-new-page"
export { default as MajorsEditPage } from "./_page/majors-edit-page"
