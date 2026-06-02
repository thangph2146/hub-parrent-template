import type { RowData } from "@tanstack/react-table"

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
    filterPlaceholder?: string
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
    /** Ẩn khỏi bảng UI nhưng vẫn có thể dùng cho export nếu không exclude. */
    hideInTable?: boolean
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
  }
}

export {}
