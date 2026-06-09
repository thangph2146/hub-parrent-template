import {
  resolveStorageFolderSegment,
  resolveStorageFolderSlugPath,
  sanitizeStorageFolderName,
  slugifyStorageFolderSegment,
} from './storage-folder-name';

describe('storage-folder-name', () => {
  it('slug tiếng Việt — value ASCII, label giữ dấu', () => {
    expect(resolveStorageFolderSegment('Sự kiện 1')).toEqual({
      slug: 'su-kien-1',
      label: 'Sự kiện 1',
    });
    expect(resolveStorageFolderSlugPath('Sự kiện 1')).toEqual({
      slugPath: 'su-kien-1',
      leafLabel: 'Sự kiện 1',
    });
    expect(sanitizeStorageFolderName('Sự kiện 1')).toBe('su-kien-1');
  });

  it('hỗ trợ nhiều cấp', () => {
    expect(resolveStorageFolderSlugPath('2026/06/Sự kiện 1')).toEqual({
      slugPath: '2026/06/su-kien-1',
      leafLabel: 'Sự kiện 1',
    });
  });

  it('giữ segment ASCII sẵn có', () => {
    expect(resolveStorageFolderSegment('events')).toEqual({
      slug: 'events',
      label: 'events',
    });
    expect(resolveStorageFolderSegment('2026')).toEqual({
      slug: '2026',
      label: '2026',
    });
  });

  it('slugify giống bài viết', () => {
    expect(slugifyStorageFolderSegment('Sự kiện 1')).toBe('su-kien-1');
  });

  it('loại ký tự path nguy hiểm', () => {
    expect(resolveStorageFolderSegment('a/b').label).toBe('ab');
    expect(() => resolveStorageFolderSegment('..')).toThrow(
      'Tên thư mục không hợp lệ',
    );
  });
});
