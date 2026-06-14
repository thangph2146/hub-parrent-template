/** Jest — contract tests (common + data-test) trên deploy/nest. */
const path = require('node:path')

const nestRoot = path.join(__dirname, 'nest')

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: nestRoot,
  roots: [`${nestRoot}/src`],
  testMatch: [
    '<rootDir>/src/common/**/*.spec.ts',
    '<rootDir>/src/data-test/**/*.spec.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  verbose: true,
}
