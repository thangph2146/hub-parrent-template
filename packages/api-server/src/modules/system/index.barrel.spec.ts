import 'reflect-metadata';
import * as Subject from './index';

describe('modules/system/index.ts', () => {
  it('barrel import resolves to an object', () => {
    expect(Subject).toBeDefined();
    expect(typeof Subject).toBe('object');
  });

  it('barrel module can be enumerated safely', () => {
    const keys = Object.keys(Subject);
    expect(keys.length).toBeGreaterThan(0);
    expect(() => keys.forEach((k) => (Subject as Record<string, unknown>)[k])).not.toThrow();
  });
});
