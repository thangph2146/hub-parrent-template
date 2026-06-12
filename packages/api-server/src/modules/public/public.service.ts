import { Injectable } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { parseEntityId } from '../../common';

export type PublicPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PublicPagedPayload<T> = {
  data: T[];
  meta: PublicPaginationMeta;
};

export type RegisterForEventResult = {
  id: number;
  eventId: number;
  email: string;
  fullName: string;
  status: number;
  registeredAt: string | null;
};

export type MyRegisteredEventItem = {
  id: number;
  eventId: number;
  email: string;
  fullName: string;
  phone: string | null;
  registeredAt: string | null;
  status: number;
  hasCheckin: boolean;
  hasCheckout: boolean;
  attendanceStatus: number;
  attendanceMinutes: number;
  checkinMethod: number;
  event: {
    id: number;
    title: string;
    slug: string | null;
    poster: unknown;
    startDate: string | null;
    endDate: string | null;
    registrationStart: string | null;
    registrationEnd: string | null;
    location: string | null;
    address: string | null;
    format: number;
    status: number;
  };
};

export type SeoMetaPublicDto = {
  page: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
};

type DateLike = string | number | Date | null | undefined;

function toIso(value: DateLike): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildMeta(page: number, limit: number, total: number): PublicPaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

function normalizeBooleanQuery(value: unknown): boolean {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

type EventTimeFilter = 'all' | 'upcoming' | 'ongoing' | 'past' | 'featured';

@Injectable()
export abstract class BasePublicService {
  protected abstract getEm(): EntityManager;
  protected abstract getPostEntity(): new () => Record<string, unknown>;
  protected abstract getCategoryEntity(): new () => Record<string, unknown>;
  protected abstract getPostCategoryEntity(): new () => Record<string, unknown>;
  protected abstract getPageContentEntity(): new () => Record<string, unknown>;
  protected abstract getEventEntity(): new () => Record<string, unknown>;
  protected abstract getEventRegistrationEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getSeoMetaEntity(): new () => Record<string, unknown>;

  async getCategories(slug?: string): Promise<Array<Record<string, unknown>>> {
    const em = this.getEm();
    const Category = this.getCategoryEntity();
    const normalizedSlug = slug?.trim();

    const baseFilter: Record<string, unknown> = {
      deletedAt: null,
      type: 'post',
    };

    if (!normalizedSlug) {
      return await em.find(Category, { ...baseFilter, parentId: null } as never, {
        orderBy: { sortOrder: 'ASC', id: 'ASC' },
      });
    }

    const parent = await em.findOne(Category, {
      ...baseFilter,
      slug: normalizedSlug,
    } as never);
    if (!parent) return [];
    return await em.find(Category, { ...baseFilter, parentId: parent.id } as never, {
      orderBy: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async getEventCategories(slug?: string): Promise<Array<Record<string, unknown>>> {
    const em = this.getEm();
    const Category = this.getCategoryEntity();

    const baseFilter: Record<string, unknown> = {
      deletedAt: null,
      type: 'post',
    };

    const root = await em.findOne(Category, {
      ...baseFilter,
      slug: 'su-kien',
    } as never);
    if (!root) {
      return await this.getCategories(slug);
    }

    const normalizedSlug = slug?.trim();
    if (normalizedSlug) {
      const matched = await em.findOne(Category, {
        ...baseFilter,
        slug: normalizedSlug,
      } as never);
      if (!matched) return [];
      if (matched.parentId === root.id) return [matched as never];
      return await em.find(Category, { ...baseFilter, parentId: matched.id } as never, {
        orderBy: { sortOrder: 'ASC', id: 'ASC' },
      });
    }

    return await em.find(Category, { ...baseFilter, parentId: root.id } as never, {
      orderBy: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async getPageContents(pageKey: string): Promise<Array<Record<string, unknown>>> {
    const em = this.getEm();
    const PageContent = this.getPageContentEntity();
    const key = pageKey?.trim();
    if (!key) return [];
    return await em.find(
      PageContent,
      { pageKey: key, isVisible: true } as never,
      { orderBy: { id: 'ASC' } },
    );
  }

  async getPageContentBySection(
    pageKey: string,
    sectionKey: string,
  ): Promise<Record<string, unknown> | null> {
    const em = this.getEm();
    const PageContent = this.getPageContentEntity();
    const pk = pageKey?.trim();
    const sk = sectionKey?.trim();
    if (!pk || !sk) return null;
    return await em.findOne(PageContent, { pageKey: pk, sectionKey: sk, isVisible: true } as never);
  }

  async getPosts(params: Record<string, unknown>): Promise<PublicPagedPayload<Record<string, unknown>>> {
    const em = this.getEm();
    const Post = this.getPostEntity();
    const Category = this.getCategoryEntity();
    const PostCategory = this.getPostCategoryEntity();

    const page = Math.max(1, parsePositiveInt(params.page, 1));
    const limit = Math.min(50, Math.max(1, parsePositiveInt(params.limit, 10)));
    const search = String(params.search ?? '').trim();
    const categorySlug = String(params.categorySlug ?? '').trim();

    let postIds: number[] | null = null;
    if (categorySlug) {
      const cat = await em.findOne(Category, { slug: categorySlug, deletedAt: null } as never);
      if (!cat?.id) {
        return { data: [], meta: buildMeta(page, limit, 0) };
      }
      const joins = await em.find(PostCategory, { categoryId: cat.id } as never);
      postIds = joins
        .map((row) => parseEntityId((row as Record<string, unknown>).postId as never))
        .filter((value) => Number.isFinite(value));
      if (!postIds.length) {
        return { data: [], meta: buildMeta(page, limit, 0) };
      }
    }

    const baseFilter: FilterQuery<Record<string, unknown>> = {
      deletedAt: null,
      published: true,
    } as never;
    if (postIds) {
      (baseFilter as Record<string, unknown>).id = { $in: postIds };
    }
    if (search) {
      (baseFilter as Record<string, unknown>).title = { $like: `%${search}%` };
    }

    const total = await em.count(Post, baseFilter);
    const data = await em.find(Post, baseFilter, {
      orderBy: { publishedAt: 'DESC', createdAt: 'DESC', id: 'DESC' },
      offset: (page - 1) * limit,
      limit,
    });
    return { data, meta: buildMeta(page, limit, total) };
  }

  async getPostBySlug(slug: string, options?: { trackView?: boolean }): Promise<Record<string, unknown> | null> {
    const em = this.getEm();
    const Post = this.getPostEntity();
    const normalized = slug?.trim();
    if (!normalized) return null;

    const found = await em.findOne(Post, {
      slug: normalized,
      deletedAt: null,
      published: true,
    } as never);
    if (!found) return null;

    if (options?.trackView !== false) {
      const id = (found as Record<string, unknown>).id;
      const current = Number((found as Record<string, unknown>).viewCount ?? 0) || 0;
      await em.nativeUpdate(Post, { id } as never, { viewCount: current + 1 });
      (found as Record<string, unknown>).viewCount = current + 1;
    }

    return found;
  }

  async incrementPostViewBySlug(slug: string): Promise<{ viewCount: number } | null> {
    const em = this.getEm();
    const Post = this.getPostEntity();
    const normalized = slug?.trim();
    if (!normalized) return null;

    const found = await em.findOne(Post, {
      slug: normalized,
      deletedAt: null,
      published: true,
    } as never);
    if (!found) return null;

    const id = (found as Record<string, unknown>).id;
    const current = Number((found as Record<string, unknown>).viewCount ?? 0) || 0;
    const next = current + 1;
    await em.nativeUpdate(Post, { id } as never, { viewCount: next });
    return { viewCount: next };
  }

  async listEvents(params: Record<string, unknown>): Promise<PublicPagedPayload<Record<string, unknown>>> {
    const em = this.getEm();
    const Event = this.getEventEntity();

    const page = Math.max(1, parsePositiveInt(params.page, 1));
    const limit = Math.min(50, Math.max(1, parsePositiveInt(params.limit, 12)));
    const filterRaw = String(params.filter ?? 'all').trim() as EventTimeFilter;
    const filter: EventTimeFilter = ['upcoming', 'ongoing', 'past', 'featured'].includes(filterRaw)
      ? filterRaw
      : 'all';
    const search = String(params.search ?? '').trim();
    const registerable = normalizeBooleanQuery(params.registerable) ? true : undefined;

    const baseFilter: FilterQuery<Record<string, unknown>> = {
      deletedAt: null,
      status: 1,
    } as never;
    if (search) {
      (baseFilter as Record<string, unknown>).title = { $like: `%${search}%` };
    }

    const now = new Date();

    const getDate = (value: unknown): Date | null => {
      if (!value) return null;
      const d = new Date(String(value));
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const all = await em.find(Event, baseFilter, {
      orderBy: { isFeatured: 'DESC', startDate: 'ASC', id: 'DESC' },
    });

    const filtered = all.filter((row) => {
      const record = row as Record<string, unknown>;
      if (filter === 'featured') {
        return record.isFeatured === true;
      }
      const start = getDate(record.startDate);
      const end = getDate(record.endDate);
      if (filter === 'upcoming') {
        return start ? start > now : false;
      }
      if (filter === 'ongoing') {
        return start && end ? start <= now && now <= end : false;
      }
      if (filter === 'past') {
        return end ? end < now : false;
      }
      if (registerable) {
        const rs = getDate(record.registrationStart);
        const re = getDate(record.registrationEnd);
        if (rs && now < rs) return false;
        if (re && now > re) return false;
      }
      return true;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    return { data, meta: buildMeta(page, limit, total) };
  }

  async getEventBySlug(slug: string): Promise<Record<string, unknown> | null> {
    const em = this.getEm();
    const Event = this.getEventEntity();
    const normalized = slug?.trim();
    if (!normalized) return null;
    return await em.findOne(Event, { slug: normalized, deletedAt: null, status: 1 } as never);
  }

  private async getActiveUserEmail(userId: string): Promise<{ email: string; name: string | null; phone: string | null }> {
    const em = this.getEm();
    const User = this.getUserEntity();
    const id = parseEntityId(userId);
    const user = await em.findOne(User, { id, deletedAt: null, isActive: true } as never);
    const row = user as Record<string, unknown> | null;
    if (!row?.email) {
      throw new Error('Không tìm thấy tài khoản người dùng.');
    }
    return {
      email: String(row.email),
      name: (row.name as string | null | undefined) ?? null,
      phone: (row.phone as string | null | undefined) ?? null,
    };
  }

  async registerForEvent(eventSlug: string, userId: string, phone?: string): Promise<RegisterForEventResult> {
    const em = this.getEm();
    const Event = this.getEventEntity();
    const EventRegistration = this.getEventRegistrationEntity();

    const slug = eventSlug?.trim();
    const uid = userId?.trim();
    if (!slug || !uid) {
      throw new Error('Thiếu thông tin sự kiện hoặc người dùng.');
    }

    const event = await em.findOne(Event, { slug, deletedAt: null, status: 1 } as never);
    const eventRow = event as Record<string, unknown> | null;
    if (!eventRow?.id) {
      throw new Error('Không tìm thấy sự kiện hoặc sự kiện đã ngừng mở đăng ký.');
    }

    const activeUser = await this.getActiveUserEmail(uid);
    const email = activeUser.email;
    const fullName = (activeUser.name ?? email).trim();
    const normalizedPhone = phone?.trim() || activeUser.phone || null;

    const now = new Date();
    const regStart = new Date(String(eventRow.registrationStart ?? ''));
    const regEnd = new Date(String(eventRow.registrationEnd ?? ''));
    const hasRegStart = !Number.isNaN(regStart.getTime());
    const hasRegEnd = !Number.isNaN(regEnd.getTime());
    if (hasRegStart && now < regStart) throw new Error('Chưa đến thời gian mở đăng ký cho sự kiện này.');
    if (hasRegEnd && now > regEnd) throw new Error('Đã hết hạn đăng ký tham gia sự kiện này.');

    const existing = await em.findOne(
      EventRegistration,
      { eventId: eventRow.id, email, deletedAt: null } as never,
      { populate: ['event'] },
    );
    const existingRow = existing as Record<string, unknown> | null;
    if (existingRow && Number(existingRow.status ?? 1) !== 0) {
      throw new Error('Bạn đã đăng ký sự kiện này rồi.');
    }

    if (existingRow) {
      existingRow.fullName = fullName;
      existingRow.phone = normalizedPhone;
      existingRow.registeredAt = now.toISOString();
      existingRow.status = 1;
      existingRow.hasCheckin = false;
      existingRow.hasCheckout = false;
      await em.flush();
      return {
        id: parseEntityId(existingRow.id as never),
        eventId: parseEntityId(eventRow.id as never),
        email,
        fullName,
        status: 1,
        registeredAt: toIso(existingRow.registeredAt as never),
      };
    }

    const last = await em.find(EventRegistration, {} as never, {
      orderBy: { id: 'DESC' },
      limit: 1,
    });
    const nextId = last?.[0]?.id ? parseEntityId(last[0].id as never) + 1 : 1;

    const entity = new EventRegistration() as Record<string, unknown>;
    Object.assign(entity, {
      id: nextId,
      eventId: eventRow.id,
      email,
      fullName,
      phone: normalizedPhone,
      registeredAt: now.toISOString(),
      status: 1,
      faceVerified: false,
      hasCheckin: false,
      hasCheckout: false,
      attendanceStatus: 0,
      attendanceMinutes: 0,
      checkinMethod: 0,
      deletedAt: null,
    });
    em.persist(entity);
    await em.flush();
    return {
      id: nextId,
      eventId: parseEntityId(eventRow.id as never),
      email,
      fullName,
      status: 1,
      registeredAt: toIso(entity.registeredAt as never),
    };
  }

  private mapMyRegistration(row: Record<string, unknown>): MyRegisteredEventItem {
    const event = (row.event as Record<string, unknown> | undefined) ?? {};
    return {
      id: parseEntityId(row.id as never),
      eventId: parseEntityId(row.eventId as never),
      email: String(row.email ?? ''),
      fullName: String(row.fullName ?? ''),
      phone: (row.phone as string | null | undefined) ?? null,
      registeredAt: toIso(row.registeredAt as never),
      status: Number(row.status ?? 0) || 0,
      hasCheckin: Boolean(row.hasCheckin),
      hasCheckout: Boolean(row.hasCheckout),
      attendanceStatus: Number(row.attendanceStatus ?? 0) || 0,
      attendanceMinutes: Number(row.attendanceMinutes ?? 0) || 0,
      checkinMethod: Number(row.checkinMethod ?? 0) || 0,
      event: {
        id: parseEntityId(event.id as never),
        title: String(event.title ?? ''),
        slug: (event.slug as string | null | undefined) ?? null,
        poster: event.poster ?? null,
        startDate: toIso(event.startDate as never),
        endDate: toIso(event.endDate as never),
        registrationStart: toIso(event.registrationStart as never),
        registrationEnd: toIso(event.registrationEnd as never),
        location: (event.location as string | null | undefined) ?? null,
        address: (event.address as string | null | undefined) ?? null,
        format: Number(event.format ?? 0) || 0,
        status: Number(event.status ?? 0) || 0,
      },
    };
  }

  async listMyEvents(userId: string): Promise<MyRegisteredEventItem[]> {
    const em = this.getEm();
    const EventRegistration = this.getEventRegistrationEntity();

    const { email } = await this.getActiveUserEmail(userId);
    const rows = await em.find(
      EventRegistration,
      { email, deletedAt: null } as never,
      {
        populate: ['event'],
        orderBy: { registeredAt: 'DESC', createdAt: 'DESC' },
      },
    );
    return rows.map((row) => this.mapMyRegistration(row as never));
  }

  async cancelMyRegistration(userId: string, registrationId: string): Promise<MyRegisteredEventItem> {
    const em = this.getEm();
    const EventRegistration = this.getEventRegistrationEntity();

    const { email } = await this.getActiveUserEmail(userId);
    const id = registrationId?.trim();
    if (!id) throw new Error('Thiếu mã đăng ký.');

    const row = await em.findOne(
      EventRegistration,
      { id: parseEntityId(id), email, deletedAt: null } as never,
      { populate: ['event'] },
    );
    const record = row as Record<string, unknown> | null;
    if (!record) throw new Error('Không tìm thấy đăng ký sự kiện.');

    if (Number(record.status ?? 0) === 0) {
      return this.mapMyRegistration(record);
    }

    if (record.hasCheckin) {
      throw new Error('Không thể hủy đăng ký sau khi đã check-in.');
    }

    record.status = 0;
    await em.flush();
    return this.mapMyRegistration(record);
  }

  async getSeoMetaByPage(page: string): Promise<SeoMetaPublicDto | null> {
    const em = this.getEm();
    const SeoMeta = this.getSeoMetaEntity();
    const normalized = page?.trim();
    if (!normalized) return null;
    const row = await em.findOne(SeoMeta, { page: normalized, deletedAt: null } as never);
    const record = row as Record<string, unknown> | null;
    if (!record || Number(record.status ?? 0) !== 1) return null;
    return {
      page: String(record.page ?? ''),
      title: (record.title as string | null | undefined) ?? null,
      description: (record.description as string | null | undefined) ?? null,
      keywords: (record.keywords as string | null | undefined) ?? null,
      ogTitle: (record.ogTitle as string | null | undefined) ?? null,
      ogDescription: (record.ogDescription as string | null | undefined) ?? null,
      ogImage: (record.ogImage as string | null | undefined) ?? null,
    };
  }
}
