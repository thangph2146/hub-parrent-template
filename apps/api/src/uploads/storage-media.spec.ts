import {
  buildStorageFolderTabs,
  buildStorageRealms,
  buildStorageSubFolderTabs,
  folderBelongsToRealm,
  classifyStorageMedia,
  getStorageRealm,
  getStorageTabId,
  matchesStorageRealm,
  matchesStorageTab,
} from './storage-media';

describe('getStorageTabId', () => {
  it('lấy folder hệ thống sau images/', () => {
    expect(getStorageTabId('images/admincp/buh_slidehome/a.jpg')).toBe(
      'admincp',
    );

    expect(getStorageTabId('images/avatars/2026/05/a.png')).toBe('avatars');
  });

  it('files/ và videos/', () => {
    expect(getStorageTabId('files/docs/a.pdf')).toBe('docs');

    expect(getStorageTabId('videos/events/a.mp4')).toBe('events');
  });

  it('legacy root folder', () => {
    expect(getStorageTabId('admincp/buh_tintuc_thumb/a.jpg')).toBe('admincp');
  });
});

describe('getStorageRealm', () => {
  it('phân images / files / videos / audio', () => {
    expect(getStorageRealm('images/avatars/a.jpg', 'image')).toBe('images');

    expect(getStorageRealm('files/docs/a.pdf', 'document')).toBe('files');

    expect(getStorageRealm('videos/events/a.mp4', 'video')).toBe('videos');

    expect(getStorageRealm('files/clip/a.mp4', 'video')).toBe('videos');

    expect(getStorageRealm('audio/podcasts/a.mp3', 'audio')).toBe('audio');

    expect(getStorageRealm('files/legacy/a.mp3', 'audio')).toBe('audio');
  });
});

describe('classifyStorageMedia', () => {
  it('phân loại image / video / document', () => {
    expect(classifyStorageMedia('.jpg', 'image/jpeg')).toBe('image');

    expect(classifyStorageMedia('.mp4', 'video/mp4')).toBe('video');

    expect(classifyStorageMedia('.pdf', 'application/pdf')).toBe('document');
  });
});

describe('buildStorageRealms', () => {
  it('luôn trả 4 realm', () => {
    const realms = buildStorageRealms([
      { relativePath: 'images/admincp/a.jpg', mediaKind: 'image' },

      { relativePath: 'files/x.pdf', mediaKind: 'document' },

      { relativePath: 'files/y.mp4', mediaKind: 'video' },

      { relativePath: 'audio/theme/a.mp3', mediaKind: 'audio' },
    ]);

    expect(realms).toHaveLength(4);

    expect(realms.find((t) => t.id === 'images')?.count).toBe(1);

    expect(realms.find((t) => t.id === 'files')?.count).toBe(1);

    expect(realms.find((t) => t.id === 'videos')?.count).toBe(1);

    expect(realms.find((t) => t.id === 'audio')?.count).toBe(1);
  });
});

describe('buildStorageFolderTabs', () => {
  it('gom folder trong realm images', () => {
    const tabs = buildStorageFolderTabs(
      [
        { relativePath: 'images/admincp/a.jpg', mediaKind: 'image' },

        { relativePath: 'images/admincp/b.jpg', mediaKind: 'image' },

        { relativePath: 'images/avatars/c.png', mediaKind: 'image' },

        { relativePath: 'files/x.pdf', mediaKind: 'document' },
      ],

      'images',
    );

    expect(tabs.find((t) => t.id === 'admincp')?.count).toBe(2);

    expect(tabs.find((t) => t.id === 'avatars')?.count).toBe(1);

    expect(tabs.find((t) => t.id === 'files')).toBeUndefined();
  });

  it('thêm folder trống từ disk', () => {
    const tabs = buildStorageFolderTabs(
      [{ relativePath: 'images/admincp/a.jpg', mediaKind: 'image' }],
      'images',
      ['images/admincp', 'images/guides', 'files/docs'],
    );
    expect(tabs.find((t) => t.id === 'guides')?.count).toBe(0);
    expect(tabs.find((t) => t.id === 'admincp')?.count).toBe(1);
  });
});

describe('buildStorageSubFolderTabs', () => {
  it('tab con dưới admincp', () => {
    const subTabs = buildStorageSubFolderTabs(
      [
        { relativePath: 'images/admincp/buh/a.jpg', mediaKind: 'image' },
        { relativePath: 'images/admincp/buh/b.jpg', mediaKind: 'image' },
        { relativePath: 'images/admincp/other/c.jpg', mediaKind: 'image' },
      ],
      'images',
      'admincp',
      ['images/admincp/buh', 'images/admincp/empty'],
    );
    expect(subTabs.find((t) => t.id === 'admincp/buh')?.count).toBe(2);
    expect(subTabs.find((t) => t.id === 'admincp/other')?.count).toBe(1);
    expect(subTabs.find((t) => t.id === 'admincp/empty')?.count).toBe(0);
  });
});

describe('matchesStorageRealm', () => {
  it('lọc đúng realm', () => {
    expect(matchesStorageRealm('images/a.jpg', 'image', 'images')).toBe(true);

    expect(matchesStorageRealm('files/a.mp4', 'video', 'videos')).toBe(true);

    expect(matchesStorageRealm('files/a.pdf', 'document', 'videos')).toBe(
      false,
    );
  });
});

describe('matchesStorageTab', () => {
  it('lọc đúng tab folder', () => {
    expect(matchesStorageTab('images/events/a.webp', 'events')).toBe(true);

    expect(matchesStorageTab('images/events/a.webp', 'guides')).toBe(false);

    expect(matchesStorageTab('images/events/a.webp', undefined)).toBe(true);
  });

  it('lọc tab con theo path', () => {
    expect(matchesStorageTab('images/admincp/buh/a.jpg', 'admincp/buh')).toBe(
      true,
    );
    expect(matchesStorageTab('images/admincp/other/a.jpg', 'admincp/buh')).toBe(
      false,
    );
  });
});
