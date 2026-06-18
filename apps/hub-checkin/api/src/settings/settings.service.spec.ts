/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { SettingsService } from './settings.service';
import { Setting } from '../entities/setting.entity';

describe('SettingsService', () => {
  let service: SettingsService;
  let em: Partial<EntityManager>;

  const mockSetting = {
    id: 1,
    key: 'site_name',
    value: 'Test Site',
    group: 'general',
  } as unknown as Setting;

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
      persistAndFlush: jest.fn(),
      removeAndFlush: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  describe('listSettings', () => {
    it('should return all settings', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockSetting]);

      const result = await service.listSettings();

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('site_name');
    });

    it('should filter by group', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockSetting]);

      await service.listSettings({ group: 'general' });

      expect(em.find).toHaveBeenCalled();
    });

    it('should apply search filter', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);

      const result = await service.listSettings({ search: 'site' });

      expect(result).toHaveLength(0);
    });
  });

  describe('getByKey', () => {
    it('should return setting by key', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockSetting);

      const result = await service.getByKey('site_name');

      expect(result).not.toBeNull();
      expect(result?.key).toBe('site_name');
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getByKey('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateByKey', () => {
    it('should update existing setting', async () => {
      const existing = { ...mockSetting, value: 'Old Value' };
      (em.findOne as jest.Mock).mockResolvedValue(existing);

      const result = await service.updateByKey('site_name', 'New Value');

      expect(result.value).toBe('New Value');
      expect(em.flush).toHaveBeenCalled();
    });

    it('should create setting if not exists', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.updateByKey('new_setting', 'New Value');

      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
      expect(result.key).toBe('new_setting');
      expect(result.value).toBe('New Value');
      expect(result.group).toBe('general');
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple settings', async () => {
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(mockSetting)
        .mockResolvedValueOnce(null);

      const result = await service.bulkUpdate({
        site_name: 'Updated Site',
        new_setting: 'New Value',
      });

      expect(result).toHaveLength(2);
      expect(em.persist).toHaveBeenCalledTimes(1);
      expect(em.flush).toHaveBeenCalledTimes(1);
    });

    it('should handle empty object', async () => {
      const result = await service.bulkUpdate({});

      expect(result).toHaveLength(0);
    });
  });

  describe('getPublicBranding', () => {
    it('should return site name and description from settings', async () => {
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce({
          ...mockSetting,
          key: 'site_name',
          value: 'Hệ thống Sự kiện HUB',
        })
        .mockResolvedValueOnce({
          ...mockSetting,
          key: 'site_description',
          value: 'Quản trị check-in sự kiện',
        });

      const result = await service.getPublicBranding();

      expect(result).toEqual({
        siteName: 'Hệ thống Sự kiện HUB',
        siteDescription: 'Quản trị check-in sự kiện',
      });
    });

    it('should fall back when settings are missing', async () => {
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await service.getPublicBranding();

      expect(result.siteName).toBe('HUB');
      expect(result.siteDescription).toBe('Quản trị hệ thống');
    });
  });

  describe('deleteSetting', () => {
    it('should delete setting', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockSetting);

      const result = await service.deleteSetting('1');

      expect(result).not.toBeNull();
      expect(em.removeAndFlush).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.deleteSetting('999');

      expect(result).toBeNull();
    });
  });
});
