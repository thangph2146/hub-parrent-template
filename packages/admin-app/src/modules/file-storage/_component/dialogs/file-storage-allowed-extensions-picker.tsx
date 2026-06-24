"use client"

import { Checkbox } from "@ui/components/checkbox"
import { Label } from "@ui/components/label"
import type { StorageRealm } from "../shared/types"
import {
  extensionsFromGroupIds,
  formatExtensionsSummary,
  getRealmDefaultGroupIds,
  getRealmExtensionGroups,
  type StorageExtensionGroupId,
} from "../shared/storage-upload-policy"

type FileStorageAllowedExtensionsPickerProps = {
  realm: StorageRealm
  value: StorageExtensionGroupId[]
  onChange: (groupIds: StorageExtensionGroupId[]) => void
  disabled?: boolean
}

export function FileStorageAllowedExtensionsPicker({
  realm,
  value,
  onChange,
  disabled = false,
}: FileStorageAllowedExtensionsPickerProps) {
  const groups = getRealmExtensionGroups(realm)
  const selectedExtensions = extensionsFromGroupIds(realm, value)

  const toggleGroup = (groupId: StorageExtensionGroupId, checked: boolean) => {
    const next = checked
      ? [...new Set([...value, groupId])]
      : value.filter((id) => id !== groupId)
    onChange(next.length > 0 ? next : getRealmDefaultGroupIds(realm))
  }

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">Loại file được phép import</p>
        <p className="text-xs text-muted-foreground">
          Chỉ áp dụng cho folder cấp 1 mới. Folder con kế thừa cấu hình folder
          cha.
        </p>
      </div>
      <div className="space-y-2">
        {groups.map((group) => {
          const checked = value.includes(group.id)
          return (
            <div key={group.id} className="flex items-start gap-2">
              <Checkbox
                id={`ext-group-${group.id}`}
                checked={checked}
                disabled={disabled}
                onCheckedChange={(state) =>
                  toggleGroup(group.id, state === true)
                }
              />
              <div className="grid gap-0.5 leading-none">
                <Label
                  htmlFor={`ext-group-${group.id}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {group.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {group.extensions.join(", ")}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Đã chọn: {formatExtensionsSummary(selectedExtensions)}
      </p>
    </div>
  )
}
