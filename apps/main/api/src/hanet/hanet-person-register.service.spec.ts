import { EntityManager } from '@mikro-orm/core';
import {
  extractHanetPersonId,
  HanetPersonRegisterService,
} from './hanet-person-register.service';
import { HanetPartnerService } from './hanet-partner.service';

describe('extractHanetPersonId', () => {
  it('reads personID from partner payload', () => {
    expect(extractHanetPersonId({ personID: 'p-99' })).toBe('p-99');
  });
});

describe('HanetPersonRegisterService', () => {
  const partner = {
    registerPersonByUrl: jest.fn(),
  } as unknown as HanetPartnerService;

  const em = {
    findOne: jest.fn(),
    create: jest.fn(),
    persist: jest.fn(),
    flush: jest.fn(),
    getReference: jest.fn(),
    find: jest.fn(),
  } as unknown as EntityManager;

  let service: HanetPersonRegisterService;
  const prevEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HANET_CLIENT_ID = 'id';
    process.env.HANET_CLIENT_SECRET = 'secret';
    process.env.API_PUBLIC_URL = 'https://checkin.example.com/api';
    service = new HanetPersonRegisterService(em, partner);
  });

  afterEach(() => {
    process.env = { ...prevEnv };
  });

  it('skips when avatar unchanged', async () => {
    (em.findOne as jest.Mock).mockResolvedValue({
      id: 5,
      hanetPersonId: 'p-1',
      imagePath: '/api/uploads/a.jpg',
    });

    const result = await service.syncUserFaceToHanet({
      userId: 1,
      email: 'sv@school.edu.vn',
      name: 'SV A',
      avatarUrl: '/api/uploads/a.jpg',
    });

    expect(result).toEqual({
      ok: false,
      skipped: true,
      reason: 'Ảnh HANET đã đồng bộ — không gọi lại registerByUrl',
    });
    expect(partner.registerPersonByUrl).not.toHaveBeenCalled();
  });

  it('registers and upserts face_data', async () => {
    (em.findOne as jest.Mock).mockResolvedValue(null);
    (partner.registerPersonByUrl as jest.Mock).mockResolvedValue({
      placeId: '108',
      faceUrl: 'https://checkin.example.com/api/uploads/a.jpg',
      personID: 'hanet-42',
    });
    const created = { id: 9 };
    (em.create as jest.Mock).mockReturnValue(created);
    (em.find as jest.Mock).mockResolvedValue([]);

    const result = await service.syncUserFaceToHanet({
      userId: 7,
      email: 'sv@school.edu.vn',
      name: 'SV A',
      avatarUrl: '/api/uploads/a.jpg',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.personId).toBe('hanet-42');
      expect(result.faceDataId).toBe(9);
    }
    expect(partner.registerPersonByUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        aliasId: 'sv@school.edu.vn',
        name: 'SV A',
        url: '/api/uploads/a.jpg',
        personType: 1,
      }),
    );
    expect(em.flush).toHaveBeenCalled();
  });
});
