export type {
  TemplateRow,
  TemplateFormValues,
  TemplateConfirmAction,
  TemplateDetail,
} from "./shared/types"
export { templateFormSchema } from "./shared/types"
export { getTemplateColumns } from "./_table/columns"
export {
  useTemplateDetailQuery,
  useTemplatesListQuery,
  useTemplatesTrashQuery,
  templateDetailQueryKey,
  prefetchTemplateDetail,
} from "./_query"
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
} from "@workspace/admin-app/hooks/use-table-filters"
export {
  buildTemplatePayload,
  useTemplateForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks"
export { TemplateFormShell } from "./_form"
export { TemplatesConfirmDialog } from "./_alert-dialog"
export { TemplatesTable, TemplatesTrashTable } from "./_table"
export {
  default,
  default as TemplatesPage,
  TemplatesPageInner,
} from "./_page/templates-page"
export { default as TemplatesDetailPage } from "./_page/templates-detail-page"
export { default as TemplatesNewPage } from "./_page/templates-new-page"
export { default as TemplatesEditPage } from "./_page/templates-edit-page"
