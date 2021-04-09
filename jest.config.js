module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/*.spec.[jt]s?(x)'],
  rootDir: __dirname,
  moduleNameMapper: {
    'ssr-glue': '<rootDir>/packages/ssr-glue/src',
  },
  globals: {
    'ts-jest': {
      tsconfig: './packages/server-libs/tsconfig.json',
    },
  },
}
