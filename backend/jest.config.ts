import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(service|controller|guard).ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^../config/auth$': '<rootDir>/test/__mocks__/auth.ts',
    '^../../config/auth$': '<rootDir>/test/__mocks__/auth.ts',
    '^better-auth$': '<rootDir>/test/__mocks__/better-auth.ts',
    '^better-auth/node$': '<rootDir>/test/__mocks__/better-auth-node.ts',
    '^better-auth/adapters/drizzle$': '<rootDir>/test/__mocks__/better-auth-drizzle.ts',
  },
};

export default config;
