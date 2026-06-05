
const ADMIN_EXPORT_SUBTITLE = "Hệ thống quản trị HUB"

export type AdminTableExportTemplateId =
  | "academic-years"
  | "academic-years-trash"
  | "courses"
  | "courses-trash"
  | "categories"
  | "categories-trash"
  | "departments"
  | "departments-trash"
  | "events"
  | "events-trash"
  | "locations"
  | "locations-trash"
  | "majors"
  | "majors-trash"
  | "speakers"
  | "speakers-trash"
  | "posts"
  | "posts-trash"
  | "tags"
  | "tags-trash"
  | "training-systems"
  | "training-systems-trash"
  | "training-levels"
  | "training-levels-trash"
  | "seo-metas"
  | "cameras"
  | "cameras-trash"
  | "screens"
  | "screens-trash"
  | "templates"
  | "templates-trash"
  | "guides"
  | "staff"
  | "staff-trash"
  | "rbac"
  | "rbac-trash"
  | "parent-students"
  | "my-students"
  | "contact-requests"
  | "contact-requests-trash"
  | "event-registrations"
  | "event-checkins"
  | "event-checkouts"
  | "event-speakers"
  | "event-live-activities"
  | "student-year-averages"
  | "student-term-averages"
  | "student-detailed-scores"
  | "staff-related-posts"

type AdminTableExportTemplate = {
  fileName: string
  sheetName: string
  title: string
  subtitle: string
  recordLabel: string
}

const ADMIN_TABLE_EXPORT_TEMPLATES: Record<
  AdminTableExportTemplateId,
  AdminTableExportTemplate
