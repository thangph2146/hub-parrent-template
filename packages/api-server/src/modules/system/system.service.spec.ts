import { Logger } from '@nestjs/common';
import {
  BaseSystemService,
  ExportDataResult,
  ImportDataResult,
} from './system.service';
import type {
  DatabaseSchemaResponse,
  ImportConfigResponse,
} from './system.types';

describe('BaseSystemService', () => {
  let service: BaseSystemService;

  class TestSystemService extends BaseSystemService {
    async getDatabaseSchema(): Promise<DatabaseSchemaResponse> {
      return { tables: [], relations: [], totalRows: 0, totalActiveRows: 0 };
    }

    async getImportConfig(): Promise<ImportConfigResponse> {
      return { modelOrder: [], bundles: {}, rowChunkSize: 100 };
    }

    async getModels(): Promise<string[]> {
      return ['user', 'post'];
    }

    async exportData(_modelName?: string): Promise<ExportDataResult> {
      return { modelOrder: ['user'], data: { user: [] }, exportedAt: new Date().toISOString() };
    }

    async exportExcelData(_modelName?: string): Promise<Buffer> {
      return Buffer.from('excel-data');
    }

    async importData(
      _data: Record<string, unknown[]>,
      _targetModel?: string,
      _skipClear?: boolean,
    ): Promise<ImportDataResult> {
      return { affected: 5, message: 'Import thành công 5 bản ghi' };
    }

    async importExcelData(
      _buffer: Buffer,
      _skipClear?: boolean,
    ): Promise<ImportDataResult> {
      return { affected: 3, message: 'Import thành công 3 bản ghi' };
    }
  }

  beforeEach(() => {
    service = new TestSystemService();
  });

  it('can be instantiated', () => {
    expect(service).toBeInstanceOf(BaseSystemService);
    expect(service).toBeInstanceOf(TestSystemService);
  });

  it('logger is defined with correct context', () => {
    expect(service['logger']).toBeDefined();
    expect(service['logger']).toBeInstanceOf(Logger);
  });

  it('default logger context is BaseSystemService', () => {
    const logger = service['logger'] as Logger;
    expect((logger as unknown as { context: string }).context).toBe('BaseSystemService');
  });

  describe('abstract methods return expected types', () => {
    it('getDatabaseSchema returns DatabaseSchemaResponse', async () => {
      const result = await service.getDatabaseSchema();
      expect(result).toEqual({
        tables: [],
        relations: [],
        totalRows: 0,
        totalActiveRows: 0,
      });
      expect(Array.isArray(result.tables)).toBe(true);
      expect(typeof result.totalRows).toBe('number');
    });

    it('getImportConfig returns ImportConfigResponse', async () => {
      const result = await service.getImportConfig();
      expect(result).toEqual({
        modelOrder: [],
        bundles: {},
        rowChunkSize: 100,
      });
      expect(Array.isArray(result.modelOrder)).toBe(true);
      expect(typeof result.rowChunkSize).toBe('number');
    });

    it('getModels returns string array', async () => {
      const result = await service.getModels();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('user');
      expect(result).toContain('post');
    });

    it('exportData returns ExportDataResult', async () => {
      const result = await service.exportData();
      expect(result).toHaveProperty('modelOrder');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('exportedAt');
      expect(Array.isArray(result.modelOrder)).toBe(true);
      expect(typeof result.exportedAt).toBe('string');
    });

    it('exportData with model name parameter', async () => {
      const result = await service.exportData('user');
      expect(result.modelOrder).toContain('user');
    });

    it('exportExcelData returns Buffer', async () => {
      const result = await service.exportExcelData();
      expect(result).toBeInstanceOf(Buffer);
    });

    it('exportExcelData with model name parameter', async () => {
      const result = await service.exportExcelData('user');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('importData returns ImportDataResult', async () => {
      const result = await service.importData({ user: [{ id: 1 }] });
      expect(result).toHaveProperty('affected');
      expect(result).toHaveProperty('message');
      expect(result.affected).toBe(5);
    });

    it('importData with targetModel and skipClear', async () => {
      const result = await service.importData({ user: [{ id: 1 }] }, 'user', false);
      expect(result.affected).toBe(5);
    });

    it('importExcelData returns ImportDataResult', async () => {
      const buffer = Buffer.from('test');
      const result = await service.importExcelData(buffer);
      expect(result.affected).toBe(3);
      expect(result.message).toContain('3');
    });

    it('importExcelData with skipClear', async () => {
      const buffer = Buffer.from('test');
      const result = await service.importExcelData(buffer, true);
      expect(result.affected).toBe(3);
    });
  });

  describe('logger usage', () => {
    it('logger can log messages without error', () => {
      expect(() => {
        service['logger'].log('test log');
        service['logger'].warn('test warn');
        service['logger'].error('test error');
      }).not.toThrow();
    });
  });
});
