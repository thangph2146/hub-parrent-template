export type MyStudentRow = {
  id: string
  parentId: string
  studentCode: string
  studentName: string | null
  note: string | null
  status: "pending" | "approved" | "rejected"
  reviewedAt: string | null
  createdAt: string
}
