export {
  seoMetaFormSchema,
  type SeoMetaRow,
  type SeoMetaConfirmAction,
  type SeoMetaFormValues,
  type SeoMetaDetail,
} from "./shared/types"

export { getSeoMetaColumns } from "./_table/columns"

export {
  useSeoMetaDetailQuery,
  useSeoMetasListQuery,
  useSeoMetasTrashQuery,
  seoMetaDetailQueryKey,
  prefetchSeoMetaDetail,
} from "./_query"

export { SeoMetasTable } from "./_table/seo-metas-table"
export { SeoMetasConfirmDialog } from "./_alert-dialog"
export {
  default,
  default as SeoMetasPage,
  SeoMetasPageInner,
} from "./_page/seo-metas-page"
export { default as SeoMetaDetailPage } from "./_page/seo-meta-detail-page"
export { default as EditSeoMetaPage } from "./_page/seo-meta-edit-page"
export { default as NewSeoMetaPage } from "./_page/seo-meta-new-page"
