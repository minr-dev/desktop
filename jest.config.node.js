module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/main/**/*.test.ts', '<rootDir>/src/shared/**/*.test.ts'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  moduleDirectories: ['src/main', 'src/shared', 'node_modules'],
  moduleNameMapper: {
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  setupFiles: ['<rootDir>/src/main/inversify.config.ts'],
};
