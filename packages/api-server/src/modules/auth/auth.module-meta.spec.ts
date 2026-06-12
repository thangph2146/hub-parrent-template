import 'reflect-metadata';
import * as Subject from './auth.module';

type ModuleLike = {
  forRoot: (metadata?: unknown) => {
    imports?: unknown[];
    controllers?: unknown[];
    providers?: unknown[];
    exports?: unknown[];
  };
};

describe('auth.module.ts', () => {
  it('forRoot keeps metadata and appends auth controllers', () => {
    const moduleKey = Object.keys(Subject).find((key) => key.endsWith('Module'));
    expect(moduleKey).toBeTruthy();
    if (!moduleKey) throw new Error('Missing module export');
    const ModuleClass = Subject[moduleKey as keyof typeof Subject] as ModuleLike;

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
});
