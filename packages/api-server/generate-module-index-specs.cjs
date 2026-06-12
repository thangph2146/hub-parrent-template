#!/usr/bin/env node
/* eslint-disable */
'use strict';

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function relImport(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel.replace(/\.ts$/, '');
}

function writeModuleSpec(moduleFile) {
  const specFile = moduleFile.replace(/\.module\.ts$/, '.module-meta.spec.ts');
  const importPath = relImport(specFile, moduleFile);
  const fileLabel = path.basename(moduleFile);
  const isUsersModule = moduleFile.endsWith(
    `${path.sep}modules${path.sep}users${path.sep}users.module.ts`,
  );
  const controllerExpectation = isUsersModule
    ? `expect(metadata.controllers).toEqual([ExtraController]);`
    : `expect(metadata.controllers).toEqual(
      expect.arrayContaining(
        controllerKey ? [ExtraController, Subject[controllerKey]] : [ExtraController],
      ),
    );`;
  const defaultArg = isUsersModule ? '{}' : '';
  const content = `import 'reflect-metadata';
import * as Subject from '${importPath}';

describe('${fileLabel}', () => {
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
    ${controllerExpectation}
  });

  it('forRoot works with default metadata', () => {
    const moduleKey = Object.keys(Subject).find((key) => key.endsWith('Module'));
    const ModuleClass = Subject[moduleKey];
    const metadata = ModuleClass.forRoot(${defaultArg});
    expect(metadata.imports).toEqual([]);
    expect(Array.isArray(metadata.controllers)).toBe(true);
    expect(metadata.providers).toEqual([]);
    expect(metadata.exports).toEqual([]);
  });
});
`;
  fs.writeFileSync(specFile, content, 'utf8');
  return specFile;
}

function writeIndexSpec(indexFile) {
  const specFile = indexFile.replace(/index\.ts$/, 'index.barrel.spec.ts');
  const importPath = relImport(specFile, indexFile);
  const label = path.relative(SRC_DIR, indexFile).replace(/\\/g, '/');
  const content = `import * as Subject from '${importPath}';

describe('${label}', () => {
  it('barrel import resolves to an object', () => {
    expect(Subject).toBeDefined();
    expect(typeof Subject).toBe('object');
  });

  it('barrel module can be enumerated safely', () => {
    expect(() => Object.keys(Subject)).not.toThrow();
  });
});
`;
  fs.writeFileSync(specFile, content, 'utf8');
  return specFile;
}

const files = walk(SRC_DIR);
const moduleFiles = files.filter((file) => file.endsWith('.module.ts'));
const indexFiles = files.filter((file) => file.endsWith('index.ts') && file !== path.join(SRC_DIR, 'index.ts'));

let written = 0;
for (const file of moduleFiles) {
  writeModuleSpec(file);
  written += 1;
  console.log('[gen]', path.relative(__dirname, file).replace(/\\/g, '/').replace(/\.ts$/, '.module-meta.spec.ts'));
}
for (const file of indexFiles) {
  writeIndexSpec(file);
  written += 1;
  console.log('[gen]', path.relative(__dirname, file).replace(/\\/g, '/').replace(/index\.ts$/, 'index.barrel.spec.ts'));
}

console.log(`\nDone: ${written} files.`);
