"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Star,
  BookCheck,
  Award,
  ScrollText,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"
import { cn } from "@ui/lib/utils"
import { api } from "@/lib/api"
import { StudentScoresSection } from "./student-scores-section"
import type {
  DetailedScore,
  YearAverage,
  TermAverage,
  OverallAverage,
} from "@/types/student-scores"

const MOCK_DETAILED_SCORES: DetailedScore[] = [
  { studyUnitID: "1", studyUnitAlias: "IT101-01", curriculumID: "IT101", curriculumName: "Nhập môn lập trình", yearStudy: "2024-2025", termID: "1", classStudentID: "C01", classStudentName: "Lớp 01", studyProgramID: "P01", studyProgramName: "Cử nhân CNTT", studyTypeID: "T01", studyTypeName: "Chính quy", mark10: 8.5, mark4: 3.5, markLetter: "A" },
  { studyUnitID: "2", studyUnitAlias: "IT102-01", curriculumID: "IT102", curriculumName: "Cấu trúc dữ liệu & Giải thuật", yearStudy: "2024-2025", termID: "1", classStudentID: "C01", classStudentName: "Lớp 01", studyProgramID: "P01", studyProgramName: "Cử nhân CNTT", studyTypeID: "T01", studyTypeName: "Chính quy", mark10: 7.2, mark4: 2.8, markLetter: "B" },
]

const MOCK_YEAR_AVERAGES: YearAverage[] = [
  { yearStudy: "2024-2025", averageScore10: 7.4, averageScore4: 2.8, averageGatherScore10: 7.4, averageGatherScore4: 2.8, updateDate: "2025-06-15" },
]

const MOCK_TERM_AVERAGES: TermAverage[] = [
  { yearStudy: "2024-2025", termID: "1", orderTerm: 1, averageScore10: 7.55, averageScore4: 2.88, averageGatherScore10: 7.55, averageGatherScore4: 2.88, updateDate: "2025-01-15" },
]

const MOCK_OVERALL_AVERAGE: OverallAverage = {
  averageScore10: 7.45,
  averageScore4: 2.85,
  averageGatherScore10: 7.45,
  averageGatherScore4: 2.85,
  isModified: false,
  updateStaff: null,
  updateDate: "2026-01-20",
}

export type GradeDialogTarget = {
  studentCode: string
  studentName: string | null
}

export function StudentGradeDialog({
  target,
  onClose,
}: {
  target: GradeDialogTarget | null
  onClose: () => void
}) {
  const open = target != null
  const studentCode = target?.studentCode ?? ""
  const studentName = target?.studentName ?? null
  const isDev = process.env.NODE_ENV === "development"

  const { data: detailedScores, isLoading: isLoadingDetailed } = useQuery<
    DetailedScore[]
  >({
    queryKey: ["student-scores", "detailed", studentCode],
    queryFn: async () => {
      if (isDev) return MOCK_DETAILED_SCORES
      return api.myStudents.getDetailedScores<DetailedScore>(studentCode)
    },
    enabled: open && Boolean(studentCode),
    retry: false,
  })

  const { data: yearAverages, isLoading: isLoadingYear } = useQuery<YearAverage[]>(
    {
      queryKey: ["student-averages", "year", studentCode],
      queryFn: async () => {
        if (isDev) return MOCK_YEAR_AVERAGES
        return api.myStudents.getYearAverages<YearAverage>(studentCode)
      },
      enabled: open && Boolean(studentCode),
      retry: false,
    },
  )

  const { data: termAverages, isLoading: isLoadingTerm } = useQuery<TermAverage[]>(
    {
      queryKey: ["student-averages", "terms", studentCode],
      queryFn: async () => {
        if (isDev) return MOCK_TERM_AVERAGES
        return api.myStudents.getTermAverages<TermAverage>(studentCode)
      },
      enabled: open && Boolean(studentCode),
      retry: false,
    },
  )

  const { data: overallAverage } = useQuery<OverallAverage | null>({
    queryKey: ["student-averages", "overall", studentCode],
    queryFn: async () => {
      if (isDev) return MOCK_OVERALL_AVERAGE
      return api.myStudents.getOverallAverage<OverallAverage>(studentCode)
    },
    enabled: open && Boolean(studentCode),
    retry: false,
  })

  const resolvedDetailed = isDev ? MOCK_DETAILED_SCORES : detailedScores
  const resolvedYear = isDev ? MOCK_YEAR_AVERAGES : yearAverages
  const resolvedTerm = isDev ? MOCK_TERM_AVERAGES : termAverages
  const resolvedOverall = isDev ? MOCK_OVERALL_AVERAGE : overallAverage

  const overallGpa =
    resolvedOverall?.averageGatherScore10 ??
    resolvedOverall?.averageScore10 ??
    resolvedOverall?.averageGatherScore4 ??
    resolvedOverall?.averageScore4 ??
    null
  const passedSubjects =
    resolvedDetailed?.filter((s) => s.mark10 != null && s.mark10 >= 5).length ??
    null
  const totalSubjects = resolvedDetailed?.length ?? null

  const isTenScale =
    resolvedOverall?.averageGatherScore10 != null ||
    resolvedOverall?.averageScore10 != null
  const rank =
    overallGpa != null
      ? isTenScale
        ? overallGpa >= 8.0
          ? "Giỏi"
          : overallGpa >= 6.5
            ? "Khá"
            : overallGpa >= 5.0
              ? "Trung bình"
              : "Yếu"
        : overallGpa >= 3.6
          ? "Giỏi"
          : overallGpa >= 2.5
            ? "Khá"
            : overallGpa >= 2.0
              ? "Trung bình"
              : "Yếu"
      : null

  const statCards = [
    {
      label: "GPA tổng",
      value: overallGpa?.toFixed(2) ?? null,
      icon: Star,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      iconBg:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Tín chỉ tích lũy",
      value: null,
      icon: BookCheck,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Môn đã đạt",
      value:
        passedSubjects != null ? `${passedSubjects}/${totalSubjects}` : null,
      icon: ScrollText,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      iconBg:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Xếp loại",
      value: rank,
      icon: Award,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      iconBg:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
  ]

  const showStats = overallGpa != null || passedSubjects != null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Kết quả học tập —{" "}
            <span className="font-bold">{studentName ?? studentCode}</span>
          </DialogTitle>
          {studentName && (
            <DialogDescription className="font-mono text-xs">
              {studentCode}
            </DialogDescription>
          )}
        </DialogHeader>

        {showStats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map((s) => {
              const Icon = s.icon
              return (
                <Card key={s.label} size="sm" className={cn("border-0", s.bg)}>
                  <CardHeader className="flex-row items-center gap-2 pb-1">
                    <div
                      className={cn(
                        "flex size-6 items-center justify-center rounded",
                        s.iconBg,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      {s.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div
                      className={cn(
                        "text-lg font-bold leading-tight tracking-tight",
                        s.color,
                      )}
                    >
                      {s.value ?? "—"}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <StudentScoresSection
          isActive
          studentName={studentName}
          detailedScores={resolvedDetailed}
          isLoadingDetailed={isLoadingDetailed}
          yearAverages={resolvedYear}
          isLoadingYear={isLoadingYear}
          termAverages={resolvedTerm}
          isLoadingTerm={isLoadingTerm}
        />
      </DialogContent>
    </Dialog>
  )
}

/** Mã SV mẫu để xem bảng điểm demo trong development. */
export const DEMO_GRADE_STUDENT = {
  code: "SV2024001",
  name: "Nguyễn Văn An",
} as const
