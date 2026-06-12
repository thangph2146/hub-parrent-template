import { createFakeEntityManager } from '../../data-test/fake-em';
import { loadFixture } from '../../data-test/fixture';
import { BasePublicService } from './public.service';

class Post {}
class Category {}
class PostCategory {}
class PageContent {}
class Event {}
class EventRegistration {}
class User {}
class SeoMeta {}

class TestPublicService extends BasePublicService {
  constructor(private readonly em: ReturnType<typeof createFakeEntityManager>) {
    super();
  }
  protected getEm() {
    return this.em as never;
  }
  protected getPostEntity() {
    return Post as never;
  }
  protected getCategoryEntity() {
    return Category as never;
  }
  protected getPostCategoryEntity() {
    return PostCategory as never;
  }
  protected getPageContentEntity() {
    return PageContent as never;
  }
  protected getEventEntity() {
    return Event as never;
  }
  protected getEventRegistrationEntity() {
    return EventRegistration as never;
  }
  protected getUserEntity() {
    return User as never;
  }
  protected getSeoMetaEntity() {
    return SeoMeta as never;
  }
}

describe('BasePublicService (fixture)', () => {
  let service: TestPublicService;
  let em: ReturnType<typeof createFakeEntityManager>;

  beforeEach(() => {
    const fixture = loadFixture();
    em = createFakeEntityManager(fixture);
    service = new TestPublicService(em);
  });

  it('getPosts returns paged payload with meta', async () => {
    const result = await service.getPosts({ page: '1', limit: '5' });
    expect(result.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      }),
    );
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('getPostBySlug returns a post and tracks viewCount by default', async () => {
    const post = await service.getPostBySlug('luat-kinh-te-hub');
    expect(post).toBeTruthy();
    const record = post as Record<string, unknown>;
    expect(record.slug).toBe('luat-kinh-te-hub');
    expect(record.viewCount).toBe(1);
  });

  it('incrementPostViewBySlug increments viewCount', async () => {
    const first = await service.incrementPostViewBySlug('luat-kinh-te-hub');
    const second = await service.incrementPostViewBySlug('luat-kinh-te-hub');
    expect(first?.viewCount).toBe(1);
    expect(second?.viewCount).toBe(2);
  });

  it('getCategories returns top-level post categories', async () => {
    const categories = await service.getCategories();
    expect(categories.length).toBeGreaterThanOrEqual(1);
    expect(categories[0]).toEqual(expect.objectContaining({ type: 'post' }));
  });

  it('getPageContents returns visible sections for a page', async () => {
    const rows = await service.getPageContents('thac-si');
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0]).toEqual(expect.objectContaining({ pageKey: 'thac-si' }));
  });

  it('getSeoMetaByPage returns site seo meta when status=1', async () => {
    const seo = await service.getSeoMetaByPage('__site__');
    expect(seo).toEqual(
      expect.objectContaining({
        page: '__site__',
        title: expect.any(String),
      }),
    );
  });

  it('registerForEvent -> listMyEvents -> cancelMyRegistration round-trip', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-20T10:00:00.000Z'));

    const registered = await service.registerForEvent(
      'demo-thong-bao-tuyen-sinh-trinh-do-tien-si-nam-2026',
      '1',
      '0900000000',
    );
    expect(registered).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        eventId: expect.any(Number),
        email: expect.any(String),
        status: 1,
      }),
    );

    expect(em.persist).toHaveBeenCalled();

    const registrations = Array.from(em.__store.event_registrations.values());
    const matched = registrations.find(
      (row) =>
        String(row.email) === registered.email &&
        Number(row.eventId) === registered.eventId &&
        Number(row.status) === 1 &&
        row.deletedAt == null,
    );
    expect(matched).toBeTruthy();
    expect(Number((matched as Record<string, unknown>).id)).toBe(registered.id);

    const mine = await service.listMyEvents('1');
    expect(mine.some((row) => row.id === registered.id)).toBe(true);

    const cancelled = await service.cancelMyRegistration('1', String(registered.id));
    expect(cancelled.status).toBe(0);

    jest.useRealTimers();
  });
});
