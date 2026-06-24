// Re-export shared types từ @workspace/api-client
export type {
  PageContent,
  PageContentStep,
  CreatePageContentInput,
  UpdatePageContentInput,
  // Aliases cho Guides
  GuideStep,
  GuideGroup,
  CreateGuideInput,
  UpdateGuideInput,
} from "@workspace/api-client"

// Local types cho UI
export type {
  ListResult,
  GuideFormData,
  UpdateGuideData,
  GuideConfirmAction,
} from "./shared/types"

// Utils
export {
  PAGE_KEY,
  parseContent,
  sortGroupsByOrder,
  applyOrderToGroups,
  reorderSteps,
} from "./shared/utils"

// Hooks
export { useGuidesActions } from "./_hooks"
export { useGuideForm, buildGuidePayload, guideFormSchema } from "./_hooks"
export type { GuideFormValues } from "./_hooks"

// Query hooks
export {
  useGuidesQuery,
  useGuideDetailQuery,
  useCreateGuideMutation,
  useUpdateGuideMutation,
  useDeleteGuideMutation,
  useReorderGuidesMutation,
  guideDetailQueryKey,
  prefetchGuideDetail,
} from "./_query"

// Form components
export { GuideFormShell, StepEditor, ImageUploadField } from "./_form"

// Alert dialog components
export { GuidesConfirmDialog } from "./_alert-dialog"

// Table components
export { GuidesTable } from "./_table"
export { getGuidesColumns, type GuideColumnsProps } from "./_table/columns"
export {
  default,
  default as GuidesPage,
  GuidesPageInner,
} from "./_page/guides-page"
export { default as GuidesDetailPage } from "./_page/guides-detail-page"
export { default as GuidesNewPage } from "./_page/guides-new-page"
export { default as GuidesEditPage } from "./_page/guides-edit-page"
