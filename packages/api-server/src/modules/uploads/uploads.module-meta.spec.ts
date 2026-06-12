import 'reflect-metadata';
import * as Subject from './uploads.module';

describe('uploads.module.ts', () => {
  it('exports at least one Module class', () => {
    const keys = Object.keys(Subject);
    expect(keys.some((key) => key.endsWith('Module'))).toBe(true);
  });

  it('forRoot keeps metadata and appends both controllers', () => {
    const ModuleClass = Subject.BaseUploadsModule;
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
        Subject.BaseUploadsController,
        Subject.BasePublicUploadsController,
      ]),
    );
  });
});
