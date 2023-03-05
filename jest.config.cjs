module.exports = {
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
  ],
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  testEnvironment: 'node',
};
