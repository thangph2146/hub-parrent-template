import {
  assertStoragePathMutable,
  isProtectedStorageRelativePath,
  ORDER_SNAPSHOT_IMAGES_PREFIX,
} from './storage-protected-paths';

describe('storage-protected-paths', () => {
  it('nhận diện prefix orders', () => {
    expect(isProtectedStorageRelativePath(ORDER_SNAPSHOT_IMAGES_PREFIX)).toBe(
      true,
    );
    expect(
      isProtectedStorageRelativePath('images/orders/ord-1/p1_sku.webp'),
    ).toBe(true);
    expect(isProtectedStorageRelativePath('/images/orders/ord-1/')).toBe(true);
  });

  it('không chặn path thường', () => {
    expect(isProtectedStorageRelativePath('images/events/su-kien-1')).toBe(
      false,
    );
    expect(isProtectedStorageRelativePath('images/posts/hero.webp')).toBe(
      false,
    );
  });

  it('assertStoragePathMutable ném lỗi với orders', () => {
    expect(() => assertStoragePathMutable('images/orders/ord-1')).toThrow(
      /snapshot đơn hàng/,
    );
    expect(() => assertStoragePathMutable('images/events/foo')).not.toThrow();
  });
});
