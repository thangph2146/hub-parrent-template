import { Injectable, Logger } from '@nestjs/common';
import type {
  DatabaseSchemaResponse,
  ImportConfigResponse,
} from './system.types';

export interface ExportDataResult {
  modelOrder: string[];
  data: Record<string, unknown[]>;
  exportedAt: string;
}

export interface ImportDataResult {
  affected: number;
  message: string;
  errors?: string[];
}

@Injectable()
export abstract class BaseSystemService {
  protected readonly logger = new Logger(BaseSystemService.name);

  abstract getDatabaseSchema(): Promise<DatabaseSchemaResponse>;

  abstract getImportConfig(): Promise<ImportConfigResponse>;

  abstract getModels(): Promise<string[]>;

  abstract exportData(modelName?: string): Promise<ExportDataResult>;

  abstract exportExcelData(modelName?: string): Promise<Buffer>;

  abstract importData(
    data: Record<string, unknown[]>,
    targetModel?: string,
    skipClear?: boolean,
  ): Promise<ImportDataResult>;

  abstract importExcelData(
    buffer: Buffer,
    skipClear?: boolean,
  ): Promise<ImportDataResult>;
}
