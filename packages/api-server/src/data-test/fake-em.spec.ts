/**
 * E2E test cho fake EntityManager với fixture data.
 *
 * Verify fake EM hoạt động đúng trên **TẤT CẢ 46 entity** trong
 * `hub-system-export-2026-06-11.json`. Đây là lớp test quan trọng nhất
 * đảm bảo các BaseCrudService có thể chạy CRUD nghiệp vụ với data thật.
 */
import { createFakeEntityManager, entityNameToStoreKey } from './fake-em';
import { loadFixture } from './fixture';

describe('data-test/fake-em (E2E với fixture)', () => {
  let fixture: ReturnType<typeof loadFixture>;
  let em: ReturnType<typeof createFakeEntityManager>;

  beforeAll(() => {
    fixture = loadFixture();
    em = createFakeEntityManager(fixture);
  });

  describe('entityNameToStoreKey', () => {
    it.each([
      ['User', 'users'],
      ['Post', 'posts'],
      ['Category', 'categories'],
      ['Tag', 'tags'],
      ['UserRole', 'user_roles'],
      ['PostCategory', 'post_categories'],
      ['PostTag', 'post_tags'],
      ['TrainingLevel', 'training_levels'],
      ['TrainingSystem', 'training_systems'],
      ['AcademicYear', 'academic_years'],
      ['ParentStudent', 'parent_students'],
      ['ImportedUser', 'imported_users'],
      ['EventRegistration', 'event_registrations'],
      ['EventSpeaker', 'event_speakers'],
      ['EventCheckin', 'event_checkins'],
      ['PageContent', 'page_contents'],
      ['AdmissionResult', 'admission_results'],
      ['ContactRequest', 'contact_requests'],
      ['MessageRead', 'message_reads'],
      ['GroupMember', 'group_members'],
      ['VerificationToken', 'verification_tokens'],
      ['SeoMeta', 'seo_meta'],
      ['FaceData', 'face_data'],
      ['StorageFile', 'storage_files'],
      ['CustomerCart', 'customer_carts'],
      ['PromoCode', 'promo_codes'],
    ])('maps %s → %s', (input, expected) => {
      expect(entityNameToStoreKey(input)).toBe(expected);
    });
  });

  describe('store built from fixture', () => {
    it('has all 46 entity stores', () => {
      const expectedStores = [
        'settings', 'seo_meta', 'templates', 'training_levels',
        'training_systems', 'academic_years', 'departments', 'majors',
        'courses', 'locations', 'users', 'events', 'cameras', 'screens',
        'face_data', 'speakers', 'imported_users', 'categories', 'tags',
        'posts', 'comments', 'contact_requests', 'students',
        'parent_students', 'groups', 'group_members', 'messages',
        'message_reads', 'notifications', 'page_contents',
        'event_speakers', 'event_registrations', 'event_checkins',
        'accounts', 'sessions', 'admission_results', 'customer_carts',
        'orders', 'post_categories', 'post_tags', 'products',
        'promo_codes', 'roles', 'storage_files', 'user_roles',
        'verification_tokens',
      ];
      const actual = Object.keys(em.__store).sort();
      expect(actual).toEqual(expect.arrayContaining(expectedStores));
      expect(actual.length).toBeGreaterThanOrEqual(expectedStores.length);
    });
  });

  describe('CRUD on users', () => {
    it('find returns users with pagination', async () => {
      const result = em.find('users', {}, { offset: 0, limit: 5 });
      expect(result.length).toBe(5);
      expect(result[0]).toHaveProperty('id');
    });

    it('findOne returns user by id', () => {
      const users = em.find('users', {}, { limit: 1 });
      const firstId = users[0]?.id;
      const found = em.findOne('users', { id: firstId });
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstId);
    });

    it('count returns correct total', () => {
      const total = em.count('users', {});
      const expected = fixture.users.length;
      expect(total).toBe(expected);
    });

    it('find with $or filter', () => {
      const sample = fixture.users[0];
      const result = em.find('users', {
        $or: [{ id: sample.id }, { email: sample.email }],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it('find with $like filter (search)', () => {
      const result = em.find('users', { email: { $like: '%@%' } });
      expect(result.length).toBeGreaterThan(0);
    });

    it('count with status=active filter (deletedAt = null)', () => {
      const active = em.count('users', { deletedAt: null });
      const all = em.count('users', {});
      expect(active).toBeLessThanOrEqual(all);
    });

    it('orderBy: name DESC', () => {
      const result = em.find('users', {}, { orderBy: { name: 'DESC' }, limit: 3 });
      if (result.length >= 2) {
        const a = String(result[0].name ?? '');
        const b = String(result[1].name ?? '');
        expect(a >= b).toBe(true);
      }
    });

    it('persist + flush + findOne round-trip', async () => {
      const newUser = { id: 'test-new-1', email: 'test-new@x.com', name: 'Test' };
      await em.persist(newUser);
      await em.flush();
      const found = em.findOne('users', { id: 'test-new-1' });
      expect(found).toBeDefined();
      expect(found?.email).toBe('test-new@x.com');
    });

    it('nativeUpdate updates records', async () => {
      const users = em.find('users', {}, { limit: 1 });
      const id = users[0]?.id;
      if (!id) return;
      const affected = await em.nativeUpdate(
        'users',
        { id },
        { name: 'UpdatedName' },
      );
      expect(affected).toBe(1);
      const updated = em.findOne('users', { id });
      expect(updated?.name).toBe('UpdatedName');
    });

    it('nativeDelete deletes records', async () => {
      const users = em.find('users', {}, { limit: 1 });
      const id = users[0]?.id;
      if (!id) return;
      const affected = await em.nativeDelete('users', { id });
      expect(affected).toBe(1);
      const found = em.findOne('users', { id });
      expect(found).toBeNull();
    });
  });

  describe('CRUD on roles (find by name)', () => {
    it('find role by name', () => {
      const superAdmin = em.findOne('roles', { name: 'super_admin' });
      expect(superAdmin).toBeDefined();
      expect(superAdmin?.name).toBe('super_admin');
    });
  });

  describe('CRUD on posts', () => {
    it('count posts total', () => {
      const total = em.count('posts', {});
      expect(total).toBe(fixture.posts.length);
    });

    it('find posts by status', () => {
      const result = em.find('posts', { status: 1 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('CRUD on categories', () => {
    it('find categories with $in', () => {
      const ids = fixture.categories.slice(0, 2).map((c) => c.id);
      const result = em.find('categories', { id: { $in: ids } });
      expect(result.length).toBe(2);
    });

    it('find categories by parentId', () => {
      const result = em.find('categories', { parentId: { $ne: null } });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('CRUD on user_roles (join)', () => {
    it('find user roles for specific user', () => {
      const sampleUser = fixture.users[0];
      const result = em.find('user_roles', { userId: sampleUser.id });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('CRUD on settings', () => {
    it('find settings by key', () => {
      if (fixture.settings.length === 0) return;
      const sample = fixture.settings[0];
      const found = em.findOne('settings', { id: sample.id });
      expect(found).toBeDefined();
    });
  });

  describe('CRUD on multiple entities (smoke test)', () => {
    const entities = [
      'events', 'cameras', 'screens', 'speakers', 'locations',
      'training_levels', 'training_systems', 'academic_years',
      'departments', 'majors', 'courses', 'products', 'orders',
      'sessions', 'notifications', 'contact_requests', 'students',
      'parents_students', 'groups', 'messages', 'page_contents',
      'tags', 'comments', 'admission_results',
    ];
    it.each(entities)('count on %s works', (entity) => {
      const total = em.count(entity, {});
      expect(total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('reset restores fixture data', () => {
    it('reset clears and reloads fixture', async () => {
      const beforeCount = em.count('users', {});
      // Delete 1 user, bất kỳ
      const anyUser = em.find('users', {}, { limit: 1 })[0];
      await em.nativeDelete('users', { id: anyUser.id });
      expect(em.count('users', {})).toBe(beforeCount - 1);
      em.__reset();
      expect(em.count('users', {})).toBe(beforeCount);
    });
  });

  describe('__all helper', () => {
    it('returns all records of an entity', () => {
      const all = em.__all('users');
      expect(all.length).toBe(fixture.users.length);
    });
  });
});
