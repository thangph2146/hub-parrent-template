import {
  buildAcceptAttribute,
  extensionsFromGroupIds,
  getRealmDefaultExtensions,
  isExtensionAllowed,
  normalizeExtensions,
} from './storage-upload-policy';

describe('storage-upload-policy', () => {
  it('realm images chỉ gồm đuôi ảnh', () => {
    const exts = getRealmDefaultExtensions('images');
    expect(exts).toContain('.png');
    expect(exts).not.toContain('.pdf');
  });

  it('realm files gồm tài liệu và nén', () => {
    const exts = getRealmDefaultExtensions('files');
    expect(exts).toContain('.pdf');
    expect(exts).toContain('.zip');
    expect(exts).not.toContain('.mp4');
    expect(exts).not.toContain('.mp3');
  });

  it('realm audio chỉ gồm đuôi âm thanh', () => {
    const exts = getRealmDefaultExtensions('audio');
    expect(exts).toContain('.mp3');
    expect(exts).not.toContain('.pdf');
  });

  it('chọn nhóm extension khi tạo folder', () => {
    const exts = extensionsFromGroupIds('files', ['document']);
    expect(exts).toContain('.docx');
    expect(exts).not.toContain('.zip');
  });

  it('validate extension theo policy', () => {
    const allowed = normalizeExtensions(['.png', '.webp']);
    expect(isExtensionAllowed('.PNG', allowed)).toBe(true);
    expect(isExtensionAllowed('.pdf', allowed)).toBe(false);
  });

  it('build accept attribute cho ảnh', () => {
    const accept = buildAcceptAttribute(getRealmDefaultExtensions('images'));
    expect(accept).toContain('image/*');
    expect(accept).toContain('.png');
  });
});
