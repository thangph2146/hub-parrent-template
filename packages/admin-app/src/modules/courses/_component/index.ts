export type {
  CourseRow,
  CourseFormValues,
  CourseConfirmAction,
  CourseDetail,
} from "./shared/types"
export { courseFormSchema } from "./shared/types"
export { getCourseColumns } from "./_table/columns"
export {
  courseDetailQueryKey,
  prefetchCourseDetail,
  useCourseDetailQuery,
  useCoursesListQuery,
  useCoursesTrashQuery,
} from "./_query"
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  buildCoursePayload,
  useCourseForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks"
export { CourseFormShell } from "./_form"
export { CoursesConfirmDialog } from "./_alert-dialog"
export { CoursesTable, CoursesTrashTable } from "./_table"
export {
  default,
  default as CoursesPage,
  CoursesPageInner,
} from "./_page/courses-page"
export { default as CoursesDetailPage } from "./_page/courses-detail-page"
export { default as CoursesNewPage } from "./_page/courses-new-page"
export { default as CoursesEditPage } from "./_page/courses-edit-page"
