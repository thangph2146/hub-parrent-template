/** Tài liệu chính thức HANET Partner API (Postman). */
export const HANET_POSTMAN_DOCS_URL =
  "https://documenter.getpostman.com/view/13088306/TVeqcn2C"

export type HanetPartnerEndpoint = {
  /** Nhóm trong Postman collection */
  group: string
  /** POST path trên partner.hanet.ai */
  partnerMethod: "POST"
  partnerPath: string
  /** Proxy admin Hub */
  hubMethod: "GET" | "POST"
  hubPath: string
}

export const HANET_PARTNER_ENDPOINTS = {
  profile: {
    group: "Profile",
    partnerMethod: "POST",
    partnerPath: "/profile/getProfile",
    hubMethod: "POST",
    hubPath: "/admin/hanet/test-partner",
  },
  places: {
    group: "Place",
    partnerMethod: "POST",
    partnerPath: "/place/getPlaces",
    hubMethod: "GET",
    hubPath: "/admin/hanet/places",
  },
  devices: {
    group: "Device",
    partnerMethod: "POST",
    partnerPath: "/device/getListDeviceByPlace",
    hubMethod: "GET",
    hubPath: "/admin/hanet/devices",
  },
  deviceStatus: {
    group: "Device",
    partnerMethod: "POST",
    partnerPath: "/device/getConnectionStatus",
    hubMethod: "GET",
    hubPath: "/admin/hanet/devices/connection-status",
  },
  persons: {
    group: "Person",
    partnerMethod: "POST",
    partnerPath: "/person/getListByPlace",
    hubMethod: "GET",
    hubPath: "/admin/hanet/persons",
  },
  registerByUrl: {
    group: "Person",
    partnerMethod: "POST",
    partnerPath: "/person/registerByUrl",
    hubMethod: "POST",
    hubPath: "/admin/hanet/person/register-by-url",
  },
  checkins: {
    group: "Person",
    partnerMethod: "POST",
    partnerPath: "/person/getCheckinByPlaceIdInDay",
    hubMethod: "GET",
    hubPath: "/admin/hanet/checkins",
  },
  checkinTotal: {
    group: "Person",
    partnerMethod: "POST",
    partnerPath: "/person/getTotalCheckinByPlaceIdInDay",
    hubMethod: "GET",
    hubPath: "/admin/hanet/checkins",
  },
} as const satisfies Record<string, HanetPartnerEndpoint>
