export type {
  LocationRow,
  LocationFormValues,
  LocationConfirmAction,
  LocationDetail,
} from "./shared/types"
export { locationFormSchema } from "./shared/types"
export { getLocationColumns } from "./_table/columns"
export {
  useLocationDetailQuery,
  useLocationsListQuery,
  useLocationsTrashQuery,
  locationDetailQueryKey,
  prefetchLocationDetail,
} from "./_query"
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  buildLocationPayload,
  useLocationForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks"
export { LocationFormShell } from "./_form"
export { LocationsConfirmDialog } from "./_alert-dialog"
export { LocationsTable, LocationsTrashTable } from "./_table"
export {
  default,
  default as LocationsPage,
  LocationsPageInner,
} from "./_page/locations-page"
export { default as LocationsDetailPage } from "./_page/locations-detail-page"
export { default as LocationsNewPage } from "./_page/locations-new-page"
export { default as LocationsEditPage } from "./_page/locations-edit-page"
