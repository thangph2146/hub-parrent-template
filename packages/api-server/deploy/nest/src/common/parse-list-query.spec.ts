/**
 * Contract tests cho `parseListQuery` (packages/api-server/src/common/parse-list-query.ts).
 *
 * Mục tiêu: đảm bảo parser nhận đúng query string format từ `api-client`:
 *   - `buildAdminListQuery({ filters })` → `filter[column]=value`
 *   - `AdminListQueryParams` → `page, limit, search, status`
 *
 * Khớp với pattern `apps/main/api/src/common/parse-list-query.ts` nhưng có
 * bổ sung nhận diện tiền tố `filter[...]`.
 */
import {
  parseListQuery,
  parseAdminListPage,
  parseAdminListLimit,
} from './parse-list-query';

describe('parseListQuery — api-client.buildAdminListQuery contract', () => {
  describe('basic reserved keys', () => {
    it('returns defaults when query is empty', () => {
      const result = parseListQuery({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.search).toBe('');
      expect(result.status).toBe('active');
      expect(result.filters).toEqual({});
    });

    it('parses page/limit/search/status as numbers / strings', () => {
      const result = parseListQuery({
        page: '3',
        limit: '25',
        search: 'hello world',
        status: 'deleted',
      });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
      expect(result.search).toBe('hello world');
      expect(result.status).toBe('deleted');
    });

    it('coerces numeric strings to numbers (page, limit)', () => {
      const result = parseListQuery({ page: '1', limit: '20' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('non-numeric page → fallback 1 (đồng bộ apps/main/api)', () => {
      expect(parseListQuery({ page: 'abc' }).page).toBe(1);
    });

    it('non-numeric limit → fallback default 10 (đồng bộ apps/main/api)', () => {
      expect(parseListQuery({ limit: 'xyz' }).limit).toBe(10);
    });

    it('negative page → fallback 1', () => {
      expect(parseListQuery({ page: '-1' }).page).toBe(1);
    });

    it('zero page → fallback 1', () => {
      expect(parseListQuery({ page: '0' }).page).toBe(1);
    });

    it('limit > MAX_LIMIT bị clamp về 5000', () => {
      const result = parseListQuery({ limit: '99999' });
      expect(result.limit).toBe(5000);
    });

    it('status hợp lệ: active | deleted | all', () => {
      expect(parseListQuery({ status: 'active' }).status).toBe('active');
      expect(parseListQuery({ status: 'deleted' }).status).toBe('deleted');
      expect(parseListQuery({ status: 'all' }).status).toBe('all');
    });

    it('status không hợp lệ → fallback "active"', () => {
      expect(parseListQuery({ status: 'whatever' }).status).toBe('active');
      expect(parseListQuery({ status: '' }).status).toBe('active');
      expect(parseListQuery({ status: undefined }).status).toBe('active');
    });
  });

  describe('filter[column] — contract từ api-client.toApiFilterQuery', () => {
    it('parses filter[isActive]=true thành filters.isActive="true"', () => {
      const result = parseListQuery({ 'filter[isActive]': 'true' });
      expect(result.filters).toEqual({ isActive: 'true' });
    });

    it('parses nhiều filter[column] cùng lúc', () => {
      const result = parseListQuery({
        'filter[isActive]': 'true',
        'filter[published]': 'true',
        'filter[authorId]': '5',
      });
      expect(result.filters).toEqual({
        isActive: 'true',
        published: 'true',
        authorId: '5',
      });
    });

    it('bỏ filter[empty]', () => {
      const result = parseListQuery({
        'filter[isActive]': '',
        'filter[published]': 'true',
      });
      expect(result.filters).toEqual({ published: 'true' });
    });

    it('bỏ filter[null]', () => {
      const result = parseListQuery({
        'filter[isActive]': null,
        'filter[published]': 'true',
      });
      expect(result.filters).toEqual({ published: 'true' });
    });

    it('filter[column] với array value → lấy phần tử đầu', () => {
      const result = parseListQuery({
        'filter[isActive]': ['true', 'false'] as unknown as string,
      });
      expect(result.filters).toEqual({ isActive: 'true' });
    });

    it('filter[column] empty array → bỏ qua', () => {
      const result = parseListQuery({
        'filter[isActive]': [] as unknown as string,
      });
      expect(result.filters).toEqual({});
    });
  });

  describe('flat filter (legacy) — không có tiền tố filter[ ]', () => {
    it('cũng chấp nhận flat key: { isActive: "true" }', () => {
      const result = parseListQuery({ isActive: 'true' });
      expect(result.filters).toEqual({ isActive: 'true' });
    });

    it('flat key với array → lấy phần tử đầu', () => {
      const result = parseListQuery({ isActive: ['true'] as unknown as string });
      expect(result.filters).toEqual({ isActive: 'true' });
    });
  });

  describe('reserved keys are NOT copied to filters', () => {
    it('page, limit, search, status bị bỏ qua khi build filters', () => {
      const result = parseListQuery({
        page: '5',
        limit: '50',
        search: 'foo',
        status: 'deleted',
      });
      expect(result.filters).toEqual({});
    });
  });

  describe('helpers', () => {
    it('parseAdminListPage undefined → 1', () => {
      expect(parseAdminListPage(undefined)).toBe(1);
    });

    it('parseAdminListPage null → 1', () => {
      expect(parseAdminListPage(null)).toBe(1);
    });

    it('parseAdminListLimit undefined → 10', () => {
      expect(parseAdminListLimit(undefined)).toBe(10);
    });

    it('parseAdminListLimit null → 10', () => {
      expect(parseAdminListLimit(null)).toBe(10);
    });

    it('parseAdminListLimit hỗ trợ defaultLimit riêng như apps/main/api', () => {
      expect(parseAdminListLimit(undefined, 50)).toBe(50);
      expect(parseAdminListLimit('abc', 25)).toBe(25);
    });

    it('parseAdminListLimit vẫn clamp max và ép min=1', () => {
      expect(parseAdminListLimit('0', 50)).toBe(1);
      expect(parseAdminListLimit('-2', 50)).toBe(1);
      expect(parseAdminListLimit('99999', 50)).toBe(5000);
    });
  });
});
