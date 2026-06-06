import type { ApiClient, RequestOptions } from "../client";
import { getData } from "./_shared";

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
  columns: SchemaColumn[];
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
};

export type ImportConfigResponse = {
  modelOrder: string[];
  bundles: Record<string, readonly string[]>;
  rowChunkSize: number;
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
}
