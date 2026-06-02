import type { AdminDataTableXlsxExportConfig } from "@ui/components/data-table";

const ADMIN_EXPORT_SUBTITLE = "Hệ thống quản trị HUB";

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
  | "staff-trash";

type AdminTableExportTemplate = {
  fileName: string;
  sheetName: string;
  title: string;
  subtitle: string;
  recordLabel: string;
};

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
};

function formatExportDate(): string {
  return new Date().toLocaleString("vi-VN");
}

export type AdminTableXlsxExportOptions = {
  pageCount?: number;
  total?: number;
};

export function buildAdminTableXlsxExport(
  templateId: AdminTableExportTemplateId,
  options: AdminTableXlsxExportOptions = {},
): AdminDataTableXlsxExportConfig {
  const template = ADMIN_TABLE_EXPORT_TEMPLATES[templateId];
  const metadata: Array<{
    label: string;
    value: string | number | null | undefined;
  }> = [
    { label: "Chủ đề", value: template.title },
    { label: "Ngày xuất", value: formatExportDate() },
  ];

  if (options.pageCount != null) {
    metadata.push({
      label: "Số bản ghi trang",
      value: options.pageCount,
    });
  }
  if (options.total != null) {
    metadata.push({
      label: `Tổng ${template.recordLabel}`,
      value: options.total,
    });
  }

  return {
    fileName: template.fileName,
    sheetName: template.sheetName,
    title: template.title,
    subtitle: template.subtitle,
    metadata,
  };
}

export type ContactXlsxExportKind = "active" | "trash";

export type ContactXlsxExportTemplate = {
  fileName: string;
  sheetName: string;
  title: string;
  subtitle: string;
  metadata: Array<{
    label: string;
    value: string | number | null | undefined;
  }>;
};

export function buildContactRequestsXlsxExport(
  kind: ContactXlsxExportKind,
  options: AdminTableXlsxExportOptions = {},
): ContactXlsxExportTemplate {
  const isTrash = kind === "trash";
  const title = isTrash
    ? "YÊU CẦU LIÊN HỆ TRONG THÙNG RÁC"
    : "DANH SÁCH YÊU CẦU LIÊN HỆ";
  const metadata: Array<{
    label: string;
    value: string | number | null | undefined;
  }> = [
    { label: "Chủ đề", value: title },
    { label: "Ngày xuất", value: formatExportDate() },
  ];

  if (options.pageCount != null) {
    metadata.push({
      label: "Số bản ghi trang",
      value: options.pageCount,
    });
  }
  if (options.total != null) {
    metadata.push({
      label: "Tổng yêu cầu",
      value: options.total,
    });
  }

  return {
    fileName: isTrash ? "yeu-cau-lien-he-thung-rac.xlsx" : "yeu-cau-lien-he.xlsx",
    sheetName: isTrash ? "Lien he thung rac" : "Yeu cau lien he",
    title,
    subtitle: ADMIN_EXPORT_SUBTITLE,
    metadata,
  };
}
