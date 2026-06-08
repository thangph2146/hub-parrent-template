import * as path from 'path';
import {
  resolveCreateFolderTarget,
  resolveStorageRelativePath,
  stripStorageFolderPath,
} from './storage-path-resolver';

const roots = {
  storageDir: '/data',
  uploadsDir: '/data/uploads',
  imagesDir: '/data/uploads/images',
  filesDir: '/data/uploads/files',
  videosDir: '/data/uploads/videos',
  audioDir: '/data/uploads/audio',
};

describe('resolveStorageRelativePath', () => {
  it('map thư mục gốc realm tới uploads/*', () => {
    expect(resolveStorageRelativePath('images', roots).fullPath).toBe(
      path.resolve('/data/uploads/images'),
    );
    expect(resolveStorageRelativePath('files', roots).fullPath).toBe(
      path.resolve('/data/uploads/files'),
    );
    expect(resolveStorageRelativePath('videos', roots).fullPath).toBe(
      path.resolve('/data/uploads/videos'),
    );
    expect(resolveStorageRelativePath('audio', roots).fullPath).toBe(
      path.resolve('/data/uploads/audio'),
    );
  });

  it('không nhầm images gốc với STORAGE_DIR/images', () => {
    const resolved = resolveStorageRelativePath('images', roots);
    expect(resolved.fullPath).not.toBe(path.resolve('/data/images'));
  });

  it('resolve path con trong realm', () => {
    expect(resolveStorageRelativePath('images/admincp', roots).fullPath).toBe(
      path.resolve('/data/uploads/images/admincp'),
    );
    expect(resolveStorageRelativePath('files/docs/a.pdf', roots).fullPath).toBe(
      path.resolve('/data/uploads/files/docs/a.pdf'),
    );
  });
});

describe('stripStorageFolderPath', () => {
  it('bỏ prefix gốc files không tạo files/files', () => {
    expect(stripStorageFolderPath('files', 'files')).toBe('');
    expect(stripStorageFolderPath('files/docs', 'files')).toBe('docs');
  });
});

describe('resolveCreateFolderTarget', () => {
  it('tạo folder con trực tiếp dưới gốc files', () => {
    const target = resolveCreateFolderTarget('files', 'docs', roots);
    expect(target?.targetDir).toBe(path.join(roots.filesDir, 'docs'));
    expect(target?.folderPath).toBe('files/docs');
  });

  it('không nhân đôi files khi parent là files/docs', () => {
    const target = resolveCreateFolderTarget('files/docs', '2026', roots);
    expect(target?.targetDir).toBe(
      path.join(roots.filesDir, 'docs', '2026'),
    );
    expect(target?.folderPath).toBe('files/docs/2026');
  });
});
