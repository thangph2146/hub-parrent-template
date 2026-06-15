import {
  buildChildFolderTabs,
  buildStorageBreadcrumb,
  extractImmediateChildFolder,
  matchesStorageFolderPath,
  matchesStorageFolderScope,
} from './folder-navigation';

describe('extractImmediateChildFolder', () => {
  it('cấp 1 trong realm images', () => {
    expect(
      extractImmediateChildFolder('images/admincp/a.jpg', '', 'images'),
    ).toBe('admincp');
  });

  it('cấp 3+ không giới hạn', () => {
    expect(
      extractImmediateChildFolder(
        'images/admincp/buh/deep/nested/a.jpg',
        'admincp/buh',
        'images',
      ),
    ).toBe('admincp/buh/deep');
  });

  it('không coi file trực tiếp là folder con', () => {
    expect(
      extractImmediateChildFolder(
        'images/admincp/buh_slidehome/banner.png',
        'admincp/buh_slidehome',
        'images',
      ),
    ).toBeNull();
  });
});

describe('buildChildFolderTabs', () => {
  it('folder con tại mọi cấp', () => {
    const tabs = buildChildFolderTabs(
      [
        { relativePath: 'images/admincp/buh/a.jpg', mediaKind: 'image' },
        { relativePath: 'images/admincp/other/b.jpg', mediaKind: 'image' },
        { relativePath: 'images/admincp/buh/deep/c.jpg', mediaKind: 'image' },
      ],
      'images',
      'admincp',
      ['images/admincp/buh/deep', 'images/admincp/empty'],
    );
    expect(tabs.find((t) => t.id === 'admincp/buh')?.count).toBe(2);
    expect(tabs.find((t) => t.id === 'admincp/other')?.count).toBe(1);
    expect(tabs.find((t) => t.id === 'admincp/empty')?.count).toBe(0);
    expect(tabs.find((t) => t.id === 'admincp/buh/deep')).toBeUndefined();
  });

  it('folder con sâu hơn khi mở path cha', () => {
    const tabs = buildChildFolderTabs(
      [{ relativePath: 'images/admincp/buh/deep/c.jpg', mediaKind: 'image' }],
      'images',
      'admincp/buh',
      ['images/admincp/buh/deep'],
    );
    expect(tabs.find((t) => t.id === 'admincp/buh/deep')?.count).toBe(1);
  });

  it('không liệt kê file trong folder lá như folder con', () => {
    const tabs = buildChildFolderTabs(
      [
        {
          relativePath: 'images/admincp/buh_slidehome/banner.png',
          mediaKind: 'image',
        },
        {
          relativePath: 'images/admincp/buh_slidehome/photo.jpg',
          mediaKind: 'image',
        },
      ],
      'images',
      'admincp/buh_slidehome',
      [],
    );
    expect(tabs).toEqual([]);
  });
});

describe('matchesStorageFolderPath', () => {
  it('chỉ file trực tiếp trong folder đang mở', () => {
    expect(
      matchesStorageFolderPath(
        'images/admincp/buh/a.jpg',
        'admincp/buh',
        'images',
      ),
    ).toBe(true);
    expect(
      matchesStorageFolderPath(
        'images/admincp/buh/deep/a.jpg',
        'admincp/buh',
        'images',
      ),
    ).toBe(false);
    expect(
      matchesStorageFolderPath(
        'images/admincp/other/a.jpg',
        'admincp/buh',
        'images',
      ),
    ).toBe(false);
  });
});

describe('matchesStorageFolderScope', () => {
  it('gồm file trong subfolder khi bật includeDescendants', () => {
    expect(
      matchesStorageFolderScope(
        'images/admincp/buh/deep/a.jpg',
        'admincp/buh',
        'images',
        true,
      ),
    ).toBe(true);
    expect(
      matchesStorageFolderScope(
        'images/admincp/buh/deep/a.jpg',
        'admincp/buh',
        'images',
        false,
      ),
    ).toBe(false);
  });
});

describe('buildStorageBreadcrumb', () => {
  it('breadcrumb nhiều cấp', () => {
    expect(buildStorageBreadcrumb('images', 'admincp/buh/deep')).toEqual([
      { id: 'admincp', label: 'Admin CP' },
      { id: 'admincp/buh', label: 'Buh' },
      { id: 'admincp/buh/deep', label: 'Deep' },
    ]);
  });
});
