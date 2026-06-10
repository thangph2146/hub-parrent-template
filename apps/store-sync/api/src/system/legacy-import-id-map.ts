import type { EntityManager } from '@mikro-orm/core';
import { coerceImportPrimaryKey } from '../common/entity-id';
import { Setting } from '../entities/setting.entity';

export const IMPORT_ID_MAP_GROUP = 'import_id_map';

export function importIdMapSettingKey(
  model: string,
  legacyId: string,
): string {
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
    let row = await em.findOne(Setting, { key });
    const now = new Date();
    if (!row) {
      row = new Setting();
      row.key = key;
      row.group = IMPORT_ID_MAP_GROUP;
      row.value = newId;
      row.createdAt = now;
      row.updatedAt = now;
    } else {
      row.value = newId;
      row.group = IMPORT_ID_MAP_GROUP;
      row.updatedAt = now;
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

    const row = await em.findOne(Setting, {
      key: importIdMapSettingKey(model, legacy),
      group: IMPORT_ID_MAP_GROUP,
    });
    if (row?.value == null) return undefined;
    const n =
      typeof row.value === 'number' ? row.value : Number(String(row.value));
    if (!Number.isFinite(n) || n <= 0) return undefined;
    this.remember(model, legacy, n);
    return n;
  }
}
