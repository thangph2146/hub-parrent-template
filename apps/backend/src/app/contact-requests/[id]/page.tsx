"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useContactRequestDetail } from "@/hooks/queries";
import { useUpdateContactRequest } from "../_component/_query";
import { Switch } from "@ui/components/switch";

import { AdminDetailLayout, AdminDetailMain, AdminDetailPageHeader, AdminDetailSidebar, AdminPageGuard, AdminPageLoading, AdminPageSection } from "@ui/components/admin";
import { TreePicker } from "@ui/components/pickers";
import { TypographyH3 } from "@ui/components/typography";
import {
  Mail,
  Phone,
  User,
  CalendarClock,
  CircleDot,
  CircleCheck,
  UserCircle,
  MapPin,
  BookOpen,
  GraduationCap,
  Bell,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Divider } from "@ui/components/layout";
import { formatDateTime } from "@workspace/api-client";
import type { ContactRequest } from "../_component/types";
import { CONTACT_REQUEST_STATUSES, CONTACT_REQUEST_STATUS_LABELS } from "../_component/types";
import { formatPhoneNumber } from "../_component/utils";
import { cn } from "@ui/lib/utils";

function ContactRequestDetailPageInner() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const contactQuery = useContactRequestDetail(contactId);
  const contact = contactQuery.data as ContactRequest | undefined;
  const updateMutation = useUpdateContactRequest();

  const handleToggleRead = useCallback(() => {
    if (!contact) return;
    updateMutation.mutate({
      id: contactId,
      input: { isRead: !contact.isRead },
    });
  }, [contact, contactId, updateMutation]);

  const handleStatusChange = useCallback((value: string) => {
    updateMutation.mutate({
      id: contactId,
      input: { status: value as ContactRequest["status"] },
    });
  }, [contactId, updateMutation]);

  const handlePriorityChange = useCallback((value: string) => {
    updateMutation.mutate({
      id: contactId,
      input: { priority: value as "HIGH" | "MEDIUM" | "LOW" },
    });
  }, [contactId, updateMutation]);

  if (contactQuery.isLoading) {
    return <AdminPageLoading />;
  }

  if (!contact) return null;

  // Parse structured content (key-value pairs)
  const parseStructuredContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const structured: Array<{ key: string; value: string; icon?: LucideIcon }> = [];
    let messageContent = '';

    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        const iconMap: Record<string, LucideIcon> = {
          'Địa chỉ': MapPin,
          'Chương trình': BookOpen,
          'Ngành': GraduationCap,
          'Đăng ký nhận thông tin tuyển sinh': Bell,
          'Đăng ký tư vấn': Bell,
          'Nội dung': MessageSquare,
        };
        structured.push({
          key: key.trim(),
          value: value.trim(),
          icon: iconMap[key.trim()] || undefined,
        });
      } else {
        messageContent += line + '\n';
      }
    }

    return { structured, messageContent: messageContent.trim() };
  };

  const { structured, messageContent } = parseStructuredContent(contact.content || contact.message || "");

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title="Chi tiết yêu cầu liên hệ"
        variant="module"
        onBack={() => router.push("/contact-requests")}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <Card className="border border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="size-5 text-primary" />
                Nội dung yêu cầu
              </CardTitle>
              <CardDescription>
                Thông tin chi tiết về yêu cầu hoặc câu hỏi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Tiêu đề</p>
                <TypographyH3 className="text-base font-semibold text-foreground">
                  {contact.subject}
                </TypographyH3>
              </div>
              {structured.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {structured.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                        {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-muted-foreground">{item.key}</p>
                          <p className="text-sm font-medium">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {messageContent && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Nội dung</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
                    {messageContent}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <Card className="sticky top-2 max-h-[calc(100vh-6rem)] overflow-y-auto border border-border/70 shadow-sm">
            <Divider label={<><User className="size-3.5 text-primary" /><span>Liên hệ</span></>} />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="size-5 text-primary" />
                Thông tin liên hệ
              </CardTitle>
              <CardDescription>
                Thông tin người gửi yêu cầu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">Tên</p>
                  <p className="text-sm font-medium">{contact.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">Email</p>
                  <p className="font-mono text-sm">{contact.email}</p>
                </div>
              </div>
              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground">SĐT</p>
                    <p className="font-mono text-sm">{formatPhoneNumber(contact.phone)}</p>
                  </div>
                </div>
              )}
            </CardContent>

            <Divider label={<><CircleDot className="size-3.5 text-primary" /><span>Xử lý</span></>} />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CircleDot className="size-5 text-primary" />
                Trạng thái xử lý
              </CardTitle>
              <CardDescription>
                Tình trạng và mức độ ưu tiên của yêu cầu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Trạng thái</p>
                  <div className="mt-1.5">
                    <TreePicker
                      value={contact.status}
                      onChange={(v) => v && handleStatusChange(v as string)}
                      options={CONTACT_REQUEST_STATUSES.map((s) => ({
                        value: s,
                        label: CONTACT_REQUEST_STATUS_LABELS[s],
                      }))}
                      placeholder="Chọn trạng thái"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Đã đọc</p>
                  <div className="mt-1.5 flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {contact.isRead ? (
                        <CircleCheck className="size-4 text-emerald-600" aria-hidden />
                      ) : (
                        <CircleDot className="size-4 text-muted-foreground" aria-hidden />
                      )}
                      <span className={cn("text-sm font-medium", contact.isRead ? "text-emerald-600" : "text-muted-foreground")}>
                        {contact.isRead ? "Đã đọc" : "Chưa đọc"}
                      </span>
                    </div>
                    <Switch
                      checked={contact.isRead}
                      onCheckedChange={handleToggleRead}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground">Ưu tiên</p>
                <div className="mt-1.5">
                  <TreePicker
                    value={contact.priority || "MEDIUM"}
                    onChange={(v) => v && handlePriorityChange(v as string)}
                    options={[
                      { value: "HIGH", label: "Cao" },
                      { value: "MEDIUM", label: "Trung bình" },
                      { value: "LOW", label: "Thấp" },
                    ]}
                    placeholder="Chọn mức ưu tiên"
                  />
                </div>
              </div>
              {contact.assignedToName && (
                <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                  <UserCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground">Người phụ trách</p>
                    <p className="text-sm font-medium">{contact.assignedToName}</p>
                  </div>
                </div>
              )}
            </CardContent>

            <Divider label={<><CalendarClock className="size-3.5 text-primary" /><span>Thời gian</span></>} />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarClock className="size-5 text-primary" />
                Thời gian
              </CardTitle>
              <CardDescription>
                Mốc thời gian tạo và cập nhật yêu cầu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">Tạo lúc</p>
                  <p className="text-sm">{formatDateTime(contact.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">Cập nhật lần cuối</p>
                  <p className="text-sm">{formatDateTime(contact.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  );
}

export default function ContactRequestDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <ContactRequestDetailPageInner />
    </AdminPageGuard>
  );
}
