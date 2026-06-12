import { compare } from 'bcryptjs';
import { BaseAuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

class TestAuthService extends BaseAuthService {
  constructor(private readonly em: any) {
    super();
  }

  protected getEm() {
    return this.em;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return class UserEntity {} as new () => Record<string, unknown>;
  }
}

describe('BaseAuthService', () => {
  let em: {
    findOne: jest.Mock;
    find: jest.Mock;
  };
  let service: TestAuthService;

  const activeUser = {
    id: 7,
    email: 'admin@example.com',
    name: 'Admin',
    avatar: '/avatar.png',
    password: 'hashed-password',
    isActive: true,
    deletedAt: null,
    userRoles: [
      {
        role: {
          id: 1,
          name: 'admin',
          displayName: 'Admin',
          permissions: ['users.view', 'users.edit'],
          deletedAt: null,
        },
      },
    ],
  };

  beforeEach(() => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    service = new TestAuthService(em);
    (compare as jest.Mock).mockReset();
  });

  it('login tra payload khi email/password hop le', async () => {
    em.findOne.mockResolvedValue(activeUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({
      email: 'admin@example.com',
      password: 'secret',
    });

    expect(compare).toHaveBeenCalledWith('secret', 'hashed-password');
    expect(result).toEqual({
      id: 7,
      email: 'admin@example.com',
      name: 'Admin',
      image: '/avatar.png',
      permissions: ['users.view', 'users.edit'],
      roles: [{ id: 1, name: 'admin', displayName: 'Admin' }],
    });
  });

  it('login tra null khi sai password hoac user khong hop le', async () => {
    em.findOne.mockResolvedValue(activeUser);
    (compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'admin@example.com', password: 'bad' }),
    ).resolves.toBeNull();

    em.findOne.mockResolvedValue({ ...activeUser, isActive: false });
    await expect(
      service.login({ email: 'admin@example.com', password: 'secret' }),
    ).resolves.toBeNull();
  });

  it('tryAuthPayloadByUserId tra reason dung cho me endpoint', async () => {
    em.findOne.mockResolvedValue(null);
    await expect(service.tryAuthPayloadByUserId('9')).resolves.toEqual({
      payload: null,
      reason: 'not_found',
    });

    em.findOne.mockResolvedValue({ ...activeUser, deletedAt: '2026-01-01' });
    await expect(service.tryAuthPayloadByUserId('7')).resolves.toEqual({
      payload: null,
      reason: 'inactive',
    });

    em.findOne.mockResolvedValue({ ...activeUser, userRoles: [] });
    await expect(service.tryAuthPayloadByUserId('7')).resolves.toEqual({
      payload: null,
      reason: 'no_roles',
    });
  });

  it('loginAsDevelopmentUser chi hoat dong o development', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    await expect(service.loginAsDevelopmentUser('7')).resolves.toBeNull();

    process.env.NODE_ENV = 'development';
    em.findOne.mockResolvedValue(activeUser);
    await expect(service.loginAsDevelopmentUser('7')).resolves.toEqual(
      expect.objectContaining({ id: 7, email: 'admin@example.com' }),
    );
    process.env.NODE_ENV = previousEnv;
  });

  it('listDevelopmentLoginOptions ho tro filter roles/excludeRoles/emailSuffix/search', async () => {
    em.find.mockResolvedValue([
      activeUser,
      {
        id: 8,
        email: 'teacher@test.dev',
        name: 'Teacher',
        isActive: true,
        deletedAt: null,
        userRoles: [
          {
            role: {
              id: 2,
              name: 'staff',
              displayName: 'Staff',
              permissions: '["orders.view"]',
              deletedAt: null,
            },
          },
        ],
      },
    ]);

    const result = await service.listDevelopmentLoginOptions({
      roles: 'admin,staff',
      excludeRoles: 'student',
      emailSuffix: '.dev',
      search: 'teacher',
      activeOnly: true,
    });

    expect(result).toEqual([
      {
        id: 8,
        email: 'teacher@test.dev',
        name: 'Teacher',
        roleNames: ['staff'],
      },
    ]);
  });
});
