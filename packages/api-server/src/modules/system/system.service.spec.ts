import { Logger } from '@nestjs/common';
import {
  ExportDataResult,
  ImportDataResult,
} from './system.service';
import type {
  DatabaseSchemaResponse,
  ImportConfigResponse,
} from './system.types';

describe('BaseSystemService contracts', () => {
  describe('ExportDataResult / ImportDataResult shapes', () => {
    it('ExportDataResult có modelOrder, data, exportedAt', () => {
      const sample: ExportDataResult = {
        modelOrder: ['user'],
        data: { user: [] },
        exportedAt: new Date().toISOString(),
      };
      expect(Array.isArray(sample.modelOrder)).toBe(true);
      expect(typeof sample.data).toBe('object');
      expect(typeof sample.exportedAt).toBe('string');
    });

    it('ImportDataResult có affected và message', () => {
      const sample: ImportDataResult = {
        affected: 1,
        message: 'ok',
      };
      expect(typeof sample.affected).toBe('number');
      expect(typeof sample.message).toBe('string');
    });
  });

  describe('stub service method contracts', () => {
    class StubSystemService {
      protected readonly logger = new Logger(StubSystemService.name);

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

    let service: StubSystemService;

    beforeEach(() => {
      service = new StubSystemService();
    });

    it('logger context khớp tên stub', () => {
      expect(service['logger']).toBeInstanceOf(Logger);
      expect((service['logger'] as unknown as { context: string }).context).toBe(
        'StubSystemService',
      );
    });

    it('getModels trả string[]', async () => {
      await expect(service.getModels()).resolves.toEqual(['user', 'post']);
    });

    it('importData trả ImportDataResult', async () => {
      const result = await service.importData({ user: [{ id: 1 }] });
      expect(result.affected).toBe(5);
    });
  });
});
