"use client";

import { ConfirmActionDialog } from "@ui/components/dialogs";
import { ArchiveRestore } from "lucide-react";

export type FileStorageImportConfirmState = {
  file: File;
  sizeMb: string;
  step: "restore" | "overwrite";
};

type FileStorageImportConfirmDialogsProps = {
  state: FileStorageImportConfirmState | null;
  importing: boolean;
  onClose: () => void;
  onConfirmRestore: () => void;
  onConfirmOverwrite: () => void;
  onSkipOverwrite: () => void;
};

export function FileStorageImportConfirmDialogs({
  state,
  importing,
  onClose,
  onConfirmRestore,
  onConfirmOverwrite,
  onSkipOverwrite,
}: FileStorageImportConfirmDialogsProps) {
  const fileName = state?.file.name ?? "";

  return (
    <>
      <ConfirmActionDialog
        open={state?.step === "restore"}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        title="Khôi phục kho lưu trữ?"
        icon={<ArchiveRestore className="size-5 text-primary" />}
        description={
          <>
            Khôi phục từ file <strong>{fileName}</strong>
            {state?.sizeMb ? ` (${state.sizeMb} MB)` : ""}.
            <br />
            <br />
            ZIP từ «Tải về tất cả» hoặc backup legacy (admincp/,
            uploads/images/…). Bước tiếp theo bạn chọn ghi đè hay chỉ thêm file
            mới.
          </>
        }
        confirmLabel="Tiếp tục"
        cancelLabel="Huỷ"
        confirmLoading={importing}
        onConfirm={onConfirmRestore}
      />

      <ConfirmActionDialog
        open={state?.step === "overwrite"}
        onOpenChange={(open) => {
          if (!open) onSkipOverwrite();
        }}
        title="Chế độ khôi phục"
        icon={<ArchiveRestore className="size-5 text-primary" />}
        description={
          <>
            File trùng trong kho xử lý thế nào khi khôi phục{" "}
            <strong>{fileName}</strong>?
            <br />
            <br />
            <strong>Ghi đè tất cả</strong> — thay file trùng bằng bản trong ZIP
            (khuyến nghị khi khôi phục đầy đủ).
            <br />
            <strong>Chỉ thêm file mới</strong> — bỏ qua file đã tồn tại.
          </>
        }
        confirmLabel="Ghi đè tất cả"
        cancelLabel="Chỉ thêm file mới"
        confirmDestructive
        confirmLoading={importing}
        onConfirm={onConfirmOverwrite}
      />
    </>
  );
}