> = {
  "academic-years": {
    fileName: "nien-khoa.xlsx",
    sheetName: "Nien khoa",
    title: "DANH SÁCH NIÊN KHÓA",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "niên khóa",
  },
  "academic-years-trash": {
    fileName: "nien-khoa-thung-rac.xlsx",
    sheetName: "Nien khoa thung rac",
    title: "NIÊN KHÓA TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "niên khóa",
  },
  courses: {
    fileName: "khoa-hoc.xlsx",
    sheetName: "Khoa hoc",
    title: "DANH SÁCH KHÓA HỌC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "khóa học",
  },
  "courses-trash": {
    fileName: "khoa-hoc-thung-rac.xlsx",
    sheetName: "Khoa hoc thung rac",
    title: "KHÓA HỌC TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "khóa học",
  },
  categories: {
    fileName: "danh-muc.xlsx",
    sheetName: "Danh muc",
    title: "DANH SÁCH DANH MỤC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "danh mục",
  },
  "categories-trash": {
    fileName: "danh-muc-thung-rac.xlsx",
    sheetName: "Danh muc thung rac",
    title: "DANH MỤC TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "danh mục",
  },
  departments: {
    fileName: "phong-khoa.xlsx",
    sheetName: "Phong khoa",
    title: "DANH SÁCH PHÒNG / KHOA",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "phòng/khoa",
  },
  "departments-trash": {
    fileName: "phong-khoa-thung-rac.xlsx",
    sheetName: "Phong khoa thung rac",
    title: "PHÒNG / KHOA TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "phòng/khoa",
  },
  events: {
    fileName: "su-kien.xlsx",
    sheetName: "Su kien",
    title: "DANH SÁCH SỰ KIỆN",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "sự kiện",
  },
  "events-trash": {
    fileName: "su-kien-thung-rac.xlsx",
    sheetName: "Su kien thung rac",
    title: "SỰ KIỆN TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "sự kiện",
  },
  locations: {
    fileName: "dia-diem.xlsx",
    sheetName: "Dia diem",
    title: "DANH SÁCH ĐỊA ĐIỂM",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "địa điểm",
  },
  "locations-trash": {
    fileName: "dia-diem-thung-rac.xlsx",
    sheetName: "Dia diem thung rac",
    title: "ĐỊA ĐIỂM TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "địa điểm",
  },
  majors: {
    fileName: "nganh-hoc.xlsx",
    sheetName: "Nganh hoc",
    title: "DANH SÁCH NGÀNH HỌC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "ngành học",
  },
  "majors-trash": {
    fileName: "nganh-hoc-thung-rac.xlsx",
    sheetName: "Nganh hoc thung rac",
    title: "NGÀNH HỌC TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "ngành học",
  },
  speakers: {
    fileName: "dien-gia.xlsx",
    sheetName: "Dien gia",
    title: "DANH SÁCH DIỄN GIẢ",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "diễn giả",
  },
  "speakers-trash": {
    fileName: "dien-gia-thung-rac.xlsx",
    sheetName: "Dien gia thung rac",
    title: "DIỄN GIẢ TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "diễn giả",
  },
  posts: {
    fileName: "bai-viet.xlsx",
    sheetName: "Bai viet",
    title: "DANH SÁCH BÀI VIẾT",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "bài viết",
  },
  "posts-trash": {
    fileName: "bai-viet-thung-rac.xlsx",
    sheetName: "Bai viet thung rac",
    title: "BÀI VIẾT TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "bài viết",
  },
  tags: {
    fileName: "the.xlsx",
    sheetName: "The",
    title: "DANH SÁCH THẺ",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "thẻ",
  },
  "tags-trash": {
    fileName: "the-thung-rac.xlsx",
    sheetName: "The thung rac",
    title: "THẺ TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "thẻ",
  },
  "training-systems": {
    fileName: "he-dao-tao.xlsx",
    sheetName: "He dao tao",
    title: "DANH SÁCH HỆ ĐÀO TẠO",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "hệ đào tạo",
  },
  "training-systems-trash": {
    fileName: "he-dao-tao-thung-rac.xlsx",
    sheetName: "He dao tao thung rac",
    title: "HỆ ĐÀO TẠO TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "hệ đào tạo",
  },
  "training-levels": {
    fileName: "bac-hoc.xlsx",
    sheetName: "Bac hoc",
    title: "DANH SÁCH BẬC HỌC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "bậc học",
  },
  "training-levels-trash": {
    fileName: "bac-hoc-thung-rac.xlsx",
    sheetName: "Bac hoc thung rac",
    title: "BẬC HỌC TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "bậc học",
  },
  "seo-metas": {
    fileName: "seo-metas.xlsx",
    sheetName: "SEO metas",
    title: "DANH SÁCH SEO META",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "bản ghi SEO",
  },
  cameras: {
    fileName: "camera.xlsx",
    sheetName: "Camera",
    title: "DANH SÁCH CAMERA",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "camera",
  },
  "cameras-trash": {
    fileName: "camera-thung-rac.xlsx",
    sheetName: "Camera thung rac",
    title: "CAMERA TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "camera",
  },
  screens: {
    fileName: "man-hinh.xlsx",
    sheetName: "Man hinh",
    title: "DANH SÁCH MÀN HÌNH",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "màn hình",
  },
  "screens-trash": {
    fileName: "man-hinh-thung-rac.xlsx",
    sheetName: "Man hinh thung rac",
    title: "MÀN HÌNH TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "màn hình",
  },
  templates: {
    fileName: "mau-hien-thi.xlsx",
    sheetName: "Mau hien thi",
    title: "DANH SÁCH MẪU HIỂN THỊ",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "mẫu hiển thị",
  },
  "templates-trash": {
    fileName: "mau-hien-thi-thung-rac.xlsx",
    sheetName: "Mau hien thi thung rac",
    title: "MẪU HIỂN THỊ TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "mẫu hiển thị",
  },
  guides: {
    fileName: "huong-dan-su-dung.xlsx",
    sheetName: "Huong dan",
    title: "DANH SÁCH HƯỚNG DẪN SỬ DỤNG",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "nhóm hướng dẫn",
  },
  staff: {
    fileName: "nhan-su.xlsx",
    sheetName: "Nhan su",
    title: "DANH SÁCH NHÂN SỰ",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "nhân sự",
  },
  "staff-trash": {
    fileName: "nhan-su-thung-rac.xlsx",
    sheetName: "Nhan su thung rac",
    title: "NHÂN SỰ TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "nhân sự",
  },
  rbac: {
    fileName: "vai-tro.xlsx",
    sheetName: "Vai tro",
    title: "DANH SÁCH VAI TRÒ (RBAC)",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "vai trò",
  },
  "rbac-trash": {
    fileName: "vai-tro-thung-rac.xlsx",
    sheetName: "Vai tro thung rac",
    title: "VAI TRÒ TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "vai trò",
  },
  "parent-students": {
    fileName: "yeu-cau-phu-huynh-sinh-vien.xlsx",
    sheetName: "Phu huynh SV",
    title: "DANH SÁCH YÊU CẦU PHỤ HUYNH – SINH VIÊN",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "yêu cầu",
  },
  "my-students": {
    fileName: "sinh-vien-cua-toi.xlsx",
    sheetName: "Sinh vien",
    title: "DANH SÁCH LIÊN KẾT SINH VIÊN CỦA TÔI",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "liên kết",
  },
  "contact-requests": {
    fileName: "yeu-cau-lien-he.xlsx",
    sheetName: "Yeu cau lien he",
    title: "DANH SÁCH YÊU CẦU LIÊN HỆ",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "yêu cầu",
  },
  "contact-requests-trash": {
    fileName: "yeu-cau-lien-he-thung-rac.xlsx",
    sheetName: "Lien he thung rac",
    title: "YÊU CẦU LIÊN HỆ TRONG THÙNG RÁC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "yêu cầu",
  },
  "event-registrations": {
    fileName: "dang-ky-su-kien.xlsx",
    sheetName: "Dang ky",
    title: "DANH SÁCH ĐĂNG KÝ SỰ KIỆN",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "đăng ký",
  },
  "event-checkins": {
    fileName: "check-in-su-kien.xlsx",
    sheetName: "Check in",
    title: "DANH SÁCH CHECK-IN SỰ KIỆN",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "check-in",
  },
  "event-checkouts": {
    fileName: "check-out-su-kien.xlsx",
    sheetName: "Check out",
    title: "DANH SÁCH CHECK-OUT SỰ KIỆN",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "check-out",
  },
  "event-speakers": {
    fileName: "dien-gia-su-kien.xlsx",
    sheetName: "Dien gia",
    title: "DANH SÁCH DIỄN GIẢ SỰ KIỆN",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "diễn giả",
  },
  "event-live-activities": {
    fileName: "luong-hoat-dong-realtime.xlsx",
    sheetName: "Hoat dong",
    title: "LUỒNG HOẠT ĐỘNG REALTIME SỰ KIỆN",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "hoạt động",
  },
  "student-year-averages": {
    fileName: "diem-trung-binh-nam.xlsx",
    sheetName: "Diem TB nam",
    title: "ĐIỂM TRUNG BÌNH THEO NĂM HỌC",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "năm học",
  },
  "student-term-averages": {
    fileName: "diem-trung-binh-hoc-ky.xlsx",
    sheetName: "Diem TB hoc ky",
    title: "ĐIỂM TRUNG BÌNH THEO HỌC KỲ",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "học kỳ",
  },
  "student-detailed-scores": {
    fileName: "diem-chi-tiet.xlsx",
    sheetName: "Diem chi tiet",
    title: "ĐIỂM CHI TIẾT THEO MÔN",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "môn học",
  },
  "staff-related-posts": {
    fileName: "bai-viet-nhan-su.xlsx",
    sheetName: "Bai viet",
    title: "BÀI VIẾT LIÊN QUAN NHÂN SỰ",
    subtitle: ADMIN_EXPORT_SUBTITLE,
    recordLabel: "bài viết",
  },
}

