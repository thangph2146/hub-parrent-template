/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { FaceData } from '../entities/face-data.entity';
import { User } from '../entities/user.entity';
import { getHanetConfig, isHanetConfigured } from './hanet.config';
import { linkHanetPersonToRegistrationsByEmail } from './hanet-registration-match';
import { HanetPartnerService } from './hanet-partner.service';
import { pickHanetString } from './hanet-payload';

export type HanetSyncUserFaceInput = {
  userId?: number;
  email: string;
  name: string;
  avatarUrl: string;
  placeId?: string;
};

export type HanetSyncUserFaceResult =
  | { ok: true; personId: string; faceDataId: number; linkedRegistrations: number }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string };

function envAutoRegisterFace(): boolean {
  const raw = process.env.HANET_AUTO_REGISTER_FACE;
  if (raw == null || raw.trim() === '') return true;
  return raw === 'true' || raw === '1';
}

/** Trích personID từ data partner API (registerByUrl / webhook). */
export function extractHanetPersonId(data: unknown): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return '';
  const record = data as Record<string, unknown>;
  return pickHanetString(record, [
    'personID',
    'personId',
    'person_id',
    'id',
  ]);
}

@Injectable()
export class HanetPersonRegisterService {
  private readonly logger = new Logger(HanetPersonRegisterService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly partner: HanetPartnerService,
  ) {}

  /**
   * Đăng ký / cập nhật khuôn mặt lên HANET từ avatar user (cổng SV).
   * Không throw — caller (profile / đăng ký sự kiện) vẫn thành công nếu HANET lỗi.
   */
  async syncUserFaceToHanet(
    input: HanetSyncUserFaceInput,
  ): Promise<HanetSyncUserFaceResult> {
    if (!envAutoRegisterFace()) {
      return { ok: false, skipped: true, reason: 'HANET_AUTO_REGISTER_FACE=false' };
    }
    if (!isHanetConfigured(getHanetConfig())) {
      return { ok: false, skipped: true, reason: 'Chưa cấu hình HANET OAuth' };
    }

    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const avatarUrl = input.avatarUrl.trim();

    if (!email.includes('@')) {
      return { ok: false, skipped: true, reason: 'Thiếu email hợp lệ' };
    }
    if (!name) {
      return { ok: false, skipped: true, reason: 'Thiếu họ tên' };
    }
    if (!avatarUrl) {
      return { ok: false, skipped: true, reason: 'Chưa có ảnh đại diện' };
    }

    const existingFace = await this.findExistingFace(input.userId, email);
    if (
      existingFace?.hanetPersonId &&
      existingFace.imagePath === avatarUrl
    ) {
      return {
        ok: false,
        skipped: true,
        reason: 'Ảnh HANET đã đồng bộ — không gọi lại registerByUrl',
      };
    }

    try {
      const partnerResult = await this.partner.registerPersonByUrl({
        placeId: input.placeId ?? '',
        name,
        aliasId: email,
        url: avatarUrl,
        personType: 1,
      });

      const personId = extractHanetPersonId(partnerResult);
      if (!personId) {
        return {
          ok: false,
          skipped: false,
          error: 'HANET registerByUrl không trả personID',
        };
      }

      const faceDataId = await this.upsertFaceData({
        userId: input.userId,
        email,
        name,
        avatarUrl,
        personId,
      });

      const linkedRegistrations =
        await linkHanetPersonToRegistrationsByEmail(
          this.em,
          personId,
          email,
        );

      this.logger.log(
        `HANET registerByUrl ok personId=${personId} user=${input.userId ?? '-'} email=${email} faceData=${faceDataId} linkedRegs=${linkedRegistrations}`,
      );

      return {
        ok: true,
        personId,
        faceDataId,
        linkedRegistrations,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'HANET registerByUrl thất bại';
      this.logger.warn(
        `HANET syncUserFace skipped for ${email}: ${message}`,
      );
      return { ok: false, skipped: false, error: message };
    }
  }

  private async findExistingFace(
    userId: number | undefined,
    email: string,
  ): Promise<FaceData | null> {
    if (userId != null) {
      const byUser = await this.em.findOne(FaceData, {
        user: userId,
        deletedAt: null,
      } as FilterQuery<FaceData>);
      if (byUser) return byUser;
    }
    return this.em.findOne(FaceData, {
      hanetAliasId: email,
      deletedAt: null,
    } as FilterQuery<FaceData>);
  }

  private async upsertFaceData(input: {
    userId?: number;
    email: string;
    name: string;
    avatarUrl: string;
    personId: string;
  }): Promise<number> {
    let face = await this.em.findOne(FaceData, {
      hanetPersonId: input.personId,
      deletedAt: null,
    } as FilterQuery<FaceData>);

    if (!face && input.userId != null) {
      face = await this.em.findOne(FaceData, {
        user: input.userId,
        deletedAt: null,
      } as FilterQuery<FaceData>);
    }

    const now = new Date();
    if (!face) {
      face = this.em.create(FaceData, {
        hanetPersonId: input.personId,
        hanetAliasId: input.email,
        displayName: input.name,
        imagePath: input.avatarUrl,
        status: 1,
        createdAt: now,
      });
      if (input.userId != null) {
        face.user = this.em.getReference(User, input.userId);
      }
      this.em.persist(face);
    } else {
      face.hanetPersonId = input.personId;
      face.hanetAliasId = input.email;
      face.displayName = input.name;
      face.imagePath = input.avatarUrl;
      face.updatedAt = now;
      if (input.userId != null && !face.user) {
        face.user = this.em.getReference(User, input.userId);
      }
    }

    await this.em.flush();
    return face.id;
  }
}
