"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Globe, Loader2, Monitor, Save, Search, Settings2 } from "lucide-react"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { Textarea } from "@ui/components/textarea"
import { Tabs, TabsContent } from "@ui/components/tabs"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
  ADMIN_PUBLIC_BRANDING_QUERY_KEY,
  ADMIN_BRANDING_FALLBACK,
  ADMIN_PUBLIC_SITE_SEO_QUERY_KEY,
  ADMIN_SITE_SEO_PAGE_KEY,
  AdminAccessDeniedPanel,
  AdminDocumentHeadOverrideProvider,
  AdminReadOnlyHint, AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { Separator } from "@ui/components/separator"
import { TypographyPSmallMuted } from "@ui/components/typography"
import { SelectPicker, type SelectPickerOption } from "@ui/components/pickers"
import {
  canUserAccess,
  isSuperAdminRoleCode,
  PERMISSION_CODES,
} from "@workspace/api-client"
import { useAdminAuth as useAuth, useAdminPath } from "@workspace/admin-app/runtime"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import {
  extractSettingValue,
  getSettingsDisplayPreset,
  getSettingsSeoGlobalPreset,
  SETTINGS_DISPLAY_PRESETS,
  SETTINGS_SEO_GLOBAL_PRESETS,
  SettingsCombinedCopyButton,
  SettingsQuickPresets,
  SITE_SEO_PAGE_KEY,
  type SettingsTabId,
} from "./_component"
import {
  SettingsDisplayTabSkeleton,
  SettingsSeoGlobalTabSkeleton,
} from "./_component/settings-tab-skeletons"

const TAB_IDS: SettingsTabId[] = ["display", "seo-global"]

type PublicSiteSeoRow = {
  page: string
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
}

function parseTab(value: string | null): SettingsTabId {
  if (value === "seo-global") return "seo-global"
  if (value === "display") return "display"
  return "display"
}

