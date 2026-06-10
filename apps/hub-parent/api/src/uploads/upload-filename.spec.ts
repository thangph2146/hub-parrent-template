import {
  buildStoredUploadFileName,
  extractUploadOwnerIdFromFileName,
  resolveImageFileOwnerId,
  sanitizeUploadUserId,
  storedUploadFilePrefix,
} from './upload-filename';

describe('upload-filename', () => {
  it('sanitizeUploadUserId giữ ký tự hợp lệ', () => {
    expect(sanitizeUploadUserId('user-42')).toBe('user-42');
    expect(sanitizeUploadUserId(' abc/def ')).toBe('abc_def');
  });

  it('buildStoredUploadFileName kết hợp userId và tên ảnh', () => {
    expect(
      buildStoredUploadFileName('banner-hero', '.webp', {
        userId: 'u-99',
        timestamp: 1_700_000_000_000,
      }),
    ).toBe('u-99_banner-hero_1700000000000.webp');
  });

  it('extractUploadOwnerIdFromFileName đọc UUID từ tên file', () => {
    expect(
      extractUploadOwnerIdFromFileName(
        'a1b2c3d4-e5f6-4789-a012-3456789abcde_banner_1700000000000.webp',
      ),
    ).toBe('a1b2c3d4-e5f6-4789-a012-3456789abcde');
    expect(
      extractUploadOwnerIdFromFileName('legacy-photo_1700000000000.webp'),
    ).toBeNull();
  });

  it('resolveImageFileOwnerId ưu tiên ownerUserId (ảnh đại diện)', () => {
    expect(resolveImageFileOwnerId('staff-42', 'admin-1')).toBe('staff-42');
    expect(resolveImageFileOwnerId(undefined, 'admin-1')).toBe('admin-1');
  });

  it('storedUploadFilePrefix khớp dedup theo user', () => {
    expect(storedUploadFilePrefix('avatar', { userId: 'u-99' })).toBe(
      'u-99_avatar_',
    );
  });
});
