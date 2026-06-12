/**
 * Settings Service.
 *
 * Bám sát pattern của `apps/main/api/src/settings/settings.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `setting.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export type PublicSiteBranding = {
  siteName: string;
  siteDescription: string;
};

const PUBLIC_BRANDING_DEFAULTS: PublicSiteBranding = {
  siteName: 'HUB',
  siteDescription: 'Quan tri he thong',
};

function parseSettingString(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value && typeof value === 'object' && 'value' in value) {
    return parseSettingString((value as { value?: unknown }).value, fallback);
  }
  return fallback;
}

/**
 * Setting row DTO trả về cho client.
 * Các field khớp với entity `Setting`.
 */
export interface SettingsRowDto extends CrudRowDto {
  id: number | string;
  key?: string;
  value: unknown;
  group: string;
}

/**
 * Setting create DTO - tất cả optional ngoại trừ các field required.
 */
export interface SettingsCreateData extends CrudCreateData {
  value?: unknown;
  group?: string;
}

/**
 * Setting update DTO - tất cả optional (Partial pattern).
 */
export interface SettingsUpdateData extends CrudUpdateData {
  value?: unknown;
  group?: string;
}

/**
 * Abstract Settings Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseSettingsService extends BaseCrudService<
  SettingsRowDto,
  SettingsCreateData,
  SettingsUpdateData
> {
  protected readonly logger = new Logger(BaseSettingsService.name);

  /** Trả về class constructor của entity (vd: `Setting`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Setting';
  }

  /** Tên trường primary key. */
  protected getPrimaryKeyField(): string {
    return 'id';
  }

  /** Soft delete field - null nếu entity không hỗ trợ. */
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  /** Fields cho phép search LIKE. Override trong subclass nếu cần. */
  protected getSearchFields(): string[] {
    return ['key', 'group'];
  }

  /** Fields cho phép exact-match filter. */
  protected getFilterableFields(): string[] {
    return ['isActive'];
  }

  protected mapRow(entity: Record<string, unknown>): SettingsRowDto {
    return {
      ...(entity as CrudRowDto),
      id: entity.id as number | string,
      key: entity.key != null ? String(entity.key) : undefined,
      value: entity.value,
      group: entity.group != null ? String(entity.group) : 'general',
    };
  }

  async listSettings(params: { group?: string; search?: string } = {}): Promise<SettingsRowDto[]> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const where: Record<string, unknown> = {};
    const group = params.group?.trim();
    const search = params.search?.trim();
    if (group) where.group = group;
    if (search) {
      const q = `%${search}%`;
      where.$or = [{ key: { $like: q } }, { group: { $like: q } }];
    }
    const rows = await em.find(
      Entity,
      where as FilterQuery<Record<string, unknown>>,
      { orderBy: { key: 'ASC' } },
    );
    return rows.map((row) => this.mapRow(row as Record<string, unknown>));
  }

  async getByKey(key: string): Promise<SettingsRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const found = await em.findOne(Entity, {
      key: key.trim(),
    } as FilterQuery<Record<string, unknown>>);
    if (!found) return null;
    return this.mapRow(found as Record<string, unknown>);
  }

  async getPublicBranding(): Promise<PublicSiteBranding> {
    const [siteNameRow, siteDescriptionRow] = await Promise.all([
      this.getByKey('site_name'),
      this.getByKey('site_description'),
    ]);

    return {
      siteName: parseSettingString(
        siteNameRow?.value,
        PUBLIC_BRANDING_DEFAULTS.siteName,
      ),
      siteDescription: parseSettingString(
        siteDescriptionRow?.value,
        PUBLIC_BRANDING_DEFAULTS.siteDescription,
      ),
    };
  }

  async bulkUpdate(settings: Record<string, unknown>): Promise<SettingsRowDto[]> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const results: SettingsRowDto[] = [];

    for (const [rawKey, value] of Object.entries(settings ?? {})) {
      const key = rawKey.trim();
      if (!key) continue;
      const existing = await em.findOne(Entity, {
        key,
      } as FilterQuery<Record<string, unknown>>);

      if (existing) {
        (existing as Record<string, unknown>).value = value;
        results.push(this.mapRow(existing as Record<string, unknown>));
        continue;
      }

      const created = new Entity() as Record<string, unknown>;
      created.key = key;
      created.value = value;
      created.group = 'general';
      em.persist(created);
      results.push(this.mapRow(created));
    }

    await em.flush();
    return results;
  }

  async updateByKey(key: string, value: unknown): Promise<SettingsRowDto> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const normalizedKey = key.trim();
    const existing = await em.findOne(Entity, {
      key: normalizedKey,
    } as FilterQuery<Record<string, unknown>>);

    if (existing) {
      (existing as Record<string, unknown>).value = value;
      await em.flush();
      return this.mapRow(existing as Record<string, unknown>);
    }

    const created = new Entity() as Record<string, unknown>;
    created.key = normalizedKey;
    created.value = value;
    created.group = 'general';
    em.persist(created);
    await em.flush();
    return this.mapRow(created);
  }

  async deleteSetting(id: string | number): Promise<SettingsRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const found = await em.findOne(Entity, {
      [this.getPrimaryKeyField()]: this.toEntityId(id),
    } as FilterQuery<Record<string, unknown>>);
    if (!found) return null;

    if (typeof (em as EntityManager & { removeAndFlush?: (entity: unknown) => Promise<void> }).removeAndFlush === 'function') {
      await (em as EntityManager & { removeAndFlush: (entity: unknown) => Promise<void> }).removeAndFlush(found);
    } else {
      em.remove(found);
      await em.flush();
    }

    return this.mapRow(found as Record<string, unknown>);
  }
}
