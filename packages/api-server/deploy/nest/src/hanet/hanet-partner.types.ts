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

export type HanetCheckinByPlaceQuery = {
  placeId: string;
  /** ISO yyyy-mm-dd hoặc dd/MM/yyyy — sẽ chuẩn hóa trước khi gọi HANET. */
  date: string;
};

export type HanetPersonListQuery = {
  placeId?: string;
  /** Trang bắt đầu từ 0 (Postman HANET). */
  pageIndex?: number;
  pageSize?: number;
};
