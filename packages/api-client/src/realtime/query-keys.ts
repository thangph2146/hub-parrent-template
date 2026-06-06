/** Map slug API `admin/{resource}` → prefix React Query (invalidate mọi query con). */

export const ADMIN_RESOURCE_QUERY_PREFIX: Record<string, readonly unknown[]> = {
  roles: ["rbac"],
  users: ["users"],
  "contact-requests": ["contact-requests"],
  categories: ["categories"],
  tags: ["tags"],
  posts: ["media", "posts"],
  courses: ["courses"],
  departments: ["departments"],
  events: ["events"],
  locations: ["locations"],
  majors: ["majors"],
  speakers: ["speakers"],
  screens: ["screens"],
  cameras: ["cameras"],
  templates: ["templates"],
  "training-levels": ["training-levels"],
  "training-systems": ["training-systems"],
  "academic-years": ["academic-years"],
  "seo-metas": ["seo-metas"],
  "page-contents": ["admin", "guides"],
  "parent-students": ["admin", "parent-students"],
  groups: ["groups"],
  students: ["students"],
  comments: ["comments"],
  settings: ["settings"],
  uploads: ["file-storage"],
  system: ["system", "data"],
  notifications: ["notifications"],
}

export function queryPrefixesForAdminResource(
  resource: string,
  id?: string,
): readonly (readonly unknown[])[] {
  const normalized = resource.toLowerCase()
  const base =
    ADMIN_RESOURCE_QUERY_PREFIX[normalized] ?? [
      normalized.replace(/-/g, "_"),
      normalized,
    ]
  const prefixes: (readonly unknown[])[] = [base]
  if (id) {
    prefixes.push([...base, "detail", id])
  }
  return prefixes
}
