export type HanetFaceActionId =
  | "update-by-url"
  | "update-by-url-alias"
  | "update-by-url-person-id"
  | "update-by-image"
  | "update-by-image-alias"
  | "update-by-image-person-id"
  | "take-picture"

export type HanetFaceActionMeta = {
  id: HanetFaceActionId
  label: string
  hint: string
  partnerPath: string
  hubPath: string
  needsUrl: boolean
  needsFile: boolean
  needsDeviceId: boolean
}

export const HANET_FACE_ACTIONS: HanetFaceActionMeta[] = [
  {
    id: "update-by-url",
    label: "updateByFaceUrl",
    hint: "POST /person/updateByFaceUrl",
    partnerPath: "/person/updateByFaceUrl",
    hubPath: "/admin/hanet/person/face/update-by-url",
    needsUrl: true,
    needsFile: false,
    needsDeviceId: false,
  },
  {
    id: "update-by-url-alias",
    label: "updateByFaceUrlByAliasID",
    hint: "POST /person/updateByFaceUrlByAliasID",
    partnerPath: "/person/updateByFaceUrlByAliasID",
    hubPath: "/admin/hanet/person/face/update-by-url-by-alias-id",
    needsUrl: true,
    needsFile: false,
    needsDeviceId: false,
  },
  {
    id: "update-by-url-person-id",
    label: "updateByFaceUrlByPersonID",
    hint: "POST /person/updateByFaceUrlByPersonID",
    partnerPath: "/person/updateByFaceUrlByPersonID",
    hubPath: "/admin/hanet/person/face/update-by-url-by-person-id",
    needsUrl: true,
    needsFile: false,
    needsDeviceId: false,
  },
  {
    id: "update-by-image",
    label: "updateByFaceImage",
    hint: "POST /person/updateByFaceImage (multipart)",
    partnerPath: "/person/updateByFaceImage",
    hubPath: "/admin/hanet/person/face/update-by-image",
    needsUrl: false,
    needsFile: true,
    needsDeviceId: false,
  },
  {
    id: "update-by-image-alias",
    label: "updateByFaceImageByAliasID",
    hint: "POST /person/updateByFaceImageByAliasID",
    partnerPath: "/person/updateByFaceImageByAliasID",
    hubPath: "/admin/hanet/person/face/update-by-image-by-alias-id",
    needsUrl: false,
    needsFile: true,
    needsDeviceId: false,
  },
  {
    id: "update-by-image-person-id",
    label: "updateByFaceImageByPersonID",
    hint: "POST /person/updateByFaceImageByPersonID",
    partnerPath: "/person/updateByFaceImageByPersonID",
    hubPath: "/admin/hanet/person/face/update-by-image-by-person-id",
    needsUrl: false,
    needsFile: true,
    needsDeviceId: false,
  },
  {
    id: "take-picture",
    label: "takeFacePicture",
    hint: "POST /person/takeFacePicture",
    partnerPath: "/person/takeFacePicture",
    hubPath: "/admin/hanet/person/face/take-picture",
    needsUrl: false,
    needsFile: false,
    needsDeviceId: true,
  },
]

export function getHanetFaceActionMeta(
  id: HanetFaceActionId,
): HanetFaceActionMeta {
  const meta = HANET_FACE_ACTIONS.find((row) => row.id === id)
  if (!meta) throw new Error(`Unknown face action: ${id}`)
  return meta
}
