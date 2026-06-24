"use client"

import type { ReactNode } from "react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/tooltip"
import { cn } from "@ui/lib/utils"
import {
  ChevronRight,
  FolderOpen,
  Home,
  Layers,
  Loader2,
  Search,
  X,
} from "lucide-react"
import { useFolderNavSearch } from "../_hooks"
import {
  diskPathToNavPath,
  formatStorageFolderLabel,
  formatStorageFolderPathHint,
  normalizeHomeFolderPath,
} from "../shared/folder-domain"
import type { StorageRealm, StorageTab } from "../shared/types"

type FileStorageFolderNavProps = {
  realm: StorageRealm
  realmLabel: string
  breadcrumb: Array<{ id: string; label: string }>
  childFolders: StorageTab[]
  activeFolderPath: string
  includeDescendants: boolean
  onIncludeDescendantsChange: (value: boolean) => void
  onNavigate: (folderPath: string) => void
  foldersRefreshKey?: number
  /** Khi set — nút Home quay về folder này thay vì root realm. */
  homeFolderPath?: string
  actions?: ReactNode
  className?: string
}

export function FileStorageFolderNav({
  realm,
  realmLabel,
  breadcrumb,
  childFolders,
  activeFolderPath,
  includeDescendants,
  onIncludeDescendantsChange,
  onNavigate,
  foldersRefreshKey = 0,
  homeFolderPath,
  actions,
  className,
}: FileStorageFolderNavProps) {
  const homePath = normalizeHomeFolderPath(homeFolderPath)
  const {
    searchInputId,
    listId,
    searchRootRef,
    folderQuery,
    onQueryChange,
    openSearch,
    clearSearch,
    loadingFolders,
    searchResults,
    searchState,
    pickSearchResult,
    navigateAndClear,
  } = useFolderNavSearch(realm, foldersRefreshKey)

  const currentLabel = breadcrumb[breadcrumb.length - 1]?.label ?? realmLabel

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <nav
            aria-label="Đường dẫn thư mục"
            className="flex min-w-0 items-center gap-0.5 overflow-x-auto text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Button
              type="button"
              variant={
                activeFolderPath === homePath || (!activeFolderPath && !homePath)
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
              className="h-7 shrink-0 gap-1 px-2 text-xs"
              onClick={() => navigateAndClear(homePath, onNavigate)}
            >
              <Home className="size-3.5" />
              <span className="max-w-[8rem] truncate">{realmLabel}</span>
            </Button>
            {breadcrumb.map((crumb) => (
              <div
                key={crumb.id}
                className="flex shrink-0 items-center gap-0.5"
              >
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground/70"
                  aria-hidden
                />
                <Button
                  type="button"
                  variant={
                    activeFolderPath === crumb.id ? "secondary" : "ghost"
                  }
                  size="sm"
                  className="h-7 max-w-[10rem] truncate px-2 text-xs"
                  onClick={() => navigateAndClear(crumb.id, onNavigate)}
                  title={crumb.label}
                >
                  {crumb.label}
                </Button>
              </div>
            ))}
          </nav>
          <p className="truncate text-[11px] text-muted-foreground">
            {includeDescendants
              ? `Đang xem «${currentLabel}» và mọi thư mục con`
              : `Đang xem file trong «${currentLabel}»`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant={includeDescendants ? "secondary" : "outline"}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() =>
                    onIncludeDescendantsChange(!includeDescendants)
                  }
                  aria-pressed={includeDescendants}
                  aria-label={
                    includeDescendants
                      ? "Đang gồm cả subfolder — bấm để chỉ folder này"
                      : "Chỉ folder này — bấm để gồm subfolder"
                  }
                />
              }
            >
              <Layers className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {includeDescendants ? "Gồm cả subfolder" : "Chỉ folder này"}
            </TooltipContent>
          </Tooltip>

          <div
            ref={searchRootRef}
            className="relative w-full min-w-[11rem] sm:w-52"
          >
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id={searchInputId}
              value={folderQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={openSearch}
              placeholder="Tìm folder…"
              className="h-8 border-border/80 bg-background pr-7 pl-8 text-xs shadow-none"
              role="combobox"
              aria-expanded={searchState.showSearchPanel}
              aria-controls={searchState.showSearchPanel ? listId : undefined}
              aria-autocomplete="list"
              autoComplete="off"
            />
            {folderQuery ? (
              <button
                type="button"
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={clearSearch}
                aria-label="Xóa tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            ) : null}

            {searchState.showSearchPanel ? (
              <div
                id={listId}
                role="listbox"
                className="absolute top-[calc(100%+4px)] z-50 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md"
              >
                {loadingFolders || searchState.isDebouncing ? (
                  <p className="flex items-center gap-2 px-2.5 py-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Đang tìm…
                  </p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((folder) => {
                    const navPath = diskPathToNavPath(realm, folder.path)
                    const label = formatStorageFolderLabel(folder)
                    const hint = formatStorageFolderPathHint(folder.path, realm)
                    return (
                      <button
                        key={folder.path}
                        type="button"
                        role="option"
                        aria-selected={activeFolderPath === navPath}
                        className={cn(
                          "flex w-full flex-col items-start rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-accent",
                          activeFolderPath === navPath && "bg-accent/70"
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSearchResult(folder.path, onNavigate)}
                      >
                        <span className="text-xs font-medium text-foreground">
                          {label}
                        </span>
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {hint}
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <p className="px-2.5 py-2 text-xs text-muted-foreground">
                    Không tìm thấy folder.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {actions ? (
            <div className="flex items-center gap-1.5">{actions}</div>
          ) : null}
        </div>
      </div>

      {!searchState.isSearching && childFolders.length > 0 ? (
        <div className="flex gap-1.5 overflow-x-auto border-t border-border/50 bg-muted/15 px-3 py-2 [scrollbar-width:thin]">
          {childFolders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
              onClick={() => navigateAndClear(folder.id, onNavigate)}
            >
              <FolderOpen className="size-3.5 text-amber-600/90 dark:text-amber-500" />
              <span className="font-medium">{folder.label}</span>
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[10px] tabular-nums"
              >
                {folder.count}
              </Badge>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
