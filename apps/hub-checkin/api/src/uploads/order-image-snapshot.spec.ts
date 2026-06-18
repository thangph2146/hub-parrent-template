import {
  buildOrderSnapshotRelativePath,
  extractStorageRelativePathFromAssetRef,
  planOrderLineImageSnapshots,
  sanitizeOrderFolderSegment,
} from './order-image-snapshot';

describe('order-image-snapshot', () => {
  it('sanitize order id cho folder', () => {
    expect(sanitizeOrderFolderSegment('abc-123')).toBe('abc-123');
    expect(sanitizeOrderFolderSegment('uuid/with/slash')).toBe(
      'uuid_with_slash',
    );
  });

  it('trích path từ URL uploads nội bộ', () => {
    expect(
      extractStorageRelativePathFromAssetRef(
        'http://localhost:3002/api/uploads/images/products/a.webp',
      ),
    ).toBe('images/products/a.webp');
    expect(
      extractStorageRelativePathFromAssetRef(
        '/api/uploads/images/events/su-kien-1/x.webp',
      ),
    ).toBe('images/events/su-kien-1/x.webp');
  });

  it('URL ngoài → null (giữ nguyên snapshot URL gốc)', () => {
    expect(
      extractStorageRelativePathFromAssetRef('https://cdn.example.com/pic.jpg'),
    ).toBeNull();
  });

  it('build path đích orders/{orderId}', () => {
    expect(buildOrderSnapshotRelativePath('ord-1', 42, 'SP-001', '.webp')).toBe(
      'images/orders/ord-1/p42_SP-001.webp',
    );
  });

  it('plan copy từng dòng checkout', () => {
    const plans = planOrderLineImageSnapshots('ord-99', [
      {
        productId: 1,
        sku: 'A',
        sourceImageRef: '/api/uploads/images/cat/a.webp',
      },
      {
        productId: 2,
        sku: 'B',
        sourceImageRef: 'https://cdn.example.com/x.jpg',
      },
    ]);

    expect(plans[0]?.destinationRelativePath).toBe(
      'images/orders/ord-99/p1_A.webp',
    );
    expect(plans[1]?.sourceRelativePath).toBeNull();
    expect(plans[1]?.destinationRelativePath).toBeNull();
  });
});
