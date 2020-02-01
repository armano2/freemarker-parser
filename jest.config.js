module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  collectCoverage: false,
  testRegex: './test/.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['text-summary', 'lcovonly'],
};
