"use client";

import { Button } from "@ui/components/button";
import { cn } from "@ui/lib/utils";
import { ChevronRight, FolderOpen, Home, ListTree } from "lucide-react";
import type { StorageTab } from "./types";

type FileStorageFolderNavProps = {
  realmLabel: string;
  breadcrumb: Array<{ id: string; label: string }>;
  childFolders: StorageTab[];
  activeFolderPath: string;
  includeDescendants: boolean;
  onIncludeDescendantsChange: (value: boolean) => void;
  onNavigate: (folderPath: string) => void;
  className?: string;
};

export function FileStorageFolderNav({
  realmLabel,
  breadcrumb,
  childFolders,
  activeFolderPath,
  includeDescendants,
  onIncludeDescendantsChange,
  onNavigate,
  className,
}: FileStorageFolderNavProps) {
  const scopeLabel = activeFolderPath
    ? breadcrumb[breadcrumb.length - 1]?.label ?? activeFolderPath
    : realmLabel;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav
          aria-label="Đường dẫn thư mục"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-sm"
        >
          <Button
            type="button"
            variant={activeFolderPath ? "ghost" : "secondary"}
            size="sm"
            className="h-8 gap-1.5 px-2"
            onClick={() => onNavigate("")}
          >
            <Home className="size-4" />
            {realmLabel}
          </Button>
          {breadcrumb.map((crumb) => (
            <div key={crumb.id} className="flex items-center gap-1">
              <ChevronRight className="size-4 text-muted-foreground" />
              <Button
                type="button"
                variant={activeFolderPath === crumb.id ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => onNavigate(crumb.id)}
              >
                {crumb.label}
              </Button>
            </div>
          ))}
        </nav>

        <Button
          type="button"
          variant={includeDescendants ? "secondary" : "outline"}
          size="sm"
          className="h-8 shrink-0 gap-1.5"
          onClick={() => onIncludeDescendantsChange(!includeDescendants)}
        >
          <ListTree className="size-4" />
          {includeDescendants
            ? "Gồm cả subfolder"
            : "Chỉ folder này"}
        </Button>
      </div>

      {includeDescendants ? (
        <p className="text-xs text-muted-foreground">
          Đang hiển thị mọi file trong «{scopeLabel}» và toàn bộ thư mục con bên
          dưới.
        </p>
      ) : null}

      {childFolders.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {childFolders.map((folder) => (
            <Button
              key={folder.id}
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onNavigate(folder.id)}
            >
              <FolderOpen className="size-4 text-amber-600/90 dark:text-amber-500" />
              {folder.label}
              <span className="text-muted-foreground">({folder.count})</span>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
