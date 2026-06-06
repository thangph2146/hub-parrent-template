"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { useContactRequestDetail } from "@/hooks/queries";
import { useUpdateContactRequest } from "../_component/_query";
import { Switch } from "@ui/components/switch";
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailPageHeader,
  AdminDetailSidebar,
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
} from "@ui/components/admin";
import { TreePicker } from "@ui/components/pickers";
import {
  FieldSet,
  FieldSetContent,
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field";
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
import { formatDateTime } from "@workspace/api-client";
import type { ContactRequest } from "../_component/types";
import { CONTACT_REQUEST_STATUSES, CONTACT_REQUEST_STATUS_LABELS } from "../_component/types";
import { formatPhoneNumber } from "../_component/utils";
import { cn } from "@ui/lib/utils";

function ContactRequestDetailPageInner() {
  const params = useParams();
  const crudNav = useAdminCrudNavigation("/contact-requests");
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

  if (contactQuery.isLoading) return <AdminPageLoading />;
  if (!contact) return null;

  const parseStructuredContent = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim());
    const structured: Array<{ key: string; value: string; icon?: LucideIcon }> = [];
    let messageContent = "";

    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        const iconMap: Record<string, LucideIcon> = {
          "Địa chỉ": MapPin,
          "Chương trình": BookOpen,
          "Ngành": GraduationCap,
          "Đăng ký nhận thông tin tuyển sinh": Bell,
          "Đăng ký tư vấn": Bell,
          "Nội dung": MessageSquare,
        };
        structured.push({
          key: key.trim(),
          value: value.trim(),
          icon: iconMap[key.trim()] || undefined,
        });
      } else {
        messageContent += line + "\n";
      }
    }

    return { structured, messageContent: messageContent.trim() };
  };

  const { structured, messageContent } = parseStructuredContent(
    contact.content || contact.message || "",
  );

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title="Chi tiết yêu cầu liên hệ"
        variant="module"
        onBack={() => crudNav.list()}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={MessageSquare}
              title="Nội dung yêu cầu"
              description="Thông tin chi tiết về yêu cầu hoặc câu hỏi."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <FieldSectionField label="Tiêu đề" icon={MessageSquare}>
                <p className="text-base font-semibold">{contact.subject}</p>
              </FieldSectionField>

              {structured.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {structured.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                      >
                        {Icon && (
                          <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        )}
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
                <FieldSectionField label="Nội dung" icon={MessageSquare}>
                  <p className="whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm">
                    {messageContent}
                  </p>
                </FieldSectionField>
              )}
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <div className="sticky top-2 flex max-h-[calc(100vh-6rem)] flex-col gap-4 overflow-y-auto">
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={User}
                title="Thông tin liên hệ"
                description="Thông tin người gửi yêu cầu."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField label="Tên" icon={User} valueClassName="font-medium">
                  {contact.name}
                </FieldSectionField>
                <FieldSectionField label="Email" icon={Mail} valueClassName="font-mono">
                  {contact.email}
                </FieldSectionField>
                {contact.phone && (
                  <FieldSectionField label="SĐT" icon={Phone} valueClassName="font-mono">
                    {formatPhoneNumber(contact.phone)}
                  </FieldSectionField>
                )}
              </FieldSetContent>
            </FieldSet>

            <FieldSet variant="section">
              <FieldSectionLegend
                icon={CircleDot}
                title="Trạng thái xử lý"
                description="Tình trạng và mức độ ưu tiên của yêu cầu."
              />
              <FieldSetContent variant="section" className="space-y-4 pt-0">
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
                        <span
                          className={cn(
                            "text-sm font-medium",
                            contact.isRead ? "text-emerald-600" : "text-muted-foreground",
                          )}
                        >
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

                <FieldSectionDivider />
                <div>
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
                  <>
                    <FieldSectionDivider />
                    <FieldSectionField label="Người phụ trách" icon={UserCircle} valueClassName="font-medium">
                      {contact.assignedToName}
                    </FieldSectionField>
                  </>
                )}
              </FieldSetContent>
            </FieldSet>

            <FieldSet variant="section">
              <FieldSectionLegend
                icon={CalendarClock}
                title="Thời gian"
                description="Mốc thời gian tạo và cập nhật yêu cầu."
              />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                <FieldSectionField label="Tạo lúc" icon={CalendarClock}>
                  {formatDateTime(contact.createdAt)}
                </FieldSectionField>
                <FieldSectionField label="Cập nhật lần cuối" icon={CalendarClock}>
                  {formatDateTime(contact.updatedAt)}
                </FieldSectionField>
              </FieldSetContent>
            </FieldSet>
          </div>
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