export default function SettingsPage() {
  const router = useRouter()
  const adminPath = useAdminPath()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user: session } = useAuth()

  const canManageSettings =
    session != null && canUserAccess(session, PERMISSION_CODES.SETTINGS_MANAGE)
  const canViewSeo =
    session != null &&
    (canUserAccess(session, PERMISSION_CODES.SEO_METAS_VIEW) ||
      canUserAccess(session, PERMISSION_CODES.SEO_METAS_MANAGE))
  const canWriteSeo =
    session != null &&
    (canUserAccess(session, PERMISSION_CODES.SEO_METAS_MANAGE) ||
      canUserAccess(session, PERMISSION_CODES.SEO_METAS_CREATE) ||
      canUserAccess(session, PERMISSION_CODES.SEO_METAS_UPDATE) ||
      canManageSettings)
  const activeTab = parseTab(searchParams.get("tab"))

  const setActiveTab = useCallback(
    (tab: SettingsTabId) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", tab)
      router.replace(`${adminPath("settings")}?${params.toString()}`)
    },
    [adminPath, router, searchParams]
  )

  const publicBrandingQuery = useQuery({
    queryKey: ADMIN_PUBLIC_BRANDING_QUERY_KEY,
    queryFn: ({ signal }) => api.settings.getPublicBranding({ signal }),
    enabled: Boolean(session),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })

  const publicSiteSeoQuery = useQuery({
    queryKey: ADMIN_PUBLIC_SITE_SEO_QUERY_KEY,
    queryFn: ({ signal }) =>
      api.seoMetas.getPublicByPage<PublicSiteSeoRow>(ADMIN_SITE_SEO_PAGE_KEY, {
        signal,
      }),
    enabled: Boolean(session) && (canManageSettings || canViewSeo),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })

  const siteNameQuery = useQuery({
    queryKey: ["settings", "site_name"],
    queryFn: async () =>
      extractSettingValue(
        await api.settings.get("site_name"),
        ADMIN_BRANDING_FALLBACK.siteName
      ),
    enabled: Boolean(session) && canManageSettings,
  })
  const siteDescQuery = useQuery({
    queryKey: ["settings", "site_description"],
    queryFn: async () =>
      extractSettingValue(
        await api.settings.get("site_description"),
        "Quản trị hệ thống"
      ),
    enabled: Boolean(session) && canManageSettings,
  })
  const defaultRoleQuery = useQuery({
    queryKey: ["settings", "default_new_user_role"],
    queryFn: async () =>
      extractSettingValue(
        await api.settings.get("default_new_user_role"),
        "parent"
      ),
    enabled: Boolean(session) && canManageSettings,
  })
  const siteSeoQuery = useQuery({
    queryKey: ["seo-metas", "site", SITE_SEO_PAGE_KEY],
    queryFn: async () =>
      api.seoMetas.getByPage<{
        id: string
        page: string
        title: string | null
        description: string | null
        keywords: string | null
        ogTitle: string | null
        ogDescription: string | null
        ogImage: string | null
      }>(SITE_SEO_PAGE_KEY),
    enabled: Boolean(session) && (canManageSettings || canViewSeo),
  })

  const rolesQuery = useQuery({
    queryKey: ["settings", "roles-options"],
    queryFn: async () => {
      const result = await api.roles.list<Record<string, unknown>>({
        page: 1,
        limit: 200,
        status: "active",
      })
      const seen = new Set<string>()
      return {
        items: result.items
          .filter((r) => !isSuperAdminRoleCode(String(r.name ?? "")))
          .filter((r) => {
            const code = String(r.code ?? r.name ?? "").replace(/^"|"$/g, "")
            if (seen.has(code)) return false
            seen.add(code)
            return true
          })
          .map((r) => ({
            id: String(r.id ?? ""),
            code: String(r.code ?? r.name ?? "").replace(/^"|"$/g, ""),
            name: String(r.displayName ?? r.name ?? "").replace(/^"|"$/g, ""),
          })),
      }
    },
    enabled: Boolean(session) && canManageSettings,
  })

  const [siteName, setSiteName] = useState("")
  const [siteDesc, setSiteDesc] = useState("")
  const [defaultRole, setDefaultRole] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [seoOgTitle, setSeoOgTitle] = useState("")
  const [seoOgDescription, setSeoOgDescription] = useState("")
  const [seoOgImage, setSeoOgImage] = useState("")

  useEffect(() => {
    const branding = publicBrandingQuery.data
    if (!branding) return
    setSiteName((prev) => (prev === "" ? branding.siteName : prev))
    setSiteDesc((prev) => (prev === "" ? branding.siteDescription : prev))
  }, [publicBrandingQuery.data])

  useEffect(() => {
    if (
      !siteNameQuery.isSuccess ||
      !siteDescQuery.isSuccess ||
      !defaultRoleQuery.isSuccess
    ) {
      return
    }
    setSiteName(siteNameQuery.data ?? "")
    setSiteDesc(siteDescQuery.data ?? "")
    setDefaultRole(defaultRoleQuery.data ?? "")
  }, [
    siteNameQuery.isSuccess,
    siteNameQuery.data,
    siteDescQuery.isSuccess,
    siteDescQuery.data,
    defaultRoleQuery.isSuccess,
    defaultRoleQuery.data,
  ])

  useEffect(() => {
    const row = publicSiteSeoQuery.data
    if (!row) return
    setSeoTitle((prev) => (prev === "" ? (row.title ?? "") : prev))
    setSeoDescription((prev) => (prev === "" ? (row.description ?? "") : prev))
    setSeoKeywords((prev) => (prev === "" ? (row.keywords ?? "") : prev))
    setSeoOgTitle((prev) => (prev === "" ? (row.ogTitle ?? "") : prev))
    setSeoOgDescription((prev) =>
      prev === "" ? (row.ogDescription ?? "") : prev
    )
    setSeoOgImage((prev) => (prev === "" ? (row.ogImage ?? "") : prev))
  }, [publicSiteSeoQuery.data])

  useEffect(() => {
    if (siteSeoQuery.isLoading) return
    const row = siteSeoQuery.data
    setSeoTitle(row?.title ?? "")
    setSeoDescription(row?.description ?? "")
    setSeoKeywords(row?.keywords ?? "")
    setSeoOgTitle(row?.ogTitle ?? "")
    setSeoOgDescription(row?.ogDescription ?? "")
    setSeoOgImage(row?.ogImage ?? "")
  }, [siteSeoQuery.data, siteSeoQuery.isLoading])

  const displayTabLoading =
    canManageSettings &&
    (siteNameQuery.isPending || siteDescQuery.isPending) &&
    publicBrandingQuery.isPending

  const seoGlobalTabLoading =
    (canManageSettings || canViewSeo) &&
    siteSeoQuery.isPending &&
    publicSiteSeoQuery.isPending

  const defaultRoleLabel = useMemo(() => {
    const match = rolesQuery.data?.items.find((r) => r.code === defaultRole)
    return match?.name ?? null
  }, [rolesQuery.data?.items, defaultRole])

  const displayDirty =
    siteName !== (siteNameQuery.data ?? "") ||
    siteDesc !== (siteDescQuery.data ?? "") ||
    defaultRole !== (defaultRoleQuery.data ?? "")

  const siteSeoBaseline = siteSeoQuery.data
  const seoGlobalDirty =
    seoTitle !== (siteSeoBaseline?.title ?? "") ||
    seoDescription !== (siteSeoBaseline?.description ?? "") ||
    seoKeywords !== (siteSeoBaseline?.keywords ?? "") ||
    seoOgTitle !== (siteSeoBaseline?.ogTitle ?? "") ||
    seoOgDescription !== (siteSeoBaseline?.ogDescription ?? "") ||
    seoOgImage !== (siteSeoBaseline?.ogImage ?? "")

  const applyDisplayPreset = useCallback((presetId: string) => {
    const preset = getSettingsDisplayPreset(presetId)
    if (!preset) return
    setSiteName(preset.siteName)
    setSiteDesc(preset.siteDescription)
    setDefaultRole(preset.defaultNewUserRole)
  }, [])

  const applySeoGlobalPreset = useCallback((presetId: string) => {
    const preset = getSettingsSeoGlobalPreset(presetId)
    if (!preset) return
    setSeoTitle(preset.title)
    setSeoDescription(preset.description)
    setSeoKeywords(preset.keywords)
    setSeoOgTitle(preset.ogTitle)
    setSeoOgDescription(preset.ogDescription)
    setSeoOgImage(preset.ogImage)
  }, [])

  const saveDisplayMutation = useAdminMutation({
    toast: {
      loading: "Đang lưu cài đặt…",
      success: "Đã lưu cài đặt hiển thị",
      error: "Không lưu được cài đặt",
    },
    mutationFn: async () =>
      api.settings.update({
        site_name: siteName,
        site_description: siteDesc,
        default_new_user_role: defaultRole,
      }),
    onSuccess: async () => {
      queryClient.setQueryData(ADMIN_PUBLIC_BRANDING_QUERY_KEY, {
        siteName: siteName.trim(),
        siteDescription: siteDesc.trim(),
      })
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ADMIN_PUBLIC_BRANDING_QUERY_KEY,
        }),
        siteNameQuery.refetch(),
        siteDescQuery.refetch(),
        defaultRoleQuery.refetch(),
      ])
    },
  })

  const saveSiteSeoMutation = useAdminMutation({
    toast: {
      loading: "Đang lưu SEO mặc định…",
      success: "Đã lưu SEO mặc định toàn site",
      error: "Không lưu được SEO mặc định",
    },
    mutationFn: async () =>
      api.seoMetas.upsertByPage<{
        id: string
        page: string
        title: string | null
        description: string | null
        keywords: string | null
        ogTitle: string | null
        ogDescription: string | null
        ogImage: string | null
      }>({
        page: SITE_SEO_PAGE_KEY,
        title: seoTitle.trim() || null,
        description: seoDescription.trim() || null,
        keywords: seoKeywords.trim() || null,
        ogTitle: seoOgTitle.trim() || null,
        ogDescription: seoOgDescription.trim() || null,
        ogImage: seoOgImage.trim() || null,
        status: 1,
      }),
    onSuccess: async () => {
      queryClient.setQueryData(ADMIN_PUBLIC_SITE_SEO_QUERY_KEY, {
        page: SITE_SEO_PAGE_KEY,
        title: seoTitle.trim() || null,
        description: seoDescription.trim() || null,
        keywords: seoKeywords.trim() || null,
        ogTitle: seoOgTitle.trim() || null,
        ogDescription: seoOgDescription.trim() || null,
        ogImage: seoOgImage.trim() || null,
      } satisfies PublicSiteSeoRow)
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ADMIN_PUBLIC_SITE_SEO_QUERY_KEY,
        }),
        siteSeoQuery.refetch(),
      ])
    },
  })

  const visibleTabs = useMemo(() => {
    const tabs: SettingsTabId[] = []
    if (canManageSettings) tabs.push("display")
    if (canManageSettings || canViewSeo) tabs.push("seo-global")
    return tabs
  }, [canManageSettings, canViewSeo])

  useEffect(() => {
    if (searchParams.get("tab") === "seo-pages" && visibleTabs[0]) {
      setActiveTab(
        visibleTabs.includes("seo-global") ? "seo-global" : visibleTabs[0]
      )
      return
    }
    if (!visibleTabs.includes(activeTab) && visibleTabs[0]) {
      setActiveTab(visibleTabs[0])
    }
  }, [activeTab, searchParams, visibleTabs, setActiveTab])

  const documentHeadOverride = useMemo(
    () => ({
      siteName,
      siteDescription: siteDesc,
      metaTitle: seoTitle,
      metaDescription: seoDescription,
    }),
    [siteName, siteDesc, seoTitle, seoDescription]
  )

  if (!session) return null

  if (!canManageSettings && !canViewSeo) {
    return (
      <AdminPageSection>
        <AdminListPageHeader title="Cài đặt hệ thống" icon={Settings2} />
        <AdminAccessDeniedPanel
          user={session}
          requiredPermissions={[
            PERMISSION_CODES.SETTINGS_MANAGE,
            PERMISSION_CODES.SEO_METAS_VIEW,
          ]}
        />
      </AdminPageSection>
    )
  }

  return (
    <AdminDocumentHeadOverrideProvider value={documentHeadOverride}>
      <AdminPageGuard roles={["super_admin", "admin"]}>
        <AdminPageSection className="space-y-4">
          <AdminListPageHeader
            title="Cài đặt hệ thống"
            subtitle="Thương hiệu admin và SEO mặc định toàn site."
            icon={Settings2}
            actions={
              canManageSettings || canViewSeo ? (
                <SettingsCombinedCopyButton
                  display={
                    canManageSettings
                      ? {
                          siteName,
                          siteDescription: siteDesc,
                          defaultNewUserRole: defaultRole,
                          defaultNewUserRoleLabel: defaultRoleLabel,
                        }
                      : undefined
                  }
                  seoGlobal={
                    canManageSettings || canViewSeo
                      ? {
                          title: seoTitle,
                          description: seoDescription,
                          keywords: seoKeywords,
                          ogTitle: seoOgTitle,
                          ogDescription: seoOgDescription,
                          ogImage: seoOgImage,
                        }
                      : undefined
                  }
                  hasUnsavedChanges={
                    (canManageSettings && displayDirty) ||
                    (canWriteSeo && seoGlobalDirty)
                  }
                />
              ) : null
            }
          />

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              if (TAB_IDS.includes(v as SettingsTabId)) {
                setActiveTab(v as SettingsTabId)
              }
            }}
            className="space-y-4"
          >
            <AdminListTabsList>
              {canManageSettings ? (
                <AdminListTabsTrigger
                  value="display"
                  
                >
                  <Monitor className="size-4" aria-hidden />
                  Hiển thị & hệ thống
                </AdminListTabsTrigger>
              ) : null}
              {canManageSettings || canViewSeo ? (
                <AdminListTabsTrigger
                  value="seo-global"
                  
                >
                  <Globe className="size-4" aria-hidden />
                  SEO mặc định
                </AdminListTabsTrigger>
              ) : null}
            </AdminListTabsList>

            {canManageSettings ? (
              <TabsContent value="display" className="mt-0 space-y-4">
                {displayTabLoading ? <SettingsDisplayTabSkeleton /> : null}
                {!displayTabLoading ? (
                  <>
                    <SettingsQuickPresets
                      presets={SETTINGS_DISPLAY_PRESETS}
                      onApply={applyDisplayPreset}
                      disabled={saveDisplayMutation.isPending}
                    />
                    <FieldSet variant="section">
                      <FieldSectionLegend
                        icon={Monitor}
                        title="Hiển thị & hệ thống"
                        description="Thương hiệu admin và role mặc định cho tài khoản mới."
                      />
                      <FieldSetContent
                        variant="section"
                        className="space-y-5 pt-0"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="site-name">Tên ứng dụng</Label>
                            <Input
                              id="site-name"
                              value={siteName}
                              onChange={(e) => setSiteName(e.target.value)}
                              placeholder="HUB Parent"
                            />
                            <TypographyPSmallMuted>
                              Sidebar và tiêu đề trang quản trị.
                            </TypographyPSmallMuted>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="site-desc">Mô tả ngắn</Label>
                            <Input
                              id="site-desc"
                              value={siteDesc}
                              onChange={(e) => setSiteDesc(e.target.value)}
                              placeholder="Quản trị hệ thống"
                            />
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label htmlFor="default-role">Role mặc định</Label>
                          <SelectPicker
                            id="default-role"
                            value={defaultRole}
                            onChange={(v) =>
                              setDefaultRole(typeof v === "string" ? v : "")
                            }
                            options={(rolesQuery.data?.items ?? []).map(
                              (r): SelectPickerOption => ({
                                value: r.code,
                                label: r.name,
                              })
                            )}
                            placeholder="Chọn role mặc định"
                          />
                          <TypographyPSmallMuted>
                            Gán cho tài khoản đăng nhập lần đầu.
                          </TypographyPSmallMuted>
                        </div>
                      </FieldSetContent>
                    </FieldSet>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => saveDisplayMutation.mutate()}
                        disabled={
                          !displayDirty || saveDisplayMutation.isPending
                        }
                        className="min-w-[8rem] rounded-lg"
                      >
                        {saveDisplayMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        Lưu hiển thị
                      </Button>
                    </div>
                  </>
                ) : null}
              </TabsContent>
            ) : null}

            {canManageSettings || canViewSeo ? (
              <TabsContent value="seo-global" className="mt-0 space-y-4">
                {seoGlobalTabLoading ? <SettingsSeoGlobalTabSkeleton /> : null}
                {!seoGlobalTabLoading ? (
                  <>
                    {canWriteSeo ? (
                      <SettingsQuickPresets
                        presets={SETTINGS_SEO_GLOBAL_PRESETS}
                        onApply={applySeoGlobalPreset}
                        disabled={saveSiteSeoMutation.isPending}
                      />
                    ) : null}
                    <FieldSet variant="section">
                      <FieldSectionLegend
                        icon={Globe}
                        title="SEO mặc định toàn site"
                        description="Title, mô tả và từ khóa mặc định cho toàn hệ thống."
                      />
                      <FieldSetContent
                        variant="section"
                        className="space-y-4 pt-0"
                      >
                        {!canWriteSeo ? (
                          <AdminReadOnlyHint>
                            Chỉ xem — cần quyền SEO hoặc cài đặt để chỉnh sửa.
                          </AdminReadOnlyHint>
                        ) : null}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="seo-title">Title SEO</Label>
                            <Input
                              id="seo-title"
                              value={seoTitle}
                              onChange={(e) => setSeoTitle(e.target.value)}
                              disabled={!canWriteSeo}
                              placeholder="HUB Parent - Kết nối phụ huynh và nhà trường"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="seo-description">Mô tả meta</Label>
                            <Textarea
                              id="seo-description"
                              value={seoDescription}
                              onChange={(e) =>
                                setSeoDescription(e.target.value)
                              }
                              disabled={!canWriteSeo}
                              rows={3}
                              placeholder="Mô tả ngắn hiển thị trên Google và mạng xã hội"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="seo-keywords">Từ khóa</Label>
                            <Input
                              id="seo-keywords"
                              value={seoKeywords}
                              onChange={(e) => setSeoKeywords(e.target.value)}
                              disabled={!canWriteSeo}
                              placeholder="hub parent, phụ huynh, nhà trường"
                            />
                          </div>
                        </div>
                      </FieldSetContent>
                    </FieldSet>

                    <FieldSet variant="section">
                      <FieldSectionLegend
                        icon={Search}
                        title="Open Graph"
                        description="Khi chia sẻ link trên mạng xã hội."
                      />
                      <FieldSetContent
                        variant="section"
                        className="space-y-4 pt-0"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="seo-og-title">OG Title</Label>
                            <Input
                              id="seo-og-title"
                              value={seoOgTitle}
                              onChange={(e) => setSeoOgTitle(e.target.value)}
                              disabled={!canWriteSeo}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="seo-og-image">OG Ảnh (URL)</Label>
                            <Input
                              id="seo-og-image"
                              value={seoOgImage}
                              onChange={(e) => setSeoOgImage(e.target.value)}
                              disabled={!canWriteSeo}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="seo-og-description">OG Mô tả</Label>
                            <Textarea
                              id="seo-og-description"
                              value={seoOgDescription}
                              onChange={(e) =>
                                setSeoOgDescription(e.target.value)
                              }
                              disabled={!canWriteSeo}
                              rows={2}
                            />
                          </div>
                        </div>
                      </FieldSetContent>
                    </FieldSet>

                    {canWriteSeo ? (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => saveSiteSeoMutation.mutate()}
                          disabled={
                            !seoGlobalDirty || saveSiteSeoMutation.isPending
                          }
                          className="min-w-[8rem] rounded-lg"
                        >
                          {saveSiteSeoMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Save className="size-4" />
                          )}
                          Lưu SEO mặc định
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </TabsContent>
            ) : null}
          </Tabs>
        </AdminPageSection>
      </AdminPageGuard>
    </AdminDocumentHeadOverrideProvider>
  )
}
