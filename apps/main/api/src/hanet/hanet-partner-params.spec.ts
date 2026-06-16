import {
  buildHanetPersonParams,
  type HanetPersonHubInput,
} from './hanet-partner-params';

describe('buildHanetPersonParams', () => {
  it('maps hub camelCase to HANET keys', () => {
    const params = buildHanetPersonParams(
      {
        placeId: 'skip',
        aliasId: 'a@school.edu.vn',
        personId: 'p-1',
        name: 'Nguyen Van A',
        personType: 1,
      } as HanetPersonHubInput,
      '903038',
    );
    expect(params).toEqual({
      placeID: '903038',
      aliasID: 'a@school.edu.vn',
      personID: 'p-1',
      name: 'Nguyen Van A',
      personType: 1,
    });
  });

  it('joins aliasIds to listAliasID', () => {
    const params = buildHanetPersonParams({
      aliasIds: ['a@x.vn', 'b@x.vn'],
    });
    expect(params.listAliasID).toBe('a@x.vn,b@x.vn');
  });
});
