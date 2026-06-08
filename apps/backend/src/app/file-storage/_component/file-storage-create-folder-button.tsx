"use client";

import { useCallback, useState } from "react";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ui/components/popover";
import { toast } from "@ui/components/sonner";
import { createStorageFolder } from "@/lib/admin-uploads";
import { FolderPlus, Loader2 } from "lucide-react";
import { FileStorageAllowedExtensionsPicker } from "./file-storage-allowed-extensions-picker";
import {
  extensionsFromGroupIds,
  getRealmDefaultGroupIds,
  type StorageExtensionGroupId,
} from "./storage-upload-policy";
import type { StorageRealm } from "./types";
import { resolveCreateFolderParent } from "./utils";

type FileStorageCreateFolderButtonProps = {
  realm: StorageRealm;
  parentFolderPath?: string;
  parentLabel: string;
  onCreated: (folderPath: string) => Promise<void>;
  disabled?: boolean;
  size?: "default" | "sm";
};

export function FileStorageCreateFolderButton({
  realm,
  parentFolderPath = "",
  parentLabel,
  onCreated,
  disabled = false,
  size = "sm",
}: FileStorageCreateFolderButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [extensionGroups, setExtensionGroups] = useState<StorageExtensionGroupId[]>(
    () => getRealmDefaultGroupIds(realm),
  );
  const isLevel1Create = !parentFolderPath.trim();

  const handleCreate = useCallback(async () => {
    const folderName = name.trim();
    if (!folderName) {
      toast.error("Vui lòng nhập tên thư mục");
      return;
    }

    const { parentPath, resourceType } = resolveCreateFolderParent(
      realm,
      parentFolderPath,
    );

    setCreating(true);
    try {
      const result = await createStorageFolder({
        folderName,
        parentPath,
        resourceType,
        allowedExtensions: isLevel1Create
          ? extensionsFromGroupIds(resourceType, extensionGroups)
          : undefined,
      });
      toast.success(`Đã tạo thư mục «${result.folderPath}»`);
      setName("");
      setOpen(false);
      await onCreated(result.folderPath);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không tạo được thư mục");
    } finally {
      setCreating(false);
    }
  }, [
    extensionGroups,
    isLevel1Create,
    name,
    onCreated,
    parentFolderPath,
    realm,
  ]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-auto">
        <Button
          type="button"
          variant="outline"
          size={size}
          disabled={disabled || creating}
          className="shrink-0 gap-1.5"
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FolderPlus className="size-4" />
          )}
          Tạo folder
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,22rem)] space-y-3" align="start">
        <div className="space-y-1">
          <p className="text-sm font-medium">Tạo thư mục mới</p>
          <p className="text-xs text-muted-foreground">
            Trong «{parentLabel}». Hỗ trợ nhiều cấp (vd. 2026/06/events).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-folder-name">Tên thư mục</Label>
          <Input
            id="create-folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="vd. avatars, buh_slidehome, 2026/06"
            disabled={creating}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreate();
              }
            }}
          />
        </div>
        {isLevel1Create ? (
          <FileStorageAllowedExtensionsPicker
            realm={realm}
            value={extensionGroups}
            onChange={setExtensionGroups}
            disabled={creating}
          />
        ) : null}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={creating}
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleCreate()}
            disabled={creating || !name.trim()}
          >
            {creating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FolderPlus className="size-4" />
            )}
            Tạo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
