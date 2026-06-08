import {
  mapZipPathToStoragePath,
  normalizeZipEntryPath,
} from './zip-path-mapper';

describe('normalizeZipEntryPath', () => {
  it('bỏ thư mục và file hệ thống', () => {
    expect(normalizeZipEntryPath('__MACOSX/foo')).toBeNull();
    expect(normalizeZipEntryPath('images/.DS_Store')).toBeNull();
    expect(normalizeZipEntryPath('images/folder/')).toBeNull();
  });

  it('giữ path hợp lệ', () => {
    expect(normalizeZipEntryPath('images/a.jpg')).toBe('images/a.jpg');
  });
});

describe('mapZipPathToStoragePath', () => {
  const all = (paths: string[]) => paths;

  it('giữ path đã có images/', () => {
    expect(
      mapZipPathToStoragePath(
        'images/admincp/buh_slidehome/a.jpg',
        all(['images/admincp/buh_slidehome/a.jpg']),
      ),
    ).toBe('images/admincp/buh_slidehome/a.jpg');
  });

  it('tìm images/ ở giữa path (ZIP nhiều wrapper)', () => {
    const paths = [
      'backup-2024/images/admincp/buh_tintuc_thumb/a.jpg',
      'backup-2024/images/admincp/buh_slidehome/b.jpg',
    ];
    expect(mapZipPathToStoragePath(paths[0], paths)).toBe(
      'images/admincp/buh_tintuc_thumb/a.jpg',
    );
  });

  it('bỏ uploads/ và giữ admincp legacy không ép images/', () => {
    const paths = ['uploads/images/admincp/foo.jpg'];
    expect(mapZipPathToStoragePath(paths[0], paths)).toBe(
      'images/admincp/foo.jpg',
    );
  });

  it('map admincp/ ở root ZIP — giữ admincp/ (tab tự nhận)', () => {
    const paths = [
      'admincp/buh_slidehome/slide.jpg',
      'admincp/buh_tintuc_thumb/thumb.jpg',
    ];
    expect(mapZipPathToStoragePath(paths[0], paths)).toBe(
      'admincp/buh_slidehome/slide.jpg',
    );
  });

  it('bỏ wrapper kho-luu-tru/ khi mọi entry cùng root', () => {
    const paths = [
      'kho-luu-tru/images/2026/03/a.jpg',
      'kho-luu-tru/images/2026/03/b.jpg',
    ];
    expect(mapZipPathToStoragePath(paths[0], paths)).toBe(
      'images/2026/03/a.jpg',
    );
  });

  it('folder tùy chỉnh không ép vào images/', () => {
    const paths = ['buh_custom_folder/photo.png'];
    expect(mapZipPathToStoragePath(paths[0], paths)).toBe(
      'buh_custom_folder/photo.png',
    );
  });
});
