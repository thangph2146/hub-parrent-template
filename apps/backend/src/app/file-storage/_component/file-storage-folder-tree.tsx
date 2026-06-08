"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@ui/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  HardDrive,
} from "lucide-react";
import type { StorageFolderTreeNode } from "./utils";
import {
  buildRealmFolderTree,
  buildStorageFolderTree,
  collectStorageFolderExpandablePaths,
  expandStorageFolderAncestors,
  filterStorageFolderTree,
} from "./utils";
import type { FolderItem } from "@/lib/admin-uploads";
import type { StorageRealm } from "./types";

export const STORAGE_ROOT_IMAGES = "__root_images__";
export const STORAGE_ROOT_FILES = "__root_files__";
export const STORAGE_ROOT_VIDEOS = "__root_videos__";
export const STORAGE_ROOT_AUDIO = "__root_audio__";

export type FileStorageVirtualRoot = {
  value: string;
  label: string;
};

type FileStorageFolderTreeProps = {
  folders: FolderItem[];
  filter: string;
  selectedPath: string;
  onSelect: (path: string) => void;
  disabled?: boolean;
  /** Hiện 2 nút gốc ảnh/files — dùng khi chọn thư mục cha (tab Tạo mới). */
  showVirtualRoots?: boolean;
  /** Gốc ảnh tùy chỉnh (vd. chỉ «images» khi di chuyển). */
  virtualRoots?: FileStorageVirtualRoot[];
  /** Bỏ nút images/files/videos — cây bắt đầu từ admincp, docs, … */
  realm?: StorageRealm;
  /** Tự mở các nhánh cấp 1 khi render cây. */
  autoExpandRoots?: boolean;
  className?: string;
};

type TreeRowProps = {
  node: StorageFolderTreeNode;
  depth: number;
  selectedPath: string;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  disabled?: boolean;
};

function TreeRow({
  node,
  depth,
  selectedPath,
  expandedPaths,
  onToggleExpand,
  onSelect,
  disabled,
}: TreeRowProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;

  return (
    <div role="none">
      <div
        className={cn(
          "flex w-full items-center gap-0.5 rounded-md pr-1 text-sm transition-colors",
          isSelected
            ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
            disabled={disabled}
            onClick={() => onToggleExpand(node.path)}
            className="flex size-7 shrink-0 items-center justify-center rounded-md hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect(node.path)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
        >
          {isSelected ? (
            <FolderOpen className="size-4 shrink-0 text-primary" />
          ) : (
            <Folder className="size-4 shrink-0 text-amber-600/90 dark:text-amber-500" />
          )}
          <span className="truncate font-medium">{node.name}</span>
          <span className="truncate font-mono text-[10px] opacity-60">
            {node.path}
          </span>
        </button>
      </div>
      {hasChildren && isExpanded
        ? node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              disabled={disabled}
            />
          ))
        : null}
    </div>
  );
}

export function FileStorageFolderTree({
  folders,
  filter,
  selectedPath,
  onSelect,
  disabled = false,
  showVirtualRoots = false,
  virtualRoots,
  realm,
  autoExpandRoots = false,
  className,
}: FileStorageFolderTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const tree = useMemo(
    () =>
      realm ? buildRealmFolderTree(folders, realm) : buildStorageFolderTree(folders),
    [folders, realm],
  );
  const filteredTree = useMemo(
    () => filterStorageFolderTree(tree, filter),
    [filter, tree],
  );

  useEffect(() => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (autoExpandRoots) {
        for (const node of filteredTree) {
          if (node.children.length > 0) next.add(node.path);
        }
      }
      if (
        selectedPath &&
        selectedPath !== STORAGE_ROOT_IMAGES &&
        selectedPath !== STORAGE_ROOT_FILES &&
        selectedPath !== STORAGE_ROOT_VIDEOS &&
        selectedPath !== STORAGE_ROOT_AUDIO
      ) {
        expandStorageFolderAncestors(selectedPath, next);
      }
      if (filter.trim()) {
        collectStorageFolderExpandablePaths(filteredTree, next);
      }
      return next;
    });
  }, [autoExpandRoots, filter, filteredTree, selectedPath]);

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const virtualRootRow = (value: string, label: string) => {
    const isSelected = selectedPath === value;
    return (
      <button
        key={value}
        type="button"
        disabled={disabled}
        onClick={() => onSelect(value)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
          isSelected
            ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <HardDrive className="size-4 shrink-0 text-primary" />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  const rootOptions = virtualRoots?.length
    ? virtualRoots
    : showVirtualRoots
      ? [
          {
            value: STORAGE_ROOT_IMAGES,
            label: "Gốc — thư mục ảnh / media",
          },
          {
            value: STORAGE_ROOT_FILES,
            label: "Gốc — thư mục tệp tin (files/)",
          },
          {
            value: STORAGE_ROOT_VIDEOS,
            label: "Gốc — thư mục video (videos/)",
          },
          {
            value: STORAGE_ROOT_AUDIO,
            label: "Gốc — thư mục âm thanh (audio/)",
          },
        ]
      : [];

  const isEmpty = filteredTree.length === 0 && rootOptions.length === 0;

  return (
    <div className={cn("space-y-1 p-1", className)}>
      {rootOptions.length > 0 ? (
        <div className="mb-2 space-y-1 border-b border-border/60 pb-2">
          {rootOptions.map((root) => virtualRootRow(root.value, root.label))}
        </div>
      ) : null}

      {isEmpty ? (
        <p className="px-2 py-4 text-center text-sm text-muted-foreground">
          Không có thư mục khớp tìm kiếm.
        </p>
      ) : (
        filteredTree.map((node) => (
          <TreeRow
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            expandedPaths={expandedPaths}
            onToggleExpand={toggleExpand}
            onSelect={onSelect}
            disabled={disabled}
          />
        ))
      )}
    </div>
  );
}
