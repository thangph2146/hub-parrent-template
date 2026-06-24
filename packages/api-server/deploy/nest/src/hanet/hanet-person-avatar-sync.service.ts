import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { FaceData } from '../entities/face-data.entity';
import { linkHanetPersonToRegistrationsByEmail } from './hanet-registration-match';
import { linkFaceDataToUserByEmail } from './hanet-user-link';
import { HanetPartnerService } from './hanet-partner.service';
import {
  parseHanetPersonListPage,
  type HanetPersonRow,
} from './hanet-person-list.parse';
import { resolveHanetPlaceId } from './hanet-place-resolve';

export type HanetSyncAvatarsResult = {
  placeId: string;
  pages: number;
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  /** Person không ghi được DB (URL quá dài, unique, …) — sync vẫn trả 200. */
  failed: number;
  linkedRegistrations: number;
  linkedUsers: number;
  /** Tổng trên HANET (getTotalPersonByPlaceID). */
  hanetTotal?: number;
  /** Partner getListByPlace chỉ expose tối đa ~50 người / lần gọi. */
  hanetListCap?: number;
  /** true khi hanetTotal > fetched (không kéo đủ qua Partner API). */
  listLimited?: boolean;
};

export type HanetPersonListFromHanetResult = {
  placeId: string;
  pageIndex: number;
  pageSize: number;
  items: HanetPersonRow[];
  /** Số dòng admin có thể phân trang (face_data hoặc ~50 live HANET). */
  total: number;
  /** Tổng person trên HANET — chỉ mang tính tham chiếu. */
  hanetTotal?: number;
  syncedTotal: number;
  hanetListCap: number;
  listLimited: boolean;
};

