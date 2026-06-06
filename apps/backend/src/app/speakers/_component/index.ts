export type { SpeakerRow, SpeakerFormValues, SpeakerConfirmAction, SpeakerDetail } from "./types";
export { speakerFormSchema } from "./types";
export { getSpeakerColumns } from "./columns";
export { 
  useSpeakerDetailQuery,
  useSpeakersListQuery,
  useSpeakersTrashQuery, speakerDetailQueryKey, prefetchSpeakerDetail } from "./_query";
export {
  useColumnFiltersChange,
  useClearListFilters,
  useClearTrashFilters,
  buildSpeakerPayload,
  useSpeakerForm,
  useHandleConfirmAction,
  useConfirmAction,
} from "./_hooks";
export { SpeakerFormShell } from "./_form";
export { SpeakersConfirmDialog } from "./_alert-dialog";
export { SpeakersTable, SpeakersTrashTable } from "./_table";
