/** Jest — module *.service.spec.ts trên deploy/nest (mirror apps/main/api, tham chiếu). */
const path = require('node:path')

const nestRoot = path.join(__dirname, 'nest')

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: nestRoot,
  roots: [`${nestRoot}/src`],
  testMatch: ['<rootDir>/src/*/**/*.service.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  verbose: true,
}
