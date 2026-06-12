import 'reflect-metadata';
import * as Subject from './dashboard.module';

describe('dashboard.module.ts', () => {
  it('exports at least one Module class', () => {
    expect(Subject.BaseDashboardModule).toBeDefined();
  });

  it('forRoot keeps metadata and appends controller when available', () => {
    const result = Subject.BaseDashboardModule.forRoot({
      controllers: [],
      providers: [{ provide: 'SERVICE', useValue: {} }],
    });
    expect(result.controllers).toBeDefined();
    expect(result.controllers!.length).toBe(1);
    expect(result.controllers![0].name).toBe('BaseDashboardController');
    expect(result.providers).toBeDefined();
    expect(result.providers!.length).toBe(1);
  });

  it('forRoot works with default metadata', () => {
    const result = Subject.BaseDashboardModule.forRoot();
    expect(result.controllers).toBeDefined();
    expect(result.controllers!.length).toBe(1);
    expect(result.providers).toEqual([]);
    expect(result.exports).toEqual([]);
  });
});
