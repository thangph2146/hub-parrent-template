import { HanetSyncService } from './hanet-sync.service';
import { FaceData } from '../entities/face-data.entity';
import { User } from '../entities/user.entity';

describe('HanetSyncService', () => {
  let service: HanetSyncService;
  let em: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    persist: jest.Mock;
    flush: jest.Mock;
  };

  beforeEach(() => {
    em = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((_, data) => ({ id: 99, ...data })),
      persist: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
    };
    service = new HanetSyncService(em as never);
  });

  it('upserts face_data on person add', async () => {
    em.findOne.mockResolvedValue(null);

    const result = await service.handleSync({
      data_type: 'person',
      action_type: 'add',
      personID: '19599634311402042324',
      personName: 'hiue',
      avatar: 'https://static.hanet.ai/face/x.jpg',
      aliasID: 'guest@hub.edu.vn',
      id: 'rec-1',
      hash: 'abc',
    });

    expect(result.kind).toBe('person');
    expect(result.entityId).toBe(99);
    expect(em.create).toHaveBeenCalledWith(
      FaceData,
      expect.objectContaining({
        hanetPersonId: '19599634311402042324',
        displayName: 'hiue',
        imagePath: 'https://static.hanet.ai/face/x.jpg',
      }),
    );
  });

  it('links face_data to user when alias is email', async () => {
    const face = { id: 99, user: null };
    em.findOne.mockImplementation((_entity, query) => {
      if (_entity === FaceData) return Promise.resolve(null);
      if (_entity === User && query?.email === 'guest@hub.edu.vn') {
        return Promise.resolve({ id: 7, email: 'guest@hub.edu.vn' });
      }
      return Promise.resolve(null);
    });
    em.create.mockReturnValue(face);

    const result = await service.handleSync({
      data_type: 'person',
      action_type: 'add',
      personID: 'p-1',
      aliasID: 'guest@hub.edu.vn',
    });

    expect(result.linkedUserId).toBe(7);
    expect(face.user).toEqual({ id: 7, email: 'guest@hub.edu.vn' });
  });
});
