import { parseHanetPlaceList } from './hanet-place-list.parse';

describe('hanet-place-list.parse', () => {
  it('parses place rows', () => {
    expect(
      parseHanetPlaceList([
        { placeID: '108', placeName: 'Campus A' },
        { placeId: '200', name: 'Campus B' },
      ]),
    ).toEqual([
      { placeId: '108', name: 'Campus A' },
      { placeId: '200', name: 'Campus B' },
    ]);
  });
});
