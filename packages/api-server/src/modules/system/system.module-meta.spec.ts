import 'reflect-metadata';
import * as Subject from './system.module';

describe('system.module.ts', () => {
  it('exports at least one Module class', () => {
    expect(Subject.BaseSystemModule).toBeDefined();
  });

  it('forRoot keeps metadata and appends controller when available', () => {
    const result = Subject.BaseSystemModule.forRoot({
      controllers: [],
      providers: [{ provide: 'SERVICE', useValue: {} }],
    });
    expect(result.controllers).toBeDefined();
    expect(result.controllers!.length).toBe(1);
    expect(result.controllers![0].name).toBe('BaseSystemController');
    expect(result.providers!.length).toBe(1);
  });

  it('forRoot works with default metadata', () => {
    const result = Subject.BaseSystemModule.forRoot();
    expect(result.controllers).toBeDefined();
    expect(result.controllers!.length).toBe(1);
    expect(result.providers).toEqual([]);
    expect(result.exports).toEqual([]);
  });
});
