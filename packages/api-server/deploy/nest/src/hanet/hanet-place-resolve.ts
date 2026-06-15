import { BadRequestException } from '@nestjs/common';
import { getHanetConfig } from './hanet.config';
import { parseHanetPlaceList } from './hanet-place-list.parse';

type PlaceListProvider = {
  getPlaces(): Promise<unknown>;
};

export async function resolveHanetPlaceId(
  provider: PlaceListProvider,
  placeId?: string,
): Promise<string> {
  const explicit = placeId?.trim() || getHanetConfig().defaultPlaceId;
  if (explicit) return explicit;

  const data = await provider.getPlaces();
  const places = parseHanetPlaceList(data);
  if (places.length === 1) return places[0]!.placeId;

  if (places.length > 1) {
    throw new BadRequestException(
      'Thiếu placeID — chọn địa điểm trên trang HANET hoặc đặt HANET_DEFAULT_PLACE_ID trong .env API',
    );
  }

  throw new BadRequestException(
    'Không tìm thấy địa điểm (place) trên tài khoản HANET',
  );
}
