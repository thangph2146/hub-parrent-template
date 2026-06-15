/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
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

export type HanetSyncAvatarsResult = {
  placeId: string;
  pages: number;
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  linkedRegistrations: number;
  linkedUsers: number;
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
  ) {
    const response = await this.partner.getListPersonByPlace({
      placeId,
      pageIndex,
      pageSize,
    });
    const parsed = parseHanetPersonListPage(response.data);
    return {
      placeId: response.placeId,
      pageIndex,
      pageSize,
      ...parsed,
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
    let pageIndex = 0;
    let pages = 0;
    let fetched = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let linkedRegistrations = 0;
    let linkedUsers = 0;
    let resolvedPlaceId = '';

    while (pages < MAX_PAGES) {
      const page = await this.listFromHanet(
        placeId,
        pageIndex,
        DEFAULT_PAGE_SIZE,
      );
      if (!resolvedPlaceId) resolvedPlaceId = page.placeId;
      pages += 1;

      if (!page.items.length) break;

      for (const person of page.items) {
        fetched += 1;
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
      }

      if (page.items.length < DEFAULT_PAGE_SIZE) break;
      if (page.total != null && fetched >= page.total) break;
      pageIndex += 1;
    }

    this.logger.log(
      `HANET avatar sync place=${resolvedPlaceId || '-'} fetched=${fetched} created=${created} updated=${updated}`,
    );

    return {
      placeId: resolvedPlaceId,
      pages,
      fetched,
      created,
      updated,
      skipped,
      linkedRegistrations,
      linkedUsers,
    };
  }

  private async upsertPersonAvatar(
    person: HanetPersonRow,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const imagePath =
      person.avatar.trim() || `hanet:person:${person.personId}`;

    let face = await this.em.findOne(FaceData, {
      hanetPersonId: person.personId,
      deletedAt: null,
    } as FilterQuery<FaceData>);

    const now = new Date();

    if (!face) {
      face = this.em.create(FaceData, {
        hanetPersonId: person.personId,
        hanetAliasId: person.aliasId || null,
        displayName: person.displayName || null,
        imagePath,
        status: 1,
        createdAt: now,
      });
      this.em.persist(face);
      await this.em.flush();
      return 'created';
    }

    let changed = false;
    if (person.displayName && face.displayName !== person.displayName) {
      face.displayName = person.displayName;
      changed = true;
    }
    if (person.aliasId && face.hanetAliasId !== person.aliasId) {
      face.hanetAliasId = person.aliasId;
      changed = true;
    }
    if (person.avatar && face.imagePath !== person.avatar) {
      face.imagePath = person.avatar;
      changed = true;
    }

    if (!changed) return 'skipped';

    face.updatedAt = now;
    await this.em.flush();
    return 'updated';
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
