/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import type { EntityManager } from '@mikro-orm/core';
import { coerceImportPrimaryKey } from '../../index';

export const IMPORT_ID_MAP_GROUP = 'import_id_map';

export function importIdMapSettingKey(model: string, legacyId: string): string {
  return `import_id_map:${model}:${legacyId}`;
}

/** Khóa legacy từ export (UUID/CUID) — không nhận id số đã migrate. */
export function exportLegacyKey(raw: unknown): string | undefined {
  const pk = coerceImportPrimaryKey(raw);
  if (pk != null) return undefined;
  if (raw == null || raw === '') return undefined;
  const s = String(raw).trim();
  return s || undefined;
}

/**
 * Ánh xạ id export cũ → id int mới trong cùng phiên import (và lưu settings để dùng qua nhiều request).
 */
export class LegacyImportIdMap {
  private mem = new Map<string, number>();

  constructor(
    private readonly SettingEntity: new () => Record<string, unknown>,
  ) {}

  private memKey(model: string, legacyId: string): string {
    return `${model}:${legacyId}`;
  }

  remember(model: string, legacyId: string, newId: number): void {
    this.mem.set(this.memKey(model, legacyId), newId);
  }

  recall(model: string, legacyId: string): number | undefined {
    return this.mem.get(this.memKey(model, legacyId));
  }

  async persist(
    em: EntityManager,
    model: string,
    legacyId: string,
    newId: number,
  ): Promise<void> {
    this.remember(model, legacyId, newId);
    const key = importIdMapSettingKey(model, legacyId);
    const Setting = this.SettingEntity;
    let row = await em.findOne(Setting, { key } as never);
    const now = new Date();
    if (!row) {
      row = new Setting() as Record<string, unknown>;
      row.key = key;
      row.group = IMPORT_ID_MAP_GROUP;
      row.value = newId;
      row.createdAt = now;
      row.updatedAt = now;
    } else {
      const record = row as Record<string, unknown>;
      record.value = newId;
      record.group = IMPORT_ID_MAP_GROUP;
      record.updatedAt = now;
    }
    em.persist(row);
  }

  async resolve(
    em: EntityManager,
    model: string,
    raw: unknown,
  ): Promise<number | undefined> {
    const pk = coerceImportPrimaryKey(raw);
    if (pk != null) return pk;
    const legacy = exportLegacyKey(raw);
    if (!legacy) return undefined;

    const cached = this.recall(model, legacy);
    if (cached != null) return cached;

    const row = await em.findOne(this.SettingEntity, {
      key: importIdMapSettingKey(model, legacy),
      group: IMPORT_ID_MAP_GROUP,
    } as never);
    const record = row as Record<string, unknown> | null;
    if (record?.value == null) return undefined;
    const n =
      typeof record.value === 'number'
        ? record.value
        : Number(String(record.value));
    if (!Number.isFinite(n) || n <= 0) return undefined;
    this.remember(model, legacy, n);
    return n;
  }
}
