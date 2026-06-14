/**
 * Contract tests cho `pagination` helpers.
 *
 * Mục tiêu: đảm bảo `normalizePageLimit`/`paginationMeta` khớp với shape
 * mà `api-client.normalizePagedResult` đọc.
 */
import {
  normalizePageLimit,
  paginationMeta,
  DEFAULT_PAGE_LIMIT,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from './pagination';

describe('pagination — api-client.normalizePagedResult contract', () => {
  describe('normalizePageLimit', () => {
    it('default page=1, limit=10 khi không truyền', () => {
      const result = normalizePageLimit(undefined, undefined);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(DEFAULT_PAGE_LIMIT);
      expect(result.skip).toBe(0);
    });

    it('chấp nhận string (từ query param)', () => {
      const result = normalizePageLimit('3', '25');
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
      expect(result.skip).toBe(50);
    });

    it('chấp nhận number', () => {
      const result = normalizePageLimit(2, 20);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(20);
    });

    it('page <= 0 → fallback 1', () => {
      expect(normalizePageLimit(0, 10).page).toBe(1);
      expect(normalizePageLimit(-5, 10).page).toBe(1);
    });

    it('limit <= 0 → fallback defaultLimit', () => {
      const result = normalizePageLimit(1, 0);
      expect(result.limit).toBe(DEFAULT_PAGE_LIMIT);
    });

    it('limit > maxLimit → clamp về maxLimit', () => {
      const result = normalizePageLimit(1, 99999);
      expect(result.limit).toBe(ADMIN_TABLE_EXPORT_MAX_LIMIT);
    });

    it('NaN page → fallback 1', () => {
      const result = normalizePageLimit(NaN, 10);
      expect(result.page).toBe(1);
    });

    it('NaN limit → fallback defaultLimit', () => {
      const result = normalizePageLimit(1, NaN);
      expect(result.limit).toBe(DEFAULT_PAGE_LIMIT);
    });

    it('skip = (page - 1) * limit', () => {
      expect(normalizePageLimit(1, 10).skip).toBe(0);
      expect(normalizePageLimit(2, 10).skip).toBe(10);
      expect(normalizePageLimit(5, 20).skip).toBe(80);
    });
  });

  describe('paginationMeta', () => {
    it('trả về { page, limit, total, totalPages } đầy đủ', () => {
      const meta = paginationMeta(1, 10, 50);
      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
    });

    it('totalPages = ceil(total / limit)', () => {
      expect(paginationMeta(1, 10, 0).totalPages).toBe(0);
      expect(paginationMeta(1, 10, 1).totalPages).toBe(1);
      expect(paginationMeta(1, 10, 9).totalPages).toBe(1);
      expect(paginationMeta(1, 10, 11).totalPages).toBe(2);
    });

    it('các field là number (client check typeof)', () => {
      const meta = paginationMeta(1, 10, 5);
      expect(typeof meta.page).toBe('number');
      expect(typeof meta.limit).toBe('number');
      expect(typeof meta.total).toBe('number');
      expect(typeof meta.totalPages).toBe('number');
    });
  });
});
