export type HanetPersonActionId =
  | "lookup-by-alias-all"
  | "lookup-by-alias"
  | "lookup-user-by-alias"
  | "lookup-user-by-id"
  | "register"
  | "update"
  | "update-info"
  | "update-alias-id"
  | "remove"
  | "remove-by-place"
  | "remove-by-alias-ids"
  | "remove-all-in-place"
  | "remove-by-id"

export type HanetPersonActionMeta = {
  id: HanetPersonActionId
  label: string
  hint: string
  partnerPath: string
  hubMethod: string
  hubPath: string
  kind: "read" | "write" | "delete"
  needsPlace: boolean
  needsPersonId: boolean
  needsAliasId: boolean
  needsName: boolean
  needsAliasIds: boolean
  needsFile?: boolean
  dangerous?: boolean
}

export const HANET_PERSON_ACTIONS: HanetPersonActionMeta[] = [
  {
    id: "lookup-by-alias-all",
    label: "getListByAliasIDAllPlace",
    hint: "Tra cứu mọi place theo aliasID",
    partnerPath: "/person/getListByAliasIDAllPlace",
    hubMethod: "GET",
    hubPath: "/admin/hanet/person/by-alias-all?aliasId=",
    kind: "read",
    needsPlace: false,
    needsPersonId: false,
    needsAliasId: true,
    needsName: false,
    needsAliasIds: false,
  },
  {
    id: "lookup-by-alias",
    label: "getListByAliasID",
    hint: "Danh sách person theo aliasID + place",
    partnerPath: "/person/getListByAliasID",
    hubMethod: "GET",
    hubPath: "/admin/hanet/person/by-alias?aliasId=&placeId=",
    kind: "read",
    needsPlace: true,
    needsPersonId: false,
    needsAliasId: true,
    needsName: false,
    needsAliasIds: false,
  },
  {
    id: "lookup-user-by-alias",
    label: "getUserInfoByAliasID",
    hint: "Thông tin user theo aliasID",
    partnerPath: "/person/getUserInfoByAliasID",
    hubMethod: "GET",
    hubPath: "/admin/hanet/person/user-by-alias?aliasId=&placeId=",
    kind: "read",
    needsPlace: true,
    needsPersonId: false,
    needsAliasId: true,
    needsName: false,
    needsAliasIds: false,
  },
  {
    id: "lookup-user-by-id",
    label: "getUserInfoByPersonID",
    hint: "Thông tin user theo personID",
    partnerPath: "/person/getUserInfoByPersonID",
    hubMethod: "GET",
    hubPath: "/admin/hanet/person/user-by-id?personId=&placeId=",
    kind: "read",
    needsPlace: true,
    needsPersonId: true,
    needsAliasId: false,
    needsName: false,
    needsAliasIds: false,
  },
  {
    id: "register",
    label: "register",
    hint: "Đăng ký person + upload ảnh JPEG/PNG (multipart file)",
    partnerPath: "/person/register",
    hubMethod: "POST",
    hubPath: "/admin/hanet/person/register",
    kind: "write",
    needsPlace: true,
    needsPersonId: false,
    needsAliasId: true,
    needsName: true,
    needsAliasIds: false,
    needsFile: true,
  },
  {
    id: "update",
    label: "update",
    hint: "Cập nhật person",
    partnerPath: "/person/update",
    hubMethod: "PATCH",
    hubPath: "/admin/hanet/person",
    kind: "write",
    needsPlace: true,
    needsPersonId: true,
    needsAliasId: false,
    needsName: false,
    needsAliasIds: false,
  },
  {
    id: "update-info",
    label: "updateInfo",
    hint: "Cập nhật thông tin person",
    partnerPath: "/person/updateInfo",
    hubMethod: "PATCH",
    hubPath: "/admin/hanet/person/info",
    kind: "write",
    needsPlace: true,
    needsPersonId: true,
    needsAliasId: false,
    needsName: false,
    needsAliasIds: false,
  },
  {
    id: "update-alias-id",
    label: "updateAliasID",
    hint: "Đổi aliasID",
    partnerPath: "/person/updateAliasID",
    hubMethod: "PATCH",
    hubPath: "/admin/hanet/person/alias-id",
    kind: "write",
    needsPlace: true,
    needsPersonId: true,
    needsAliasId: true,
    needsName: false,
    needsAliasIds: false,
  },
  {
    id: "remove",
    label: "remove",
    hint: "Xóa person theo personID",
    partnerPath: "/person/remove",
    hubMethod: "DELETE",
    hubPath: "/admin/hanet/person?personId=&placeId=",
    kind: "delete",
    needsPlace: true,
    needsPersonId: true,
    needsAliasId: false,
    needsName: false,
    needsAliasIds: false,
    dangerous: true,
  },
  {
    id: "remove-by-place",
    label: "removeByPlace",
    hint: "Xóa person theo aliasID trong place",
    partnerPath: "/person/removeByPlace",
    hubMethod: "DELETE",
    hubPath: "/admin/hanet/person/by-place?aliasId=&placeId=",
    kind: "delete",
    needsPlace: true,
    needsPersonId: false,
    needsAliasId: true,
    needsName: false,
    needsAliasIds: false,
    dangerous: true,
  },
  {
    id: "remove-by-alias-ids",
    label: "removePersonByListAliasID",
    hint: "Xóa hàng loạt theo danh sách aliasID",
    partnerPath: "/person/removePersonByListAliasID",
    hubMethod: "POST",
    hubPath: "/admin/hanet/person/remove-by-alias-ids",
    kind: "delete",
    needsPlace: true,
    needsPersonId: false,
    needsAliasId: false,
    needsName: false,
    needsAliasIds: true,
    dangerous: true,
  },
  {
    id: "remove-all-in-place",
    label: "removeAllPersonInPlace",
    hint: "Xóa toàn bộ person trong place",
    partnerPath: "/person/removeAllPersonInPlace",
    hubMethod: "DELETE",
    hubPath: "/admin/hanet/person/in-place?placeId=",
    kind: "delete",
    needsPlace: true,
    needsPersonId: false,
    needsAliasId: false,
    needsName: false,
    needsAliasIds: false,
    dangerous: true,
  },
  {
    id: "remove-by-id",
    label: "removePersonByID",
    hint: "Xóa person theo personID (endpoint riêng)",
    partnerPath: "/person/removePersonByID",
    hubMethod: "DELETE",
    hubPath: "/admin/hanet/person/by-id?personId=&placeId=",
    kind: "delete",
    needsPlace: true,
    needsPersonId: true,
    needsAliasId: false,
    needsName: false,
    needsAliasIds: false,
    dangerous: true,
  },
]

export function getHanetPersonActionMeta(id: HanetPersonActionId): HanetPersonActionMeta {
  const meta = HANET_PERSON_ACTIONS.find((row) => row.id === id)
  if (!meta) throw new Error(`Unknown person action: ${id}`)
  return meta
}

export const HANET_PERSON_LOOKUP_ACTIONS = HANET_PERSON_ACTIONS.filter(
  (row) => row.kind === "read",
)

export const HANET_PERSON_ROW_ACTIONS = HANET_PERSON_ACTIONS.filter(
  (row) => row.kind !== "read" && row.id !== "register" && row.id !== "remove-by-alias-ids" && row.id !== "remove-all-in-place",
)