export type HanetStoredAvatarRow = {
  id: number;
  hanetPersonId: string | null;
  hanetAliasId: string | null;
  displayName: string | null;
  imagePath: string;
  userId: number | null;
  updatedAt: string | null;
  createdAt: string;
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGES = 200;
/** Partner HANET getListByPlace — giới hạn thực tế trên tài khoản hiện tại. */
const HANET_PARTNER_LIST_CAP = 50;

@Injectable()
export class HanetPersonAvatarSyncService {
  private readonly logger = new Logger(HanetPersonAvatarSyncService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly partner: HanetPartnerService,
  ) {}

  async listFromHanet(
    placeId?: string,
    pageIndex = 0,
    pageSize = DEFAULT_PAGE_SIZE,
  ): Promise<HanetPersonListFromHanetResult> {
    const resolvedPlaceId = await this.resolvePlaceId(placeId);
    let hanetTotal: number | undefined;
    try {
      const grandTotal =
        await this.partner.getTotalPersonByPlace(resolvedPlaceId);
      if (grandTotal > 0) hanetTotal = grandTotal;
    } catch {
      // ignore
    }

    const stored = await this.listStored({
      page: pageIndex + 1,
      limit: pageSize,
    });

    const listLimited =
      hanetTotal != null &&
      hanetTotal > Math.max(stored.total, HANET_PARTNER_LIST_CAP);

    // Đã có face_data → phân trang local; total = số bản ghi thực có.
    if (stored.total > 0) {
      return {
        placeId: resolvedPlaceId,
        pageIndex,
        pageSize,
        items: stored.items.map((row) => this.storedToPersonRow(row)),
        total: stored.total,
        hanetTotal,
        syncedTotal: stored.total,
        hanetListCap: HANET_PARTNER_LIST_CAP,
        listLimited,
      };
    }

    const liveBrowsable = Math.min(
      HANET_PARTNER_LIST_CAP,
      hanetTotal ?? HANET_PARTNER_LIST_CAP,
    );

    // Chưa sync — chỉ trang 1 lấy live từ HANET (~50 người); không giả 4426 trang.
    if (pageIndex > 0) {
      return {
        placeId: resolvedPlaceId,
        pageIndex,
        pageSize,
        items: [],
        total: liveBrowsable,
        hanetTotal,
        syncedTotal: 0,
        hanetListCap: HANET_PARTNER_LIST_CAP,
        listLimited: listLimited || (hanetTotal ?? 0) > 0,
      };
    }

    const hanetPage = await this.fetchHanetPersonPage(
      resolvedPlaceId,
      0,
      pageSize,
    );
    const browsable =
      hanetTotal != null && hanetTotal > hanetPage.items.length
        ? Math.min(HANET_PARTNER_LIST_CAP, hanetTotal)
        : hanetPage.items.length;

    return {
      placeId: resolvedPlaceId,
      pageIndex,
      pageSize,
      items: hanetPage.items,
      total: browsable,
      hanetTotal,
      syncedTotal: 0,
      hanetListCap: HANET_PARTNER_LIST_CAP,
      listLimited:
        hanetTotal != null
          ? hanetTotal > hanetPage.items.length
          : hanetPage.items.length >= HANET_PARTNER_LIST_CAP,
    };
  }

  private async fetchHanetPersonPage(
    placeId: string,
    pageIndex: number,
    pageSize: number,
  ) {
    const response = await this.partner.getListPersonByPlace({
      placeId,
      pageIndex,
      pageSize,
    });
    const parsed = parseHanetPersonListPage(response.data);
    return {
      placeId: response.placeId,
      items: parsed.items,
      total: parsed.total,
    };
  }

  private storedToPersonRow(row: HanetStoredAvatarRow): HanetPersonRow {
    return {
      personId: row.hanetPersonId ?? '',
      displayName: row.displayName ?? '',
      aliasId: row.hanetAliasId ?? '',
      avatar: row.imagePath,
    };
  }

  async listStored(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ items: HanetStoredAvatarRow[]; total: number }> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 24));
    const search = params?.search?.trim() ?? '';

    const where: FilterQuery<FaceData> = {
      deletedAt: null,
      hanetPersonId: { $ne: null },
    };

    if (search) {
      where.$or = [
        { displayName: { $like: `%${search}%` } },
        { hanetAliasId: { $like: `%${search}%` } },
        { hanetPersonId: { $like: `%${search}%` } },
        { imagePath: { $like: `%${search}%` } },
      ];
    }

    const [rows, total] = await this.em.findAndCount(FaceData, where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: [{ updatedAt: 'DESC' }, { id: 'DESC' }],
      populate: ['user'],
    });

    return {
      items: rows.map((row) => this.toStoredRow(row)),
      total,
    };
  }

  /** Kéo toàn bộ person (kèm avatar) từ HANET → bảng face_data. */
  async syncFromPlace(placeId?: string): Promise<HanetSyncAvatarsResult> {
    const resolvedPlaceId = await this.resolvePlaceId(placeId);
    let pageIndex = 0;
    let pages = 0;
    let fetched = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let linkedRegistrations = 0;
    let linkedUsers = 0;
    let lastPageFirstId: string | null = null;
    const seenPersonIds = new Set<string>();

    while (pages < MAX_PAGES) {
      const page = await this.fetchHanetPersonPage(
        resolvedPlaceId,
        pageIndex,
        DEFAULT_PAGE_SIZE,
      );
      pages += 1;

      if (!page.items.length) break;

      const firstId = page.items[0]?.personId ?? null;
      if (pageIndex > 0 && firstId && firstId === lastPageFirstId) {
        this.logger.warn(
          `HANET getListByPlace trùng trang (pageIndex=${pageIndex}) — dừng phân trang`,
        );
        break;
      }
      lastPageFirstId = firstId;

      for (const person of page.items) {
        if (seenPersonIds.has(person.personId)) continue;
        seenPersonIds.add(person.personId);

        fetched += 1;
        try {
          const outcome = await this.upsertPersonAvatar(person);
          if (outcome === 'created') created += 1;
          else if (outcome === 'updated') updated += 1;
          else skipped += 1;

          if (person.aliasId.includes('@')) {
            linkedRegistrations += await linkHanetPersonToRegistrationsByEmail(
              this.em,
              person.personId,
              person.aliasId,
            );
            const face = await this.em.findOne(FaceData, {
              hanetPersonId: person.personId,
              deletedAt: null,
            } as FilterQuery<FaceData>);
            if (face) {
              const userId = await linkFaceDataToUserByEmail(
                this.em,
                face,
                person.aliasId,
              );
              if (userId) linkedUsers += 1;
            }
          }
        } catch (err) {
          failed += 1;
          const message = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `HANET avatar sync skip person=${person.personId}: ${message}`,
          );
        }
      }

      if (page.items.length < DEFAULT_PAGE_SIZE) break;
      if (
        page.total != null &&
        page.total > DEFAULT_PAGE_SIZE &&
        seenPersonIds.size >= page.total
      ) {
        break;
      }
      pageIndex += 1;
    }

    let hanetTotal = 0;
    try {
      hanetTotal = await this.partner.getTotalPersonByPlace(resolvedPlaceId);
    } catch {
      // ignore
    }
    if (hanetTotal > fetched && fetched <= DEFAULT_PAGE_SIZE) {
      this.logger.warn(
        `HANET getListByPlace chỉ trả ${fetched}/${hanetTotal} person — partner API có thể giới hạn phân trang; kiểm tra gói cloud HANET.`,
      );
    }

    this.logger.log(
      `HANET avatar sync place=${resolvedPlaceId || '-'} fetched=${fetched} created=${created} updated=${updated} failed=${failed}`,
    );

    return {
      placeId: resolvedPlaceId,
      pages,
      fetched,
      created,
      updated,
      skipped,
      failed,
      linkedRegistrations,
      linkedUsers,
      hanetTotal: hanetTotal > 0 ? hanetTotal : undefined,
      hanetListCap: HANET_PARTNER_LIST_CAP,
      listLimited: hanetTotal > fetched,
    };
  }

  private async upsertPersonAvatar(
    person: HanetPersonRow,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const personId = person.personId.trim();
    if (!personId) return 'skipped';

    const avatarUrl = person.avatar.trim();
    const imagePath = avatarUrl || `hanet:person:${personId}`;
    const displayName = this.clipVarchar(person.displayName, 255) || null;
    const aliasId = this.clipVarchar(person.aliasId, 255) || null;

    let face = await this.findFaceByHanetPersonId(personId);
    const now = new Date();

    if (!face) {
      face = this.em.create(FaceData, {
        hanetPersonId: personId,
        hanetAliasId: aliasId,
        displayName,
        imagePath,
        status: 1,
        createdAt: now,
      });
      this.em.persist(face);
      await this.em.flush();
      return 'created';
    }

    let changed = false;
    if (face.deletedAt) {
      face.deletedAt = null;
      changed = true;
    }
    if (displayName && face.displayName !== displayName) {
      face.displayName = displayName;
      changed = true;
    }
    if (aliasId && face.hanetAliasId !== aliasId) {
      face.hanetAliasId = aliasId;
      changed = true;
    }
    if (avatarUrl && face.imagePath !== avatarUrl) {
      face.imagePath = avatarUrl;
      changed = true;
    }

    if (!changed) return 'skipped';

    face.updatedAt = now;
    await this.em.flush();
    return 'updated';
  }

  /** Ưu tiên bản ghi active; nếu chỉ còn soft-delete thì khôi phục thay vì insert trùng unique. */
  private async findFaceByHanetPersonId(
    personId: string,
  ): Promise<FaceData | null> {
    const active = await this.em.findOne(FaceData, {
      hanetPersonId: personId,
      deletedAt: null,
    } as FilterQuery<FaceData>);
    if (active) return active;

    return this.em.findOne(FaceData, {
      hanetPersonId: personId,
    } as FilterQuery<FaceData>);
  }

  private clipVarchar(value: string, max: number): string {
    const trimmed = value.trim();
    return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
  }

  private async resolvePlaceId(placeId?: string): Promise<string> {
    return resolveHanetPlaceId(this.partner, placeId);
  }

  /** Soft-delete face_data local sau khi xóa person trên HANET — list admin ưu tiên bảng này. */
  async purgeStoredPersons(opts: {
    personIds?: string[];
    aliasIds?: string[];
    all?: boolean;
  }): Promise<number> {
    const now = new Date();
    const personIds = (opts.personIds ?? [])
      .map((id) => id.trim())
      .filter(Boolean);
    const aliasIds = (opts.aliasIds ?? [])
      .map((id) => id.trim())
      .filter(Boolean);

    if (!opts.all && !personIds.length && !aliasIds.length) {
      return 0;
    }

    const where: FilterQuery<FaceData> = {
      deletedAt: null,
      hanetPersonId: { $ne: null },
    };

    if (!opts.all) {
      if (personIds.length) {
        where.hanetPersonId = { $in: personIds };
      } else if (aliasIds.length) {
        where.hanetAliasId = { $in: aliasIds };
      }
    }

    const rows = await this.em.find(FaceData, where);
    if (!rows.length) return 0;

    for (const row of rows) {
      row.deletedAt = now;
      row.updatedAt = now;
    }
    await this.em.flush();
    return rows.length;
  }

  private toStoredRow(row: FaceData): HanetStoredAvatarRow {
    return {
      id: row.id,
      hanetPersonId: row.hanetPersonId ?? null,
      hanetAliasId: row.hanetAliasId ?? null,
      displayName: row.displayName ?? null,
      imagePath: row.imagePath,
      userId: row.user?.id ?? null,
      updatedAt: row.updatedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
