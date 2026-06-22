/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Spec cho runtime helper trong `common.types.ts`.
 */
import { normalizePagination } from './common.types';

describe('normalizePagination', () => {
  it('chuẩn hóa page/limit hợp lệ', () => {
    expect(normalizePagination(2, 25)).toEqual({
      page: 2,
      limit: 25,
      skip: 25,
    });
  });

  it('fallback page về 1 khi page <= 0', () => {
    expect(normalizePagination(0, 10)).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
    });
  });

  it('fallback page về 1 khi page là NaN-like', () => {
    expect(normalizePagination(Number('abc'), 10)).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
    });
  });

  it('fallback limit về 10 khi limit <= 0', () => {
    expect(normalizePagination(3, 0)).toEqual({
      page: 3,
      limit: 10,
      skip: 20,
    });
  });

  it('clamp limit theo maxLimit', () => {
    expect(normalizePagination(1, 500, 100)).toEqual({
      page: 1,
      limit: 100,
      skip: 0,
    });
  });
});
