"use client"

import {
  Camera,
  Copy,
  ExternalLink,
  Pencil,
  ScanFace,
  Trash2,
  UserCog,
} from "lucide-react"
import {
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import { HANET_FACE_ACTIONS, type HanetFaceActionId } from "../shared/hanet-face-actions"
import {
  HANET_PERSON_ROW_ACTIONS,
  type HanetPersonActionId,
} from "../shared/hanet-person-api-actions"
import type { HanetPersonRow } from "./hanet-persons-table"

export type HanetPersonRowActionsProps = {
  person: HanetPersonRow
  onFaceAction?: (actionId: HanetFaceActionId, person: HanetPersonRow) => void
  onPersonAction?: (actionId: HanetPersonActionId, person: HanetPersonRow) => void
}

function resolveAvatarUrl(person: HanetPersonRow): string {
  const avatar = String(person.avatar ?? "").trim()
  if (!avatar || avatar.startsWith("hanet:person:")) return ""
  return avatar
}

function personActionIcon(actionId: HanetPersonActionId) {
  if (actionId.startsWith("remove")) return <Trash2 />
  if (actionId.startsWith("update")) return <Pencil />
  return <UserCog />
}

export function HanetPersonRowActions({
  person,
  onFaceAction,
  onPersonAction,
}: HanetPersonRowActionsProps) {
  const avatarUrl = resolveAvatarUrl(person)
  const actions: DataTableRowActionItem[] = []

  if (avatarUrl) {
    actions.push({
      key: "open-avatar",
      label: "Mở ảnh đại diện",
      hint: "Xem avatar gốc trên HANET",
      onClick: () => {
        window.open(avatarUrl, "_blank", "noopener,noreferrer")
      },
      icon: <ExternalLink />,
      group: "primary",
    })
  }

  if (onPersonAction) {
    for (const personAction of HANET_PERSON_ROW_ACTIONS) {
      actions.push({
        key: `person-${personAction.id}`,
        label: personAction.label,
        hint: personAction.hint,
        onClick: () => onPersonAction(personAction.id, person),
        icon: personActionIcon(personAction.id),
        group: personAction.dangerous ? "danger" : "status",
        ...(personAction.dangerous ? { menuVariant: "destructive" as const } : {}),
      })
    }
  }

  if (onFaceAction) {
    for (const faceAction of HANET_FACE_ACTIONS) {
      actions.push({
        key: `face-${faceAction.id}`,
        label: faceAction.label,
        hint: faceAction.hint,
        onClick: () => onFaceAction(faceAction.id, person),
        icon:
          faceAction.id === "take-picture" ? (
            <Camera />
          ) : (
            <ScanFace />
          ),
        group: "status",
      })
    }
  }

  if (person.personId) {
    actions.push({
      key: "copy-person-id",
      label: "Sao chép personID",
      hint: person.personId,
      onClick: () => {
        void navigator.clipboard.writeText(person.personId)
      },
      icon: <Copy />,
      group: "primary",
    })
  }

  return (
    <DataTableRowActionsMenu
      actions={actions}
      autoConfirmDangerousActions={false}
      triggerLabel={`Thao tác ${person.displayName || person.personId}`}
      groups={{
        primary: { label: "Xem / sao chép", sublabel: false },
        status: { label: "Person / Face API HANET", sublabel: true },
        danger: { label: "Xóa trên HANET", sublabel: true },
      }}
    />
  )
}

export const hanetPersonActionsColumnMeta = {
  ...TABLE_ACTIONS_COLUMN_META,
  className: `${TABLE_ACTIONS_COLUMN_META.className} sticky right-0 z-[10]`,
}
