import 'reflect-metadata';
import * as Subject from './user-role.module';

describe('user-role.module.ts', () => {
  it('exports at least one Module class', () => {
    const keys = Object.keys(Subject);
    expect(keys.some((key) => key.endsWith('Module'))).toBe(true);
  });

  it('forRoot keeps metadata and appends controller when available', () => {
    const moduleKey = Object.keys(Subject).find((key) => key.endsWith('Module'));
    expect(moduleKey).toBeTruthy();
    const ModuleClass = Subject[moduleKey];
    expect(typeof ModuleClass.forRoot).toBe('function');

    const controllerKey = Object.keys(Subject).find((key) => key.endsWith('Controller'));
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
      expect.arrayContaining(
        controllerKey ? [ExtraController, Subject[controllerKey]] : [ExtraController],
      ),
    );
  });

  it('forRoot works with default metadata', () => {
    const moduleKey = Object.keys(Subject).find((key) => key.endsWith('Module'));
    const ModuleClass = Subject[moduleKey];
    const metadata = ModuleClass.forRoot();
    expect(metadata.imports).toEqual([]);
    expect(Array.isArray(metadata.controllers)).toBe(true);
    expect(metadata.providers).toEqual([]);
    expect(metadata.exports).toEqual([]);
  });
});
