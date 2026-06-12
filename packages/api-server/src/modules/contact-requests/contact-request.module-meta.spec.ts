import 'reflect-metadata';
import * as Subject from './contact-request.module';

type ModuleLike = {
  forRoot: (metadata?: unknown) => {
    imports?: unknown[];
    controllers?: unknown[];
    providers?: unknown[];
    exports?: unknown[];
  };
};

describe('contact-request.module.ts', () => {
  it('exports at least one Module class', () => {
    const keys = Object.keys(Subject);
    expect(keys.some((key) => key.endsWith('Module'))).toBe(true);
  });

  it('forRoot keeps metadata and appends controller when available', () => {
    const moduleKey = Object.keys(Subject).find((key) => key.endsWith('Module'));
    expect(moduleKey).toBeTruthy();
    if (!moduleKey) throw new Error('Missing module export');
    const ModuleClass = Subject[moduleKey as keyof typeof Subject] as ModuleLike;
    expect(typeof ModuleClass.forRoot).toBe('function');

    const controllerKeys = Object.keys(Subject).filter((key) => key.endsWith('Controller'));
    const ExtraController = class ExtraController {};
    const ImportedModule = class ImportedModule {};
    const provider = { provide: 'TOKEN', useValue: 1 };

    const metadata = ModuleClass.forRoot({
      imports: [ImportedModule],
      controllers: [ExtraController],
      providers: [provider],
      exports: ['TOKEN'],
    });

    expect(metadata.imports).toEqual([ImportedModule]);
    expect(metadata.providers).toEqual([provider]);
    expect(metadata.exports).toEqual(['TOKEN']);
    expect(metadata.controllers).toEqual(
      expect.arrayContaining([
        ExtraController,
        ...controllerKeys.map((key) => Subject[key as keyof typeof Subject]),
      ]),
    );
  });

  it('forRoot works with default metadata', () => {
    const moduleKey = Object.keys(Subject).find((key) => key.endsWith('Module'));
    expect(moduleKey).toBeTruthy();
    if (!moduleKey) throw new Error('Missing module export');
    const ModuleClass = Subject[moduleKey as keyof typeof Subject] as ModuleLike;
    const metadata = ModuleClass.forRoot();
    expect(metadata.imports).toEqual([]);
    expect(Array.isArray(metadata.controllers)).toBe(true);
    expect(metadata.providers).toEqual([]);
    expect(metadata.exports).toEqual([]);
  });
});
