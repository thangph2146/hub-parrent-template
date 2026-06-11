import type { ColumnFiltersState } from "@tanstack/react-table"

export type FilterMapping = Record<
  string,
  string | ((value: unknown) => string | undefined)
>

export function normalizeAdminFilterValue(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim()
  return normalized ? normalized : undefined
}

export function normalizeAdminFilterValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeAdminFilterValue(item))
      .filter((item): item is string => Boolean(item))
  }

  if (typeof value === "string" && value.includes(",")) {
    return value
      .split(",")
      .map((item) => normalizeAdminFilterValue(item))
      .filter((item): item is string => Boolean(item))
  }

  const normalized = normalizeAdminFilterValue(value)
  return normalized ? [normalized] : []
}

/** Map 1-1 column id → API filter key (cùng tên). */
export function identityFilterMapping(...keys: string[]): FilterMapping {
  return Object.fromEntries(keys.map((key) => [key, key]))
}

export function buildAdminFilterQuery(
  columnFilters: ColumnFiltersState,
  mapping: FilterMapping
): Record<string, string> {
  const query: Record<string, string> = {}
  for (const filter of columnFilters) {
    const value = normalizeAdminFilterValue(filter.value)
    if (!value) continue

    const mapper = mapping[filter.id]
    if (!mapper) continue

    if (typeof mapper === "function") {
      const mapped = mapper(value)
      const normalizedMapped = normalizeAdminFilterValue(mapped)
      if (normalizedMapped) {
        query[filter.id] = normalizedMapped
      }
    } else {
      query[mapper] = value
    }
  }
  return query
}

// Preset mappings for common patterns
export const COMMON_FILTER_MAPPINGS: Record<string, FilterMapping> = {
  // Posts
  posts: {
    title: "title",
    slug: "slug",
    published: (v: unknown) =>
      v === "true" ? "true" : v === "false" ? "false" : undefined,
    categoryId: "categoryId",
    tagId: "tagId",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
  } as FilterMapping,

  categories: {
    name: "name",
    slug: "slug",
    parentId: "parentId",
    description: "description",
    type: "type",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
  } as FilterMapping,

  guides: {
    sectionKey: "sectionKey",
    title: "title",
    order: "order",
    stepsCount: "stepsCount",
    isVisible: (v: unknown) =>
      v === "true" || v === "1"
        ? "true"
        : v === "false" || v === "0"
          ? "false"
          : undefined,
  } as FilterMapping,

  // Users/Staff
  users: {
    fullName: "name",
    email: "email",
    phone: "phone",
    isActive: (v: unknown) => String(v),
  } as FilterMapping,

  // Tags
  tags: {
    name: "name",
    slug: "slug",
    deletedAt: "deletedAt",
    updatedAt: "updatedAt",
  } as FilterMapping,

  // Parent-students
  parentStudents: {
    parent: "parentName",
    student: "studentCode",
    parentName: "parentName",
    parentEmail: "parentEmail",
    studentCode: "studentCode",
    studentName: "studentName",
    note: "note",
    status: "status",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  } as FilterMapping,

  // Roles / RBAC
  roles: {
    name: "displayName",
    code: "name",
    description: "description",
    isActive: (v: unknown) => String(v),
  } as FilterMapping,

  cameras: identityFilterMapping(
    "name",
    "code",
    "linkedEventTitle",
    "linkedEventId",
    "linkedEventSlug",
    "ipAddress",
    "port",
    "username",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  departments: identityFilterMapping(
    "name",
    "code",
    "description",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  locations: identityFilterMapping(
    "name",
    "address",
    "mapUrl",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  screens: identityFilterMapping(
    "name",
    "code",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  templates: identityFilterMapping(
    "name",
    "code",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  speakers: identityFilterMapping(
    "name",
    "title",
    "organization",
    "email",
    "phone",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  seoMetas: identityFilterMapping(
    "page",
    "pageKey",
    "title",
    "description",
    "keywords",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  academicYears: identityFilterMapping(
    "name",
    "startDate",
    "endDate",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  courses: identityFilterMapping(
    "name",
    "code",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  majors: identityFilterMapping(
    "name",
    "code",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  trainingLevels: identityFilterMapping(
    "name",
    "code",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  trainingSystems: identityFilterMapping(
    "name",
    "code",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  events: identityFilterMapping(
    "title",
    "slug",
    "organizer",
    "location",
    "address",
    "startDate",
    "endDate",
    "format",
    "status",
    "isFeatured",
    "featuredOrder",
    "totalRegistrations",
    "totalCheckins",
    "totalCheckouts",
    "checkinCameraName",
    "checkoutCameraName",
    "checkinCameraId",
    "checkoutCameraId",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "id"
  ),

  orders: identityFilterMapping("status", "totalAmount", "createdAt"),

  promoCodes: identityFilterMapping(
    "code",
    "label",
    "discountKind",
    "minOrderSubtotal",
    "usageCount",
    "isActive"
  ),

  // Contact requests
  contactRequests: {
    name: "name",
    email: "email",
    phone: "phone",
    subject: "subject",
    content: "content",
    status: (v: unknown) => {
      const value = normalizeAdminFilterValue(v)
      if (value === "new") return "NEW"
      if (value === "in-progress") return "IN_PROGRESS"
      if (value === "resolved") return "RESOLVED"
      if (value === "archived") return "CLOSED"
      return value
    },
    priority: "priority",
    isRead: (v: unknown) => (v === "read" || v === "true" ? "true" : "false"),
    assignedToName: "assignedToName",
    submittedByName: "submittedByName",
    assignedToEmail: "assignedToEmail",
    submittedByEmail: "submittedByEmail",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
  } as FilterMapping,
}
