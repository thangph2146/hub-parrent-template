import type { User } from "@workspace/api-client";

export type StaffRow = User;

export type StaffBulkActionKind =
  | "delete"
  | "restore"
  | "purge"
  | "active"
  | "unactive";

export interface StaffConfirmAction {
  kind: StaffBulkActionKind;
  row: StaffRow;
}
