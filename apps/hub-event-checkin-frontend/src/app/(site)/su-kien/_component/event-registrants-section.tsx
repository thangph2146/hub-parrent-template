"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { DataTable } from "@ui/components/data-table";
import type { PublicEventRegistrant } from "@/lib/public-events";
import { formatEventDateTime } from "@/lib/public-events";

type EventRegistrantsSectionProps = {
  registrants: PublicEventRegistrant[];
  totalRegistrations: number;
  eventTitle?: string;
  embedded?: boolean;
};

function registrantInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function RegistrantsList({
  registrants,
  totalRegistrations,
  eventTitle,
}: {
  registrants: PublicEventRegistrant[];
  totalRegistrations: number;
  eventTitle?: string;
}) {
  const count = Math.max(totalRegistrations, registrants.length);
  const exportGeneratedAt = useMemo(
    () => new Date().toLocaleString("vi-VN"),
    [registrants.length, totalRegistrations],
  );
  const columns = useMemo<ColumnDef<PublicEventRegistrant, unknown>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        enableSorting: false,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "fullName",
        header: "Sinh viên",
        enableColumnFilter: false,
        cell: ({ row }) => (
          <span className="inline-flex max-w-full items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {registrantInitials(row.original.fullName)}
            </span>
            <span className="truncate font-medium">{row.original.fullName}</span>
          </span>
        ),
      },
      {
        accessorKey: "registeredAt",
        header: "Thời gian đăng ký",
        enableColumnFilter: false,
        cell: ({ getValue }) => formatEventDateTime(getValue() as string | null) ?? "—",
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Danh sách hiển thị công khai — không bao gồm email hoặc số điện thoại.
      </p>
      <DataTable
        data={registrants}
        columns={columns}
        emptyLabel={
          count > 0
            ? `Đã có ${count} lượt đăng ký. Chi tiết danh sách đang được cập nhật.`
            : "Chưa có sinh viên đăng ký."
        }
        getGlobalFilterText={(row) => [row.fullName, row.registeredAt]
          .filter(Boolean)
          .join(" ")}
        globalFilterPlaceholder="Tìm sinh viên đã đăng ký..."
        xlsxExport={{
          fileName: "sinh-vien-dang-ky.xlsx",
          sheetName: "Dang ky",
          title: "DANH SÁCH SINH VIÊN ĐÃ ĐĂNG KÝ",
          subtitle: "HUB Events — danh sách công khai",
          metadata: [
            ...(eventTitle?.trim()
              ? [{ label: "Sự kiện", value: eventTitle.trim() }]
              : []),
            { label: "Ngày xuất", value: exportGeneratedAt },
            { label: "Số bản ghi trang", value: registrants.length },
            { label: "Tổng đăng ký", value: count },
          ],
        }}
      />
      {count > registrants.length && registrants.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Hiển thị {registrants.length} / {count} sinh viên gần đây.
        </p>
      ) : null}
    </div>
  );
}

export function EventRegistrantsSection({
  registrants,
  totalRegistrations,
  eventTitle,
  embedded = false,
}: EventRegistrantsSectionProps) {
  const count = Math.max(totalRegistrations, registrants.length);
  if (!embedded && count === 0 && registrants.length === 0) return null;

  const body = (
    <RegistrantsList
      registrants={registrants}
      totalRegistrations={totalRegistrations}
      eventTitle={eventTitle}
    />
  );

  if (embedded) return body;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <UserRound className="size-5 text-primary" />
          Sinh viên đã đăng ký
          <Badge variant="secondary" className="font-normal tabular-nums">
            {count}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
