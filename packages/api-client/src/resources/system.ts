import type { ApiClient, RequestOptions } from "../client";
import { getData, postData } from "./_shared";

export type SchemaColumn = {
  name: string;
  type: string;
  kind: "pk" | "fk" | "field";
  nullable?: boolean;
  references?: string;
};

export type SchemaTable = {
  name: string;
  entityName: string;
  exportModelName: string;
  domain: string;
  description: string;
  rowCount: number;
  activeRowCount: number;
  trashedRowCount: number;
  /** Ví dụ: settings group import_id_map (không phải cấu hình nghiệp vụ). */
  auxiliaryRowCount?: number;
  columns: SchemaColumn[];
};

export type ImportVerificationModel = {
  exportModelName: string;
  expected: number;
  actual: number;
  status: "ok" | "over" | "under";
  note?: string;
};

export type ImportVerification = {
  referenceSource: string;
  referenceExportedAt: string;
  referenceFile: string;
  isComplete: boolean;
  matchedModels: number;
  mismatchedModels: number;
  expectedBusinessTotalRows: number;
  actualBusinessTotalRows: number;
  models: ImportVerificationModel[];
};

export type SchemaRelation = {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: "many-to-one" | "one-to-one" | "self";
  deleteRule?: "cascade" | "set null" | "restrict";
};

export type DatabaseSchemaResponse = {
  tables: SchemaTable[];
  relations: SchemaRelation[];
  totalRows: number;
  totalActiveRows: number;
  verification?: ImportVerification;
};

export type ImportConfigResponse = {
  modelOrder: string[];
  /** modelName (camelCase) → tableName (JSON export key, e.g. post → posts). */
  modelTableNames?: Record<string, string>;
  bundles: Record<string, readonly string[]>;
  rowChunkSize: number;
  modelChunkSizes?: Record<string, number>;
  parallelChunkConcurrency?: number;
  modelParallelConcurrency?: Record<string, number>;
  /** Giới hạn bytes/lô HTTP cho post (Lexical JSON nặng). */
  postPayloadChunkBytes?: number;
  reference?: {
    source: string;
    exportedAt: string;
    description?: string;
    expectedCounts: Record<string, number>;
    file: string;
  } | null;
  recommendedExportFile?: string;
};

export type ImportRowError = {
  model: string;
  index: number;
  message: string;
};

export type ImportModelTiming = {
  model: string;
  clearMs: number;
  insertMs: number;
  imported: number;
};

export type ImportTiming = {
  requestMs: number;
  models: ImportModelTiming[];
};

export type ImportDataResult = {
  success?: boolean;
  message?: string;
  rowErrors?: ImportRowError[];
  timing?: ImportTiming;
};

export type ImportDataParams = {
  model: string;
  skipClear: boolean;
  payload: Record<string, unknown[]>;
};

export type SystemBootstrapResult = {
  rolesInserted: number;
  rolesUpdated: number;
  rolesSkipped: number;
  usersInserted: number;
  usersUpdated: number;
  usersSkipped: number;
  userRolesInserted: number;
  userRolesSkipped: number;
  pageContentsInserted: number;
  pageContentsSkipped: number;
};

export class SystemApi {
  constructor(private readonly http: ApiClient) {}

  async getDatabaseSchema(
    options?: RequestOptions,
  ): Promise<DatabaseSchemaResponse> {
    return getData<DatabaseSchemaResponse>(
      this.http,
      "/admin/system/database-schema",
      options,
    );
  }

  async getImportConfig(): Promise<ImportConfigResponse> {
    return getData<ImportConfigResponse>(
      this.http,
      "/admin/system/import-config",
    );
  }

  async importData(
    params: ImportDataParams,
    options?: RequestOptions,
  ): Promise<ImportDataResult> {
    return postData<ImportDataResult>(
      this.http,
      "/admin/system/import",
      params.payload,
      {
        query: {
          model: params.model,
          skipClear: params.skipClear ? "true" : "false",
          stream: "false",
        },
        timeoutMs: 120_000,
        ...options,
      },
    );
  }

  async runSeedBootstrap(
    options?: RequestOptions,
  ): Promise<SystemBootstrapResult> {
    return postData<SystemBootstrapResult>(
      this.http,
      "/admin/system/seed-bootstrap",
      undefined,
      options,
    );
  }
}
