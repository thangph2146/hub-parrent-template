import * as Subject from './index';

describe('modules/groups/index.ts', () => {
  it('barrel import resolves to an object', () => {
    expect(Subject).toBeDefined();
    expect(typeof Subject).toBe('object');
  });

  it('barrel module can be enumerated safely', () => {
    expect(() => Object.keys(Subject)).not.toThrow();
  });
});
