"use client"

import { useMemo, useState } from "react"
import { Loader2, ListChecks, ListX, Sparkles } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { Label } from "@ui/components/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import { TreeMultiSelectInline } from "@ui/components/typing"
import { TypographyPSmallMuted } from "@ui/components/typography"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell"
import { api } from "@/lib/api"
import { useAdminMutation } from "@/hooks/use-admin-mutation"
import {
  listAllPresetPagePaths,
  resolveSettingsSeoPagesSelection,
  SETTINGS_SEO_PAGES_PRESET_GROUPS,
} from "./settings-seo-pages-presets"

type SettingsSeoPagesQuickPresetsProps = {
  onApplied?: () => void | Promise<void>
  disabled?: boolean
}

export function SettingsSeoPagesQuickPresets({
  onApplied,
  disabled,
}: SettingsSeoPagesQuickPresetsProps) {
  const [activeGroupId, setActiveGroupId] = useState(
    SETTINGS_SEO_PAGES_PRESET_GROUPS[0]?.id ?? "hub-parent",
  )
  const [selected, setSelected] = useState<string[]>([])

  const activeGroup = useMemo(
    () =>
      SETTINGS_SEO_PAGES_PRESET_GROUPS.find(
        (group) => group.id === activeGroupId,
      ) ?? SETTINGS_SEO_PAGES_PRESET_GROUPS[0],
    [activeGroupId],
  )

  const resolvedPages = useMemo(() => {
    if (!activeGroup) return []
    return resolveSettingsSeoPagesSelection(selected, activeGroup)
  }, [activeGroup, selected])

  const applyMutation = useAdminMutation({
    toast: {
      loading: "Đang gắn SEO trang từ mẫu…",
      success: (data) =>
        `Đã gắn SEO cho ${Array.isArray(data) ? data.length : 0} trang`,
      error: "Không gắn được SEO trang từ mẫu",
    },
    mutationFn: async (pages: string[]) => {
      if (!activeGroup) return pages
      for (const page of pages) {
        const preset = activeGroup.pages[page]
        if (!preset) continue
        await api.seoMetas.upsertByPage({
          page: preset.page,
          title: preset.title,
          description: preset.description,
          keywords: preset.keywords,
          ogTitle: preset.ogTitle,
          ogDescription: preset.ogDescription,
          ogImage: preset.ogImage,
          status: 1,
        })
      }
      return pages
    },
    onSuccess: async () => {
      setSelected([])
      await onApplied?.()
    },
  })

  if (!activeGroup) return null

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-border/80 bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <Label className="text-sm font-medium">Gắn nhanh SEO theo trang</Label>
          </div>
          <TypographyPSmallMuted>
            Chọn trang trong cây route, bấm gắn để tạo/cập nhật metadata qua{" "}
            <code className="text-xs">PUT /admin/seo-metas/upsert</code>.
          </TypographyPSmallMuted>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {resolvedPages.length} trang
        </Badge>
      </div>

      <Tabs
        value={activeGroupId}
        onValueChange={(value) => {
          setActiveGroupId(value)
          setSelected([])
        }}
        className="space-y-3"
      >
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          {SETTINGS_SEO_PAGES_PRESET_GROUPS.map((group) => (
            <TabsTrigger
              key={group.id}
              value={group.id}
              className={ADMIN_LIST_TABS_TRIGGER_CLASS}
              title={group.hint}
            >
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SETTINGS_SEO_PAGES_PRESET_GROUPS.map((group) => (
          <TabsContent key={group.id} value={group.id} className="mt-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg text-xs"
                disabled={disabled || applyMutation.isPending}
                onClick={() =>
                  setSelected(listAllPresetPagePaths(group))
                }
              >
                <ListChecks className="size-3.5" aria-hidden />
                Chọn tất cả ({listAllPresetPagePaths(group).length})
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg text-xs text-muted-foreground"
                disabled={
                  disabled || applyMutation.isPending || selected.length === 0
                }
                onClick={() => setSelected([])}
              >
                <ListX className="size-3.5" aria-hidden />
                Bỏ chọn
              </Button>
            </div>

            <div className="rounded-lg border bg-background p-2">
              <TreeMultiSelectInline
                value={selected}
                onChange={(value) =>
                  setSelected(Array.isArray(value) ? (value as string[]) : [])
                }
                options={group.tree}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <TypographyPSmallMuted>
          Đường dẫn động dùng ký hiệu{" "}
          <code className="text-xs">[slug]</code> — storefront tra cứu theo pattern
          tương ứng.
        </TypographyPSmallMuted>
        <Button
          type="button"
          className="min-w-[10rem] rounded-lg"
          disabled={
            disabled || applyMutation.isPending || resolvedPages.length === 0
          }
          onClick={() => applyMutation.mutate(resolvedPages)}
        >
          {applyMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Gắn {resolvedPages.length || ""} trang
        </Button>
      </div>
    </div>
  )
}
