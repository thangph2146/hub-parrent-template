import {
  collectDateFolderCleanupPaths,
  countTrailingDateSegments,
  flattenDateStoragePath,
  isUnderReorganizeScope,
} from './folder-reorganize';

describe('countTrailingDateSegments', () => {
  it('nhận YYYY/MM/DD', () => {
    expect(countTrailingDateSegments(['avatars', '2026', '05', '15'])).toBe(3);
  });

  it('nhận YYYY/MM', () => {
    expect(countTrailingDateSegments(['avatars', '2026', '05'])).toBe(2);
  });

  it('nhận YYYY', () => {
    expect(countTrailingDateSegments(['avatars', '2026'])).toBe(1);
  });

  it('bỏ qua path không phải ngày', () => {
    expect(countTrailingDateSegments(['admincp', 'buh_slidehome'])).toBe(0);
  });
});

describe('flattenDateStoragePath', () => {
  it('đưa file về folder chính từ YYYY/MM/DD', () => {
    expect(flattenDateStoragePath('images/avatars/2026/05/15/a.jpg')).toEqual({
      from: 'images/avatars/2026/05/15/a.jpg',
      to: 'images/avatars/a.jpg',
      dateSegments: 3,
    });
  });

  it('đưa file về folder chính từ YYYY/MM', () => {
    expect(flattenDateStoragePath('images/2026/03/a.jpg')).toEqual({
      from: 'images/2026/03/a.jpg',
      to: 'images/a.jpg',
      dateSegments: 2,
    });
  });

  it('legacy admincp/YYYY/MM/DD', () => {
    expect(flattenDateStoragePath('admincp/2024/01/02/x.webp')).toEqual({
      from: 'admincp/2024/01/02/x.webp',
      to: 'admincp/x.webp',
      dateSegments: 3,
    });
  });

  it('không đổi path thường', () => {
    expect(
      flattenDateStoragePath('images/admincp/buh_slidehome/a.jpg'),
    ).toBeNull();
  });
});

describe('isUnderReorganizeScope', () => {
  it('lọc theo scope folder', () => {
    expect(
      isUnderReorganizeScope('images/avatars/2026/05/a.jpg', 'images/avatars'),
    ).toBe(true);
    expect(
      isUnderReorganizeScope('images/admincp/2026/05/a.jpg', 'images/avatars'),
    ).toBe(false);
  });
});

describe('collectDateFolderCleanupPaths', () => {
  it('thu thập folder ngày cần dọn', () => {
    const dirs = collectDateFolderCleanupPaths([
      'images/avatars/2026/05/15/a.jpg',
    ]);
    expect(dirs).toEqual([
      'images/avatars/2026/05/15',
      'images/avatars/2026/05',
      'images/avatars/2026',
    ]);
  });
});
