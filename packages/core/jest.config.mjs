/* eslint-disable no-restricted-exports */

import { pathsToModuleNameMapper } from 'ts-jest';
import tsconfig from './tsconfig.json' assert { type: 'json' };

export default {
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
  ],
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  testEnvironment: 'jsdom',
  modulePaths: [ '<rootDir>' ],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths),
};
