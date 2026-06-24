export type {
  CameraRow,
  CameraFormValues,
  CameraConfirmAction,
  CameraDetail,
} from "./shared/types"
export { cameraFormSchema } from "./shared/types"
export { getCameraColumns } from "./_table/columns"
export {
  useCameraDetailQuery,
  useCamerasListQuery,
  useCamerasTrashQuery,
  cameraDetailQueryKey,
  prefetchCameraDetail,
} from "./_query"
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
} from "@workspace/admin-app/hooks/use-table-filters"
export {
  buildCameraPayload,
  useCameraForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks"
export { CameraFormShell } from "./_form"
export { CamerasConfirmDialog } from "./_alert-dialog"
export { CamerasTable, CamerasTrashTable } from "./_table"
export {
  default,
  default as CamerasPage,
  CamerasPageInner,
} from "./_page/cameras-page"
export { default as CamerasDetailPage } from "./_page/cameras-detail-page"
export { default as CamerasNewPage } from "./_page/cameras-new-page"
export { default as CamerasEditPage } from "./_page/cameras-edit-page"
