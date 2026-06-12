import 'reflect-metadata';
import * as Subject from './event-checkout.module';

describe('event-checkout.module.ts', () => {
  it('exports at least one Module class', () => {
    expect(Subject.BaseEventCheckoutsModule).toBeDefined();
  });

  it('forRoot keeps metadata and appends controller when available', () => {
    const result = Subject.BaseEventCheckoutsModule.forRoot({
      controllers: [],
      providers: [{ provide: 'SERVICE', useValue: {} }],
    });
    expect(result.controllers).toBeDefined();
    expect(result.controllers!.length).toBe(1);
    expect(result.controllers![0].name).toBe('BaseEventCheckoutsController');
    expect(result.providers!.length).toBe(1);
  });

  it('forRoot works with default metadata', () => {
    const result = Subject.BaseEventCheckoutsModule.forRoot();
    expect(result.controllers).toBeDefined();
    expect(result.controllers!.length).toBe(1);
    expect(result.providers).toEqual([]);
    expect(result.exports).toEqual([]);
  });
});
