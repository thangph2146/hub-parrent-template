import {
  buildStorageFolderLabelLookup,
  resolveStorageFolderDisplayLabel,
} from './storage-folder-labels';

describe('storage-folder-labels', () => {
  it('map disk path và nav path tới label', () => {
    const lookup = buildStorageFolderLabelLookup([
      {
        path: 'images/events/su-kien-1',
        label: 'Sự kiện 1',
      },
    ]);

    expect(lookup.get('images/events/su-kien-1')).toBe('Sự kiện 1');
    expect(lookup.get('events/su-kien-1')).toBe('Sự kiện 1');
    expect(
      resolveStorageFolderDisplayLabel('su-kien-1', 'events/su-kien-1', lookup),
    ).toBe('Sự kiện 1');
  });
});
