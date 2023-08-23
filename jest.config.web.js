module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/renderer/**/*.test.ts', '<rootDir>/src/shared/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.web.json',
        diagnostics: false,
      },
    ],
  },
  moduleDirectories: ['src/renderer/src', 'src/shared', 'node_modules'],
  moduleNameMapper: {
    '^@renderer/(.*)$': '<rootDir>/src/renderer/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  setupFiles: ['<rootDir>/src/renderer/src/inversify.config.ts'],
};
