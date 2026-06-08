import {
  sanitizeStorageFolderName,
  sanitizeStorageFolderSegment,
} from './storage-folder-name';

describe('storage-folder-name', () => {
  it('giữ tiếng Việt UTF-8', () => {
    expect(sanitizeStorageFolderSegment('sự kiện 1')).toBe('sự kiện 1');
    expect(sanitizeStorageFolderName('sự kiện 1')).toBe('sự kiện 1');
  });

  it('hỗ trợ nhiều cấp', () => {
    expect(sanitizeStorageFolderName('2026/06/sự kiện 1')).toBe(
      '2026/06/sự kiện 1',
    );
  });

  it('loại ký tự path nguy hiểm', () => {
    expect(sanitizeStorageFolderSegment('a/b')).toBe('ab');
    expect(() => sanitizeStorageFolderSegment('..')).toThrow(
      'Tên thư mục không hợp lệ',
    );
  });
});
