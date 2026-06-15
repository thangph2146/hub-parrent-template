import { BadRequestException } from '@nestjs/common';
import { resolveHanetPlaceId } from './hanet-place-resolve';

describe('resolveHanetPlaceId', () => {
  const provider = {
    getPlaces: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.HANET_DEFAULT_PLACE_ID;
  });

  it('uses explicit placeId', async () => {
    await expect(resolveHanetPlaceId(provider, '903038')).resolves.toBe('903038');
    expect(provider.getPlaces).not.toHaveBeenCalled();
  });

  it('uses env default', async () => {
    process.env.HANET_DEFAULT_PLACE_ID = '903892';
    await expect(resolveHanetPlaceId(provider, undefined)).resolves.toBe('903892');
  });

  it('auto-picks when account has one place', async () => {
    provider.getPlaces.mockResolvedValue([{ id: 1, name: 'Only place' }]);
    await expect(resolveHanetPlaceId(provider)).resolves.toBe('1');
  });

  it('throws when multiple places and no default', async () => {
    provider.getPlaces.mockResolvedValue([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ]);
    await expect(resolveHanetPlaceId(provider)).rejects.toThrow(BadRequestException);
  });
});
