import { EntityManager } from '@mikro-orm/core';
import { HanetPersonAvatarSyncService } from './hanet-person-avatar-sync.service';
import { HanetPartnerService } from './hanet-partner.service';

jest.mock('./hanet-registration-match', () => ({
  linkHanetPersonToRegistrationsByEmail: jest.fn().mockResolvedValue(0),
}));

jest.mock('./hanet-user-link', () => ({
  linkFaceDataToUserByEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('HanetPersonAvatarSyncService', () => {
  const partner = {
    getListPersonByPlace: jest.fn(),
  } as unknown as HanetPartnerService;

  const em = {
    findOne: jest.fn(),
    create: jest.fn(),
    persist: jest.fn(),
    flush: jest.fn(),
    findAndCount: jest.fn(),
  } as unknown as EntityManager;

  let service: HanetPersonAvatarSyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HanetPersonAvatarSyncService(em, partner);
  });

  it('syncFromPlace creates face_data rows', async () => {
    (partner.getListPersonByPlace as jest.Mock).mockResolvedValue({
      placeId: '108',
      data: [
        {
          personID: 'p-1',
          personName: 'SV A',
          aliasID: 'sv@school.edu.vn',
          avatar: 'https://static.hanet.ai/a.jpg',
        },
      ],
    });
    (em.findOne as jest.Mock).mockResolvedValue(null);
    (em.create as jest.Mock).mockReturnValue({ id: 3 });

    const result = await service.syncFromPlace('108');

    expect(result.created).toBe(1);
    expect(result.fetched).toBe(1);
    expect(em.create).toHaveBeenCalled();
    expect(em.flush).toHaveBeenCalled();
  });

  it('syncFromPlace paginates when HANET returns full pages', async () => {
    const page0 = Array.from({ length: 50 }, (_, i) => ({
      personID: `p-${i}`,
      personName: `Person ${i}`,
      aliasID: `id-${i}`,
      avatar: `https://static.hanet.ai/${i}.jpg`,
    }));
    const page1 = [{ personID: 'p-50', personName: 'Extra', aliasID: 'x', avatar: 'https://x/y.jpg' }];

    (partner.getListPersonByPlace as jest.Mock)
      .mockResolvedValueOnce({ placeId: '108', data: page0 })
      .mockResolvedValueOnce({ placeId: '108', data: page1 });

    (em.findOne as jest.Mock).mockResolvedValue(null);
    (em.create as jest.Mock).mockImplementation((_entity, data) => ({
      id: data.hanetPersonId,
    }));

    const result = await service.syncFromPlace('108');

    expect(result.fetched).toBe(51);
    expect(result.created).toBe(51);
    expect(partner.getListPersonByPlace).toHaveBeenCalledTimes(2);
  });

  it('listStored maps face_data rows', async () => {
    (em.findAndCount as jest.Mock).mockResolvedValue([
      [
        {
          id: 1,
          hanetPersonId: 'p-1',
          hanetAliasId: 'a@x.vn',
          displayName: 'A',
          imagePath: 'https://static.hanet.ai/a.jpg',
          createdAt: new Date('2026-06-01T00:00:00.000Z'),
          updatedAt: null,
          user: null,
        },
      ],
      1,
    ]);

    const result = await service.listStored({ page: 1, limit: 10 });

    expect(result.total).toBe(1);
    expect(result.items[0]?.imagePath).toBe('https://static.hanet.ai/a.jpg');
  });
});
