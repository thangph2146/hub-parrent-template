"use client";

import { useEffect, createElement } from "react";
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation";
import { toast } from "@ui/components/sonner";
import {
  Calendar,
  Clock,
  FolderTree,
  Tag,
  FileText,
  Layers,
  Hash,
  ChevronRight,
  File,
} from "lucide-react";
import { resolveIcon } from "@ui/lib/icons";
import { Badge } from "@ui/components/badge";
import {
  FieldSet,
  FieldSetContent,
  FieldSectionBadge,
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field";
import { AdminPageGuard, AdminPageSection, AdminPageLoading, AdminDetailPageHeader, AdminDetailLayout, AdminDetailMain, AdminDetailSidebar } from "@ui/components/admin";
import { useAuth } from "@/providers/auth-provider";
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client";
import { api } from "@/lib/api";
import { formatDateTime, useCategoryDetailQuery } from "../_component";
import type { CategoryDetail } from "../_component";
import type { LucideIcon } from "lucide-react";


function SidebarInfoRow({ icon: Icon, label, value, children }: { icon: LucideIcon; label: string; value?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div className="flex size-7 items-center justify-center rounded-md bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {children ?? (value ? <p className="text-sm font-medium">{value}</p> : null)}
      </div>
    </div>
  );
}

function ListItem({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  badge,
  onClick,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-muted/40 border-0 border-t border-slate-100 dark:border-border/60 first:border-t-0"
      onClick={onClick}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-muted">
        <Icon className={iconClassName ?? "size-4 text-muted-foreground"} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {badge}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function DetailSidebar({ category, ParentIcon }: { category: CategoryDetail; ParentIcon: ReturnType<typeof resolveIcon> | null }) {
  return (
    <div className="sticky top-2 flex flex-col gap-4">
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Calendar}
          title="Thời gian"
          description="Mốc thời gian tạo và cập nhật."
        />
        <FieldSetContent variant="section" className="space-y-3 pt-0">
          <SidebarInfoRow icon={Calendar} label="Ngày tạo" value={formatDateTime(category.createdAt)} />
          <SidebarInfoRow icon={Clock} label="Cập nhật lần cuối" value={formatDateTime(category.updatedAt)} />
        </FieldSetContent>
      </FieldSet>

      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Layers}
          title="Phân cấp & Thống kê"
          description="Cấu trúc phân cấp và số lượng nội dung."
        />
        <FieldSetContent variant="section" className="space-y-3 pt-0">
          <SidebarInfoRow icon={FolderTree} label="Danh mục cha">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              {ParentIcon && createElement(ParentIcon, { className: "size-3.5 text-muted-foreground" })}
              {category.parentName ?? "Cấp gốc"}
            </p>
          </SidebarInfoRow>
          <SidebarInfoRow icon={Layers} label="Danh mục con" value={`${category._count.children} mục`} />
          <SidebarInfoRow icon={FileText} label="Bài viết" value={`${category.postCount} bài`} />
        </FieldSetContent>
      </FieldSet>
    </div>
  );
}

function CategoryDetailInner() {
  const crudNav = useAdminCrudNavigation("/categories");
  const postsNav = useAdminCrudNavigation("/posts");
  const params = useParams();
  const categoryId = params.id as string;
  const { user } = useAuth();
  const canUpdate = user ? canUserAccess(user, PERMISSION_CODES.CATEGORIES_UPDATE) : false;

  const { data: category, isLoading, isError } = useCategoryDetailQuery(api, categoryId);

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được danh mục");
      crudNav.list();
    }
  }, [isError, crudNav]);

  if (isLoading) return <AdminPageLoading />;

  if (!category) return null;

  const ParentIcon = category.parentIcon ? resolveIcon(category.parentIcon) : null;

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={category.name}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Danh mục</span>
            <span className="mx-1.5 text-muted-foreground/40">/</span>
            {category.parentName ?? "Cấp gốc"}
          </>
        }
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={
          canUpdate ? () => crudNav.edit(String(categoryId)) : undefined
        }
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Tag}
              title="Thông tin danh mục"
              description="Slug, danh mục cha và mô tả."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField label="Slug / đường dẫn" icon={Hash}>
                  <p className="font-mono font-medium">{category.slug}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">
                    /danh-muc/{category.slug}
                  </p>
                </FieldSectionField>
                <FieldSectionField label="Danh mục cha" icon={FolderTree}>
                  <p className="flex items-center gap-1.5 font-medium">
                    {ParentIcon && createElement(ParentIcon, { className: "size-4 shrink-0 text-muted-foreground" })}
                    {category.parentName ?? "Cấp gốc"}
                  </p>
                </FieldSectionField>
              </div>

              {category.description ? (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Mô tả" icon={FileText}>
                    <p className="leading-relaxed">{category.description}</p>
                  </FieldSectionField>
                </>
              ) : null}
            </FieldSetContent>
          </FieldSet>

          {category.children.length > 0 && (
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={FolderTree}
                title="Danh mục con"
                description="Các danh mục con trực thuộc."
                badge={<FieldSectionBadge>{category.children.length}</FieldSectionBadge>}
              />
              <FieldSetContent variant="section" className="px-0 pb-0 pt-0">
                <div className="flex flex-col">
                  {category.children.map((child) => (
                    <ListItem
                      key={child.id}
                      icon={FolderTree}
                      iconClassName="size-4 text-primary"
                      title={child.name}
                      subtitle={`/danh-muc/${child.slug}`}
                      badge={
                        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                          <span>{child._count.children} con</span>
                          <span>{child.postCount} bài</span>
                        </div>
                      }
                      onClick={() => crudNav.view(String(child.id))}
                    />
                  ))}
                </div>
              </FieldSetContent>
            </FieldSet>
          )}

          {category.posts.length > 0 && (
            <FieldSet variant="section">
              <FieldSectionLegend
                icon={File}
                title="Bài viết liên quan"
                description="Các bài viết được gắn danh mục này."
                badge={<FieldSectionBadge>{category.postCount}</FieldSectionBadge>}
              />
              <FieldSetContent variant="section" className="px-0 pb-0 pt-0">
                <div className="flex flex-col">
                  {category.posts.map((post) => (
                    <ListItem
                      key={post.id}
                      icon={File}
                      title={post.title}
                      subtitle={formatDateTime(post.createdAt)}
                      badge={
                        <Badge variant={post.published ? "default" : "outline"} className="shrink-0">
                          {post.published ? "Đã đăng" : "Nháp"}
                        </Badge>
                      }
                      onClick={() => postsNav.view(String(post.id))}
                    />
                  ))}
                </div>
              </FieldSetContent>
            </FieldSet>
          )}
        </AdminDetailMain>

        <AdminDetailSidebar>
          <DetailSidebar category={category} ParentIcon={ParentIcon} />
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  );
}

export default function CategoryDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <CategoryDetailInner />
    </AdminPageGuard>
  );
}
