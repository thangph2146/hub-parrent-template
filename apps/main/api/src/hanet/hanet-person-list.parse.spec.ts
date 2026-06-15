import {
  parseHanetPersonListPage,
  parseHanetPersonRecord,
} from './hanet-person-list.parse';

describe('hanet-person-list.parse', () => {
  it('parseHanetPersonRecord reads avatar fields', () => {
    expect(
      parseHanetPersonRecord({
        personID: 'p-1',
        personName: 'Nguyen A',
        aliasID: 'a@school.edu.vn',
        avatar: 'https://static.hanet.ai/face/a.jpg',
      }),
    ).toEqual({
      personId: 'p-1',
      displayName: 'Nguyen A',
      aliasId: 'a@school.edu.vn',
      avatar: 'https://static.hanet.ai/face/a.jpg',
    });
  });

  it('parseHanetPersonListPage accepts array data', () => {
    const parsed = parseHanetPersonListPage([
      { personID: '1', avatar: 'https://x/a.jpg' },
      { personID: '2', avatar: 'https://x/b.jpg' },
    ]);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.total).toBeUndefined();
  });

  it('parseHanetPersonListPage accepts nested list', () => {
    const parsed = parseHanetPersonListPage({
      list: [{ personID: '9', personName: 'B' }],
      total: 10,
    });
    expect(parsed.items[0]?.personId).toBe('9');
    expect(parsed.total).toBe(10);
  });
});
