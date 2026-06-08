import type { RowData } from "@tanstack/react-table"
import type { DataTableUserSearchHandlers } from "./data-table-user-search-filter"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?:
      | "text"
      | "select"
      | "multi-select"
      | "tree-select"
      | "tree-multi-select"
      | "number"
      | "date"
      | "date-range"
      | "user-search"
    filterPlaceholder?: string
    /** Gợi ý người dùng khi `filterVariant: "user-search"`. */
    userSearchHandlers?: DataTableUserSearchHandlers
    /** Nhãn ô lọc ngoài bảng (mặc định: header cột) */
    filterLabel?: string
    selectOptions?: { value: string; label: string }[]
    /** Cấu hình tree-select: value/label/children (parent có children sẽ disabled) */
    treeOptions?: {
      value: string
      label: string
      children?: { value: string; label: string }[]
    }[]
    /** Không hiển thị ô lọc dưới header (vd. cột nút) */
    disableColumnFilter?: boolean
    /** Cột STT / số thứ tự do DataTable tự chèn — không lọc, không nhân đôi. */
    isIndexColumn?: boolean
    /** Cột menu thao tác (id `actions` hoặc meta này) — DataTable gộp meta chuẩn. */
    isActionsColumn?: boolean
    /** Ẩn khỏi bảng UI; bật lại qua "Hiện cột" hoặc vẫn xuất Excel khi được bật. */
    hideInTable?: boolean
    /** Ẩn mặc định trong bảng (vẫn bật qua "Hiện cột"). */
    defaultHidden?: boolean
    /** `false` = không cho ẩn/hiện qua "Hiện cột". */
    enableHiding?: boolean
    /** @deprecated alias — dùng `enableHiding` */
    enableColumnHiding?: boolean
    /** Bỏ qua khi xuất CSV (cột thao tác, icon, …) */
    excludeFromExport?: boolean
    /** Nhãn riêng khi xuất file, nếu khác header đang hiển thị trong bảng. */
    exportHeader?: string
    /** Nội dung riêng khi xuất file, hữu ích cho cell render phức tạp hoặc nested data. */
    exportValue?: (row: TData) => unknown
    /** Độ rộng cột XLSX mong muốn (đơn vị ký tự Excel). */
    exportWidth?: number
    /** Bật xuống dòng trong ô XLSX. */
    exportWrap?: boolean
    /** Class áp dụng lên `th`/`td` (vd. min-w-[120px]). */
    className?: string
    /** Tắt giới hạn tối đa 5 dòng nội dung ô (mặc định: bật cho cột dữ liệu). */
    disableCellLineClamp?: boolean
  }
}

export {}
