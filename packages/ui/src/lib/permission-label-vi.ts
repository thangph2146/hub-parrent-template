import { PERMISSION_CODES } from "@workspace/api-client"

/** Nhãn tiếng Việt cho mã quyền — dùng chung admin UI (@ui). */
export const PERMISSION_LABEL_VI: Record<string, string> = {
  [PERMISSION_CODES.ALL]: "Toàn quyền (*)",
  [PERMISSION_CODES.PRODUCTS_VIEW]: "Xem sản phẩm",
  [PERMISSION_CODES.PRODUCTS_CREATE]: "Tạo sản phẩm",
  [PERMISSION_CODES.PRODUCTS_UPDATE]: "Cập nhật sản phẩm",
  [PERMISSION_CODES.PRODUCTS_DELETE]: "Xóa sản phẩm",
  [PERMISSION_CODES.CATEGORIES_READ]: "Xem danh mục nội dung",
  [PERMISSION_CODES.CATEGORIES_WRITE]: "Sửa danh mục nội dung",
  [PERMISSION_CODES.ORDERS_VIEW]: "Xem đơn hàng",
  [PERMISSION_CODES.ORDERS_CREATE]: "Tạo đơn hàng",
  [PERMISSION_CODES.ORDERS_UPDATE]: "Cập nhật đơn hàng",
  [PERMISSION_CODES.ORDERS_CHECKOUT]: "Đặt hàng (checkout)",
  [PERMISSION_CODES.PROMO_CODES_VIEW]: "Xem mã khuyến mãi",
  [PERMISSION_CODES.PROMO_CODES_CREATE]: "Tạo mã khuyến mãi",
  [PERMISSION_CODES.PROMO_CODES_UPDATE]: "Cập nhật mã KM",
  [PERMISSION_CODES.PROMO_CODES_MANAGE]: "Quản lý mã KM",
  [PERMISSION_CODES.USERS_MANAGE]: "Quản lý nhân sự & tài khoản",
  [PERMISSION_CODES.USERS_CART_OWN]: "Xem dữ liệu cá nhân",
  [PERMISSION_CODES.RBAC_READ]: "Xem vai trò & quyền",
  [PERMISSION_CODES.DATA_MAINTENANCE]: "Sao lưu / bảo trì dữ liệu",
  [PERMISSION_CODES.SUPPORT_READ]: "Xem nội dung hỗ trợ phụ huynh",
  [PERMISSION_CODES.SUPPORT_WRITE]: "Sửa nội dung hỗ trợ phụ huynh",
  [PERMISSION_CODES.CONTACT_REQUESTS_VIEW]: "Xem liên hệ hỗ trợ",
  [PERMISSION_CODES.CONTACT_REQUESTS_CREATE]: "Tạo liên hệ hỗ trợ",
  [PERMISSION_CODES.CONTACT_REQUESTS_UPDATE]: "Cập nhật liên hệ hỗ trợ",
  [PERMISSION_CODES.CONTACT_REQUESTS_DELETE]: "Xóa liên hệ hỗ trợ",
  [PERMISSION_CODES.CONTACT_REQUESTS_MANAGE]: "Quản lý liên hệ hỗ trợ",
  [PERMISSION_CODES.CONTACT_REQUESTS_EXPORT]: "Xuất liên hệ hỗ trợ",
  [PERMISSION_CODES.CONTACT_REQUESTS_ASSIGN]: "Phân công liên hệ hỗ trợ",
  [PERMISSION_CODES.CONTACT_REQUESTS_RESTORE]: "Khôi phục liên hệ hỗ trợ",
  [PERMISSION_CODES.TAGS_VIEW]: "Xem thẻ nội dung",
  [PERMISSION_CODES.TAGS_CREATE]: "Tạo thẻ nội dung",
  [PERMISSION_CODES.TAGS_UPDATE]: "Cập nhật thẻ nội dung",
  [PERMISSION_CODES.TAGS_DELETE]: "Xóa thẻ nội dung",
  [PERMISSION_CODES.TAGS_MANAGE]: "Quản lý thẻ nội dung",
  [PERMISSION_CODES.TAGS_EXPORT]: "Xuất danh sách thẻ",
}

const RESOURCE_LABEL_VI: Record<string, string> = {
  accounts: "tài khoản quản trị",
  admission_results: "kết quả trúng tuyển",
  posts: "bài viết",
  comments: "bình luận",
  settings: "cài đặt",
  categories: "danh mục",
  dashboard: "bảng điều khiển",
  groups: "nhóm",
  contact_requests: "liên hệ hỗ trợ",
  users: "người dùng",
  page_contents: "nội dung trang",
  sessions: "phiên đăng nhập",
  students: "sinh viên",
  tags: "thẻ",
  notifications: "thông báo",
  messages: "tin nhắn",
  uploads: "tệp tải lên",
  roles: "vai trò",
  speakers: "diễn giả",
  locations: "địa điểm",
  training_levels: "trình độ đào tạo",
  training_systems: "hệ đào tạo",
  majors: "ngành học",
  courses: "khóa học",
  academic_years: "năm học",
  events: "sự kiện",
  cameras: "camera",
  templates: "mẫu giao diện",
  screens: "màn hình",
  departments: "phòng ban",
  event_registrations: "đăng ký sự kiện",
  event_checkins: "check-in sự kiện",
  event_checkouts: "check-out sự kiện",
  event_speakers: "diễn giả sự kiện",
  face_data: "dữ liệu khuôn mặt",
  imported_users: "user imported",
  seo_metas: "SEO meta",
  system: "hệ thống",
  parent_students: "phụ huynh–sinh viên",
  products: "sản phẩm",
  orders: "đơn hàng",
  guides: "hướng dẫn",
  file_storage: "kho tệp",
}

const ACTION_LABEL_VI: Record<string, string> = {
  view: "Xem",
  view_all: "Xem tất cả",
  view_own: "Xem của mình",
  manage: "Quản lý",
  update: "Cập nhật",
  export: "Xuất",
  import: "Nhập",
  restore: "Khôi phục",
  create: "Tạo mới",
  delete: "Xóa",
  publish: "Xuất bản",
  approve: "Phê duyệt",
  assign: "Phân công",
  active: "Kích hoạt",
  unactive: "Vô hiệu hóa",
  "hard-delete": "Xóa vĩnh viễn",
  "revoke-by-user": "Thu hồi theo người dùng",
  checkout: "Đặt hàng",
  read: "Đọc",
  write: "Ghi",
}

function titleCaseToken(token: string): string {
  return token
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function buildDynamicPermissionLabel(code: string): string {
  const [resourceRaw, actionRaw] = code.split(":")
  if (!resourceRaw || !actionRaw) {
    return code
      .split(/[:._-]+/)
      .filter(Boolean)
      .map(titleCaseToken)
      .join(" / ")
  }

  const resourceLabel =
    RESOURCE_LABEL_VI[resourceRaw] ?? titleCaseToken(resourceRaw).toLowerCase()
  const actionLabel = ACTION_LABEL_VI[actionRaw] ?? titleCaseToken(actionRaw)

  return `${actionLabel} ${resourceLabel}`
}

export function permissionLabelVi(code: string): string {
  return PERMISSION_LABEL_VI[code] ?? buildDynamicPermissionLabel(code)
}