function formatExportDate(): string {
  return new Date().toLocaleString("vi-VN")
}

export type AdminTableXlsxExportOptions = {
  pageCount?: number
  total?: number
  extraMetadata?: Array<{
    label: string
    value: string | number | null | undefined
  }>
  fileName?: string
}

/** Kết quả `buildAdminTableXlsxExport` — truyền vào `AdminDataTable` `xlsxExport`. */
export type AdminTableXlsxBuiltConfig = {
  fileName: string
  sheetName: string
  title: string
  subtitle: string
  metadata: Array<{
    label: string
    value: string | number | null | undefined
  }>
}

function sanitizeFileStem(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

export function buildAdminTableXlsxExport(
  templateId: AdminTableExportTemplateId,
  options: AdminTableXlsxExportOptions = {}
): AdminTableXlsxBuiltConfig {
  const template = ADMIN_TABLE_EXPORT_TEMPLATES[templateId]
  const metadata: Array<{
    label: string
    value: string | number | null | undefined
  }> = [
    { label: "Chủ đề", value: template.title },
    { label: "Ngày xuất", value: formatExportDate() },
  ]

  if (options.extraMetadata?.length) {
    metadata.push(...options.extraMetadata)
  }

  if (options.pageCount != null) {
    metadata.push({
      label: "Số bản ghi trang",
      value: options.pageCount,
    })
  }
  if (options.total != null) {
    metadata.push({
      label: `Tổng ${template.recordLabel}`,
      value: options.total,
    })
  }

  return {
    fileName: options.fileName ?? template.fileName,
    sheetName: template.sheetName,
    title: template.title,
    subtitle: template.subtitle,
    metadata,
  }
}

export type EventDetailExportTab =
  | "registrations"
  | "checkins"
  | "checkouts"
  | "speakers"
  | "live-activities"

const EVENT_DETAIL_TEMPLATE: Record<
  EventDetailExportTab,
  AdminTableExportTemplateId
> = {
  registrations: "event-registrations",
  checkins: "event-checkins",
  checkouts: "event-checkouts",
  speakers: "event-speakers",
  "live-activities": "event-live-activities",
}

export function buildEventDetailXlsxExport(
  tab: EventDetailExportTab,
  options: AdminTableXlsxExportOptions & {
    eventTitle?: string
    eventId?: string
  } = {}
): AdminTableXlsxBuiltConfig {
  const templateId = EVENT_DETAIL_TEMPLATE[tab]
  const stem = options.eventId ? sanitizeFileStem(options.eventId) : ""
  const baseTemplate = ADMIN_TABLE_EXPORT_TEMPLATES[templateId]
  const fileName =
    options.fileName ??
    (stem
      ? baseTemplate.fileName.replace(".xlsx", `-${stem}.xlsx`)
      : baseTemplate.fileName)

  const extraMetadata: AdminTableXlsxExportOptions["extraMetadata"] = []
  if (options.eventTitle?.trim()) {
    extraMetadata.push({ label: "Sự kiện", value: options.eventTitle.trim() })
  }
  if (options.eventId?.trim()) {
    extraMetadata.push({ label: "Mã sự kiện", value: options.eventId.trim() })
  }

  return buildAdminTableXlsxExport(templateId, {
    pageCount: options.pageCount,
    total: options.total,
    fileName,
    extraMetadata,
  })
}

export type ContactXlsxExportKind = "active" | "trash"

/** @deprecated Dùng `AdminTableXlsxBuiltConfig`. */
export type ContactXlsxExportTemplate = AdminTableXlsxBuiltConfig

/** @deprecated Dùng `buildAdminTableXlsxExport("contact-requests" | "contact-requests-trash")`. */
export function buildContactRequestsXlsxExport(
  kind: ContactXlsxExportKind,
  options: AdminTableXlsxExportOptions = {},
): ContactXlsxExportTemplate {
  const templateId =
    kind === "trash" ? "contact-requests-trash" : "contact-requests"
  return buildAdminTableXlsxExport(templateId, options)
}
