export type {
  TrainingSystemRow,
  TrainingSystemFormValues,
  TrainingSystemConfirmAction,
  TrainingSystemDetail,
} from "./shared/types"
export { entityFormSchema } from "./shared/types"
export { getTrainingSystemColumns } from "./_table/columns"
export {
  useTrainingSystemDetailQuery,
  useTrainingSystemsListQuery,
  useTrainingSystemsTrashQuery,
  trainingSystemDetailQueryKey,
  prefetchTrainingSystemDetail,
} from "./_query"
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  buildTrainingSystemPayload,
  useTrainingSystemForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks"
export { TrainingSystemFormShell } from "./_form"
export { TrainingSystemsConfirmDialog } from "./_alert-dialog"
export { TrainingSystemsTable, TrainingSystemsTrashTable } from "./_table"
export {
  default,
  default as TrainingSystemsPage,
  TrainingSystemsPageInner,
} from "./_page/training-systems-page"
export { default as TrainingSystemsDetailPage } from "./_page/training-systems-detail-page"
export { default as TrainingSystemsNewPage } from "./_page/training-systems-new-page"
export { default as TrainingSystemsEditPage } from "./_page/training-systems-edit-page"
