import { buildAdminDocumentHead } from "@ui/components/admin"

export function resolveSettingsDocumentHeadPreview(input: {
  siteName: string
  siteDescription: string
  seoTitle: string
  seoDescription: string
}) {
  const head = buildAdminDocumentHead({
    siteName: input.siteName,
    siteDescription: input.siteDescription,
    metaTitle: input.seoTitle,
    metaDescription: input.seoDescription,
    titleFallback: "Quản trị",
    descriptionFallback: "Quản trị hệ thống",
  })

  const seoTitle = input.seoTitle.trim()
  const seoDescription = input.seoDescription.trim()

  return {
    title: head.title,
    metaDescription: head.description,
    titleSource:
      seoTitle.length > 0
        ? "seo-global.title"
        : input.siteName.trim()
          ? "display.site_name"
          : "fallback",
    metaDescriptionSource:
      seoDescription.length > 0
        ? "seo-global.description"
        : input.siteDescription.trim()
          ? "display.site_description"
          : "fallback",
  }
}
