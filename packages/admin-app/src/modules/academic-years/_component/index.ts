export type {
  AcademicYearRow,
  AcademicYearFormValues,
  AcademicYearConfirmAction,
  AcademicYearDetail,
} from "./shared/types"
export { academicYearFormSchema } from "./shared/types"
export { getAcademicYearColumns } from "./_table/columns"
export {
  useAcademicYearDetailQuery,
  useAcademicYearsListQuery,
  useAcademicYearsTrashQuery,
  academicYearDetailQueryKey,
  prefetchAcademicYearDetail,
} from "./_query"
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  buildAcademicYearPayload,
  useAcademicYearForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks"
export { AcademicYearFormShell } from "./_form"
export { AcademicYearsConfirmDialog } from "./_alert-dialog"
export { AcademicYearsTable, AcademicYearsTrashTable } from "./_table"
export {
  default,
  default as AcademicYearsPage,
  AcademicYearsPageInner,
} from "./_page/academic-years-page"
export { default as AcademicYearsDetailPage } from "./_page/academic-years-detail-page"
export { default as AcademicYearsNewPage } from "./_page/academic-years-new-page"
export { default as AcademicYearsEditPage } from "./_page/academic-years-edit-page"
