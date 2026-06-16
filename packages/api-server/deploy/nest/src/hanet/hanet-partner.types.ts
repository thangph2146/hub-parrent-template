/** Envelope chuẩn partner.hanet.ai — returnCode 1 = thành công. */
export type HanetPartnerEnvelope<T = unknown> = {
  returnCode: number;
  returnMessage?: string;
  data?: T;
};

export type HanetRegisterPersonByUrlInput = {
  placeId: string;
  name: string;
  aliasId: string;
  url: string;
  /** 0 nhân viên · 1 khách (mặc định khách sự kiện). */
  personType?: number;
};

/** POST /person/register — multipart field `file` (JPEG/PNG). */
export type HanetRegisterPersonInput = {
  placeId: string;
  name: string;
  aliasId: string;
  /** Base64 JPEG/PNG hoặc data URL — gửi multipart `file` lên HANET. */
  fileBase64: string;
  personType?: number;
};

export type HanetCheckinByPlaceQuery = {
  placeId: string;
  /** ISO yyyy-mm-dd hoặc dd/MM/yyyy — sẽ chuẩn hóa trước khi gọi HANET. */
  date: string;
};

export type HanetCheckinByTimestampQuery = {
  placeId: string;
  /** ISO, unix (giây/ms), hoặc DDMMYYYYHHmmss — map `from` trên partner. */
  from: string;
  /** ISO, unix (giây/ms), hoặc DDMMYYYYHHmmss — map `to` trên partner. */
  to: string;
};

export type HanetPersonListQuery = {
  placeId?: string;
  /** Trang hub 0-based; khi gọi HANET sẽ +1 (partner pageIndex 1-based). */
  pageIndex?: number;
  pageSize?: number;
  /** 0 nhân viên · 1 khách — lọc theo loại person HANET. */
  personType?: number;
};

/** POST /place/addPlace */
export type HanetCreatePlaceInput = {
  placeName: string;
  address?: string;
  /** 0 công ty · 1 gia đình (theo Postman HANET). */
  type?: number;
};

/** POST /place/updatePlace */
export type HanetUpdatePlaceInput = {
  placeId: string;
  placeName: string;
  address?: string;
};

/** POST /place/removePlace */
export type HanetRemovePlaceInput = {
  placeId: string;
};

/** POST /partner/removeUserPartner */
export type HanetRemoveUserPartnerInput = {
  clientId: string;
};

/** POST /partner/updateToken — body truyền thẳng field HANET (ngoài `token` form). */
export type HanetUpdatePartnerTokenInput = Record<string, string>;

/** POST /device/updateDevice */
export type HanetUpdateDeviceInput = {
  deviceId: string;
  deviceName?: string;
};

/** POST /device/setDeviceMQTT — field MQTT truyền thẳng theo Postman HANET. */
export type HanetSetDeviceMqttInput = {
  deviceId: string;
} & Record<string, string | number | boolean | undefined>;

export type HanetUpdateFaceUrlInput = {
  placeId: string;
  url: string;
  personId?: string;
  aliasId?: string;
};

export type HanetUpdateFaceImageInput = {
  placeId: string;
  /** Base64 JPEG/PNG hoặc data URL — gửi multipart `file` lên HANET. */
  fileBase64: string;
  personId?: string;
  aliasId?: string;
};

export type HanetTakeFacePictureInput = {
  placeId: string;
  deviceId: string;
  personId?: string;
  aliasId?: string;
};
